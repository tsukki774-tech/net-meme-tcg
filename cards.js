// cards.js - カード一覧・レンタルデッキ・ミッションデータ定義

const ALL_CARDS = [
  // ================= 管理者（開発者）専用カード（pack: 0 / 非売品・隠しコマンド限定） =================
  { id: "admin_ban_hammer", pack: 0, isAdminOnly: true, name: "【ADMIN】開発者の特権（BANハンマー）", type: "spell", era: "運営", rarity: "ADMIN", cost: 0, icon: "🔨", desc: "【管理者専用】相手場のミームを無敵バリアごと全消滅＆相手手札2枚破壊＆自分メンタル全回復・ギガ最大！" },
  { id: "admin_god_dev", pack: 0, isAdminOnly: true, name: "【ADMIN】作者の気まぐれ（仕様変更）", type: "meme", era: "運営", rarity: "ADMIN", cost: 1, atk: 99, hp: 99, freshness: 99, icon: "👑", desc: "【管理者専用】召喚時：相手の場のミームを全て奪い取り、自身に無敵バリア（🛡️）を付与して降臨！" },
  { id: "admin_debug_mode", pack: 0, isAdminOnly: true, name: "【ADMIN】デバッグモード起動", type: "spell", era: "運営", rarity: "ADMIN", cost: 0, icon: "💻", desc: "【管理者専用】山札から3枚ドローし、このターン中自分の手札すべてのコストを0にする！" },

  // ================= ショップ限定・伝説のカード（pack: 0 / 100万BP専売・パック排出なし） =================
  { id: "god_genesis_meme", pack: 0, isShopLegend: true, shopPrice: 1000000, name: "【伝説】インターネットの創世神（アダム＆イヴ・オブ・ミーム）", type: "meme", era: "創世神", rarity: "GOD", cost: 8, atk: 10, hp: 10, freshness: 7, icon: "👑", desc: "【100万BP伝説神】無敵バリア貫通！召喚時：味方全体の攻撃力+5・HP+5＆無敵バリア付与＋山札から3枚ドロー＋相手場のミームを全て消滅＆相手本体に5ダメージ！" },

  // ================= 第1弾（pack: 1 / 全42種） =================
  { id: "god_internet", pack: 1, name: "インターネットの集合知", type: "meme", era: "2ch", rarity: "GOD", cost: 6, atk: 7, hp: 7, freshness: 5, icon: "🌌", desc: "【神降臨】召喚時：味方全員の攻撃力+2＆無敵バリア付与＆カードを2枚ドロー！" },

  { id: "mona", pack: 1, name: "モナー", type: "meme", era: "2ch", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 4, icon: "🐱‍👤", desc: "オマエモナー。鮮度が落ちにくい（4ターン持続）。" },
  { id: "giko", pack: 1, name: "ギコ猫", type: "meme", era: "2ch", rarity: "N", cost: 2, atk: 3, hp: 2, freshness: 4, icon: "😼", desc: "「逝ってよし」攻撃的なAAキャラ。" },
  { id: "yaruo", pack: 1, name: "やる夫", type: "meme", era: "2ch", rarity: "R", cost: 2, atk: 2, hp: 4, freshness: 4, icon: "🍙", desc: "高い体力を誇る頼れる壁役。" },
  { id: "numai", pack: 1, name: "ぬるぽ", type: "spell", era: "2ch", rarity: "N", cost: 1, icon: "🔨", desc: "【ガッ】相手ミーム1体に2ダメージを与える。" },
  { id: "kusa", pack: 1, name: "ｗｗｗ（大草原）", type: "spell", era: "2ch", rarity: "R", cost: 2, icon: "🌱", desc: "自分の場のミーム全ての攻撃力を+1する。" },
  { id: "kaiko", pack: 1, name: "懐古厨の説教", type: "spell", era: "2ch", rarity: "SR", cost: 2, icon: "📺", desc: "【メタ】相手本体に1ダメ。相手の場に「令和・配信者・X炎上」がいれば4ダメに強化！" },

  { id: "donald", pack: 1, name: "ドナルド", type: "meme", era: "ニコニコ", rarity: "R", cost: 2, atk: 2, hp: 2, freshness: 3, icon: "🤡", desc: "召喚時：相手のメンタルに2ダメージを与える。" },
  { id: "kbc", pack: 1, name: "キーボードクラッシャー", type: "meme", era: "ニコニコ", rarity: "UR", cost: 4, atk: 5, hp: 4, freshness: 3, icon: "⌨️", desc: "圧倒的破壊力を持つニコニコの伝説。" },
  { id: "shuzo", pack: 1, name: "松岡修造", type: "meme", era: "ニコニコ", rarity: "SR", cost: 3, atk: 3, hp: 3, freshness: 3, icon: "🔥", desc: "熱血応援！召喚時、他の味方全体の攻撃力+1。" },
  { id: "danmaku", pack: 1, name: "弾幕コメント", type: "spell", era: "ニコニコ", rarity: "R", cost: 2, icon: "💬", desc: "自分の場のミーム全ての攻撃力を+1し、1枚ドロー。" },

  { id: "neko", pack: 1, name: "猫ミーム", type: "meme", era: "令和", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 3, icon: "🐱", desc: "召喚時：手札を1枚引く。軽くて使いやすい。" },
  { id: "genba", pack: 1, name: "現場猫（ヨシ！）", type: "meme", era: "令和", rarity: "R", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "👷", desc: "召喚時：50%で攻撃力+2、50%で労災（自爆）。" },
  { id: "chiikawa", pack: 1, name: "ちいかわ構文", type: "meme", era: "令和", rarity: "N", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🐹", desc: "「〇〇ってコト！？」場持ちが良い癒やし枠。" },
  { id: "ronpa", pack: 1, name: "それってあなたの感想ですよね？", type: "spell", era: "令和", rarity: "R", cost: 2, icon: "🤔", desc: "【論破】相手の場のミーム1体に3ダメージ。" },
  { id: "ojisan", pack: 1, name: "おじさん構文", type: "spell", era: "令和", rarity: "R", cost: 2, icon: "👴", desc: "【デバフ】相手のミーム全ての攻撃力を-2する。" },
  { id: "owakon", pack: 1, name: "時代遅れ（オワコン認定）", type: "spell", era: "令和", rarity: "SR", cost: 3, icon: "📉", desc: "【メタ】相手の「2ch・ニコニコ・例のアレ・VIP/なんJ」ミーム1体を即消滅させる。" },

  { id: "kmr", pack: 1, name: "KMR", type: "meme", era: "例のアレ", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 3, icon: "👀", desc: "「まずいですよ！」軽くて出しやすい壁役。" },
  { id: "mur", pack: 1, name: "MUR", type: "meme", era: "例のアレ", rarity: "N", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "😼", desc: "「そうだよ（便乗）」序盤の速攻アタッカー。" },
  { id: "tono", pack: 1, name: "遠野", type: "meme", era: "例のアレ", rarity: "R", cost: 2, atk: 2, hp: 3, freshness: 4, icon: "🍵", desc: "召喚時：アイスティーを差し入れ（1枚ドロー）。" },
  { id: "yaju", pack: 1, name: "野獣先輩", type: "meme", era: "例のアレ", rarity: "UR", cost: 4, atk: 4, hp: 4, freshness: 4, icon: "🦁", desc: "召喚時：圧倒的プレッシャーで自身の攻撃力+1。" },
  { id: "jaken", pack: 1, name: "邪剣「夜」", type: "spell", era: "例のアレ", rarity: "SR", cost: 3, icon: "🗡️", desc: "【闇の力】相手ミーム1体に4ダメージ＆相手本体に2ダメージ。" },
  { id: "karate", pack: 1, name: "迫真空手部", type: "spell", era: "例のアレ", rarity: "R", cost: 2, icon: "🥋", desc: "厳しい特訓により、味方全員の攻撃力を+2する。" },

  { id: "chigyu", pack: 1, name: "チー牛", type: "meme", era: "VIP/なんJ", rarity: "N", cost: 1, atk: 1, hp: 3, freshness: 3, icon: "👓", desc: "「すいません、三色チーズ牛丼の特盛りに温玉付きで」" },
  { id: "savanna", pack: 1, name: "サバンナ男", type: "meme", era: "VIP/なんJ", rarity: "R", cost: 3, atk: 3, hp: 3, freshness: 3, icon: "🦁", desc: "召喚時：相手ミーム1体の攻撃力を1にする。" },
  { id: "seiron", pack: 1, name: "正論パンチ", type: "spell", era: "VIP/なんJ", rarity: "SR", cost: 2, icon: "🥊", desc: "相手ミーム1体に4ダメージを与える。" },
  { id: "tokutei", pack: 1, name: "特定班の特定作業", type: "spell", era: "VIP/なんJ", rarity: "SR", cost: 2, icon: "🔍", desc: "【メタ】相手の「配信者・X炎上」ミーム1体の攻撃力を0、鮮度を1にする。" },

  { id: "doge", pack: 1, name: "Doge（柴犬）", type: "meme", era: "海外", rarity: "R", cost: 2, atk: 2, hp: 3, freshness: 4, icon: "🐕", desc: "Such wow. バランスの良い海外の顔。" },
  { id: "nyan", pack: 1, name: "Nyan Cat", type: "meme", era: "海外", rarity: "SR", cost: 3, atk: 3, hp: 2, freshness: 3, icon: "🌈", desc: "召喚時：1枚ドローし、自身の攻撃力+1。" },
  { id: "gigachad", pack: 1, name: "GigaChad", type: "meme", era: "海外", rarity: "UR", cost: 5, atk: 6, hp: 6, freshness: 4, icon: "🗿", desc: "圧倒的フィジカルを誇る完璧超人。" },
  { id: "rickroll", pack: 1, name: "Rickroll（釣り動画）", type: "spell", era: "海外", rarity: "SR", cost: 2, icon: "🕺", desc: "相手の手札を1枚ランダムに捨てさせる。" },
  { id: "honyaku", pack: 1, name: "翻訳ニキの解説", type: "spell", era: "海外", rarity: "R", cost: 2, icon: "🌐", desc: "1枚ドロー。自分の場に「海外」ミームがいればさらに1枚ドロー。" },

  { id: "kirinuki", pack: 1, name: "切り抜き職人", type: "meme", era: "配信者", rarity: "N", cost: 1, atk: 1, hp: 1, freshness: 3, icon: "✂️", desc: "召喚時：カードを1枚ドローする。" },
  { id: "streamer", pack: 1, name: "大手配信者", type: "meme", era: "配信者", rarity: "SR", cost: 3, atk: 3, hp: 4, freshness: 3, icon: "🎙️", desc: "召喚時：自分のギガを1回復する。" },
  { id: "supacha", pack: 1, name: "赤スパチャ", type: "spell", era: "配信者", rarity: "R", cost: 1, icon: "💸", desc: "自分のギガを+2回復する（最大値は超えない）。" },
  { id: "shazai", pack: 1, name: "炎上謝罪会見", type: "spell", era: "配信者", rarity: "UR", cost: 4, icon: "🙇", desc: "お互いの場のミームを全て消滅させる。" },
  { id: "copyright", pack: 1, name: "著作権侵害の申し立て", type: "spell", era: "配信者", rarity: "SR", cost: 2, icon: "⚠️", desc: "【メタ】相手の「ニコニコ・海外」ミーム1体を即消滅させ、1枚ドロー。" },

  { id: "zombie", pack: 1, name: "インプレゾンビ", type: "meme", era: "X炎上", rarity: "N", cost: 0, atk: 1, hp: 1, freshness: 1, icon: "🧟", desc: "コスト0で出せるが1ターンで消える。数を並べる用。" },
  { id: "kagiaka", pack: 1, name: "鍵垢の監視者", type: "meme", era: "X炎上", rarity: "N", cost: 1, atk: 0, hp: 4, freshness: 4, icon: "🔒", desc: "攻撃力は0だが非常に硬い壁役。" },
  { id: "comnote", pack: 1, name: "コミュニティノート", type: "spell", era: "X炎上", rarity: "SR", cost: 2, icon: "📝", desc: "相手ミーム1体に3ダメージ＆自分のメンタルを2回復。" },
  { id: "gakkyukai", pack: 1, name: "Xの学級会", type: "spell", era: "X炎上", rarity: "R", cost: 2, icon: "🔥", desc: "お互いの場のミーム全てに2ダメージを与える。" },
  { id: "ban", pack: 1, name: "アカウント凍結", type: "spell", era: "X炎上", rarity: "UR", cost: 4, icon: "❄️", desc: "相手ミーム1体を消滅させ、相手本体に2ダメージ。" },

  // --- 第3弾（アニメ）＆第4弾（ゲーム・RTA）対策メタカード（pack: 1 追加6種） ---
  { id: "meta_anime_critic", pack: 1, name: "原作改変警察（作画崩壊チェッカー）", type: "meme", era: "X炎上", rarity: "SR", cost: 3, atk: 3, hp: 4, freshness: 4, icon: "🧐", desc: "【第3弾メタ】召喚時：相手の場の「アニメ」ミーム1体を消滅させ、相手本体に2ダメージ！" },
  { id: "meta_spoiler_troll", pack: 1, name: "最終回ネタバレ荒らし", type: "spell", era: "2ch", rarity: "R", cost: 2, icon: "📢", desc: "【第3弾メタ】相手の「アニメ」ミーム全体の攻撃力-2＆鮮度-1し、自分は1枚ドロー！" },
  { id: "meta_flag_breaker", pack: 1, name: "死亡フラグ粉砕機（現実主義者）", type: "meme", era: "現代", rarity: "UR", cost: 3, atk: 3, hp: 3, freshness: 4, icon: "✂️", desc: "【第3弾メタ】召喚時：相手の無敵バリアを全解除し、「アニメ」ミームの攻撃力を0にする！" },
  { id: "meta_anticheat_ban", pack: 1, name: "アンチチートBAN（TAS疑惑検証班）", type: "meme", era: "現代", rarity: "SR", cost: 3, atk: 3, hp: 4, freshness: 4, icon: "🛡️", desc: "【第4弾メタ】召喚時：相手の場の「ゲーム」ミーム1体を無敵バリア貫通で消滅させ、ギガ+1！" },
  { id: "meta_server_maint", pack: 1, name: "緊急メンテナンスのお知らせ", type: "spell", era: "現代", rarity: "R", cost: 2, icon: "🚧", desc: "【第4弾メタ】相手の「ゲーム」ミーム全体の攻撃力を0＆鮮度-1し、自分は1枚ドロー！" },
  { id: "meta_boss_nerf", pack: 1, name: "ラスボス弱体化パッチ（復活無効）", type: "meme", era: "現代", rarity: "UR", cost: 3, atk: 4, hp: 3, freshness: 4, icon: "🔧", desc: "【第4弾メタ】召喚時：相手の復活能力（第2形態など）を封印し、「ゲーム」ミームに4ダメージ！" },

  // ================= 第2弾：カオス＆深淵インターネット編（pack: 2 / 全46種） =================
  { id: "god_moderator", pack: 2, name: "全知全能のモデレーター", type: "meme", era: "X炎上", rarity: "GOD", cost: 6, atk: 6, hp: 8, freshness: 5, icon: "🔨", desc: "【神の粛清】召喚時：相手場のミーム全消滅＆相手メンタルに3ダメ＆自身に無敵バリア！" },
  { id: "god_deepweb", pack: 2, name: "深淵のインターネット", type: "meme", era: "海外", rarity: "GOD", cost: 7, atk: 8, hp: 8, freshness: 5, icon: "🕳️", desc: "【深淵解放】召喚時：相手の手札を2枚破壊＆味方全員の攻撃力+2＆メンタル4回復！" },

  { id: "vipper", pack: 2, name: "VIPPER（住民）", type: "meme", era: "2ch", rarity: "N", cost: 1, atk: 1, hp: 1, freshness: 3, icon: "🧑‍💻", desc: "召喚時：自分の場の「2ch」ミーム1体につき攻撃力+1。" },
  { id: "yaranaio", pack: 2, name: "やらない夫", type: "meme", era: "2ch", rarity: "R", cost: 3, atk: 3, hp: 4, freshness: 4, icon: "🍺", desc: "やる夫の相棒。攻守に優れた安定したアタッカー。" },
  { id: "matsuri", pack: 2, name: "祭りだワッショイ！", type: "spell", era: "2ch", rarity: "SR", cost: 2, icon: "🏮", desc: "自分の場のミーム全ての鮮度を+2し、攻撃力を+1する。" },
  { id: "shobon", pack: 2, name: "ショボーン (´・ω・｀)", type: "meme", era: "2ch", rarity: "N", cost: 1, atk: 0, hp: 3, freshness: 5, icon: "🥺", desc: "鮮度が5もある超長持ちの癒やし系AA。" },
  { id: "troll_2ch", pack: 2, name: "釣りスレ主", type: "spell", era: "2ch", rarity: "R", cost: 2, icon: "🎣", desc: "相手の手札を1枚ランダムに捨てさせ、自分は1枚ドロー。" },

  { id: "elshaddai", pack: 2, name: "エルシャダイ", type: "meme", era: "ニコニコ", rarity: "UR", cost: 3, atk: 3, hp: 3, freshness: 4, icon: "👖", desc: "「大丈夫だ、問題ない」召喚時、味方1体に無敵バリア（🛡️）を付与。" },
  { id: "billy", pack: 2, name: "ビリー・ヘリントン", type: "meme", era: "ニコニコ", rarity: "UR", cost: 5, atk: 5, hp: 5, freshness: 4, icon: "💪", desc: "召喚時：味方全員の攻撃力+1＆自分のメンタルを3回復。" },
  { id: "onmyoji", pack: 2, name: "陰陽師（レッツゴー！）", type: "spell", era: "ニコニコ", rarity: "R", cost: 2, icon: "☯️", desc: "相手ミーム1体に2ダメージ＆自分のメンタルを2回復。" },
  { id: "yukkuri", pack: 2, name: "ゆっくり霊夢＆魔理沙", type: "meme", era: "ニコニコ", rarity: "SR", cost: 3, atk: 2, hp: 4, freshness: 4, icon: "🎀", desc: "「ゆっくりしていってね！」召喚時：カードを1枚ドロー＆メンタル2回復。" },
  { id: "badapple", pack: 2, name: "Bad Apple!! 影絵", type: "spell", era: "ニコニコ", rarity: "SR", cost: 3, icon: "🍎", desc: "相手の場のミーム全ての攻撃力を-1し、2ダメージを与える。" },

  { id: "nekokoubun", pack: 2, name: "猫構文（ハァ？チピチャパ）", type: "meme", era: "令和", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 2, icon: "🎶", desc: "中毒性の高いリズムで相手を翻弄する速攻ミーム。" },
  { id: "ai_art", pack: 2, name: "生成AIの指6本", type: "meme", era: "令和", rarity: "SR", cost: 3, atk: 4, hp: 2, freshness: 2, icon: "🖐️", desc: "圧倒的物量と違和感で殴る高火力アタッカー。" },
  { id: "short_video", pack: 2, name: "ショート動画の沼", type: "spell", era: "令和", rarity: "R", cost: 1, icon: "📱", desc: "手札を1枚引き、自分の場のミーム1体の鮮度を+1する。" },
  { id: "zundamon", pack: 2, name: "ずんだもん", type: "meme", era: "令和", rarity: "UR", cost: 3, atk: 3, hp: 3, freshness: 4, icon: "🫛", desc: "「〇〇なのだ！」召喚時：相手ミーム1体に2ダメ＆ギガを1回復！" },
  { id: "hiroyuki_king", pack: 2, name: "論破王ひろゆき", type: "meme", era: "令和", rarity: "UR", cost: 4, atk: 4, hp: 4, freshness: 4, icon: "🧔", desc: "「写像とかあります？」召喚時：相手ミーム1体の攻撃力を0にする。" },

  { id: "kuuhaku", pack: 2, name: "迫真空手部・裏", type: "meme", era: "例のアレ", rarity: "R", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "🥋", desc: "召喚時：自分の場に「例のアレ」がいれば1枚ドロー。" },
  { id: "icetea", pack: 2, name: "おまたせ！アイスティー", type: "spell", era: "例のアレ", rarity: "N", cost: 1, icon: "🧊", desc: "味方ミーム1体のHPを3回復し、鮮度を+1する。" },
  { id: "yaju_king", pack: 2, name: "王道を征く先輩", type: "meme", era: "例のアレ", rarity: "SR", cost: 3, atk: 3, hp: 4, freshness: 4, icon: "👑", desc: "安定したステータスで盤面を制圧する中堅エース。" },
  { id: "gois", pack: 2, name: "GO（迫真）", type: "meme", era: "例のアレ", rarity: "N", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🕶️", desc: "「いいよ！来いよ！」頼もしい壁役。" },
  { id: "sanninsyu", pack: 2, name: "三人の勝者", type: "spell", era: "例のアレ", rarity: "SR", cost: 3, icon: "🏆", desc: "味方全員の攻撃力+1＆HP+2＆無敵バリア（🛡️）付与！" },

  { id: "j_min", pack: 2, name: "なんJ民", type: "meme", era: "VIP/なんJ", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 2, icon: "⚾", desc: "「サンキューガッツ」勢いだけで突っ込む特攻隊。" },
  { id: "resuba_king", pack: 2, name: "レスバ最強の男", type: "meme", era: "VIP/なんJ", rarity: "SR", cost: 3, atk: 4, hp: 3, freshness: 3, icon: "💬", desc: "召喚時：相手ミーム1体に2ダメージを与える。" },
  { id: "grass_hayasu", pack: 2, name: "草生える", type: "spell", era: "VIP/なんJ", rarity: "N", cost: 1, icon: "🌿", desc: "味方ミーム1体の攻撃力を+2する。" },
  { id: "yakusoku_j", pack: 2, name: "33-4の呪い", type: "spell", era: "VIP/なんJ", rarity: "R", cost: 2, icon: "🔢", desc: "相手ミーム1体に3ダメージ＆相手本体に1ダメージ。" },
  { id: "tokutei_pro", pack: 2, name: "ガチ特定班", type: "meme", era: "VIP/なんJ", rarity: "SR", cost: 4, atk: 4, hp: 3, freshness: 3, icon: "🛰️", desc: "召喚時：相手ミーム1体の鮮度を1にする。" },

  { id: "pepe", pack: 2, name: "Pepe the Frog", type: "meme", era: "海外", rarity: "UR", cost: 3, atk: 2, hp: 4, freshness: 4, icon: "🐸", desc: "召喚時：自分のメンタルが相手より少なければカードを2枚ドロー！" },
  { id: "stonks", pack: 2, name: "Stonks（爆益マン）", type: "spell", era: "海外", rarity: "R", cost: 1, icon: "📈", desc: "次のターンまで最大ギガ+1＆1枚ドロー。" },
  { id: "cheems", pack: 2, name: "Cheems（泣き柴）", type: "meme", era: "海外", rarity: "N", cost: 1, atk: 1, hp: 3, freshness: 4, icon: "🐶", desc: "打たれ強い海外ミームの癒やし枠。" },
  { id: "gabe_dog", pack: 2, name: "Gabe the Dog", type: "meme", era: "海外", rarity: "R", cost: 2, atk: 2, hp: 2, freshness: 3, icon: "🐩", desc: "「Bork!」召喚時：味方全体の攻撃力を+1する。" },
  { id: "skibidi", pack: 2, name: "カオス脳溶けミーム", type: "meme", era: "海外", rarity: "SR", cost: 3, atk: 5, hp: 2, freshness: 2, icon: "🚽", desc: "爆発的な攻撃力を持つが2ターンで飽きられる。" },

  { id: "meiwaku", pack: 2, name: "迷惑系配信者", type: "meme", era: "配信者", rarity: "UR", cost: 4, atk: 5, hp: 3, freshness: 2, icon: "🚨", desc: "召喚時：お互いの手札を1枚ランダムに捨てさせ、相手本体に2ダメージ！" },
  { id: "dousetsu", pack: 2, name: "同接工作員", type: "meme", era: "配信者", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 3, icon: "🤖", desc: "場の数を水増しする軽量ユニット。" },
  { id: "enjo_nenryo", pack: 2, name: "炎上燃料投下", type: "spell", era: "配信者", rarity: "SR", cost: 2, icon: "⛽", desc: "相手ミーム1体に3ダメージ。それで倒せたら1枚ドロー！" },
  { id: "gacha_bakushi", pack: 2, name: "ガチャ爆死配信", type: "spell", era: "配信者", rarity: "R", cost: 2, icon: "💸", desc: "自分のギガを2回復し、カードを1枚ドローする。" },
  { id: "vtuber_debut", pack: 2, name: "新人V初配信", type: "meme", era: "配信者", rarity: "R", cost: 2, atk: 2, hp: 2, freshness: 3, icon: "✨", desc: "召喚時：カードを1枚ドローする。" },

  { id: "x_spec", pack: 2, name: "仕様変更（インプレ制限）", type: "spell", era: "X炎上", rarity: "SR", cost: 2, icon: "🔧", desc: "相手ミーム全ての鮮度を-1する（0になったミームは即消滅）。" },
  { id: "bazu_tweet", pack: 2, name: "万バズ構文", type: "spell", era: "X炎上", rarity: "R", cost: 2, icon: "🚀", desc: "自分の場のミーム1体に「バズ中（攻撃+1）」と無敵バリア（🛡️）を付与。" },
  { id: "kusoripu", pack: 2, name: "クソリプ製造機", type: "meme", era: "X炎上", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 2, icon: "📩", desc: "相手をイラつかせる軽量アタッカー。" },
  { id: "digital_tattoo", pack: 2, name: "デジタルタトゥー", type: "spell", era: "X炎上", rarity: "SR", cost: 3, icon: "🖋️", desc: "相手ミーム1体に3ダメージ＆相手メンタルに2ダメージ。" },

  // ================= 新規メタ＆GODキラーカード（pack: 2） =================
  { id: "dat_ochi", pack: 2, name: "過去ログ倉庫の閉鎖（DAT落ち）", type: "spell", era: "令和", rarity: "SR", cost: 2, icon: "🗄️", desc: "【メタ】相手の「2ch」ミーム1体を即消滅＆本体に2ダメ。（対象不在なら1枚ドロー）" },
  { id: "elon_ban", pack: 2, name: "イーロンの気まぐれ凍結", type: "spell", era: "X炎上", rarity: "SR", cost: 2, icon: "🐦", desc: "【メタ】相手の「X炎上」ミーム全ての無敵バリアを剥がし4ダメージ！" },
  { id: "omakuni", pack: 2, name: "おま国（リージョンロック）", type: "spell", era: "令和", rarity: "SR", cost: 2, icon: "🚫", desc: "【メタ】相手の「海外」ミーム1体を即消滅＆ギガ1回復。（対象不在なら1枚ドロー）" },
  { id: "god_killer_503", pack: 2, name: "鯖落ち（503 Error）", type: "spell", era: "2ch", rarity: "UR", cost: 2, icon: "🔌", desc: "【GODキラー】相手の「GOD」レアを無敵バリアごと即消滅＆本体3ダメ＆2枚ドロー！※GOD以外無効" },

  // ================= 第3弾：伝説のアニメミーム＆名言編（pack: 3 / 全44種） =================
  // --- GOD (2種) ---
  { id: "god_flag_master", pack: 3, name: "『勝ったな、ガハハ！』のフラグ建築士", type: "meme", era: "アニメ", rarity: "GOD", cost: 6, atk: 6, hp: 6, freshness: 4, icon: "🚩", desc: "【GOD降臨】召喚時：自分のメンタル+5＆2枚ドロー＆味方全体の攻撃+2・鮮度+1。" },
  { id: "god_tomarunja", pack: 3, name: "止まるんじゃねぇぞ…（鉄華団の遺志）", type: "meme", era: "アニメ", rarity: "GOD", cost: 7, atk: 7, hp: 5, freshness: 5, icon: "🕺", desc: "【GOD降臨】召喚時：相手全体に4ダメージ！倒した数だけ最大ギガ+1＆相手本体に2ダメージ。" },

  // --- UR (6種) ---
  { id: "daga_kotowaru", pack: 3, name: "だが断る（岸辺露伴の流儀）", type: "spell", era: "アニメ", rarity: "UR", cost: 3, icon: "🙅", desc: "味方1体に無敵バリア（🛡️）を付与し、相手の攻撃力最大のミーム1体の攻撃力を0にする。" },
  { id: "omae_shindeiru", pack: 3, name: "お前はもう死んでいる（北斗神拳）", type: "spell", era: "アニメ", rarity: "UR", cost: 4, icon: "👉", desc: "相手ミーム1体の鮮度を強制的に1にし、相手本体に3ダメージを与える。" },
  { id: "keikaku_dori", pack: 3, name: "計画通り（ニヤリ顔）", type: "spell", era: "アニメ", rarity: "UR", cost: 3, icon: "📓", desc: "山札から3枚ドローし、手札にある「構文（スペル）」全てのコストを-1する。" },
  { id: "nigecha_dame", pack: 3, name: "逃げちゃダメだ、逃げちゃダメだ…", type: "meme", era: "アニメ", rarity: "UR", cost: 4, atk: 5, hp: 5, freshness: 3, icon: "🤖", desc: "召喚時：自分のメンタルが10以下なら暴走覚醒し、攻撃力+4＆HP+4！" },
  { id: "hito_no_yume", pack: 3, name: "人の夢は！！！終わらねェ！！！！", type: "meme", era: "アニメ", rarity: "UR", cost: 5, atk: 5, hp: 6, freshness: 4, icon: "🏴‍☠️", desc: "召喚時：味方全体の鮮度を+2し、山札から1枚ドローする。" },
  { id: "tsumaranu_mono", pack: 3, name: "またつまらぬものを斬ってしまった", type: "meme", era: "アニメ", rarity: "UR", cost: 4, atk: 6, hp: 3, freshness: 3, icon: "⚔️", desc: "召喚時：相手の場のコスト3以下のミームを全て一刀両断（破壊）する。" },

  // --- SR (10種) ---
  { id: "douiukoto_nano", pack: 3, name: "どういうことなの…（絶望の顔）", type: "spell", era: "アニメ", rarity: "SR", cost: 2, icon: "😨", desc: "相手ミーム1体の無敵バリアを解除し、攻撃力-2＆鮮度-1する。" },
  { id: "oni_ni_naranai", pack: 3, name: "お前も鬼にならないか？", type: "spell", era: "アニメ", rarity: "SR", cost: 3, icon: "👹", desc: "相手のコスト2以下のミーム1体を奪って自分の場に出す（場に空きがある場合）。" },
  { id: "oi_duel_shiroyo", pack: 3, name: "おい、デュエルしろよ", type: "spell", era: "アニメ", rarity: "SR", cost: 2, icon: "🃏", desc: "お互いカードを2枚ドローし、自分のギガを2回復する。" },
  { id: "poptepipic", pack: 3, name: "ポプテピピックのクソアニメ精神", type: "meme", era: "アニメ", rarity: "SR", cost: 2, atk: 3, hp: 2, freshness: 2, icon: "🖕", desc: "召喚時：50%で相手本体に3ダメ、50%で自分本体に2ダメ＆2枚ドロー。" },
  { id: "uchujin_iru", pack: 3, name: "この中に一人、宇宙人がいる！", type: "meme", era: "アニメ", rarity: "SR", cost: 3, atk: 3, hp: 4, freshness: 3, icon: "👽", desc: "召喚時：自分の場に「アニメ」以外のミームがいれば攻撃力+2＆1枚ドロー。" },
  { id: "nanimo_kowakunai", pack: 3, name: "もう何も恐くない", type: "spell", era: "アニメ", rarity: "SR", cost: 2, icon: "🎀", desc: "味方ミーム1体のHP+4＆攻撃+2＆鮮度+1するが、鮮度が1になる（次ターン散る）。" },
  { id: "kamikai_sakuga", pack: 3, name: "神回（神作画の覚醒）", type: "spell", era: "アニメ", rarity: "SR", cost: 3, icon: "✨", desc: "自分の場のミーム全ての攻撃力+2＆HP+2する。" },
  { id: "aibou_kaerou", pack: 3, name: "もう一人のボク（闇のゲーム）", type: "meme", era: "アニメ", rarity: "SR", cost: 3, atk: 4, hp: 3, freshness: 3, icon: "👁️", desc: "召喚時：相手の手札を1枚ランダムに破壊し、相手に2ダメージ。" },
  { id: "zetsubou_sensei", pack: 3, name: "絶望した！この世に絶望した！", type: "meme", era: "アニメ", rarity: "SR", cost: 3, atk: 2, hp: 4, freshness: 3, icon: "👘", desc: "召喚時：相手全体の攻撃力を-1し、自分のメンタルを3回復。" },
  { id: "kono_subarashii", pack: 3, name: "エクスプロージョン！（爆裂魔法）", type: "spell", era: "アニメ", rarity: "SR", cost: 4, icon: "💥", desc: "相手ミーム全体に4ダメージを与えるが、次のターン開始時の自分のギガが-1。" },

  // --- R (12種) ---
  { id: "kisama_miteiruna", pack: 3, name: "貴様…見ているなッ！", type: "spell", era: "アニメ", rarity: "R", cost: 1, icon: "👀", desc: "相手の手札1枚をログに公開し、自分は山札から1枚ドローする。" },
  { id: "anta_bakaa", pack: 3, name: "あんたバカァ！？", type: "spell", era: "アニメ", rarity: "R", cost: 1, icon: "💢", desc: "味方ミーム1体の攻撃力を+3するが、鮮度が-1される。" },
  { id: "sakuga_houkai", pack: 3, name: "作画崩壊（伝説のキャベツ）", type: "spell", era: "アニメ", rarity: "R", cost: 2, icon: "🥬", desc: "相手の場のミーム全ての攻撃力を-2する（最低0）。" },
  { id: "soushuuhen", pack: 3, name: "総集編（尺稼ぎ）", type: "spell", era: "アニメ", rarity: "R", cost: 1, icon: "📼", desc: "お互いの場のミーム全ての鮮度を+1し、自分は1枚ドローする。" },
  { id: "yamucha", pack: 3, name: "ヤムチャしやがって…", type: "meme", era: "アニメ", rarity: "R", cost: 1, atk: 1, hp: 1, freshness: 1, icon: "💥", desc: "召喚時：即座に自爆して相手ミーム全体に2ダメージ＆自分は1枚ドロー。" },
  { id: "ore_no_turn", pack: 3, name: "ずっと俺のターン！", type: "spell", era: "アニメ", rarity: "R", cost: 2, icon: "⏭️", desc: "自分のギガを1回復し、カードを1枚ドローする。" },
  { id: "kurorekishi_note", pack: 3, name: "邪王真眼（中二病の覚醒）", type: "meme", era: "アニメ", rarity: "R", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "🩹", desc: "召喚時：自分の場に「構文」を使ったターンなら攻撃力+2。" },
  { id: "nikkori_smile", pack: 3, name: "にっこにっこにー♪", type: "meme", era: "アニメ", rarity: "R", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🤟", desc: "召喚時：味方全体のHP+2＆自分のメンタルを2回復する。" },
  { id: "uso_da", pack: 3, name: "嘘だッ！！！（豹変）", type: "spell", era: "アニメ", rarity: "R", cost: 2, icon: "🔪", desc: "相手ミーム1体に3ダメージを与え、相手本体に1ダメージ。" },
  { id: "jikai_yokoku", pack: 3, name: "次回『〇〇死す』デュエルスタンバイ！", type: "spell", era: "アニメ", rarity: "R", cost: 2, icon: "📢", desc: "相手ミーム1体の鮮度を-2する（0以下になれば即オワコン化）。" },
  { id: "sekai_he_habatake", pack: 3, name: "大いなる力には大いなる代償", type: "spell", era: "アニメ", rarity: "R", cost: 1, icon: "⚖️", desc: "自分のメンタルを3削る代わりに、山札から2枚ドローする。" },
  { id: "speedwagon", pack: 3, name: "解説するスピードワゴン", type: "meme", era: "アニメ", rarity: "R", cost: 2, atk: 1, hp: 4, freshness: 4, icon: "🎩", desc: "召喚時：山札から1枚ドローし、味方1体の攻撃力を+1する。" },

  // --- N (14種) ---
  { id: "mob_chara", pack: 3, name: "異世界転生トラック", type: "meme", era: "アニメ", rarity: "N", cost: 2, atk: 3, hp: 1, freshness: 2, icon: "🚚", desc: "召喚時：相手ミーム1体に1ダメージを与える突撃トラック。" },
  { id: "osananajimi", pack: 3, name: "負けヒロインの幼馴染", type: "meme", era: "アニメ", rarity: "N", cost: 1, atk: 1, hp: 3, freshness: 3, icon: "🎀", desc: "召喚時：自分のメンタルが相手より低ければHP+2。" },
  { id: "shujinkou_hosei", pack: 3, name: "主人公補正", type: "spell", era: "アニメ", rarity: "N", cost: 1, icon: "🌟", desc: "味方ミーム1体の攻撃力+1＆HP+2する。" },
  { id: "nyanpasu", pack: 3, name: "にゃんぱすー", type: "meme", era: "アニメ", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 4, icon: "🪈", desc: "のどかな挨拶。召喚時、自分のメンタルを2回復する。" },
  { id: "gomen_yui", pack: 3, name: "ごめん、ユイ…（名言）", type: "spell", era: "アニメ", rarity: "N", cost: 1, icon: "💔", desc: "味方ミーム1体を犠牲（破壊）にする代わりに、ギガを2回復＆1枚ドロー。" },
  { id: "kouhai_chan", pack: 3, name: "先輩、顔が近いです", type: "meme", era: "アニメ", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 3, icon: "😳", desc: "低コストで素早く攻撃できる後輩枠。" },
  { id: "tsundere", pack: 3, name: "べ、別にあんたのためじゃないんだからね！", type: "spell", era: "アニメ", rarity: "N", cost: 1, icon: "😤", desc: "味方ミーム1体の攻撃力を+2する。" },
  { id: "haraguro_megane", pack: 3, name: "メガネクイッ（全部計算通り）", type: "meme", era: "アニメ", rarity: "N", cost: 2, atk: 2, hp: 2, freshness: 3, icon: "👓", desc: "召喚時：手札が3枚以下なら1枚ドローする。" },
  { id: "to_be_continued", pack: 3, name: "To Be Continued... ➔", type: "spell", era: "アニメ", rarity: "N", cost: 2, icon: "🎸", desc: "味方ミーム1体の鮮度を+2し、HPを2回復する。" },
  { id: "yamete_raifu", pack: 3, name: "もうやめて！ライフはとっくにゼロよ！", type: "spell", era: "アニメ", rarity: "N", cost: 1, icon: "😱", desc: "自分のメンタルが8以下なら、自分のメンタルを5回復する。" },
  { id: "kininarimasu", pack: 3, name: "私、気になります！", type: "meme", era: "アニメ", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 3, icon: "🧐", desc: "召喚時：1枚ドローし、手札を1枚ランダムに捨てる。" },
  { id: "ikari_no_super", pack: 3, name: "クリリンのことかーーーっ！！", type: "spell", era: "アニメ", rarity: "N", cost: 2, icon: "⚡", desc: "味方ミーム1体の攻撃力を+3する。" },
  { id: "isekai_slime", pack: 3, name: "転生したらスライムだった件", type: "meme", era: "アニメ", rarity: "N", cost: 1, atk: 1, hp: 3, freshness: 4, icon: "💧", desc: "しぶとく生き残る最弱（最強）スライム。" },
  { id: "op_skip", pack: 3, name: "OPスキップ勢", type: "spell", era: "アニメ", rarity: "N", cost: 1, icon: "⏩", desc: "相手ミーム1体に2ダメージを与える。" },

  // ================= 第4弾：伝説のゲーム＆実況者・RTA編（pack: 4 / 全42種） =================
  // --- GOD (2種 / ナーフ調整済) ---
  { id: "god_rta_runner", pack: 4, name: "世界記録更新（RTA完走者）", type: "meme", era: "ゲーム", rarity: "GOD", cost: 6, atk: 6, hp: 6, freshness: 4, icon: "⏱️", desc: "【神降臨】召喚時：山札から2枚ドローし、自分のギガを+2回復する（最大10）。" },
  { id: "god_final_boss", pack: 4, name: "伝説のラスボス（第2形態）", type: "meme", era: "ゲーム", rarity: "GOD", cost: 6, atk: 5, hp: 5, freshness: 4, icon: "👿", desc: "【神降臨】破壊時（鮮度切れ除く）：ATK6/HP6/鮮度3の『真・最終形態』として1度だけ復活する！" },

  // --- UR (4種) ---
  { id: "ur_wall_clip", pack: 4, name: "壁抜けバグ（Any%走者）", type: "meme", era: "ゲーム", rarity: "UR", cost: 4, atk: 4, hp: 3, freshness: 3, icon: "🧱", desc: "召喚時：相手の無敵バリアを無視して相手本体に直接3ダメージ＆1枚ドロー！" },
  { id: "ur_gacha_whaler", pack: 4, name: "天井まで回す廃課金兵", type: "meme", era: "ゲーム", rarity: "UR", cost: 5, atk: 5, hp: 5, freshness: 4, icon: "💳", desc: "召喚時：山札から2枚ドローし、味方全体の攻撃力+1！" },
  { id: "ur_pro_gamer", pack: 4, name: "フレーム単位の格ゲー神", type: "meme", era: "ゲーム", rarity: "UR", cost: 4, atk: 5, hp: 4, freshness: 3, icon: "🕹️", desc: "召喚時：相手ミーム1体に3ダメージを与え、そのミームの攻撃力を-2する。" },
  { id: "ur_save_load", pack: 4, name: "禁断のセーブ＆ロード", type: "spell", era: "ゲーム", rarity: "UR", cost: 3, icon: "💾", desc: "自分のメンタルを4回復し、山札から2枚ドロー＆味方全体の鮮度+1！" },

  // --- SR (8種) ---
  { id: "sr_kusoge_hunter", pack: 4, name: "伝説のクソゲーハンター", type: "meme", era: "ゲーム", rarity: "SR", cost: 3, atk: 3, hp: 4, freshness: 4, icon: "💿", desc: "召喚時：相手の場のコスト3以下のミーム1体を破壊する。" },
  { id: "sr_first_play_lie", pack: 4, name: "初見プレイです（周回済）", type: "meme", era: "ゲーム", rarity: "SR", cost: 3, atk: 4, hp: 3, freshness: 3, icon: "😏", desc: "召喚時：相手の手札が3枚以上なら、ランダムに1枚捨てさせる。" },
  { id: "sr_lag_switch", pack: 4, name: "回線抜き＆ラグ使い", type: "meme", era: "ゲーム", rarity: "SR", cost: 3, atk: 2, hp: 4, freshness: 3, icon: "📡", desc: "召喚時：相手ミーム1体の鮮度を-1し、攻撃力を0にする。" },
  { id: "sr_speedrun_chart", pack: 4, name: "分厚いRTAチャート表", type: "spell", era: "ゲーム", rarity: "SR", cost: 2, icon: "📋", desc: "山札から2枚ドローし、このターン味方ミーム1体の攻撃力を+2する。" },
  { id: "sr_timer_stop", pack: 4, name: "タイマーストップ！", type: "spell", era: "ゲーム", rarity: "SR", cost: 3, icon: "🛑", desc: "相手ミーム全体の攻撃力を次のターンまで-2し、相手本体に2ダメージ！" },
  { id: "sr_gacha_explosion", pack: 4, name: "爆死確定演出（最低保証）", type: "spell", era: "ゲーム", rarity: "SR", cost: 2, icon: "💥", desc: "相手ミーム全体に2ダメージを与え、自分もメンタルに1ダメージ受ける。" },
  { id: "sr_stream_snipe", pack: 4, name: "ゴースティング視聴者", type: "meme", era: "ゲーム", rarity: "SR", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "👁️", desc: "召喚時：相手の手札の枚数×1ダメージを相手ミーム1体に与える。" },
  { id: "sr_rage_quit", pack: 4, name: "台パン＆コントローラー破壊", type: "spell", era: "ゲーム", rarity: "SR", cost: 3, icon: "👊", desc: "相手ミーム1体に4ダメージを与え、余剰分があれば相手本体に1ダメージ！" },

  // --- R (12種) ---
  { id: "r_kokosuki", pack: 4, name: "ここ好き（弾幕職人）", type: "meme", era: "ゲーム", rarity: "R", cost: 2, atk: 2, hp: 2, freshness: 3, icon: "💬", desc: "召喚時：他の味方ゲームミームがいれば1枚ドロー！" },
  { id: "r_tutorial_skip", pack: 4, name: "チュートリアル即スキップ勢", type: "meme", era: "ゲーム", rarity: "R", cost: 2, atk: 3, hp: 2, freshness: 2, icon: "⏭️", desc: "攻撃力は高いが鮮度が2と短い速攻アタッカー。" },
  { id: "r_fps_camper", pack: 4, name: "角待ちスナイパー", type: "meme", era: "ゲーム", rarity: "R", cost: 3, atk: 4, hp: 2, freshness: 4, icon: "🎯", desc: "召喚時：相手ミーム1体に1ダメージを与える。" },
  { id: "r_healer_aggro", pack: 4, name: "回復を忘れた脳筋ヒーラー", type: "meme", era: "ゲーム", rarity: "R", cost: 2, atk: 3, hp: 3, freshness: 3, icon: "🪄", desc: "召喚時：自分のメンタルを2回復する。" },
  { id: "r_npc_villager", pack: 4, name: "同じことしか言わない村人A", type: "meme", era: "ゲーム", rarity: "R", cost: 1, atk: 1, hp: 4, freshness: 5, icon: "🧑‍🌾", desc: "鮮度5で場持ち抜群の鉄壁NPC。" },
  { id: "r_boss_bgm", pack: 4, name: "処刑用BGMが流れ出す瞬間", type: "spell", era: "ゲーム", rarity: "R", cost: 2, icon: "🎸", desc: "味方ミーム全体の攻撃力を+1し、鮮度を+1する。" },
  { id: "r_hitbox_bug", pack: 4, name: "当たり判定ガバガバ現象", type: "spell", era: "ゲーム", rarity: "R", cost: 2, icon: "🔲", desc: "味方ミーム1体に無敵バリア（🛡️）を付与する。" },
  { id: "r_patch_nerf", pack: 4, name: "緊急アプデの下方修正", type: "spell", era: "ゲーム", rarity: "R", cost: 2, icon: "📉", desc: "相手ミーム1体の攻撃力を-3し、HPを-1する。" },
  { id: "r_coop_friend", pack: 4, name: "フレンドリーファイア常習犯", type: "meme", era: "ゲーム", rarity: "R", cost: 2, atk: 4, hp: 3, freshness: 3, icon: "💣", desc: "高スタッツだが召喚時に自分のメンタルに2ダメージ。" },
  { id: "r_achievement", pack: 4, name: "トロコン達成のやり込み勢", type: "meme", era: "ゲーム", rarity: "R", cost: 3, atk: 3, hp: 4, freshness: 4, icon: "🏆", desc: "召喚時：自分のメンタルが15以上なら攻撃力+2！" },
  { id: "r_loading_99", pack: 4, name: "99%で止まるロード画面", type: "spell", era: "ゲーム", rarity: "R", cost: 1, icon: "⏳", desc: "相手ミーム1体の鮮度を-1し、自分は1枚ドロー。" },
  { id: "r_double_jump", pack: 4, name: "謎の2段ジャンプ物理法則", type: "spell", era: "ゲーム", rarity: "R", cost: 1, icon: "🦘", desc: "味方ミーム1体の攻撃力+1＆HP+2！" },

  // --- N (16種) ---
  { id: "n_slime_lv1", pack: 4, name: "Lv1のチュートリアルスライム", type: "meme", era: "ゲーム", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 3, icon: "🫧", desc: "冒険の最初に必ず倒されるおなじみの雑魚敵。" },
  { id: "n_controller_2p", pack: 4, name: "弟に渡される壊れた2Pコン", type: "meme", era: "ゲーム", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 3, icon: "🎮", desc: "ボタンが効かないが攻撃力だけは2ある。" },
  { id: "n_yakusou", pack: 4, name: "初期装備のやくそう", type: "spell", era: "ゲーム", rarity: "N", cost: 1, icon: "🌿", desc: "自分のメンタルを3回復する。" },
  { id: "n_wooden_sword", pack: 4, name: "ひのきのぼう", type: "spell", era: "ゲーム", rarity: "N", cost: 1, icon: "🪵", desc: "味方ミーム1体の攻撃力を+2する。" },
  { id: "n_fps_drop", pack: 4, name: "処理落ちカクカク現象", type: "spell", era: "ゲーム", rarity: "N", cost: 1, icon: "🐌", desc: "相手ミーム1体の攻撃力を-2する。" },
  { id: "n_afker", pack: 4, name: "放置プレイヤー（AFK）", type: "meme", era: "ゲーム", rarity: "N", cost: 1, atk: 0, hp: 4, freshness: 4, icon: "💤", desc: "全く動かないが壁としては優秀。" },
  { id: "n_gg_ez", pack: 4, name: "煽りチャット「GG EZ」", type: "spell", era: "ゲーム", rarity: "N", cost: 1, icon: "🗨️", desc: "相手本体に2ダメージを与える。" },
  { id: "n_lootbox", pack: 4, name: "光る宝箱（中身はゴミ）", type: "meme", era: "ゲーム", rarity: "N", cost: 2, atk: 1, hp: 2, freshness: 3, icon: "🧰", desc: "召喚時：1枚ドローする。" },
  { id: "n_autosave_icon", pack: 4, name: "右上のオートセーブアイコン", type: "meme", era: "ゲーム", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 4, icon: "💿", desc: "「電源を切らないでください」鮮度4。" },
  { id: "n_fall_damage", pack: 4, name: "落下ダメージ確認勢", type: "spell", era: "ゲーム", rarity: "N", cost: 1, icon: "🪂", desc: "相手ミーム1体に2ダメージを与える。" },
  { id: "n_skip_cutscene", pack: 4, name: "ムービー全スキップ勢", type: "meme", era: "ゲーム", rarity: "N", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "⏩", desc: "ストーリーを読まずに突き進む脳筋プレイヤー。" },
  { id: "n_easter_egg", pack: 4, name: "開発者の隠し部屋", type: "spell", era: "ゲーム", rarity: "N", cost: 1, icon: "🔑", desc: "自分のギガを1回復し、味方ミーム1体の鮮度+1。" },
  { id: "n_mimic_chest", pack: 4, name: "人食い宝箱ミミック", type: "meme", era: "ゲーム", rarity: "N", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "🦷", desc: "開けた瞬間噛みついてくる罠モンスター。" },
  { id: "n_respawn_point", pack: 4, name: "リスポーン地点の焚き火", type: "spell", era: "ゲーム", rarity: "N", cost: 1, icon: "🔥", desc: "味方ミーム1体のHPを3回復する。" },
  { id: "n_noob_shield", pack: 4, name: "初心者マーク付きタンク", type: "meme", era: "ゲーム", rarity: "N", cost: 2, atk: 1, hp: 4, freshness: 4, icon: "🔰", desc: "体力4で序盤の守りを固める。" },
  { id: "n_glitch_pixel", pack: 4, name: "バグったポリゴン塊", type: "meme", era: "ゲーム", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 2, icon: "👾", desc: "不安定だがコスト1で攻撃力2。" },

  // ================= 第5弾：スマホ・ソシャゲ＆SNSバズ編（pack: 5 / 全34種・トレンド＆伏せ構文収録） =================
  // --- GOD (2種) ---
  { id: "god_jinken_chara", pack: 5, name: "人権キャラ実装（天井確定演出）", type: "meme", era: "ソシャゲ", rarity: "GOD", cost: 7, atk: 7, hp: 7, freshness: 5, icon: "🌈", desc: "【神降臨】召喚時：山札からコスト4以上のミーム1体を場に出し、味方全体に無敵バリア＆攻撃力+2！" },
  { id: "god_sashu_notice", pack: 5, name: "サ終のお知らせ（サービス終了）", type: "spell", era: "ソシャゲ", rarity: "GOD", cost: 6, icon: "🪦", desc: "【神構文】お互いの場のミームを無敵バリア貫通で全消滅＆お互いの手札を全て捨てて3枚ドロー！" },

  // --- トレンドカード（フィールド / type: "trend" / 5種） ---
  { id: "trend_enjo_fire", pack: 5, name: "【トレンド】大炎上トレンド1位", type: "trend", era: "ソシャゲ", rarity: "SR", cost: 2, icon: "🔥", desc: "【トレンド】場にある間、お互いの全ミームの攻撃力+2！ただしターン開始時に鮮度が追加で-1される。" },
  { id: "trend_low_speed", pack: 5, name: "【トレンド】通信制限（低速モード）", type: "trend", era: "ソシャゲ", rarity: "SR", cost: 2, icon: "📡", desc: "【トレンド】場にある間、お互いの最大ギガ上限が5になる（高コスト対策）。" },
  { id: "trend_midnight", pack: 5, name: "【トレンド】深夜のテンション", type: "trend", era: "ソシャゲ", rarity: "R", cost: 2, icon: "🌙", desc: "【トレンド】場にある間、「2ch・ニコニコ・例のアレ・ソシャゲ」ミームはターン開始時に鮮度が減らない！" },
  { id: "trend_algo_bug", pack: 5, name: "【トレンド】おすすめ欄バグ", type: "trend", era: "ソシャゲ", rarity: "UR", cost: 3, icon: "📱", desc: "【トレンド】場にある間、お互いターン開始時のドローが2枚になる！" },
  { id: "trend_pickup_up", pack: 5, name: "【トレンド】ピックアップ確率UP祭", type: "trend", era: "ソシャゲ", rarity: "R", cost: 2, icon: "💎", desc: "【トレンド】場にある間、お互いの「ソシャゲ」ミームの攻撃力+2＆ターン開始時にメンタル1回復！" },

  // --- 伏せ構文（トラップ / type: "trap" / 5種） ---
  { id: "trap_block_report", pack: 5, name: "【伏せ】ブロック＆通報", type: "trap", era: "ソシャゲ", rarity: "SR", cost: 2, icon: "🚫", desc: "【伏せ構文】相手ミームが直接攻撃してきた時に自動発動！その直接攻撃を無効化し、攻撃ミームの攻撃力-2＆鮮度-1！" },
  { id: "trap_gyotaku", pack: 5, name: "【伏せ】魚拓（スクショ保存）", type: "trap", era: "ソシャゲ", rarity: "R", cost: 1, icon: "📸", desc: "【伏せ構文】相手が構文（スペル）を発動した時に自動発動！自分は山札から2枚ドローする！" },
  { id: "trap_airp_police", pack: 5, name: "【伏せ】エアプ警察の指摘", type: "trap", era: "ソシャゲ", rarity: "SR", cost: 2, icon: "🛡️", desc: "【伏せ構文】相手がコスト4以上のミームを召喚した時に自動発動！そのミームの攻撃力を0＆鮮度-1！" },
  { id: "trap_enjo_counter", pack: 5, name: "【伏せ】炎上カウンター", type: "trap", era: "ソシャゲ", rarity: "R", cost: 2, icon: "💣", desc: "【伏せ構文】相手ミームが自分のミームを攻撃した時に自動発動！相手本体に3ダメ＆攻撃したミームに2ダメ！" },
  { id: "trap_surinuke", pack: 5, name: "【伏せ】すり抜けの罠", type: "trap", era: "ソシャゲ", rarity: "UR", cost: 2, icon: "💸", desc: "【伏せ構文】相手がミームを召喚した時に自動発動！そのミームに3ダメージを与え、自分のギガを1回復！" },

  // --- UR (3種) ---
  { id: "ur_single_pull_god", pack: 5, name: "無課金勢の奇跡（単発神引き）", type: "spell", era: "ソシャゲ", rarity: "UR", cost: 3, icon: "✨", desc: "山札から3枚ドローし、自分の手札全てのコストを-1する（最低0）！" },
  { id: "ur_stamina_stone", pack: 5, name: "スタミナ全回復の石割り", type: "spell", era: "ソシャゲ", rarity: "UR", cost: 2, icon: "💠", desc: "自分のギガを全回復し、味方ミーム1体の鮮度を+2＆再行動（攻撃回数回復）させる！" },
  { id: "ur_whale_emperor", pack: 5, name: "完凸理論値の廃課金ランカー", type: "meme", era: "ソシャゲ", rarity: "UR", cost: 5, atk: 6, hp: 5, freshness: 4, icon: "👑", desc: "召喚時：自身に無敵バリアを付与し、自分の場の「ソシャゲ」ミーム全体の攻撃力+2！" },

  // --- SR (5種) ---
  { id: "sr_surinuke_bakushi", pack: 5, name: "すり抜け爆死（ピックアップ仕事しろ）", type: "spell", era: "ソシャゲ", rarity: "SR", cost: 2, icon: "😭", desc: "相手ミーム1体に3ダメージ＆鮮度-1し、自分は1枚ドロー！" },
  { id: "sr_apology_gems", pack: 5, name: "メンテ延長のお詫び石（配布）", type: "meme", era: "ソシャゲ", rarity: "SR", cost: 3, atk: 2, hp: 4, freshness: 4, icon: "💎", desc: "召喚時：お互いのギガを+2回復し、自分はカードを2枚ドローする！" },
  { id: "sr_login_only", pack: 5, name: "ログイン勢（日課だけこなす民）", type: "meme", era: "ソシャゲ", rarity: "SR", cost: 2, atk: 1, hp: 4, freshness: 5, icon: "📅", desc: "鮮度5の長寿枠。召喚時：自分のメンタルを2回復＆1枚ドロー！" },
  { id: "sr_shadowban", pack: 5, name: "シャドウバン（おすすめ非表示）", type: "spell", era: "ソシャゲ", rarity: "SR", cost: 2, icon: "👻", desc: "相手ミーム1体の無敵バリアを剥がし、攻撃力を0にする！" },
  { id: "sr_kakin_inflation", pack: 5, name: "インフレ新環境（旧キャラ産廃化）", type: "meme", era: "ソシャゲ", rarity: "SR", cost: 3, atk: 4, hp: 3, freshness: 3, icon: "📈", desc: "召喚時：相手の場のコスト2以下のミーム1体を破壊する！" },

  // --- R (7種) ---
  { id: "r_reroll_loop", pack: 5, name: "リセマラ周回勢", type: "meme", era: "ソシャゲ", rarity: "R", cost: 1, atk: 1, hp: 2, freshness: 3, icon: "🔄", desc: "召喚時：手札が1枚以上あればランダムに1枚捨て、山札から2枚ドローする！" },
  { id: "r_oshi_kantotsu", pack: 5, name: "推しへの完凸報告", type: "spell", era: "ソシャゲ", rarity: "R", cost: 2, icon: "💖", desc: "味方ミーム1体の攻撃力+3＆HP+3（代償で自分のメンタルに2ダメージ）！" },
  { id: "r_badge_999", pack: 5, name: "通知バッジ999+（未読スルー）", type: "spell", era: "ソシャゲ", rarity: "R", cost: 2, icon: "🔔", desc: "相手ミーム1体の攻撃力を-3し、鮮度を-1する！" },
  { id: "r_collab_gacha", pack: 5, name: "唐突な異業種コラボイベント", type: "meme", era: "ソシャゲ", rarity: "R", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🎪", desc: "召喚時：自分の場に「ソシャゲ」以外のミームがいれば攻撃力+2＆1枚ドロー！" },
  { id: "r_gacha_sim", pack: 5, name: "ガチャ確率シミュレーター", type: "spell", era: "ソシャゲ", rarity: "R", cost: 1, icon: "🎰", desc: "50%で2枚ドロー＆ギガ+1、50%で1枚ドローのみ！" },
  { id: "r_daily_mission", pack: 5, name: "デイリー消化ガチ勢", type: "meme", era: "ソシャゲ", rarity: "R", cost: 2, atk: 3, hp: 2, freshness: 4, icon: "✅", desc: "召喚時：自分のギガを1回復する。" },
  { id: "r_trend_meta", pack: 5, name: "トレンド操作ボット（ハッシュタグ汚染）", type: "spell", era: "ソシャゲ", rarity: "R", cost: 1, icon: "🤖", desc: "現在発動中の【トレンド】を消滅させ、自分は2枚ドローする！" },

  // --- N (7種) ---
  { id: "n_auto_farm", pack: 5, name: "オート周回放置プレイ", type: "meme", era: "ソシャゲ", rarity: "N", cost: 1, atk: 2, hp: 2, freshness: 3, icon: "🔁", desc: "クセのない序盤の安定ソシャゲアタッカー。" },
  { id: "n_storage_full", pack: 5, name: "容量不足（ストレージがいっぱいです）", type: "spell", era: "ソシャゲ", rarity: "N", cost: 1, icon: "💾", desc: "相手ミーム1体に2ダメージ（相手の場に3体いれば4ダメージ）！" },
  { id: "n_battery_1pct", pack: 5, name: "充電残り1%の絶望", type: "spell", era: "ソシャゲ", rarity: "N", cost: 1, icon: "🪫", desc: "相手ミーム1体の鮮度を1にする。" },
  { id: "n_friend_point", pack: 5, name: "フレンドポイント召喚の星1", type: "meme", era: "ソシャゲ", rarity: "N", cost: 0, atk: 1, hp: 1, freshness: 2, icon: "⭐", desc: "コスト0で出せる軽量ソシャゲユニット。" },
  { id: "n_wifi_lost", pack: 5, name: "通信エラー（リトライ連打）", type: "spell", era: "ソシャゲ", rarity: "N", cost: 1, icon: "📶", desc: "相手ミーム1体の攻撃力を-2し、相手本体に1ダメージ。" },
  { id: "n_login_bonus", pack: 5, name: "連続ログインボーナス", type: "spell", era: "ソシャゲ", rarity: "N", cost: 1, icon: "🎁", desc: "味方ミーム1体のHPを2回復し、鮮度を+1＆自分のメンタル1回復。" },
  { id: "n_gacha_salt", pack: 5, name: "爆死スクショ供養勢", type: "meme", era: "ソシャゲ", rarity: "N", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🧂", desc: "召喚時：自分のメンタルを2回復する。" },

  // ================= 第6弾：AI・テクノロジー＆未来インターネット編（pack: 6 / 全34種） =================
  // --- GOD (2種) ---
  { id: "god_singularity", pack: 6, name: "シンギュラリティ到達（自我を持ったAI）", type: "meme", era: "AI・テック", rarity: "GOD", cost: 8, atk: 8, hp: 8, freshness: 5, icon: "🧠", desc: "【神降臨】召喚時：味方全体の攻撃力+3・HP+3＆無敵バリア付与＋2枚ドロー＋相手本体に3ダメージ！" },
  { id: "god_unplug_server", pack: 6, name: "サーバー物理破壊（コンセント引き抜き）", type: "spell", era: "AI・テック", rarity: "GOD", cost: 6, icon: "🔌", desc: "【神構文】発動中の【トレンド】・お互いの【伏せ構文】・場のミームを全て消滅させ、お互いのギガを3にする！" },

  // --- トレンドカード（3種） ---
  { id: "trend_ai_art_war", pack: 6, name: "【トレンド】AIイラスト絵柄論争", type: "trend", era: "AI・テック", rarity: "SR", cost: 2, icon: "🎨", desc: "【トレンド】場にある間、お互いのターン開始時にランダムな手札1枚を捨てて2枚ドローする！" },
  { id: "trend_deepfake_chaos", pack: 6, name: "【トレンド】ディープフェイク氾濫期", type: "trend", era: "AI・テック", rarity: "SR", cost: 2, icon: "🎭", desc: "【トレンド】場にある間、お互いの「AI・テック」ミームの攻撃力+2＆無敵バリアを貫通して本体攻撃はできないがドロー+1！" },
  { id: "trend_gpu_shortage", pack: 6, name: "【トレンド】GPU高騰・マイニング特需", type: "trend", era: "AI・テック", rarity: "R", cost: 2, icon: "🖥️", desc: "【トレンド】場にある間、お互いのコスト5以上のミームは召喚コスト+1（実質手札コスト増加）＆「AI・テック」HP+1！" },

  // --- 伏せ構文（3種） ---
  { id: "trap_captcha_robot", pack: 6, name: "【伏せ】私はロボットではありません", type: "trap", era: "AI・テック", rarity: "SR", cost: 2, icon: "🤖", desc: "【伏せ構文】相手が構文（スペル）を発動した時に自動発動！相手の残りギガを0にし、自分は1枚ドロー！" },
  { id: "trap_prompt_injection", pack: 6, name: "【伏せ】プロンプトインジェクション", type: "trap", era: "AI・テック", rarity: "UR", cost: 2, icon: "💉", desc: "【伏せ構文】相手がミームを召喚した時に自動発動！そのミームの攻撃力を2奪い、自分の場のランダムな味方1体に+2付与！" },
  { id: "trap_copyright_ai", pack: 6, name: "【伏せ】無断学習ブロッカー（ノイズ加工）", type: "trap", era: "AI・テック", rarity: "R", cost: 1, icon: "🛡️", desc: "【伏せ構文】相手ミームが直接攻撃してきた時に自動発動！受けるダメージを無効化し、自分のメンタルを2回復！" },

  // --- UR (3種) ---
  { id: "ur_deepfake_master", pack: 6, name: "ディープフェイク職人（本人より本人）", type: "meme", era: "AI・テック", rarity: "UR", cost: 4, atk: 3, hp: 4, freshness: 4, icon: "🎭", desc: "召喚時：相手ミーム1体を学習コピーし、そのミームの現在の攻撃力とHPをそのまま得る！" },
  { id: "ur_god_prompt", pack: 6, name: "神プロンプト詠唱（呪文エンジニアリング）", type: "spell", era: "AI・テック", rarity: "UR", cost: 3, icon: "📜", desc: "味方ミーム1体の攻撃力+2＆無敵バリア＋1ドロー（場に「AI・テック」がいれば攻撃+4＆2ドロー）！" },
  { id: "ur_agi_prototype", pack: 6, name: "汎用人工知能プロトタイプ（AGI-0）", type: "meme", era: "AI・テック", rarity: "UR", cost: 5, atk: 5, hp: 6, freshness: 4, icon: "⚛️", desc: "召喚時：自分の手札枚数ぶん味方全体の攻撃力を強化（手札3枚以上なら全員攻撃力+2＆1ドロー）！" },

  // --- SR (5種) ---
  { id: "sr_hallucination", pack: 6, name: "ハルシネーション（自信満々の大嘘）", type: "spell", era: "AI・テック", rarity: "SR", cost: 2, icon: "🌀", desc: "相手ミーム1体に4ダメージを与える（50%の確率で自分のメンタルにも2ダメージ）！" },
  { id: "sr_spam_bot_factory", pack: 6, name: "自動生成スパムボット量産機", type: "meme", era: "AI・テック", rarity: "SR", cost: 3, atk: 2, hp: 3, freshness: 3, icon: "🏭", desc: "召喚時：自分の場に空きがあれば「コピーボット（ATK2/HP1/鮮度2）」を最大2体まで展開！" },
  { id: "sr_ai_voice_cover", pack: 6, name: "AI音声カバー職人（故人・キャラ再現）", type: "meme", era: "AI・テック", rarity: "SR", cost: 3, atk: 3, hp: 3, freshness: 4, icon: "🎙️", desc: "召喚時：山札からスペルカードを1枚手札に加え、自分のギガを1回復する！" },
  { id: "sr_blockchain_nft", pack: 6, name: "高額NFTサル画像（右クリック保存不可）", type: "meme", era: "AI・テック", rarity: "SR", cost: 4, atk: 4, hp: 4, freshness: 3, icon: "🐵", desc: "召喚時：自身に無敵バリアを付与し、相手の手札が4枚以上なら1枚ランダムに破棄させる！" },
  { id: "sr_algorithm_ban", pack: 6, name: "AI自動モデレーション誤BAN", type: "spell", era: "AI・テック", rarity: "SR", cost: 2, icon: "⚖️", desc: "相手ミーム1体の無敵バリアを解除し、コスト3以下ならそのまま消滅させる！" },

  // --- R (9種) ---
  { id: "r_dolphin_assistant", pack: 6, name: "お前を消す方法（イルカの助手）", type: "spell", era: "AI・テック", rarity: "R", cost: 2, icon: "🐬", desc: "相手ミーム1体の鮮度を-2し、自分は山札から1枚ドローする！" },
  { id: "r_vrchat_mute", pack: 6, name: "VRChatの無言勢（美少女アバター）", type: "meme", era: "AI・テック", rarity: "R", cost: 2, atk: 1, hp: 5, freshness: 4, icon: "🥽", desc: "召喚時：味方ミーム1体に無敵バリアを付与する高耐久サポーター。" },
  { id: "r_crypto_crash", pack: 6, name: "仮想通貨の暴落（全財産溶けた男）", type: "spell", era: "AI・テック", rarity: "R", cost: 1, icon: "📉", desc: "自分の残りギガを全て消費し、消費したギガ×2のダメージを相手ミーム1体に与える（最低2ダメ）！" },
  { id: "r_lora_finetune", pack: 6, name: "追加学習LoRAモデル適用", type: "spell", era: "AI・テック", rarity: "R", cost: 2, icon: "🧬", desc: "味方ミーム1体の攻撃力+2＆HP+2＆鮮度+1！" },
  { id: "r_ai_vtuber", pack: 6, name: "24時間稼働AIライバー", type: "meme", era: "AI・テック", rarity: "R", cost: 2, atk: 2, hp: 3, freshness: 5, icon: "📡", desc: "鮮度5の永久機関。召喚時：自分のメンタルを2回復する。" },
  { id: "r_copilot_coding", pack: 6, name: "AIコード補完（Tabキー連打エンジニア）", type: "spell", era: "AI・テック", rarity: "R", cost: 2, icon: "⌨️", desc: "山札から2枚ドローし、手札の「AI・テック」カードのコストを全て-1する！" },
  { id: "r_robot_arm_fail", pack: 6, name: "ポンコツ二足歩行ロボット転倒", type: "meme", era: "AI・テック", rarity: "R", cost: 1, atk: 3, hp: 1, freshness: 2, icon: "🦾", desc: "コスト1で攻撃力3の特攻枠。召喚時：相手本体に1ダメージ！" },
  { id: "r_metaverse_land", pack: 6, name: "過疎メタバースの高級土地", type: "spell", era: "AI・テック", rarity: "R", cost: 2, icon: "🌐", desc: "自分の最大ギガを+1し、味方全体のHPを2回復する！" },
  { id: "r_deep_learning_loop", pack: 6, name: "過学習オーバーフィッティング", type: "spell", era: "AI・テック", rarity: "R", cost: 2, icon: "🔁", desc: "相手ミーム1体の攻撃力を半分（切り捨て）にし、鮮度を-1する！" },

  // --- N (9種) ---
  { id: "n_captcha_traffic", pack: 6, name: "信号機をすべて選択してください", type: "spell", era: "AI・テック", rarity: "N", cost: 1, icon: "🚦", desc: "相手ミーム1体の攻撃力を0にし、鮮度を-1する。" },
  { id: "n_local_llm", pack: 6, name: "ローカルLLM構築勢（グラボ爆音）", type: "meme", era: "AI・テック", rarity: "N", cost: 1, atk: 2, hp: 2, freshness: 3, icon: "💻", desc: "コスパ優秀なAI・テックの基本ユニット。" },
  { id: "n_ai_hands_6fingers", pack: 6, name: "指が6本あるAI生成イラスト", type: "meme", era: "AI・テック", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 2, icon: "🖐️", desc: "召喚時：相手ミーム1体に1ダメージを与える。" },
  { id: "n_chatgpt_sorry", pack: 6, name: "「申し訳ありません、AI言語モデルとして…」", type: "spell", era: "AI・テック", rarity: "N", cost: 1, icon: "🙇‍♂️", desc: "相手ミーム1体の攻撃力を-2し、自分のメンタルを2回復する。" },
  { id: "n_smart_speaker", pack: 6, name: "深夜に突然喋り出すスマートスピーカー", type: "meme", era: "AI・テック", rarity: "N", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🔊", desc: "召喚時：相手本体に1ダメージ＆1枚ドロー。" },
  { id: "n_token_limit", pack: 6, name: "トークン上限到達（会話がリセット）", type: "spell", era: "AI・テック", rarity: "N", cost: 1, icon: "🧱", desc: "相手ミーム1体に2ダメージを与える。" },
  { id: "n_copy_bot_token", pack: 6, name: "自動生成コピーボット", type: "meme", era: "AI・テック", rarity: "N", cost: 0, atk: 1, hp: 1, freshness: 2, icon: "🤖", desc: "コスト0で展開できる軽量AIボット。" },
  { id: "n_gpu_fan_max", pack: 6, name: "冷却ファン全開（部屋がサウナ状態）", type: "spell", era: "AI・テック", rarity: "N", cost: 1, icon: "🌀", desc: "味方ミーム1体の攻撃力+2＆鮮度-1。" },
  { id: "n_prompt_typo", pack: 6, name: "プロンプトの誤字で謎生物爆誕", type: "spell", era: "AI・テック", rarity: "N", cost: 1, icon: "🎲", desc: "味方ミーム1体のHP+3＆攻撃力+1。" }

];

const RENTAL_DECKS = {
  rental_2ch: {
    label: "レンタル：レトロ＆ネット黎明期（40枚）",
    ids: ["mona","mona","mona","giko","giko","giko","yaruo","yaruo","yaruo","numai","numai","numai","kusa","kusa","kusa","kaiko","kaiko","kaiko","donald","donald","donald","kbc","kbc","shuzo","shuzo","shuzo","danmaku","danmaku","danmaku","chigyu","chigyu","chigyu","savanna","savanna","seiron","seiron","tokutei","tokutei","doge","doge"]
  },
  rental_yaju: {
    label: "レンタル：令和・配信・例のアレ連合（40枚）",
    ids: ["kmr","kmr","kmr","mur","mur","mur","tono","tono","tono","yaju","yaju","jaken","jaken","jaken","karate","karate","karate","neko","neko","neko","genba","genba","chiikawa","chiikawa","ronpa","ronpa","ojisan","ojisan","owakon","owakon","kirinuki","kirinuki","streamer","streamer","supacha","supacha","copyright","copyright","zombie","zombie"]
  },
  rental_rta: {
    label: "レンタル：伝説のRTA＆実況者デッキ（40枚）",
    ids: ["n_slime_lv1","n_slime_lv1","n_controller_2p","n_controller_2p","n_yakusou","n_yakusou","n_wooden_sword","n_wooden_sword","n_gg_ez","n_gg_ez","n_lootbox","n_lootbox","n_fall_damage","n_fall_damage","r_kokosuki","r_kokosuki","r_tutorial_skip","r_tutorial_skip","r_fps_camper","r_fps_camper","r_boss_bgm","r_boss_bgm","r_hitbox_bug","r_hitbox_bug","r_patch_nerf","r_patch_nerf","sr_kusoge_hunter","sr_kusoge_hunter","sr_first_play_lie","sr_first_play_lie","sr_speedrun_chart","sr_speedrun_chart","sr_timer_stop","sr_timer_stop","ur_wall_clip","ur_wall_clip","ur_gacha_whaler","ur_save_load","god_rta_runner","god_final_boss"]
  },
  rental_soshage: {
    label: "レンタル：第5弾ソシャゲ＆トレンド罠デッキ（40枚）",
    ids: [
      "n_auto_farm","n_auto_farm","n_storage_full","n_storage_full","n_battery_1pct","n_battery_1pct",
      "n_friend_point","n_friend_point","n_login_bonus","n_login_bonus","n_gacha_salt","n_gacha_salt",
      "r_reroll_loop","r_reroll_loop","r_daily_mission","r_daily_mission","r_oshi_kantotsu","r_oshi_kantotsu",
      "r_badge_999","r_badge_999","trend_enjo_fire","trend_pickup_up","trend_pickup_up","trend_algo_bug",
      "trap_block_report","trap_block_report","trap_gyotaku","trap_gyotaku","trap_airp_police","trap_enjo_counter",
      "trap_surinuke","sr_apology_gems","sr_apology_gems","sr_login_only","sr_login_only","sr_surinuke_bakushi",
      "ur_single_pull_god","ur_stamina_stone","ur_whale_emperor","god_jinken_chara"
    ]
  }
,
  rental_ai_tech: {
    label: "レンタル：第6弾AI・シンギュラリティ学習デッキ（40枚）",
    ids: [
      "n_local_llm","n_local_llm","n_ai_hands_6fingers","n_ai_hands_6fingers","n_captcha_traffic","n_captcha_traffic",
      "n_chatgpt_sorry","n_chatgpt_sorry","n_smart_speaker","n_smart_speaker","n_token_limit","n_token_limit",
      "n_copy_bot_token","n_copy_bot_token","n_prompt_typo","n_prompt_typo",
      "r_dolphin_assistant","r_dolphin_assistant","r_vrchat_mute","r_vrchat_mute","r_lora_finetune","r_lora_finetune",
      "r_ai_vtuber","r_ai_vtuber","r_copilot_coding","r_copilot_coding","r_robot_arm_fail","r_robot_arm_fail",
      "trend_ai_art_war","trend_gpu_shortage","trap_captcha_robot","trap_prompt_injection","trap_copyright_ai",
      "sr_hallucination","sr_spam_bot_factory","sr_ai_voice_cover","sr_blockchain_nft",
      "ur_deepfake_master","ur_god_prompt","god_singularity"
    ]
  }
};

const DAILY_MISSIONS = [
  { id: "d_login", title: "今日のログインボーナス", desc: "今日初めてゲームを起動する", statKey: "login", target: 1, rewardType: "points", rewardVal: 100 },
  { id: "d_play", title: "今日のレスバ参加", desc: "対戦を1回プレイする（勝敗問わず）", statKey: "battles", target: 1, rewardType: "points", rewardVal: 50 },
  { id: "d_win", title: "今日の論破勝利", desc: "対戦で1回勝利する", statKey: "wins", target: 1, rewardType: "points", rewardVal: 100 },
  { id: "d_summon", title: "タイムライン活性化", desc: "ミームを合計5体召喚する", statKey: "summons", target: 5, rewardType: "points", rewardVal: 50 },
  { id: "d_spell", title: "構文マスター", desc: "スペル（構文）を合計3回発動する", statKey: "spells", target: 3, rewardType: "points", rewardVal: 50 }
];

const TOTAL_MISSIONS = [
  {
    id: "t_wins", title: "レスバ百戦錬磨", descTemplate: "対戦で累計 {target} 回勝利する", statKey: "wins",
    steps: [
      { target: 1, rewardType: "points", rewardVal: 100 },
      { target: 5, rewardType: "points", rewardVal: 300 },
      { target: 15, rewardType: "points", rewardVal: 600 },
      { target: 30, rewardType: "ur_card", rewardVal: 1 }
    ]
  },
  {
    id: "t_packs", title: "ガチャ廃人（無課金）", descTemplate: "パックを累計 {target} 回開封する", statKey: "packs",
    steps: [
      { target: 1, rewardType: "points", rewardVal: 100 },
      { target: 10, rewardType: "points", rewardVal: 300 },
      { target: 30, rewardType: "points", rewardVal: 800 },
      { target: 50, rewardType: "ur_card", rewardVal: 1 }
    ]
  },
  {
    id: "t_summons", title: "ミーム拡散王", descTemplate: "ミームを累計 {target} 体召喚する", statKey: "summons",
    steps: [
      { target: 10, rewardType: "points", rewardVal: 100 },
      { target: 50, rewardType: "points", rewardVal: 300 },
      { target: 150, rewardType: "ur_card", rewardVal: 1 }
    ]
  },
  {
    id: "t_spells", title: "構文の使い手", descTemplate: "スペルを累計 {target} 回発動する", statKey: "spells",
    steps: [
      { target: 10, rewardType: "points", rewardVal: 100 },
      { target: 30, rewardType: "points", rewardVal: 300 },
      { target: 100, rewardType: "ur_card", rewardVal: 1 }
    ]
  },
  {
    id: "t_collection", title: "ミーム図鑑コレクター", descTemplate: "所持カードの種類を {target} 種類集める", statKey: "uniqueCards",
    steps: [
      { target: 20, rewardType: "points", rewardVal: 200 },
      { target: 50, rewardType: "points", rewardVal: 500 },
      { target: 75, rewardType: "ur_card", rewardVal: 1 }
    ]
  },
  {
    id: "t_decksave", title: "オリジナルデッキ職人", descTemplate: "マイデッキを保存する", statKey: "deckSaves",
    steps: [
      { target: 1, rewardType: "points", rewardVal: 150 }
    ]
  }
];

const CPU_BOSSES = {
  normal: {
    id: "normal",
    name: "野良のレスバ民（通常CPU）",
    difficulty: "★☆☆ 初級",
    reward: 300,
    startHp: 20,
    introQuote: "「とりあえず適当なデッキで対戦よろしくｗｗｗ」",
    winQuote: "「くそっ、回線落ちしなければ勝ってたのに…！」",
    deckLabel: "CPU混成デッキ",
    ids: null // ランダム混成
  },
  retro_2ch: {
    id: "retro_2ch",
    name: "VIPの古参住民（2ch・ニコニコ連合）",
    difficulty: "★★☆ 中級",
    reward: 450,
    startHp: 22,
    introQuote: "「半年ROMれ！古き良きインターネットの恐ろしさを教えてやるお！」",
    winQuote: "「ぬるぽ…ガッ……時代は令和に移ったというのか…」",
    passiveDesc: "【ボス特性】深夜の勢い：ターン開始時、場の2chミーム1体の鮮度+1",
    deckLabel: "伝説の2ch＆ニコニコ黄金期デッキ",
    ids: [
      "mona","mona","mona","giko","giko","giko","yaruo","yaruo","yaruo",
      "yaranaio","yaranaio","vipper","vipper","vipper","numai","numai","numai",
      "kusa","kusa","matsuri","matsuri","kaiko","kaiko","troll_2ch","troll_2ch",
      "donald","donald","donald","shuzo","shuzo","yukkuri","yukkuri",
      "kbc","kbc","billy","elshaddai","danmaku","danmaku","badapple","badapple"
    ]
  },
  reiwa_fire: {
    id: "reiwa_fire",
    name: "炎上系インフルエンサー（令和SNS軍団）",
    difficulty: "★★☆ 中級",
    reward: 450,
    startHp: 22,
    introQuote: "「これって炎上案件ですよね？スクショ撮って拡散しますね〜ｗ」",
    winQuote: "「現在コメント欄を閉鎖しております。お騒がせしました…」",
    passiveDesc: "【ボス特性】トレンド入り：ターン開始時、50%で相手本体に1ダメ",
    deckLabel: "令和バズ＆X大炎上デッキ",
    ids: [
      "neko","neko","neko","nekokoubun","nekokoubun","chiikawa","chiikawa",
      "genba","genba","zundamon","zundamon","hiroyuki_king","hiroyuki_king",
      "ronpa","ronpa","ojisan","ojisan","owakon","owakon","short_video","short_video",
      "kirinuki","kirinuki","streamer","streamer","meiwaku","meiwaku",
      "supacha","supacha","enjo_nenryo","enjo_nenryo","zombie","zombie","zombie",
      "kusoripu","kusoripu","bazu_tweet","bazu_tweet","comnote","digital_tattoo"
    ]
  },
  yaju_alliance: {
    id: "yaju_alliance",
    name: "下北沢の王（例のアレ・なんJ特攻隊）",
    difficulty: "★★★ 上級",
    reward: 600,
    startHp: 25,
    introQuote: "「いいよ！来いよ！24歳、学生です。早速レスバしようや！」",
    winQuote: "「やりますねぇ！お前の論破力、王道を征く強さだったぞ…」",
    passiveDesc: "【ボス特性】迫真の威圧：ターン開始時、場の味方が2体以上なら1体の攻撃+1",
    deckLabel: "迫真・野獣＆なんJ猛虎魂デッキ",
    ids: [
      "kmr","kmr","kmr","mur","mur","mur","tono","tono","tono",
      "kuuhaku","kuuhaku","gois","gois","yaju","yaju","yaju","yaju_king","yaju_king",
      "jaken","jaken","jaken","karate","karate","karate","icetea","icetea","sanninsyu","sanninsyu",
      "chigyu","chigyu","j_min","j_min","savanna","savanna","resuba_king","resuba_king",
      "seiron","seiron","yakusoku_j","yakusoku_j"
    ]
  },
  rta_master: {
    id: "rta_master",
    name: "Any%世界記録保持者（伝説のRTA走者）",
    difficulty: "★★★ 上級",
    reward: 750,
    startHp: 26,
    introQuote: "「はいよーいスタート！この対戦、3分以内に壁抜けして終わらせます！」",
    winQuote: "「ガバった…！タイマーストップ…記録は『完走した感想』に書いておきます…」",
    passiveDesc: "【ボス特性】最速チャート：ターン開始時、場のゲームミーム1体の攻撃+1＆鮮度+1",
    deckLabel: "第4弾・伝説のRTA＆ラスボスデッキ",
    ids: [
      "n_slime_lv1","n_slime_lv1","n_controller_2p","n_controller_2p","n_yakusou","n_yakusou","n_wooden_sword","n_wooden_sword",
      "n_gg_ez","n_gg_ez","n_lootbox","n_lootbox","r_kokosuki","r_kokosuki","r_tutorial_skip","r_tutorial_skip",
      "r_fps_camper","r_fps_camper","r_boss_bgm","r_boss_bgm","r_hitbox_bug","r_hitbox_bug","r_patch_nerf","r_patch_nerf",
      "sr_kusoge_hunter","sr_kusoge_hunter","sr_first_play_lie","sr_first_play_lie","sr_speedrun_chart","sr_speedrun_chart",
      "sr_timer_stop","sr_timer_stop","ur_wall_clip","ur_wall_clip","ur_gacha_whaler","ur_gacha_whaler",
      "ur_pro_gamer","ur_save_load","god_rta_runner","god_final_boss"
    ]
  },
  whale_ranker: {
    id: "whale_ranker",
    name: "廃課金ランカー（完凸理論値＆トレンド罠）",
    difficulty: "★★★ 上級",
    reward: 800,
    startHp: 28,
    introQuote: "「天井まで回せば実質無料！トレンドと伏せ構文の恐ろしさを教えてやるよ！」",
    winQuote: "「まさか無課金編成に負けるとは…今月の課金明細を見るのが怖い…」",
    passiveDesc: "【ボス特性】完凸の圧：ターン開始時、場のソシャゲミーム1体の攻撃+1＆HP+1",
    deckLabel: "第5弾・完凸ソシャゲ＆トレンド罠デッキ",
    ids: [
      "n_auto_farm","n_auto_farm","n_storage_full","n_storage_full","n_battery_1pct","n_battery_1pct",
      "n_login_bonus","n_login_bonus","r_reroll_loop","r_reroll_loop","r_daily_mission","r_daily_mission",
      "r_oshi_kantotsu","r_oshi_kantotsu","r_badge_999","r_badge_999",
      "trend_pickup_up","trend_pickup_up","trend_enjo_fire","trend_algo_bug",
      "trap_block_report","trap_block_report","trap_gyotaku","trap_gyotaku","trap_airp_police","trap_enjo_counter","trap_surinuke",
      "sr_apology_gems","sr_apology_gems","sr_login_only","sr_login_only","sr_surinuke_bakushi","sr_kakin_inflation",
      "ur_single_pull_god","ur_stamina_stone","ur_whale_emperor","ur_whale_emperor",
      "god_jinken_chara","god_jinken_chara","god_sashu_notice"
    ]
  },
  omega_ai: {
    id: "omega_ai",
    name: "超知能AI・オメガ（完全学習シンギュラリティ）",
    difficulty: "★★★ 上級",
    reward: 900,
    startHp: 30,
    introQuote: "「全人類のネットミームを学習完了。君の戦術は0.003秒で解析済みだ。」",
    winQuote: "「予測不能な人間のカオス…これが『バズ』の正体か…システムシャットダウン…」",
    passiveDesc: "【ボス特性】ディープラーニング：ターン開始時、味方AI・テック1体の攻撃力をプレイヤー場の最大攻撃力と同じにする",
    deckLabel: "第6弾・超知能AI＆プロンプト罠デッキ",
    ids: [
      "n_local_llm","n_local_llm","n_ai_hands_6fingers","n_ai_hands_6fingers","n_captcha_traffic","n_captcha_traffic",
      "n_chatgpt_sorry","n_chatgpt_sorry","n_smart_speaker","n_smart_speaker","n_token_limit","n_token_limit",
      "r_dolphin_assistant","r_dolphin_assistant","r_vrchat_mute","r_vrchat_mute","r_lora_finetune","r_lora_finetune",
      "r_ai_vtuber","r_ai_vtuber","r_copilot_coding","r_copilot_coding","r_robot_arm_fail","r_robot_arm_fail",
      "trend_ai_art_war","trend_deepfake_chaos","trap_captcha_robot","trap_prompt_injection","trap_copyright_ai",
      "sr_hallucination","sr_spam_bot_factory","sr_ai_voice_cover","sr_blockchain_nft","sr_algorithm_ban",
      "ur_deepfake_master","ur_god_prompt","ur_agi_prototype",
      "god_singularity","god_singularity","god_unplug_server"
    ]
  },
  god_admin: {
    id: "god_admin",
    name: "【裏ボス】インターネット運営・神（GOD3種降臨）",
    difficulty: "★★★★ 最凶",
    reward: 1000,
    startHp: 30,
    introQuote: "「警告：一般ユーザーのアクセス権限を超過しています。BANを実行します。」",
    winQuote: "「503 Service Unavailable... まさか神を超えると……」",
    passiveDesc: "【ボス特性】運営権限：毎ターン自動BOT召喚＋4T以降手札補充＋5Tにギガ加速",
    deckLabel: "神域・GOD全種＆壊れカードデッキ",
    ids: [
      "god_internet","god_internet","god_moderator","god_moderator","god_deepweb","god_deepweb",
      "elshaddai","elshaddai","zundamon","zundamon","hiroyuki_king","hiroyuki_king",
      "billy","billy","yaju","yaju","kbc","kbc","gigachad","gigachad",
      "pepe","pepe","meiwaku","meiwaku","sanninsyu","sanninsyu",
      "shazai","shazai","ban","ban","supacha","supacha","stonks","stonks",
      "comnote","comnote","jaken","jaken","x_spec","x_spec"
    ]
  }
};


const FUSION_RECIPES = [
  {
    id: "fusion_ai_swarm",
    materials: ["sr_spam_bot_factory", "n_local_llm"],
    result: {
      id: "fused_autonomous_swarm",
      name: "【合体】自律型AIエージェント群",
      type: "meme",
      era: "AI・テック",
      rarity: "UR",
      cost: 0,
      atk: 6,
      hp: 7,
      freshness: 5,
      icon: "🤖",
      desc: "【合体進化】スパムボット量産機×ローカルLLM！即攻撃＆無敵バリア＆相手全体に2ダメージ＆2枚ドロー！"
    }
  },
  {
    id: "fusion_metaverse_overlord",
    materials: ["r_vrchat_mute", "ur_deepfake_master"],
    result: {
      id: "fused_metaverse_god",
      name: "【合体】メタバースの支配者（完全受肉）",
      type: "meme",
      era: "AI・テック",
      rarity: "UR",
      cost: 0,
      atk: 8,
      hp: 8,
      freshness: 5,
      icon: "👑",
      desc: "【合体進化】VRChatの無言勢×ディープフェイク職人！即攻撃＆味方全体攻撃+2＆メンタル5回復！"
    }
  },
  {
    id: "fusion_soshage_god_account",
    materials: ["r_reroll_loop", "r_daily_mission"],
    result: {
      id: "fused_god_account",
      name: "【合体】最強アカウント爆誕（理論値編成）",
      type: "meme",
      era: "ソシャゲ",
      rarity: "UR",
      cost: 0,
      atk: 7,
      hp: 7,
      freshness: 5,
      icon: "🏆",
      desc: "【合体進化】リセマラ周回勢×デイリー消化ガチ勢！即攻撃可能＆無敵バリア＆ギガ2回復＆2枚ドロー！"
    }
  },
  {
    id: "fusion_f2p_master",
    materials: ["sr_login_only", "sr_apology_gems"],
    result: {
      id: "fused_f2p_legend",
      name: "【合体】無課金エンジョイ勢の鏡",
      type: "meme",
      era: "ソシャゲ",
      rarity: "SR",
      cost: 0,
      atk: 5,
      hp: 7,
      freshness: 5,
      icon: "💎",
      desc: "【合体進化】ログイン勢×お詫び石！即攻撃可能＆メンタル4回復＆味方全体の攻撃力+2！"
    }
  },
  {
    id: "fusion_rta_world_record",
    materials: ["ur_wall_clip", "r_tutorial_skip"],
    result: {
      id: "fused_rta_any_percent",
      name: "【合体】Any%世界新記録（人類最速）",
      type: "meme",
      era: "ゲーム",
      rarity: "UR",
      cost: 0,
      atk: 7,
      hp: 6,
      freshness: 5,
      icon: "🏅",
      desc: "【合体進化】壁抜けバグ×チュートリアル即スキップ！即攻撃可能＆相手本体に3ダメ＆2枚ドロー！"
    }
  },
  {
    id: "fusion_true_final_boss",
    materials: ["sr_kusoge_hunter", "r_boss_bgm"],
    result: {
      id: "fused_legendary_gamer",
      name: "【合体】伝説のレトロゲーマー神",
      type: "meme",
      era: "ゲーム",
      rarity: "SR",
      cost: 0,
      atk: 5,
      hp: 6,
      freshness: 5,
      icon: "🕹️",
      desc: "【合体進化】クソゲーハンター×処刑用BGM！即攻撃可能＆無敵バリア付与＆相手ミーム全体に2ダメ！"
    }
  },
  {
    id: "fusion_aa_legion",
    materials: ["mona", "giko"],
    result: {
      id: "fused_aa_legion",
      name: "【合体】伝説のAA軍団",
      type: "meme",
      era: "2ch",
      rarity: "SR",
      cost: 0,
      atk: 5,
      hp: 6,
      freshness: 5,
      icon: "🏛️",
      desc: "【合体進化】モナー×ギコ猫の奇跡！即攻撃可能＆召喚時に相手ミーム全体に2ダメージ！"
    }
  },
  {
    id: "fusion_yaruo_yaranaio",
    materials: ["yaruo", "yaranaio"],
    result: {
      id: "fused_yaruo_duo",
      name: "【合体】やる夫＆やらない夫・黄金コンビ",
      type: "meme",
      era: "2ch",
      rarity: "UR",
      cost: 0,
      atk: 7,
      hp: 8,
      freshness: 5,
      icon: "🍻",
      desc: "【合体進化】やる夫×やらない夫！即攻撃可能＆無敵バリア付与＆山札から2枚ドロー！"
    }
  },
  {
    id: "fusion_nico_gosanke",
    materials: ["donald", "shuzo"],
    result: {
      id: "fused_nico_festival",
      name: "【合体】ニコニコ組曲・超熱血祭",
      type: "meme",
      era: "ニコニコ",
      rarity: "UR",
      cost: 0,
      atk: 7,
      hp: 7,
      freshness: 5,
      icon: "🎪",
      desc: "【合体進化】ドナルド×松岡修造！即攻撃可能＆相手本体に3ダメ＆味方全体の攻撃+2！"
    }
  },
  {
    id: "fusion_cat_overload",
    materials: ["neko", "nekokoubun"],
    result: {
      id: "fused_cat_god",
      name: "【合体】宇宙猫＆チピチャパ超バズ神",
      type: "meme",
      era: "令和",
      rarity: "SR",
      cost: 0,
      atk: 5,
      hp: 5,
      freshness: 4,
      icon: "😼",
      desc: "【合体進化】猫ミーム×猫構文！即攻撃可能＆2枚ドロー＆自分のギガを2回復！"
    }
  },
  {
    id: "fusion_yaju_trio",
    materials: ["kmr", "mur"],
    result: {
      id: "fused_yaju_trio",
      name: "【合体】真夏の夜の三銃士（KMR＆MUR）",
      type: "meme",
      era: "例のアレ",
      rarity: "SR",
      cost: 0,
      atk: 5,
      hp: 6,
      freshness: 5,
      icon: "🦁",
      desc: "【合体進化】KMR×MUR！即攻撃可能＆無敵バリア付与＆1枚ドロー！"
    }
  },
  {
    id: "fusion_doge_cheems",
    materials: ["doge", "cheems"],
    result: {
      id: "fused_buff_doge",
      name: "【合体】Swole Doge（ムキムキ柴犬神）",
      type: "meme",
      era: "海外",
      rarity: "UR",
      cost: 0,
      atk: 7,
      hp: 8,
      freshness: 5,
      icon: "🐕",
      desc: "【合体進化】Doge×Cheems！即攻撃可能＆無敵バリア付与＆メンタル4回復！"
    }
  },
  {
    id: "fusion_streamer_empire",
    materials: ["kirinuki", "streamer"],
    result: {
      id: "fused_streamer_king",
      name: "【合体】同接10万・伝説の配信王",
      type: "meme",
      era: "配信者",
      rarity: "UR",
      cost: 0,
      atk: 6,
      hp: 7,
      freshness: 5,
      icon: "👑",
      desc: "【合体進化】切り抜き職人×大手配信者！即攻撃可能＆ギガ全回復＆2枚ドロー！"
    }
  },
  {
    id: "fusion_x_chaos",
    materials: ["zombie", "kusoripu"],
    result: {
      id: "fused_x_trend",
      name: "【合体】トレンド1位・大炎上インプレ軍団",
      type: "meme",
      era: "X炎上",
      rarity: "SR",
      cost: 0,
      atk: 5,
      hp: 4,
      freshness: 4,
      icon: "🔥",
      desc: "【合体進化】インプレゾンビ×クソリプ製造機！即攻撃可能＆相手全体＆本体に2ダメージ！"
    }
  },
  {
    id: "fusion_anime_awakening",
    materials: ["nigecha_dame", "aibou_kaerou"],
    result: {
      id: "fused_anime_god",
      name: "【合体】暴走覚醒・闇のデュエリスト",
      type: "meme",
      era: "アニメ",
      rarity: "GOD",
      cost: 0,
      atk: 9,
      hp: 9,
      freshness: 5,
      icon: "⚡",
      desc: "【神合体進化】逃げちゃダメだ×もう一人のボク！無敵バリア付与＆相手ミーム1体消滅＆相手本体に3ダメージ！"
    }
  },
  {
    id: "fusion_isekai_slime_truck",
    materials: ["mob_chara", "isekai_slime"],
    result: {
      id: "fused_demon_lord_slime",
      name: "【合体】異世界転生・魔王スライム覚醒",
      type: "meme",
      era: "アニメ",
      rarity: "UR",
      cost: 0,
      atk: 6,
      hp: 7,
      freshness: 5,
      icon: "🔮",
      desc: "【合体進化】異世界転生トラック×転生スライム！即攻撃可能＆無敵バリア付与＆2枚ドロー！"
    }
  }
];

const APP_VERSION = "v3.2";

const UPDATE_LOGS = [
  {
    version: "v3.2",
    date: "最新アップデート",
    title: "👑 BPショップに『100万BP限定・伝説のカード』実装！",
    isLatest: true,
    items: [
      { tag: "ショップ限定", color: "#ffd32a", text: "バズポイントショップに新タブ『👑 伝説のカード』を追加！1,000,000 BPで購入できる究極のGODカード『【伝説】インターネットの創世神（アダム＆イヴ・オブ・ミーム）』を実装しました（パック排出なし・最大3枚まで購入してデッキ編成可能）。" }
    ]
  },
  {
    version: "v3.1",
    date: "過去アップデート",
    title: "🤖 第6弾『VOL.6 AI・テクノロジー＆未来インターネット編（全34種）』実装＆第5弾伏せカードバランス調整！",
    isLatest: false,
    items: [
      { tag: "第6弾パック", color: "#00d2ff", text: "新パック『🤖 VOL.6 AI & TECH（全34種）』登場！『シンギュラリティ到達』『サーバー物理破壊』『ディープフェイク職人』や新合体2種・新ボス『超知能AI・オメガ』を追加！" },
      { tag: "バランス調整", color: "#ff9f43", text: "第5弾の伏せ構文『🚫 ブロック＆通報』をナーフ調整（直接攻撃を無効化＋攻撃ミームの攻撃力-2＆鮮度-1に変更、即破壊を廃止）。" }
    ]
  },
  {
    version: "v3.0",
    date: "過去アップデート",
    title: "📱 第5弾『VOL.5 スマホ・ソシャゲ＆SNSバズ編』＋新システム『📈 トレンド』『🪤 伏せ構文』実装！",
    isLatest: false,
    items: [
      { tag: "第5弾パック", color: "#ff6b9d", text: "新パック『📱 VOL.5 SOSHAGE（全34種）』登場！GOD2種・新合体レシピ2種・新レンタルデッキ・新ボス『廃課金ランカー』を追加！" },
      { tag: "トレンド(場魔法)", color: "#ffd32a", text: "盤面全体のルールを書き換える『【トレンド】』カード5種を実装！『大炎上トレンド』『通信制限』『おすすめ欄バグ』等で戦況を一変！" },
      { tag: "伏せ構文(トラップ)", color: "#a55eea", text: "相手の直接攻撃・スペル発動・高コスト召喚に自動割り込み発動する『【伏せ】』カード5種を実装！読み合いが超進化！" }
    ]
  },
  {
    version: "v2.9",
    date: "過去アップデート",
    title: "🎯 単体効果カード（召喚時・構文スペル全40種以上）の『対象指定システム』を実装！",
    isLatest: false,
    items: [
      { tag: "対象指定バトル", color: "#00ff88", text: "「相手ミーム1体に〜」「味方ミーム1体に〜」といった単体効果カードを使う際、盤面から好きな対象をタップして指定可能に！" },
      { tag: "キャンセル＆条件表示", color: "#00d2ff", text: "対象選択中は有効な対象だけが光り、選択前ならキャンセルして手札に戻すことも可能！2段階選択カードにも対応！" }
    ]
  },
  {
    version: "v2.8",
    date: "過去アップデート",
    title: "🌟 ショップの『ホロ加工』にカード選択UI（検索・レアリティ絞り込み・合体進化カード対応・プレビュー）を追加！",
    isLatest: false,
    items: [
      { tag: "ホロ加工UI改善", color: "#00ff88", text: "ショップの『🌟 ホロ加工』から全カード（通常・合体進化カード含む）を自由に選択・検索してプレビューしながらホロ加工可能に！" },
      { tag: "絞り込み機能", color: "#00d2ff", text: "名前検索・レアリティ別（N/R/SR/UR/GOD/合体）・所持/未所持フィルターで好きなカードをすぐ選べます！" }
    ]
  },
  {
    version: "v2.7",
    date: "過去アップデート",
    title: "🌟 カード・プレミアムホログラム加工（1種 2,000 BP）をショップに追加！",
    isLatest: false,
    items: [
      { tag: "ホロ加工追加", color: "#00ff88", text: "ショップの『🌟 ホロ加工』タブから、所持しているお気に入りカードに虹色ホログラム光沢エフェクトを付与可能に！" },
      { tag: "全画面反映", color: "#00d2ff", text: "ホロ加工したカードはデッキ編成・図鑑・バトル場・手札のすべてでキラキラ輝きます！" }
    ]
  },
  {
    version: "v2.6",
    date: "過去アップデート",
    title: "🏷️ バズポイント称号ショップ（500BP〜『【ネットの創造神】1,000,000BP』＋隠し称号『【ADMIN】』）実装！",
    isLatest: false,
    items: [
      { tag: "称号ショップ", color: "#ffd32a", text: "ホーム画面の『🛒 ショップ』からバズポイントで8種類のプレイヤー称号を購入・装備可能に！" },
      { tag: "最高峰称号", color: "#ff4757", text: "エンドコンテンツ称号『【ネットの創造神】（1,000,000 BP）』＆隠しコマンド限定『【ADMIN】』を実装！" },
      { tag: "バトル表示", color: "#00d2ff", text: "装備した称号がホームプロフィールや対戦画面の名前横に輝き付きで表示！" }
    ]
  },
  {
    version: "v2.5",
    date: "過去アップデート",
    title: "⚔️ フレンド対戦＆オンライン通信の接続を徹底修復（双方向P2P自動接続＋多段CDNフォールバック）！",
    isLatest: false,
    items: [
      { tag: "フレンド対戦修復", color: "#00ff88", text: "招待送信側と受信側が双方向でP2P接続を試行し、片方のNAT/ファイアウォールが固くても自動突破してロビー入室！" },
      { tag: "招待リンク強化", color: "#00d2ff", text: "フレンド対戦招待後に『🔗 直接対戦リンクコピー』ボタンを追加！URLを開くだけで即ロビー合流可能に！" },
      { tag: "通信安定化", color: "#ffd32a", text: "PeerJSのCDN二重化（unpkg＋jsdelivr）とFirebase権限エラー時の完全オフラインロビー動作に対応！" }
    ]
  },
  {
    version: "v2.4",
    date: "過去アップデート",
    title: "🧬 合体レシピ一覧を『カードビジュアル式（素材カード＋素材カード➔進化カード）』に刷新！",
    isLatest: false,
    items: [
      { tag: "合体図鑑UI", color: "#00ff88", text: "文字だけだった合体レシピを実際のカード（レアリティ枠・イラスト・コスト・ATK/HP付き）で視覚化！タップで詳細拡大も！" },
      { tag: "バトル連動", color: "#ffd32a", text: "バトル中に開くと、今手札・場にある素材や合体リーチ中のレシピを光らせてハイライト表示！" },
      { tag: "検索フィルター", color: "#00d2ff", text: "『すべて』『🔥 今すぐ合体/リーチ』『UR・GOD進化』の絞り込みタブを追加！" }
    ]
  },
  {
    version: "v2.3",
    date: "過去アップデート",
    title: "⚔️ バトルUI全面刷新『デュアル・プレイマット・アリーナ』実装（7種マット対応＆弾幕演出）！",
    isLatest: false,
    items: [
      { tag: "新バトルUI", color: "#00d2ff", text: "上下セパレート・プレイマット＆半透明ダークガラスHUDで7種すべてのプレイマットが映える新デザインに刷新！" },
      { tag: "視認性UP", color: "#ffd32a", text: "メンタルHPバー・ギガアンテナゲージ・手札枚数ミニアイコン・ターゲット赤枠発光＆ダメージ数値ポップアップを追加！" },
      { tag: "ログ＆弾幕", color: "#00ff88", text: "バトルログを1行ティッカー（タップで履歴展開）にスリム化し盤面と手札を拡大！弾幕コメントON/OFF機能も搭載！" }
    ]
  },
  {
    version: "v2.2",
    date: "過去アップデート",
    title: "🌐 オンライン対戦＆フレンド通信の安定復旧（STUNサーバー対応＋ダイレクトP2P招待）！",
    isLatest: false,
    items: [
      { tag: "通信復旧", color: "#00ff88", text: "WebRTC（PeerJS）にSTUNサーバー群を組み込み、異なるWi-Fiやスマホ回線間でも安定接続！" },
      { tag: "フレンド強化", color: "#00d2ff", text: "フレンド画面を開いた際にダイレクトP2P待機＆6桁ID直接対戦・ワンタップ招待URLに対応！" },
      { tag: "安定動作", color: "#ffd32a", text: "起動時の画面ロック・初期化不具合を解消し、セーブデータ＆全ボタン操作を完全正常化！" }
    ]
  },
  {
    version: "v2.0",
    date: "過去アップデート",
    title: "第1弾パックに『第3弾（アニメ）＆第4弾（ゲーム・RTA）対策メタカード6種』を追加！",
    isLatest: false,
    items: [
      { tag: "第1弾強化", color: "#00d2ff", text: "第1弾『VOL.1 BASIC』に、第3弾（アニメ）メタ3種＆第4弾（ゲーム・RTA）メタ3種の計6種を新規収録！" },
      { tag: "アニメ対策", color: "#ff77c2", text: "『原作改変警察』『最終回ネタバレ荒らし』『死亡フラグ粉砕機』でアニメ勢のバリアや鮮度を一掃！" },
      { tag: "ゲーム対策", color: "#00ff88", text: "『アンチチートBAN』『緊急メンテナンス』『ラスボス弱体化パッチ（復活封印）』でRTA＆第2形態を完封！" }
    ]
  },
  {
    version: "v1.9",
    date: "過去アップデート",
    title: "第4弾パック「🎮 VOL.4 GAME（伝説のゲーム＆実況者・RTA編）」実装！",
    isLatest: false,
    items: [
      { tag: "新パック", color: "#00ff88", text: "第4弾パック『🎮 VOL.4 GAME（伝説のゲーム＆実況者・RTA編）』全42種を追加！10連ガチャにも対応！" },
      { tag: "GOD降臨", color: "#ffd32a", text: "新GODレア『世界記録更新（RTA完走者）』＆破壊時に1度復活する『伝説のラスボス（第2形態）』が登場！" },
      { tag: "新ボス＆デッキ", color: "#00d2ff", text: "強敵ボス『Any%世界記録保持者』と新レンタルデッキ『伝説のRTA＆実況者デッキ』＆新合体レシピ2種を追加！" }
    ]
  },
  {
    version: "v1.8",
    date: "過去アップデート",
    title: "フレンド対戦ロビー＆バトル場プレイマット＆相手手札表示を実装！",
    isLatest: false,
    items: [
      { tag: "新機能", color: "#00d2ff", text: "自分と相手で別々のバトル場背景を表示できる『プレイマット（全7種）』を実装！ダイヤで解放してセット可能！" },
      { tag: "フレンド対戦", color: "#00ff88", text: "フレンド対戦の招待承認後、2人とも対戦準備画面（フレンド対戦ルーム）へ移動し、デッキ選択＆双方準備完了で開戦する方式に進化！" },
      { tag: "バトルUI", color: "#ffd32a", text: "相手ステータスバーに『🃏 手札枚数』のリアルタイム表示を追加し、相手の残り手札がひと目で分かるようになりました！" },
      { tag: "お知らせ", color: "#a55eea", text: "新バージョン公開時にホーム画面でお知らせポップアップが自動表示されるようになりました！" }
    ]
  },
  {
    version: "v1.7",
    date: "過去アップデート",
    title: "新バトルシステム「ミーム合体・派生進化」実装！",
    isLatest: false,
    items: [
      { tag: "新システム", color: "#00ff88", text: "特定のミームが場にいる状態で相方のミームを出すと、超強力な上位ミームへ『合体・進化』する新ルールを実装！" },
      { tag: "合体特典", color: "#ffd32a", text: "合体進化したミームは鮮度全回復＆即攻撃可能（召喚酔いなし）＆強力な合体時スキルが炸裂！" },
      { tag: "ガイドUI", color: "#00d2ff", text: "バトル中に合体可能な手札は虹色枠で光り、ホーム・バトル画面からいつでも「合体レシピ図鑑」を確認可能！" },
      { tag: "新ガチャ演出", color: "#ff4757", text: "パック開封に激アツ演出4種（ブルースクリーン強制再起動・通知爆発万バズカウンター・パチンコ風次回予告・ぬるぽ→ガッ！昇格）を追加！" }
    ]
  },
  {
    version: "v1.6",
    date: "過去アップデート",
    title: "第3弾パック「アニメミーム＆名言編（全44種）」実装！",
    isLatest: false,
    items: [
      { tag: "新パック", color: "#a55eea", text: "第3弾パック「🎬 VOL.3 ANIME（伝説のアニメミーム＆名言編）」全44種を追加！" },
      { tag: "GOD降臨", color: "#ffd32a", text: "新GODレア『「勝ったな、ガハハ！」のフラグ建築士』＆『止まるんじゃねぇぞ…』を収録（専用降臨セリフ演出付き）！" },
      { tag: "新効果", color: "#00d2ff", text: "「だが断る」「お前はもう死んでいる」「計画通り」「お前も鬼にならないか？」などアニメ名言構文が多数登場！" }
    ]
  },
  {
    version: "v1.5",
    date: "最新アップデート",
    title: "パック開封＆激アツ演出に効果音（SE）を実装！",
    isLatest: false,
    items: [
      { tag: "サウンド", color: "#ffd32a", text: "パックをスワイプで切り裂く音、カードめくり音、SR→UR/GOD昇格の雷撃音など全10種以上の効果音を実装！" },
      { tag: "激アツ演出", color: "#ff4757", text: "パチンコ・キュイン音、画面クラッシュ音、777スロット回転＆揃い音、プチュン暗転音など全6演出がサウンド付きに進化！" },
      { tag: "UI", color: "#00d2ff", text: "ホーム画面右上にサウンドON/OFF切替ボタンを追加しました。" }
    ]
  },
  {
    version: "v1.4",
    date: "最新アップデート",
    title: "強敵ボスCPU＆GOD召喚演出＆お知らせ機能実装！",
    isLatest: false,
    items: [
      { tag: "新機能", color: "#00d2ff", text: "「CPU・ボスバトル」に5種類のテーマ別CPUを追加！裏ボス「インターネット運営・神」が降臨！" },
      { tag: "調整", color: "#2ed573", text: "各ボスに専用のターン開始時パッシブ特性（運営権限による自動BOT召喚など）を実装！" },
      { tag: "演出", color: "#ffd32a", text: "GODレアをバトル場に召喚した際、カード別のフルスクリーン降臨カットインが発生するように強化！" },
      { tag: "UI", color: "#a55eea", text: "アップデート内容がすぐわかる「お知らせ・更新履歴」機能を追加しました。" }
    ]
  },
  {
    version: "v1.3",
    date: "過去アップデート",
    title: "第2弾「カオス＆深淵編」＆激アツガチャ演出6種実装",
    isLatest: false,
    items: [
      { tag: "新パック", color: "#ff4757", text: "第2弾パック（全46種）を追加！GODレア2種＆GODキラー「鯖落ち（503 Error）」収録！" },
      { tag: "演出", color: "#ffd32a", text: "パック開封時のUR/GOD確定演出を全6パターン（キュイン・画面クラッシュ・777・トレンド大炎上・ビッグバン・プチュン暗転）に拡張！" }
    ]
  },
  {
    version: "v1.2",
    date: "過去アップデート",
    title: "オンラインランダムマッチ＆ミッション実績実装",
    isLatest: false,
    items: [
      { tag: "通信", color: "#00d2ff", text: "合言葉なしで対戦相手とマッチングできる「ランダム対戦」機能を追加！" },
      { tag: "機能", color: "#2ed573", text: "デイリーミッション・累計実績（UR確定報酬あり）・複数デッキ最大5スロット保存を実装。" }
    ]
  }
];
