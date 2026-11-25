window.addEventListener("error", function(ev) {
  console.error("Game runtime error:", ev.message, ev.filename, ev.lineno);
});
// game.js - メインゲームループ・UI・ミッション・セーブデータ・通信処理

(function() {
  function _on(id, evt, fn, opts) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn, opts);
  }
  // Firebase Realtime Database 初期化
  var FIREBASE_DB_URL = "https://tcgnet-bf199-default-rtdb.firebaseio.com";
  try {
    if (typeof firebase !== "undefined" && firebase.apps && !firebase.apps.length) {
      firebase.initializeApp({ databaseURL: FIREBASE_DB_URL });
    }
  } catch (fbInitErr) {
    console.warn("Firebase init skipped:", fbInitErr);
  }

  // WebRTC (PeerJS) STUNサーバー設定（NAT越え・スマホ回線・別Wi-Fi間接続の安定化）
  var PEER_CONFIG = {
    debug: 1,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" }
      ]
    }
  };
  function createPeerInstance(customId) {
    if (typeof Peer === "undefined") return null;
    try {
      return customId ? new Peer(customId, PEER_CONFIG) : new Peer(PEER_CONFIG);
    } catch (e) {
      return customId ? new Peer(customId) : new Peer();
    }
  }

  var SAVE_KEY = "netmeme_tcg_save_v2";
  var DECK_SIZE = 40;
  var MAX_DECK_SLOTS = 5;
  var DEFAULT_PLAYER_NAME = "名無しのレスバ民";
  var selectedPackNo = 1;
  var currentDeckSlot = 0;
  var editingDeckCards = [];
  var currentMissionTab = "daily";
  var userData = loadUserData();

  var PLAYMAT_THEMES = [
    { id: "default",  name: "🌐 標準サイバー", price: 0,      selfClass: "pm-default-self", oppClass: "pm-default-opp" },
    { id: "2ch",      name: "📜 2ch掲示板風",   price: 1000,   selfClass: "pm-2ch",          oppClass: "pm-2ch" },
    { id: "grass",    name: "🌱 大草原(www)",   price: 3000,   selfClass: "pm-grass",        oppClass: "pm-grass" },
    { id: "niconico", name: "📺 深夜ニコニコ",   price: 10000,  selfClass: "pm-niconico",     oppClass: "pm-niconico" },
    { id: "enjo",     name: "🔥 X炎上レッド",   price: 25000,  selfClass: "pm-enjo",         oppClass: "pm-enjo" },
    { id: "chaos",    name: "🌀 深淵カオス",     price: 50000,  selfClass: "pm-chaos",        oppClass: "pm-chaos" },
    { id: "god",      name: "👑 黄金GOD神殿",    price: 100000, selfClass: "pm-god",          oppClass: "pm-god" }
  ];

  function getPlaymatTheme(id) {
    return PLAYMAT_THEMES.find(function(t) { return t.id === id; }) || PLAYMAT_THEMES[0];
  }

  function isPlaymatUnlocked(id) {
    if (id === "default") return true;
    var list = Array.isArray(userData.unlockedPlaymats) ? userData.unlockedPlaymats : ["default"];
    return list.indexOf(id) !== -1;
  }

  function setMyPlaymat(id) {
    var theme = getPlaymatTheme(id);
    if (!Array.isArray(userData.unlockedPlaymats)) {
      userData.unlockedPlaymats = ["default"];
    }
    if (!isPlaymatUnlocked(theme.id)) {
      var priceStr = theme.price.toLocaleString();
      if (userData.points < theme.price) {
        alert("💎 ダイヤが足りません！\n「" + theme.name + "」の解放には 💎 " + priceStr + " 個必要です。（現在: 💎 " + userData.points.toLocaleString() + " 個）");
        return;
      }
      if (!confirm("💎 " + priceStr + " 個を使ってバトル場背景「" + theme.name + "」を解放しますか？")) {
        return;
      }
      userData.points -= theme.price;
      userData.unlockedPlaymats.push(theme.id);
      alert("🎉 「" + theme.name + "」を解放してセットしました！");
    }
    userData.playmat = theme.id;
    saveUserData();
    renderPlaymatSelectors();
    if (typeof syncMyProfileToFirebase === "function") {
      syncMyProfileToFirebase(true);
    }
  }

  
  // ================= プレイヤー称号ショップ（v2.6） =================
  var PLAYER_TITLES = [
    { id: "rom",      name: "【ROM専】",               price: 500,     style: "title-style-gray",    desc: "静かに戦況を見守るネット住民の証" },
    { id: "kusa",     name: "【草生える】",           price: 1000,    style: "title-style-green",   desc: "どんな盤面でも笑い飛ばす余裕の証" },
    { id: "rta",      name: "【RTA走者】",            price: 3000,    style: "title-style-cyan",    desc: "最速ターン決着を狙うスピード狂の証" },
    { id: "ronpa",    name: "【論破王】",             price: 5000,    style: "title-style-blue",    desc: "数々のレスバを制してきた理論派の証" },
    { id: "elder",    name: "【インターネット老人会】", price: 15000,   style: "title-style-sepia",   desc: "古のAA時代から生き残る歴戦の古参" },
    { id: "enjo",     name: "【炎上常連】",           price: 30000,   style: "title-style-red",     desc: "高火力・ハイリスクを愛する危険人物" },
    { id: "haijin",   name: "【廃人】",               price: 50000,   style: "title-style-rainbow", desc: "寝食を忘れてレスバに身を捧げた猛者" },
    { id: "creator",  name: "【ネットの創造神】",     price: 1000000, style: "title-style-god",     desc: "100万BPを極めし真の創造神の称号" },
    { id: "admin",    name: "【ADMIN】",              price: 0,       style: "title-style-admin",   desc: "運営・開発者権限を持つ者だけのシークレット称号", secret: true }
  ];

  function getTitleObj(id) {
    return PLAYER_TITLES.find(function(t) { return t.id === id; }) || null;
  }

  function renderTitleBadgeHtml(titleId) {
    var t = getTitleObj(titleId);
    if (!t) return "";
    return '<span class="player-title-pill ' + t.style + '">' + t.name + '</span>';
  }

  var currentShopTab = "titles";

  function openBpShopModal(initialTab) {
    if (initialTab) currentShopTab = initialTab;
    document.querySelectorAll(".shop-tab-btn").forEach(function(b) {
      b.classList.toggle("active", b.getAttribute("data-shoptab") === currentShopTab);
    });
    renderBpShopContent();
    var m = document.getElementById("bp-shop-modal");
    if (m) {
      m.style.display = "flex";
      m.style.pointerEvents = "auto";
    }
  }

  function renderBpShopContent() {
    var ptsEl = document.getElementById("shop-user-points");
    if (ptsEl) ptsEl.innerText = (userData.points || 0).toLocaleString();

    var container = document.getElementById("bp-shop-content");
    if (!container) return;
    container.innerHTML = "";

    if (currentShopTab === "titles") {
      var grid = document.createElement("div");
      grid.className = "shop-grid";

      var noneCard = document.createElement("div");
      noneCard.className = "shop-item-card" + (!userData.equippedTitle ? " equipped" : "");
      noneCard.innerHTML =
        '<div><div style="font-size:0.84rem; font-weight:bold; color:#cbd5e1;">称号なし（デフォルト）</div>' +
        '<div style="font-size:0.72rem; color:#94a3b8; margin-top:4px;">称号を外して名前のみ表示します</div></div>' +
        '<button type="button" class="sub-btn" style="width:100%; padding:6px;">' + (!userData.equippedTitle ? "✅ 装備中" : "外す") + '</button>';
      noneCard.querySelector("button").addEventListener("click", function() {
        userData.equippedTitle = "";
        saveUserData();
        renderBpShopContent();
      });
      grid.appendChild(noneCard);

      PLAYER_TITLES.forEach(function(t) {
        var unlocked = (userData.unlockedTitles || []).indexOf(t.id) !== -1;
        // シークレット称号（ADMIN）は未解放時は完全に隠す
        if (t.secret && !unlocked) return;

        var isEq = (userData.equippedTitle === t.id);
        var card = document.createElement("div");
        card.className = "shop-item-card" + (isEq ? " equipped" : (unlocked ? " owned" : ""));
        var btnLabel = isEq ? "✅ 装備中" : (unlocked ? "装備する" : ("💎 " + t.price.toLocaleString() + " BPで購入"));
        card.innerHTML =
          '<div>' +
            '<div style="margin-bottom:5px;"><span class="player-title-pill ' + t.style + '" style="font-size:0.78rem;">' + t.name + '</span></div>' +
            '<div style="font-size:0.73rem; color:#cbd5e1; line-height:1.35;">' + t.desc + '</div>' +
          '</div>' +
          '<button type="button" class="' + (unlocked ? "sub-btn" : "primary-btn") + '" style="width:100%; padding:6px; font-size:0.78rem;">' + btnLabel + '</button>';

        card.querySelector("button").addEventListener("click", function() {
          if (unlocked) {
            userData.equippedTitle = t.id;
            saveUserData();
            renderBpShopContent();
            return;
          }
          if (userData.points < t.price) {
            alert("バズポイントが足りません！（必要: " + t.price.toLocaleString() + " BP / 現在: " + userData.points.toLocaleString() + " BP）");
            return;
          }
          if (!confirm(t.price.toLocaleString() + " BP を使って称号「" + t.name + "」を購入しますか？")) return;
          userData.points -= t.price;
          userData.unlockedTitles.push(t.id);
          userData.equippedTitle = t.id;
          saveUserData();
          renderBpShopContent();
          alert("🎉 称号「" + t.name + "」を獲得して装備しました！");
        });
        grid.appendChild(card);
      });
      container.appendChild(grid);
    } else if (currentShopTab === "holo") {
      if (!window.__holoShopState) {
        window.__holoShopState = { query: "", rarity: "ALL", selectedId: null };
      }
      var hState = window.__holoShopState;

      // 通常カード（シークレット除外）＋合体進化カードをすべて候補にまとめる
      var candidateCards = ALL_CARDS.filter(function(c) {
        return !c.isAdminOnly || (userData.collection[c.id] || 0) > 0;
      }).slice();
      if (typeof FUSION_RECIPES !== "undefined") {
        FUSION_RECIPES.forEach(function(rec) {
          if (rec && rec.result && !candidateCards.some(function(x) { return x.id === rec.result.id; })) {
            candidateCards.push(Object.assign({}, rec.result, { isFusedCard: true }));
          }
        });
      }

      if (!hState.selectedId || !candidateCards.some(function(c) { return c.id === hState.selectedId; })) {
        hState.selectedId = candidateCards[0] ? candidateCards[0].id : null;
      }

      var selectedCard = candidateCards.find(function(c) { return c.id === hState.selectedId; }) || candidateCards[0];
      var isSelectedHolo = selectedCard && Array.isArray(userData.holoCards) && userData.holoCards.indexOf(selectedCard.id) !== -1;

      // 上部：選択中カードのホロ加工プレビュー＆実行パネル
      var previewBox = document.createElement("div");
      previewBox.style.cssText = "background:rgba(15,23,42,0.95); border:1px solid #ffd32a; border-radius:12px; padding:12px; margin-bottom:12px; display:flex; gap:14px; align-items:center; flex-wrap:wrap;";

      var previewCardWrap = document.createElement("div");
      previewCardWrap.style.cssText = "flex-shrink:0;";
      if (selectedCard) {
        var previewCardEl = createCardElement(selectedCard, null, {});
        previewCardEl.classList.add("holo-foil");
        previewCardEl.style.width = "108px";
        previewCardEl.style.minWidth = "108px";
        previewCardEl.style.height = "148px";
        previewCardWrap.appendChild(previewCardEl);
      }
      previewBox.appendChild(previewCardWrap);

      var previewInfo = document.createElement("div");
      previewInfo.style.cssText = "flex:1; min-width:190px; display:flex; flex-direction:column; gap:6px;";
      if (selectedCard) {
        var ownedCnt = userData.collection[selectedCard.id] || 0;
        var statusLine = selectedCard.isFusedCard
          ? '<span style="color:#00ff88; font-weight:bold;">🧬 合体進化カード</span>'
          : (ownedCnt > 0 ? '<span style="color:#38bdf8; font-weight:bold;">所持枚数: ' + ownedCnt + '枚</span>' : '<span style="color:#94a3b8;">未所持（入手後から輝きが反映されます）</span>');
        previewInfo.innerHTML =
          '<div style="font-size:0.74rem; color:#ffd32a; font-weight:bold;">✨ ホロ加工プレビュー（選択中）</div>' +
          '<div style="font-size:1rem; font-weight:900; color:#fff;">' + selectedCard.icon + ' ' + selectedCard.name + '</div>' +
          '<div style="font-size:0.76rem; color:#cbd5e1;">レアリティ: <strong>' + selectedCard.rarity + '</strong> ／ ' + statusLine + '</div>' +
          '<div style="font-size:0.74rem; color:#94a3b8; line-height:1.4;">' + (selectedCard.desc || "") + '</div>';

        var execBtn = document.createElement("button");
        execBtn.type = "button";
        execBtn.className = isSelectedHolo ? "sub-btn" : "primary-btn";
        execBtn.style.cssText = "margin-top:4px; padding:8px 12px; font-size:0.84rem; font-weight:bold;";
        execBtn.disabled = isSelectedHolo;
        execBtn.innerText = isSelectedHolo ? "✅ このカードはホロ加工済みです" : "🌟 2,000 BPでこのカードをホロ加工する";
        if (!isSelectedHolo) {
          execBtn.addEventListener("click", function() {
            if (userData.points < 2000) {
              alert("バズポイントが足りません！（必要: 2,000 BP / 現在: " + userData.points.toLocaleString() + " BP）");
              return;
            }
            if (!confirm("2,000 BP を使って「" + selectedCard.name + "」に虹色ホログラム加工を施しますか？")) return;
            userData.points -= 2000;
            if (!Array.isArray(userData.holoCards)) userData.holoCards = [];
            userData.holoCards.push(selectedCard.id);
            saveUserData();
            renderBpShopContent();
            alert("✨ 「" + selectedCard.name + "」がプレミアムホロ仕様になりました！");
          });
        }
        previewInfo.appendChild(execBtn);
      }
      previewBox.appendChild(previewInfo);
      container.appendChild(previewBox);

      // 中段：カード変更用の検索＆レアリティ絞り込みバー
      var filterBar = document.createElement("div");
      filterBar.style.cssText = "display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; align-items:center;";
      filterBar.innerHTML =
        '<input type="text" id="holo-search-input" placeholder="🔍 カード名で検索して変更..." style="flex:1; min-width:150px; padding:6px 10px; border-radius:8px; border:1px solid #475569; background:#0f172a; color:#fff; font-size:0.8rem;">' +
        '<select id="holo-rarity-select" style="padding:6px 8px; border-radius:8px; border:1px solid #475569; background:#0f172a; color:#ffd32a; font-size:0.8rem; font-weight:bold;">' +
          '<option value="ALL">全レアリティ</option>' +
          '<option value="GOD">GOD</option>' +
          '<option value="UR">UR</option>' +
          '<option value="SR">SR</option>' +
          '<option value="R">R</option>' +
          '<option value="N">N</option>' +
          '<option value="FUSED">🧬 合体進化</option>' +
        '</select>';
      container.appendChild(filterBar);

      var searchInput = filterBar.querySelector("#holo-search-input");
      var raritySelect = filterBar.querySelector("#holo-rarity-select");
      searchInput.value = hState.query;
      raritySelect.value = hState.rarity;

      searchInput.addEventListener("input", function() {
        hState.query = searchInput.value;
        renderBpShopContent();
        var nextInput = document.getElementById("holo-search-input");
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });
      raritySelect.addEventListener("change", function() {
        hState.rarity = raritySelect.value;
        renderBpShopContent();
      });

      // 下段：選択できる全カード一覧グリッド
      var qLower = (hState.query || "").trim().toLowerCase();
      var filteredList = candidateCards.filter(function(c) {
        if (hState.rarity === "FUSED") {
          if (!c.isFusedCard) return false;
        } else if (hState.rarity !== "ALL") {
          if (c.rarity !== hState.rarity) return false;
        }
        if (qLower) {
          var hay = ((c.name || "") + " " + (c.era || "") + " " + (c.desc || "")).toLowerCase();
          if (hay.indexOf(qLower) === -1) return false;
        }
        return true;
      });

      var hGrid = document.createElement("div");
      hGrid.className = "shop-grid";
      filteredList.forEach(function(c) {
        var isHolo = Array.isArray(userData.holoCards) && userData.holoCards.indexOf(c.id) !== -1;
        var isSel = selectedCard && selectedCard.id === c.id;
        var item = document.createElement("div");
        item.className = "shop-item-card" + (isSel ? " equipped" : (isHolo ? " owned" : ""));
        item.style.cursor = "pointer";
        item.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
            '<span style="font-size:0.8rem; font-weight:bold; color:#fff;">' + c.icon + ' ' + c.name + '</span>' +
            '<span style="font-size:0.66rem; font-weight:bold; color:#ffd32a; background:rgba(255,211,42,0.14); padding:1px 6px; border-radius:4px;">' + (c.isFusedCard ? "合体/" + c.rarity : c.rarity) + '</span>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:#94a3b8;">' +
            '<span>' + (isHolo ? "✨ ホロ加工済" : "タップして選択") + '</span>' +
            '<span style="color:' + (isSel ? "#ffd32a" : "#38bdf8") + '; font-weight:bold;">' + (isSel ? "▶ 選択中" : "選択") + '</span>' +
          '</div>';
        item.addEventListener("click", function() {
          hState.selectedId = c.id;
          renderBpShopContent();
        });
        hGrid.appendChild(item);
      });

      if (filteredList.length === 0) {
        container.innerHTML += '<p style="color:#94a3b8; font-size:0.8rem; text-align:center; padding:12px;">条件に一致するカードがありません。</p>';
      } else {
        container.appendChild(hGrid);
      }
    } else if (currentShopTab === "playmats") {
      var pGrid = document.createElement("div");
      pGrid.className = "shop-grid";
      PLAYMAT_THEMES.forEach(function(t) {
        var unlocked = isPlaymatUnlocked(t.id);
        var isEq = (userData.playmat || "default") === t.id;
        var card = document.createElement("div");
        card.className = "shop-item-card" + (isEq ? " equipped" : (unlocked ? " owned" : ""));
        var btnLabel = isEq ? "✅ 装備中" : (unlocked ? "装備する" : ("💎 " + t.price.toLocaleString() + " BPで購入"));
        card.innerHTML =
          '<div><div style="font-size:0.86rem; font-weight:bold; color:#fff;">' + t.name + '</div>' +
          '<div style="font-size:0.72rem; color:#94a3b8; margin-top:3px;">デュアルプレイマット専用背景テーマ</div></div>' +
          '<button type="button" class="' + (unlocked ? "sub-btn" : "primary-btn") + '" style="width:100%; padding:6px; font-size:0.78rem;">' + btnLabel + '</button>';
        card.querySelector("button").addEventListener("click", function() {
          setMyPlaymat(t.id);
          renderBpShopContent();
        });
        pGrid.appendChild(card);
      });
      container.appendChild(pGrid);
    }
  }

  _on("nav-bp-shop", "click", function() {
    openBpShopModal("titles");
  });

  document.querySelectorAll(".shop-tab-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      currentShopTab = btn.getAttribute("data-shoptab") || "titles";
      document.querySelectorAll(".shop-tab-btn").forEach(function(b) {
        b.classList.toggle("active", b === btn);
      });
      renderBpShopContent();
    });
  });

  function renderPlaymatSelectors() {
    var currentId = isPlaymatUnlocked(userData.playmat) ? (userData.playmat || "default") : "default";
    var currentTheme = getPlaymatTheme(currentId);
    var lbl = document.getElementById("setup-playmat-current");
    if (lbl) lbl.innerText = currentTheme.name;

    ["setup-playmat-grid", "profile-playmat-grid"].forEach(function(gridId) {
      var grid = document.getElementById(gridId);
      if (!grid) return;
      grid.innerHTML = "";
      PLAYMAT_THEMES.forEach(function(t) {
        var unlocked = isPlaymatUnlocked(t.id);
        var isActive = (t.id === currentId);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "playmat-opt-btn" + (isActive ? " active" : "") + (!unlocked ? " locked" : "");
        var subHtml = "";
        if (isActive) {
          subHtml = '<span class="playmat-price-tag owned">✅ 装備中</span>';
        } else if (unlocked) {
          subHtml = '<span class="playmat-price-tag owned">所持済</span>';
        } else {
          subHtml = '<span class="playmat-price-tag">🔒 💎 ' + t.price.toLocaleString() + '</span>';
        }
        btn.innerHTML = '<div>' + t.name + '</div>' + subHtml;
        btn.addEventListener("click", function() {
          setMyPlaymat(t.id);
        });
        grid.appendChild(btn);
      });
    });
  }


  var pendingPackData = null;
  var isTearing = false;

  // 管理者モード用変数
  var adminTapCount = 0;
  var adminTapTimer = null;
  var rigNextRarity = null;

  function getTodayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function createDefaultDecks(firstDeckIds) {
    return [
      { name: "マイデッキ 1", ids: firstDeckIds || [] },
      { name: "マイデッキ 2", ids: [] },
      { name: "マイデッキ 3", ids: [] },
      { name: "マイデッキ 4", ids: [] },
      { name: "マイデッキ 5", ids: [] }
    ];
  }

  function createDefaultMissions() {
    return {
      dailyDate: getTodayStr(),
      dailyStats: { login: 1, battles: 0, wins: 0, summons: 0, spells: 0 },
      dailyClaimed: {},
      totalStats: { wins: 0, packs: 0, summons: 0, spells: 0, deckSaves: 0 },
      totalStepClaimed: {}
    };
  }

  function loadUserData() {
    var defaultDeck = ["mona","mona","mona","giko","giko","giko","yaruo","yaruo","yaruo","numai","numai","numai","kusa","kusa","kusa","neko","neko","neko","chiikawa","chiikawa","chiikawa","ronpa","ronpa","ojisan","ojisan","kmr","kmr","kmr","mur","mur","mur","tono","tono","kirinuki","kirinuki","kirinuki","zombie","zombie","zombie","kagiaka"];
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (!parsed.playerName) {
          parsed.playerName = DEFAULT_PLAYER_NAME;
        }
        if (!parsed.playerId || String(parsed.playerId).trim().length !== 6) {
          parsed.playerId = (Math.random().toString(36).substring(2) + "ABCDEF").substring(0, 6).toUpperCase();
          try { localStorage.setItem(SAVE_KEY, JSON.stringify(parsed)); } catch (se) {}
        }
        if (!parsed.avatar) {
          parsed.avatar = "👤";
        }
        if (!parsed.playmat) {
          parsed.playmat = "default";
        }
        if (!Array.isArray(parsed.unlockedPlaymats)) {
          parsed.unlockedPlaymats = ["default"];
          if (parsed.playmat !== "default") {
            parsed.unlockedPlaymats.push(parsed.playmat);
          }
        }
        if (!Array.isArray(parsed.decks)) {
          parsed.decks = createDefaultDecks(Array.isArray(parsed.myDeck) ? parsed.myDeck : defaultDeck);
        }
        while (parsed.decks.length < MAX_DECK_SLOTS) {
          parsed.decks.push({ name: "マイデッキ " + (parsed.decks.length + 1), ids: [] });
        }
        if (!parsed.missions) {
          parsed.missions = createDefaultMissions();
        }
        if (typeof parsed.equippedTitle !== "string") parsed.equippedTitle = "";
        if (!Array.isArray(parsed.unlockedTitles)) parsed.unlockedTitles = [];
        if (!Array.isArray(parsed.holoCards)) parsed.holoCards = [];
        return parsed;
      } catch (e) {}
    }
    return {
      playerName: DEFAULT_PLAYER_NAME,
      playerId: (Math.random().toString(36).substring(2) + "ABCDEF").substring(0, 6).toUpperCase(),
      avatar: "👤",
      playmat: "default",
      unlockedPlaymats: ["default"],
      equippedTitle: "",
      unlockedTitles: [],
      holoCards: [],
      points: 1500,
      collection: { mona: 3, giko: 3, yaruo: 3, numai: 3, kusa: 3, neko: 3, chiikawa: 3, ronpa: 2, ojisan: 2, kmr: 3, mur: 3, tono: 2, kirinuki: 3, zombie: 3, kagiaka: 2 },
      decks: createDefaultDecks(defaultDeck),
      missions: createDefaultMissions()
    };
  }

  function checkDailyReset() {
    var today = getTodayStr();
    if (!userData.missions) userData.missions = createDefaultMissions();
    if (userData.missions.dailyDate !== today) {
      userData.missions.dailyDate = today;
      userData.missions.dailyStats = { login: 1, battles: 0, wins: 0, summons: 0, spells: 0 };
      userData.missions.dailyClaimed = {};
      saveUserData();
    } else if (!userData.missions.dailyStats.login) {
      userData.missions.dailyStats.login = 1;
      saveUserData();
    }
  }

  function addMissionStat(key, amount) {
    checkDailyReset();
    if (userData.missions.dailyStats[key] !== undefined) {
      userData.missions.dailyStats[key] += amount;
    }
    if (userData.missions.totalStats[key] !== undefined) {
      userData.missions.totalStats[key] += amount;
    }
    saveUserData();
  }

  function getTotalStatValue(statKey) {
    if (statKey === "uniqueCards") {
      return Object.keys(userData.collection).filter(function(id) { return userData.collection[id] > 0; }).length;
    }
    return userData.missions.totalStats[statKey] || 0;
  }

  function getClaimableCounts() {
    checkDailyReset();
    var dailyCount = 0;
    DAILY_MISSIONS.forEach(function(m) {
      var cur = userData.missions.dailyStats[m.statKey] || 0;
      var claimed = !!userData.missions.dailyClaimed[m.id];
      if (!claimed && cur >= m.target) dailyCount++;
    });

    var totalCount = 0;
    TOTAL_MISSIONS.forEach(function(m) {
      var stepIdx = userData.missions.totalStepClaimed[m.id] || 0;
      if (stepIdx < m.steps.length) {
        var step = m.steps[stepIdx];
        var cur = getTotalStatValue(m.statKey);
        if (cur >= step.target) totalCount++;
      }
    });

    return { daily: dailyCount, total: totalCount, all: dailyCount + totalCount };
  }

  function updateMissionBadges() {
    var counts = getClaimableCounts();
    var homeBadge = document.getElementById("home-mission-badge");
    var dailyBadge = document.getElementById("tab-badge-daily");
    var totalBadge = document.getElementById("tab-badge-total");

    if (counts.all > 0) { homeBadge.style.display = "inline-block"; homeBadge.innerText = counts.all; }
    else { homeBadge.style.display = "none"; }

    if (counts.daily > 0) { dailyBadge.style.display = "inline-block"; dailyBadge.innerText = counts.daily; }
    else { dailyBadge.style.display = "none"; }

    if (counts.total > 0) { totalBadge.style.display = "inline-block"; totalBadge.innerText = counts.total; }
    else { totalBadge.style.display = "none"; }
  }

  function saveUserData() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(userData));
    updateHeaderUI();
    updateMissionBadges();
  }

  function updateHeaderUI() {
    document.getElementById("user-points").innerText = userData.points;
    document.getElementById("display-player-name").innerText = userData.playerName || DEFAULT_PLAYER_NAME;
    var idEl = document.getElementById("display-player-id");
    if (idEl && userData.playerId) idEl.innerText = userData.playerId;
    var avEl = document.getElementById("display-player-avatar");
    if (avEl) avEl.innerText = userData.avatar || "👤";
    var titleRow = document.getElementById("home-title-badge-row");
    var titleEl = document.getElementById("home-equipped-title");
    var tObj = getTitleObj(userData.equippedTitle);
    if (titleRow && titleEl) {
      if (tObj) {
        titleRow.style.display = "block";
        titleEl.className = "player-title-pill " + tObj.style;
        titleEl.innerText = tObj.name;
      } else {
        titleRow.style.display = "none";
      }
    }
  }

  // ================= アップデートお知らせ機能 =================
  var SEEN_VERSION_KEY = "netmeme_tcg_seen_version";

  function updateNewsBadge() {
    var badge = document.getElementById("home-news-badge");
    if (!badge || typeof APP_VERSION === "undefined") return;
    var seenVer = localStorage.getItem(SEEN_VERSION_KEY);
    badge.style.display = (seenVer !== APP_VERSION) ? "inline-block" : "none";
  }

  function openNewsModal() {
    var container = document.getElementById("news-list-scroll");
    container.innerHTML = "";
    if (typeof UPDATE_LOGS !== "undefined") {
      UPDATE_LOGS.forEach(function(entry) {
        var card = document.createElement("div");
        card.className = "news-entry" + (entry.isLatest ? " latest" : "");
        var itemsHtml = entry.items.map(function(it) {
          return '<li><span class="news-tag" style="background:' + (it.color || "#00d2ff") + ';">' + it.tag + '</span><span>' + it.text + '</span></li>';
        }).join("");
        card.innerHTML =
          '<div class="news-entry-header">' +
            '<span class="news-ver-badge">' + entry.version + (entry.isLatest ? ' ✨NEW' : '') + '</span>' +
            '<span style="font-size:0.75rem; color:#aaa;">' + entry.date + '</span>' +
          '</div>' +
          '<div class="news-entry-title">' + entry.title + '</div>' +
          '<ul class="news-item-list">' + itemsHtml + '</ul>';
        container.appendChild(card);
      });
    }
    var _m_news_modal = document.getElementById("news-modal"); if(_m_news_modal) { _m_news_modal.style.display = "flex"; _m_news_modal.style.pointerEvents = "auto"; }
  }

  function closeNewsModal() {
    if (typeof APP_VERSION !== "undefined") {
      localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);
    }
    updateNewsBadge();
    var _m_news_modal = document.getElementById("news-modal"); if(_m_news_modal) { _m_news_modal.style.display = "none"; _m_news_modal.style.pointerEvents = "none"; }
  }

  _on("nav-news", "click", openNewsModal);
  _on("btn-close-news", "click", closeNewsModal);
  _on("btn-confirm-news", "click", closeNewsModal);
  _on("news-modal", "click", function(e) {
    if (e.target === this) closeNewsModal();
  });

  // 未読の新バージョンがある場合は起動時にお知らせモーダルを自動表示
  updateNewsBadge();
  if (typeof APP_VERSION !== "undefined" && localStorage.getItem(SEEN_VERSION_KEY) !== APP_VERSION) {
    setTimeout(function() {
      openNewsModal();
    }, 350);
  }

  // ================= カード詳細拡大モーダル ================= 
  function showCardDetail(card) {
    if (!card) return;
    var modal = document.getElementById("card-detail-modal");
    var box = document.getElementById("card-detail-box");

    box.className = "card-detail-modal-box rarity-" + (card.rarity || "N");
    document.getElementById("detail-cost").innerText = "コスト " + card.cost;
    document.getElementById("detail-rarity").innerText = card.rarity || "N";
    document.getElementById("detail-era").innerText = card.era || "現代";
    document.getElementById("detail-title").innerText = card.name;

    var artEl = document.getElementById("detail-art");
    artEl.innerHTML = card.img ? '<img src="' + card.img + '" alt="' + card.name + '">' : (card.icon || "🌐");

    var statsEl = document.getElementById("detail-stats");
    if (card.type === "meme") {
      var displayAtk = card.atk + (card.isBuzz ? 1 : 0);
      var buzzNote = card.isBuzz ? ' <span style="color:#ff4757; font-size:0.8rem;">(🔥バズ+1)</span>' : "";
      var shieldNote = card.shield ? ' <span style="color:#00d2ff; font-size:0.8rem;">[🛡️無敵]</span>' : "";
      statsEl.innerHTML =
        '<span>⚔️ 攻撃力: ' + displayAtk + buzzNote + '</span>' +
        '<span>⏳ 鮮度: ' + card.freshness + '</span>' +
        '<span>❤️ 体力: ' + card.hp + shieldNote + '</span>';
    } else {
      statsEl.innerHTML = '<span style="color:#ffd32a;">⚡ 【構文 / スペルカード】</span>';
    }

    document.getElementById("detail-desc").innerText = card.desc || "効果なし";
    document.getElementById("detail-pack").innerText = card.isAdminOnly ? "収録: 👑 管理者専用（非売品）" : ("収録: 第" + (card.pack || 1) + "弾パック");
    document.getElementById("detail-owned").innerText = "所持数: " + (userData.collection[card.id] || 0) + "枚";

    modal.style.display = "flex";
    modal.style.pointerEvents = "auto";
  }

  _on("btn-close-card-detail", "click", function() {
    var _m_card_detail_modal = document.getElementById("card-detail-modal"); if(_m_card_detail_modal) { _m_card_detail_modal.style.display = "none"; _m_card_detail_modal.style.pointerEvents = "none"; }
  });
  _on("card-detail-modal", "click", function(e) {
    if (e.target === this) {
      this.style.display = "none"; this.style.pointerEvents = "none";
    }
  });

  // ================= プレイヤー名変更モーダル =================
  _on("btn-edit-player-name", "click", function() {
    document.getElementById("player-name-input").value = userData.playerName || DEFAULT_PLAYER_NAME;
    selectedAvatarTemp = userData.avatar || "👤";
    document.querySelectorAll(".avatar-opt-btn").forEach(function(b) {
      b.style.borderColor = (b.getAttribute("data-avatar") === selectedAvatarTemp) ? "#00d2ff" : "#444";
    });
    var _m_name_edit_modal = document.getElementById("name-edit-modal"); if(_m_name_edit_modal) { _m_name_edit_modal.style.display = "flex"; _m_name_edit_modal.style.pointerEvents = "auto"; }
  });

  _on("btn-cancel-name", "click", function() {
    var _m_name_edit_modal = document.getElementById("name-edit-modal"); if(_m_name_edit_modal) { _m_name_edit_modal.style.display = "none"; _m_name_edit_modal.style.pointerEvents = "none"; }
  });

  _on("btn-save-name", "click", function() {
    var newName = document.getElementById("player-name-input").value.trim();
    userData.playerName = newName || DEFAULT_PLAYER_NAME;
    saveUserData();
    var _m_name_edit_modal = document.getElementById("name-edit-modal"); if(_m_name_edit_modal) { _m_name_edit_modal.style.display = "none"; _m_name_edit_modal.style.pointerEvents = "none"; }
  });

  checkDailyReset();
  updateHeaderUI();
  updateMissionBadges();

  // ================= ミッション画面の描画・受け取り処理 =================
  _on("nav-mission", "click", function() {
    checkDailyReset();
    renderMissionScreen();
    showScreen("mission-screen");
  });
  _on("back-from-mission", "click", function() {
    showScreen("home-screen");
  });
  _on("tab-mission-daily", "click", function() {
    currentMissionTab = "daily";
    document.getElementById("tab-mission-daily").classList.add("active");
    document.getElementById("tab-mission-total").classList.remove("active");
    renderMissionScreen();
  });
  _on("tab-mission-total", "click", function() {
    currentMissionTab = "total";
    document.getElementById("tab-mission-total").classList.add("active");
    document.getElementById("tab-mission-daily").classList.remove("active");
    renderMissionScreen();
  });

  function grantRandomURReward() {
    var urCards = ALL_CARDS.filter(function(c) { return c.rarity === "UR"; });
    var chosen = urCards[Math.floor(Math.random() * urCards.length)];
    userData.collection[chosen.id] = (userData.collection[chosen.id] || 0) + 1;
    saveUserData();

    var slot = document.getElementById("ur-reward-card-slot");
    slot.innerHTML = "";
    var el = createCardElement(chosen, null, {});
    el.classList.add("card-revealed");
    slot.appendChild(el);
    var _m_ur_reward_modal = document.getElementById("ur-reward-modal"); if(_m_ur_reward_modal) { _m_ur_reward_modal.style.display = "flex"; _m_ur_reward_modal.style.pointerEvents = "auto"; }
  }

  _on("btn-close-ur-reward", "click", function() {
    var _m_ur_reward_modal = document.getElementById("ur-reward-modal"); if(_m_ur_reward_modal) { _m_ur_reward_modal.style.display = "none"; _m_ur_reward_modal.style.pointerEvents = "none"; }
  });

  function renderMissionScreen() {
    updateMissionBadges();
    var container = document.getElementById("mission-list-container");
    container.innerHTML = "";

    if (currentMissionTab === "daily") {
      DAILY_MISSIONS.forEach(function(m) {
        var cur = Math.min(m.target, userData.missions.dailyStats[m.statKey] || 0);
        var isClaimed = !!userData.missions.dailyClaimed[m.id];
        var isReady = !isClaimed && cur >= m.target;
        var pct = Math.min(100, Math.floor((cur / m.target) * 100));

        var item = document.createElement("div");
        item.className = "mission-item" + (isReady ? " claimable" : "") + (isClaimed ? " completed" : "");
        item.innerHTML =
          '<div class="mission-info">' +
            '<div class="mission-title">' + m.title + '</div>' +
            '<div class="mission-desc">' + m.desc + '</div>' +
            '<div class="mission-progress-wrap"><div class="mission-progress-bar" style="width:' + pct + '%;"></div></div>' +
            '<div class="mission-progress-text">進行度: ' + cur + ' / ' + m.target + '</div>' +
          '</div>' +
          '<div class="mission-reward-col">' +
            '<span class="reward-tag">💎 ' + m.rewardVal + ' P</span>' +
            '<button class="claim-btn' + (isReady ? ' ready' : '') + '" ' + (!isReady ? 'disabled' : '') + '>' +
              (isClaimed ? '受取済' : (isReady ? '🎁 受け取る' : '未達成')) +
            '</button>' +
          '</div>';

        if (isReady) {
          item.querySelector(".claim-btn").addEventListener("click", function() {
            userData.missions.dailyClaimed[m.id] = true;
            userData.points += m.rewardVal;
            saveUserData();
            renderMissionScreen();
          });
        }
        container.appendChild(item);
      });
    } else {
      TOTAL_MISSIONS.forEach(function(m) {
        var stepIdx = userData.missions.totalStepClaimed[m.id] || 0;
        var isAllDone = stepIdx >= m.steps.length;
        var activeStep = isAllDone ? m.steps[m.steps.length - 1] : m.steps[stepIdx];
        var rawVal = getTotalStatValue(m.statKey);
        var cur = Math.min(activeStep.target, rawVal);
        var isReady = !isAllDone && rawVal >= activeStep.target;
        var pct = Math.min(100, Math.floor((cur / activeStep.target) * 100));
        var descText = m.descTemplate.replace("{target}", activeStep.target);
        var stepLabel = "STEP " + Math.min(stepIdx + 1, m.steps.length) + "/" + m.steps.length;

        var isUR = activeStep.rewardType === "ur_card";
        var rewardHtml = isUR
          ? '<span class="reward-tag ur-reward">🚨 ランダムUR 1枚</span>'
          : '<span class="reward-tag">💎 ' + activeStep.rewardVal + ' P</span>';

        var item = document.createElement("div");
        item.className = "mission-item" + (isReady ? " claimable" : "") + (isAllDone ? " completed" : "");
        item.innerHTML =
          '<div class="mission-info">' +
            '<div class="mission-title">' + m.title + ' <span class="mission-step-tag">' + stepLabel + '</span></div>' +
            '<div class="mission-desc">' + descText + '</div>' +
            '<div class="mission-progress-wrap"><div class="mission-progress-bar" style="width:' + pct + '%;"></div></div>' +
            '<div class="mission-progress-text">進行度: ' + rawVal + ' / ' + activeStep.target + '</div>' +
          '</div>' +
          '<div class="mission-reward-col">' +
            rewardHtml +
            '<button class="claim-btn' + (isReady ? ' ready' : '') + '" ' + (!isReady ? 'disabled' : '') + '>' +
              (isAllDone ? 'コンプリート' : (isReady ? '🎁 受け取る' : '未達成')) +
            '</button>' +
          '</div>';

        if (isReady) {
          item.querySelector(".claim-btn").addEventListener("click", function() {
            userData.missions.totalStepClaimed[m.id] = stepIdx + 1;
            if (activeStep.rewardType === "ur_card") {
              grantRandomURReward();
            } else {
              userData.points += activeStep.rewardVal;
              saveUserData();
            }
            renderMissionScreen();
          });
        }
        container.appendChild(item);
      });
    }
  }

  // ================= 隠しコマンド：管理者パネル起動 =================
  _on("secret-admin-trigger", "click", function() {
    adminTapCount++;
    clearTimeout(adminTapTimer);
    adminTapTimer = setTimeout(function() { adminTapCount = 0; }, 1800);
    if (adminTapCount >= 7) {
      adminTapCount = 0;
      openAdminPanel();
    }
  });

  function openAdminPanel() {
    updateRigButtons();
    document.getElementById("admin-status-msg").innerText = "管理者権限でログインしました（全" + ALL_CARDS.length + "種実装済み）";
    var _m_admin_modal = document.getElementById("admin-modal"); if(_m_admin_modal) { _m_admin_modal.style.display = "flex"; _m_admin_modal.style.pointerEvents = "auto"; }
  }

  function setAdminStatus(msg) {
    document.getElementById("admin-status-msg").innerText = "✅ " + msg;
  }

  function updateRigButtons() {
    var btnGod = document.getElementById("admin-rig-god");
    var btnUr = document.getElementById("admin-rig-ur");
    btnGod.innerText = "🌈 GOD確定モード: " + (rigNextRarity === "GOD" ? "ON" : "OFF");
    btnUr.innerText = "🚨 UR確定モード: " + (rigNextRarity === "UR" ? "ON" : "OFF");
    if (rigNextRarity === "GOD") btnGod.classList.add("active-rig"); else btnGod.classList.remove("active-rig");
    if (rigNextRarity === "UR") btnUr.classList.add("active-rig"); else btnUr.classList.remove("active-rig");
  }

  _on("btn-close-admin", "click", function() {
    var _m_admin_modal = document.getElementById("admin-modal"); if(_m_admin_modal) { _m_admin_modal.style.display = "none"; _m_admin_modal.style.pointerEvents = "none"; }
  });

  _on("admin-add-points", "click", function() {
    userData.points += 10000;
    saveUserData();
    setAdminStatus("10,000 バズP を付与しました！");
  });

  _on("admin-zero-points", "click", function() {
    userData.points = 0;
    saveUserData();
    setAdminStatus("バズPを 0 に設定しました。");
  });

  _on("admin-unlock-all", "click", function() {
    var normalCards = ALL_CARDS.filter(function(c) { return !c.isAdminOnly; });
    normalCards.forEach(function(c) {
      userData.collection[c.id] = 3;
    });
    saveUserData();
    setAdminStatus("通常カード全" + normalCards.length + "種類を各3枚ずつ付与しました！");
  });

  var btnUnlockAdmin = document.getElementById("admin-unlock-admin-cards");
  if (btnUnlockAdmin) {
    btnUnlockAdmin.addEventListener("click", function() {
      var adminCards = ALL_CARDS.filter(function(c) { return c.isAdminOnly; });
      adminCards.forEach(function(c) {
        userData.collection[c.id] = 3;
      });
      saveUserData();
      setAdminStatus("👑 管理者専用カード（全" + adminCards.length + "種）を各3枚ずつ付与しました！");
    });
  }

  var btnUnlockAdminTitle = document.getElementById("admin-unlock-admin-title");
  if (btnUnlockAdminTitle) {
    btnUnlockAdminTitle.addEventListener("click", function() {
      if (!Array.isArray(userData.unlockedTitles)) userData.unlockedTitles = [];
      if (userData.unlockedTitles.indexOf("admin") === -1) {
        userData.unlockedTitles.push("admin");
      }
      userData.equippedTitle = "admin";
      saveUserData();
      setAdminStatus("🔰 隠し称号【ADMIN】を解放し、装備しました！");
    });
  }

  _on("admin-clear-col", "click", function() {
    userData.collection = {};
    userData.decks = createDefaultDecks([]);
    editingDeckCards = [];
    saveUserData();
    setAdminStatus("所持カードと全デッキを空にしました。");
  });

  _on("admin-boost-missions", "click", function() {
    userData.missions.totalStats.wins += 10;
    userData.missions.totalStats.packs += 15;
    userData.missions.totalStats.summons += 50;
    userData.missions.totalStats.spells += 30;
    userData.missions.dailyStats.battles += 1;
    userData.missions.dailyStats.wins += 1;
    userData.missions.dailyStats.summons += 5;
    userData.missions.dailyStats.spells += 3;
    saveUserData();
    setAdminStatus("ミッション達成カウントを大幅に加算しました！");
  });

  _on("admin-reset-daily", "click", function() {
    userData.missions.dailyStats = { login: 1, battles: 0, wins: 0, summons: 0, spells: 0 };
    userData.missions.dailyClaimed = {};
    saveUserData();
    setAdminStatus("デイリーミッションをリセットしました。");
  });

  _on("admin-rig-god", "click", function() {
    rigNextRarity = (rigNextRarity === "GOD") ? null : "GOD";
    updateRigButtons();
    setAdminStatus(rigNextRarity ? "次のパック開封でGODレア確定！" : "GOD確定モードを解除しました。");
  });

  _on("admin-rig-ur", "click", function() {
    rigNextRarity = (rigNextRarity === "UR") ? null : "UR";
    updateRigButtons();
    setAdminStatus(rigNextRarity ? "次のパック開封でURレア確定！" : "UR確定モードを解除しました。");
  });

  var adminPreviewRarity = "UR";
  var btnPrevUr = document.getElementById("admin-preview-ur");
  var btnPrevGod = document.getElementById("admin-preview-god");
  if (btnPrevUr && btnPrevGod) {
    btnPrevUr.addEventListener("click", function() {
      adminPreviewRarity = "UR";
      btnPrevUr.classList.add("active-rig");
      btnPrevGod.classList.remove("active-rig");
      setAdminStatus("演出テストのレアリティを UR に設定しました。");
    });
    btnPrevGod.addEventListener("click", function() {
      adminPreviewRarity = "GOD";
      btnPrevGod.classList.add("active-rig");
      btnPrevUr.classList.remove("active-rig");
      setAdminStatus("演出テストのレアリティを GOD に設定しました。");
    });
  }

  document.querySelectorAll(".admin-cutin-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var cutinType = btn.getAttribute("data-cutin");
      var samplePool = ALL_CARDS.filter(function(c) { return c.rarity === adminPreviewRarity; });
      var sampleCard = samplePool.length > 0 ? samplePool[Math.floor(Math.random() * samplePool.length)] : ALL_CARDS[0];
      var _m_admin_modal = document.getElementById("admin-modal"); if(_m_admin_modal) { _m_admin_modal.style.display = "none"; _m_admin_modal.style.pointerEvents = "none"; }
      triggerSpecialCutin(adminPreviewRarity, function() {
        var _m_admin_modal = document.getElementById("admin-modal"); if(_m_admin_modal) { _m_admin_modal.style.display = "flex"; _m_admin_modal.style.pointerEvents = "auto"; }
        setAdminStatus("演出「" + btn.innerText + "（" + adminPreviewRarity + "）」の再生が完了しました！");
      }, [sampleCard], cutinType);
    });
  });

  var btnPrevGodSummon = document.getElementById("admin-preview-god-summon");
  if (btnPrevGodSummon) {
    btnPrevGodSummon.addEventListener("click", function() {
      var godPool = ALL_CARDS.filter(function(c) { return c.rarity === "GOD" || c.rarity === "ADMIN"; });
      var pick = godPool[Math.floor(Math.random() * godPool.length)];
      var _m_admin_modal = document.getElementById("admin-modal"); if(_m_admin_modal) { _m_admin_modal.style.display = "none"; _m_admin_modal.style.pointerEvents = "none"; }
      showGodSummonCutin(pick, userData.playerName || DEFAULT_PLAYER_NAME);
      setTimeout(function() {
        var _m_admin_modal = document.getElementById("admin-modal"); if(_m_admin_modal) { _m_admin_modal.style.display = "flex"; _m_admin_modal.style.pointerEvents = "auto"; }
        setAdminStatus("降臨演出「" + pick.name + "」の再生が完了しました！");
      }, 2450);
    });
  }

  _on("admin-reset-all", "click", function() {
    if (confirm("本当にセーブデータを完全に初期化しますか？")) {
      localStorage.removeItem(SAVE_KEY);
      userData = loadUserData();
      saveUserData();
      rigNextRarity = null;
      updateRigButtons();
      setAdminStatus("セーブデータを初期状態に戻しました。");
    }
  });

  // ================= 画面遷移＆パック選択 =================
  var screens = ["home-screen", "mission-screen", "pack-screen", "deck-screen", "setup-screen", "game-screen"];

  // ================= バトル中BGMエンジン (138BPM サイバー・レスバロック + battle_bgm.mp3対応) =================
  var battleBgmTimer = null;
  var battleBgmStep = 0;
  var battleBgmUsingMp3 = false;
  var battleBgmIsPlaying = false;

  function updateAllSoundButtonsUI() {
    if (typeof updateSoundBtnUI === "function") updateSoundBtnUI();
    if (typeof updateBgmBtnUI === "function") updateBgmBtnUI();
    var bBgmBtn = document.getElementById("btn-battle-bgm-toggle");
    if (bBgmBtn) {
      bBgmBtn.innerText = isBgmEnabled ? "🔥 戦BGM ON" : "🔇 戦BGM OFF";
      bBgmBtn.style.borderColor = isBgmEnabled ? "#ff4757" : "#666";
      bBgmBtn.style.opacity = isBgmEnabled ? "1" : "0.7";
    }
    var bSfxBtn = document.getElementById("btn-battle-sfx-toggle");
    if (bSfxBtn) {
      bSfxBtn.innerText = isSoundEnabled ? "🔊 効果音ON" : "🔇 効果音OFF";
      bSfxBtn.style.borderColor = isSoundEnabled ? "#ffd32a" : "#666";
      bSfxBtn.style.opacity = isSoundEnabled ? "1" : "0.7";
    }
  }

  function playBattleSynthStep() {
    if (!isBgmEnabled || !battleBgmIsPlaying || battleBgmUsingMp3) return;
    var ctx = getAudioCtx();
    if (!ctx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === "suspended") audioCtx.resume().catch(function(){});
        ctx = audioCtx;
      }
    }
    if (!ctx || ctx.state !== "running") return;

    var now = ctx.currentTime;
    var step = battleBgmStep % 16;
    var bar = Math.floor(battleBgmStep / 16) % 4;

    if (step % 4 === 0 || (bar % 2 === 1 && step === 14)) {
      var kOsc = ctx.createOscillator();
      var kGain = ctx.createGain();
      kOsc.type = "sine";
      kOsc.frequency.setValueAtTime(160, now);
      kOsc.frequency.exponentialRampToValueAtTime(38, now + 0.095);
      kGain.gain.setValueAtTime(0.16, now);
      kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      kOsc.connect(kGain); kGain.connect(ctx.destination);
      kOsc.start(now); kOsc.stop(now + 0.12);
    }

    if (step === 4 || step === 12) {
      var sSize = Math.floor(ctx.sampleRate * 0.10);
      var sBuf = ctx.createBuffer(1, sSize, ctx.sampleRate);
      var sData = sBuf.getChannelData(0);
      for (var i = 0; i < sSize; i++) sData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sSize * 0.3));
      var sSrc = ctx.createBufferSource();
      sSrc.buffer = sBuf;
      var sFilter = ctx.createBiquadFilter();
      sFilter.type = "bandpass";
      sFilter.frequency.value = 1400;
      var sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.095, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      sSrc.connect(sFilter); sFilter.connect(sGain); sGain.connect(ctx.destination);
      sSrc.start(now);
    }

    if (step % 2 === 1) {
      var hSize = Math.floor(ctx.sampleRate * 0.03);
      var hBuf = ctx.createBuffer(1, hSize, ctx.sampleRate);
      var hData = hBuf.getChannelData(0);
      for (var j = 0; j < hSize; j++) hData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (hSize * 0.2));
      var hSrc = ctx.createBufferSource();
      hSrc.buffer = hBuf;
      var hFilter = ctx.createBiquadFilter();
      hFilter.type = "highpass";
      hFilter.frequency.value = 6500;
      var hGain = ctx.createGain();
      hGain.gain.setValueAtTime(step % 4 === 2 ? 0.042 : 0.022, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      hSrc.connect(hFilter); hFilter.connect(hGain); hGain.connect(ctx.destination);
      hSrc.start(now);
    }

    var rootFreqs = [73.42, 58.27, 65.41, 55.00];
    var r = rootFreqs[bar];
    var bFreq = (step % 2 === 0) ? r : r * 2;
    var bOsc = ctx.createOscillator();
    var bFilter = ctx.createBiquadFilter();
    var bGain = ctx.createGain();
    bOsc.type = "sawtooth";
    bOsc.frequency.setValueAtTime(bFreq, now);
    bFilter.type = "lowpass";
    bFilter.frequency.setValueAtTime(920, now);
    bFilter.frequency.exponentialRampToValueAtTime(260, now + 0.09);
    bGain.gain.setValueAtTime(0.068, now);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    bOsc.connect(bFilter); bFilter.connect(bGain); bGain.connect(ctx.destination);
    bOsc.start(now); bOsc.stop(now + 0.105);

    var melodies = [
      [587.33, 0, 587.33, 698.46, 880.00, 0, 783.99, 698.46, 659.25, 0, 587.33, 659.25, 698.46, 659.25, 587.33, 523.25],
      [466.16, 0, 587.33, 698.46, 932.33, 0, 880.00, 698.46, 783.99, 0, 698.46, 587.33, 698.46, 783.99, 880.00, 932.33],
      [523.25, 0, 659.25, 783.99, 1046.50, 0, 987.77, 783.99, 880.00, 0, 783.99, 659.25, 783.99, 880.00, 987.77, 1046.50],
      [880.00, 0, 830.61, 880.00, 1108.73, 0, 987.77, 880.00, 783.99, 0, 698.46, 659.25, 587.33, 659.25, 698.46, 880.00]
    ];
    var mFreq = melodies[bar][step];
    if (mFreq > 0) {
      var mOsc = ctx.createOscillator();
      var mGain = ctx.createGain();
      mOsc.type = "square";
      mOsc.frequency.setValueAtTime(mFreq, now);
      mGain.gain.setValueAtTime(0.024, now);
      mGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.11);
      mOsc.connect(mGain); mGain.connect(ctx.destination);
      mOsc.start(now); mOsc.stop(now + 0.12);
    }

    battleBgmStep++;
  }

  function startBattleBgm() {
    stopHomeBgm();
    if (!isBgmEnabled) return;
    battleBgmIsPlaying = true;
    var bAudio = document.getElementById("battle-bgm-audio");
    if (bAudio && !battleBgmUsingMp3) {
      bAudio.volume = 0.40;
      var p = bAudio.play();
      if (p && typeof p.then === "function") {
        p.then(function() {
          battleBgmUsingMp3 = true;
          if (battleBgmTimer) { clearInterval(battleBgmTimer); battleBgmTimer = null; }
        }).catch(function() {
          battleBgmUsingMp3 = false;
          if (!battleBgmTimer) {
            battleBgmTimer = setInterval(playBattleSynthStep, 108);
          }
        });
      }
    } else if (battleBgmUsingMp3 && bAudio) {
      bAudio.play().catch(function() {});
    } else if (!battleBgmTimer) {
      battleBgmTimer = setInterval(playBattleSynthStep, 108);
    }
  }

  function stopBattleBgm() {
    battleBgmIsPlaying = false;
    var bAudio = document.getElementById("battle-bgm-audio");
    if (bAudio) {
      try { bAudio.pause(); } catch(e) {}
    }
    if (battleBgmTimer) {
      clearInterval(battleBgmTimer);
      battleBgmTimer = null;
    }
  }

  var btnBattleBgm = document.getElementById("btn-battle-bgm-toggle");
  if (btnBattleBgm) {
    btnBattleBgm.addEventListener("click", function() {
      isBgmEnabled = !isBgmEnabled;
      localStorage.setItem(BGM_KEY, isBgmEnabled ? "true" : "false");
      updateAllSoundButtonsUI();
      if (isBgmEnabled) {
        startBattleBgm();
      } else {
        stopBattleBgm();
      }
    });
  }
  var btnBattleSfx = document.getElementById("btn-battle-sfx-toggle");
  if (btnBattleSfx) {
    btnBattleSfx.addEventListener("click", function() {
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem(SOUND_KEY, isSoundEnabled ? "true" : "false");
      updateAllSoundButtonsUI();
      if (isSoundEnabled) PackSFX.tap();
    });
  }

  // ================= バトル専用・効果音エンジン (BattleSFX) =================
  var BattleSFX = {
    select: function() {
      PackSFX.tone(660, "triangle", 0.06, 0.09, 0, 880);
    },
    summon: function(rarity) {
      if (rarity === "GOD" || rarity === "ADMIN") {
        PackSFX.tone(110, "sawtooth", 0.45, 0.14, 0, 55);
        PackSFX.tone(523.25, "triangle", 0.18, 0.12, 0.04);
        PackSFX.tone(659.25, "triangle", 0.18, 0.12, 0.14);
        PackSFX.tone(783.99, "triangle", 0.22, 0.13, 0.24);
        PackSFX.tone(1046.50, "sine", 0.45, 0.15, 0.34);
      } else if (rarity === "UR" || rarity === "SR") {
        PackSFX.tone(440, "triangle", 0.12, 0.11, 0, 660);
        PackSFX.tone(880, "sine", 0.24, 0.12, 0.08);
      } else {
        PackSFX.tone(320, "sine", 0.08, 0.11, 0, 580);
        PackSFX.tone(580, "triangle", 0.09, 0.08, 0.05);
      }
    },
    fusion: function() {
      var notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach(function(f, idx) {
        PackSFX.tone(f, "sawtooth", 0.12, 0.08, idx * 0.05);
      });
    },
    spell: function() {
      PackSFX.tone(783.99, "sine", 0.10, 0.10, 0, 1174.66);
      PackSFX.tone(1046.50, "triangle", 0.18, 0.10, 0.07, 1567.98);
    },
    attackMeme: function() {
      PackSFX.tone(520, "sawtooth", 0.09, 0.12, 0, 140);
      PackSFX.tone(130, "square", 0.14, 0.13, 0.05, 48);
    },
    directAttack: function() {
      PackSFX.tone(180, "sawtooth", 0.24, 0.16, 0, 42);
      PackSFX.tone(95, "square", 0.28, 0.15, 0.04, 35);
      PackSFX.tone(880, "sine", 0.10, 0.09, 0.10, 620);
    },
    shieldBlock: function() {
      PackSFX.tone(1200, "sine", 0.10, 0.11, 0, 1800);
      PackSFX.tone(1600, "triangle", 0.18, 0.09, 0.06);
    },
    destroy: function() {
      PackSFX.tone(300, "sawtooth", 0.22, 0.10, 0, 65);
    },
    turnEnd: function() {
      PackSFX.tone(480, "triangle", 0.09, 0.08, 0, 320);
    },
    win: function() {
      var fanfare = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
      var times = [0, 0.11, 0.22, 0.34, 0.50, 0.62];
      fanfare.forEach(function(f, i) {
        PackSFX.tone(f, "triangle", i === 5 ? 0.45 : 0.13, 0.13, times[i]);
      });
    },
    lose: function() {
      PackSFX.tone(392.00, "sawtooth", 0.18, 0.09, 0);
      PackSFX.tone(369.99, "sawtooth", 0.18, 0.09, 0.18);
      PackSFX.tone(349.23, "sawtooth", 0.18, 0.09, 0.36);
      PackSFX.tone(329.63, "sawtooth", 0.42, 0.10, 0.54, 240);
    }
  };

  function showScreen(id) {
    for (var i = 0; i < screens.length; i++) {
      var s = screens[i];
      document.getElementById(s).style.display = (s === id) ? (id === "game-screen" ? "flex" : "block") : "none";
    }
    updateAllSoundButtonsUI();
    var chaosBg = document.getElementById("home-chaos-bg");
    if (chaosBg) {
      chaosBg.style.display = (id === "game-screen") ? "none" : "block";
    }
    if (id === "game-screen") {
      stopHomeBgm();
      startBattleBgm();
    } else {
      stopBattleBgm();
      if (id === "home-screen") {
        startHomeBgm();
      }
    }
  }

  function selectPackTab(packNo) {
    selectedPackNo = packNo;
    var tab1 = document.getElementById("tab-pack-1");
    var tab2 = document.getElementById("tab-pack-2");
    var tab3 = document.getElementById("tab-pack-3");
    var tab4 = document.getElementById("tab-pack-4");
    var pVisual = document.getElementById("preview-pack-visual");
    var pEmblem = document.getElementById("preview-pack-emblem");
    var pTitle = document.getElementById("preview-pack-title");
    var pSub = document.getElementById("preview-pack-sub");
    var count = ALL_CARDS.filter(function(c) { return c.pack === packNo; }).length;

    tab1.classList.remove("active");
    tab2.classList.remove("active", "vol2");
    if (tab3) tab3.classList.remove("active", "vol3");
    if (tab4) tab4.classList.remove("active", "vol4");
    pVisual.classList.remove("vol2", "vol3", "vol4");

    if (packNo === 1) {
      tab1.classList.add("active");
      pEmblem.innerText = "🌐";
      pTitle.innerText = "VOL.1 BASIC";
      pSub.innerHTML = "基本ミームパック（全" + count + "種）<br>超低確率 GODレア収録！";
    } else if (packNo === 2) {
      tab2.classList.add("active", "vol2");
      pVisual.classList.add("vol2");
      pEmblem.innerText = "🔥";
      pTitle.innerText = "VOL.2 CHAOS";
      pSub.innerHTML = "第2弾：カオス＆深淵編（全" + count + "種）<br>GODレア2種＆メタ・GODキラー収録！";
    } else if (packNo === 3) {
      if (tab3) tab3.classList.add("active", "vol3");
      pVisual.classList.add("vol3");
      pEmblem.innerText = "🎬";
      pTitle.innerText = "VOL.3 ANIME";
      pSub.innerHTML = "第3弾：アニメミーム＆名言編（全" + count + "種）<br>伝説の名セリフ＆フラグGOD2種収録！";
    } else {
      if (tab4) tab4.classList.add("active", "vol4");
      pVisual.classList.add("vol4");
      pEmblem.innerText = "🎮";
      pTitle.innerText = "VOL.4 GAME";
      pSub.innerHTML = "第4弾：ゲーム＆実況者・RTA編（全" + count + "種）<br>RTA完走者＆復活ラスボスGOD収録！";
    }
  }

  _on("tab-pack-1", "click", function() { selectPackTab(1); });
  _on("tab-pack-2", "click", function() { selectPackTab(2); });
  _on("tab-pack-3", "click", function() { selectPackTab(3); });
  _on("tab-pack-4", "click", function() { selectPackTab(4); });

  function renderPackCardListModal() {
    var packCards = ALL_CARDS.filter(function(c) { return c.pack === selectedPackNo; });
    var rarityOrder = { GOD: 0, UR: 1, SR: 2, R: 3, N: 4 };
    packCards.sort(function(a, b) { return rarityOrder[a.rarity] - rarityOrder[b.rarity]; });

    var packTitles = {
      1: "📋 第1弾：基本ミームパック",
      2: "📋 第2弾：カオス＆深淵編",
      3: "📋 第3弾：アニメミーム＆名言編",
      4: "📋 第4弾：ゲーム＆実況者・RTA編"
    };
    document.getElementById("modal-pack-title").innerText =
      (packTitles[selectedPackNo] || "📋 パック一覧") + "（全" + packCards.length + "種）";

    var kw = (document.getElementById("pack-search-input") ? document.getElementById("pack-search-input").value : "").trim().toLowerCase();
    var pRar = document.getElementById("pack-filter-rarity") ? document.getElementById("pack-filter-rarity").value : "ALL";
    var pType = document.getElementById("pack-filter-type") ? document.getElementById("pack-filter-type").value : "ALL";
    var pOwn = document.getElementById("pack-filter-owned") ? document.getElementById("pack-filter-owned").value : "ALL";

    var filtered = packCards.filter(function(card) {
      var owned = userData.collection[card.id] || 0;
      if (pRar !== "ALL" && card.rarity !== pRar) return false;
      if (pType !== "ALL" && card.type !== pType) return false;
      if (pOwn === "OWNED" && owned <= 0) return false;
      if (pOwn === "UNOWNED" && owned > 0) return false;
      if (kw) {
        var hay = ((card.name || "") + " " + (card.desc || "") + " " + (card.era || "")).toLowerCase();
        if (hay.indexOf(kw) === -1) return false;
      }
      return true;
    });

    var grid = document.getElementById("modal-card-grid");
    grid.innerHTML = "";
    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:20px;">条件に一致するカードがありません</div>';
    }
    filtered.forEach(function(card) {
      var owned = userData.collection[card.id] || 0;
      var el = createCardElement(card, null, {});
      var badge = document.createElement("div");
      badge.className = owned > 0 ? "owned-badge" : "owned-badge unowned";
      badge.innerText = owned > 0 ? "所持: " + owned + "枚" : "未所持";
      el.appendChild(badge);
      grid.appendChild(el);
    });
  }

  _on("pack-search-input", "input", renderPackCardListModal);
  _on("pack-filter-rarity", "change", renderPackCardListModal);
  _on("pack-filter-type", "change", renderPackCardListModal);
  _on("pack-filter-owned", "change", renderPackCardListModal);

  _on("btn-view-pack-list", "click", function() {
    var ps = document.getElementById("pack-search-input"); if (ps) ps.value = "";
    var pr = document.getElementById("pack-filter-rarity"); if (pr) pr.value = "ALL";
    var pt = document.getElementById("pack-filter-type"); if (pt) pt.value = "ALL";
    var po = document.getElementById("pack-filter-owned"); if (po) po.value = "ALL";
    renderPackCardListModal();
    var _m_pack_list_modal = document.getElementById("pack-list-modal"); if(_m_pack_list_modal) { _m_pack_list_modal.style.display = "flex"; _m_pack_list_modal.style.pointerEvents = "auto"; }
  });

  _on("btn-close-pack-list", "click", function() {
    var _m_pack_list_modal = document.getElementById("pack-list-modal"); if(_m_pack_list_modal) { _m_pack_list_modal.style.display = "none"; _m_pack_list_modal.style.pointerEvents = "none"; }
  });

  _on("nav-battle", "click", function() {
    populateBattleDeckSelect();
    renderPlaymatSelectors();
    document.getElementById("step-mode").style.display = "block";
    document.getElementById("step-boss").style.display = "none";
    document.getElementById("step-online").style.display = "none";
    var fl = document.getElementById("step-friend-lobby");
    if (fl) fl.style.display = "none";
    showScreen("setup-screen");
  });
  _on("nav-pack", "click", function() {
    selectPackTab(selectedPackNo);
    showScreen("pack-screen");
  });
  _on("nav-deck", "click", function() {
    switchDeckSlot(currentDeckSlot);
    showScreen("deck-screen");
  });

  _on("back-from-pack", "click", function() { showScreen("home-screen"); });
  _on("back-from-deck", "click", function() { showScreen("home-screen"); });
  _on("back-from-setup", "click", function() {
    cancelRandomMatch();
    showScreen("home-screen");
  });

  // ================= Web Audio API パック開封効果音エンジン =================
  var SOUND_KEY = "netmeme_tcg_sound_on";
  var isSoundEnabled = (localStorage.getItem(SOUND_KEY) !== "false");
  var audioCtx = null;

  function getAudioCtx() {
    if (!isSoundEnabled) return null;
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(function() {});
    }
    return audioCtx;
  }

  function updateSoundBtnUI() {
    var btn = document.getElementById("btn-toggle-sound");
    if (!btn) return;
    if (isSoundEnabled) {
      btn.innerText = "🔊 音ON";
      btn.style.borderColor = "#ffd32a";
      btn.style.opacity = "1";
    } else {
      btn.innerText = "🔇 音OFF";
      btn.style.borderColor = "#666";
      btn.style.opacity = "0.7";
    }
  }

  var btnSoundToggle = document.getElementById("btn-toggle-sound");
  if (btnSoundToggle) {
    updateAllSoundButtonsUI();
    btnSoundToggle.addEventListener("click", function() {
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem(SOUND_KEY, isSoundEnabled ? "true" : "false");
      updateAllSoundButtonsUI();
      if (isSoundEnabled) PackSFX.tap();
    });
  }


  // ================= ホーム画面BGMエンジン (MP3 + Future Funk 115BPM 自動シンセフォールバック) =================
  var BGM_KEY = "netmeme_tcg_bgm_on";
  var isBgmEnabled = (localStorage.getItem(BGM_KEY) !== "false");
  var bgmSynthTimer = null;
  var bgmStep = 0;
  var bgmUsingMp3 = false;
  var bgmIsPlaying = false;

  function updateBgmBtnUI() {
    var btn = document.getElementById("btn-toggle-bgm");
    if (!btn) return;
    if (isBgmEnabled) {
      btn.innerText = "🎵 BGM ON";
      btn.style.borderColor = "#00ff88";
      btn.style.opacity = "1";
    } else {
      btn.innerText = "🔇 BGM OFF";
      btn.style.borderColor = "#666";
      btn.style.opacity = "0.7";
    }
  }

  function playSynthBgmStep() {
    if (!isBgmEnabled || !bgmIsPlaying || bgmUsingMp3) return;
    var ctx = getAudioCtx();
    if (!ctx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === "suspended") audioCtx.resume().catch(function(){});
        ctx = audioCtx;
      }
    }
    if (!ctx || ctx.state !== "running") return;

    var now = ctx.currentTime;
    var step = bgmStep % 16;

    // 1. 4つ打ちキック (Step 0, 4, 8, 12)
    if (step % 4 === 0) {
      var kOsc = ctx.createOscillator();
      var kGain = ctx.createGain();
      kOsc.type = "sine";
      kOsc.frequency.setValueAtTime(135, now);
      kOsc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
      kGain.gain.setValueAtTime(0.14, now);
      kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      kOsc.connect(kGain); kGain.connect(ctx.destination);
      kOsc.start(now); kOsc.stop(now + 0.14);
    }

    // 2. スネア＆クラップ (Step 4, 12)
    if (step === 4 || step === 12) {
      var bufSize = Math.floor(ctx.sampleRate * 0.09);
      var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
      var noise = ctx.createBufferSource();
      noise.buffer = buf;
      var filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 900;
      var sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.075, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      noise.connect(filter); filter.connect(sGain); sGain.connect(ctx.destination);
      noise.start(now);
    }

    // 3. 裏打ちハイハット (Step 2, 6, 10, 14)
    if (step % 4 === 2) {
      var hSize = Math.floor(ctx.sampleRate * 0.04);
      var hBuf = ctx.createBuffer(1, hSize, ctx.sampleRate);
      var hData = hBuf.getChannelData(0);
      for (var j = 0; j < hSize; j++) hData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (hSize * 0.25));
      var hSrc = ctx.createBufferSource();
      hSrc.buffer = hBuf;
      var hFilter = ctx.createBiquadFilter();
      hFilter.type = "highpass";
      hFilter.frequency.value = 5500;
      var hGain = ctx.createGain();
      hGain.gain.setValueAtTime(0.035, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      hSrc.connect(hFilter); hFilter.connect(hGain); hGain.connect(ctx.destination);
      hSrc.start(now);
    }

    // 4. Future Funk スラップベースライン (115BPM / Fmaj7 -> Em7 -> Dm7 -> G13)
    var bar = Math.floor(bgmStep / 16) % 4;
    var bassPatterns = [
      [87.31, 0, 87.31, 130.81, 0, 87.31, 110.00, 130.81, 87.31, 0, 130.81, 0, 146.83, 130.81, 110.00, 98.00], // F
      [82.41, 0, 82.41, 123.47, 0, 82.41, 98.00, 123.47, 82.41, 0, 123.47, 0, 146.83, 123.47, 98.00, 87.31],  // Em
      [73.42, 0, 73.42, 110.00, 0, 73.42, 87.31, 110.00, 73.42, 0, 110.00, 0, 130.81, 110.00, 87.31, 98.00],  // Dm
      [98.00, 0, 98.00, 146.83, 0, 98.00, 123.47, 146.83, 98.00, 0, 146.83, 0, 164.81, 146.83, 123.47, 110.00] // G
    ];
    var bFreq = bassPatterns[bar][step];
    if (bFreq > 0) {
      var bOsc = ctx.createOscillator();
      var bFilter = ctx.createBiquadFilter();
      var bGain = ctx.createGain();
      bOsc.type = "sawtooth";
      bOsc.frequency.setValueAtTime(bFreq, now);
      bFilter.type = "lowpass";
      bFilter.frequency.setValueAtTime(780, now);
      bFilter.frequency.exponentialRampToValueAtTime(220, now + 0.11);
      bGain.gain.setValueAtTime(0.065, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      bOsc.connect(bFilter); bFilter.connect(bGain); bGain.connect(ctx.destination);
      bOsc.start(now); bOsc.stop(now + 0.13);
    }

    // 5. キラキラ・シンセコードスタブ＆グリッチチャップ風メロディ
    var chordNotes = [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [329.63, 392.00, 493.88, 587.33], // Em7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [392.00, 493.88, 587.33, 659.25]  // G13
    ];
    if (step === 0 || step === 6 || step === 10 || step === 14) {
      var notes = chordNotes[bar];
      notes.forEach(function(freq) {
        var cOsc = ctx.createOscillator();
        var cGain = ctx.createGain();
        cOsc.type = "triangle";
        cOsc.frequency.setValueAtTime(freq, now);
        cGain.gain.setValueAtTime(0.022, now);
        cGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.24);
        cOsc.connect(cGain); cGain.connect(ctx.destination);
        cOsc.start(now); cOsc.stop(now + 0.25);
      });
    }

    // リードチャップ風アクセント
    var leadNotes = [659.25, 0, 783.99, 659.25, 880.00, 0, 783.99, 659.25, 587.33, 0, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99];
    var lFreq = leadNotes[step];
    if (lFreq > 0 && (bar % 2 === 1 || step % 4 === 0)) {
      var lOsc = ctx.createOscillator();
      var lGain = ctx.createGain();
      lOsc.type = "sine";
      lOsc.frequency.setValueAtTime(lFreq, now);
      lGain.gain.setValueAtTime(0.028, now);
      lGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);
      lOsc.connect(lGain); lGain.connect(ctx.destination);
      lOsc.start(now); lOsc.stop(now + 0.15);
    }

    bgmStep++;
  }

  function startHomeBgm() {
    if (!isBgmEnabled) return;
    var gameScreen = document.getElementById("game-screen");
    if (gameScreen && gameScreen.style.display !== "none") return; // バトル中は停止
    bgmIsPlaying = true;
    var audioEl = document.getElementById("home-bgm-audio");
    if (audioEl) {
      audioEl.volume = 0.55;
      var p = audioEl.play();
      if (p && typeof p.then === "function") {
        p.then(function() {
          bgmUsingMp3 = true;
          if (bgmSynthTimer) { clearInterval(bgmSynthTimer); bgmSynthTimer = null; }
        }).catch(function() {
          // 外部 home_bgm.mp3 が見つからない場合は内蔵埋め込み『進化の最前線』データへ切替
          if (window.__EMBEDDED_HOME_BGM__ && audioEl.src !== window.__EMBEDDED_HOME_BGM__) {
            audioEl.src = window.__EMBEDDED_HOME_BGM__;
            audioEl.load();
            audioEl.play().then(function() {
              bgmUsingMp3 = true;
              if (bgmSynthTimer) { clearInterval(bgmSynthTimer); bgmSynthTimer = null; }
            }).catch(function() {
              bgmIsPlaying = false;
            });
          } else {
            bgmIsPlaying = false;
          }
        });
      }
    }
  }

  function stopHomeBgm() {
    bgmIsPlaying = false;
    var audioEl = document.getElementById("home-bgm-audio");
    if (audioEl) {
      try { audioEl.pause(); } catch(e) {}
    }
    if (bgmSynthTimer) {
      clearInterval(bgmSynthTimer);
      bgmSynthTimer = null;
    }
  }

  var btnBgmToggle = document.getElementById("btn-toggle-bgm");
  if (btnBgmToggle) {
    updateAllSoundButtonsUI();
    btnBgmToggle.addEventListener("click", function() {
      isBgmEnabled = !isBgmEnabled;
      localStorage.setItem(BGM_KEY, isBgmEnabled ? "true" : "false");
      updateAllSoundButtonsUI();
      if (isBgmEnabled) {
        startHomeBgm();
      } else {
        stopHomeBgm();
      }
    });
  }

  // iOS/iPadOS Chrome対応：最初のタップ同期処理内でAudioContextを即座にunlockしてBGM開始
  function unlockAudioAndStartBgmSync() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        // 無音バッファを1サンプル再生してiOS WebKitのオーディオロックを確実に解除
        var silentBuf = audioCtx.createBuffer(1, 1, 22050);
        var src = audioCtx.createBufferSource();
        src.buffer = silentBuf;
        src.connect(audioCtx.destination);
        if (src.start) src.start(0);
      }
    } catch (e) {}

    if (isBgmEnabled) {
      var gs = document.getElementById("game-screen");
      if (gs && gs.style.display !== "none") {
        if (!battleBgmIsPlaying) startBattleBgm();
      } else {
        if (!bgmIsPlaying) startHomeBgm();
      }
    }
  }
  ["touchstart", "pointerdown", "click"].forEach(function(evtName) {
    document.addEventListener(evtName, unlockAudioAndStartBgmSync, { passive: true });
  });

  var PackSFX = {
    tone: function(freq, type, duration, vol, delay, slideToFreq) {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var t = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t);
      if (slideToFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), t + duration);
      }
      gain.gain.setValueAtTime(vol || 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    },
    noise: function(duration, vol, delay, filterFreq) {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var t = ctx.currentTime + (delay || 0);
      var bufferSize = Math.floor(ctx.sampleRate * duration);
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      var src = ctx.createBufferSource();
      src.buffer = buffer;

      var filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(filterFreq || 2200, t);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(vol || 0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
      src.stop(t + duration + 0.02);
    },
    tap: function() {
      this.tone(660, "triangle", 0.08, 0.12, 0, 880);
    },
    tearTick: function(progressPct) {
      // スワイプ進行度に応じてチリチリ音が高くなる
      var freq = 1400 + progressPct * 24;
      this.noise(0.045, 0.12, 0, freq);
      this.tone(300 + progressPct * 6, "sawtooth", 0.03, 0.04, 0);
    },
    tearRip: function() {
      // パックをビリッと切り裂く爽快音
      this.noise(0.32, 0.35, 0, 2800);
      this.tone(420, "sawtooth", 0.25, 0.14, 0, 1250);
    },
    glowNormal: function(rarity) {
      if (rarity === "SR") {
        this.tone(523.25, "triangle", 0.2, 0.18, 0);
        this.tone(659.25, "triangle", 0.2, 0.18, 0.08);
        this.tone(783.99, "triangle", 0.35, 0.22, 0.16);
      } else if (rarity === "R") {
        this.tone(587.33, "sine", 0.18, 0.15, 0);
        this.tone(880, "sine", 0.28, 0.18, 0.09);
      } else {
        this.tone(440, "sine", 0.2, 0.12, 0, 520);
      }
    },
    fakeYellow: function() {
      this.tone(523.25, "triangle", 0.18, 0.18, 0);
      this.tone(659.25, "triangle", 0.25, 0.18, 0.09);
    },
    thunderUpgrade: function(isGod) {
      // 雷撃＆昇格サウンド！
      this.noise(0.45, 0.4, 0, 900);
      this.tone(180, "sawtooth", 0.35, 0.25, 0, 45);
      this.tone(587.33, "square", 0.15, 0.18, 0.05);
      this.tone(880, "square", 0.18, 0.2, 0.14);
      this.tone(1174.66, "square", 0.22, 0.22, 0.23);
      if (isGod) {
        this.tone(1760, "triangle", 0.5, 0.25, 0.32);
      }
    },
    pachinkoKyuin: function(isGod) {
      // キュインキュイン！パチンコ確定音
      var repeats = isGod ? 4 : 3;
      for (var i = 0; i < repeats; i++) {
        var d = i * 0.32;
        this.tone(950, "square", 0.12, 0.2, d, 2400);
        this.tone(1800, "sine", 0.16, 0.22, d + 0.1, 3200);
      }
      this.tone(1046.5, "triangle", 0.6, 0.25, repeats * 0.32);
    },
    crashFake: function() {
      // 一瞬ショボい音
      this.tone(240, "sine", 0.25, 0.12, 0, 170);
    },
    crashGlass: function() {
      // ガラス粉砕＆逆転ファンファーレ
      this.noise(0.5, 0.45, 0, 3200);
      this.tone(150, "sawtooth", 0.4, 0.28, 0, 40);
      this.tone(659.25, "square", 0.18, 0.2, 0.12);
      this.tone(880, "square", 0.2, 0.22, 0.24);
      this.tone(1318.5, "square", 0.45, 0.25, 0.36);
    },
    slotSpin: function() {
      this.tone(360 + Math.random() * 180, "square", 0.05, 0.08, 0);
    },
    slotStop: function(step) {
      var freqs = [523.25, 659.25, 1046.5];
      this.tone(freqs[step] || 523.25, "square", 0.22, 0.22, 0);
      if (step === 2) {
        // 777揃い大当たりファンファーレ
        this.tone(1318.5, "triangle", 0.18, 0.22, 0.12);
        this.tone(1567.98, "triangle", 0.22, 0.24, 0.24);
        this.tone(2093.0, "triangle", 0.55, 0.26, 0.36);
      }
    },
    trendBuzz: function() {
      // SNS通知連打＆トレンド爆発音
      for (var i = 0; i < 8; i++) {
        var d = i * 0.14;
        this.tone(987.77, "sine", 0.09, 0.16, d);
        this.tone(1318.51, "sine", 0.14, 0.18, d + 0.06);
      }
    },
    bigBangImplode: function() {
      // ブラックホール収束音
      this.tone(90, "sawtooth", 1.0, 0.25, 0, 520);
      this.tone(140, "sine", 1.0, 0.22, 0, 880);
    },
    bigBangBoom: function() {
      // ビッグバン大爆発＆神聖和音
      this.noise(0.85, 0.45, 0, 500);
      this.tone(110, "sawtooth", 0.7, 0.3, 0, 32);
      this.tone(523.25, "triangle", 0.9, 0.22, 0.08);
      this.tone(659.25, "triangle", 0.9, 0.22, 0.08);
      this.tone(783.99, "triangle", 0.9, 0.22, 0.08);
      this.tone(1046.5, "triangle", 1.0, 0.25, 0.15);
    },
    puchunOff: function() {
      // プチュン！電源断音
      this.tone(1400, "sine", 0.18, 0.24, 0, 45);
      this.noise(0.08, 0.2, 0, 1800);
    },
    puchunFreeze: function() {
      // 暗転からの衝撃音
      this.tone(75, "sawtooth", 0.5, 0.32, 0, 35);
      this.tone(880, "square", 0.18, 0.22, 0.05);
      this.tone(1174.66, "square", 0.2, 0.24, 0.18);
      this.tone(1760, "square", 0.55, 0.26, 0.32);
    },
    bsodBeep: function() {
      this.tone(440, "square", 0.14, 0.18, 0);
      this.tone(330, "square", 0.22, 0.2, 0.14);
    },
    bsodOverride: function() {
      this.noise(0.45, 0.4, 0, 2600);
      this.tone(523.25, "square", 0.16, 0.22, 0.05);
      this.tone(783.99, "square", 0.18, 0.24, 0.16);
      this.tone(1046.5, "square", 0.22, 0.25, 0.28);
      this.tone(1567.98, "triangle", 0.55, 0.28, 0.4);
    },
    notifPop: function(step) {
      var base = 780 + step * 95;
      this.tone(base, "sine", 0.08, 0.16, 0);
      this.tone(base * 1.33, "sine", 0.12, 0.18, 0.05);
    },
    jikaiDrum: function() {
      this.noise(0.07, 0.22, 0, 650);
      this.tone(110, "triangle", 0.08, 0.2, 0, 75);
    },
    jikaiDon: function(isGod) {
      this.noise(0.5, 0.42, 0, 420);
      this.tone(95, "sawtooth", 0.55, 0.3, 0, 38);
      this.tone(isGod ? 1318.5 : 1046.5, "triangle", 0.65, 0.25, 0.08);
    },
    nurupoGatsu: function(isGod) {
      this.noise(0.4, 0.45, 0, 1400);
      this.tone(140, "sawtooth", 0.35, 0.3, 0, 42);
      this.tone(880, "square", 0.16, 0.22, 0.08);
      this.tone(1318.5, "square", 0.22, 0.24, 0.18);
      if (isGod) this.tone(1760, "triangle", 0.5, 0.26, 0.28);
    },
        cardFlip: function(rarity) {
      if (rarity === "GOD") {
        this.noise(0.25, 0.25, 0, 2600);
        this.tone(523.25, "triangle", 0.45, 0.22, 0);
        this.tone(783.99, "triangle", 0.45, 0.22, 0.06);
        this.tone(1046.5, "triangle", 0.5, 0.24, 0.12);
        this.tone(1567.98, "sine", 0.65, 0.26, 0.18);
      } else if (rarity === "UR") {
        this.tone(587.33, "square", 0.15, 0.18, 0);
        this.tone(880, "square", 0.18, 0.2, 0.07);
        this.tone(1174.66, "triangle", 0.4, 0.24, 0.14);
      } else if (rarity === "SR") {
        this.tone(523.25, "triangle", 0.14, 0.16, 0);
        this.tone(783.99, "triangle", 0.28, 0.2, 0.08);
      } else if (rarity === "R") {
        this.tone(659.25, "sine", 0.18, 0.15, 0);
      } else {
        this.noise(0.06, 0.12, 0, 2400);
        this.tone(380, "sine", 0.08, 0.1, 0, 480);
      }
    }
  };

  // ================= パック開封ステージ =================
  _on("btn-open-pack", "click", function() { enterPackOpenStage(1); });
  _on("btn-open-pack-10", "click", function() { enterPackOpenStage(10); });
  _on("btn-stage-again", "click", function() { enterPackOpenStage(1); });
  _on("btn-stage-again-10", "click", function() { enterPackOpenStage(10); });
  _on("btn-stage-back", "click", function() {
    var _m_pack_open_stage = document.getElementById("pack-open-stage"); if(_m_pack_open_stage) { _m_pack_open_stage.style.display = "none"; _m_pack_open_stage.style.pointerEvents = "none"; }
  });

  function enterPackOpenStage(packCount) {
    packCount = (packCount === 10) ? 10 : 1;
    var totalCost = packCount * 100;
    if (pendingPackData) return;
    if (userData.points < totalCost) {
      alert("💎 ダイヤが足りません！（必要: " + totalCost.toLocaleString() + " 個 / 現在: " + userData.points.toLocaleString() + " 個）");
      return;
    }
    PackSFX.tap();

    userData.points -= totalCost;
    addMissionStat("packs", packCount);

    var targetCards = ALL_CARDS.filter(function(c) { return c.pack === selectedPackNo; });
    var poolN = targetCards.filter(function(c) { return c.rarity === "N"; });
    var poolR = targetCards.filter(function(c) { return c.rarity === "R"; });
    var poolSR = targetCards.filter(function(c) { return c.rarity === "SR"; });
    var poolUR = targetCards.filter(function(c) { return c.rarity === "UR"; });
    var poolGOD = targetCards.filter(function(c) { return c.rarity === "GOD"; });

    var pulled = [];
    var maxRarity = "R";
    var rankMap = { N: 1, R: 2, SR: 3, UR: 4, GOD: 5 };
    var totalCardsToPull = packCount * 5;

    for (var i = 0; i < totalCardsToPull; i++) {
      var rand = Math.random() * 100, pool = poolN;
      var isLastInPack = (i % 5 === 4);
      var isFinalTenthGuarantee = (packCount === 10 && i === totalCardsToPull - 1);

      if (i === 4 && rigNextRarity === "GOD" && poolGOD.length > 0) {
        pool = poolGOD;
      } else if (i === 4 && rigNextRarity === "UR" && poolUR.length > 0) {
        pool = poolUR;
      } else if (isFinalTenthGuarantee) {
        // 10連の50枚目はSR以上確定！
        if (rand < 0.2 && poolGOD.length > 0) pool = poolGOD;
        else if (rand < 6.0 && poolUR.length > 0) pool = poolUR;
        else pool = poolSR.length > 0 ? poolSR : poolR;
      } else if (isLastInPack) {
        if (rand < 0.1 && poolGOD.length > 0) pool = poolGOD;
        else if (rand < 3.1 && poolUR.length > 0) pool = poolUR;
        else if (rand < 30.1 && poolSR.length > 0) pool = poolSR;
        else pool = poolR;
      } else {
        if (rand < 0.1 && poolGOD.length > 0) pool = poolGOD;
        else if (rand < 1.1 && poolUR.length > 0) pool = poolUR;
        else if (rand < 13.1 && poolSR.length > 0) pool = poolSR;
        else if (rand < 43.1 && poolR.length > 0) pool = poolR;
      }
      var card = pool[Math.floor(Math.random() * pool.length)];
      if (rankMap[card.rarity] > rankMap[maxRarity]) maxRarity = card.rarity;
      pulled.push(card);
      userData.collection[card.id] = (userData.collection[card.id] || 0) + 1;
    }
    rigNextRarity = null;
    saveUserData();

    pendingPackData = { pulled: pulled, maxRarity: maxRarity, packCount: packCount };

    var stage = document.getElementById("pack-open-stage");
    var visual = document.getElementById("pack-visual");
    var emblem = document.getElementById("stage-pack-emblem");
    var title = document.getElementById("stage-pack-title");
    var sub = document.getElementById("stage-pack-sub");
    var bar = document.getElementById("tear-progress-bar");
    var hint = document.getElementById("tear-hint");
    var slit = document.getElementById("pack-slit-glow");

    document.getElementById("stage-guide").innerText = packCount === 10
      ? "🔥 10連パック（計50枚）！パック上部を右へなぞって切り開け！"
      : "✂️ パック上部を右へなぞって切り開け！";
    document.getElementById("pack-result-area").innerHTML = "";
    document.getElementById("stage-after-buttons").style.display = "none";

    visual.className = "real-pack ready-to-tear" + (selectedPackNo === 2 ? " vol2" : (selectedPackNo === 3 ? " vol3" : (selectedPackNo === 4 ? " vol4" : "")));
    emblem.innerText = selectedPackNo === 1 ? "🌐" : (selectedPackNo === 2 ? "🔥" : (selectedPackNo === 3 ? "🎬" : "🎮"));
    title.innerText = (selectedPackNo === 1 ? "VOL.1 BASIC" : (selectedPackNo === 2 ? "VOL.2 CHAOS" : (selectedPackNo === 3 ? "VOL.3 ANIME" : "VOL.4 GAME"))) + (packCount === 10 ? " ×10連" : "");
    sub.innerText = packCount === 10 ? "計50枚入り / SR以上1枚確定！" : "5枚入り / R以上1枚確定";
    bar.style.width = "0%";
    hint.innerText = "✂️ ここを右へスワイプ！";
    slit.className = "pack-slit-glow";

    stage.style.pointerEvents = "auto";
    stage.style.display = "flex";
  }

  var packWrapper = document.getElementById("pack-wrapper");
  var lastTearTickTime = 0;

  function handleTearStart(clientX) {
    if (!pendingPackData) return;
    isTearing = true;
    getAudioCtx();
  }

  function handleTearMove(clientX) {
    if (!isTearing || !pendingPackData) return;
    var rect = packWrapper.getBoundingClientRect();
    var progress = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    document.getElementById("tear-progress-bar").style.width = progress + "%";

    var now = Date.now();
    if (progress > 5 && now - lastTearTickTime > 75) {
      lastTearTickTime = now;
      PackSFX.tearTick(progress);
    }

    if (progress >= 65) {
      isTearing = false;
      executePackReveal();
    }
  }

  function handleTearEnd() {
    if (!isTearing || !pendingPackData) return;
    isTearing = false;
    var currentW = parseFloat(document.getElementById("tear-progress-bar").style.width) || 0;
    if (currentW < 10) {
      document.getElementById("tear-progress-bar").style.width = "100%";
      executePackReveal();
    } else {
      document.getElementById("tear-progress-bar").style.width = "0%";
    }
  }

  packWrapper.addEventListener("touchstart", function(e) { handleTearStart(e.touches[0].clientX); }, { passive: true });
  packWrapper.addEventListener("touchmove", function(e) { handleTearMove(e.touches[0].clientX); }, { passive: true });
  packWrapper.addEventListener("touchend", handleTearEnd);

  packWrapper.addEventListener("mousedown", function(e) { handleTearStart(e.clientX); });
  window.addEventListener("mousemove", function(e) { handleTearMove(e.clientX); });
  window.addEventListener("mouseup", handleTearEnd);

  function executePackReveal() {
    if (!pendingPackData) return;
    var data = pendingPackData;
    pendingPackData = null;

    PackSFX.tearRip();

    var visual = document.getElementById("pack-visual");
    var slit = document.getElementById("pack-slit-glow");
    var hint = document.getElementById("tear-hint");

    document.getElementById("tear-progress-bar").style.width = "100%";
    visual.classList.remove("ready-to-tear");
    visual.classList.add("pack-tearing-anim");

    // UR または GOD のとき、約65%で「最初は黄色（SR）に光って赤/虹へ昇格する」フェイク演出！
    var doYellowUpgrade = (data.maxRarity === "UR" || data.maxRarity === "GOD") && (Math.random() < 0.65);

    if (doYellowUpgrade) {
      // ① まず黄色に光る！
      hint.innerText = "✨ SR光…!? ✨";
      slit.className = "pack-slit-glow rarity-SR";
      PackSFX.fakeYellow();

      // ② 0.65秒後に雷撃とともに赤（または虹）へ昇格！！
      setTimeout(function() {
        PackSFX.thunderUpgrade(data.maxRarity === "GOD");
        hint.innerText = data.maxRarity === "GOD" ? "🌈 限界突破昇格!! 🌈" : "⚡ 赤昇格!! ⚡";
        slit.className = "pack-slit-glow rarity-" + data.maxRarity;

        // 昇格の瞬間にミニフラッシュを入れる
        var miniFlash = document.createElement("div");
        miniFlash.className = "screen-flash rarity-" + data.maxRarity;
        document.body.appendChild(miniFlash);
        setTimeout(function() { miniFlash.remove(); }, 600);
      }, 650);

      // ③ そこから激アツカットインへ突入！
      setTimeout(function() {
        visual.classList.remove("pack-tearing-anim");
        triggerSpecialCutin(data.maxRarity, function() {
          revealCardsSequence(data);
        }, data.pulled);
      }, 1350);

    } else {
      // 通常発光パターン
      hint.innerText = "✨ OPEN!! ✨";
      slit.className = "pack-slit-glow rarity-" + data.maxRarity;
      PackSFX.glowNormal(data.maxRarity);

      setTimeout(function() {
        visual.classList.remove("pack-tearing-anim");

        if (data.maxRarity === "UR" || data.maxRarity === "GOD") {
          triggerSpecialCutin(data.maxRarity, function() {
            revealCardsSequence(data);
          }, data.pulled);
        } else {
          revealCardsSequence(data);
        }
      }, 650);
    }
  }

  // =========================================================================
  // 激アツ演出ルーレット（全10パターン：既存6種 + BSoD再起動 / 通知万バズ / 次回予告 / ぬるぽ→ガッ！）
  // =========================================================================
  function pickCutinType(rarity) {
    var r = Math.random() * 100;
    if (rarity === "GOD") {
      if (r < 18) return "bsod";
      if (r < 34) return "jikai";
      if (r < 48) return "notif";
      if (r < 60) return "nurupo";
      if (r < 74) return "bigbang";
      if (r < 84) return "blackout";
      if (r < 90) return "slot";
      if (r < 94) return "crash";
      if (r < 97) return "trend";
      return "pachinko";
    } else {
      if (r < 15) return "bsod";
      if (r < 30) return "notif";
      if (r < 45) return "jikai";
      if (r < 60) return "nurupo";
      if (r < 68) return "pachinko";
      if (r < 76) return "crash";
      if (r < 84) return "slot";
      if (r < 91) return "trend";
      if (r < 97) return "blackout";
      return "bigbang";
    }
  }

  function triggerSpecialCutin(rarity, onComplete, pulledCards, forceType) {
    var overlay = document.getElementById("pachinko-overlay");
    var scenes = [
      "scene-pachinko", "scene-crash", "scene-slot", "scene-trend", "scene-bigbang", "scene-blackout",
      "scene-bsod", "scene-notif", "scene-jikai", "scene-nurupo"
    ];
    scenes.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("active");
    });
    overlay.classList.remove("quake-anim");
    overlay.style.display = "flex"; overlay.style.pointerEvents = "auto";

    var isGod = (rarity === "GOD");
    var type = forceType || pickCutinType(rarity);

    if (type === "bsod") {
      // 7. 💻 ブルースクリーン（BSoD）→ 強制再起動演出
      var scBsod = document.getElementById("scene-bsod");
      var errView = document.getElementById("bsod-error-view");
      var ovView = document.getElementById("bsod-override-view");
      var pctEl = document.getElementById("bsod-percent");
      var ovText = document.getElementById("bsod-override-text");

      scBsod.className = "effect-scene bsod-bg active";
      errView.style.display = "block";
      ovView.style.display = "none";
      pctEl.innerText = "0% 完了";
      PackSFX.bsodBeep();

      setTimeout(function() { pctEl.innerText = "48% 完了"; }, 320);
      setTimeout(function() { pctEl.innerText = "100% 完了"; }, 640);
      setTimeout(function() {
        PackSFX.bsodOverride();
        overlay.classList.add("quake-anim");
        scBsod.classList.add("override-mode");
        errView.style.display = "none";
        ovView.style.display = "flex";
        ovText.className = isGod ? "pachi-main-text god-text" : "pachi-main-text";
        ovText.innerHTML = isGod
          ? "【SYSTEM OVERRIDE】<br>🌈 GOD権限で強制復旧!! 🌈"
          : "【SYSTEM OVERRIDE】<br>🚨 URデータ強制サルベージ!! 🚨";
      }, 950);
      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2350);
      return;

    } else if (type === "notif") {
      // 8. 📱 通知爆発＆万バズカウンター演出
      var scNotif = document.getElementById("scene-notif");
      var stackEl = document.getElementById("notif-banner-stack");
      var countEl = document.getElementById("notif-like-count");
      var rankEl = document.getElementById("notif-rank-label");

      scNotif.classList.add("active");
      stackEl.innerHTML = "";
      countEl.innerText = "0";
      rankEl.innerText = "拡散開始…！";

      var messages = [
        "📱 X通知：あなたの投稿が急上昇中です！",
        "🔥 トレンド速報：RTが10,000件を突破しました！",
        "🚨 サーバー警告：アクセス集中により通知が爆発中！",
        isGod ? "🌈 神話降臨：全ネット民が奇跡のGOD引きを目撃！！" : "⚡ 激アツ通知：URレア引き当てで万バズ確定！！"
      ];
      var counts = ["1,280", "14,900", "58,400", isGod ? "1,145,140 🌈" : "128,000 🔥"];

      messages.forEach(function(msg, idx) {
        setTimeout(function() {
          PackSFX.notifPop(idx);
          var toast = document.createElement("div");
          toast.className = "notif-toast";
          if (idx === 3) toast.style.borderLeftColor = isGod ? "#00ff88" : "#ff4757";
          toast.innerText = msg;
          stackEl.appendChild(toast);
          countEl.innerText = counts[idx];
          if (idx === 2) {
            overlay.classList.add("quake-anim");
            rankEl.innerText = "🔥 万バズ達成！！まだまだ伸びる！！";
          } else if (idx === 3) {
            rankEl.style.color = isGod ? "#00ff88" : "#ff4757";
            rankEl.innerText = isGod ? "🌈 トレンド世界1位・GOD降臨確定!! 🌈" : "🚨 10万バズ突破!! UR確定!! 🚨";
          }
        }, idx * 360);
      });

      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2250);
      return;

    } else if (type === "jikai") {
      // 9. 🎰 パチンコ風・次回予告演出
      var scJikai = document.getElementById("scene-jikai");
      var jTextEl = document.getElementById("jikai-main-text");
      var jBadgeEl = document.getElementById("jikai-sub-badge");

      scJikai.classList.add("active");
      jTextEl.innerText = "";
      jBadgeEl.style.opacity = "0";

      var topCard = (pulledCards && pulledCards.length > 0)
        ? pulledCards.slice().sort(function(a, b) {
            var rk = { N: 1, R: 2, SR: 3, UR: 4, GOD: 5, ADMIN: 6 };
            return (rk[b.rarity] || 0) - (rk[a.rarity] || 0);
          })[0]
        : null;

      var fullScript = isGod
        ? "次回、\n『" + (topCard ? topCard.name : "伝説のGOD降臨") + "』"
        : "次回、\n『" + (topCard ? topCard.name : "激アツUR覚醒") + "』";

      var charIdx = 0;
      var typeTimer = setInterval(function() {
        if (charIdx < fullScript.length) {
          jTextEl.innerText += fullScript.charAt(charIdx);
          if (charIdx % 2 === 0) PackSFX.jikaiDrum();
          charIdx++;
        } else {
          clearInterval(typeTimer);
        }
      }, 65);

      setTimeout(function() {
        clearInterval(typeTimer);
        jTextEl.innerText = fullScript;
        PackSFX.jikaiDon(isGod);
        overlay.classList.add("quake-anim");
        jBadgeEl.style.opacity = "1";
        jBadgeEl.style.color = isGod ? "#00ff88" : "#ffd32a";
        jBadgeEl.innerText = isGod ? "🌈 激熱・GOD降臨確定!! 🌈" : "🔥 激アツ・UR確定!! 🔥";
      }, 1350);

      setTimeout(function() {
        clearInterval(typeTimer);
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2400);
      return;

    } else if (type === "nurupo") {
      // 10. 🔨 ぬるぽ → ガッ！（文字打ち込み逆転）演出
      var scNurupo = document.getElementById("scene-nurupo");
      var p1 = document.getElementById("nurupo-phase1");
      var p2 = document.getElementById("nurupo-phase2");
      var nText = document.getElementById("nurupo-revive-text");

      scNurupo.classList.add("active");
      p1.style.display = "block";
      p2.style.display = "none";
      PackSFX.crashFake();

      setTimeout(function() {
        PackSFX.nurupoGatsu(isGod);
        overlay.classList.add("quake-anim");
        p1.style.display = "none";
        p2.style.display = "flex";
        nText.className = isGod ? "pachi-main-text god-text" : "pachi-main-text";
        nText.innerHTML = isGod
          ? "🌈 ハンマー直撃・GOD昇格!! 🌈"
          : "🚨 強制昇格!! UR確定!! 🚨";
      }, 850);

      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2250);
      return;
    }

    if (type === "pachinko") {
      // 1. 🚨 定番パチンコ・キュイン演出
      PackSFX.pachinkoKyuin(isGod);
      var sc = document.getElementById("scene-pachinko");
      var burst = document.getElementById("pachi-sunburst");
      var text = document.getElementById("pachi-main-text");
      sc.classList.add("active");
      overlay.classList.add("quake-anim");

      if (isGod) {
        burst.className = "pachi-sunburst god-mode";
        text.className = "pachi-main-text god-text";
        text.innerHTML = "🌈 脳汁確定!! 🌈<br>超激レア GOD 降臨!!";
      } else {
        burst.className = "pachi-sunburst";
        text.className = "pachi-main-text";
        text.innerHTML = "🚨 キュインキュイン!! 🚨<br>激アツ UR 確定!!";
      }

      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, isGod ? 2100 : 1700);

    } else if (type === "crash") {
      // 2. ⚡ 画面クラッシュ＆逆転復活演出
      var scCrash = document.getElementById("scene-crash");
      var crackSvg = document.getElementById("crash-crack-svg");
      var fakeBox = document.getElementById("crash-fake-box");
      var reviveBox = document.getElementById("crash-revive-box");
      var reviveText = document.getElementById("crash-revive-text");

      scCrash.className = "effect-scene crash-bg active";
      crackSvg.classList.remove("show");
      fakeBox.style.display = "block";
      reviveBox.style.display = "none";
      PackSFX.crashFake();

      setTimeout(function() {
        // 画面ひび割れ＆逆転！
        PackSFX.crashGlass();
        overlay.classList.add("quake-anim");
        scCrash.classList.add("revived");
        crackSvg.classList.add("show");
        fakeBox.style.display = "none";
        reviveBox.style.display = "flex";
        reviveText.className = isGod ? "pachi-main-text god-text" : "pachi-main-text";
        reviveText.innerHTML = isGod
          ? "バグ発生！限界突破！！<br>🌈 超神レア GOD 昇格!! 🌈"
          : "バグ発生！昇格！！<br>🚨 激アツ UR 逆転確定!! 🚨";
      }, 850);

      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2350);

    } else if (type === "slot") {
      // 3. 🎰 777 スロット大当たり演出
      var scSlot = document.getElementById("scene-slot");
      var r1 = document.getElementById("slot-reel-1");
      var r2 = document.getElementById("slot-reel-2");
      var r3 = document.getElementById("slot-reel-3");
      var banner = document.getElementById("slot-result-banner");
      var winSymbol = isGod ? "🌈" : "7";
      var dummyIcons = ["🍒", "🔔", "💎", "🔥", "7", "🌈"];

      scSlot.classList.add("active");
      [r1, r2, r3].forEach(function(r) {
        r.className = "slot-reel spinning";
      });
      banner.style.color = "#fff";
      banner.innerText = "リーチ！！狙え！！";

      var spinTimer = setInterval(function() {
        PackSFX.slotSpin();
        [r1, r2, r3].forEach(function(r) {
          if (r.classList.contains("spinning")) {
            r.innerText = dummyIcons[Math.floor(Math.random() * dummyIcons.length)];
          }
        });
      }, 75);

      setTimeout(function() {
        PackSFX.slotStop(0);
        r1.className = "slot-reel stopped-win";
        r1.innerText = winSymbol;
      }, 500);

      setTimeout(function() {
        PackSFX.slotStop(1);
        r2.className = "slot-reel stopped-win";
        r2.innerText = winSymbol;
        banner.style.color = "#ffd32a";
        banner.innerText = "⚡ 激アツ テンパイ！！ ⚡";
      }, 950);

      setTimeout(function() {
        clearInterval(spinTimer);
        PackSFX.slotStop(2);
        r3.className = "slot-reel stopped-win";
        r3.innerText = winSymbol;
        overlay.classList.add("quake-anim");
        banner.style.color = isGod ? "#00d2ff" : "#ff4757";
        banner.innerHTML = isGod ? "🌈 GOD揃い大当たり!! 🌈" : "🎰 777 FEVER!! UR確定!! 🎰";
      }, 1450);

      setTimeout(function() {
        clearInterval(spinTimer);
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2450);

    } else if (type === "trend") {
      // 4. 💻 ネットミーム風・大炎上トレンド1位演出
      var scTrend = document.getElementById("scene-trend");
      var danmakuLayer = document.getElementById("danmaku-layer");
      var hashtagEl = document.getElementById("trend-hashtag");
      var subtextEl = document.getElementById("trend-subtext");

      scTrend.classList.add("active");
      overlay.classList.add("quake-anim");
      danmakuLayer.innerHTML = "";
      PackSFX.trendBuzz();

      hashtagEl.innerText = isGod ? "#GOD降臨でサーバー爆発" : "#神引き脳汁大炎上";
      subtextEl.innerText = isGod
        ? "1,145,140件のポスト・伝説のGODレア出現に全SNSが騒然！！"
        : "114,514件のポスト・激アツUR引き当てでタイムラインが大炎上中！！";

      var words = isGod
        ? ["GOD降臨ｗｗｗ", "うおおおおお！！", "優勝すぎる", "脳汁ドバドバ", "神引きｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!", "草不可避", "運営やりすぎｗ", "伝説の瞬間"]
        : ["神引きｗｗｗ", "脳汁ヤバすぎ", "優勝！！", "草ｗｗｗｗｗ", "URｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!", "勝ち組確定", "強すぎて草", "大炎上トレンド1位"];
      var colors = ["#fff", "#ffd32a", "#00d2ff", "#ff4757", "#2ed573"];

      for (var d = 0; d < 24; d++) {
        var span = document.createElement("span");
        span.className = "danmaku-item";
        span.innerText = words[d % words.length];
        span.style.top = (5 + Math.random() * 88) + "%";
        span.style.fontSize = (1.0 + Math.random() * 1.1) + "rem";
        span.style.color = colors[d % colors.length];
        span.style.animationDuration = (1.1 + Math.random() * 0.9) + "s";
        span.style.animationDelay = (Math.random() * 0.6) + "s";
        danmakuLayer.appendChild(span);
      }

      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2100);

    } else if (type === "bigbang") {
      // 5. 🌌 宇宙ビッグバン・GOD降臨演出
      var scSpace = document.getElementById("scene-bigbang");
      var bhCore = document.getElementById("blackhole-core");
      var novaBurst = document.getElementById("supernova-burst");
      var bbText = document.getElementById("bigbang-main-text");

      scSpace.classList.add("active");
      bhCore.style.display = "block";
      novaBurst.style.display = "none";
      PackSFX.bigBangImplode();

      setTimeout(function() {
        PackSFX.bigBangBoom();
        bhCore.style.display = "none";
        novaBurst.style.display = "flex";
        overlay.classList.add("quake-anim");
        bbText.className = isGod ? "pachi-main-text god-text" : "pachi-main-text";
        bbText.innerHTML = isGod
          ? "🌌 BIG BANG!! 🌌<br>宇宙創造 GOD 降臨!!"
          : "💥 SUPERNOVA!! 💥<br>超新星爆発 UR 降臨!!";
      }, 1100);

      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2400);

    } else {
      // 6. 🌑 突発ブラックアウト（プチュン暗転）演出
      var scBlack = document.getElementById("scene-blackout");
      var puchunLine = document.getElementById("puchun-line");
      var revealBox = document.getElementById("blackout-reveal-box");
      var boText = document.getElementById("blackout-main-text");

      scBlack.classList.add("active");
      puchunLine.style.display = "block";
      revealBox.style.display = "none";
      PackSFX.puchunOff();

      // 暗転の静寂のあと、一気に光と文字が弾ける！
      setTimeout(function() {
        PackSFX.puchunFreeze();
        puchunLine.style.display = "none";
        revealBox.style.display = "flex";
        overlay.classList.add("quake-anim");
        boText.className = isGod ? "pachi-main-text god-text" : "pachi-main-text";
        boText.innerHTML = isGod
          ? "🌑 暗転フリーズ降臨!! 🌑<br>🌈 最高峰 GOD 確定!! 🌈"
          : "🌑 暗転からの衝撃!! 🌑<br>🚨 超激熱 UR 確定!! 🚨";
      }, 950);

      setTimeout(function() {
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none"; overlay.style.pointerEvents = "none";
        onComplete();
      }, 2350);
    }
  }

  function revealCardsSequence(data) {
    var resultArea = document.getElementById("pack-result-area");
    var stageGuide = document.getElementById("stage-guide");

    var flash = document.createElement("div");
    flash.className = "screen-flash rarity-" + data.maxRarity;
    document.body.appendChild(flash);
    setTimeout(function() { flash.remove(); }, 850);

    stageGuide.innerText = "✨ 獲得カード（タップで詳細） ✨";

    var totalCards = data.pulled.length;
    var stepDelay = totalCards > 5 ? 65 : 320;
    if (totalCards > 5) {
      stageGuide.innerText = "✨ 10連獲得カード（全50枚・タップで詳細） ✨";
    }

    for (var j = 0; j < totalCards; j++) {
      var back = document.createElement("div");
      back.className = "card-back-mystery";
      back.innerHTML = "❓<br><span style='font-size:0.75rem; color:#aaa;'>MEME</span>";
      resultArea.appendChild(back);
    }

    data.pulled.forEach(function(c, idx) {
      setTimeout(function() {
        if (totalCards <= 5 || c.rarity === "SR" || c.rarity === "UR" || c.rarity === "GOD" || idx % 5 === 0) {
          PackSFX.cardFlip(c.rarity);
        }
        var el = createCardElement(c, null, {});
        el.classList.add("card-revealed");
        if (resultArea.children[idx]) {
          resultArea.replaceChild(el, resultArea.children[idx]);
        }
        if (idx === totalCards - 1) {
          document.getElementById("stage-after-buttons").style.display = "flex";
        }
      }, 220 + idx * stepDelay);
    });
  }

  // ================= 複数デッキ編成システム =================
  function switchDeckSlot(slotIdx) {
    currentDeckSlot = slotIdx;
    var slotObj = userData.decks[slotIdx];
    editingDeckCards = slotObj.ids.slice();
    document.getElementById("deck-name-input").value = slotObj.name;
    renderDeckBuilder();
  }

  function renderDeckSlotTabs() {
    var tabsEl = document.getElementById("deck-slot-tabs");
    tabsEl.innerHTML = "";
    userData.decks.forEach(function(d, idx) {
      var btn = document.createElement("button");
      btn.className = "deck-slot-tab" + (idx === currentDeckSlot ? " active" : "");
      var count = (idx === currentDeckSlot) ? editingDeckCards.length : d.ids.length;
      btn.innerText = d.name + " (" + count + ")";
      btn.addEventListener("click", function() {
        switchDeckSlot(idx);
      });
      tabsEl.appendChild(btn);
    });
  }

  function renderDeckBuilder() {
    renderDeckSlotTabs();
    document.getElementById("deck-count-label").innerText = editingDeckCards.length;

    var deckListEl = document.getElementById("current-deck-list");
    deckListEl.innerHTML = "";
    editingDeckCards.forEach(function(cardId, index) {
      var card = ALL_CARDS.find(function(c) { return c.id === cardId; });
      if (!card) return;
      var chip = document.createElement("div");
      chip.className = "mini-chip";
      chip.innerHTML = '<span class="cost-badge" style="width:16px;height:16px;font-size:0.7rem;">' + card.cost + '</span> ' + card.icon + ' ' + card.name + ' ✕';
      chip.addEventListener("click", function() { editingDeckCards.splice(index, 1); renderDeckBuilder(); });
      chip.addEventListener("contextmenu", function(e) { e.preventDefault(); showCardDetail(card); });
      deckListEl.appendChild(chip);
    });

    var colListEl = document.getElementById("collection-list");
    colListEl.innerHTML = "";

    var kw = (document.getElementById("deck-search-input") ? document.getElementById("deck-search-input").value : "").trim().toLowerCase();
    var fType = document.getElementById("deck-filter-type") ? document.getElementById("deck-filter-type").value : "ALL";
    var fEra = document.getElementById("deck-filter-era") ? document.getElementById("deck-filter-era").value : "ALL";
    var fSort = document.getElementById("deck-filter-sort") ? document.getElementById("deck-filter-sort").value : "default";
    var activeRarityBtn = document.querySelector("#deck-rarity-chips .filter-chip.active");
    var fRarity = activeRarityBtn ? activeRarityBtn.getAttribute("data-rarity") : "ALL";
    var activeCostBtn = document.querySelector("#deck-cost-chips .filter-chip.active");
    var fCost = activeCostBtn ? activeCostBtn.getAttribute("data-cost") : "ALL";

    var filteredCards = ALL_CARDS.filter(function(card) {
      var owned = userData.collection[card.id] || 0;
      if (card.isAdminOnly && owned <= 0) return false;
      if (owned <= 0) return false;
      if (fType !== "ALL" && card.type !== fType) return false;
      if (fEra !== "ALL" && card.era !== fEra) return false;
      if (fRarity !== "ALL" && (card.rarity || "N") !== fRarity) return false;
      if (fCost !== "ALL") {
        if (fCost === "6+") {
          if (card.cost < 6) return false;
        } else {
          if (card.cost !== Number(fCost)) return false;
        }
      }
      if (kw) {
        var hay = ((card.name || "") + " " + (card.desc || "") + " " + (card.era || "")).toLowerCase();
        if (hay.indexOf(kw) === -1) return false;
      }
      return true;
    });

    var rarityRank = { ADMIN: 0, GOD: 1, UR: 2, SR: 3, R: 4, N: 5 };
    if (fSort === "cost-asc") {
      filteredCards.sort(function(a, b) { return a.cost - b.cost; });
    } else if (fSort === "cost-desc") {
      filteredCards.sort(function(a, b) { return b.cost - a.cost; });
    } else if (fSort === "rarity-desc") {
      filteredCards.sort(function(a, b) { return (rarityRank[a.rarity] || 9) - (rarityRank[b.rarity] || 9); });
    } else if (fSort === "atk-desc") {
      filteredCards.sort(function(a, b) { return (b.atk || -1) - (a.atk || -1); });
    }

    var countLabel = document.getElementById("deck-filter-count");
    if (countLabel) countLabel.innerText = "表示: " + filteredCards.length + "種";

    if (filteredCards.length === 0) {
      colListEl.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:20px;">条件に一致するカードがありません</div>';
    }

    filteredCards.forEach(function(card) {
      var owned = userData.collection[card.id] || 0;
      var inDeckCount = editingDeckCards.filter(function(id) { return id === card.id; }).length;
      var el = createCardElement(card, function() {
        if (editingDeckCards.length >= DECK_SIZE) { alert("デッキは" + DECK_SIZE + "枚までです！"); return; }
        if (inDeckCount >= 3 || inDeckCount >= owned) { alert("これ以上同じカードを入れられません（所持数または上限3枚）"); return; }
        editingDeckCards.push(card.id);
        renderDeckBuilder();
      }, {});
      var badge = document.createElement("div");
      badge.className = "owned-badge";
      badge.innerText = "デッキ:" + inDeckCount + " / 所持:" + owned;
      el.appendChild(badge);
      colListEl.appendChild(el);
    });
  }

  _on("btn-auto-deck", "click", function() {
    var available = [];
    Object.keys(userData.collection).forEach(function(id) {
      var count = Math.min(3, userData.collection[id]);
      for (var i = 0; i < count; i++) available.push(id);
    });
    available.sort(function() { return Math.random() - 0.5; });
    editingDeckCards = available.slice(0, DECK_SIZE);
    renderDeckBuilder();
  });


  // デッキ編成画面の絞り込みイベント
  _on("deck-search-input", "input", renderDeckBuilder);
  _on("deck-filter-type", "change", renderDeckBuilder);
  _on("deck-filter-era", "change", renderDeckBuilder);
  _on("deck-filter-sort", "change", renderDeckBuilder);
  _on("btn-reset-deck-filter", "click", function() {
    var sIn = document.getElementById("deck-search-input"); if (sIn) sIn.value = "";
    var tSel = document.getElementById("deck-filter-type"); if (tSel) tSel.value = "ALL";
    var eSel = document.getElementById("deck-filter-era"); if (eSel) eSel.value = "ALL";
    var oSel = document.getElementById("deck-filter-sort"); if (oSel) oSel.value = "default";
    document.querySelectorAll("#deck-rarity-chips .filter-chip").forEach(function(b) {
      b.classList.toggle("active", b.getAttribute("data-rarity") === "ALL");
    });
    document.querySelectorAll("#deck-cost-chips .filter-chip").forEach(function(b) {
      b.classList.toggle("active", b.getAttribute("data-cost") === "ALL");
    });
    renderDeckBuilder();
  });
  document.querySelectorAll("#deck-rarity-chips .filter-chip").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll("#deck-rarity-chips .filter-chip").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderDeckBuilder();
    });
  });
  document.querySelectorAll("#deck-cost-chips .filter-chip").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll("#deck-cost-chips .filter-chip").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderDeckBuilder();
    });
  });

  _on("btn-clear-deck", "click", function() {
    editingDeckCards = [];
    renderDeckBuilder();
  });

  _on("btn-save-deck", "click", function() {
    if (editingDeckCards.length !== DECK_SIZE) {
      alert("デッキはちょうど" + DECK_SIZE + "枚にしてください！（現在 " + editingDeckCards.length + " 枚）");
      return;
    }
    var customName = document.getElementById("deck-name-input").value.trim();
    if (!customName) customName = "マイデッキ " + (currentDeckSlot + 1);

    userData.decks[currentDeckSlot] = {
      name: customName,
      ids: editingDeckCards.slice()
    };
    addMissionStat("deckSaves", 1);
    saveUserData();
    renderDeckSlotTabs();
    alert("✅ 「" + customName + "」（" + DECK_SIZE + "枚）を保存しました！");
  });

  // ================= バトルシステム =================
  var state = {
    mode: "cpu", myRole: "p1", turn: 1, activeSide: "p1", isInputLocked: false, currentBoss: null,
    p1: { name: "プレイヤー1", label: "マイデッキ", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
    p2: { name: "CPU", label: "相手デッキ", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
    selectedAttackerIndex: null
  };
  var peer = null, conn = null, p1OnlineDeck = null, p2OnlineDeck = null, ROOM_PREFIX = "netmeme-tcg-v10-";
  var myQueueRef = null, randomHeartbeatTimer = null;

  var effectCtx = {
    state: state,
    drawCard: function(who) { return drawCard(who); },
    log: function(msg) { return log(msg); },
    dealDamageToMeme: function(meme, amount) { return dealDamageToMeme(meme, amount); },
    cleanupDeadMemes: function() { return cleanupDeadMemes(); }
  };

  function populateBattleDeckSelect() {
    var selectEl = document.getElementById("battle-deck-select");
    var prevVal = selectEl.value;
    selectEl.innerHTML = "";

    userData.decks.forEach(function(d, idx) {
      var opt = document.createElement("option");
      opt.value = "mydeck_" + idx;
      var statusText = (d.ids.length === DECK_SIZE) ? "40枚・準備OK" : (d.ids.length + "/40枚・未完成");
      opt.innerText = "【マイデッキ】" + d.name + "（" + statusText + "）";
      selectEl.appendChild(opt);
    });

    Object.keys(RENTAL_DECKS).forEach(function(key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.innerText = RENTAL_DECKS[key].label;
      selectEl.appendChild(opt);
    });

    if (prevVal && Array.from(selectEl.options).some(function(o) { return o.value === prevVal; })) {
      selectEl.value = prevVal;
    }


  }

  function getSelectedDeckCards(autoFallback, customSelectId) {
    var mainSel = document.getElementById("battle-deck-select");
    if (mainSel && mainSel.options.length === 0) {
      populateBattleDeckSelect();
    }
    var selectEl = (customSelectId ? document.getElementById(customSelectId) : null) || mainSel;
    if (selectEl && selectEl.options.length === 0) {
      populateBattleDeckSelect();
    }
    if (selectEl && mainSel && selectEl !== mainSel && selectEl.value) {
      mainSel.value = selectEl.value;
    }
    var choice = selectEl ? selectEl.value : "", ids = [], label = "";
    if (choice && choice.indexOf("mydeck_") === 0) {
      var slotIdx = parseInt(choice.replace("mydeck_", ""), 10);
      var targetDeck = userData.decks[slotIdx];
      if (!targetDeck || targetDeck.ids.length !== DECK_SIZE) {
        if (autoFallback) {
          var validDeck = userData.decks.find(function(d) { return d && d.ids && d.ids.length === DECK_SIZE; });
          if (validDeck) {
            ids = validDeck.ids.slice();
            label = validDeck.name;
          } else {
            var firstRentalKey = Object.keys(RENTAL_DECKS)[0];
            ids = RENTAL_DECKS[firstRentalKey].ids.slice();
            label = RENTAL_DECKS[firstRentalKey].label;
          }
        } else {
          alert("選択した「" + (targetDeck ? targetDeck.name : "マイデッキ") + "」が" + DECK_SIZE + "枚になっていません！デッキ編成で40枚揃えて保存するか、完成済みのデッキ・レンタルデッキを選んでください。");
          return null;
        }
      } else {
        ids = targetDeck.ids.slice();
        label = targetDeck.name;
      }
    } else if (choice && RENTAL_DECKS[choice]) {
      ids = RENTAL_DECKS[choice].ids.slice();
      label = RENTAL_DECKS[choice].label;
    } else {
      var validDeck2 = userData.decks.find(function(d) { return d && d.ids && d.ids.length === DECK_SIZE; });
      if (validDeck2) {
        ids = validDeck2.ids.slice();
        label = validDeck2.name;
      } else {
        var fallbackKey = Object.keys(RENTAL_DECKS)[0];
        ids = RENTAL_DECKS[fallbackKey].ids.slice();
        label = RENTAL_DECKS[fallbackKey].label;
      }
    }
    var cards = ids.map(function(id) {
      var found = ALL_CARDS.find(function(c) { return c.id === id; });
      return found ? JSON.parse(JSON.stringify(found)) : null;
    }).filter(function(c) { return c !== null; });
    cards.sort(function() { return Math.random() - 0.5; });
    return { cards: cards, label: label, playmat: userData.playmat || "default", titleId: userData.equippedTitle || "" };
  }

  function renderBossList() {
    var container = document.getElementById("boss-list-container");
    container.innerHTML = "";
    Object.keys(CPU_BOSSES).forEach(function(key) {
      var boss = CPU_BOSSES[key];
      var btn = document.createElement("button");
      btn.className = "boss-item-btn" + (key === "god_admin" ? " boss-god" : (key === "yaju_alliance" ? " boss-hard" : ""));
      btn.innerHTML =
        '<div class="boss-top-row">' +
          '<span class="boss-name">' + boss.name + '</span>' +
          '<span class="boss-diff">' + boss.difficulty + '</span>' +
        '</div>' +
        '<div style="font-size:0.78rem; color:#ddd;">' + boss.introQuote + '</div>' +
        (boss.passiveDesc ? '<div style="font-size:0.75rem; color:#00d2ff; font-weight:bold;">' + boss.passiveDesc + '</div>' : '') +
        '<div class="boss-sub-row">' +
          '<span>使用デッキ: ' + boss.deckLabel + '（初期HP: ' + boss.startHp + '）</span>' +
          '<span class="boss-reward-pill">🏆 勝利報酬: ' + boss.reward + ' バズP</span>' +
        '</div>';
      btn.addEventListener("click", function() {
        startBossMatch(boss);
      });
      container.appendChild(btn);
    });
  }

  function startBossMatch(boss) {
    var p1Deck = getSelectedDeckCards();
    if (!p1Deck) return;
    state.mode = "cpu";
    state.currentBoss = boss;

    var cpuCards = [];
    if (Array.isArray(boss.ids)) {
      cpuCards = boss.ids
        .map(function(id) {
          var found = ALL_CARDS.find(function(c) { return c.id === id; });
          return found ? JSON.parse(JSON.stringify(found)) : null;
        })
        .filter(Boolean)
        .sort(function() { return Math.random() - 0.5; });
    } else {
      var pool = [];
      ALL_CARDS.filter(function(c) { return c.rarity !== "GOD" && !c.isAdminOnly; }).forEach(function(c) { pool.push(c.id, c.id); });
      pool.sort(function() { return Math.random() - 0.5; });
      cpuCards = pool.slice(0, DECK_SIZE).map(function(id) {
        return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; })));
      });
    }

    startMatch(p1Deck, { label: boss.deckLabel, cards: cpuCards }, boss.name, boss.startHp, boss.introQuote);
  }

  _on("btn-mode-cpu", "click", function() {
    var p1Deck = getSelectedDeckCards(); if (!p1Deck) return;
    renderBossList();
    document.getElementById("step-mode").style.display = "none";
    document.getElementById("step-boss").style.display = "block";
  });

  _on("btn-mode-local", "click", function() {
    var p1Deck = getSelectedDeckCards(); if (!p1Deck) return;
    state.mode = "local"; state.currentBoss = null;
    var p2Cards = RENTAL_DECKS.rental_yaju.ids.map(function(id) { return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; }))); }).sort(function() { return Math.random() - 0.5; });
    startMatch(p1Deck, { label: "プレイヤー2デッキ", cards: p2Cards }, "プレイヤー2");
  });

  _on("btn-mode-online", "click", function() {
    var myDeck = getSelectedDeckCards(); if (!myDeck) return;
    state.mode = "online"; state.currentBoss = null; p1OnlineDeck = myDeck;
    document.getElementById("step-mode").style.display = "none";
    document.getElementById("step-online").style.display = "block";
    document.getElementById("random-matching-box").style.display = "none";
    document.getElementById("btn-random-match").disabled = false;
  });

  // ================= Firebase SDK連携・ランダムマッチ処理 =================
  function cancelRandomMatch() {
    clearInterval(randomHeartbeatTimer);
    randomHeartbeatTimer = null;
    if (myQueueRef) {
      myQueueRef.remove().catch(function() {});
      myQueueRef = null;
    }
    if (peer) {
      peer.destroy();
      peer = null;
    }
    document.getElementById("random-matching-box").style.display = "none";
    document.getElementById("btn-random-match").disabled = false;
  }

  _on("btn-cancel-random", "click", cancelRandomMatch);

  _on("btn-random-match", "click", function() {
    if (typeof firebase === "undefined") {
      alert("Firebase SDKの読み込みに失敗しています。ネットワーク接続を確認してください。");
      return;
    }

    document.getElementById("btn-random-match").disabled = true;
    document.getElementById("random-matching-box").style.display = "flex";
    document.getElementById("random-status-text").innerText = "🔍 ロビーを検索しています...";

    var myPeerId = ROOM_PREFIX + "rnd-" + Math.random().toString(36).substring(2, 10);
    peer = createPeerInstance(myPeerId);

    peer.on("error", function(err) {
      document.getElementById("random-status-text").innerText = "⚠️ 通信エラー: " + err.type;
    });

    peer.on("open", function() {
      var db = firebase.database();
      var queueRef = db.ref("match_queue");

      queueRef.once("value").then(function(snapshot) {
        var now = Date.now();
        var targetKey = null;
        var targetPeerId = null;

        snapshot.forEach(function(child) {
          var val = child.val();
          if (!val || !val.peerId || (now - val.timestamp > 60000)) {
            child.ref.remove().catch(function() {});
            return false;
          }
          if (!targetKey && val.peerId !== myPeerId) {
            targetKey = child.key;
            targetPeerId = val.peerId;
          }
        });

        if (targetKey && targetPeerId) {
          var candidateRef = queueRef.child(targetKey);
          candidateRef.transaction(function(currentData) {
            if (currentData && currentData.peerId === targetPeerId) {
              return null;
            }
            return;
          }, function(error, committed) {
            if (committed) {
              document.getElementById("random-status-text").innerText = "⚡ 対戦相手を発見！接続中...";
              conn = peer.connect(targetPeerId);
              conn.on("open", function() {
                state.myRole = "p2";
                setupConnectionHandlers();
                conn.send({ type: "SEND_DECK", deck: p1OnlineDeck, playerName: userData.playerName || DEFAULT_PLAYER_NAME });
              });
            } else {
              registerAsWaitingHost(queueRef, myPeerId);
            }
          });
        } else {
          registerAsWaitingHost(queueRef, myPeerId);
        }
      }).catch(function(err) {
        document.getElementById("random-status-text").innerText = "⚠️ サーバー接続エラー: " + err.message;
      });
    });
  });

  function registerAsWaitingHost(queueRef, myPeerId) {
    document.getElementById("random-status-text").innerText = "🔍 対戦相手を探しています...";
    myQueueRef = queueRef.push();
    myQueueRef.onDisconnect().remove();
    myQueueRef.set({
      peerId: myPeerId,
      timestamp: Date.now()
    });

    randomHeartbeatTimer = setInterval(function() {
      if (myQueueRef) {
        myQueueRef.update({ timestamp: Date.now() }).catch(function() {});
      }
    }, 15000);

    peer.on("connection", function(connection) {
      clearInterval(randomHeartbeatTimer);
      randomHeartbeatTimer = null;
      if (myQueueRef) {
        myQueueRef.onDisconnect().cancel();
        myQueueRef.remove().catch(function() {});
        myQueueRef = null;
      }
      conn = connection;
      state.myRole = "p1";
      setupConnectionHandlers();
    });
  }

  // ================= 従来の合言葉・招待リンク対戦処理（STUN対応P2P） =================
  var currentRoomCode = "";

  _on("btn-create-room", "click", function() {
    if (typeof Peer === "undefined") {
      alert("通信ライブラリの読み込みに失敗しています。ネット接続を確認して再読み込みしてください。");
      return;
    }
    var code = Math.floor(1000 + Math.random() * 9000).toString();
    currentRoomCode = code;
    document.getElementById("btn-create-room").disabled = true;
    document.getElementById("host-info").style.display = "block";
    document.getElementById("my-room-code").innerText = code;
    var hst = document.getElementById("host-status-text");
    if (hst) { hst.style.color = "#00d2ff"; hst.innerText = "🔄 待機ルームを開設中..."; }

    if (peer) { try { peer.destroy(); } catch (e) {} }
    peer = createPeerInstance(ROOM_PREFIX + code);
    peer.on("open", function() {
      if (hst) { hst.style.color = "#00ff88"; hst.innerText = "✅ ルーム開設完了！相手の参加を待っています..."; }
    });
    peer.on("connection", function(connection) {
      conn = connection;
      state.myRole = "p1";
      setupConnectionHandlers();
    });
    peer.on("error", function(err) {
      document.getElementById("btn-create-room").disabled = false;
      if (err && err.type === "unavailable-id") {
        document.getElementById("btn-create-room").click();
        return;
      }
      if (hst) { hst.style.color = "#ff6b6b"; hst.innerText = "⚠️ 通信エラーが発生しました。もう一度押してください。"; }
    });
  });

  _on("btn-copy-room-code", "click", function() {
    if (!currentRoomCode) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentRoomCode).then(function() {
        alert("合言葉「" + currentRoomCode + "」をコピーしました！");
      }).catch(function() { prompt("合言葉をコピーしてください:", currentRoomCode); });
    } else {
      prompt("合言葉をコピーしてください:", currentRoomCode);
    }
  });

  _on("btn-copy-invite-url", "click", function() {
    if (!currentRoomCode) return;
    var baseUrl = window.location.href.split("?")[0].split("#")[0];
    var inviteUrl = baseUrl + "?room=" + currentRoomCode;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteUrl).then(function() {
        alert("招待リンクをコピーしました！相手に送ると自動入室できます。");
      }).catch(function() { prompt("招待リンクをコピーしてください:", inviteUrl); });
    } else {
      prompt("招待リンクをコピーしてください:", inviteUrl);
    }
  });

  function joinRoomByCode(code) {
    code = (code || "").trim();
    var st = document.getElementById("join-status");
    if (code.length !== 4) {
      if (st) st.innerText = "4桁の番号を入力してください";
      return;
    }
    if (typeof Peer === "undefined") {
      if (st) st.innerText = "通信ライブラリの読み込みに失敗しています。";
      return;
    }
    if (!p1OnlineDeck) {
      p1OnlineDeck = getSelectedDeckCards(true) || getSelectedDeckCards(false);
    }
    if (st) { st.style.color = "#00d2ff"; st.innerText = "🔄 接続中..."; }
    if (peer) { try { peer.destroy(); } catch (e) {} }
    peer = createPeerInstance();
    peer.on("open", function() {
      conn = peer.connect(ROOM_PREFIX + code, { reliable: true });
      conn.on("open", function() {
        state.myRole = "p2";
        setupConnectionHandlers();
        conn.send({ type: "SEND_DECK", deck: p1OnlineDeck, playerName: userData.playerName || DEFAULT_PLAYER_NAME });
      });
    });
    peer.on("error", function() {
      if (st) { st.style.color = "#ff6b6b"; st.innerText = "⚠️ 部屋が見つかりません。合言葉を確認してください。"; }
    });
  }

  _on("btn-join-room", "click", function() {
    var code = document.getElementById("join-room-input").value.trim();
    joinRoomByCode(code);
  });

  function setupConnectionHandlers() {
    conn.on("data", function(data) {
      if (data.type === "DIRECT_FRIEND_INVITE") {
        showDirectFriendInviteModal(data.fromId, data.fromName, data.hostPeerId);
      } else if (data.type === "DIRECT_FRIEND_REQ") {
        saveLocalFriend(data.fromId, data.fromName, data.avatar, true);
        renderFriendModal();
        updateHomeFriendAvatars();
        alert("👥 「" + (data.fromName || data.fromId) + "」があなたをフレンド登録しました！");
      } else if (data.type === "LOBBY_HELLO") {
        if (data.playerName) friendLobbyState.oppName = data.playerName;
        updateFriendLobbyUI();
        if (friendLobbyState.myReady && friendLobbyState.myDeck) {
          try {
            conn.send({
              type: "FRIEND_READY",
              ready: true,
              deck: friendLobbyState.myDeck,
              playerName: userData.playerName || DEFAULT_PLAYER_NAME
            });
          } catch (e) {}
        }
      } else if (data.type === "FRIEND_READY") {
        handleFriendLobbyOpponentReady(data);
      } else if (data.type === "SEND_DECK" && state.myRole === "p1") {
        p2OnlineDeck = data.deck;
        startMatch(p1OnlineDeck, p2OnlineDeck, data.playerName || "プレイヤー2");
        conn.send({ type: "START_MATCH", p1: state.p1, p2: state.p2 });
      } else if (data.type === "START_MATCH") {
        state.p1 = data.p1; state.p2 = data.p2; state.turn = 1; state.activeSide = "p1";
        state.isInputLocked = (state.myRole !== "p1");
        addMissionStat("battles", 1);
        showScreen("game-screen"); log("対戦開始！"); showCutin("⚔️ 対戦開始！\n先攻（" + state.p1.name + "）のターン"); render();
      } else if (data.type === "SYNC_STATE") {
        state.p1 = data.p1; state.p2 = data.p2; state.turn = data.turn; state.activeSide = data.activeSide;
        state.isInputLocked = (state.activeSide !== state.myRole);
        if (data.logMsg) log(data.logMsg);
        if (data.godCard) showGodSummonCutin(data.godCard, data.godSummoner || "相手");
        else if (data.cutinMsg) showCutin(data.cutinMsg);
        checkGameOver(); render();
      }
    });
  }

  function sendSync(logMsg, cutinMsg, godCard, godSummoner) {
    if (state.mode === "online" && conn && conn.open) {
      conn.send({
        type: "SYNC_STATE",
        p1: state.p1,
        p2: state.p2,
        turn: state.turn,
        activeSide: state.activeSide,
        logMsg: logMsg || null,
        cutinMsg: cutinMsg || null,
        godCard: godCard || null,
        godSummoner: godSummoner || null
      });
    }
  }

  // ================= フレンド機能＆オンライン状態同期（Firebase＋ダイレクトP2P対応） =================
  var LOCAL_FRIENDS_KEY = "netmeme_local_friends_v1";
  var personalPeer = null;
  var friendListCache = {};
  var friendReqCache = {};

  function loadLocalFriends() {
    try {
      var raw = localStorage.getItem(LOCAL_FRIENDS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveLocalFriend(fid, name, avatar, isOnline) {
    if (!fid) return;
    var local = loadLocalFriends();
    local[fid] = {
      name: name || (local[fid] && local[fid].name) || ("プレイヤー#" + fid),
      avatar: avatar || (local[fid] && local[fid].avatar) || "👤",
      online: !!isOnline
    };
    try { localStorage.setItem(LOCAL_FRIENDS_KEY, JSON.stringify(local)); } catch (e) {}
    friendListCache[fid] = local[fid];
  }
  function removeLocalFriend(fid) {
    var local = loadLocalFriends();
    delete local[fid];
    try { localStorage.setItem(LOCAL_FRIENDS_KEY, JSON.stringify(local)); } catch (e) {}
    delete friendListCache[fid];
  }
  friendListCache = loadLocalFriends();

  function showDirectFriendInviteModal(fromId, fromName, hostPeerId) {
    var modal = document.getElementById("friend-invite-modal");
    var invText = document.getElementById("friend-invite-text");
    if (invText) invText.innerText = (fromName || fromId || "フレンド") + " から対戦の招待が届いています！";
    if (modal) { modal.style.display = "flex"; modal.style.pointerEvents = "auto"; }
    var accBtn = document.getElementById("btn-accept-invite");
    if (accBtn) {
      accBtn.onclick = function() {
        modal.style.display = "none";
        modal.style.pointerEvents = "none";
        joinFriendDuel(hostPeerId, fromName || fromId);
      };
    }
    var decBtn = document.getElementById("btn-decline-invite");
    if (decBtn) {
      decBtn.onclick = function() {
        modal.style.display = "none";
        modal.style.pointerEvents = "none";
      };
    }
  }

  function ensurePersonalStandbyPeer() {
    if (typeof Peer === "undefined" || !userData.playerId) return;
    var stEl = document.getElementById("p2p-standby-status");
    if (personalPeer && !personalPeer.destroyed) return;
    try {
      personalPeer = createPeerInstance(ROOM_PREFIX + "user-" + userData.playerId);
      if (!personalPeer) return;
      personalPeer.on("open", function() {
        if (stEl) { stEl.style.color = "#00ff88"; stEl.innerText = "📡 P2P待機中（ID: " + userData.playerId + "）"; }
      });
      personalPeer.on("connection", function(incomingConn) {
        incomingConn.on("data", function(data) {
          if (!data || !data.type) return;
          if (data.type === "DIRECT_FRIEND_INVITE") {
            showDirectFriendInviteModal(data.fromId, data.fromName, data.hostPeerId);
          } else if (data.type === "DIRECT_FRIEND_REQ") {
            saveLocalFriend(data.fromId, data.fromName, data.avatar, true);
            renderFriendModal();
            updateHomeFriendAvatars();
            try {
              incomingConn.send({
                type: "DIRECT_FRIEND_ACK",
                fromId: userData.playerId,
                fromName: userData.playerName || DEFAULT_PLAYER_NAME,
                avatar: userData.avatar || "👤"
              });
            } catch (e) {}
            alert("👥 「" + (data.fromName || data.fromId) + "」があなたをフレンド登録しました！");
          }
        });
      });
      personalPeer.on("error", function() {
        if (stEl) { stEl.style.color = "#ffd32a"; stEl.innerText = "📡 合言葉・招待URL対戦可"; }
      });
    } catch (e) {}
  }
  var selectedAvatarTemp = userData.avatar || "👤";

  document.querySelectorAll(".avatar-opt-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      selectedAvatarTemp = btn.getAttribute("data-avatar");
      document.querySelectorAll(".avatar-opt-btn").forEach(function(b) {
        b.style.borderColor = (b === btn) ? "#00d2ff" : "#444";
      });
    });
  });

  _on("btn-save-name", "click", function() {
    userData.avatar = selectedAvatarTemp;
    saveUserData();
    syncMyProfileToFirebase(true);
  });

  function copyPlayerId() {
    if (userData.playerId) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(userData.playerId).then(function() {
          alert("プレイヤーID「" + userData.playerId + "」をコピーしました！");
        }).catch(function() {
          prompt("プレイヤーIDをコピーしてください:", userData.playerId);
        });
      } else {
        prompt("プレイヤーIDをコピーしてください:", userData.playerId);
      }
    }
  }
  _on("btn-copy-my-id", "click", copyPlayerId);
  _on("btn-modal-copy-id", "click", copyPlayerId);

  function syncMyProfileToFirebase(isOnline) {
    if (typeof firebase === "undefined" || !userData.playerId) return;
    var db = firebase.database();
    var userRef = db.ref("users/" + userData.playerId);
    userRef.update({
      name: userData.playerName || DEFAULT_PLAYER_NAME,
      avatar: userData.avatar || "👤",
      online: !!isOnline,
      lastSeen: Date.now()
    });
    if (isOnline) {
      userRef.child("online").onDisconnect().set(false);
    }
  }

  function initFriendSystem() {
    friendListCache = loadLocalFriends();
    renderFriendModal();
    updateHomeFriendAvatars();
    if (typeof firebase === "undefined" || !userData.playerId) return;
    try {
      var db = firebase.database();
      var myId = userData.playerId;

      syncMyProfileToFirebase(true);

      db.ref("friend_requests/" + myId).on("value", function(snap) {
        friendReqCache = snap.val() || {};
        var count = Object.keys(friendReqCache).length;
        var badge = document.getElementById("home-friend-badge");
        if (badge) {
          badge.style.display = count > 0 ? "inline-block" : "none";
          badge.innerText = count;
        }
        renderFriendModal();
      }, function() {});

      db.ref("friends/" + myId).on("value", function(snap) {
        var rawFriends = snap.val() || {};
        var friendIds = Object.keys(rawFriends);
        friendListCache = loadLocalFriends();
        renderFriendModal();
        updateHomeFriendAvatars();
        friendIds.forEach(function(fid) {
          db.ref("users/" + fid).on("value", function(uSnap) {
            if (uSnap.exists()) {
              var u = uSnap.val();
              saveLocalFriend(fid, u.name, u.avatar, u.online);
              renderFriendModal();
              updateHomeFriendAvatars();
            }
          }, function() {});
        });
      }, function() {});

      db.ref("duel_invites/" + myId).on("value", function(snap) {
        var invite = snap.val();
        var modal = document.getElementById("friend-invite-modal");
        if (!invite || !invite.hostPeerId || (invite.timestamp && Date.now() - invite.timestamp > 180000)) {
          if (modal) { modal.style.display = "none"; modal.style.pointerEvents = "none"; }
          return;
        }
        showDirectFriendInviteModal(invite.fromId, invite.fromName, invite.hostPeerId);
      }, function() {});
    } catch (e) {}
  }

  function updateHomeFriendAvatars() {
    var box = document.getElementById("home-friend-avatars");
    if (!box) return;
    var fids = Object.keys(friendListCache);
    if (fids.length === 0) {
      box.innerHTML = '<div class="cyber-friend-node">➕</div>';
      return;
    }
    box.innerHTML = fids.slice(0, 4).map(function(fid) {
      var f = friendListCache[fid];
      var dotClass = f.online ? "cyber-friend-dot" : "cyber-friend-dot off";
      return '<div class="cyber-friend-node">' + (f.avatar || "👤") + '<span class="' + dotClass + '"></span></div>';
    }).join("");
  }

  function renderFriendModal() {
    var myIdEl = document.getElementById("modal-my-friend-id");
    if (myIdEl) myIdEl.innerText = userData.playerId;

    var reqSec = document.getElementById("friend-requests-section");
    var reqList = document.getElementById("friend-requests-list");
    var reqIds = Object.keys(friendReqCache);
    if (reqSec && reqList) {
      if (reqIds.length > 0) {
        reqSec.style.display = "block";
        reqList.innerHTML = reqIds.map(function(rid) {
          var r = friendReqCache[rid];
          return '<div style="display:flex; justify-content:space-between; align-items:center; background:#252525; padding:6px 10px; border-radius:8px;">' +
            '<span>' + (r.avatar || "👤") + ' <strong>' + (r.name || rid) + '</strong> <small style="color:#aaa;">(#' + rid + ')</small></span>' +
            '<div style="display:flex; gap:6px;">' +
              '<button class="primary-btn" style="padding:4px 8px; font-size:0.75rem;" onclick="window.__acceptFriend(\'' + rid + '\')">✅ 承認</button>' +
              '<button class="sub-btn" style="padding:4px 8px; font-size:0.75rem;" onclick="window.__rejectFriend(\'' + rid + '\')">✕</button>' +
            '</div></div>';
        }).join("");
      } else {
        reqSec.style.display = "none";
      }
    }

    var listEl = document.getElementById("friend-list-container");
    if (!listEl) return;
    var fids = Object.keys(friendListCache);
    if (fids.length === 0) {
      listEl.innerHTML = '<p style="color:#888; font-size:0.85rem; text-align:center; padding:12px;">まだフレンドがいません。IDを入力して申請しよう！</p>';
      return;
    }
    listEl.innerHTML = fids.map(function(fid) {
      var f = friendListCache[fid];
      var statusBadge = f.online
        ? '<span style="color:#00ff88; font-size:0.75rem;">● オンライン</span>'
        : '<span style="color:#888; font-size:0.75rem;">● オフライン</span>';
      return '<div style="display:flex; justify-content:space-between; align-items:center; background:#1c2430; border:1px solid #334155; padding:8px 10px; border-radius:8px;">' +
        '<div>' +
          '<div style="font-weight:bold;">' + (f.avatar || "👤") + ' ' + (f.name || fid) + ' <small style="color:#94a3b8;">#' + fid + '</small></div>' +
          statusBadge +
        '</div>' +
        '<div style="display:flex; gap:6px;">' +
          '<button class="primary-btn" style="padding:5px 10px; font-size:0.78rem;" onclick="window.__inviteFriendDuel(\'' + fid + '\')">⚔️ 対戦</button>' +
          '<button class="sub-btn" style="padding:5px 8px; font-size:0.75rem;" onclick="window.__removeFriend(\'' + fid + '\')">削除</button>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  window.__acceptFriend = function(targetId) {
    var req = friendReqCache[targetId] || {};
    saveLocalFriend(targetId, req.name || ("プレイヤー#" + targetId), req.avatar || "👤", true);
    delete friendReqCache[targetId];
    renderFriendModal();
    updateHomeFriendAvatars();
    try {
      if (typeof firebase !== "undefined") {
        var db = firebase.database();
        var myId = userData.playerId;
        db.ref("friends/" + myId + "/" + targetId).set(true).catch(function() {});
        db.ref("friends/" + targetId + "/" + myId).set(true).catch(function() {});
        db.ref("friend_requests/" + myId + "/" + targetId).remove().catch(function() {});
      }
    } catch (e) {}
  };

  window.__rejectFriend = function(targetId) {
    delete friendReqCache[targetId];
    renderFriendModal();
    try {
      if (typeof firebase !== "undefined") {
        firebase.database().ref("friend_requests/" + userData.playerId + "/" + targetId).remove().catch(function() {});
      }
    } catch (e) {}
  };

  window.__removeFriend = function(targetId) {
    if (!confirm("このフレンドを解除しますか？")) return;
    removeLocalFriend(targetId);
    renderFriendModal();
    updateHomeFriendAvatars();
    try {
      if (typeof firebase !== "undefined") {
        var db = firebase.database();
        var myId = userData.playerId;
        db.ref("friends/" + myId + "/" + targetId).remove().catch(function() {});
        db.ref("friends/" + targetId + "/" + myId).remove().catch(function() {});
      }
    } catch (e) {}
  };

  var friendLobbyState = {
    active: false,
    isHost: false,
    oppName: "フレンド",
    myReady: false,
    oppReady: false,
    myDeck: null,
    oppDeck: null
  };

  function openFriendDuelLobby(isHost, oppName) {
    friendLobbyState.active = true;
    friendLobbyState.isHost = isHost;
    friendLobbyState.oppName = oppName || "フレンド";
    friendLobbyState.myReady = false;
    friendLobbyState.oppReady = false;
    friendLobbyState.myDeck = null;
    friendLobbyState.oppDeck = null;

    var fm = document.getElementById("friend-modal");
    if (fm) { fm.style.display = "none"; fm.style.pointerEvents = "none"; }
    var im = document.getElementById("friend-invite-modal");
    if (im) { im.style.display = "none"; im.style.pointerEvents = "none"; }

    populateBattleDeckSelect();
    renderPlaymatSelectors();
    showScreen("setup-screen");
    document.getElementById("step-mode").style.display = "none";
    document.getElementById("step-boss").style.display = "none";
    document.getElementById("step-online").style.display = "none";
    var fl = document.getElementById("step-friend-lobby");
    if (fl) fl.style.display = "flex";

    updateFriendLobbyUI();
  }

  function updateFriendLobbyUI() {
    var myNameEl = document.getElementById("fl-my-name");
    var myStEl = document.getElementById("fl-my-status");
    var oppNameEl = document.getElementById("fl-opp-name");
    var oppStEl = document.getElementById("fl-opp-status");
    var readyBtn = document.getElementById("btn-friend-ready");
    var deckSel = document.getElementById("battle-deck-select");

    if (myNameEl) myNameEl.innerText = userData.playerName || DEFAULT_PLAYER_NAME;
    if (oppNameEl) oppNameEl.innerText = friendLobbyState.oppName;

    if (myStEl) {
      if (friendLobbyState.myReady) {
        myStEl.style.color = "#00ff88";
        myStEl.innerText = "✅ 準備完了！（" + (friendLobbyState.myDeck ? friendLobbyState.myDeck.label : "") + "）";
      } else {
        myStEl.style.color = "#ffd32a";
        myStEl.innerText = "⏳ デッキ選択中...";
      }
    }
    if (oppStEl) {
      if (friendLobbyState.oppReady) {
        oppStEl.style.color = "#00ff88";
        oppStEl.innerText = "✅ 準備完了！";
      } else {
        oppStEl.style.color = "#94a3b8";
        oppStEl.innerText = "⏳ デッキ選択中...";
      }
    }
    if (readyBtn) {
      if (friendLobbyState.myReady) {
        readyBtn.innerText = "🔄 デッキを変更する（準備解除）";
        readyBtn.style.background = "#475569";
      } else {
        readyBtn.innerText = "✅ 準備完了！";
        readyBtn.style.background = "";
      }
    }
    if (deckSel) {
      deckSel.disabled = friendLobbyState.myReady;
    }
  }

  function tryStartFriendLobbyMatch() {
    if (!friendLobbyState.active || !friendLobbyState.myReady || !friendLobbyState.oppReady) return;
    if (!conn || !conn.open) {
      alert("⚠️ 相手との接続が切れています。");
      return;
    }
    if (friendLobbyState.isHost && state.myRole === "p1") {
      friendLobbyState.active = false;
      var deckSel = document.getElementById("battle-deck-select");
      if (deckSel) deckSel.disabled = false;
      p1OnlineDeck = friendLobbyState.myDeck;
      p2OnlineDeck = friendLobbyState.oppDeck;
      startMatch(p1OnlineDeck, p2OnlineDeck, friendLobbyState.oppName || "プレイヤー2");
      conn.send({ type: "START_MATCH", p1: state.p1, p2: state.p2 });
    }
  }

  function handleFriendLobbyOpponentReady(data) {
    friendLobbyState.oppReady = !!data.ready;
    friendLobbyState.oppDeck = data.ready ? data.deck : null;
    if (data.playerName) friendLobbyState.oppName = data.playerName;
    updateFriendLobbyUI();
    tryStartFriendLobbyMatch();
  }

  _on("btn-friend-ready", "click", function() {
    if (!friendLobbyState.active) return;
    if (!conn || !conn.open) {
      alert("⚠️ 相手との通信接続を確立中です。数秒待ってからもう一度押してください。");
      return;
    }
    if (friendLobbyState.myReady) {
      friendLobbyState.myReady = false;
      friendLobbyState.myDeck = null;
      updateFriendLobbyUI();
      conn.send({
        type: "FRIEND_READY",
        ready: false,
        playerName: userData.playerName || DEFAULT_PLAYER_NAME
      });
      return;
    }
    var chosenDeck = getSelectedDeckCards(false);
    if (!chosenDeck || chosenDeck.cards.length !== DECK_SIZE) return;
    friendLobbyState.myReady = true;
    friendLobbyState.myDeck = chosenDeck;
    updateFriendLobbyUI();
    conn.send({
      type: "FRIEND_READY",
      ready: true,
      deck: chosenDeck,
      playerName: userData.playerName || DEFAULT_PLAYER_NAME
    });
    tryStartFriendLobbyMatch();
  });

  _on("btn-cancel-friend-lobby", "click", function() {
    friendLobbyState.active = false;
    var deckSel = document.getElementById("battle-deck-select");
    if (deckSel) deckSel.disabled = false;
    var fl = document.getElementById("step-friend-lobby");
    if (fl) fl.style.display = "none";
    document.getElementById("step-mode").style.display = "block";
    if (peer) { try { peer.destroy(); } catch (e) {} peer = null; conn = null; }
    showScreen("home-screen");
  });

  var activeHostDuelUrl = "";

  _on("btn-copy-friend-duel-link", "click", function() {
    if (!activeHostDuelUrl) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activeHostDuelUrl).then(function() {
        alert("フレンド対戦ロビーの直接招待URLをコピーしました！LINEやDiscordで相手に送ってください。");
      }).catch(function() { prompt("招待URLをコピーしてください:", activeHostDuelUrl); });
    } else {
      prompt("招待URLをコピーしてください:", activeHostDuelUrl);
    }
  });

  window.__inviteFriendDuel = function(targetId) {
    targetId = (targetId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    var msg = document.getElementById("friend-action-msg");
    var linkBox = document.getElementById("friend-direct-link-box");
    if (typeof Peer === "undefined") {
      if (msg) {
        msg.style.color = "#ff6b6b";
        msg.innerText = "⚠️ 通信ライブラリが読み込めていません。ネット接続を確認して再読み込みしてください。";
      }
      return;
    }
    if (msg) {
      msg.style.color = "#00d2ff";
      msg.innerText = "🔄 対戦ロビーを開設しています...";
    }
    state.mode = "online";
    var oppInfo = friendListCache[targetId];
    var oppName = (oppInfo && oppInfo.name) ? oppInfo.name : ("プレイヤー#" + targetId);
    var hostPeerId = ROOM_PREFIX + "frd-" + userData.playerId + "-" + Math.floor(1000 + Math.random() * 9000);
    var baseUrl = window.location.href.split("?")[0].split("#")[0];
    activeHostDuelUrl = baseUrl + "?duel=" + encodeURIComponent(hostPeerId) + "&fname=" + encodeURIComponent(userData.playerName || DEFAULT_PLAYER_NAME);
    if (linkBox) linkBox.style.display = "block";

    if (peer) { try { peer.destroy(); } catch (e) {} }
    peer = createPeerInstance(hostPeerId);

    var attachHostConnection = function(connection) {
      if (conn && conn.open && friendLobbyState.active) return;
      conn = connection;
      state.myRole = "p1";
      setupConnectionHandlers();
      openFriendDuelLobby(true, oppName);
    };

    peer.on("connection", attachHostConnection);

    peer.on("error", function(err) {
      if (msg) {
        msg.style.color = "#ff6b6b";
        msg.innerText = "⚠️ 通信エラー(" + (err && err.type ? err.type : "unknown") + ")：もう一度押してください";
      }
    });

    peer.on("open", function() {
      if (msg) {
        msg.style.color = "#00ff88";
        msg.innerText = "📡 対戦ロビー待機中！相手に招待を送信しています...";
      }
      ensurePersonalStandbyPeer();

      // 1) 相手の個人P2P待機ノードへ直接招待送信
      var tryDirectP2P = function() {
        var sender = (personalPeer && !personalPeer.destroyed) ? personalPeer : peer;
        if (!sender) return;
        try {
          var dc = sender.connect(ROOM_PREFIX + "user-" + targetId, { reliable: true });
          dc.on("open", function() {
            dc.send({
              type: "DIRECT_FRIEND_INVITE",
              fromId: userData.playerId,
              fromName: userData.playerName || DEFAULT_PLAYER_NAME,
              hostPeerId: hostPeerId
            });
            if (msg) {
              msg.style.color = "#00ff88";
              msg.innerText = "⚔️ 「" + oppName + "」に直接P2P招待が届きました！相手の承諾を待っています...";
            }
          });
        } catch (e) {}
      };
      tryDirectP2P();

      // 2) Firebase経由の招待通知（利用可能な場合）
      if (typeof firebase !== "undefined" && firebase.database) {
        try {
          firebase.database().ref("duel_invites/" + targetId).set({
            fromId: userData.playerId,
            fromName: userData.playerName || DEFAULT_PLAYER_NAME,
            hostPeerId: hostPeerId,
            timestamp: Date.now()
          }).then(function() {
            if (msg) {
              msg.style.color = "#00ff88";
              msg.innerText = "⚔️ 「" + oppName + "」に対戦招待を送信しました！相手の承諾を待っています...";
            }
          }).catch(function() {});
        } catch (fbErr) {}
      }
    });
  };

  function joinFriendDuel(hostPeerId, fromName) {
    if (typeof Peer === "undefined") {
      alert("通信ライブラリが読み込めていません。ネット接続を確認して再読み込みしてください。");
      return;
    }
    state.mode = "online";
    state.myRole = "p2";
    openFriendDuelLobby(false, fromName || "フレンド");

    var oppStEl = document.getElementById("fl-opp-status");
    if (oppStEl) {
      oppStEl.style.color = "#00d2ff";
      oppStEl.innerText = "🔄 通信接続中（P2P確立中）...";
    }

    if (peer) { try { peer.destroy(); } catch (e) {} }
    peer = createPeerInstance();

    var connected = false;
    var retryCount = 0;
    var connectTimer = setTimeout(function() {
      if (!connected && friendLobbyState.active) {
        var st = document.getElementById("fl-opp-status");
        if (st) {
          st.style.color = "#ff6b6b";
          st.innerText = "⚠️ 接続タイムアウト（相手が画面を閉じた可能性があります）";
        }
      }
    }, 20000);

    var finalizeGuestChannel = function(channel) {
      if (connected) return;
      connected = true;
      clearTimeout(connectTimer);
      conn = channel;
      setupConnectionHandlers();
      updateFriendLobbyUI();
      try {
        conn.send({
          type: "LOBBY_HELLO",
          playerName: userData.playerName || DEFAULT_PLAYER_NAME
        });
      } catch (e) {}
    };

    peer.on("connection", function(incoming) {
      incoming.on("open", function() { finalizeGuestChannel(incoming); });
      if (incoming.open) finalizeGuestChannel(incoming);
    });

    peer.on("error", function(err) {
      if (connected) return;
      if (retryCount < 2) {
        retryCount++;
        setTimeout(attemptDial, 1200);
        return;
      }
      clearTimeout(connectTimer);
      var st = document.getElementById("fl-opp-status");
      if (st) {
        st.style.color = "#ff6b6b";
        st.innerText = "⚠️ 接続エラー(" + (err && err.type ? err.type : "peer-unavailable") + ")";
      }
    });

    function attemptDial() {
      if (connected || !peer || peer.destroyed) return;
      var ch = peer.connect(hostPeerId, { reliable: true });
      ch.on("open", function() { finalizeGuestChannel(ch); });
      if (ch.open) finalizeGuestChannel(ch);
    }

    peer.on("open", function() {
      attemptDial();
    });
  }

  _on("btn-open-friends", "click", function() {
    ensurePersonalStandbyPeer();
    populateBattleDeckSelect();
    renderFriendModal();
    var m = document.getElementById("friend-modal");
    if (m) { m.style.display = "flex"; m.style.pointerEvents = "auto"; }
  });

  _on("btn-copy-friend-url", "click", function() {
    if (!userData.playerId) return;
    var baseUrl = window.location.href.split("?")[0].split("#")[0];
    var url = baseUrl + "?addfriend=" + userData.playerId + "&fname=" + encodeURIComponent(userData.playerName || DEFAULT_PLAYER_NAME);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        alert("フレンド招待URLをコピーしました！相手に送ると自動でフレンド追加されます。");
      }).catch(function() { prompt("フレンド招待URLをコピーしてください:", url); });
    } else {
      prompt("フレンド招待URLをコピーしてください:", url);
    }
  });

  _on("btn-direct-id-duel", "click", function() {
    ensurePersonalStandbyPeer();
    var input = document.getElementById("friend-id-input");
    var msg = document.getElementById("friend-action-msg");
    var targetId = (input.value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    input.value = targetId;
    if (targetId.length !== 6) {
      msg.style.color = "#ff6b6b";
      msg.innerText = "相手の6桁プレイヤーIDを入力してください。";
      return;
    }
    if (targetId === userData.playerId) {
      msg.style.color = "#ff6b6b";
      msg.innerText = "自分自身には対戦を送れません。";
      return;
    }
    saveLocalFriend(targetId, (friendListCache[targetId] && friendListCache[targetId].name) || ("プレイヤー#" + targetId), "👤", true);
    renderFriendModal();
    updateHomeFriendAvatars();
    window.__inviteFriendDuel(targetId);
  });

  _on("btn-close-friend", "click", function() {
    var m = document.getElementById("friend-modal");
    if (m) { m.style.display = "none"; m.style.pointerEvents = "none"; }
  });

  _on("btn-send-friend-req", "click", function() {
    var input = document.getElementById("friend-id-input");
    var msg = document.getElementById("friend-action-msg");
    var targetId = (input.value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    input.value = targetId;
    if (targetId.length !== 6) {
      msg.style.color = "#ff6b6b";
      msg.innerText = "6桁のプレイヤーIDを入力してください（現在 " + targetId.length + " 桁）。";
      return;
    }
    if (targetId === userData.playerId) {
      msg.style.color = "#ff6b6b";
      msg.innerText = "自分自身には申請できません。";
      return;
    }
    if (typeof firebase === "undefined" || !firebase.database) {
      msg.style.color = "#ff6b6b";
      msg.innerText = "⚠️ 通信サーバー（Firebase）に接続できていません。ネット接続を確認して再読み込みしてください。";
      return;
    }
    ensurePersonalStandbyPeer();
    saveLocalFriend(targetId, (friendListCache[targetId] && friendListCache[targetId].name) || ("プレイヤー#" + targetId), "👤", true);
    renderFriendModal();
    updateHomeFriendAvatars();
    input.value = "";
    msg.style.color = "#00ff88";
    msg.innerText = "✅ 「#" + targetId + "」をフレンド一覧に登録しました！右の「⚔️ 対戦」からすぐ招待できます。";

    if (personalPeer && !personalPeer.destroyed) {
      try {
        var rc = personalPeer.connect(ROOM_PREFIX + "user-" + targetId, { reliable: true });
        rc.on("open", function() {
          rc.send({
            type: "DIRECT_FRIEND_REQ",
            fromId: userData.playerId,
            fromName: userData.playerName || DEFAULT_PLAYER_NAME,
            avatar: userData.avatar || "👤"
          });
        });
        rc.on("data", function(ack) {
          if (ack && ack.type === "DIRECT_FRIEND_ACK") {
            saveLocalFriend(targetId, ack.fromName, ack.avatar, true);
            renderFriendModal();
            updateHomeFriendAvatars();
          }
        });
      } catch (e) {}
    }

    if (typeof firebase !== "undefined" && firebase.database) {
      try {
        syncMyProfileToFirebase(true);
        var db = firebase.database();
        db.ref("users/" + targetId).once("value").then(function(snap) {
          if (snap.exists()) {
            var u = snap.val();
            saveLocalFriend(targetId, u.name || targetId, u.avatar || "👤", u.online);
            renderFriendModal();
            updateHomeFriendAvatars();
          }
          return db.ref("friend_requests/" + targetId + "/" + userData.playerId).set({
            name: userData.playerName || DEFAULT_PLAYER_NAME,
            avatar: userData.avatar || "👤",
            timestamp: Date.now()
          });
        }).catch(function() {});
      } catch (e) {}
    }
  });

  initFriendSystem();
  renderPlaymatSelectors();

  function startMatch(p1Deck, p2Deck, p2Name, p2StartHp, bossQuote) {
    addMissionStat("battles", 1);
    var myName = userData.playerName || DEFAULT_PLAYER_NAME;
    state.turn = 1; state.activeSide = "p1";
    var p1Playmat = (p1Deck && p1Deck.playmat) ? p1Deck.playmat : (userData.playmat || "default");
    var p2Playmat = (p2Deck && p2Deck.playmat) ? p2Deck.playmat : "default";
    if (state.mode === "cpu" && state.currentBoss) {
      var bossMats = {
        normal_netizen: "2ch",
        niconico_elder: "niconico",
        enjo_streamer: "enjo",
        yaju_alliance: "chaos",
        rta_master: "grass",
        god_admin: "god"
      };
      p2Playmat = bossMats[state.currentBoss.id] || "chaos";
    }
    var p1TitleId = (p1Deck && p1Deck.titleId !== undefined) ? p1Deck.titleId : (userData.equippedTitle || "");
    var p2TitleId = (p2Deck && p2Deck.titleId !== undefined) ? p2Deck.titleId : "";
    if (state.mode === "cpu" && state.currentBoss && state.currentBoss.id === "god_admin") {
      p2TitleId = "admin";
    }
    state.p1 = { name: myName, label: p1Deck.label, playmat: p1Playmat, titleId: p1TitleId, hp: 20, maxGiga: 1, giga: 1, deck: p1Deck.cards, hand: [], field: [] };
    state.p2 = { name: p2Name, label: p2Deck.label, playmat: p2Playmat, titleId: p2TitleId, hp: p2StartHp || 20, maxGiga: 1, giga: 1, deck: p2Deck.cards, hand: [], field: [] };
    showScreen("game-screen"); document.getElementById("log").innerHTML = "";
    for (var i = 0; i < 4; i++) { drawCard("p1"); drawCard("p2"); }
    state.isInputLocked = (state.mode === "online" && state.myRole !== "p1");
    log("対戦開始！");
    if (state.currentBoss && state.currentBoss.id === "god_admin") {
      triggerBossPassive(state.currentBoss);
    }
    if (bossQuote) {
      log("👾 " + p2Name + "：" + bossQuote);
      showCutin("⚔️ VS " + p2Name + "\n" + bossQuote + "\n\n" + state.p1.name + "のターン", 1800);
    } else {
      showCutin("⚔️ 対戦開始！\n" + state.p1.name + "のターン");
    }
    render();
  }

  function getViewSelf() {
    if (state.mode === "online") return state[state.myRole] || state.p1;
    if (state.mode === "cpu") return state.p1;
    return state[state.activeSide] || state.p1;
  }
  function getViewOpp() {
    if (state.mode === "online") return state[state.myRole === "p1" ? "p2" : "p1"] || state.p2;
    if (state.mode === "cpu") return state.p2;
    return state[state.activeSide === "p1" ? "p2" : "p1"] || state.p2;
  }

  function drawCard(who) {
    var p = state[who];
    if (p.deck.length === 0) { p.hp -= 2; log(p.name + "はネタ切れでメンタルに2ダメージ！"); return; }
    if (p.hand.length < 7) p.hand.push(p.deck.pop());
  }
  function log(msg) {
    var logBox = document.getElementById("log");
    if (logBox) logBox.innerHTML = "<p>> " + msg + "</p>" + logBox.innerHTML;
    var latestEl = document.getElementById("log-latest-text");
    if (latestEl) latestEl.innerText = msg;
    if (typeof msg === "string") {
      if (msg.indexOf("GOD") !== -1 || msg.indexOf("降臨") !== -1) {
        spawnDanmaku("ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!! 神回ｗｗｗ", "#ffd32a");
      } else if (msg.indexOf("直接攻撃") !== -1 || msg.indexOf("ダメージ") !== -1) {
        spawnDanmaku("うおおおお！ 痛すぎｗｗｗ", "#ff6b81");
      } else if (msg.indexOf("合体") !== -1) {
        spawnDanmaku("合体きたあああ！ 88888888", "#00ff88");
      } else if (msg.indexOf("スペル") !== -1 || msg.indexOf("発動") !== -1) {
        spawnDanmaku("草ｗｗｗ 運営乙！ それな", "#00d2ff");
      }
    }
  }
  var cutinTimer = null;
  function showCutin(text, duration) {
    var overlay = document.getElementById("cutin-overlay");
    if (!overlay) return;
    document.getElementById("cutin-text").innerText = text;
    overlay.style.display = "flex"; overlay.style.pointerEvents = "auto";
    clearTimeout(cutinTimer);
    cutinTimer = setTimeout(function() { overlay.style.display = "none"; overlay.style.pointerEvents = "none"; }, duration || 1100);
  }

  function showGodSummonCutin(card, summonerName) {
    if (!card || (card.rarity !== "GOD" && card.rarity !== "ADMIN")) return;

    var overlay = document.getElementById("god-summon-overlay");
    var iconEl = document.getElementById("god-summon-icon");
    var nameEl = document.getElementById("god-summon-name");
    var quoteEl = document.getElementById("god-summon-quote");
    var statsEl = document.getElementById("god-summon-stats");

    var themes = {
      god_internet: {
        bg: "radial-gradient(circle at center, #1b1464 0%, #05020a 100%)",
        quote: "「" + summonerName + "の呼び声に応え、全ネット民の集合知が降臨する――！」"
      },
      god_moderator: {
        bg: "radial-gradient(circle at center, #5c0011 0%, #090205 100%)",
        quote: "「規約違反を確認。このタイムラインは" + summonerName + "の権限により粛清される――！」"
      },
      god_deepweb: {
        bg: "radial-gradient(circle at center, #2d004d 0%, #020005 100%)",
        quote: "「検索してはいけない領域の扉を、" + summonerName + "が開いてしまった――！」"
      },
      god_flag_master: {
        bg: "radial-gradient(circle at center, #6b3e00 0%, #120900 100%)",
        quote: "「勝ったな、ガハハ！――" + summonerName + "の完全勝利フラグが天高く立ち上がった！」"
      },
      god_tomarunja: {
        bg: "radial-gradient(circle at center, #4a0e17 0%, #0a0204 100%)",
        quote: "「" + summonerName + "、お前が止まらない限り…オレたちの道は続くんだからよ…止まるんじゃねぇぞ…！」"
      },
      admin_god_dev: {
        bg: "radial-gradient(circle at center, #004d29 0%, #020805 100%)",
        quote: "「【SYSTEM OVERRIDE】管理者" + summonerName + "の権限により、ゲームの仕様が書き換えられた――！」"
      },
      fused_anime_god: {
        bg: "radial-gradient(circle at center, #2c003e 0%, #020005 100%)",
        quote: "「逃げちゃダメだ…！もう一人のボクと心が一つになった時、闇のゲームが幕を開ける――！」"
      },
      god_rta_runner: {
        bg: "radial-gradient(circle at center, #004d40 0%, #020a08 100%)",
        quote: "「" + summonerName + "、タイマーストップ！これが人類最速のAny%世界新記録だ――！」"
      },
      god_final_boss: {
        bg: "radial-gradient(circle at center, #3b0764 0%, #05010a 100%)",
        quote: "「" + summonerName + "の呼び声で第2形態が覚醒する！――ここからが本当のラスボス戦だ！」"
      }
    };

    var theme = themes[card.id] || {
      bg: "radial-gradient(circle at center, #240046 0%, #05020a 100%)",
      quote: "「伝説のGODレアが" + summonerName + "の場に降臨した――！」"
    };

    overlay.style.background = theme.bg;
    iconEl.innerHTML = card.img ? '<img src="' + card.img + '" style="width:110px;height:110px;border-radius:16px;object-fit:cover;border:3px solid #ffd32a;">' : (card.icon || "🌌");
    nameEl.innerText = card.name;
    quoteEl.innerText = theme.quote;
    statsEl.innerText = "⚔️ ATK " + (card.atk + (card.isBuzz ? 1 : 0)) + "  /  ❤️ HP " + card.hp + "  /  ⏳ 鮮度 " + card.freshness;

    var flash = document.createElement("div");
    flash.className = "screen-flash rarity-GOD";
    document.body.appendChild(flash);
    setTimeout(function() { flash.remove(); }, 850);

    overlay.classList.add("quake-anim");
    overlay.style.display = "flex"; overlay.style.pointerEvents = "auto";

    setTimeout(function() {
      overlay.classList.remove("quake-anim");
      overlay.style.display = "none"; overlay.style.pointerEvents = "none";
    }, 2400);
  }

  function dealDamageToMeme(meme, amount) {
    if (amount <= 0) return;
    if (meme.shield) {
      meme.shield = false;
      BattleSFX.shieldBlock(); log("🛡️ 「" + meme.name + "」の無敵バリアがダメージを無効化した！");
      return;
    }
    meme.hp -= amount;
  }

  _on("btn-resume", "click", function() {
    var _m_pass_screen = document.getElementById("pass-screen"); if(_m_pass_screen) { _m_pass_screen.style.display = "none"; _m_pass_screen.style.pointerEvents = "none"; }
    log("--- " + getViewSelf().name + "のターン（ターン " + state.turn + "） ---"); render();
  });
  _on("direct-attack-btn", "click", directAttack);
  _on("end-turn-btn", "click", endTurn);


  // ================= ミーム合体・派生進化システム =================
  function findAvailableFusion(field, handCard) {
    if (!handCard || handCard.type !== "meme" || typeof FUSION_RECIPES === "undefined") return null;
    for (var i = 0; i < FUSION_RECIPES.length; i++) {
      var rec = FUSION_RECIPES[i];
      var m0 = rec.materials[0];
      var m1 = rec.materials[1];
      if (handCard.id === m0) {
        var idx1 = field.findIndex(function(f) { return f && f.id === m1; });
        if (idx1 !== -1) return { recipe: rec, fieldIndex: idx1, partnerName: field[idx1].name };
      }
      if (handCard.id === m1) {
        var idx0 = field.findIndex(function(f) { return f && f.id === m0; });
        if (idx0 !== -1) return { recipe: rec, fieldIndex: idx0, partnerName: field[idx0].name };
      }
    }
    return null;
  }

  function triggerFusionEffect(sideKey, fusedCard) {
    var self = state[sideKey];
    var opp = state[sideKey === "p1" ? "p2" : "p1"];
    if (!self || !opp) return;

    if (fusedCard.id === "fused_rta_any_percent") {
      opp.hp -= 3;
      drawCard(who); drawCard(who);
      log("🏅 【合体効果】Any%世界新記録！相手本体に3ダメージ＆2枚ドロー！");
    } else if (fusedCard.id === "fused_legendary_gamer") {
      fusedCard.shield = true;
      opp.field.forEach(function(m) { dealDamageToMeme(m, 2); });
      cleanupDeadMemes();
      log("🕹️ 【合体効果】伝説のレトロゲーマー神！無敵バリア付与＆相手ミーム全体に2ダメージ！");
    } else if (fusedCard.id === "fused_aa_legion") {
      opp.field.forEach(function(m) { dealDamageToMeme(m, 2); });
      cleanupDeadMemes();
      log("🏛️ 【合体効果】伝説のAA軍団！相手ミーム全体に2ダメージ！");
    } else if (fusedCard.id === "fused_yaruo_duo") {
      fusedCard.shield = true;
      drawCard(sideKey); drawCard(sideKey);
      log("🍻 【合体効果】やる夫＆やらない夫！無敵バリア付与＆2枚ドロー！");
    } else if (fusedCard.id === "fused_nico_festival") {
      opp.hp -= 3;
      self.field.forEach(function(m) { m.atk += 2; });
      log("🎪 【合体効果】ニコニコ組曲・超熱血祭！相手本体に3ダメ＆味方全体の攻撃+2！");
    } else if (fusedCard.id === "fused_cat_god") {
      drawCard(sideKey); drawCard(sideKey);
      self.giga = Math.min(self.maxGiga, self.giga + 2);
      log("😼 【合体効果】宇宙猫＆チピチャパ超バズ神！2枚ドロー＆ギガ2回復！");
    } else if (fusedCard.id === "fused_yaju_trio") {
      fusedCard.shield = true;
      drawCard(sideKey);
      log("🦁 【合体効果】真夏の夜の三銃士！無敵バリア付与＆1枚ドロー！");
    } else if (fusedCard.id === "fused_buff_doge") {
      fusedCard.shield = true;
      self.hp += 4;
      log("🐕 【合体効果】Swole Doge！無敵バリア付与＆メンタル4回復！");
    } else if (fusedCard.id === "fused_streamer_king") {
      self.giga = self.maxGiga;
      drawCard(sideKey); drawCard(sideKey);
      log("👑 【合体効果】伝説の配信王！ギガ全回復＆2枚ドロー！");
    } else if (fusedCard.id === "fused_x_trend") {
      opp.field.forEach(function(m) { dealDamageToMeme(m, 2); });
      opp.hp -= 2;
      cleanupDeadMemes();
      log("🔥 【合体効果】大炎上インプレ軍団！相手全体＆本体に2ダメージ！");
    } else if (fusedCard.id === "fused_anime_god") {
      fusedCard.shield = true;
      if (opp.field.length > 0) {
        var removed = opp.field.shift();
        log("⚡ 【神合体効果】闇のデュエリストが「" + removed.name + "」を闇へ葬った！");
      }
      opp.hp -= 3;
      log("⚡ 【神合体効果】無敵バリア付与＆相手本体に3ダメージ！");
    } else if (fusedCard.id === "fused_demon_lord_slime") {
      fusedCard.shield = true;
      drawCard(sideKey); drawCard(sideKey);
      log("🔮 【合体効果】魔王スライム覚醒！無敵バリア付与＆2枚ドロー！");
    }
  }

  var currentFusionFilter = "all";

  function getMaterialPresence(cardId) {
    var gs = document.getElementById("game-screen");
    if (!gs || gs.style.display === "none" || !state || !state.p1) return "none";
    var self = getViewSelf();
    if (!self) return "none";
    var inField = (self.field || []).some(function(c) { return c && c.id === cardId; });
    if (inField) return "field";
    var inHand = (self.hand || []).some(function(c) { return c && c.id === cardId; });
    if (inHand) return "hand";
    return "none";
  }

  function renderFusionRecipeCards() {
    var listEl = document.getElementById("fusion-recipe-list");
    if (!listEl || typeof FUSION_RECIPES === "undefined") return;
    listEl.innerHTML = "";

    var renderedCount = 0;
    FUSION_RECIPES.forEach(function(rec) {
      var c0 = ALL_CARDS.find(function(c) { return c.id === rec.materials[0]; }) || {
        id: rec.materials[0], name: rec.materials[0], type: "meme", rarity: "N", cost: 1, atk: 1, hp: 1, freshness: 3, icon: "❓", desc: ""
      };
      var c1 = ALL_CARDS.find(function(c) { return c.id === rec.materials[1]; }) || {
        id: rec.materials[1], name: rec.materials[1], type: "meme", rarity: "N", cost: 1, atk: 1, hp: 1, freshness: 3, icon: "❓", desc: ""
      };
      var res = rec.result;

      var p0 = getMaterialPresence(c0.id);
      var p1 = getMaterialPresence(c1.id);
      var isReady = (p0 === "field" && p1 === "hand") || (p1 === "field" && p0 === "hand") || (p0 === "hand" && p1 === "hand");
      var isReach = !isReady && (p0 !== "none" || p1 !== "none");

      if (currentFusionFilter === "ready" && !isReady && !isReach) return;
      if (currentFusionFilter === "high" && res.rarity !== "UR" && res.rarity !== "GOD") return;
      renderedCount++;

      var row = document.createElement("div");
      row.className = "fusion-visual-row" + (isReady ? " is-ready" : (isReach ? " is-reach" : ""));

      var statusHtml = isReady
        ? '<span class="fusion-status-tag ready">⚡ 合体可能！</span>'
        : (isReach ? '<span class="fusion-status-tag reach">🔥 リーチ中</span>' : '<span class="fusion-status-tag normal">' + (res.era || "全時代") + ' / ' + (res.rarity || "SR") + '</span>');

      var header = document.createElement("div");
      header.className = "fusion-row-header";
      header.innerHTML = '<span class="fusion-row-title">' + res.icon + ' ' + res.name + '</span>' + statusHtml;
      row.appendChild(header);

      var eq = document.createElement("div");
      eq.className = "fusion-cards-equation";

      function buildSlot(cardObj, presence, isResult) {
        var wrap = document.createElement("div");
        wrap.className = "fusion-slot-wrap";
        var badge = document.createElement("span");
        if (isResult) {
          badge.className = "fusion-slot-badge result-tag";
          badge.innerText = "✨ 進化後";
        } else if (presence === "field") {
          badge.className = "fusion-slot-badge in-field";
          badge.innerText = "🟦 場に配置済";
        } else if (presence === "hand") {
          badge.className = "fusion-slot-badge in-hand";
          badge.innerText = "🟩 手札にあり";
        } else {
          badge.className = "fusion-slot-badge";
          badge.innerText = "素材ミーム";
        }
        wrap.appendChild(badge);
        var cardEl = createCardElement(cardObj, function() { showCardDetail(cardObj); }, {
          playable: presence === "hand" || presence === "field" || isResult
        });
        wrap.appendChild(cardEl);
        return wrap;
      }

      eq.appendChild(buildSlot(c0, p0, false));

      var plus = document.createElement("div");
      plus.className = "fusion-op-symbol";
      plus.style.color = "#ffd32a";
      plus.innerText = "＋";
      eq.appendChild(plus);

      eq.appendChild(buildSlot(c1, p1, false));

      var arrow = document.createElement("div");
      arrow.className = "fusion-op-symbol";
      arrow.style.color = "#00ff88";
      arrow.innerText = "➔";
      eq.appendChild(arrow);

      eq.appendChild(buildSlot(res, "none", true));
      row.appendChild(eq);

      var eff = document.createElement("div");
      eff.className = "fusion-effect-banner";
      eff.innerText = res.desc;
      row.appendChild(eff);

      listEl.appendChild(row);
    });

    if (renderedCount === 0) {
      listEl.innerHTML = '<p style="text-align:center; color:#94a3b8; font-size:0.85rem; padding:18px;">該当する合体レシピがありません。上のタブで「📋 すべて」を選んでください。</p>';
    }
  }

  document.querySelectorAll(".fusion-tab-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      currentFusionFilter = btn.getAttribute("data-ffilter") || "all";
      document.querySelectorAll(".fusion-tab-btn").forEach(function(b) {
        b.classList.toggle("active", b === btn);
      });
      renderFusionRecipeCards();
    });
  });

  function openFusionGuideModal() {
    renderFusionRecipeCards();
    var _m_fusion_guide_modal = document.getElementById("fusion-guide-modal");
    if (_m_fusion_guide_modal) {
      _m_fusion_guide_modal.style.display = "flex";
      _m_fusion_guide_modal.style.pointerEvents = "auto";
    }
  }

  var btnHomeFusion = document.getElementById("btn-open-fusion-guide");
  if (btnHomeFusion) btnHomeFusion.addEventListener("click", openFusionGuideModal);
  var btnBattleFusion = document.getElementById("btn-battle-fusion-guide");
  if (btnBattleFusion) btnBattleFusion.addEventListener("click", openFusionGuideModal);
  var btnCloseFusion = document.getElementById("btn-close-fusion-guide");
  if (btnCloseFusion) btnCloseFusion.addEventListener("click", function() {
    var _m_fusion_guide_modal = document.getElementById("fusion-guide-modal"); if(_m_fusion_guide_modal) { _m_fusion_guide_modal.style.display = "none"; _m_fusion_guide_modal.style.pointerEvents = "none"; }
  });

  function playCard(handIndex) {
    if (state.isInputLocked) return;
    var self = getViewSelf(), card = self.hand[handIndex];
    if (!card) return;
    if (self.giga < card.cost) { log("⚠️ ギガ（コスト）が足りません！"); return; }
    var actionLog = "";
    var summonedGodCard = null;
    var isPlayerAction = (state.mode === "cpu" && state.activeSide === "p1") || (state.mode === "online" && state.activeSide === state.myRole) || (state.mode === "local");

    try {
      if (card.type === "meme") {
        var fusionMatch = findAvailableFusion(self.field, card);
        if (!fusionMatch && self.field.length >= 3) { log("⚠️ タイムラインがいっぱいです（最大3体）。"); return; }
        self.giga -= card.cost;
        self.hand.splice(handIndex, 1);
        if (isPlayerAction) addMissionStat("summons", 1);

        if (fusionMatch) {
          var fusedCard = JSON.parse(JSON.stringify(fusionMatch.recipe.result));
          fusedCard.canAttack = true;
          fusedCard.isBuzz = true;
          self.field.splice(fusionMatch.fieldIndex, 1, fusedCard);
          actionLog = "🧬 【合体進化】「" + fusionMatch.partnerName + "」＋「" + card.name + "」➔ 『" + fusedCard.name + "』が降臨！";
          log(actionLog);
          BattleSFX.fusion(); showCutin("🧬 ミーム合体進化！\n" + fusedCard.name, 1400);
          try {
            triggerFusionEffect(state.activeSide, fusedCard);
          } catch (fErr) {
            console.error("FusionEffect error:", fErr);
          }
          if (fusedCard.rarity === "GOD" || fusedCard.rarity === "ADMIN") {
            summonedGodCard = fusedCard;
            showGodSummonCutin(fusedCard, self.name);
          }
        } else {
          card.canAttack = true; card.isBuzz = true; self.field.push(card);
          BattleSFX.summon(card.rarity); actionLog = "📱 " + self.name + "が「" + card.name + "」を投稿！"; log(actionLog);
          try {
            window.CardEffects.triggerSummonEffect(effectCtx, state.activeSide, card);
          } catch (effErr) {
            console.error("SummonEffect error:", effErr);
          }
          if (card.rarity === "GOD" || card.rarity === "ADMIN") {
            summonedGodCard = card;
            showGodSummonCutin(card, self.name);
          }
        }
      } else if (card.type === "spell") {
        self.giga -= card.cost; self.hand.splice(handIndex, 1);
        self.usedSpellThisTurn = true;
        if (isPlayerAction) addMissionStat("spells", 1);
        BattleSFX.spell(); actionLog = "⚡ " + self.name + "が構文「" + card.name + "」を発動！"; log(actionLog);
        try {
          window.CardEffects.executeSpell(effectCtx, state.activeSide, card);
        } catch (spellErr) {
          console.error("SpellEffect error:", spellErr);
        }
      }
    } finally {
      state.selectedAttackerIndex = null;
      sendSync(actionLog, null, summonedGodCard, self.name);
      checkGameOver();
      render();
    }
  }

  function selectAttacker(index) {
    if (state.isInputLocked) return;
    var meme = getViewSelf().field[index];
    if (!meme.canAttack) { log("⚠️ このミームは既に行動済みです。"); return; }
    state.selectedAttackerIndex = (state.selectedAttackerIndex === index) ? null : index; if (state.selectedAttackerIndex !== null) BattleSFX.select();
    render();
  }

  function attackMeme(targetIndex) {
    if (state.isInputLocked || state.selectedAttackerIndex === null) return;
    var self = getViewSelf(), opp = getViewOpp();
    var attacker = self.field[state.selectedAttackerIndex], target = opp.field[targetIndex];
    dealDamageToMeme(target, attacker.atk + (attacker.isBuzz ? 1 : 0));
    dealDamageToMeme(attacker, target.atk + (target.isBuzz ? 1 : 0));
    attacker.canAttack = false;
    BattleSFX.attackMeme(); var actionLog = "⚔️ 「" + attacker.name + "」が「" + target.name + "」とレスバ！";
    log(actionLog); state.selectedAttackerIndex = null; cleanupDeadMemes(); sendSync(actionLog); checkGameOver(); render();
  }

  function directAttack() {
    if (state.isInputLocked || state.selectedAttackerIndex === null) return;
    var self = getViewSelf(), opp = getViewOpp(), attacker = self.field[state.selectedAttackerIndex];
    var atkPower = attacker.atk + (attacker.isBuzz ? 1 : 0);
    opp.hp -= atkPower; attacker.canAttack = false;
    BattleSFX.directAttack(); var actionLog = "🔥 「" + attacker.name + "」の直接攻撃！メンタルに " + atkPower + " ダメージ！";
    log(actionLog); state.selectedAttackerIndex = null; sendSync(actionLog); checkGameOver(); render();
  }

  function cleanupDeadMemes() {
    ["p1", "p2"].forEach(function(sideKey) {
      var p = state[sideKey];
      p.field.forEach(function(m) {
        if (m.hp <= 0 && m.id === "god_final_boss" && m.hasRevive) {
          m.hasRevive = false;
          m.name = "伝説のラスボス（真・最終形態）";
          m.atk = 6;
          m.hp = 6;
          m.freshness = 3;
          m.canAttack = false;
          log("👿 【第2形態突破】「まだだ…ここからが本当の絶望だ！」ラスボスがATK6/HP6で復活した！");
        }
      });
    });
    var hadDead = state.p1.field.some(function(m) { return m.hp <= 0; }) || state.p2.field.some(function(m) { return m.hp <= 0; });
    if (hadDead) BattleSFX.destroy();
    state.p1.field = state.p1.field.filter(function(m) { return m.hp > 0; });
    state.p2.field = state.p2.field.filter(function(m) { return m.hp > 0; });
  }

  function endTurn() {
    if (state.isInputLocked) return;
    BattleSFX.turnEnd();
    state.selectedAttackerIndex = null;
    if (state.mode === "cpu") {
      state.activeSide = "p2";
      state.isInputLocked = true;
      try {
        processTurnStart("p2");
      } catch (tsErr) {
        console.error("CPU turnStart err:", tsErr);
      }
      showCutin("👾 CPUのターン（思考中...）", 1000);
      render();
      setTimeout(function() {
        cpuAI();
      }, 1050);
    } else if (state.mode === "local") {
      state.activeSide = state.activeSide === "p1" ? "p2" : "p1";
      if (state.activeSide === "p1") state.turn++;
      processTurnStart(state.activeSide);
      document.getElementById("pass-title").innerText = "📱 " + getViewSelf().name + "のターンです";
      var _m_pass_screen = document.getElementById("pass-screen"); if(_m_pass_screen) { _m_pass_screen.style.display = "flex"; _m_pass_screen.style.pointerEvents = "auto"; }
    } else if (state.mode === "online") {
      state.activeSide = state.activeSide === "p1" ? "p2" : "p1";
      if (state.activeSide === "p1") state.turn++;
      state.isInputLocked = true; processTurnStart(state.activeSide);
      var nextName = state[state.activeSide].name;
      log("--- " + nextName + "のターン（ターン " + state.turn + "） ---");
      sendSync("--- " + nextName + "のターン ---", "⚔️ あなたのターンです！"); render();
    }
  }

  function processTurnStart(who) {
    var p = state[who];
    p.usedSpellThisTurn = false;
    if (p.maxGiga < 10) p.maxGiga++;
    p.giga = p.maxGiga; drawCard(who);
    p.field.forEach(function(m) { m.isBuzz = false; m.freshness--; m.canAttack = true; });
    p.field.filter(function(m) { return m.freshness <= 0; }).forEach(function(m) { log("⌛ 「" + m.name + "」は飽きられてオワコン化した..."); });
    p.field = p.field.filter(function(m) { return m.freshness > 0; });

    // ボスCPU専用ターン開始時パッシブ
    if (who === "p2" && state.mode === "cpu" && state.currentBoss) {
      triggerBossPassive(state.currentBoss);
    }
  }

  function triggerBossPassive(boss) {
    var cpu = state.p2;
    if (boss.id === "rta_master") {
      var gameTargets = cpu.field.filter(function(m) { return m.era === "ゲーム"; });
      if (gameTargets.length > 0) {
        var gt = gameTargets[Math.floor(Math.random() * gameTargets.length)];
        gt.atk += 1;
        gt.freshness += 1;
        log("⏱️ 【ボス特性】最速チャート：「" + gt.name + "」の攻撃力+1＆鮮度+1！");
      }
    } else if (boss.id === "retro_2ch") {
      var targets2ch = cpu.field.filter(function(m) { return m.era === "2ch"; });
      if (targets2ch.length > 0) {
        var picked = targets2ch[Math.floor(Math.random() * targets2ch.length)];
        picked.freshness += 1;
        log("👾 【ボス特性：深夜の勢い】「" + picked.name + "」の鮮度が+1された！");
      }
    } else if (boss.id === "reiwa_fire") {
      if (Math.random() < 0.5) {
        state.p1.hp -= 1;
        log("👾 【ボス特性：トレンド入り】通知スパムであなたのメンタルに1ダメージ！");
      }
    } else if (boss.id === "yaju_alliance") {
      if (cpu.field.length >= 2) {
        var buffTarget = cpu.field[Math.floor(Math.random() * cpu.field.length)];
        buffTarget.atk += 1;
        log("👾 【ボス特性：迫真の威圧】「" + buffTarget.name + "」の攻撃力が+1された！");
      }
    } else if (boss.id === "god_admin") {
      // ① 場に空きがあれば自動BOT（インプレゾンビ）展開
      if (cpu.field.length < 3) {
        var zombieTpl = ALL_CARDS.find(function(c) { return c.id === "zombie"; });
        if (zombieTpl) {
          var bot = JSON.parse(JSON.stringify(zombieTpl));
          bot.canAttack = true;
          bot.isBuzz = false;
          cpu.field.push(bot);
          log("🛠️ 【運営権限：自動BOT展開】「インプレゾンビ」がタイムラインに湧いた！");
        }
      }
      // ② ターン4以降、手札が3枚以下なら1枚追加ドロー
      if (state.turn >= 4 && cpu.hand.length <= 3) {
        drawCard("p2");
        log("🛠️ 【運営権限：不正ドロー】運営が手札を1枚補充した！");
      }
      // ③ ターン5に1度だけサーバー増強（最大ギガ+1）
      if (state.turn === 5 && !cpu.adminBoosted) {
        cpu.adminBoosted = true;
        if (cpu.maxGiga < 10) {
          cpu.maxGiga++;
          cpu.giga = cpu.maxGiga;
        }
        log("🛠️ 【運営権限：サーバー増強】最大ギガが加速した！");
      }
    }
  }

  function cpuAI() {
    var cpu = state.p2, actions = [];
    try {
      for (var i = cpu.hand.length - 1; i >= 0; i--) {
        var card = cpu.hand[i];
        if (!card) continue;
        if (card.cost <= cpu.giga) {
          if (card.type === "meme") {
            var cpuFusion = findAvailableFusion(cpu.field, card);
            if (cpuFusion || cpu.field.length < 3) {
              cpu.giga -= card.cost; cpu.hand.splice(i, 1);
              if (cpuFusion) {
                var cpuFused = JSON.parse(JSON.stringify(cpuFusion.recipe.result));
                cpuFused.isBuzz = true;
                cpuFused.canAttack = true;
                cpu.field.splice(cpuFusion.fieldIndex, 1, cpuFused);
                actions.push("【合体】" + cpuFused.name + "に進化");
                log("🧬👾 CPUが合体進化！『" + cpuFused.name + "』を降臨させた！");
                try { triggerFusionEffect("p2", cpuFused); } catch (fe) { console.error(fe); }
                if (cpuFused.rarity === "GOD" || cpuFused.rarity === "ADMIN") {
                  showGodSummonCutin(cpuFused, cpu.name);
                }
              } else {
                card.isBuzz = true; cpu.field.push(card);
                actions.push("「" + card.name + "」を召喚"); log("👾 CPUが「" + card.name + "」を召喚！");
                try {
                  window.CardEffects.triggerSummonEffect(effectCtx, "p2", card);
                } catch (e1) { console.error("CPU summon err:", e1); }
                if (card.rarity === "GOD" || card.rarity === "ADMIN") {
                  showGodSummonCutin(card, cpu.name);
                }
              }
            }
          } else if (card.type === "spell") {
            cpu.giga -= card.cost; cpu.hand.splice(i, 1);
            cpu.usedSpellThisTurn = true;
            actions.push("「" + card.name + "」を発動"); log("👾 CPUが「" + card.name + "」を発動！");
            try {
              window.CardEffects.executeSpell(effectCtx, "p2", card);
            } catch (e2) { console.error("CPU spell err:", e2); }
          }
        }
      }
      var attackers = cpu.field.slice();
      attackers.forEach(function(m) {
        if (!m || m.hp <= 0) return;
        var power = m.atk + (m.isBuzz ? 1 : 0);
        if (state.p1.field.length > 0) {
          var target = state.p1.field[0];
          if (target) {
            dealDamageToMeme(target, power);
            dealDamageToMeme(m, target.atk + (target.isBuzz ? 1 : 0));
            actions.push("「" + m.name + "」で攻撃");
            log("👾 CPUの「" + m.name + "」が「" + target.name + "」を攻撃！");
            cleanupDeadMemes();
          }
        } else {
          state.p1.hp -= power;
          actions.push("「" + m.name + "」で直接攻撃");
          log("👾 CPUの「" + m.name + "」が直接攻撃！メンタルに " + power + " ダメージ！");
        }
      });
    } catch (cpuErr) {
      console.error("cpuAI error:", cpuErr);
    }

    var cutinEl = document.getElementById("cutin-overlay");
    if (cutinEl) cutinEl.style.display = "none";

    if (checkGameOver()) {
      state.isInputLocked = false;
      render();
      return;
    }
    state.turn++;
    state.activeSide = "p1";
    state.isInputLocked = false;
    processTurnStart("p1");
    var summary = actions.length > 0 ? "CPUは " + actions.join(" → ") + "！\n" : "CPUは何もしなかった。\n";
    showCutin(summary + "🧑 " + state.p1.name + "のターン（ターン " + state.turn + "）", 1400);
    log("--- " + state.p1.name + "のターン（ターン " + state.turn + "） ---");
    render();
  }

  function checkGameOver() {
    var didPlayerWin = (state.mode === "online" && state.myRole === "p2") ? (state.p1.hp <= 0) : (state.p2.hp <= 0);
    var didPlayerLose = (state.mode === "online" && state.myRole === "p2") ? (state.p2.hp <= 0) : (state.p1.hp <= 0);

    if (state.p2.hp <= 0) {
      if (didPlayerWin) { addMissionStat("wins", 1); BattleSFX.win(); } else { BattleSFX.lose(); }
      var boss = (state.mode === "cpu" && state.currentBoss) ? state.currentBoss : null;
      var winReward = boss ? boss.reward : 300;
      var quoteLine = (boss && boss.winQuote) ? "\n\n" + boss.name + "：" + boss.winQuote : "";
      userData.points += winReward; saveUserData();
      setTimeout(function() {
        alert("🎉 " + state.p1.name + "の勝利！報酬として " + winReward + " バズP を獲得しました！" + quoteLine);
        showScreen("home-screen");
      }, 200);
      return true;
    }
    if (state.p1.hp <= 0) {
      if (didPlayerWin) addMissionStat("wins", 1);
      var reward = didPlayerLose ? 100 : 300;
      userData.points += reward; saveUserData();
      var msg = didPlayerLose
        ? "💀 " + state.p2.name + "の勝利... 参加賞として 100 バズP を獲得しました。"
        : "🎉 " + state.p2.name + "の勝利！報酬として 300 バズP を獲得しました！";
      setTimeout(function() { alert(msg); showScreen("home-screen"); }, 200);
      return true;
    }
    return false;
  }

  function updateGuideBanner() {
    var banner = document.getElementById("guide-banner"), self = getViewSelf(), opp = getViewOpp();
    if (state.isInputLocked) { banner.innerText = state.mode === "online" ? "⏳ " + opp.name + "のターンです...（長押しで詳細）" : "⏳ CPUのターンです..."; banner.style.borderColor = "#ff6b6b"; return; }
    banner.style.borderColor = "#00d2ff";
    if (state.selectedAttackerIndex !== null) {
      var attacker = self.field[state.selectedAttackerIndex];
      banner.innerText = opp.field.length > 0 ? "🎯 「" + attacker.name + "」で攻撃！赤く点滅している相手のミームをタップしよう" : "🔥 相手の場が空です！「💥 相手本体に直接攻撃」ボタンを押そう！";
      return;
    }
    var canFuseAny = self.hand.some(function(c) { return c.cost <= self.giga && !!findAvailableFusion(self.field, c); });
    var canPlayAny = self.hand.some(function(c) { return c.cost <= self.giga; }), canAttackAny = self.field.some(function(m) { return m.canAttack; });
    if (canFuseAny) { banner.innerText = "🧬 合体チャンス！緑金に光る手札をタップして合体進化させよう！"; return; }
    if (canPlayAny && canAttackAny) banner.innerText = "💡 " + self.name + "のターン：手札を出すか、場のミームで攻撃！（長押しで詳細）";
    else if (canPlayAny) banner.innerText = "💡 " + self.name + "のターン：手札の緑枠カードをタップして投稿しよう！";
    else if (canAttackAny) banner.innerText = "⚔️ 場の緑枠ミームをタップして攻撃しよう！";
    else banner.innerText = "✅ できる行動がありません。「⏭️ ターン終了」を押そう！";
  }

  var danmakuEnabled = true;

  function renderGigaAntenna(containerId, current, max) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var total = Math.max(1, Math.min(10, max || 1));
    var html = "";
    for (var i = 1; i <= total; i++) {
      var h = 5 + Math.round((i / total) * 9);
      var cls = i <= current ? "giga-bar active" : "giga-bar";
      html += '<span class="' + cls + '" style="height:' + h + 'px;"></span>';
    }
    el.innerHTML = html;
  }

  function updateHpBarFill(fillId, hp, maxHp) {
    var el = document.getElementById(fillId);
    if (!el) return;
    var cap = Math.max(20, maxHp || 20);
    var pct = Math.max(0, Math.min(100, Math.round((hp / cap) * 100)));
    el.style.width = pct + "%";
    if (hp <= 6) el.classList.add("low-hp"); else el.classList.remove("low-hp");
  }

  function spawnDanmaku(text, color) {
    if (!danmakuEnabled) return;
    var layer = document.getElementById("danmaku-layer");
    if (!layer) return;
    var item = document.createElement("div");
    item.className = "danmaku-item";
    item.innerText = text;
    item.style.top = (8 + Math.floor(Math.random() * 72)) + "%";
    if (color) item.style.color = color;
    layer.appendChild(item);
    setTimeout(function() {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, 4300);
  }

  function spawnDamagePopup(targetSide, amount, isHeal) {
    var layer = document.getElementById("damage-popup-layer");
    if (!layer) return;
    var pop = document.createElement("div");
    pop.className = "damage-popup-num" + (isHeal ? " heal" : "");
    pop.innerText = (isHeal ? "+" : "-") + Math.abs(amount);
    pop.style.left = (32 + Math.floor(Math.random() * 36)) + "%";
    pop.style.top = (targetSide === "opp" ? "24%" : "74%");
    layer.appendChild(pop);
    setTimeout(function() {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 1000);
  }

  _on("btn-danmaku-toggle", "click", function() {
    danmakuEnabled = !danmakuEnabled;
    var btn = document.getElementById("btn-danmaku-toggle");
    if (btn) {
      btn.innerText = danmakuEnabled ? "💬 弾幕ON" : "💬 弾幕OFF";
      btn.style.opacity = danmakuEnabled ? "1" : "0.55";
    }
  });

  _on("log-ticker-bar", "click", function() {
    var box = document.getElementById("log");
    var icon = document.getElementById("log-expand-icon");
    if (!box) return;
    var isOpen = box.classList.contains("log-drawer-expanded");
    if (isOpen) {
      box.classList.remove("log-drawer-expanded");
      box.classList.add("log-drawer-collapsed");
      if (icon) icon.innerText = "▲ 履歴";
    } else {
      box.classList.remove("log-drawer-collapsed");
      box.classList.add("log-drawer-expanded");
      if (icon) icon.innerText = "▼ 閉じる";
    }
  });

  var prevOppHp = null;
  var prevSelfHp = null;

  function render() {
    var self = getViewSelf(), opp = getViewOpp();
    if (prevOppHp !== null && opp.hp !== prevOppHp) {
      spawnDamagePopup("opp", opp.hp - prevOppHp, opp.hp > prevOppHp);
    }
    if (prevSelfHp !== null && self.hp !== prevSelfHp) {
      spawnDamagePopup("self", self.hp - prevSelfHp, self.hp > prevSelfHp);
    }
    prevOppHp = opp.hp;
    prevSelfHp = self.hp;

    document.getElementById("opp-title").innerHTML = renderTitleBadgeHtml(opp.titleId) + " 👾 " + opp.name + "（" + opp.label + "）";
    document.getElementById("opp-hp").innerText = opp.hp;
    updateHpBarFill("opp-hp-fill", opp.hp, 20);
    document.getElementById("opp-giga").innerText = opp.giga + "/" + opp.maxGiga;
    renderGigaAntenna("opp-giga-bars", opp.giga, opp.maxGiga);

    var oppHandCount = opp.hand ? opp.hand.length : 0;
    var oppHandEl = document.getElementById("opp-hand-count");
    if (oppHandEl) oppHandEl.innerText = "手札 " + oppHandCount + "枚";
    var oppHandIcons = document.getElementById("opp-hand-icons");
    if (oppHandIcons) {
      var iconsHtml = "";
      for (var h = 0; h < Math.min(7, oppHandCount); h++) {
        iconsHtml += '<span class="mini-card-back"></span>';
      }
      oppHandIcons.innerHTML = iconsHtml;
    }
    document.getElementById("opp-deck-count").innerText = "山札 " + opp.deck.length;

    document.getElementById("self-title").innerHTML = renderTitleBadgeHtml(self.titleId !== undefined ? self.titleId : userData.equippedTitle) + " 🧑 " + self.name + "（" + self.label + "）";
    document.getElementById("self-hp").innerText = self.hp;
    updateHpBarFill("self-hp-fill", self.hp, 20);
    document.getElementById("self-giga").innerText = self.giga + "/" + self.maxGiga;
    renderGigaAntenna("self-giga-bars", self.giga, self.maxGiga);
    document.getElementById("self-deck-count").innerText = "山札 " + self.deck.length;
    updateGuideBanner();

    var canDirect = !state.isInputLocked && state.selectedAttackerIndex !== null && opp.field.length === 0;
    var directBtn = document.getElementById("direct-attack-btn");
    directBtn.disabled = !canDirect;
    if (canDirect) directBtn.classList.add("ready"); else directBtn.classList.remove("ready");
    document.getElementById("end-turn-btn").disabled = state.isInputLocked;

    var oppFieldEl = document.getElementById("opp-field");
    var oppTheme = getPlaymatTheme(opp.playmat || "default");
    oppFieldEl.className = "field-area " + oppTheme.oppClass;
    oppFieldEl.innerHTML = '<span class="field-playmat-badge">相手マット: ' + oppTheme.name + '</span>' +
      (opp.field.length === 0 ? '<span class="empty-msg">相手の場にミームはいません</span>' : "");
    opp.field.forEach(function(c, idx) {
      if (!c) return;
      try {
        var action = (!state.isInputLocked && state.selectedAttackerIndex !== null)
          ? function() { attackMeme(idx); }
          : null;
        oppFieldEl.appendChild(createCardElement(c, action, { isTarget: !state.isInputLocked && state.selectedAttackerIndex !== null }));
      } catch (e) { console.error("oppField render err:", e); }
    });

    var selfFieldEl = document.getElementById("self-field");
    var selfTheme = getPlaymatTheme(self.playmat || userData.playmat || "default");
    selfFieldEl.className = "field-area " + selfTheme.selfClass;
    selfFieldEl.innerHTML = '<span class="field-playmat-badge">自分マット: ' + selfTheme.name + '</span>' +
      (self.field.length === 0 ? '<span class="empty-msg">自分の場にミームはいません</span>' : "");
    self.field.forEach(function(c, idx) {
      if (!c) return;
      try {
        selfFieldEl.appendChild(createCardElement(c, function() { selectAttacker(idx); }, { isSelected: state.selectedAttackerIndex === idx, canAttack: !state.isInputLocked && c.canAttack }));
      } catch (e) { console.error("selfField render err:", e); }
    });

    var handEl = document.getElementById("self-hand");
    handEl.innerHTML = "";
    self.hand.forEach(function(c, idx) {
      if (!c) return;
      try {
        var canFuse = !state.isInputLocked && c.cost <= self.giga && !!findAvailableFusion(self.field, c);
        var playable = !state.isInputLocked && c.cost <= self.giga && (c.type === "spell" || self.field.length < 3 || canFuse);
        handEl.appendChild(createCardElement(c, function() { playCard(idx); }, { playable: playable, unplayable: !playable, fusionReady: canFuse }));
      } catch (e) { console.error("hand render err:", e); }
    });
  }

  function createCardElement(card, onClick, flags) {
    flags = flags || {};
    var div = document.createElement("div");
    var classes = ["card", "rarity-" + (card.rarity || "N")];
    if (card.type === "spell") classes.push("spell");
    if (flags.isSelected) classes.push("selected");
    if (flags.canAttack) classes.push("can-attack");
    if (flags.isTarget) classes.push("targetable");
    if (flags.playable) classes.push("playable");
    if (flags.unplayable) classes.push("unplayable");
    if (flags.fusionReady) classes.push("fusion-ready");
    if (userData && Array.isArray(userData.holoCards) && userData.holoCards.indexOf(card.id) !== -1) classes.push("holo-foil");
    div.className = classes.join(" ");

    if (typeof onClick === "function") {
      var pressTimer = null;
      var longPressed = false;
      var startX = 0, startY = 0;

      var startPress = function(x, y) {
        longPressed = false;
        startX = x;
        startY = y;
        clearTimeout(pressTimer);
        pressTimer = setTimeout(function() {
          longPressed = true;
          showCardDetail(card);
        }, 420);
      };

      var cancelPress = function() {
        clearTimeout(pressTimer);
      };

      div.addEventListener("touchstart", function(e) {
        if (e.touches && e.touches[0]) startPress(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      div.addEventListener("touchmove", function(e) {
        if (e.touches && e.touches[0]) {
          if (Math.abs(e.touches[0].clientX - startX) > 10 || Math.abs(e.touches[0].clientY - startY) > 10) {
            cancelPress();
          }
        }
      }, { passive: true });
      div.addEventListener("touchend", cancelPress);

      div.addEventListener("mousedown", function(e) {
        if (e.button === 0) startPress(e.clientX, e.clientY);
      });
      div.addEventListener("mousemove", function(e) {
        if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) cancelPress();
      });
      div.addEventListener("mouseup", cancelPress);
      div.addEventListener("mouseleave", cancelPress);

      div.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        cancelPress();
        showCardDetail(card);
      });

      div.addEventListener("click", function(e) {
        if (longPressed) {
          e.preventDefault();
          e.stopPropagation();
          longPressed = false;
          return;
        }
        onClick(e);
      });
    } else {
      div.addEventListener("click", function() {
        showCardDetail(card);
      });
    }

    var displayAtk = card.atk + (card.isBuzz ? 1 : 0);
    var buzzBadge = flags.fusionReady ? '<div class="fusion-badge">🧬合体可能！</div>' : (card.isBuzz ? '<div class="buzz-badge">🔥バズ中(+1)</div>' : "");
    var shieldBadge = card.shield ? '<div class="shield-badge">🛡️無敵</div>' : "";
    var artHtml = card.img ? '<img src="' + card.img + '" alt="' + card.name + '">' : card.icon;
    var statsHtml = card.type === "meme"
      ? '<div class="card-stats"><span>⚔️' + displayAtk + '</span><span>⏳鮮度:' + card.freshness + '</span><span>❤️' + card.hp + '</span></div>'
      : '<div class="card-stats" style="justify-content:center; color:#ffd32a;">【構文 / スペル】</div>';

    div.innerHTML = buzzBadge + shieldBadge +
      '<div class="card-header"><span class="cost-badge">' + card.cost + '</span><span class="rarity-tag">' + (card.rarity || "N") + '</span><span class="era-tag">' + card.era + '</span></div>' +
      '<div class="card-title">' + card.name + '</div>' +
      '<div class="card-art">' + artHtml + '</div>' +
      '<div class="card-desc">' + card.desc + '</div>' +
      '<span class="detail-zoom-hint">🔍</span>' + statsHtml;
    return div;
  }


  // ================= 全モーダル共通・強制クローズハンドラ (v1.8.8) =================
  (function setupGlobalModalCloser() {
    function hideModalById(id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.display = "none";
        el.style.pointerEvents = "none";
      }
      if (id === "news-modal" && typeof APP_VERSION !== "undefined") {
        try { localStorage.setItem("netmeme_tcg_seen_ver_v1", APP_VERSION); } catch(e) {}
        var badge = document.getElementById("news-unread-badge");
        if (badge) badge.style.display = "none";
      }
    }
    var closeBtnMap = {
      "btn-close-news": "news-modal",
      "btn-confirm-news": "news-modal",
      "btn-close-fusion-guide": "fusion-guide-modal",
      "btn-close-card-detail": "card-detail-modal",
      "btn-close-pack-list": "pack-list-modal",
      "btn-close-admin": "admin-modal",
      "btn-close-ur-reward": "ur-reward-modal",
      "btn-cancel-name": "name-edit-modal"
    };
    document.addEventListener("click", function(e) {
      var target = e.target;
      if (!target) return;
      // ボタンまたはボタン内の子要素クリック判定
      var btn = target.closest ? target.closest("button") : target;
      if (btn && btn.id && closeBtnMap[btn.id]) {
        e.preventDefault();
        e.stopPropagation();
        hideModalById(closeBtnMap[btn.id]);
        return;
      }
      // オーバーレイの暗い背景自体をタップした場合も閉じる
      if (target.classList && target.classList.contains("overlay-screen") && target.id && target.id !== "pass-screen") {
        hideModalById(target.id);
      }
    }, true);
  })();


  // ================= iPadOS Chrome タッチ反応確実化パッチ (v1.8.8) =================
  (function ensureReliableTouchTap() {
    var touchStartX = 0, touchStartY = 0, touchStartTime = 0, touchTarget = null;
    document.addEventListener("touchstart", function(e) {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        touchTarget = e.target;
      }
    }, { passive: true });
    document.addEventListener("touchend", function(e) {
      if (!touchTarget) return;
      var t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      if (!t) return;
      var dx = Math.abs(t.clientX - touchStartX);
      var dy = Math.abs(t.clientY - touchStartY);
      var dt = Date.now() - touchStartTime;
      // スクロールではなくタップ（移動12px以内・500ms以内）の場合、標準clickが発火しなければ補完
      if (dx < 12 && dy < 12 && dt < 500) {
        var clickable = touchTarget.closest ? touchTarget.closest("button, .menu-btn, .primary-btn, .back-btn, .sub-btn, .action-btn, .admin-btn, .player-name-badge, .currency-box, .pack-tab-btn, .deck-slot-tab, .mode-card, .card, .secondary-btn") : null;
        if (clickable && !clickable.disabled) {
          clickable.dataset.lastTouchTap = String(Date.now());
          setTimeout(function() {
            if (clickable && Number(clickable.dataset.lastClicked || 0) < Number(clickable.dataset.lastTouchTap || 0)) {
              clickable.click();
            }
          }, 60);
        }
      }
      touchTarget = null;
    }, { passive: true });
    document.addEventListener("click", function(e) {
      var clickable = e.target && e.target.closest ? e.target.closest("button, .menu-btn, .primary-btn, .back-btn, .sub-btn, .action-btn, .admin-btn, .player-name-badge, .currency-box, .pack-tab-btn, .deck-slot-tab, .mode-card, .card, .secondary-btn") : null;
      if (clickable) {
        clickable.dataset.lastClicked = String(Date.now());
      }
    }, true);
  })();

  // ================= 起動時タッチ遮断防止・強制クリーンアップ =================
  (function ensureCleanInteractiveBoot() {
    var overlays = [
      "pachinko-overlay", "god-summon-overlay", "news-modal", "name-edit-modal",
      "friend-modal", "friend-invite-modal",
      "card-detail-modal", "ur-reward-modal", "admin-modal", "pack-list-modal",
      "fusion-guide-modal", "cutin-overlay", "pass-screen"
    ];
    try {
      updateHomeFriendAvatars();
      var qStr = window.location.search || "";
      var mFriend = qStr.match(/[?&]addfriend=([A-Za-z0-9]{6})/);
      if (mFriend && mFriend[1].toUpperCase() !== userData.playerId) {
        var fidParam = mFriend[1].toUpperCase();
        var mFname = qStr.match(/[?&]fname=([^&]+)/);
        var fnameParam = mFname ? decodeURIComponent(mFname[1]) : ("プレイヤー#" + fidParam);
        saveLocalFriend(fidParam, fnameParam, "👤", true);
        updateHomeFriendAvatars();
      }
      var mDuel = qStr.match(/[?&]duel=([^&]+)/);
      if (mDuel) {
        var hostIdParam = decodeURIComponent(mDuel[1]);
        var mDname = qStr.match(/[?&]fname=([^&]+)/);
        var dnameParam = mDname ? decodeURIComponent(mDname[1]) : "フレンド";
        setTimeout(function() {
          joinFriendDuel(hostIdParam, dnameParam);
        }, 450);
      }
      var mRoom = qStr.match(/[?&]room=([0-9]{4})/);
      if (mRoom) {
        setTimeout(function() {
          state.mode = "online";
          populateBattleDeckSelect();
          p1OnlineDeck = getSelectedDeckCards(true) || getSelectedDeckCards(false);
          showScreen("setup-screen");
          document.getElementById("step-mode").style.display = "none";
          document.getElementById("step-online").style.display = "block";
          var inp = document.getElementById("join-room-input");
          if (inp) inp.value = mRoom[1];
          joinRoomByCode(mRoom[1]);
        }, 400);
      }
    } catch (qErr) {}
    overlays.forEach(function(oid) {
      var el = document.getElementById(oid);
      if (el) {
        // 未読お知らせが自動表示されている場合を除き全て閉じる
        if (oid === "news-modal" && el.style.display === "flex") {
          el.style.pointerEvents = "auto";
          return;
        }
        el.style.display = "none";
        el.style.pointerEvents = "none";
      }
    });
    var home = document.getElementById("home-screen");
    if (home && home.style.display === "none") {
      home.style.display = "block";
    }
  })();

})();
