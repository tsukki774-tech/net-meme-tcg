document.addEventListener("DOMContentLoaded", function() {
  var SAVE_KEY = "netmeme_tcg_save_v2";
  var DECK_SIZE = 40;
  var userData = loadUserData();

  function loadUserData() {
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    var defaultDeck = [
      "mona","mona","mona","giko","giko","giko","yaruo","yaruo","yaruo","numai","numai","numai","kusa","kusa","kusa",
      "neko","neko","neko","chiikawa","chiikawa","chiikawa","ronpa","ronpa","ojisan","ojisan",
      "kmr","kmr","kmr","mur","mur","mur","tono","tono","kirinuki","kirinuki","kirinuki","zombie","zombie","zombie","kagiaka"
    ];
    return {
      points: 1500,
      collection: {
        mona: 3, giko: 3, yaruo: 3, numai: 3, kusa: 3,
        neko: 3, chiikawa: 3, ronpa: 2, ojisan: 2,
        kmr: 3, mur: 3, tono: 2, kirinuki: 3, zombie: 3, kagiaka: 2
      },
      myDeck: defaultDeck
    };
  }

  function saveUserData() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(userData));
    updatePointsUI();
  }

  function updatePointsUI() {
    document.getElementById("user-points").innerText = userData.points;
  }
  updatePointsUI();

  var screens = ["home-screen", "pack-screen", "deck-screen", "setup-screen", "game-screen"];
  function showScreen(id) {
    for (var i = 0; i < screens.length; i++) {
      var s = screens[i];
      document.getElementById(s).style.display = (s === id) ? (id === "game-screen" ? "flex" : "block") : "none";
    }
  }

  document.getElementById("nav-battle").addEventListener("click", function() {
    document.getElementById("step-mode").style.display = "block";
    document.getElementById("step-online").style.display = "none";
    showScreen("setup-screen");
  });
  document.getElementById("nav-pack").addEventListener("click", function() {
    document.getElementById("pack-result-area").innerHTML = "";
    showScreen("pack-screen");
  });
  document.getElementById("nav-deck").addEventListener("click", function() {
    renderDeckBuilder();
    showScreen("deck-screen");
  });

  document.getElementById("back-from-pack").addEventListener("click", function() { showScreen("home-screen"); });
  document.getElementById("back-from-deck").addEventListener("click", function() { showScreen("home-screen"); });
  document.getElementById("back-from-setup").addEventListener("click", function() { showScreen("home-screen"); });

  document.getElementById("btn-open-pack").addEventListener("click", openPack);

  function openPack() {
    if (userData.points < 100) {
      alert("バズPが足りません！CPU戦に勝利してポイントを貯めよう！");
      return;
    }
    var btn = document.getElementById("btn-open-pack");
    btn.disabled = true;
    userData.points -= 100;

    var resultArea = document.getElementById("pack-result-area");
    resultArea.innerHTML = "";

    var poolN = ALL_CARDS.filter(function(c) { return c.rarity === "N"; });
    var poolR = ALL_CARDS.filter(function(c) { return c.rarity === "R"; });
    var poolSR = ALL_CARDS.filter(function(c) { return c.rarity === "SR"; });
    var poolUR = ALL_CARDS.filter(function(c) { return c.rarity === "UR"; });

    var pulled = [];
    var hasSR = false;
    var hasUR = false;

    for (var i = 0; i < 5; i++) {
      var rand = Math.random() * 100;
      var pool = poolN;
      if (i === 4) {
        if (rand < 8) pool = poolUR;
        else if (rand < 35) pool = poolSR;
        else pool = poolR;
      } else {
        if (rand < 3) pool = poolUR;
        else if (rand < 15) pool = poolSR;
        else if (rand < 45) pool = poolR;
      }
      var card = pool[Math.floor(Math.random() * pool.length)];
      if (card.rarity === "SR") hasSR = true;
      if (card.rarity === "UR") hasUR = true;
      pulled.push(card);
      userData.collection[card.id] = (userData.collection[card.id] || 0) + 1;
    }

    saveUserData();

    var packBox = document.querySelector(".pack-box-visual");
    packBox.classList.remove("pack-opening-anim", "pack-glow-SR", "pack-glow-UR");
    void packBox.offsetWidth;
    packBox.classList.add("pack-opening-anim");
    if (hasUR) packBox.classList.add("pack-glow-UR");
    else if (hasSR) packBox.classList.add("pack-glow-SR");

    setTimeout(function() {
      packBox.classList.remove("pack-opening-anim", "pack-glow-SR", "pack-glow-UR");

      var flash = document.createElement("div");
      flash.className = "screen-flash";
      document.body.appendChild(flash);
      setTimeout(function() { flash.remove(); }, 650);

      for (var j = 0; j < 5; j++) {
        var back = document.createElement("div");
        back.className = "card-back-mystery";
        back.innerHTML = "❓<br><span style='font-size:0.75rem; color:#aaa;'>MEME</span>";
        resultArea.appendChild(back);
      }

      pulled.forEach(function(c, idx) {
        setTimeout(function() {
          var el = createCardElement(c, function() {}, {});
          el.classList.add("card-revealed");
          resultArea.replaceChild(el, resultArea.children[idx]);

          if (idx === pulled.length - 1) {
            btn.disabled = false;
          }
        }, 300 + idx * 350);
      });
    }, 900);
  }

  function renderDeckBuilder() {
    document.getElementById("deck-count-label").innerText = userData.myDeck.length;

    var deckListEl = document.getElementById("current-deck-list");
    deckListEl.innerHTML = "";
    userData.myDeck.forEach(function(cardId, index) {
      var card = ALL_CARDS.find(function(c) { return c.id === cardId; });
      if (!card) return;
      var chip = document.createElement("div");
      chip.className = "mini-chip";
      chip.innerHTML = '<span class="cost-badge" style="width:16px;height:16px;font-size:0.7rem;">' + card.cost + '</span> ' + card.icon + ' ' + card.name + ' ✕';
      chip.addEventListener("click", function() {
        userData.myDeck.splice(index, 1);
        renderDeckBuilder();
      });
      deckListEl.appendChild(chip);
    });

    var colListEl = document.getElementById("collection-list");
    colListEl.innerHTML = "";
    ALL_CARDS.forEach(function(card) {
      var owned = userData.collection[card.id] || 0;
      if (owned <= 0) return;

      var inDeckCount = userData.myDeck.filter(function(id) { return id === card.id; }).length;
      var el = createCardElement(card, function() {
        if (userData.myDeck.length >= DECK_SIZE) {
          alert("デッキは" + DECK_SIZE + "枚までです！");
          return;
        }
        if (inDeckCount >= 3 || inDeckCount >= owned) {
          alert("これ以上同じカードを入れられません（所持数または上限3枚）");
          return;
        }
        userData.myDeck.push(card.id);
        renderDeckBuilder();
      }, {});

      var badge = document.createElement("div");
      badge.className = "owned-badge";
      badge.innerText = "デッキ:" + inDeckCount + " / 所持:" + owned;
      el.appendChild(badge);
      colListEl.appendChild(el);
    });
  }

  document.getElementById("btn-auto-deck").addEventListener("click", function() {
    var available = [];
    Object.keys(userData.collection).forEach(function(id) {
      var count = Math.min(3, userData.collection[id]);
      for (var i = 0; i < count; i++) available.push(id);
    });
    available.sort(function() { return Math.random() - 0.5; });
    userData.myDeck = available.slice(0, DECK_SIZE);
    renderDeckBuilder();
  });

  document.getElementById("btn-clear-deck").addEventListener("click", function() {
    userData.myDeck = [];
    renderDeckBuilder();
  });

  document.getElementById("btn-save-deck").addEventListener("click", function() {
    if (userData.myDeck.length !== DECK_SIZE) {
      alert("デッキはちょうど" + DECK_SIZE + "枚にしてください！（現在 " + userData.myDeck.length + " 枚）");
      return;
    }
    saveUserData();
    alert("✅ マイデッキ（" + DECK_SIZE + "枚）を保存しました！");
  });

  var state = {
    mode: "cpu",
    myRole: "p1",
    turn: 1,
    activeSide: "p1",
    isInputLocked: false,
    p1: { name: "プレイヤー1", label: "マイデッキ", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
    p2: { name: "CPU", label: "相手デッキ", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
    selectedAttackerIndex: null
  };

  var peer = null;
  var conn = null;
  var p1OnlineDeck = null;
  var p2OnlineDeck = null;
  var ROOM_PREFIX = "netmeme-tcg-v2-";

  function getSelectedDeckCards() {
    var choice = document.getElementById("battle-deck-select").value;
    var ids = [];
    var label = "";
    if (choice === "mydeck") {
      if (userData.myDeck.length !== DECK_SIZE) {
        alert("マイデッキが" + DECK_SIZE + "枚になっていません！デッキ編成で" + DECK_SIZE + "枚揃えるか、レンタルデッキを選んでください。");
        return null;
      }
      ids = userData.myDeck.slice();
      label = "マイデッキ";
    } else {
      ids = RENTAL_DECKS[choice].ids.slice();
      label = RENTAL_DECKS[choice].label;
    }
    var cards = ids.map(function(id) {
      return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; })));
    }).sort(function() { return Math.random() - 0.5; });
    return { label: label, cards: cards };
  }

  document.getElementById("btn-mode-cpu").addEventListener("click", function() {
    var p1Deck = getSelectedDeckCards();
    if (!p1Deck) return;
    state.mode = "cpu";

    var pool = [];
    ALL_CARDS.forEach(function(c) { pool.push(c.id, c.id); });
    pool.sort(function() { return Math.random() - 0.5; });
    var cpuIds = pool.slice(0, DECK_SIZE);
    var cpuCards = cpuIds.map(function(id) {
      return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; })));
    });

    startMatch(p1Deck, { label: "CPU混成デッキ", cards: cpuCards }, "CPU");
  });

  document.getElementById("btn-mode-local").addEventListener("click", function() {
    var p1Deck = getSelectedDeckCards();
    if (!p1Deck) return;
    state.mode = "local";
    var p2Cards = RENTAL_DECKS.rental_yaju.ids.map(function(id) {
      return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; })));
    }).sort(function() { return Math.random() - 0.5; });
    startMatch(p1Deck, { label: "プレイヤー2デッキ", cards: p2Cards }, "プレイヤー2");
  });

  document.getElementById("btn-mode-online").addEventListener("click", function() {
    var myDeck = getSelectedDeckCards();
    if (!myDeck) return;
    state.mode = "online";
    p1OnlineDeck = myDeck;
    document.getElementById("step-mode").style.display = "none";
    document.getElementById("step-online").style.display = "block";
  });

  document.getElementById("btn-create-room").addEventListener("click", function() {
    var code = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById("btn-create-room").disabled = true;
    document.getElementById("host-info").style.display = "block";
    document.getElementById("my-room-code").innerText = code;

    peer = new Peer(ROOM_PREFIX + code);
    peer.on("connection", function(connection) {
      conn = connection;
      state.myRole = "p1";
      setupConnectionHandlers();
    });
    peer.on("error", function() { alert("通信エラーが発生しました。再読み込みしてください。"); });
  });

  document.getElementById("btn-join-room").addEventListener("click", function() {
    var code = document.getElementById("join-room-input").value.trim();
    if (code.length !== 4) {
      document.getElementById("join-status").innerText = "4桁の番号を入力してください";
      return;
    }
    document.getElementById("join-status").innerText = "接続中...";
    peer = new Peer();
    peer.on("open", function() {
      conn = peer.connect(ROOM_PREFIX + code);
      conn.on("open", function() {
        state.myRole = "p2";
        setupConnectionHandlers();
        conn.send({ type: "SEND_DECK", deck: p1OnlineDeck });
      });
    });
    peer.on("error", function() {
      document.getElementById("join-status").innerText = "部屋が見つかりません。";
    });
  });

  function setupConnectionHandlers() {
    conn.on("data", function(data) {
      if (data.type === "SEND_DECK" && state.myRole === "p1") {
        p2OnlineDeck = data.deck;
        startMatch(p1OnlineDeck, p2OnlineDeck, "プレイヤー2");
        conn.send({ type: "START_MATCH", p1: state.p1, p2: state.p2 });
      } else if (data.type === "START_MATCH") {
        state.p1 = data.p1;
        state.p2 = data.p2;
        state.turn = 1;
        state.activeSide = "p1";
        state.isInputLocked = (state.myRole !== "p1");
        showScreen("game-screen");
        log("対戦開始！");
        showCutin("⚔️ 対戦開始！\n先攻（プレイヤー1）のターン");
        render();
      } else if (data.type === "SYNC_STATE") {
        state.p1 = data.p1;
        state.p2 = data.p2;
        state.turn = data.turn;
        state.activeSide = data.activeSide;
        state.isInputLocked = (state.activeSide !== state.myRole);
        if (data.logMsg) log(data.logMsg);
        if (data.cutinMsg) showCutin(data.cutinMsg);
        checkGameOver();
        render();
      }
    });
  }

  function sendSync(logMsg, cutinMsg) {
    if (state.mode === "online" && conn && conn.open) {
      conn.send({
        type: "SYNC_STATE",
        p1: state.p1, p2: state.p2, turn: state.turn, activeSide: state.activeSide,
        logMsg: logMsg || null, cutinMsg: cutinMsg || null
      });
    }
  }

  function startMatch(p1Deck, p2Deck, p2Name) {
    state.turn = 1;
    state.activeSide = "p1";
    state.p1 = { name: "プレイヤー1", label: p1Deck.label, hp: 20, maxGiga: 1, giga: 1, deck: p1Deck.cards, hand: [], field: [] };
    state.p2 = { name: p2Name, label: p2Deck.label, hp: 20, maxGiga: 1, giga: 1, deck: p2Deck.cards, hand: [], field: [] };

    showScreen("game-screen");
    document.getElementById("log").innerHTML = "";

    for (var i = 0; i < 4; i++) {
      drawCard("p1");
      drawCard("p2");
    }
    state.isInputLocked = (state.mode === "online" && state.myRole !== "p1");
    log("対戦開始！");
    showCutin("⚔️ 対戦開始！\n" + state.p1.name + "のターン");
    render();
  }

  function getViewSelf() {
    if (state.mode === "online") return state[state.myRole];
    return state[state.activeSide];
  }
  function getViewOpp() {
    if (state.mode === "online") return state[state.myRole === "p1" ? "p2" : "p1"];
    return state[state.activeSide === "p1" ? "p2" : "p1"];
  }

  function drawCard(who) {
    var p = state[who];
    if (p.deck.length === 0) {
      p.hp -= 2;
      log(p.name + "はネタ切れでメンタルに2ダメージ！");
      return;
    }
    if (p.hand.length < 7) p.hand.push(p.deck.pop());
  }

  function log(msg) {
    var logBox = document.getElementById("log");
    logBox.innerHTML = "<p>> " + msg + "</p>" + logBox.innerHTML;
  }

  function showCutin(text, duration) {
    var overlay = document.getElementById("cutin-overlay");
    document.getElementById("cutin-text").innerText = text;
    overlay.style.display = "flex";
    setTimeout(function() { overlay.style.display = "none"; }, duration || 1100);
  }

  // ダメージ適用ヘルパー（無敵バリア判定）
  function dealDamageToMeme(meme, amount) {
    if (amount <= 0) return;
    if (meme.shield) {
      meme.shield = false;
      log("🛡️ 「" + meme.name + "」の無敵バリアがダメージを無効化した！");
      return;
    }
    meme.hp -= amount;
  }

  document.getElementById("btn-resume").addEventListener("click", function() {
    document.getElementById("pass-screen").style.display = "none";
    log("--- " + getViewSelf().name + "のターン（ターン " + state.turn + "） ---");
    render();
  });
  document.getElementById("direct-attack-btn").addEventListener("click", directAttack);
  document.getElementById("end-turn-btn").addEventListener("click", endTurn);

  function playCard(handIndex) {
    if (state.isInputLocked) return;
    var self = getViewSelf();
    var card = self.hand[handIndex];

    if (self.giga < card.cost) {
      log("⚠️ ギガ（コスト）が足りません！");
      return;
    }

    var actionLog = "";
    if (card.type === "meme") {
      if (self.field.length >= 3) {
        log("⚠️ タイムラインがいっぱいです（最大3体）。");
        return;
      }
      self.giga -= card.cost;
      self.hand.splice(handIndex, 1);
      card.canAttack = true;
      card.isBuzz = true;
      self.field.push(card);
      actionLog = "📱 " + self.name + "が「" + card.name + "」を投稿！";
      log(actionLog);
      triggerSummonEffect(state.activeSide, card);
    } else if (card.type === "spell") {
      self.giga -= card.cost;
      self.hand.splice(handIndex, 1);
      actionLog = "⚡ " + self.name + "が構文「" + card.name + "」を発動！";
      log(actionLog);
      executeSpell(state.activeSide, card);

      // 相手場に「ひろゆき（写像）」がいる場合の誘発効果
      var oppSide = state.activeSide === "p1" ? "p2" : "p1";
      var opp = state[oppSide];
      var hiroyukiCount = opp.field.filter(function(m) { return m.id === "hiroyuki"; }).length;
      if (hiroyukiCount > 0) {
        var reflectDmg = hiroyukiCount * 2;
        self.hp -= reflectDmg;
        log("🧔 ひろゆき（写像）効果！「それってあなたのスペルですよね？」" + self.name + "に" + reflectDmg + "ダメージ！");
      }
    }

    state.selectedAttackerIndex = null;
    sendSync(actionLog);
    checkGameOver();
    render();
  }

  function triggerSummonEffect(who, card) {
    var self = state[who];
    var opp = state[who === "p1" ? "p2" : "p1"];

    if (card.id === "neko" || card.id === "tono" || card.id === "kirinuki") {
      drawCard(who);
      log("✨ 「" + card.name + "」効果：1枚ドロー！");
    } else if (card.id === "vipper") {
      var count2ch = self.field.filter(function(m) { return m.era === "2ch"; }).length;
      card.atk += count2ch;
      log("🧑‍💻 VIPPER効果！場の2ch勢の数だけ攻撃力+" + count2ch + "！");
    } else if (card.id === "elshaddai") {
      if (self.field.length > 0) {
        self.field[0].shield = true;
        log("👖 エルシャダイ「大丈夫だ、問題ない」→「" + self.field[0].name + "」に無敵付与！");
      }
    } else if (card.id === "mod") {
      var bounceIdx = opp.field.findIndex(function(m) { return m.cost <= 2 && !m.stealth; });
      if (bounceIdx !== -1) {
        var bounced = opp.field.splice(bounceIdx, 1)[0];
        if (opp.hand.length < 7) {
          bounced.hp = ALL_CARDS.find(function(c) { return c.id === bounced.id; }).hp;
          opp.hand.push(bounced);
        }
        log("🛡️ モデレーター権限で「" + bounced.name + "」をタイムアウト（手札に戻した）！");
      }
    } else if (card.id === "genba") {
      if (Math.random() < 0.5) {
        card.atk += 2;
        log("👷 ヨシ！安全確認完了（攻撃力+2）！");
      } else {
        log("💥 労災発生！現場猫は自爆した！");
        self.field.pop();
      }
    } else if (card.id === "donald") {
      opp.hp -= 2;
      log("🤡 ランランルー！メンタルに2ダメージ！");
    } else if (card.id === "shuzo") {
      self.field.forEach(function(m) { if (m !== card) m.atk += 1; });
      log("🔥 修造の熱血応援！他の味方全員の攻撃力+1！");
    } else if (card.id === "yaju") {
      card.atk += 1;
      log("🦁 野獣先輩のプレッシャー！自身の攻撃力+1！");
    } else if (card.id === "savanna") {
      var targetableOpp = opp.field.filter(function(m) { return !m.stealth; });
      if (targetableOpp.length > 0) {
        targetableOpp[0].atk = 1;
        log("🦁 サバンナ男効果！相手ミームの攻撃力が1になった！");
      }
    } else if (card.id === "nyan") {
      drawCard(who);
      card.atk += 1;
      log("🌈 Nyan Cat効果：1枚ドロー＆攻撃力+1！");
    } else if (card.id === "streamer") {
      self.giga = Math.min(self.maxGiga, self.giga + 1);
      log("🎙️ 大手配信者効果：ギガを1回復！");
    }
  }

  function executeSpell(who, card) {
    var self = state[who];
    var opp = state[who === "p1" ? "p2" : "p1"];
    var targetOpp = opp.field.filter(function(m) { return !m.stealth; });

    if (card.id === "ronpa" && targetOpp.length > 0) {
      dealDamageToMeme(targetOpp[0], 3);
      log("🤔 論破！相手ミームに3ダメージ！");
    } else if (card.id === "numai" && targetOpp.length > 0) {
      dealDamageToMeme(targetOpp[0], 2);
      log("🔨 ガッ！相手ミームに2ダメージ！");
    } else if (card.id === "seiron" && targetOpp.length > 0) {
      dealDamageToMeme(targetOpp[0], 4);
      log("🥊 正論パンチ！相手ミームに4ダメージ！");
    } else if (card.id === "ojisan") {
      opp.field.forEach(function(m) { if (!m.stealth) m.atk = Math.max(0, m.atk - 2); });
      log("👴 おじさん構文で相手ミーム全員の攻撃力が-2！");
    } else if (card.id === "matsuri") {
      self.field.forEach(function(m) {
        m.freshness += 2;
        m.atk += 1;
      });
      log("🏮 祭りだワッショイ！味方全員の鮮度+2＆攻撃力+1！");
    } else if (card.id === "onmyoji") {
      if (self.field.length >= 3) {
        opp.hp -= 6;
        log("⛩️ レッツゴー！陰陽師！3体揃って相手本体に6ダメージ！！");
      } else {
        opp.hp -= 2;
        log("⛩️ 陰陽師発動！相手本体に2ダメージ！");
      }
    } else if (card.id === "inmuchu") {
      if (self.field.length > 0) {
        self.field[0].atk += 2;
        self.field[0].selfDestruct = true;
        log("📢 淫夢厨の暴走！「" + self.field[0].name + "」の攻撃力+2（ターン終了時に自壊）！");
      }
    } else if (card.id === "private_lock") {
      if (self.field.length > 0) {
        self.field[0].stealth = true;
        log("🔐 鍵垢設定！「" + self.field[0].name + "」は次のターンまで対象外（ステルス）になった！");
      }
    } else if (card.id === "owakon") {
      var oldEras = ["2ch", "ニコニコ", "例のアレ", "VIP/なんJ"];
      var idx = opp.field.findIndex(function(m) { return !m.stealth && oldEras.indexOf(m.era) !== -1; });
      if (idx !== -1) {
        log("📉 「" + opp.field[idx].name + "」はオワコン認定され消滅した！");
        opp.field.splice(idx, 1);
      } else {
        log("📉 対象となる古い世代のミームがいなかった...");
      }
    } else if (card.id === "kusa") {
      self.field.forEach(function(m) { m.atk += 1; });
      log("🌱 大草原！味方全員の攻撃力+1！");
    } else if (card.id === "danmaku") {
      self.field.forEach(function(m) { m.atk += 1; });
      drawCard(who);
      log("💬 弾幕展開！味方全員の攻撃力+1＆1枚ドロー！");
    } else if (card.id === "kaiko") {
      var newEras = ["令和", "配信者", "X炎上"];
      if (opp.field.some(function(m) { return newEras.indexOf(m.era) !== -1; })) {
        opp.hp -= 4;
        log("📺 懐古厨の説教が刺さり、相手メンタルに4ダメージ！");
      } else {
        opp.hp -= 1;
        log("📺 懐古厨のぼやきで相手メンタルに1ダメージ。");
      }
    } else if (card.id === "copyright") {
      var cIdx = opp.field.findIndex(function(m) { return !m.stealth && (m.era === "ニコニコ" || m.era === "海外"); });
      if (cIdx !== -1) {
        log("⚠️ 著作権侵害により「" + opp.field[cIdx].name + "」は削除された！");
        opp.field.splice(cIdx, 1);
        drawCard(who);
      } else {
        log("⚠️ 削除対象のミームがいなかった...");
      }
    } else if (card.id === "tokutei") {
      var tIdx = opp.field.findIndex(function(m) { return !m.stealth && (m.era === "配信者" || m.era === "X炎上"); });
      if (tIdx !== -1) {
        opp.field[tIdx].atk = 0;
        opp.field[tIdx].freshness = 1;
        log("🔍 特定班により「" + opp.field[tIdx].name + "」は炎上し無力化（攻撃0・鮮度1）！");
      } else {
        log("🔍 特定対象のミームがいなかった...");
      }
    } else if (card.id === "honyaku") {
      drawCard(who);
      if (self.field.some(function(m) { return m.era === "海外"; })) {
        drawCard(who);
        log("🌐 翻訳ニキの解説で海外ミームの理解が深まり2枚ドロー！");
      } else {
        log("🌐 翻訳ニキの解説で1枚ドロー！");
      }
    } else if (card.id === "jaken") {
      if (targetOpp.length > 0) dealDamageToMeme(targetOpp[0], 4);
      opp.hp -= 2;
      log("🗡️ 邪剣「夜」発動！相手場と本体に大ダメージ！");
    } else if (card.id === "karate") {
      self.field.forEach(function(m) { m.atk += 2; });
      log("🥋 迫真空手部の特訓！味方全員の攻撃力+2！");
    } else if (card.id === "rickroll" && opp.hand.length > 0) {
      var rIdx = Math.floor(Math.random() * opp.hand.length);
      opp.hand.splice(rIdx, 1);
      log("🕺 Rickroll！相手の手札を1枚捨てさせた！");
    } else if (card.id === "supacha") {
      self.giga = Math.min(self.maxGiga, self.giga + 2);
      log("💸 ナイスパ！ギガが2回復した！");
    } else if (card.id === "shazai") {
      self.field = [];
      opp.field = [];
      log("🙇 炎上謝罪会見！場のミームが全て消滅した！");
    } else if (card.id === "comnote") {
      if (targetOpp.length > 0) dealDamageToMeme(targetOpp[0], 3);
      self.hp = Math.min(20, self.hp + 2);
      log("📝 コミュニティノート！相手に3ダメージ＆自分のメンタル2回復！");
    } else if (card.id === "gakkyukai") {
      self.field.forEach(function(m) { dealDamageToMeme(m, 2); });
      opp.field.forEach(function(m) { dealDamageToMeme(m, 2); });
      log("🔥 Xの学級会！お互いの場のミーム全てに2ダメージ！");
    } else if (card.id === "ban") {
      if (targetOpp.length > 0) {
        var bIdx = opp.field.indexOf(targetOpp[0]);
        opp.field.splice(bIdx, 1);
      }
      opp.hp -= 2;
      log("❄️ アカウント凍結！相手ミーム消滅＆本体に2ダメージ！");
    }
    cleanupDeadMemes();
  }

  function selectAttacker(index) {
    if (state.isInputLocked) return;
    var meme = getViewSelf().field[index];
    if (!meme.canAttack) {
      log("⚠️ このミームは既に行動済みです。");
      return;
    }
    state.selectedAttackerIndex = (state.selectedAttackerIndex === index) ? null : index;
    render();
  }

  function attackMeme(targetIndex) {
    if (state.isInputLocked || state.selectedAttackerIndex === null) return;
    var self = getViewSelf();
    var opp = getViewOpp();
    var attacker = self.field[state.selectedAttackerIndex];
    var target = opp.field[targetIndex];

    if (target.stealth) {
      log("🔐 「" + target.name + "」は鍵垢（ステルス）のため攻撃できません！");
      return;
    }

    var atkPower = attacker.atk + (attacker.isBuzz ? 1 : 0);
    var targetPower = target.atk + (target.isBuzz ? 1 : 0);

    dealDamageToMeme(target, atkPower);
    dealDamageToMeme(attacker, targetPower);
    attacker.canAttack = false;
    attacker.stealth = false; // 攻撃するとステルス解除

    var actionLog = "⚔️ 「" + attacker.name + "」が「" + target.name + "」とレスバ！";
    log(actionLog);
    state.selectedAttackerIndex = null;
    cleanupDeadMemes();
    sendSync(actionLog);
    checkGameOver();
    render();
  }

  function directAttack() {
    if (state.isInputLocked || state.selectedAttackerIndex === null) return;
    var self = getViewSelf();
    var opp = getViewOpp();
    var visibleOpp = opp.field.filter(function(m) { return !m.stealth; });
    if (visibleOpp.length > 0) {
      log("⚠️ 相手の場に攻撃可能なミームがいるため直接攻撃できません！");
      return;
    }

    var attacker = self.field[state.selectedAttackerIndex];
    var atkPower = attacker.atk + (attacker.isBuzz ? 1 : 0);

    opp.hp -= atkPower;
    attacker.canAttack = false;
    attacker.stealth = false;
    var actionLog = "🔥 「" + attacker.name + "」の直接攻撃！メンタルに " + atkPower + " ダメージ！";
    log(actionLog);

    state.selectedAttackerIndex = null;
    sendSync(actionLog);
    checkGameOver();
    render();
  }

  function cleanupDeadMemes() {
    ["p1", "p2"].forEach(function(who) {
      var p = state[who];
      var dead = p.field.filter(function(m) { return m.hp <= 0; });
      dead.forEach(function(m) {
        if (m.id === "wai" && p.hand.length < 7) {
          var newWai = JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === "wai"; })));
          p.hand.push(newWai);
          log("⚾ ワイ効果！「またワイが湧いたで！」手札にワイを1枚補充！");
        }
      });
      p.field = p.field.filter(function(m) { return m.hp > 0; });
    });
  }

  function processTurnEnd(who) {
    var p = state[who];
    var blown = p.field.filter(function(m
