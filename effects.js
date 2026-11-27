// effects.js - カードの召喚時効果・スペル効果のロジック（v2.9 単体対象指定対応）

window.CardEffects = {
  // カードが単体対象指定を必要とするか判定し、ステップ定義配列を返す
  // 返り値: null または [{ side: "opp"|"self", filter: fn(m, card), label: string }, ...]
  getTargetSteps: function(card) {
    if (!card) return null;
    var id = card.id;

    // 2段階指定（味方1体にバリア → 相手1体の攻撃力0）
    if (id === "daga_kotowaru") {
      return [
        { side: "self", label: "無敵バリアを付与する味方ミーム" },
        { side: "opp", label: "攻撃力を0にする相手ミーム" }
      ];
    }

    // 相手ミーム1体（無条件）
    var oppAnyIds = [
      "zundamon", "hiroyuki_king", "tokutei_pro", "resuba_king", "savanna",
      "ur_pro_gamer", "sr_lag_switch", "sr_stream_snipe", "r_fps_camper", "mob_chara",
      "ronpa", "numai", "seiron", "yakusoku_j", "digital_tattoo", "onmyoji",
      "enjo_nenryo", "jaken", "comnote", "ban", "omae_shindeiru", "douiukoto_nano",
      "uso_da", "jikai_yokoku", "op_skip", "sr_rage_quit", "r_patch_nerf",
      "r_loading_99", "n_fps_drop", "n_fall_damage",
      "sr_surinuke_bakushi", "sr_shadowban", "r_badge_999",
      "n_storage_full", "n_battery_1pct", "n_wifi_lost",
      "ur_deepfake_master", "sr_hallucination", "sr_algorithm_ban",
      "r_dolphin_assistant", "r_crypto_crash", "r_deep_learning_loop",
      "n_captcha_traffic", "n_ai_hands_6fingers", "n_chatgpt_sorry", "n_token_limit"
    ];
    if (oppAnyIds.indexOf(id) !== -1) {
      return [{ side: "opp", label: "効果を与える相手ミーム" }];
    }

    // 相手ミーム1体（条件付きメタ・コスト制限）
    if (id === "meta_anime_critic") {
      return [{ side: "opp", filter: function(m) { return m.era === "アニメ"; }, label: "消滅させる相手の「アニメ」ミーム" }];
    }
    if (id === "meta_anticheat_ban") {
      return [{ side: "opp", filter: function(m) { return m.era === "ゲーム"; }, label: "消滅させる相手の「ゲーム」ミーム" }];
    }
    if (id === "meta_boss_nerf") {
      return [{
        side: "opp",
        filter: function(m, oppField) {
          var hasGame = oppField.some(function(x) { return x.era === "ゲーム"; });
          return hasGame ? (m.era === "ゲーム") : true;
        },
        label: "弱体化パッチを当てる相手ミーム"
      }];
    }
    if (id === "sr_kusoge_hunter") {
      return [{ side: "opp", filter: function(m) { return m.cost <= 3; }, label: "破壊するコスト3以下の相手ミーム" }];
    }
    if (id === "sr_kakin_inflation") {
      return [{ side: "opp", filter: function(m) { return m.cost <= 2; }, label: "破壊するコスト2以下の相手ミーム" }];
    }
    if (id === "owakon") {
      var oldEras = ["2ch", "ニコニコ", "例のアレ", "VIP/なんJ"];
      return [{ side: "opp", filter: function(m) { return oldEras.indexOf(m.era) !== -1; }, label: "オワコン認定する旧世代ミーム" }];
    }
    if (id === "copyright") {
      return [{ side: "opp", filter: function(m) { return m.era === "ニコニコ" || m.era === "海外"; }, label: "削除申し立てするニコニコ/海外ミーム" }];
    }
    if (id === "tokutei") {
      return [{ side: "opp", filter: function(m) { return m.era === "配信者" || m.era === "X炎上"; }, label: "特定作業する配信者/X炎上ミーム" }];
    }
    if (id === "dat_ochi") {
      return [{ side: "opp", filter: function(m) { return m.era === "2ch"; }, label: "DAT落ちさせる「2ch」ミーム" }];
    }
    if (id === "omakuni") {
      return [{ side: "opp", filter: function(m) { return m.era === "海外"; }, label: "おま国対象にする「海外」ミーム" }];
    }
    if (id === "god_killer_503") {
      return [{ side: "opp", filter: function(m) { return m.rarity === "GOD"; }, label: "強制ダウンさせる相手の「GOD」ミーム" }];
    }
    if (id === "oni_ni_naranai") {
      return [{ side: "opp", filter: function(m) { return m.cost <= 2; }, label: "寝返らせるコスト2以下の相手ミーム" }];
    }

    // 自分場のミーム1体
    var selfAnyIds = [
      "elshaddai", "speedwagon",
      "short_video", "icetea", "grass_hayasu", "bazu_tweet",
      "nanimo_kowakunai", "anta_bakaa", "shujinkou_hosei", "gomen_yui",
      "tsundere", "to_be_continued", "ikari_no_super",
      "sr_speedrun_chart", "r_hitbox_bug", "r_double_jump",
      "n_wooden_sword", "n_easter_egg", "n_respawn_point",
      "ur_stamina_stone", "r_oshi_kantotsu", "n_login_bonus",
      "ur_god_prompt", "r_vrchat_mute", "r_lora_finetune", "n_gpu_fan_max", "n_prompt_typo"
    ];
    if (selfAnyIds.indexOf(id) !== -1) {
      return [{ side: "self", label: "効果を与える味方ミーム" }];
    }

    return null;
  },

  // CPU用：有効な対象から賢くインデックスを選ぶ
  pickSmartTargetIndex: function(field, step, card) {
    if (!Array.isArray(field) || field.length === 0) return -1;
    var validIndices = [];
    for (var i = 0; i < field.length; i++) {
      if (!step.filter || step.filter(field[i], field)) {
        validIndices.push(i);
      }
    }
    if (validIndices.length === 0) return -1;
    // 相手対象なら攻撃力が高い順、味方対象なら攻撃力が高い順（ただしエルシャダイ等は新しく出した自身含む）
    validIndices.sort(function(a, b) {
      return (field[b].atk || 0) - (field[a].atk || 0);
    });
    return validIndices[0];
  },

  // 有効対象インデックスを解決（手動指定があればそれを使い、なければ自動/CPUフォールバック）
  resolveTargetIndex: function(field, step, card, chosenIdx) {
    if (!Array.isArray(field) || field.length === 0) return -1;
    if (typeof chosenIdx === "number" && chosenIdx >= 0 && chosenIdx < field.length) {
      if (!step.filter || step.filter(field[chosenIdx], field)) {
        return chosenIdx;
      }
    }
    return this.pickSmartTargetIndex(field, step, card);
  },

  triggerSummonEffect: function(ctx, who, card, targets) {
    targets = targets || [];
    var state = ctx.state;
    var self = state[who], opp = state[who === "p1" ? "p2" : "p1"];
    var steps = this.getTargetSteps(card);
    var t0 = (steps && steps[0]) ? this.resolveTargetIndex(steps[0].side === "opp" ? opp.field : self.field, steps[0], card, targets[0]) : -1;

    if (card.id === "god_internet") {
      self.field.forEach(function(m) { m.atk += 2; m.shield = true; });
      ctx.drawCard(who); ctx.drawCard(who);
      ctx.log("🌌 【GOD降臨】インターネットの集合知！味方全員攻撃力+2＆無敵バリア＆2枚ドロー！");
    } else if (card.id === "god_moderator") {
      opp.field = []; opp.hp -= 3; card.shield = true;
      ctx.log("🔨 【GOD降臨】全知全能のモデレーター！相手場全消滅＆メンタル3ダメージ＆無敵バリア！");
    } else if (card.id === "god_deepweb") {
      for (var k = 0; k < 2; k++) { if (opp.hand.length > 0) opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1); }
      self.field.forEach(function(m) { m.atk += 2; });
      self.hp = Math.min(20, self.hp + 4);
      ctx.log("🕳️ 【GOD降臨】深淵のインターネット！相手手札2枚破壊＆味方攻撃+2＆メンタル4回復！");
    } else if (card.id === "neko" || card.id === "tono" || card.id === "kirinuki" || card.id === "vtuber_debut") {
      ctx.drawCard(who); ctx.log("✨ 「" + card.name + "」効果：1枚ドロー！");
    } else if (card.id === "yukkuri") {
      ctx.drawCard(who); self.hp = Math.min(20, self.hp + 2);
      ctx.log("🎀 ゆっくり霊夢＆魔理沙：1枚ドロー＆メンタル2回復！");
    } else if (card.id === "zundamon") {
      if (t0 !== -1 && opp.field[t0]) {
        var zName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 2);
        ctx.cleanupDeadMemes();
        ctx.log("🫛 ずんだもん「" + zName + "を倒すのだ！」2ダメージ＆ギガ1回復！");
      } else {
        ctx.log("🫛 ずんだもん「ギガ1回復なのだ！」");
      }
      self.giga = Math.min(self.maxGiga, self.giga + 1);
    } else if (card.id === "hiroyuki_king") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].atk = 0;
        ctx.log("🧔 論破王ひろゆき：「" + opp.field[t0].name + "ってあなたの感想ですよね？」攻撃力を0にした！");
      }
    } else if (card.id === "tokutei_pro") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].freshness = 1;
        ctx.log("🛰️ ガチ特定班：「" + opp.field[t0].name + "」の鮮度を1にした！");
      }
    } else if (card.id === "gabe_dog") {
      self.field.forEach(function(m) { if (m !== card) m.atk += 1; });
      ctx.log("🐩 Gabe the Dog「Bork!」他の味方全員の攻撃力+1！");
    } else if (card.id === "vipper") {
      var c2ch = self.field.filter(function(m) { return m.era === "2ch"; }).length;
      card.atk += c2ch; ctx.log("🧑‍💻 VIPPER効果！場の2ch勢の数だけ攻撃力+" + c2ch + "！");
    } else if (card.id === "elshaddai") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].shield = true;
        ctx.log("👖 エルシャダイ「大丈夫だ、問題ない」→「" + self.field[t0].name + "」に無敵バリア付与！");
      }
    } else if (card.id === "billy") {
      self.field.forEach(function(m) { m.atk += 1; }); self.hp = Math.min(20, self.hp + 3);
      ctx.log("💪 歪みねぇな！味方全員攻撃力+1＆メンタル3回復！");
    } else if (card.id === "kuuhaku") {
      if (self.field.some(function(m) { return m !== card && m.era === "例のアレ"; })) { ctx.drawCard(who); ctx.log("🥋 迫真空手部・裏効果：1枚ドロー！"); }
    } else if (card.id === "resuba_king") {
      if (t0 !== -1 && opp.field[t0]) {
        var rName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 2);
        ctx.cleanupDeadMemes();
        ctx.log("💬 レスバ最強の男：「" + rName + "」に2ダメージ！");
      }
    } else if (card.id === "pepe") {
      if (self.hp < opp.hp) { ctx.drawCard(who); ctx.drawCard(who); ctx.log("🐸 Pepe逆転効果！2枚ドロー！"); }
    } else if (card.id === "meiwaku") {
      if (self.hand.length > 0) self.hand.splice(Math.floor(Math.random() * self.hand.length), 1);
      if (opp.hand.length > 0) opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
      opp.hp -= 2; ctx.log("🚨 迷惑系配信者！お互いの手札1枚破壊＆相手メンタル2ダメージ！");
    } else if (card.id === "genba") {
      if (Math.random() < 0.5) { card.atk += 2; ctx.log("👷 ヨシ！安全確認完了（攻撃力+2）！"); }
      else { ctx.log("💥 労災発生！現場猫は自爆した！"); var gIdx = self.field.indexOf(card); if (gIdx !== -1) self.field.splice(gIdx, 1); }
    } else if (card.id === "donald") { opp.hp -= 2; ctx.log("🤡 ランランルー！メンタルに2ダメージ！"); }
    else if (card.id === "shuzo") { self.field.forEach(function(m) { if (m !== card) m.atk += 1; }); ctx.log("🔥 修造の熱血応援！他の味方全員の攻撃力+1！"); }
    else if (card.id === "yaju") { card.atk += 1; ctx.log("🦁 野獣先輩のプレッシャー！自身の攻撃力+1！"); }
    else if (card.id === "savanna") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].atk = 1;
        ctx.log("🦁 サバンナ男効果！「" + opp.field[t0].name + "」の攻撃力が1になった！");
      }
    } else if (card.id === "nyan") { ctx.drawCard(who); card.atk += 1; ctx.log("🌈 Nyan Cat効果：1枚ドロー＆攻撃力+1！"); }
    else if (card.id === "streamer") { self.giga = Math.min(self.maxGiga, self.giga + 1); ctx.log("🎙️ 大手配信者効果：ギガを1回復！"); }
    // ================= 第1弾追加：第3弾（アニメ）＆第4弾（ゲーム）対策メタ召喚効果 =================
    else if (card.id === "meta_anime_critic") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].era === "アニメ") {
        var erasedAnime = opp.field.splice(t0, 1)[0];
        opp.hp -= 2;
        ctx.log("🧐 【第3弾メタ】原作改変警察！「" + erasedAnime.name + "」の矛盾を指摘して消滅＆本体に2ダメージ！");
      } else {
        ctx.log("🧐 原作改変警察がスタンバイ！（相手の場にアニメミームはいなかった）");
      }
    } else if (card.id === "meta_flag_breaker") {
      var hadBarrierOrAnime = false;
      opp.field.forEach(function(m) {
        if (m.shield) { m.shield = false; hadBarrierOrAnime = true; }
        if (m.era === "アニメ") { m.atk = 0; hadBarrierOrAnime = true; }
      });
      ctx.log(hadBarrierOrAnime
        ? "✂️ 【第3弾メタ】死亡フラグ粉砕機！相手の無敵バリア全解除＆アニメミームの攻撃力を0にした！"
        : "✂️ 死亡フラグ粉砕機が召喚された！");
    } else if (card.id === "meta_anticheat_ban") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].era === "ゲーム") {
        var bannedGame = opp.field.splice(t0, 1)[0];
        self.giga = Math.min(self.maxGiga, self.giga + 1);
        ctx.log("🛡️ 【第4弾メタ】アンチチートBAN！「" + bannedGame.name + "」の壁抜けグリッチを検知して消滅＆ギガ+1！");
      } else {
        ctx.log("🛡️ アンチチートBANが監視を開始！（相手の場にゲームミームはいなかった）");
      }
    } else if (card.id === "meta_boss_nerf") {
      var sealed = false;
      opp.field.forEach(function(m) {
        if (m.hasRevive) { m.hasRevive = false; sealed = true; }
      });
      var gameTarget = (t0 !== -1 && opp.field[t0]) ? opp.field[t0] : null;
      if (gameTarget) {
        ctx.dealDamageToMeme(gameTarget, gameTarget.era === "ゲーム" ? 4 : 2);
        ctx.cleanupDeadMemes();
      }
      ctx.log("🔧 【第4弾メタ】ラスボス弱体化パッチ！" + (sealed ? "第2形態の復活能力を封印＆" : "") + (gameTarget ? "「" + gameTarget.name + "」に痛恨の修正ダメージ！" : "復活能力を封印！"));
    }

    // ================= 第4弾：ゲーム＆実況者・RTAミーム召喚効果 =================
    else if (card.id === "god_rta_runner") {
      ctx.drawCard(who); ctx.drawCard(who);
      self.giga = Math.min(10, self.giga + 2);
      ctx.log("⏱️ 【GOD降臨】世界記録更新（RTA完走者）！2枚ドロー＆ギガ+2回復！");
    } else if (card.id === "god_final_boss") {
      card.hasRevive = true;
      ctx.log("👿 【GOD降臨】伝説のラスボス（第2形態）！破壊されても1度だけ真・最終形態として復活する！");
    } else if (card.id === "ur_wall_clip") {
      opp.hp -= 3;
      ctx.drawCard(who);
      ctx.log("🧱 壁抜けバグ！無敵バリアをすり抜けて相手本体に3ダメージ＆1枚ドロー！");
    } else if (card.id === "ur_gacha_whaler") {
      ctx.drawCard(who); ctx.drawCard(who);
      self.field.forEach(function(m) { m.atk += 1; });
      ctx.log("💳 天井まで回す廃課金兵！2枚ドロー＆味方全体の攻撃力+1！");
    } else if (card.id === "ur_pro_gamer") {
      if (t0 !== -1 && opp.field[t0]) {
        var pgName = opp.field[t0].name;
        opp.field[t0].atk = Math.max(0, opp.field[t0].atk - 2);
        ctx.dealDamageToMeme(opp.field[t0], 3);
        ctx.cleanupDeadMemes();
        ctx.log("🕹️ フレーム単位の格ゲー神！「" + pgName + "」に3ダメージ＆攻撃力-2！");
      }
    } else if (card.id === "sr_kusoge_hunter") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].cost <= 3) {
        var destroyed = opp.field.splice(t0, 1)[0];
        ctx.log("💿 伝説のクソゲーハンター！「" + destroyed.name + "」を攻略（破壊）した！");
      }
    } else if (card.id === "sr_first_play_lie") {
      if (opp.hand.length >= 3) {
        opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
        ctx.log("😏 初見プレイです（周回済）！相手の手札を1枚捨てさせる！");
      }
    } else if (card.id === "sr_lag_switch") {
      if (t0 !== -1 && opp.field[t0]) {
        var lagName = opp.field[t0].name;
        opp.field[t0].freshness -= 1;
        opp.field[t0].atk = 0;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("📡 回線抜き＆ラグ使い！「" + lagName + "」の鮮度-1＆攻撃力を0にした！");
      }
    } else if (card.id === "sr_stream_snipe") {
      if (t0 !== -1 && opp.field[t0] && opp.hand.length > 0) {
        var snipeName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], opp.hand.length);
        ctx.cleanupDeadMemes();
        ctx.log("👁️ ゴースティング視聴者！「" + snipeName + "」に相手手札" + opp.hand.length + "枚分のダメージ！");
      }
    } else if (card.id === "r_kokosuki") {
      if (self.field.some(function(m) { return m !== card && m.era === "ゲーム"; })) {
        ctx.drawCard(who);
        ctx.log("💬 ここ好き（弾幕職人）！ゲーム仲間がいるため1枚ドロー！");
      }
    } else if (card.id === "r_fps_camper") {
      if (t0 !== -1 && opp.field[t0]) {
        var campName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 1);
        ctx.cleanupDeadMemes();
        ctx.log("🎯 角待ちスナイパー！「" + campName + "」に狙撃で1ダメージ！");
      }
    } else if (card.id === "r_healer_aggro") {
      self.hp = Math.min(20, self.hp + 2);
      ctx.log("🪄 回復を忘れた脳筋ヒーラー！メンタル2回復！");
    } else if (card.id === "r_coop_friend") {
      self.hp -= 2;
      ctx.log("💣 フレンドリーファイア常習犯！誤爆で自分のメンタルに2ダメージ！");
    } else if (card.id === "r_achievement") {
      if (self.hp >= 15) {
        card.atk += 2;
        ctx.log("🏆 トロコン達成のやり込み勢！高メンタルボーナスで攻撃力+2！");
      }
    } else if (card.id === "n_lootbox") {
      ctx.drawCard(who);
      ctx.log("🧰 光る宝箱（中身はゴミ）！1枚ドロー！");
    } else if (card.id === "admin_god_dev") {
      card.shield = true;
      var stolenNames = [];
      while (opp.field.length > 0 && self.field.length < 3) {
        var taken = opp.field.shift();
        taken.canAttack = true;
        self.field.push(taken);
        stolenNames.push(taken.name);
      }
      opp.field = [];
      ctx.log("👑 【ADMIN降臨】作者の気まぐれ！相手の場のミームを奪取（" + (stolenNames.join("・") || "全消滅") + "）＆無敵バリア付与！");
    } else if (card.id === "god_flag_master") {
      self.hp = Math.min(20, self.hp + 5);
      ctx.drawCard(who); ctx.drawCard(who);
      self.field.forEach(function(m) { m.atk += 2; m.freshness += 1; });
      ctx.log("🚩 【GOD降臨】『勝ったな、ガハハ！』メンタル+5＆2枚ドロー＆味方全体攻撃+2・鮮度+1！");
    } else if (card.id === "god_tomarunja") {
      var defeated = 0;
      opp.field.forEach(function(m) {
        var before = m.hp;
        ctx.dealDamageToMeme(m, 4);
        if (before > 0 && m.hp <= 0) defeated++;
      });
      ctx.cleanupDeadMemes();
      if (defeated > 0) {
        self.maxGiga = Math.min(10, self.maxGiga + defeated);
        opp.hp -= defeated * 2;
      }
      ctx.log("🕺 【GOD降臨】止まるんじゃねぇぞ…！相手全体に4ダメ（撃破" + defeated + "体：最大ギガ+" + defeated + "＆本体" + (defeated * 2) + "ダメ）！");
    } else if (card.id === "nigecha_dame") {
      if (self.hp <= 10) {
        card.atk += 4; card.hp += 4;
        ctx.log("🤖 暴走覚醒！！「逃げちゃダメだ…」メンタル10以下のため攻撃力+4＆HP+4！");
      } else {
        ctx.log("🤖 「逃げちゃダメだ、逃げちゃダメだ…」");
      }
    } else if (card.id === "hito_no_yume") {
      self.field.forEach(function(m) { m.freshness += 2; });
      ctx.drawCard(who);
      ctx.log("🏴‍☠️ 「人の夢は！！！終わらねェ！！！！」味方全体の鮮度+2＆1枚ドロー！");
    } else if (card.id === "tsumaranu_mono") {
      var beforeLen = opp.field.length;
      opp.field = opp.field.filter(function(m) { return m.cost > 3; });
      var cutCount = beforeLen - opp.field.length;
      ctx.log("⚔️ 「またつまらぬものを斬ってしまった…」相手のコスト3以下を" + cutCount + "体一刀両断！");
    } else if (card.id === "poptepipic") {
      if (Math.random() < 0.5) {
        opp.hp -= 3;
        ctx.log("🖕 クソアニメ精神（表）：相手メンタルに3ダメージ！");
      } else {
        self.hp -= 2; ctx.drawCard(who); ctx.drawCard(who);
        ctx.log("🖕 クソアニメ精神（裏）：自分メンタルに2ダメージ＆2枚ドロー！");
      }
    } else if (card.id === "uchujin_iru") {
      if (self.field.some(function(m) { return m !== card && m.era !== "アニメ"; })) {
        card.atk += 2; ctx.drawCard(who);
        ctx.log("👽 「この中に一人、宇宙人がいる！」異世代コラボで攻撃力+2＆1枚ドロー！");
      }
    } else if (card.id === "aibou_kaerou") {
      if (opp.hand.length > 0) opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
      opp.hp -= 2;
      ctx.log("👁️ 闇のゲーム開始！相手の手札1枚破壊＆本体に2ダメージ！");
    } else if (card.id === "zetsubou_sensei") {
      opp.field.forEach(function(m) { m.atk = Math.max(0, m.atk - 1); });
      self.hp = Math.min(20, self.hp + 3);
      ctx.log("👘 「絶望した！」相手全体の攻撃力-1＆自分メンタル3回復！");
    } else if (card.id === "yamucha") {
      opp.field.forEach(function(m) { ctx.dealDamageToMeme(m, 2); });
      ctx.cleanupDeadMemes();
      ctx.drawCard(who);
      var yIdx = self.field.indexOf(card);
      if (yIdx !== -1) self.field.splice(yIdx, 1);
      ctx.log("💥 「ヤムチャしやがって…」自爆して相手全体に2ダメージ＆1枚ドロー！");
    } else if (card.id === "kurorekishi_note") {
      if (self.usedSpellThisTurn) {
        card.atk += 2;
        ctx.log("🩹 邪王真眼覚醒！攻撃力+2！");
      }
    } else if (card.id === "nikkori_smile") {
      self.field.forEach(function(m) { m.hp += 2; });
      self.hp = Math.min(20, self.hp + 2);
      ctx.log("🤟 にっこにっこにー♪味方全体のHP+2＆メンタル2回復！");
    } else if (card.id === "speedwagon") {
      ctx.drawCard(who);
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 1;
        ctx.log("🎩 スピードワゴンの解説！1枚ドロー＆「" + self.field[t0].name + "」の攻撃力+1！");
      } else {
        ctx.log("🎩 スピードワゴンの解説！1枚ドロー！");
      }
    } else if (card.id === "mob_chara") {
      if (t0 !== -1 && opp.field[t0]) {
        var mobName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 1);
        ctx.cleanupDeadMemes();
        ctx.log("🚚 異世界転生トラック突撃！「" + mobName + "」に1ダメージ！");
      }
    } else if (card.id === "osananajimi") {
      if (self.hp < opp.hp) { card.hp += 2; ctx.log("🎀 幼馴染の意地！HP+2！"); }
    } else if (card.id === "nyanpasu") {
      self.hp = Math.min(20, self.hp + 2);
      ctx.log("🪈 にゃんぱすー！メンタルが2回復した！");
    } else if (card.id === "haraguro_megane") {
      if (self.hand.length <= 3) { ctx.drawCard(who); ctx.log("👓 メガネクイッ…1枚ドロー！"); }
    } else if (card.id === "kininarimasu") {
      ctx.drawCard(who);
      if (self.hand.length > 0) self.hand.splice(Math.floor(Math.random() * self.hand.length), 1);
      ctx.log("🧐 「私、気になります！」1枚ドロー＆1枚ランダム破棄！");
    }
    // ================= 第5弾：スマホ・ソシャゲ＆SNSバズ編 召喚効果 =================
    else if (card.id === "god_jinken_chara") {
      if (self.field.length < 3) {
        var hiIdx = self.deck.findIndex(function(c) { return c.type === "meme" && c.cost >= 4; });
        if (hiIdx !== -1) {
          var pulled = self.deck.splice(hiIdx, 1)[0];
          pulled.canAttack = true; pulled.isBuzz = true;
          self.field.push(pulled);
          ctx.log("🌈 【天井確定】山札から「" + pulled.name + "」が直接降臨！");
        }
      }
      self.field.forEach(function(m) { m.shield = true; m.atk += 2; });
      ctx.log("🌈 【GOD降臨】人権キャラ実装！味方全員に無敵バリア＆攻撃力+2！");
    } else if (card.id === "ur_whale_emperor") {
      card.shield = true;
      self.field.forEach(function(m) { if (m.era === "ソシャゲ") m.atk += 2; });
      ctx.log("👑 完凸理論値の廃課金ランカー！無敵バリア＆ソシャゲ味方全員の攻撃力+2！");
    } else if (card.id === "sr_apology_gems") {
      self.giga = Math.min(self.maxGiga, self.giga + 2);
      opp.giga = Math.min(opp.maxGiga, opp.giga + 2);
      ctx.drawCard(who); ctx.drawCard(who);
      ctx.log("💎 メンテ延長のお詫び石！お互いギガ+2＆自分は2枚ドロー！");
    } else if (card.id === "sr_login_only") {
      self.hp = Math.min(20, self.hp + 2);
      ctx.drawCard(who);
      ctx.log("📅 ログイン勢！メンタル2回復＆1枚ドロー！");
    } else if (card.id === "sr_kakin_inflation") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].cost <= 2) {
        var oldUnit = opp.field.splice(t0, 1)[0];
        ctx.log("📈 インフレ新環境！「" + oldUnit.name + "」は環境落ち（破壊）した！");
      }
    } else if (card.id === "r_reroll_loop") {
      if (self.hand.length > 0) self.hand.splice(Math.floor(Math.random() * self.hand.length), 1);
      ctx.drawCard(who); ctx.drawCard(who);
      ctx.log("🔄 リセマラ周回勢！手札1枚をやり直して2枚ドロー！");
    } else if (card.id === "r_collab_gacha") {
      if (self.field.some(function(m) { return m !== card && m.era !== "ソシャゲ"; })) {
        card.atk += 2; ctx.drawCard(who);
        ctx.log("🎪 異業種コラボ成立！攻撃力+2＆1枚ドロー！");
      }
    } else if (card.id === "r_daily_mission") {
      self.giga = Math.min(self.maxGiga, self.giga + 1);
      ctx.log("✅ デイリー消化ガチ勢！ギガを1回復！");
    } else if (card.id === "n_gacha_salt") {
      self.hp = Math.min(20, self.hp + 2);
      ctx.log("🧂 爆死スクショ供養勢！いいねでメンタルが2回復！");
    }
    // ================= 第6弾：AI・テクノロジー＆未来インターネット編 召喚効果 =================
    else if (card.id === "god_genesis_meme") {
      card.pierceShield = true;
      opp.field = [];
      self.field.forEach(function(m) { m.atk += 5; m.hp += 5; m.shield = true; });
      ctx.drawCard(who); ctx.drawCard(who); ctx.drawCard(who);
      opp.hp -= 5;
      ctx.log("👑 【伝説降臨】インターネットの創世神！相手盤面を全消滅＋味方全体ATK+5・HP+5＆無敵バリア＋3枚ドロー＋相手本体に5ダメージ！");
    } else if (card.id === "god_singularity") {
      self.field.forEach(function(m) { m.atk += 3; m.hp += 3; m.shield = true; });
      ctx.drawCard(who); ctx.drawCard(who);
      opp.hp -= 3;
      ctx.log("🧠 【GOD降臨】シンギュラリティ到達！味方全体攻撃+3・HP+3＆無敵バリア＋2枚ドロー＋相手本体3ダメージ！");
    } else if (card.id === "ur_deepfake_master") {
      if (t0 !== -1 && opp.field[t0]) {
        var copied = opp.field[t0];
        card.atk = Math.max(card.atk, copied.atk);
        card.hp = Math.max(card.hp, copied.hp);
        ctx.log("🎭 ディープフェイク職人！「" + copied.name + "」を学習コピーしATK" + card.atk + "/HP" + card.hp + "になった！");
      } else {
        ctx.log("🎭 ディープフェイク職人がスタンバイ！");
      }
    } else if (card.id === "ur_agi_prototype") {
      if (self.hand.length >= 3) {
        self.field.forEach(function(m) { m.atk += 2; });
        ctx.drawCard(who);
        ctx.log("⚛️ 汎用人工知能AGI-0！豊富なデータ量で味方全体攻撃+2＆1枚ドロー！");
      } else {
        card.atk += 1;
        ctx.log("⚛️ 汎用人工知能AGI-0！自己学習で攻撃力+1！");
      }
    } else if (card.id === "sr_spam_bot_factory") {
      var spawned = 0;
      while (self.field.length < 3 && spawned < 2) {
        self.field.push({
          id: "n_copy_bot_token", pack: 6, name: "自動生成コピーボット", type: "meme", era: "AI・テック",
          rarity: "N", cost: 0, atk: 2, hp: 1, freshness: 2, icon: "🤖", canAttack: true, isBuzz: false
        });
        spawned++;
      }
      ctx.log("🏭 自動生成スパムボット量産機！コピーボットを" + spawned + "体展開した！");
    } else if (card.id === "sr_ai_voice_cover") {
      var spIdx = self.deck.findIndex(function(c) { return c.type === "spell"; });
      if (spIdx !== -1) {
        var pulledSp = self.deck.splice(spIdx, 1)[0];
        self.hand.push(pulledSp);
        ctx.log("🎙️ AI音声カバー職人！山札から構文「" + pulledSp.name + "」をサーチ＆ギガ+1！");
      } else {
        ctx.drawCard(who);
        ctx.log("🎙️ AI音声カバー職人！1枚ドロー＆ギガ+1！");
      }
      self.giga = Math.min(self.maxGiga, self.giga + 1);
    } else if (card.id === "sr_blockchain_nft") {
      card.shield = true;
      if (opp.hand.length >= 4) {
        opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
        ctx.log("🐵 高額NFTサル画像！無敵バリア付与＆相手の手札を1枚破棄！");
      } else {
        ctx.log("🐵 高額NFTサル画像！無敵バリアを付与！");
      }
    } else if (card.id === "r_vrchat_mute") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].shield = true;
        ctx.log("🥽 VRChatの無言勢！ジェスチャーで「" + self.field[t0].name + "」に無敵バリア付与！");
      }
    } else if (card.id === "r_ai_vtuber") {
      self.hp = Math.min(20, self.hp + 2);
      ctx.log("📡 24時間稼働AIライバー！癒やし配信でメンタル2回復！");
    } else if (card.id === "r_robot_arm_fail") {
      opp.hp -= 1;
      ctx.log("🦾 ポンコツ二足歩行ロボット転倒！勢いで相手本体に1ダメージ！");
    } else if (card.id === "n_ai_hands_6fingers") {
      if (t0 !== -1 && opp.field[t0]) {
        var h6Name = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 1);
        ctx.cleanupDeadMemes();
        ctx.log("🖐️ 指が6本あるAI生成イラスト！違和感で「" + h6Name + "」に1ダメージ！");
      }
    } else if (card.id === "n_smart_speaker") {
      opp.hp -= 1;
      ctx.drawCard(who);
      ctx.log("🔊 深夜に突然喋り出すスマートスピーカー！相手本体に1ダメ＆1枚ドロー！");
    }
  },

  executeSpell: function(ctx, who, card, targets) {
    targets = targets || [];
    var state = ctx.state;
    var self = state[who], opp = state[who === "p1" ? "p2" : "p1"];
    var steps = this.getTargetSteps(card);
    var t0 = (steps && steps[0]) ? this.resolveTargetIndex(steps[0].side === "opp" ? opp.field : self.field, steps[0], card, targets[0]) : -1;
    var t1 = (steps && steps[1]) ? this.resolveTargetIndex(steps[1].side === "opp" ? opp.field : self.field, steps[1], card, targets[1]) : -1;

    if (card.id === "ronpa") {
      if (t0 !== -1 && opp.field[t0]) { var n1 = opp.field[t0].name; ctx.dealDamageToMeme(opp.field[t0], 3); ctx.log("🤔 論破！「" + n1 + "」に3ダメージ！"); }
    } else if (card.id === "numai") {
      if (t0 !== -1 && opp.field[t0]) { var n2 = opp.field[t0].name; ctx.dealDamageToMeme(opp.field[t0], 2); ctx.log("🔨 ガッ！「" + n2 + "」に2ダメージ！"); }
    } else if (card.id === "seiron") {
      if (t0 !== -1 && opp.field[t0]) { var n3 = opp.field[t0].name; ctx.dealDamageToMeme(opp.field[t0], 4); ctx.log("🥊 正論パンチ！「" + n3 + "」に4ダメージ！"); }
    } else if (card.id === "ojisan") { opp.field.forEach(function(m) { m.atk = Math.max(0, m.atk - 2); }); ctx.log("👴 おじさん構文で相手ミーム全員の攻撃力が-2！"); }
    else if (card.id === "troll_2ch") {
      if (opp.hand.length > 0) opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
      ctx.drawCard(who); ctx.log("🎣 釣りスレ主！相手手札1枚破壊＆1枚ドロー！");
    } else if (card.id === "badapple") {
      opp.field.forEach(function(m) { m.atk = Math.max(0, m.atk - 1); ctx.dealDamageToMeme(m, 2); });
      ctx.log("🍎 Bad Apple!! 相手ミーム全員に2ダメージ＆攻撃力-1！");
    } else if (card.id === "sanninsyu") {
      self.field.forEach(function(m) { m.atk += 1; m.hp += 2; m.shield = true; });
      ctx.log("🏆 三人の勝者！味方全員の攻撃+1＆HP+2＆無敵バリア付与！");
    } else if (card.id === "yakusoku_j") {
      if (t0 !== -1 && opp.field[t0]) {
        var n4 = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 3);
        ctx.log("🔢 33-4の呪い！「" + n4 + "」に3ダメ＆本体に1ダメ！");
      } else {
        ctx.log("🔢 33-4の呪い！相手本体に1ダメ！");
      }
      opp.hp -= 1;
    } else if (card.id === "gacha_bakushi") {
      self.giga = Math.min(self.maxGiga, self.giga + 2); ctx.drawCard(who);
      ctx.log("💸 ガチャ爆死配信！ギガ2回復＆1枚ドロー！");
    } else if (card.id === "digital_tattoo") {
      if (t0 !== -1 && opp.field[t0]) {
        var n5 = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 3);
        ctx.log("🖋️ デジタルタトゥー！「" + n5 + "」に3ダメ＆本体に2ダメ！");
      } else {
        ctx.log("🖋️ デジタルタトゥー！相手本体に2ダメ！");
      }
      opp.hp -= 2;
    } else if (card.id === "owakon") {
      var oldEras = ["2ch", "ニコニコ", "例のアレ", "VIP/なんJ"];
      if (t0 !== -1 && opp.field[t0] && oldEras.indexOf(opp.field[t0].era) !== -1) {
        ctx.log("📉 「" + opp.field[t0].name + "」はオワコン認定され消滅した！");
        opp.field.splice(t0, 1);
      } else {
        ctx.log("📉 対象となる古い世代のミームがいなかった...");
      }
    } else if (card.id === "kusa") { self.field.forEach(function(m) { m.atk += 1; }); ctx.log("🌱 大草原！味方全員の攻撃力+1！"); }
    else if (card.id === "matsuri") { self.field.forEach(function(m) { m.freshness += 2; m.atk += 1; }); ctx.log("🏮 祭りだワッショイ！味方全員の鮮度+2＆攻撃力+1！"); }
    else if (card.id === "onmyoji") {
      if (t0 !== -1 && opp.field[t0]) {
        var n6 = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 2);
        ctx.log("☯️ レッツゴー陰陽師！「" + n6 + "」に2ダメージ＆メンタル2回復！");
      } else {
        ctx.log("☯️ レッツゴー陰陽師！メンタル2回復！");
      }
      self.hp = Math.min(20, self.hp + 2);
    } else if (card.id === "short_video") {
      ctx.drawCard(who);
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].freshness += 1;
        ctx.log("📱 ショート動画の沼！1枚ドロー＆「" + self.field[t0].name + "」の鮮度+1！");
      } else {
        ctx.log("📱 ショート動画の沼！1枚ドロー！");
      }
    } else if (card.id === "icetea") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].hp += 3; self.field[t0].freshness += 1;
        ctx.log("🧊 アイスティー差し入れ！「" + self.field[t0].name + "」のHP+3＆鮮度+1！");
      }
    } else if (card.id === "grass_hayasu") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 2;
        ctx.log("🌿 草生える！「" + self.field[t0].name + "」の攻撃力+2！");
      }
    } else if (card.id === "stonks") { if (self.maxGiga < 10) self.maxGiga++; ctx.drawCard(who); ctx.log("📈 Stonks！最大ギガ+1＆1枚ドロー！"); }
    else if (card.id === "enjo_nenryo") {
      if (t0 !== -1 && opp.field[t0]) {
        var eName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 3);
        if (opp.field[t0] && opp.field[t0].hp <= 0) {
          ctx.drawCard(who);
          ctx.log("⛽ 炎上燃料投下！「" + eName + "」を撃破！ボーナスで1枚ドロー！");
        } else {
          ctx.log("⛽ 炎上燃料投下！「" + eName + "」に3ダメージ！");
        }
      }
    } else if (card.id === "x_spec") {
      opp.field.forEach(function(m) { m.freshness -= 1; });
      opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
      ctx.log("🔧 仕様変更！相手ミーム全ての鮮度が-1された！");
    } else if (card.id === "bazu_tweet") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].isBuzz = true; self.field[t0].shield = true;
        ctx.log("🚀 万バズ構文！「" + self.field[t0].name + "」にバズ＆無敵バリア付与！");
      }
    } else if (card.id === "danmaku") { self.field.forEach(function(m) { m.atk += 1; }); ctx.drawCard(who); ctx.log("💬 弾幕展開！味方全員の攻撃力+1＆1枚ドロー！"); }
    else if (card.id === "kaiko") {
      var newEras = ["令和", "配信者", "X炎上"];
      if (opp.field.some(function(m) { return newEras.indexOf(m.era) !== -1; })) { opp.hp -= 4; ctx.log("📺 懐古厨の説教が刺さり、相手メンタルに4ダメージ！"); }
      else { opp.hp -= 1; ctx.log("📺 懐古厨のぼやきで相手メンタルに1ダメージ。"); }
    } else if (card.id === "copyright") {
      if (t0 !== -1 && opp.field[t0] && (opp.field[t0].era === "ニコニコ" || opp.field[t0].era === "海外")) {
        ctx.log("⚠️ 著作権侵害により「" + opp.field[t0].name + "」は削除された！");
        opp.field.splice(t0, 1);
        ctx.drawCard(who);
      } else {
        ctx.log("⚠️ 削除対象のミームがいなかった...");
      }
    } else if (card.id === "tokutei") {
      if (t0 !== -1 && opp.field[t0] && (opp.field[t0].era === "配信者" || opp.field[t0].era === "X炎上")) {
        opp.field[t0].atk = 0; opp.field[t0].freshness = 1;
        ctx.log("🔍 特定班により「" + opp.field[t0].name + "」は炎上し無力化（攻撃0・鮮度1）！");
      } else {
        ctx.log("🔍 特定対象のミームがいなかった...");
      }
    } else if (card.id === "honyaku") {
      ctx.drawCard(who);
      if (self.field.some(function(m) { return m.era === "海外"; })) { ctx.drawCard(who); ctx.log("🌐 翻訳ニキの解説で海外ミームの理解が深まり2枚ドロー！"); }
      else { ctx.log("🌐 翻訳ニキの解説で1枚ドロー！"); }
    } else if (card.id === "jaken") {
      if (t0 !== -1 && opp.field[t0]) {
        var jName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 4);
        ctx.log("🗡️ 邪剣「夜」発動！「" + jName + "」に4ダメージ＆本体に2ダメージ！");
      } else {
        ctx.log("🗡️ 邪剣「夜」発動！相手本体に2ダメージ！");
      }
      opp.hp -= 2;
    } else if (card.id === "karate") { self.field.forEach(function(m) { m.atk += 2; }); ctx.log("🥋 迫真空手部の特訓！味方全員の攻撃力+2！"); }
    else if (card.id === "rickroll" && opp.hand.length > 0) { opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1); ctx.log("🕺 Rickroll！相手の手札を1枚捨てさせた！"); }
    else if (card.id === "supacha") { self.giga = Math.min(self.maxGiga, self.giga + 2); ctx.log("💸 ナイスパ！ギガが2回復した！"); }
    else if (card.id === "shazai") { self.field = []; opp.field = []; ctx.log("🙇 炎上謝罪会見！場のミームが全て消滅した！"); }
    else if (card.id === "comnote") {
      if (t0 !== -1 && opp.field[t0]) {
        var cName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 3);
        ctx.log("📝 コミュニティノート！「" + cName + "」に3ダメージ＆自分のメンタル2回復！");
      } else {
        ctx.log("📝 コミュニティノート！自分のメンタル2回復！");
      }
      self.hp = Math.min(20, self.hp + 2);
    } else if (card.id === "gakkyukai") { self.field.forEach(function(m) { ctx.dealDamageToMeme(m, 2); }); opp.field.forEach(function(m) { ctx.dealDamageToMeme(m, 2); }); ctx.log("🔥 Xの学級会！お互いの場のミーム全てに2ダメージ！"); }
    else if (card.id === "ban") {
      if (t0 !== -1 && opp.field[t0]) {
        var bName = opp.field[t0].name;
        opp.field.splice(t0, 1);
        ctx.log("❄️ アカウント凍結！「" + bName + "」を消滅＆本体に2ダメージ！");
      } else {
        ctx.log("❄️ アカウント凍結！相手本体に2ダメージ！");
      }
      opp.hp -= 2;
    }
    // ================= 新規メタ＆GODキラー効果 =================
    else if (card.id === "dat_ochi") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].era === "2ch") {
        ctx.log("🗄️ DAT落ちにより「" + opp.field[t0].name + "」は過去ログの彼方へ消滅！本体に2ダメージ！");
        opp.field.splice(t0, 1);
        opp.hp -= 2;
      } else {
        ctx.drawCard(who);
        ctx.log("🗄️ 2chミームがいなかったため、資料を整理して1枚ドロー！");
      }
    } else if (card.id === "elon_ban") {
      var xTargets = opp.field.filter(function(m) { return m.era === "X炎上"; });
      if (xTargets.length > 0) {
        xTargets.forEach(function(m) { m.shield = false; ctx.dealDamageToMeme(m, 4); });
        ctx.log("🐦 イーロンの気まぐれ凍結！相手の「X炎上」ミーム全てのバリアを剥がし4ダメージ！");
      } else {
        ctx.log("🐦 対象の「X炎上」ミームがいなかった...");
      }
    } else if (card.id === "omakuni") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].era === "海外") {
        ctx.log("🚫 おま国発動！「" + opp.field[t0].name + "」はお住まいの地域では利用できません！");
        opp.field.splice(t0, 1);
        self.giga = Math.min(self.maxGiga, self.giga + 1);
      } else {
        ctx.drawCard(who);
        ctx.log("🚫 海外ミームがいなかったため、VPNを繋いで1枚ドロー！");
      }
    } else if (card.id === "god_killer_503") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].rarity === "GOD") {
        var godName = opp.field[t0].name;
        opp.field.splice(t0, 1);
        opp.hp -= 3;
        ctx.drawCard(who);
        ctx.drawCard(who);
        ctx.log("🔌 【GODキラー発動!!】503 Errorにより神「" + godName + "」が強制ダウン！本体3ダメ＆2枚ドロー！");
      } else {
        ctx.log("🔌 鯖落ちを発動したが、相手の場に「GOD」レアがいなかったため不発に終わった...");
      }
    }

    // ================= 第3弾：アニメミーム構文効果 =================
    else if (card.id === "daga_kotowaru") {
      var msgs = [];
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].shield = true;
        msgs.push("「" + self.field[t0].name + "」に無敵バリア付与");
      }
      if (t1 !== -1 && opp.field[t1]) {
        opp.field[t1].atk = 0;
        msgs.push("「" + opp.field[t1].name + "」の攻撃力を0にした");
      }
      ctx.log("🙅 「だが断る」" + (msgs.join("＆") || "効果発動！"));
    } else if (card.id === "omae_shindeiru") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].freshness = 1;
        ctx.log("👉 「お前はもう死んでいる」「" + opp.field[t0].name + "」の鮮度を1にし、本体に3ダメージ！");
      } else {
        ctx.log("👉 「お前はもう死んでいる」相手本体に3ダメージ！");
      }
      opp.hp -= 3;
    } else if (card.id === "keikaku_dori") {
      ctx.drawCard(who); ctx.drawCard(who); ctx.drawCard(who);
      self.hand.forEach(function(h) { if (h.type === "spell") h.cost = Math.max(0, h.cost - 1); });
      ctx.log("📓 「計画通り」3枚ドロー＆手札の構文カード全てのコスト-1！");
    } else if (card.id === "douiukoto_nano") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].shield = false;
        opp.field[t0].atk = Math.max(0, opp.field[t0].atk - 2);
        opp.field[t0].freshness = Math.max(1, opp.field[t0].freshness - 1);
        ctx.log("😨 「どういうことなの…」「" + opp.field[t0].name + "」のバリア解除＆攻撃-2・鮮度-1！");
      }
    } else if (card.id === "oni_ni_naranai") {
      if (t0 !== -1 && opp.field[t0] && opp.field[t0].cost <= 2 && self.field.length < 3) {
        var stolen = opp.field.splice(t0, 1)[0];
        stolen.canAttack = true;
        self.field.push(stolen);
        ctx.log("👹 「お前も鬼にならないか？」相手の「" + stolen.name + "」を寝返らせた！");
      } else {
        ctx.log("👹 対象がいなかったか、自分の場がいっぱいで不発に終わった...");
      }
    } else if (card.id === "oi_duel_shiroyo") {
      ctx.drawCard(who); ctx.drawCard(who);
      var oppKey = (who === "p1" ? "p2" : "p1");
      ctx.drawCard(oppKey); ctx.drawCard(oppKey);
      self.giga = Math.min(self.maxGiga, self.giga + 2);
      ctx.log("🃏 「おい、デュエルしろよ」お互い2枚ドロー＆自分のギガ2回復！");
    } else if (card.id === "nanimo_kowakunai") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].hp += 4; self.field[t0].atk += 2; self.field[t0].freshness = 1;
        ctx.log("🎀 「もう何も恐くない」「" + self.field[t0].name + "」HP+4＆攻撃+2の全力解放（鮮度1）！");
      }
    } else if (card.id === "kamikai_sakuga") {
      self.field.forEach(function(m) { m.atk += 2; m.hp += 2; });
      ctx.log("✨ 神回覚醒！味方全員の攻撃力+2＆HP+2！");
    } else if (card.id === "kono_subarashii") {
      opp.field.forEach(function(m) { ctx.dealDamageToMeme(m, 4); });
      self.maxGiga = Math.max(1, self.maxGiga - 1);
      ctx.log("💥 エクスプロージョン！！相手全体に4ダメージ（代償で最大ギガ-1）！");
    } else if (card.id === "kisama_miteiruna") {
      if (opp.hand.length > 0) {
        var peek = opp.hand[Math.floor(Math.random() * opp.hand.length)];
        ctx.log("👀 「貴様…見ているなッ！」相手の手札に「" + peek.name + "」を確認！");
      }
      ctx.drawCard(who);
    } else if (card.id === "anta_bakaa") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 3;
        self.field[t0].freshness = Math.max(1, self.field[t0].freshness - 1);
        ctx.log("💢 「あんたバカァ！？」「" + self.field[t0].name + "」の攻撃力+3＆鮮度-1！");
      }
    } else if (card.id === "sakuga_houkai") {
      opp.field.forEach(function(m) { m.atk = Math.max(0, m.atk - 2); });
      ctx.log("🥬 作画崩壊！相手ミーム全ての攻撃力が-2された！");
    } else if (card.id === "soushuuhen") {
      self.field.forEach(function(m) { m.freshness += 1; });
      opp.field.forEach(function(m) { m.freshness += 1; });
      ctx.drawCard(who);
      ctx.log("📼 総集編！お互いの場の鮮度+1＆1枚ドロー！");
    } else if (card.id === "ore_no_turn") {
      self.giga = Math.min(self.maxGiga, self.giga + 1);
      ctx.drawCard(who);
      ctx.log("⏭️ 「ずっと俺のターン！」ギガ1回復＆1枚ドロー！");
    } else if (card.id === "uso_da") {
      if (t0 !== -1 && opp.field[t0]) {
        var uName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 3);
        ctx.log("🔪 「嘘だッ！！！」「" + uName + "」に3ダメ＆本体に1ダメ！");
      } else {
        ctx.log("🔪 「嘘だッ！！！」相手本体に1ダメ！");
      }
      opp.hp -= 1;
    } else if (card.id === "jikai_yokoku") {
      if (t0 !== -1 && opp.field[t0]) {
        var jkName = opp.field[t0].name;
        opp.field[t0].freshness -= 2;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("📢 次回予告！「" + jkName + "」の鮮度が-2された！");
      }
    } else if (card.id === "sekai_he_habatake") {
      self.hp -= 3;
      ctx.drawCard(who); ctx.drawCard(who);
      ctx.log("⚖️ 等価交換！メンタルを3削り2枚ドロー！");
    } else if (card.id === "shujinkou_hosei") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 1; self.field[t0].hp += 2;
        ctx.log("🌟 主人公補正！「" + self.field[t0].name + "」の攻撃力+1＆HP+2！");
      }
    } else if (card.id === "gomen_yui") {
      if (t0 !== -1 && self.field[t0]) {
        var sac = self.field.splice(t0, 1)[0];
        self.giga = Math.min(self.maxGiga, self.giga + 2);
        ctx.drawCard(who);
        ctx.log("💔 「ごめん、ユイ…」" + sac.name + "を犠牲にギガ2回復＆1枚ドロー！");
      }
    } else if (card.id === "tsundere") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 2;
        ctx.log("😤 ツンデレ応援！「" + self.field[t0].name + "」の攻撃力+2！");
      }
    } else if (card.id === "to_be_continued") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].freshness += 2; self.field[t0].hp += 2;
        ctx.log("🎸 To Be Continued... 「" + self.field[t0].name + "」鮮度+2＆HP+2！");
      }
    } else if (card.id === "yamete_raifu") {
      if (self.hp <= 8) {
        self.hp = Math.min(20, self.hp + 5);
        ctx.log("😱 「もうやめて！ライフはとっくにゼロよ！」メンタル5回復！");
      } else {
        ctx.log("😱 まだライフが残っていたため不発に終わった...");
      }
    } else if (card.id === "ikari_no_super") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 3;
        ctx.log("⚡ 「クリリンのことかーーーっ！！」「" + self.field[t0].name + "」の攻撃力+3！");
      }
    } else if (card.id === "op_skip") {
      if (t0 !== -1 && opp.field[t0]) {
        var opName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 2);
        ctx.log("⏩ OPスキップ！「" + opName + "」に2ダメージ！");
      }
    }

    // ================= 第1弾追加：第3弾（アニメ）＆第4弾（ゲーム）対策メタスペル効果 =================
    else if (card.id === "meta_spoiler_troll") {
      var hitAnime = 0;
      opp.field.forEach(function(m) {
        if (m.era === "アニメ") {
          m.atk = Math.max(0, m.atk - 2);
          m.freshness -= 1;
          hitAnime++;
        }
      });
      opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
      ctx.drawCard(who);
      ctx.log("📢 【第3弾メタ】最終回ネタバレ荒らし！アニメミーム" + hitAnime + "体の攻撃力-2＆鮮度-1＋1枚ドロー！");
    } else if (card.id === "meta_server_maint") {
      var hitGame = 0;
      opp.field.forEach(function(m) {
        if (m.era === "ゲーム") {
          m.atk = 0;
          m.freshness -= 1;
          hitGame++;
        }
      });
      opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
      ctx.drawCard(who);
      ctx.log("🚧 【第4弾メタ】緊急メンテナンス！ゲームミーム" + hitGame + "体の攻撃力0＆鮮度-1＋1枚ドロー！");
    }

    // ================= 第4弾：ゲーム＆実況者・RTAスペル効果 =================
    else if (card.id === "ur_save_load") {
      self.hp = Math.min(20, self.hp + 4);
      ctx.drawCard(who); ctx.drawCard(who);
      self.field.forEach(function(m) { m.freshness += 1; });
      ctx.log("💾 禁断のセーブ＆ロード！メンタル4回復＆2枚ドロー＆味方全体の鮮度+1！");
    } else if (card.id === "sr_speedrun_chart") {
      ctx.drawCard(who); ctx.drawCard(who);
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 2;
        ctx.log("📋 分厚いRTAチャート表！2枚ドロー＆「" + self.field[t0].name + "」の攻撃力+2！");
      } else {
        ctx.log("📋 分厚いRTAチャート表！2枚ドロー！");
      }
    } else if (card.id === "sr_timer_stop") {
      opp.field.forEach(function(m) { m.atk = Math.max(0, m.atk - 2); });
      opp.hp -= 2;
      ctx.log("🛑 タイマーストップ！相手ミーム全体の攻撃力-2＆相手本体に2ダメージ！");
    } else if (card.id === "sr_gacha_explosion") {
      opp.field.forEach(function(m) { ctx.dealDamageToMeme(m, 2); });
      self.hp -= 1;
      ctx.log("💥 爆死確定演出！相手ミーム全体に2ダメージ（自分も1ダメージ）！");
    } else if (card.id === "sr_rage_quit") {
      if (t0 !== -1 && opp.field[t0]) {
        var rqName = opp.field[t0].name;
        var beforeHp = opp.field[t0].hp;
        ctx.dealDamageToMeme(opp.field[t0], 4);
        if (beforeHp < 4) opp.hp -= 1;
        ctx.log("👊 台パン＆コントローラー破壊！「" + rqName + "」に4ダメージ！");
      }
    } else if (card.id === "r_boss_bgm") {
      self.field.forEach(function(m) { m.atk += 1; m.freshness += 1; });
      ctx.log("🎸 処刑用BGMが流れ出す瞬間！味方全体の攻撃力+1＆鮮度+1！");
    } else if (card.id === "r_hitbox_bug") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].shield = true;
        ctx.log("🔲 当たり判定ガバガバ現象！「" + self.field[t0].name + "」に無敵バリア付与！");
      }
    } else if (card.id === "r_patch_nerf") {
      if (t0 !== -1 && opp.field[t0]) {
        var pnName = opp.field[t0].name;
        opp.field[t0].atk = Math.max(0, opp.field[t0].atk - 3);
        ctx.dealDamageToMeme(opp.field[t0], 1);
        ctx.log("📉 緊急アプデの下方修正！「" + pnName + "」の攻撃力-3＆HP-1！");
      }
    } else if (card.id === "r_loading_99") {
      if (t0 !== -1 && opp.field[t0]) {
        var ldName = opp.field[t0].name;
        opp.field[t0].freshness -= 1;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("⏳ 99%で止まるロード画面！「" + ldName + "」の鮮度-1＆1枚ドロー！");
      } else {
        ctx.log("⏳ 99%で止まるロード画面！1枚ドロー！");
      }
      ctx.drawCard(who);
    } else if (card.id === "r_double_jump") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 1; self.field[t0].hp += 2;
        ctx.log("🦘 謎の2段ジャンプ物理法則！「" + self.field[t0].name + "」の攻撃力+1＆HP+2！");
      }
    } else if (card.id === "n_yakusou") {
      self.hp = Math.min(20, self.hp + 3);
      ctx.log("🌿 初期装備のやくそう！メンタル3回復！");
    } else if (card.id === "n_wooden_sword") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 2;
        ctx.log("🪵 ひのきのぼう！「" + self.field[t0].name + "」の攻撃力+2！");
      }
    } else if (card.id === "n_fps_drop") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].atk = Math.max(0, opp.field[t0].atk - 2);
        ctx.log("🐌 処理落ちカクカク現象！「" + opp.field[t0].name + "」の攻撃力-2！");
      }
    } else if (card.id === "n_gg_ez") {
      opp.hp -= 2;
      ctx.log("🗨️ 煽りチャット「GG EZ」！相手本体に2ダメージ！");
    } else if (card.id === "n_easter_egg") {
      self.giga = Math.min(self.maxGiga, self.giga + 1);
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].freshness += 1;
        ctx.log("🔑 開発者の隠し部屋！ギガ1回復＆「" + self.field[t0].name + "」の鮮度+1！");
      } else {
        ctx.log("🔑 開発者の隠し部屋！ギガ1回復！");
      }
    } else if (card.id === "n_fall_damage") {
      if (t0 !== -1 && opp.field[t0]) {
        var fdName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 2);
        ctx.log("🪂 落下ダメージ確認勢！「" + fdName + "」に2ダメージ！");
      }
    } else if (card.id === "n_respawn_point") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].hp += 3;
        ctx.log("🔥 リスポーン地点の焚き火！「" + self.field[t0].name + "」のHPを3回復！");
      }
    }

    // ================= 管理者（開発者）専用スペル効果 =================
    else if (card.id === "admin_ban_hammer") {
      opp.field = [];
      for (var ah = 0; ah < 2; ah++) {
        if (opp.hand.length > 0) opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
      }
      self.hp = 20;
      self.maxGiga = 10;
      self.giga = 10;
      ctx.log("🔨 【ADMIN権限発動】BANハンマー！相手場全消滅＆相手手札2枚破壊＆メンタル全回復＆ギガMAX！");
    } else if (card.id === "admin_debug_mode") {
      ctx.drawCard(who); ctx.drawCard(who); ctx.drawCard(who);
      self.hand.forEach(function(h) { h.cost = 0; });
      ctx.log("💻 【ADMIN権限発動】デバッグモード起動！3枚ドロー＆手札すべてのコストが0になった！");
    }
    // ================= 第5弾：スマホ・ソシャゲ＆SNSバズ編 スペル効果 =================
    else if (card.id === "god_sashu_notice") {
      self.field = []; opp.field = [];
      self.hand = []; opp.hand = [];
      var oppKey5 = (who === "p1" ? "p2" : "p1");
      for (var s5 = 0; s5 < 3; s5++) { ctx.drawCard(who); ctx.drawCard(oppKey5); }
      ctx.log("🪦 【GOD構文】サ終のお知らせ！両者の盤面をバリア貫通で全消滅＆手札リセット3枚ドロー！");
    } else if (card.id === "ur_single_pull_god") {
      ctx.drawCard(who); ctx.drawCard(who); ctx.drawCard(who);
      self.hand.forEach(function(h) { h.cost = Math.max(0, h.cost - 1); });
      ctx.log("✨ 無課金勢の奇跡（単発神引き）！3枚ドロー＆手札全てのコスト-1！");
    } else if (card.id === "ur_stamina_stone") {
      self.giga = self.maxGiga;
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].freshness += 2;
        self.field[t0].canAttack = true;
        ctx.log("💠 スタミナ全回復の石割り！ギガ全回復＆「" + self.field[t0].name + "」鮮度+2＆再行動可能！");
      } else {
        ctx.log("💠 スタミナ全回復の石割り！ギガが全回復した！");
      }
    } else if (card.id === "sr_surinuke_bakushi") {
      if (t0 !== -1 && opp.field[t0]) {
        var sbName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 3);
        if (opp.field[t0]) opp.field[t0].freshness = Math.max(1, opp.field[t0].freshness - 1);
        ctx.log("😭 すり抜け爆死！「" + sbName + "」に3ダメ＆鮮度-1＋1枚ドロー！");
      } else {
        ctx.log("😭 すり抜け爆死！1枚ドロー！");
      }
      ctx.drawCard(who);
    } else if (card.id === "sr_shadowban") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].shield = false;
        opp.field[t0].atk = 0;
        ctx.log("👻 シャドウバン！「" + opp.field[t0].name + "」の無敵バリア解除＆攻撃力を0にした！");
      }
    } else if (card.id === "r_oshi_kantotsu") {
      self.hp -= 2;
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 3; self.field[t0].hp += 3;
        ctx.log("💖 推しへの完凸報告！「" + self.field[t0].name + "」攻撃+3＆HP+3（代償メンタル-2）！");
      }
    } else if (card.id === "r_badge_999") {
      if (t0 !== -1 && opp.field[t0]) {
        var b9Name = opp.field[t0].name;
        opp.field[t0].atk = Math.max(0, opp.field[t0].atk - 3);
        opp.field[t0].freshness -= 1;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("🔔 通知バッジ999+！「" + b9Name + "」攻撃力-3＆鮮度-1！");
      }
    } else if (card.id === "r_gacha_sim") {
      if (Math.random() < 0.5) {
        ctx.drawCard(who); ctx.drawCard(who);
        self.giga = Math.min(self.maxGiga, self.giga + 1);
        ctx.log("🎰 ガチャシミュレーター大当たり！2枚ドロー＆ギガ+1！");
      } else {
        ctx.drawCard(who);
        ctx.log("🎰 ガチャシミュレーター：最低保証（1枚ドロー）！");
      }
    } else if (card.id === "r_trend_meta") {
      if (state.activeTrend) {
        var oldTrName = state.activeTrend.name;
        state.activeTrend = null;
        ctx.log("🤖 トレンド操作ボット！「" + oldTrName + "」を消滅させ2枚ドロー！");
      } else {
        ctx.log("🤖 トレンド操作ボット！2枚ドロー！");
      }
      ctx.drawCard(who); ctx.drawCard(who);
    } else if (card.id === "n_storage_full") {
      if (t0 !== -1 && opp.field[t0]) {
        var dmg5 = (opp.field.length >= 3) ? 4 : 2;
        var stName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], dmg5);
        ctx.log("💾 容量不足！「" + stName + "」に" + dmg5 + "ダメージ！");
      }
    } else if (card.id === "n_battery_1pct") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].freshness = 1;
        ctx.log("🪫 充電残り1%の絶望！「" + opp.field[t0].name + "」の鮮度が1になった！");
      }
    } else if (card.id === "n_wifi_lost") {
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].atk = Math.max(0, opp.field[t0].atk - 2);
        ctx.log("📶 通信エラー！「" + opp.field[t0].name + "」の攻撃力-2＆本体に1ダメージ！");
      } else {
        ctx.log("📶 通信エラー！相手本体に1ダメージ！");
      }
      opp.hp -= 1;
    } else if (card.id === "n_login_bonus") {
      self.hp = Math.min(20, self.hp + 1);
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].hp += 2; self.field[t0].freshness += 1;
        ctx.log("🎁 連続ログインボーナス！「" + self.field[t0].name + "」HP+2＆鮮度+1＆メンタル+1！");
      } else {
        ctx.log("🎁 連続ログインボーナス！メンタル+1！");
      }
    }
    // ================= 第6弾：AI・テクノロジー＆未来インターネット編 スペル効果 =================
    else if (card.id === "god_unplug_server") {
      state.activeTrend = null;
      self.traps = []; opp.traps = [];
      self.field = []; opp.field = [];
      self.maxGiga = Math.min(10, Math.max(3, self.maxGiga));
      opp.maxGiga = Math.min(10, Math.max(3, opp.maxGiga));
      self.giga = 3; opp.giga = 3;
      ctx.log("🔌 【GOD構文】サーバー物理破壊！トレンド・伏せ構文・場のミームを全て強制リセット＆両者ギガ3！");
    } else if (card.id === "ur_god_prompt") {
      var hasAi = self.field.some(function(m) { return m.era === "AI・テック"; });
      var boost = hasAi ? 4 : 2;
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += boost;
        self.field[t0].shield = true;
        ctx.log("📜 神プロンプト詠唱！「" + self.field[t0].name + "」に攻撃+" + boost + "＆無敵バリア付与！");
      }
      ctx.drawCard(who);
      if (hasAi) ctx.drawCard(who);
    } else if (card.id === "sr_hallucination") {
      if (t0 !== -1 && opp.field[t0]) {
        var halName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 4);
        if (Math.random() < 0.5) {
          self.hp -= 2;
          ctx.log("🌀 ハルシネーション！「" + halName + "」に4ダメ！（大嘘がバレて自分もメンタル-2）");
        } else {
          ctx.log("🌀 ハルシネーション！自信満々の説得力で「" + halName + "」に4ダメージ！");
        }
      }
    } else if (card.id === "sr_algorithm_ban") {
      if (t0 !== -1 && opp.field[t0]) {
        var abTarget = opp.field[t0];
        abTarget.shield = false;
        if (abTarget.cost <= 3) {
          opp.field.splice(t0, 1);
          ctx.log("⚖️ AI自動モデレーション誤BAN！「" + abTarget.name + "」は即座にアカウント消滅した！");
        } else {
          ctx.log("⚖️ AI自動モデレーション誤BAN！「" + abTarget.name + "」の無敵バリアを剥がした！");
        }
      }
    } else if (card.id === "r_dolphin_assistant") {
      if (t0 !== -1 && opp.field[t0]) {
        var dolName = opp.field[t0].name;
        opp.field[t0].freshness -= 2;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("🐬 「お前を消す方法」「" + dolName + "」の鮮度-2＆1枚ドロー！");
      } else {
        ctx.log("🐬 「お前を消す方法」1枚ドロー！");
      }
      ctx.drawCard(who);
    } else if (card.id === "r_crypto_crash") {
      var spentGiga = self.giga;
      self.giga = 0;
      var cDmg = Math.max(2, spentGiga * 2);
      if (t0 !== -1 && opp.field[t0]) {
        var ccName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], cDmg);
        ctx.log("📉 仮想通貨の暴落！全ギガ(" + spentGiga + ")を溶かし「" + ccName + "」に" + cDmg + "ダメージ！");
      }
    } else if (card.id === "r_lora_finetune") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 2; self.field[t0].hp += 2; self.field[t0].freshness += 1;
        ctx.log("🧬 追加学習LoRAモデル適用！「" + self.field[t0].name + "」攻撃+2＆HP+2＆鮮度+1！");
      }
    } else if (card.id === "r_copilot_coding") {
      ctx.drawCard(who); ctx.drawCard(who);
      self.hand.forEach(function(h) { if (h.era === "AI・テック") h.cost = Math.max(0, h.cost - 1); });
      ctx.log("⌨️ AIコード補完！2枚ドロー＆手札の「AI・テック」全てのコスト-1！");
    } else if (card.id === "r_metaverse_land") {
      if (self.maxGiga < 10) self.maxGiga++;
      self.field.forEach(function(m) { m.hp += 2; });
      ctx.log("🌐 過疎メタバースの高級土地！最大ギガ+1＆味方全体のHP+2！");
    } else if (card.id === "r_deep_learning_loop") {
      if (t0 !== -1 && opp.field[t0]) {
        var dlName = opp.field[t0].name;
        opp.field[t0].atk = Math.floor(opp.field[t0].atk / 2);
        opp.field[t0].freshness -= 1;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("🔁 過学習オーバーフィッティング！「" + dlName + "」の攻撃力半減＆鮮度-1！");
      }
    } else if (card.id === "n_captcha_traffic") {
      if (t0 !== -1 && opp.field[t0]) {
        var ctName = opp.field[t0].name;
        opp.field[t0].atk = 0;
        opp.field[t0].freshness -= 1;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("🚦 信号機をすべて選択してください！「" + ctName + "」の攻撃力0＆鮮度-1！");
      }
    } else if (card.id === "n_chatgpt_sorry") {
      self.hp = Math.min(20, self.hp + 2);
      if (t0 !== -1 && opp.field[t0]) {
        opp.field[t0].atk = Math.max(0, opp.field[t0].atk - 2);
        ctx.log("🙇‍♂️ 「申し訳ありません、AI言語モデルとして…」「" + opp.field[t0].name + "」の攻撃力-2＆メンタル+2！");
      } else {
        ctx.log("🙇‍♂️ 「申し訳ありません、AI言語モデルとして…」メンタル+2！");
      }
    } else if (card.id === "n_token_limit") {
      if (t0 !== -1 && opp.field[t0]) {
        var tlName = opp.field[t0].name;
        ctx.dealDamageToMeme(opp.field[t0], 2);
        ctx.log("🧱 トークン上限到達！「" + tlName + "」に2ダメージ！");
      }
    } else if (card.id === "n_gpu_fan_max") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].atk += 2;
        self.field[t0].freshness = Math.max(1, self.field[t0].freshness - 1);
        ctx.log("🌀 冷却ファン全開！「" + self.field[t0].name + "」の攻撃力+2＆鮮度-1！");
      }
    } else if (card.id === "n_prompt_typo") {
      if (t0 !== -1 && self.field[t0]) {
        self.field[t0].hp += 3; self.field[t0].atk += 1;
        ctx.log("🎲 プロンプトの誤字で謎生物爆誕！「" + self.field[t0].name + "」のHP+3＆攻撃力+1！");
      }
    }

    ctx.cleanupDeadMemes();
  }
};
