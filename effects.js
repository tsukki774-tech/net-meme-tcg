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
      if (self.field.length > 0) { self.field[0].shield = true; ctx.log("👖 エルシャダイ「大丈夫だ、問題ない」→「" + self.field[0].name + "」に無敵バリア付与！"); }
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
      if (opp.field[0].hp <= 0) { ctx.drawCard(who); ctx.log("⛽ 炎上燃料投下！撃破ボーナスで1枚ドロー！"); }
      else { ctx.log("⛽ 炎上燃料投下！3ダメージ！"); }
    } else if (card.id === "x_spec") {
      opp.field.forEach(function(m) { m.freshness -= 1; });
      opp.field = opp.field.filter(function(m) { return m.freshness > 0; });
      ctx.log("🔧 仕様変更！相手ミーム全ての鮮度が-1された！");
    } else if (card.id === "bazu_tweet" && self.field.length > 0) {
      self.field[0].isBuzz = true; self.field[0].shield = true;
      ctx.log("🚀 万バズ構文！「" + self.field[0].name + "」にバズ＆無敵バリア付与！");
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

    ctx.cleanupDeadMemes();
  }
};
