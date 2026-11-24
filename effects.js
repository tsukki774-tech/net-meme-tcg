// effects.js - カードの召喚時効果・スペル効果のロジック

window.CardEffects = {
  triggerSummonEffect: function(ctx, who, card) {
    var state = ctx.state;
    var self = state[who], opp = state[who === "p1" ? "p2" : "p1"];

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
      if (opp.field.length > 0) { ctx.dealDamageToMeme(opp.field[0], 2); ctx.cleanupDeadMemes(); }
      self.giga = Math.min(self.maxGiga, self.giga + 1);
      ctx.log("🫛 ずんだもん「倒すのだ！」2ダメージ＆ギガ1回復！");
    } else if (card.id === "hiroyuki_king") {
      if (opp.field.length > 0) { opp.field[0].atk = 0; ctx.log("🧔 論破王ひろゆき：「それってあなたの感想ですよね？」相手ミームの攻撃力を0にした！"); }
    } else if (card.id === "tokutei_pro") {
      if (opp.field.length > 0) { opp.field[0].freshness = 1; ctx.log("🛰️ ガチ特定班：相手ミームの鮮度を1にした！"); }
    } else if (card.id === "gabe_dog") {
      self.field.forEach(function(m) { if (m !== card) m.atk += 1; });
      ctx.log("🐩 Gabe the Dog「Bork!」他の味方全員の攻撃力+1！");
    } else if (card.id === "vipper") {
      var c2ch = self.field.filter(function(m) { return m.era === "2ch"; }).length;
      card.atk += c2ch; ctx.log("🧑‍💻 VIPPER効果！場の2ch勢の数だけ攻撃力+" + c2ch + "！");
    } else if (card.id === "elshaddai") {
      if (self.field.length > 0) { var tEl = self.field[self.field.length - 1]; tEl.shield = true; ctx.log("👖 エルシャダイ「大丈夫だ、問題ない」→「" + tEl.name + "」に無敵バリア付与！"); }
    } else if (card.id === "billy") {
      self.field.forEach(function(m) { m.atk += 1; }); self.hp = Math.min(20, self.hp + 3);
      ctx.log("💪 歪みねぇな！味方全員攻撃力+1＆メンタル3回復！");
    } else if (card.id === "kuuhaku") {
      if (self.field.some(function(m) { return m !== card && m.era === "例のアレ"; })) { ctx.drawCard(who); ctx.log("🥋 迫真空手部・裏効果：1枚ドロー！"); }
    } else if (card.id === "resuba_king") {
      if (opp.field.length > 0) { ctx.dealDamageToMeme(opp.field[0], 2); ctx.cleanupDeadMemes(); ctx.log("💬 レスバ最強の男：相手ミームに2ダメージ！"); }
    } else if (card.id === "pepe") {
      if (self.hp < opp.hp) { ctx.drawCard(who); ctx.drawCard(who); ctx.log("🐸 Pepe逆転効果！2枚ドロー！"); }
    } else if (card.id === "meiwaku") {
      if (self.hand.length > 0) self.hand.splice(Math.floor(Math.random() * self.hand.length), 1);
      if (opp.hand.length > 0) opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
      opp.hp -= 2; ctx.log("🚨 迷惑系配信者！お互いの手札1枚破壊＆相手メンタル2ダメージ！");
    } else if (card.id === "genba") {
      if (Math.random() < 0.5) { card.atk += 2; ctx.log("👷 ヨシ！安全確認完了（攻撃力+2）！"); }
      else { ctx.log("💥 労災発生！現場猫は自爆した！"); self.field.pop(); }
    } else if (card.id === "donald") { opp.hp -= 2; ctx.log("🤡 ランランルー！メンタルに2ダメージ！"); }
    else if (card.id === "shuzo") { self.field.forEach(function(m) { if (m !== card) m.atk += 1; }); ctx.log("🔥 修造の熱血応援！他の味方全員の攻撃力+1！"); }
    else if (card.id === "yaju") { card.atk += 1; ctx.log("🦁 野獣先輩のプレッシャー！自身の攻撃力+1！"); }
    else if (card.id === "savanna") { if (opp.field.length > 0) { opp.field[0].atk = 1; ctx.log("🦁 サバンナ男効果！相手ミームの攻撃力が1になった！"); } }
    else if (card.id === "nyan") { ctx.drawCard(who); card.atk += 1; ctx.log("🌈 Nyan Cat効果：1枚ドロー＆攻撃力+1！"); }
    else if (card.id === "streamer") { self.giga = Math.min(self.maxGiga, self.giga + 1); ctx.log("🎙️ 大手配信者効果：ギガを1回復！"); }
    // ================= 第1弾追加：第3弾（アニメ）＆第4弾（ゲーム）対策メタ召喚効果 =================
    else if (card.id === "meta_anime_critic") {
      var animeIdx = opp.field.findIndex(function(m) { return m.era === "アニメ"; });
      if (animeIdx !== -1) {
        var erasedAnime = opp.field.splice(animeIdx, 1)[0];
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
      var gameIdx = opp.field.findIndex(function(m) { return m.era === "ゲーム"; });
      if (gameIdx !== -1) {
        var bannedGame = opp.field.splice(gameIdx, 1)[0];
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
      var gameTarget = opp.field.find(function(m) { return m.era === "ゲーム"; }) || opp.field[0];
      if (gameTarget) {
        ctx.dealDamageToMeme(gameTarget, gameTarget.era === "ゲーム" ? 4 : 2);
        ctx.cleanupDeadMemes();
      }
      ctx.log("🔧 【第4弾メタ】ラスボス弱体化パッチ！" + (sealed ? "第2形態の復活能力を封印＆" : "") + "ゲームミームに痛恨の修正ダメージ！");
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
      if (opp.field.length > 0) {
        opp.field[0].atk = Math.max(0, opp.field[0].atk - 2);
        ctx.dealDamageToMeme(opp.field[0], 3);
        ctx.cleanupDeadMemes();
      }
      ctx.log("🕹️ フレーム単位の格ゲー神！相手ミームに3ダメージ＆攻撃力-2！");
    } else if (card.id === "sr_kusoge_hunter") {
      var lowCostIdx = opp.field.findIndex(function(m) { return m.cost <= 3; });
      if (lowCostIdx !== -1) {
        var destroyed = opp.field.splice(lowCostIdx, 1)[0];
        ctx.log("💿 伝説のクソゲーハンター！「" + destroyed.name + "」を攻略（破壊）した！");
      }
    } else if (card.id === "sr_first_play_lie") {
      if (opp.hand.length >= 3) {
        opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1);
        ctx.log("😏 初見プレイです（周回済）！相手の手札を1枚捨てさせる！");
      }
    } else if (card.id === "sr_lag_switch") {
      if (opp.field.length > 0) {
        opp.field[0].freshness -= 1;
        opp.field[0].atk = 0;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
        ctx.log("📡 回線抜き＆ラグ使い！相手ミームの鮮度-1＆攻撃力を0にした！");
      }
    } else if (card.id === "sr_stream_snipe") {
      if (opp.field.length > 0 && opp.hand.length > 0) {
        ctx.dealDamageToMeme(opp.field[0], opp.hand.length);
        ctx.cleanupDeadMemes();
        ctx.log("👁️ ゴースティング視聴者！相手手札" + opp.hand.length + "枚分のダメージ！");
      }
    } else if (card.id === "r_kokosuki") {
      if (self.field.some(function(m) { return m !== card && m.era === "ゲーム"; })) {
        ctx.drawCard(who);
        ctx.log("💬 ここ好き（弾幕職人）！ゲーム仲間がいるため1枚ドロー！");
      }
    } else if (card.id === "r_fps_camper") {
      if (opp.field.length > 0) {
        ctx.dealDamageToMeme(opp.field[0], 1);
        ctx.cleanupDeadMemes();
        ctx.log("🎯 角待ちスナイパー！狙撃で1ダメージ！");
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
    }

    else if (card.id === "admin_god_dev") {
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
      if (self.field.length > 0) self.field[0].atk += 1;
      ctx.log("🎩 スピードワゴンの解説！1枚ドロー＆味方1体の攻撃力+1！");
    } else if (card.id === "mob_chara") {
      if (opp.field.length > 0) { ctx.dealDamageToMeme(opp.field[0], 1); ctx.cleanupDeadMemes(); }
      ctx.log("🚚 異世界転生トラック突撃！1ダメージ！");
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
  },

  executeSpell: function(ctx, who, card) {
    var state = ctx.state;
    var self = state[who], opp = state[who === "p1" ? "p2" : "p1"];

    if (card.id === "ronpa" && opp.field.length > 0) { ctx.dealDamageToMeme(opp.field[0], 3); ctx.log("🤔 論破！相手ミームに3ダメージ！"); }
    else if (card.id === "numai" && opp.field.length > 0) { ctx.dealDamageToMeme(opp.field[0], 2); ctx.log("🔨 ガッ！相手ミームに2ダメージ！"); }
    else if (card.id === "seiron" && opp.field.length > 0) { ctx.dealDamageToMeme(opp.field[0], 4); ctx.log("🥊 正論パンチ！相手ミームに4ダメージ！"); }
    else if (card.id === "ojisan") { opp.field.forEach(function(m) { m.atk = Math.max(0, m.atk - 2); }); ctx.log("👴 おじさん構文で相手ミーム全員の攻撃力が-2！"); }
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
      if (opp.field.length > 0) ctx.dealDamageToMeme(opp.field[0], 3);
      opp.hp -= 1; ctx.log("🔢 33-4の呪い！相手ミームに3ダメ＆本体に1ダメ！");
    } else if (card.id === "gacha_bakushi") {
      self.giga = Math.min(self.maxGiga, self.giga + 2); ctx.drawCard(who);
      ctx.log("💸 ガチャ爆死配信！ギガ2回復＆1枚ドロー！");
    } else if (card.id === "digital_tattoo") {
      if (opp.field.length > 0) ctx.dealDamageToMeme(opp.field[0], 3);
      opp.hp -= 2; ctx.log("🖋️ デジタルタトゥー！相手ミームに3ダメ＆本体に2ダメ！");
    } else if (card.id === "owakon") {
      var oldEras = ["2ch", "ニコニコ", "例のアレ", "VIP/なんJ"];
      var idx = opp.field.findIndex(function(m) { return oldEras.indexOf(m.era) !== -1; });
      if (idx !== -1) { ctx.log("📉 「" + opp.field[idx].name + "」はオワコン認定され消滅した！"); opp.field.splice(idx, 1); }
      else { ctx.log("📉 対象となる古い世代のミームがいなかった..."); }
    } else if (card.id === "kusa") { self.field.forEach(function(m) { m.atk += 1; }); ctx.log("🌱 大草原！味方全員の攻撃力+1！"); }
    else if (card.id === "matsuri") { self.field.forEach(function(m) { m.freshness += 2; m.atk += 1; }); ctx.log("🏮 祭りだワッショイ！味方全員の鮮度+2＆攻撃力+1！"); }
    else if (card.id === "onmyoji") { if (opp.field.length > 0) ctx.dealDamageToMeme(opp.field[0], 2); self.hp = Math.min(20, self.hp + 2); ctx.log("☯️ レッツゴー陰陽師！2ダメージ＆メンタル2回復！"); }
    else if (card.id === "short_video") { ctx.drawCard(who); if (self.field.length > 0) self.field[0].freshness += 1; ctx.log("📱 ショート動画の沼！1枚ドロー＆鮮度+1！"); }
    else if (card.id === "icetea" && self.field.length > 0) { self.field[0].hp += 3; self.field[0].freshness += 1; ctx.log("🧊 アイスティー差し入れ！HP+3＆鮮度+1！"); }
    else if (card.id === "grass_hayasu" && self.field.length > 0) { self.field[0].atk += 2; ctx.log("🌿 草生える！味方1体の攻撃力+2！"); }
    else if (card.id === "stonks") { if (self.maxGiga < 10) self.maxGiga++; ctx.drawCard(who); ctx.log("📈 Stonks！最大ギガ+1＆1枚ドロー！"); }
    else if (card.id === "enjo_nenryo" && opp.field.length > 0) {
      ctx.dealDamageToMeme(opp.field[0], 3);
      if ((opp.field[0] && opp.field[0].hp <= 0)) { ctx.drawCard(who); ctx.log("⛽ 炎上燃料投下！撃破ボーナスで1枚ドロー！"); }
      else { ctx.log("⛽ 炎上燃料投下！3ダメージ！"); }
    } else if (card.id === "x_spec") {
      opp.field.forEach(function(m) { m.freshness -= 1; });
      opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
      ctx.log("🔧 仕様変更！相手ミーム全ての鮮度が-1された！");
    } else if (card.id === "bazu_tweet" && self.field.length > 0) {
      var tBz = self.field[self.field.length - 1]; tBz.isBuzz = true; tBz.shield = true;
      ctx.log("🚀 万バズ構文！「" + tBz.name + "」にバズ＆無敵バリア付与！");
    } else if (card.id === "danmaku") { self.field.forEach(function(m) { m.atk += 1; }); ctx.drawCard(who); ctx.log("💬 弾幕展開！味方全員の攻撃力+1＆1枚ドロー！"); }
    else if (card.id === "kaiko") {
      var newEras = ["令和", "配信者", "X炎上"];
      if (opp.field.some(function(m) { return newEras.indexOf(m.era) !== -1; })) { opp.hp -= 4; ctx.log("📺 懐古厨の説教が刺さり、相手メンタルに4ダメージ！"); }
      else { opp.hp -= 1; ctx.log("📺 懐古厨のぼやきで相手メンタルに1ダメージ。"); }
    } else if (card.id === "copyright") {
      var cIdx = opp.field.findIndex(function(m) { return m.era === "ニコニコ" || m.era === "海外"; });
      if (cIdx !== -1) { ctx.log("⚠️ 著作権侵害により「" + opp.field[cIdx].name + "」は削除された！"); opp.field.splice(cIdx, 1); ctx.drawCard(who); }
      else { ctx.log("⚠️ 削除対象のミームがいなかった..."); }
    } else if (card.id === "tokutei") {
      var tIdx = opp.field.findIndex(function(m) { return m.era === "配信者" || m.era === "X炎上"; });
      if (tIdx !== -1) { opp.field[tIdx].atk = 0; opp.field[tIdx].freshness = 1; ctx.log("🔍 特定班により「" + opp.field[tIdx].name + "」は炎上し無力化（攻撃0・鮮度1）！"); }
      else { ctx.log("🔍 特定対象のミームがいなかった..."); }
    } else if (card.id === "honyaku") {
      ctx.drawCard(who);
      if (self.field.some(function(m) { return m.era === "海外"; })) { ctx.drawCard(who); ctx.log("🌐 翻訳ニキの解説で海外ミームの理解が深まり2枚ドロー！"); }
      else { ctx.log("🌐 翻訳ニキの解説で1枚ドロー！"); }
    } else if (card.id === "jaken") { if (opp.field.length > 0) ctx.dealDamageToMeme(opp.field[0], 4); opp.hp -= 2; ctx.log("🗡️ 邪剣「夜」発動！相手場と本体に大ダメージ！"); }
    else if (card.id === "karate") { self.field.forEach(function(m) { m.atk += 2; }); ctx.log("🥋 迫真空手部の特訓！味方全員の攻撃力+2！"); }
    else if (card.id === "rickroll" && opp.hand.length > 0) { opp.hand.splice(Math.floor(Math.random() * opp.hand.length), 1); ctx.log("🕺 Rickroll！相手の手札を1枚捨てさせた！"); }
    else if (card.id === "supacha") { self.giga = Math.min(self.maxGiga, self.giga + 2); ctx.log("💸 ナイスパ！ギガが2回復した！"); }
    else if (card.id === "shazai") { self.field = []; opp.field = []; ctx.log("🙇 炎上謝罪会見！場のミームが全て消滅した！"); }
    else if (card.id === "comnote") { if (opp.field.length > 0) ctx.dealDamageToMeme(opp.field[0], 3); self.hp = Math.min(20, self.hp + 2); ctx.log("📝 コミュニティノート！相手に3ダメージ＆自分のメンタル2回復！"); }
    else if (card.id === "gakkyukai") { self.field.forEach(function(m) { ctx.dealDamageToMeme(m, 2); }); opp.field.forEach(function(m) { ctx.dealDamageToMeme(m, 2); }); ctx.log("🔥 Xの学級会！お互いの場のミーム全てに2ダメージ！"); }
    else if (card.id === "ban") { if (opp.field.length > 0) opp.field.splice(0, 1); opp.hp -= 2; ctx.log("❄️ アカウント凍結！相手ミーム消滅＆本体に2ダメージ！"); }
    // ================= 新規メタ＆GODキラー効果 =================
    else if (card.id === "dat_ochi") {
      var idx2ch = opp.field.findIndex(function(m) { return m.era === "2ch"; });
      if (idx2ch !== -1) {
        ctx.log("🗄️ DAT落ちにより「" + opp.field[idx2ch].name + "」は過去ログの彼方へ消滅！本体に2ダメージ！");
        opp.field.splice(idx2ch, 1);
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
      var idxKaigai = opp.field.findIndex(function(m) { return m.era === "海外"; });
      if (idxKaigai !== -1) {
        ctx.log("🚫 おま国発動！「" + opp.field[idxKaigai].name + "」はお住まいの地域では利用できません！");
        opp.field.splice(idxKaigai, 1);
        self.giga = Math.min(self.maxGiga, self.giga + 1);
      } else {
        ctx.drawCard(who);
        ctx.log("🚫 海外ミームがいなかったため、VPNを繋いで1枚ドロー！");
      }
    } else if (card.id === "god_killer_503") {
      var godIdx = opp.field.findIndex(function(m) { return m.rarity === "GOD"; });
      if (godIdx !== -1) {
        var godName = opp.field[godIdx].name;
        opp.field.splice(godIdx, 1);
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
      if (self.field.length > 0) self.field[self.field.length - 1].shield = true;
      if (opp.field.length > 0) {
        var maxTarget = opp.field.reduce(function(a, b) { return a.atk >= b.atk ? a : b; });
        maxTarget.atk = 0;
      }
      ctx.log("🙅 「だが断る」味方に無敵バリア付与＆相手最強ミームの攻撃力を0にした！");
    } else if (card.id === "omae_shindeiru") {
      if (opp.field.length > 0) opp.field[0].freshness = 1;
      opp.hp -= 3;
      ctx.log("👉 「お前はもう死んでいる」相手ミームの鮮度を1にし、本体に3ダメージ！");
    } else if (card.id === "keikaku_dori") {
      ctx.drawCard(who); ctx.drawCard(who); ctx.drawCard(who);
      self.hand.forEach(function(h) { if (h.type === "spell") h.cost = Math.max(0, h.cost - 1); });
      ctx.log("📓 「計画通り」3枚ドロー＆手札の構文カード全てのコスト-1！");
    } else if (card.id === "douiukoto_nano" && opp.field.length > 0) {
      opp.field[0].shield = false;
      opp.field[0].atk = Math.max(0, opp.field[0].atk - 2);
      opp.field[0].freshness = Math.max(1, opp.field[0].freshness - 1);
      ctx.log("😨 「どういうことなの…」相手ミームのバリア解除＆攻撃-2・鮮度-1！");
    } else if (card.id === "oni_ni_naranai") {
      var lowIdx = opp.field.findIndex(function(m) { return m.cost <= 2; });
      if (lowIdx !== -1 && self.field.length < 3) {
        var stolen = opp.field.splice(lowIdx, 1)[0];
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
    } else if (card.id === "nanimo_kowakunai" && self.field.length > 0) {
      self.field[0].hp += 4; self.field[0].atk += 2; self.field[0].freshness = 1;
      ctx.log("🎀 「もう何も恐くない」HP+4＆攻撃+2の全力解放（鮮度1）！");
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
    } else if (card.id === "anta_bakaa" && self.field.length > 0) {
      self.field[0].atk += 3;
      self.field[0].freshness = Math.max(1, self.field[0].freshness - 1);
      ctx.log("💢 「あんたバカァ！？」攻撃力+3＆鮮度-1！");
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
      if (opp.field.length > 0) ctx.dealDamageToMeme(opp.field[0], 3);
      opp.hp -= 1;
      ctx.log("🔪 「嘘だッ！！！」相手ミームに3ダメ＆本体に1ダメ！");
    } else if (card.id === "jikai_yokoku" && opp.field.length > 0) {
      opp.field[0].freshness -= 2;
      opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
      ctx.log("📢 次回予告！相手ミームの鮮度が-2された！");
    } else if (card.id === "sekai_he_habatake") {
      self.hp -= 3;
      ctx.drawCard(who); ctx.drawCard(who);
      ctx.log("⚖️ 等価交換！メンタルを3削り2枚ドロー！");
    } else if (card.id === "shujinkou_hosei" && self.field.length > 0) {
      self.field[0].atk += 1; self.field[0].hp += 2;
      ctx.log("🌟 主人公補正！攻撃力+1＆HP+2！");
    } else if (card.id === "gomen_yui" && self.field.length > 0) {
      var sac = self.field.shift();
      self.giga = Math.min(self.maxGiga, self.giga + 2);
      ctx.drawCard(who);
      ctx.log("💔 「ごめん、ユイ…」" + sac.name + "を犠牲にギガ2回復＆1枚ドロー！");
    } else if (card.id === "tsundere" && self.field.length > 0) {
      self.field[0].atk += 2;
      ctx.log("😤 ツンデレ応援！攻撃力+2！");
    } else if (card.id === "to_be_continued" && self.field.length > 0) {
      self.field[0].freshness += 2; self.field[0].hp += 2;
      ctx.log("🎸 To Be Continued... 鮮度+2＆HP+2！");
    } else if (card.id === "yamete_raifu") {
      if (self.hp <= 8) {
        self.hp = Math.min(20, self.hp + 5);
        ctx.log("😱 「もうやめて！ライフはとっくにゼロよ！」メンタル5回復！");
      } else {
        ctx.log("😱 まだライフが残っていたため不発に終わった...");
      }
    } else if (card.id === "ikari_no_super" && self.field.length > 0) {
      self.field[0].atk += 3;
      ctx.log("⚡ 「クリリンのことかーーーっ！！」攻撃力+3！");
    } else if (card.id === "op_skip" && opp.field.length > 0) {
      ctx.dealDamageToMeme(opp.field[0], 2);
      ctx.log("⏩ OPスキップ！相手ミームに2ダメージ！");
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
      if (self.field.length > 0) self.field[0].atk += 2;
      ctx.log("📋 分厚いRTAチャート表！2枚ドロー＆味方ミーム1体の攻撃力+2！");
    } else if (card.id === "sr_timer_stop") {
      opp.field.forEach(function(m) { m.atk = Math.max(0, m.atk - 2); });
      opp.hp -= 2;
      ctx.log("🛑 タイマーストップ！相手ミーム全体の攻撃力-2＆相手本体に2ダメージ！");
    } else if (card.id === "sr_gacha_explosion") {
      opp.field.forEach(function(m) { ctx.dealDamageToMeme(m, 2); });
      self.hp -= 1;
      ctx.log("💥 爆死確定演出！相手ミーム全体に2ダメージ（自分も1ダメージ）！");
    } else if (card.id === "sr_rage_quit") {
      if (opp.field.length > 0) {
        var beforeHp = opp.field[0].hp;
        ctx.dealDamageToMeme(opp.field[0], 4);
        if (beforeHp < 4) opp.hp -= 1;
      }
      ctx.log("👊 台パン＆コントローラー破壊！相手ミームに4ダメージ！");
    } else if (card.id === "r_boss_bgm") {
      self.field.forEach(function(m) { m.atk += 1; m.freshness += 1; });
      ctx.log("🎸 処刑用BGMが流れ出す瞬間！味方全体の攻撃力+1＆鮮度+1！");
    } else if (card.id === "r_hitbox_bug" && self.field.length > 0) {
      self.field[0].shield = true;
      ctx.log("🔲 当たり判定ガバガバ現象！「" + self.field[0].name + "」に無敵バリア付与！");
    } else if (card.id === "r_patch_nerf" && opp.field.length > 0) {
      opp.field[0].atk = Math.max(0, opp.field[0].atk - 3);
      ctx.dealDamageToMeme(opp.field[0], 1);
      ctx.log("📉 緊急アプデの下方修正！相手ミームの攻撃力-3＆HP-1！");
    } else if (card.id === "r_loading_99") {
      if (opp.field.length > 0) {
        opp.field[0].freshness -= 1;
        opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
      }
      ctx.drawCard(who);
      ctx.log("⏳ 99%で止まるロード画面！相手ミームの鮮度-1＆1枚ドロー！");
    } else if (card.id === "r_double_jump" && self.field.length > 0) {
      self.field[0].atk += 1; self.field[0].hp += 2;
      ctx.log("🦘 謎の2段ジャンプ物理法則！攻撃力+1＆HP+2！");
    } else if (card.id === "n_yakusou") {
      self.hp = Math.min(20, self.hp + 3);
      ctx.log("🌿 初期装備のやくそう！メンタル3回復！");
    } else if (card.id === "n_wooden_sword" && self.field.length > 0) {
      self.field[0].atk += 2;
      ctx.log("🪵 ひのきのぼう！攻撃力+2！");
    } else if (card.id === "n_fps_drop" && opp.field.length > 0) {
      opp.field[0].atk = Math.max(0, opp.field[0].atk - 2);
      ctx.log("🐌 処理落ちカクカク現象！相手ミームの攻撃力-2！");
    } else if (card.id === "n_gg_ez") {
      opp.hp -= 2;
      ctx.log("🗨️ 煽りチャット「GG EZ」！相手本体に2ダメージ！");
    } else if (card.id === "n_easter_egg") {
      self.giga = Math.min(self.maxGiga, self.giga + 1);
      if (self.field.length > 0) self.field[0].freshness += 1;
      ctx.log("🔑 開発者の隠し部屋！ギガ1回復＆味方ミームの鮮度+1！");
    } else if (card.id === "n_fall_damage" && opp.field.length > 0) {
      ctx.dealDamageToMeme(opp.field[0], 2);
      ctx.log("🪂 落下ダメージ確認勢！相手ミームに2ダメージ！");
    } else if (card.id === "n_respawn_point" && self.field.length > 0) {
      self.field[0].hp += 3;
      ctx.log("🔥 リスポーン地点の焚き火！味方ミームのHPを3回復！");
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

    ctx.cleanupDeadMemes();
  }
};
