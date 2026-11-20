// game.js - メインゲームループ・UI・ミッション・セーブデータ・通信処理

(function() {
  // Firebase Realtime Database 初期化
  var FIREBASE_DB_URL = "https://tcgnet-bf199-default-rtdb.firebaseio.com";
  if (typeof firebase !== "undefined" && !firebase.apps.length) {
    firebase.initializeApp({ databaseURL: FIREBASE_DB_URL });
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
        if (!Array.isArray(parsed.decks)) {
          parsed.decks = createDefaultDecks(Array.isArray(parsed.myDeck) ? parsed.myDeck : defaultDeck);
        }
        while (parsed.decks.length < MAX_DECK_SLOTS) {
          parsed.decks.push({ name: "マイデッキ " + (parsed.decks.length + 1), ids: [] });
        }
        if (!parsed.missions) {
          parsed.missions = createDefaultMissions();
        }
        return parsed;
      } catch (e) {}
    }
    return {
      playerName: DEFAULT_PLAYER_NAME,
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
    document.getElementById("detail-pack").innerText = "収録: 第" + (card.pack || 1) + "弾パック";
    document.getElementById("detail-owned").innerText = "所持数: " + (userData.collection[card.id] || 0) + "枚";

    modal.style.display = "flex";
  }

  document.getElementById("btn-close-card-detail").addEventListener("click", function() {
    document.getElementById("card-detail-modal").style.display = "none";
  });
  document.getElementById("card-detail-modal").addEventListener("click", function(e) {
    if (e.target === this) {
      this.style.display = "none";
    }
  });

  // ================= プレイヤー名変更モーダル =================
  document.getElementById("btn-edit-player-name").addEventListener("click", function() {
    document.getElementById("player-name-input").value = userData.playerName || DEFAULT_PLAYER_NAME;
    document.getElementById("name-edit-modal").style.display = "flex";
  });

  document.getElementById("btn-cancel-name").addEventListener("click", function() {
    document.getElementById("name-edit-modal").style.display = "none";
  });

  document.getElementById("btn-save-name").addEventListener("click", function() {
    var newName = document.getElementById("player-name-input").value.trim();
    userData.playerName = newName || DEFAULT_PLAYER_NAME;
    saveUserData();
    document.getElementById("name-edit-modal").style.display = "none";
  });

  checkDailyReset();
  updateHeaderUI();
  updateMissionBadges();

  // ================= ミッション画面の描画・受け取り処理 =================
  document.getElementById("nav-mission").addEventListener("click", function() {
    checkDailyReset();
    renderMissionScreen();
    showScreen("mission-screen");
  });
  document.getElementById("back-from-mission").addEventListener("click", function() {
    showScreen("home-screen");
  });
  document.getElementById("tab-mission-daily").addEventListener("click", function() {
    currentMissionTab = "daily";
    document.getElementById("tab-mission-daily").classList.add("active");
    document.getElementById("tab-mission-total").classList.remove("active");
    renderMissionScreen();
  });
  document.getElementById("tab-mission-total").addEventListener("click", function() {
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
    document.getElementById("ur-reward-modal").style.display = "flex";
  }

  document.getElementById("btn-close-ur-reward").addEventListener("click", function() {
    document.getElementById("ur-reward-modal").style.display = "none";
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
  document.getElementById("secret-admin-trigger").addEventListener("click", function() {
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
    document.getElementById("admin-modal").style.display = "flex";
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

  document.getElementById("btn-close-admin").addEventListener("click", function() {
    document.getElementById("admin-modal").style.display = "none";
  });

  document.getElementById("admin-add-points").addEventListener("click", function() {
    userData.points += 10000;
    saveUserData();
    setAdminStatus("10,000 バズP を付与しました！");
  });

  document.getElementById("admin-zero-points").addEventListener("click", function() {
    userData.points = 0;
    saveUserData();
    setAdminStatus("バズPを 0 に設定しました。");
  });

  document.getElementById("admin-unlock-all").addEventListener("click", function() {
    ALL_CARDS.forEach(function(c) {
      userData.collection[c.id] = 3;
    });
    saveUserData();
    setAdminStatus("全" + ALL_CARDS.length + "種類のカードを各3枚ずつ付与しました！");
  });

  document.getElementById("admin-clear-col").addEventListener("click", function() {
    userData.collection = {};
    userData.decks = createDefaultDecks([]);
    editingDeckCards = [];
    saveUserData();
    setAdminStatus("所持カードと全デッキを空にしました。");
  });

  document.getElementById("admin-boost-missions").addEventListener("click", function() {
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

  document.getElementById("admin-reset-daily").addEventListener("click", function() {
    userData.missions.dailyStats = { login: 1, battles: 0, wins: 0, summons: 0, spells: 0 };
    userData.missions.dailyClaimed = {};
    saveUserData();
    setAdminStatus("デイリーミッションをリセットしました。");
  });

  document.getElementById("admin-rig-god").addEventListener("click", function() {
    rigNextRarity = (rigNextRarity === "GOD") ? null : "GOD";
    updateRigButtons();
    setAdminStatus(rigNextRarity ? "次のパック開封でGODレア確定！" : "GOD確定モードを解除しました。");
  });

  document.getElementById("admin-rig-ur").addEventListener("click", function() {
    rigNextRarity = (rigNextRarity === "UR") ? null : "UR";
    updateRigButtons();
    setAdminStatus(rigNextRarity ? "次のパック開封でURレア確定！" : "UR確定モードを解除しました。");
  });

  document.getElementById("admin-reset-all").addEventListener("click", function() {
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
  function showScreen(id) {
    for (var i = 0; i < screens.length; i++) {
      var s = screens[i];
      document.getElementById(s).style.display = (s === id) ? (id === "game-screen" ? "flex" : "block") : "none";
    }
  }

  function selectPackTab(packNo) {
    selectedPackNo = packNo;
    var tab1 = document.getElementById("tab-pack-1");
    var tab2 = document.getElementById("tab-pack-2");
    var pVisual = document.getElementById("preview-pack-visual");
    var pEmblem = document.getElementById("preview-pack-emblem");
    var pTitle = document.getElementById("preview-pack-title");
    var pSub = document.getElementById("preview-pack-sub");
    var count = ALL_CARDS.filter(function(c) { return c.pack === packNo; }).length;

    if (packNo === 1) {
      tab1.classList.add("active");
      tab2.classList.remove("active", "vol2");
      pVisual.classList.remove("vol2");
      pEmblem.innerText = "🌐";
      pTitle.innerText = "VOL.1 BASIC";
      pSub.innerHTML = "基本ミームパック（全" + count + "種）<br>超低確率 GODレア収録！";
    } else {
      tab1.classList.remove("active");
      tab2.classList.add("active", "vol2");
      pVisual.classList.add("vol2");
      pEmblem.innerText = "🔥";
      pTitle.innerText = "VOL.2 CHAOS";
      pSub.innerHTML = "第2弾：カオス＆深淵編（全" + count + "種）<br>GODレア2種＆メタ・GODキラー収録！";
    }
  }

  document.getElementById("tab-pack-1").addEventListener("click", function() { selectPackTab(1); });
  document.getElementById("tab-pack-2").addEventListener("click", function() { selectPackTab(2); });

  document.getElementById("btn-view-pack-list").addEventListener("click", function() {
    var packCards = ALL_CARDS.filter(function(c) { return c.pack === selectedPackNo; });
    var rarityOrder = { GOD: 0, UR: 1, SR: 2, R: 3, N: 4 };
    packCards.sort(function(a, b) { return rarityOrder[a.rarity] - rarityOrder[b.rarity]; });

    document.getElementById("modal-pack-title").innerText =
      (selectedPackNo === 1 ? "📋 第1弾：基本ミームパック" : "📋 第2弾：カオス＆深淵編") + "（全" + packCards.length + "種）";

    var grid = document.getElementById("modal-card-grid");
    grid.innerHTML = "";
    packCards.forEach(function(card) {
      var owned = userData.collection[card.id] || 0;
      var el = createCardElement(card, null, {});
      var badge = document.createElement("div");
      badge.className = owned > 0 ? "owned-badge" : "owned-badge unowned";
      badge.innerText = owned > 0 ? "所持: " + owned + "枚" : "未所持";
      el.appendChild(badge);
      grid.appendChild(el);
    });

    document.getElementById("pack-list-modal").style.display = "flex";
  });

  document.getElementById("btn-close-pack-list").addEventListener("click", function() {
    document.getElementById("pack-list-modal").style.display = "none";
  });

  document.getElementById("nav-battle").addEventListener("click", function() {
    populateBattleDeckSelect();
    document.getElementById("step-mode").style.display = "block";
    document.getElementById("step-online").style.display = "none";
    showScreen("setup-screen");
  });
  document.getElementById("nav-pack").addEventListener("click", function() {
    selectPackTab(selectedPackNo);
    showScreen("pack-screen");
  });
  document.getElementById("nav-deck").addEventListener("click", function() {
    switchDeckSlot(currentDeckSlot);
    showScreen("deck-screen");
  });

  document.getElementById("back-from-pack").addEventListener("click", function() { showScreen("home-screen"); });
  document.getElementById("back-from-deck").addEventListener("click", function() { showScreen("home-screen"); });
  document.getElementById("back-from-setup").addEventListener("click", function() {
    cancelRandomMatch();
    showScreen("home-screen");
  });

  // ================= パック開封ステージ =================
  document.getElementById("btn-open-pack").addEventListener("click", enterPackOpenStage);
  document.getElementById("btn-stage-again").addEventListener("click", enterPackOpenStage);
  document.getElementById("btn-stage-back").addEventListener("click", function() {
    document.getElementById("pack-open-stage").style.display = "none";
  });

  function enterPackOpenStage() {
    if (pendingPackData) return;
    if (userData.points < 100) { alert("バズPが足りません！ミッションやCPU戦勝利でポイントを貯めよう！"); return; }

    userData.points -= 100;
    addMissionStat("packs", 1);

    var targetCards = ALL_CARDS.filter(function(c) { return c.pack === selectedPackNo; });
    var poolN = targetCards.filter(function(c) { return c.rarity === "N"; });
    var poolR = targetCards.filter(function(c) { return c.rarity === "R"; });
    var poolSR = targetCards.filter(function(c) { return c.rarity === "SR"; });
    var poolUR = targetCards.filter(function(c) { return c.rarity === "UR"; });
    var poolGOD = targetCards.filter(function(c) { return c.rarity === "GOD"; });

    var pulled = [];
    var maxRarity = "R";
    var rankMap = { N: 1, R: 2, SR: 3, UR: 4, GOD: 5 };

    for (var i = 0; i < 5; i++) {
      var rand = Math.random() * 100, pool = poolN;
      if (i === 4) {
        if (rigNextRarity === "GOD" && poolGOD.length > 0) pool = poolGOD;
        else if (rigNextRarity === "UR" && poolUR.length > 0) pool = poolUR;
        else if (rand < 0.1 && poolGOD.length > 0) pool = poolGOD;
        else if (rand < 3.1) pool = poolUR;
        else if (rand < 30.1) pool = poolSR;
        else pool = poolR;
      } else {
        if (rand < 0.1 && poolGOD.length > 0) pool = poolGOD;
        else if (rand < 1.1) pool = poolUR;
        else if (rand < 13.1) pool = poolSR;
        else if (rand < 43.1) pool = poolR;
      }
      var card = pool[Math.floor(Math.random() * pool.length)];
      if (rankMap[card.rarity] > rankMap[maxRarity]) maxRarity = card.rarity;
      pulled.push(card);
      userData.collection[card.id] = (userData.collection[card.id] || 0) + 1;
    }
    rigNextRarity = null;
    saveUserData();

    pendingPackData = { pulled: pulled, maxRarity: maxRarity };

    var stage = document.getElementById("pack-open-stage");
    var visual = document.getElementById("pack-visual");
    var emblem = document.getElementById("stage-pack-emblem");
    var title = document.getElementById("stage-pack-title");
    var sub = document.getElementById("stage-pack-sub");
    var bar = document.getElementById("tear-progress-bar");
    var hint = document.getElementById("tear-hint");
    var slit = document.getElementById("pack-slit-glow");

    document.getElementById("stage-guide").innerText = "✂️ パック上部を右へなぞって切り開け！";
    document.getElementById("pack-result-area").innerHTML = "";
    document.getElementById("stage-after-buttons").style.display = "none";

    visual.className = "real-pack ready-to-tear" + (selectedPackNo === 2 ? " vol2" : "");
    emblem.innerText = selectedPackNo === 1 ? "🌐" : "🔥";
    title.innerText = selectedPackNo === 1 ? "VOL.1 BASIC" : "VOL.2 CHAOS";
    sub.innerText = "5枚入り / R以上1枚確定";
    bar.style.width = "0%";
    hint.innerText = "✂️ ここを右へスワイプ！";
    slit.className = "pack-slit-glow";

    stage.style.display = "flex";
  }

  var packWrapper = document.getElementById("pack-wrapper");

  function handleTearStart(clientX) {
    if (!pendingPackData) return;
    isTearing = true;
  }

  function handleTearMove(clientX) {
    if (!isTearing || !pendingPackData) return;
    var rect = packWrapper.getBoundingClientRect();
    var progress = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    document.getElementById("tear-progress-bar").style.width = progress + "%";

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

      // ② 0.65秒後に雷撃とともに赤（または虹）へ昇格！！
      setTimeout(function() {
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
        });
      }, 1350);

    } else {
      // 通常発光パターン
      hint.innerText = "✨ OPEN!! ✨";
      slit.className = "pack-slit-glow rarity-" + data.maxRarity;

      setTimeout(function() {
        visual.classList.remove("pack-tearing-anim");

        if (data.maxRarity === "UR" || data.maxRarity === "GOD") {
          triggerSpecialCutin(data.maxRarity, function() {
            revealCardsSequence(data);
          });
        } else {
          revealCardsSequence(data);
        }
      }, 650);
    }
  }

  // =========================================================================
  // 激アツ演出ルーレット（全6パターン：パチンコ / 画面クラッシュ / 777スロット / トレンド炎上 / 宇宙ビッグバン / プチュン暗転）
  // =========================================================================
  function pickCutinType(rarity) {
    var r = Math.random() * 100;
    if (rarity === "GOD") {
      // GOD時：ビッグバン(35%) / 暗転(20%) / 777(15%) / クラッシュ(10%) / トレンド(10%) / パチンコ(10%)
      if (r < 35) return "bigbang";
      if (r < 55) return "blackout";
      if (r < 70) return "slot";
      if (r < 80) return "crash";
      if (r < 90) return "trend";
      return "pachinko";
    } else {
      // UR時：パチンコ(22%) / クラッシュ(20%) / 777(20%) / トレンド(18%) / 暗転(15%) / ビッグバン(5%)
      if (r < 22) return "pachinko";
      if (r < 42) return "crash";
      if (r < 62) return "slot";
      if (r < 80) return "trend";
      if (r < 95) return "blackout";
      return "bigbang";
    }
  }

  function triggerSpecialCutin(rarity, onComplete) {
    var overlay = document.getElementById("pachinko-overlay");
    var scenes = ["scene-pachinko", "scene-crash", "scene-slot", "scene-trend", "scene-bigbang", "scene-blackout"];
    scenes.forEach(function(id) {
      document.getElementById(id).classList.remove("active");
    });
    overlay.classList.remove("quake-anim");
    overlay.style.display = "flex";

    var isGod = (rarity === "GOD");
    var type = pickCutinType(rarity);

    if (type === "pachinko") {
      // 1. 🚨 定番パチンコ・キュイン演出
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
        overlay.style.display = "none";
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

      setTimeout(function() {
        // 画面ひび割れ＆逆転！
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
        overlay.style.display = "none";
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
        [r1, r2, r3].forEach(function(r) {
          if (r.classList.contains("spinning")) {
            r.innerText = dummyIcons[Math.floor(Math.random() * dummyIcons.length)];
          }
        });
      }, 75);

      setTimeout(function() {
        r1.className = "slot-reel stopped-win";
        r1.innerText = winSymbol;
      }, 500);

      setTimeout(function() {
        r2.className = "slot-reel stopped-win";
        r2.innerText = winSymbol;
        banner.style.color = "#ffd32a";
        banner.innerText = "⚡ 激アツ テンパイ！！ ⚡";
      }, 950);

      setTimeout(function() {
        clearInterval(spinTimer);
        r3.className = "slot-reel stopped-win";
        r3.innerText = winSymbol;
        overlay.classList.add("quake-anim");
        banner.style.color = isGod ? "#00d2ff" : "#ff4757";
        banner.innerHTML = isGod ? "🌈 GOD揃い大当たり!! 🌈" : "🎰 777 FEVER!! UR確定!! 🎰";
      }, 1450);

      setTimeout(function() {
        clearInterval(spinTimer);
        overlay.classList.remove("quake-anim");
        overlay.style.display = "none";
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
        overlay.style.display = "none";
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

      setTimeout(function() {
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
        overlay.style.display = "none";
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

      // 暗転の静寂のあと、一気に光と文字が弾ける！
      setTimeout(function() {
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
        overlay.style.display = "none";
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

    for (var j = 0; j < 5; j++) {
      var back = document.createElement("div");
      back.className = "card-back-mystery";
      back.innerHTML = "❓<br><span style='font-size:0.75rem; color:#aaa;'>MEME</span>";
      resultArea.appendChild(back);
    }

    data.pulled.forEach(function(c, idx) {
      setTimeout(function() {
        var el = createCardElement(c, null, {});
        el.classList.add("card-revealed");
        resultArea.replaceChild(el, resultArea.children[idx]);
        if (idx === data.pulled.length - 1) {
          document.getElementById("stage-after-buttons").style.display = "flex";
        }
      }, 250 + idx * 320);
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
    ALL_CARDS.forEach(function(card) {
      var owned = userData.collection[card.id] || 0;
      if (owned <= 0) return;
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

  document.getElementById("btn-auto-deck").addEventListener("click", function() {
    var available = [];
    Object.keys(userData.collection).forEach(function(id) {
      var count = Math.min(3, userData.collection[id]);
      for (var i = 0; i < count; i++) available.push(id);
    });
    available.sort(function() { return Math.random() - 0.5; });
    editingDeckCards = available.slice(0, DECK_SIZE);
    renderDeckBuilder();
  });

  document.getElementById("btn-clear-deck").addEventListener("click", function() {
    editingDeckCards = [];
    renderDeckBuilder();
  });

  document.getElementById("btn-save-deck").addEventListener("click", function() {
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
    mode: "cpu", myRole: "p1", turn: 1, activeSide: "p1", isInputLocked: false,
    p1: { name: "プレイヤー1", label: "マイデッキ", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
    p2: { name: "CPU", label: "相手デッキ", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
    selectedAttackerIndex: null
  };
  var peer = null, conn = null, p1OnlineDeck = null, p2OnlineDeck = null, ROOM_PREFIX = "netmeme-tcg-v10-";
  var myQueueRef = null, randomHeartbeatTimer = null;

  var effectCtx = {
    state: state,
    drawCard: drawCard,
    log: log,
    dealDamageToMeme: dealDamageToMeme,
    cleanupDeadMemes: cleanupDeadMemes
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

  function getSelectedDeckCards() {
    var choice = document.getElementById("battle-deck-select").value, ids = [], label = "";
    if (choice.indexOf("mydeck_") === 0) {
      var slotIdx = parseInt(choice.replace("mydeck_", ""), 10);
      var targetDeck = userData.decks[slotIdx];
      if (!targetDeck || targetDeck.ids.length !== DECK_SIZE) {
        alert("選択した「" + (targetDeck ? targetDeck.name : "マイデッキ") + "」が" + DECK_SIZE + "枚になっていません！デッキ編成で40枚揃えて保存するか、完成済みのデッキ・レンタルデッキを選んでください。");
        return null;
      }
      ids = targetDeck.ids.slice();
      label = targetDeck.name;
    } else {
      ids = RENTAL_DECKS[choice].ids.slice();
      label = RENTAL_DECKS[choice].label;
    }
    var cards = ids.map(function(id) { return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; }))); }).sort(function() { return Math.random() - 0.5; });
    return { label: label, cards: cards };
  }

  document.getElementById("btn-mode-cpu").addEventListener("click", function() {
    var p1Deck = getSelectedDeckCards(); if (!p1Deck) return;
    state.mode = "cpu";
    var pool = []; ALL_CARDS.filter(function(c) { return c.rarity !== "GOD"; }).forEach(function(c) { pool.push(c.id, c.id); });
    pool.sort(function() { return Math.random() - 0.5; });
    var cpuCards = pool.slice(0, DECK_SIZE).map(function(id) { return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; }))); });
    startMatch(p1Deck, { label: "CPU混成デッキ", cards: cpuCards }, "CPU");
  });

  document.getElementById("btn-mode-local").addEventListener("click", function() {
    var p1Deck = getSelectedDeckCards(); if (!p1Deck) return;
    state.mode = "local";
    var p2Cards = RENTAL_DECKS.rental_yaju.ids.map(function(id) { return JSON.parse(JSON.stringify(ALL_CARDS.find(function(c) { return c.id === id; }))); }).sort(function() { return Math.random() - 0.5; });
    startMatch(p1Deck, { label: "プレイヤー2デッキ", cards: p2Cards }, "プレイヤー2");
  });

  document.getElementById("btn-mode-online").addEventListener("click", function() {
    var myDeck = getSelectedDeckCards(); if (!myDeck) return;
    state.mode = "online"; p1OnlineDeck = myDeck;
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

  document.getElementById("btn-cancel-random").addEventListener("click", cancelRandomMatch);

  document.getElementById("btn-random-match").addEventListener("click", function() {
    if (typeof firebase === "undefined") {
      alert("Firebase SDKの読み込みに失敗しています。ネットワーク接続を確認してください。");
      return;
    }

    document.getElementById("btn-random-match").disabled = true;
    document.getElementById("random-matching-box").style.display = "flex";
    document.getElementById("random-status-text").innerText = "🔍 ロビーを検索しています...";

    var myPeerId = ROOM_PREFIX + "rnd-" + Math.random().toString(36).substring(2, 10);
    peer = new Peer(myPeerId);

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

  // ================= 従来の合言葉対戦処理 =================
  document.getElementById("btn-create-room").addEventListener("click", function() {
    var code = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById("btn-create-room").disabled = true;
    document.getElementById("host-info").style.display = "block";
    document.getElementById("my-room-code").innerText = code;
    peer = new Peer(ROOM_PREFIX + code);
    peer.on("connection", function(connection) { conn = connection; state.myRole = "p1"; setupConnectionHandlers(); });
    peer.on("error", function() { alert("通信エラーが発生しました。再読み込みしてください。"); });
  });

  document.getElementById("btn-join-room").addEventListener("click", function() {
    var code = document.getElementById("join-room-input").value.trim();
    if (code.length !== 4) { document.getElementById("join-status").innerText = "4桁の番号を入力してください"; return; }
    document.getElementById("join-status").innerText = "接続中...";
    peer = new Peer();
    peer.on("open", function() {
      conn = peer.connect(ROOM_PREFIX + code);
      conn.on("open", function() {
        state.myRole = "p2";
        setupConnectionHandlers();
        conn.send({ type: "SEND_DECK", deck: p1OnlineDeck, playerName: userData.playerName || DEFAULT_PLAYER_NAME });
      });
    });
    peer.on("error", function() { document.getElementById("join-status").innerText = "部屋が見つかりません。"; });
  });

  function setupConnectionHandlers() {
    conn.on("data", function(data) {
      if (data.type === "SEND_DECK" && state.myRole === "p1") {
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

  function startMatch(p1Deck, p2Deck, p2Name) {
    addMissionStat("battles", 1);
    var myName = userData.playerName || DEFAULT_PLAYER_NAME;
    state.turn = 1; state.activeSide = "p1";
    state.p1 = { name: myName, label: p1Deck.label, hp: 20, maxGiga: 1, giga: 1, deck: p1Deck.cards, hand: [], field: [] };
    state.p2 = { name: p2Name, label: p2Deck.label, hp: 20, maxGiga: 1, giga: 1, deck: p2Deck.cards, hand: [], field: [] };
    showScreen("game-screen"); document.getElementById("log").innerHTML = "";
    for (var i = 0; i < 4; i++) { drawCard("p1"); drawCard("p2"); }
    state.isInputLocked = (state.mode === "online" && state.myRole !== "p1");
    log("対戦開始！"); showCutin("⚔️ 対戦開始！\n" + state.p1.name + "のターン"); render();
  }

  function getViewSelf() { return state.mode === "online" ? state[state.myRole] : state[state.activeSide]; }
  function getViewOpp() { return state.mode === "online" ? state[state.myRole === "p1" ? "p2" : "p1"] : state[state.activeSide === "p1" ? "p2" : "p1"]; }

  function drawCard(who) {
    var p = state[who];
    if (p.deck.length === 0) { p.hp -= 2; log(p.name + "はネタ切れでメンタルに2ダメージ！"); return; }
    if (p.hand.length < 7) p.hand.push(p.deck.pop());
  }
  function log(msg) { var logBox = document.getElementById("log"); logBox.innerHTML = "<p>> " + msg + "</p>" + logBox.innerHTML; }
  function showCutin(text, duration) {
    var overlay = document.getElementById("cutin-overlay"); document.getElementById("cutin-text").innerText = text;
    overlay.style.display = "flex"; setTimeout(function() { overlay.style.display = "none"; }, duration || 1100);
  }

  function showGodSummonCutin(card, summonerName) {
    if (!card || card.rarity !== "GOD") return;

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
    overlay.style.display = "flex";

    setTimeout(function() {
      overlay.classList.remove("quake-anim");
      overlay.style.display = "none";
    }, 2400);
  }

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
    log("--- " + getViewSelf().name + "のターン（ターン " + state.turn + "） ---"); render();
  });
  document.getElementById("direct-attack-btn").addEventListener("click", directAttack);
  document.getElementById("end-turn-btn").addEventListener("click", endTurn);

  function playCard(handIndex) {
    if (state.isInputLocked) return;
    var self = getViewSelf(), card = self.hand[handIndex];
    if (self.giga < card.cost) { log("⚠️ ギガ（コスト）が足りません！"); return; }
    var actionLog = "";
    var summonedGodCard = null;
    var isPlayerAction = (state.mode === "cpu" && state.activeSide === "p1") || (state.mode === "online" && state.activeSide === state.myRole) || (state.mode === "local");

    if (card.type === "meme") {
      if (self.field.length >= 3) { log("⚠️ タイムラインがいっぱいです（最大3体）。"); return; }
      self.giga -= card.cost; self.hand.splice(handIndex, 1); card.canAttack = true; card.isBuzz = true; self.field.push(card);
      if (isPlayerAction) addMissionStat("summons", 1);
      actionLog = "📱 " + self.name + "が「" + card.name + "」を投稿！"; log(actionLog);
      window.CardEffects.triggerSummonEffect(effectCtx, state.activeSide, card);
      if (card.rarity === "GOD") {
        summonedGodCard = card;
        showGodSummonCutin(card, self.name);
      }
    } else if (card.type === "spell") {
      self.giga -= card.cost; self.hand.splice(handIndex, 1);
      if (isPlayerAction) addMissionStat("spells", 1);
      actionLog = "⚡ " + self.name + "が構文「" + card.name + "」を発動！"; log(actionLog);
      window.CardEffects.executeSpell(effectCtx, state.activeSide, card);
    }
    state.selectedAttackerIndex = null; sendSync(actionLog, null, summonedGodCard, self.name); checkGameOver(); render();
  }

  function selectAttacker(index) {
    if (state.isInputLocked) return;
    var meme = getViewSelf().field[index];
    if (!meme.canAttack) { log("⚠️ このミームは既に行動済みです。"); return; }
    state.selectedAttackerIndex = (state.selectedAttackerIndex === index) ? null : index;
    render();
  }

  function attackMeme(targetIndex) {
    if (state.isInputLocked || state.selectedAttackerIndex === null) return;
    var self = getViewSelf(), opp = getViewOpp();
    var attacker = self.field[state.selectedAttackerIndex], target = opp.field[targetIndex];
    dealDamageToMeme(target, attacker.atk + (attacker.isBuzz ? 1 : 0));
    dealDamageToMeme(attacker, target.atk + (target.isBuzz ? 1 : 0));
    attacker.canAttack = false;
    var actionLog = "⚔️ 「" + attacker.name + "」が「" + target.name + "」とレスバ！";
    log(actionLog); state.selectedAttackerIndex = null; cleanupDeadMemes(); sendSync(actionLog); checkGameOver(); render();
  }

  function directAttack() {
    if (state.isInputLocked || state.selectedAttackerIndex === null) return;
    var self = getViewSelf(), opp = getViewOpp(), attacker = self.field[state.selectedAttackerIndex];
    var atkPower = attacker.atk + (attacker.isBuzz ? 1 : 0);
    opp.hp -= atkPower; attacker.canAttack = false;
    var actionLog = "🔥 「" + attacker.name + "」の直接攻撃！メンタルに " + atkPower + " ダメージ！";
    log(actionLog); state.selectedAttackerIndex = null; sendSync(actionLog); checkGameOver(); render();
  }

  function cleanupDeadMemes() {
    state.p1.field = state.p1.field.filter(function(m) { return m.hp > 0; });
    state.p2.field = state.p2.field.filter(function(m) { return m.hp > 0; });
  }

  function endTurn() {
    if (state.isInputLocked) return;
    state.selectedAttackerIndex = null;
    if (state.mode === "cpu") {
      state.activeSide = "p2"; state.isInputLocked = true; processTurnStart("p2");
      showCutin("👾 CPUのターン（思考中...）", 1100); render(); setTimeout(cpuAI, 1200);
    } else if (state.mode === "local") {
      state.activeSide = state.activeSide === "p1" ? "p2" : "p1";
      if (state.activeSide === "p1") state.turn++;
      processTurnStart(state.activeSide);
      document.getElementById("pass-title").innerText = "📱 " + getViewSelf().name + "のターンです";
      document.getElementById("pass-screen").style.display = "flex";
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
    if (p.maxGiga < 10) p.maxGiga++;
    p.giga = p.maxGiga; drawCard(who);
    p.field.forEach(function(m) { m.isBuzz = false; m.freshness--; m.canAttack = true; });
    p.field.filter(function(m) { return m.freshness <= 0; }).forEach(function(m) { log("⌛ 「" + m.name + "」は飽きられてオワコン化した..."); });
    p.field = p.field.filter(function(m) { return m.freshness > 0; });
  }

  function cpuAI() {
    var cpu = state.p2, actions = [];
    for (var i = cpu.hand.length - 1; i >= 0; i--) {
      var card = cpu.hand[i];
      if (card.cost <= cpu.giga) {
        if (card.type === "meme" && cpu.field.length < 3) {
          cpu.giga -= card.cost; cpu.hand.splice(i, 1); card.isBuzz = true; cpu.field.push(card);
          actions.push("「" + card.name + "」を召喚"); log("👾 CPUが「" + card.name + "」を召喚！");
          window.CardEffects.triggerSummonEffect(effectCtx, "p2", card);
          if (card.rarity === "GOD") {
            showGodSummonCutin(card, cpu.name);
          }
        } else if (card.type === "spell") {
          cpu.giga -= card.cost; cpu.hand.splice(i, 1);
          actions.push("「" + card.name + "」を発動"); log("👾 CPUが「" + card.name + "」を発動！");
          window.CardEffects.executeSpell(effectCtx, "p2", card);
        }
      }
    }
    cpu.field.forEach(function(m) {
      var power = m.atk + (m.isBuzz ? 1 : 0);
      if (state.p1.field.length > 0) {
        var target = state.p1.field[0];
        dealDamageToMeme(target, power);
        dealDamageToMeme(m, target.atk + (target.isBuzz ? 1 : 0));
        actions.push("「" + m.name + "」で攻撃"); log("👾 CPUの「" + m.name + "」が「" + target.name + "」を攻撃！"); cleanupDeadMemes();
      } else {
        state.p1.hp -= power; actions.push("「" + m.name + "」で直接攻撃"); log("👾 CPUの「" + m.name + "」が直接攻撃！メンタルに " + power + " ダメージ！");
      }
    });
    if (checkGameOver()) return;
    state.turn++; state.activeSide = "p1"; state.isInputLocked = false; processTurnStart("p1");
    var summary = actions.length > 0 ? "CPUは " + actions.join(" → ") + "！\n" : "CPUは何もしなかった。\n";
    showCutin(summary + "🧑 " + state.p1.name + "のターン（ターン " + state.turn + "）", 1400);
    log("--- " + state.p1.name + "のターン（ターン " + state.turn + "） ---"); render();
  }

  function checkGameOver() {
    var didPlayerWin = (state.mode === "online" && state.myRole === "p2") ? (state.p1.hp <= 0) : (state.p2.hp <= 0);
    var didPlayerLose = (state.mode === "online" && state.myRole === "p2") ? (state.p2.hp <= 0) : (state.p1.hp <= 0);

    if (state.p2.hp <= 0) {
      if (didPlayerWin) addMissionStat("wins", 1);
      userData.points += 300; saveUserData();
      setTimeout(function() { alert("🎉 " + state.p1.name + "の勝利！報酬として 300 バズP を獲得しました！"); showScreen("home-screen"); }, 200);
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
    var canPlayAny = self.hand.some(function(c) { return c.cost <= self.giga; }), canAttackAny = self.field.some(function(m) { return m.canAttack; });
    if (canPlayAny && canAttackAny) banner.innerText = "💡 " + self.name + "のターン：手札を出すか、場のミームで攻撃！（長押しで詳細）";
    else if (canPlayAny) banner.innerText = "💡 " + self.name + "のターン：手札の緑枠カードをタップして投稿しよう！";
    else if (canAttackAny) banner.innerText = "⚔️ 場の緑枠ミームをタップして攻撃しよう！";
    else banner.innerText = "✅ できる行動がありません。「⏭️ ターン終了」を押そう！";
  }

  function render() {
    var self = getViewSelf(), opp = getViewOpp();
    document.getElementById("opp-title").innerText = "👾 " + opp.name + "（" + opp.label + "）";
    document.getElementById("opp-hp").innerText = opp.hp;
    document.getElementById("opp-giga").innerText = opp.giga + "/" + opp.maxGiga;
    document.getElementById("opp-deck-count").innerText = "(山札: " + opp.deck.length + "枚)";
    document.getElementById("self-title").innerText = "🧑 " + self.name + "（" + self.label + "）";
    document.getElementById("self-hp").innerText = self.hp;
    document.getElementById("self-giga").innerText = self.giga + "/" + self.maxGiga;
    document.getElementById("self-deck-count").innerText = "(山札: " + self.deck.length + "枚)";
    updateGuideBanner();

    var canDirect = !state.isInputLocked && state.selectedAttackerIndex !== null && opp.field.length === 0;
    var directBtn = document.getElementById("direct-attack-btn");
    directBtn.disabled = !canDirect;
    if (canDirect) directBtn.classList.add("ready"); else directBtn.classList.remove("ready");
    document.getElementById("end-turn-btn").disabled = state.isInputLocked;

    var oppFieldEl = document.getElementById("opp-field");
    oppFieldEl.innerHTML = opp.field.length === 0 ? '<span class="empty-msg">相手の場にミームはいません</span>' : "";
    opp.field.forEach(function(c, idx) {
      var action = (!state.isInputLocked && state.selectedAttackerIndex !== null)
        ? function() { attackMeme(idx); }
        : null;
      oppFieldEl.appendChild(createCardElement(c, action, { isTarget: !state.isInputLocked && state.selectedAttackerIndex !== null }));
    });

    var selfFieldEl = document.getElementById("self-field");
    selfFieldEl.innerHTML = self.field.length === 0 ? '<span class="empty-msg">自分の場にミームはいません</span>' : "";
    self.field.forEach(function(c, idx) {
      selfFieldEl.appendChild(createCardElement(c, function() { selectAttacker(idx); }, { isSelected: state.selectedAttackerIndex === idx, canAttack: !state.isInputLocked && c.canAttack }));
    });

    var handEl = document.getElementById("self-hand");
    handEl.innerHTML = "";
    self.hand.forEach(function(c, idx) {
      var playable = !state.isInputLocked && c.cost <= self.giga;
      handEl.appendChild(createCardElement(c, function() { playCard(idx); }, { playable: playable, unplayable: !playable }));
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
    var buzzBadge = card.isBuzz ? '<div class="buzz-badge">🔥バズ中(+1)</div>' : "";
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
})();
