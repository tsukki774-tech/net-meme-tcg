// cards.js - カード一覧・レンタルデッキ・ミッションデータ定義

const ALL_CARDS = [
  // ================= 管理者（開発者）専用カード（pack: 0 / 非売品・隠しコマンド限定） =================
  { id: "admin_ban_hammer", pack: 0, isAdminOnly: true, name: "【ADMIN】開発者の特権（BANハンマー）", type: "spell", era: "運営", rarity: "ADMIN", cost: 0, icon: "🔨", desc: "【管理者専用】相手場のミームを無敵バリアごと全消滅＆相手手札2枚破壊＆自分メンタル全回復・ギガ最大！" },
  { id: "admin_god_dev", pack: 0, isAdminOnly: true, name: "【ADMIN】作者の気まぐれ（仕様変更）", type: "meme", era: "運営", rarity: "ADMIN", cost: 1, atk: 99, hp: 99, freshness: 99, icon: "👑", desc: "【管理者専用】召喚時：相手の場のミームを全て奪い取り、自身に無敵バリア（🛡️）を付与して降臨！" },
  { id: "admin_debug_mode", pack: 0, isAdminOnly: true, name: "【ADMIN】デバッグモード起動", type: "spell", era: "運営", rarity: "ADMIN", cost: 0, icon: "💻", desc: "【管理者専用】山札から3枚ドローし、このターン中自分の手札すべてのコストを0にする！" },

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
  { id: "op_skip", pack: 3, name: "OPスキップ勢", type: "spell", era: "アニメ", rarity: "N", cost: 1, icon: "⏩", desc: "相手ミーム1体に2ダメージを与える。" }
];

const RENTAL_DECKS = {
  rental_2ch: {
    label: "レンタル：レトロ＆ネット黎明期（40枚）",
    ids: ["mona","mona","mona","giko","giko","giko","yaruo","yaruo","yaruo","numai","numai","numai","kusa","kusa","kusa","kaiko","kaiko","kaiko","donald","donald","donald","kbc","kbc","shuzo","shuzo","shuzo","danmaku","danmaku","danmaku","chigyu","chigyu","chigyu","savanna","savanna","seiron","seiron","tokutei","tokutei","doge","doge"]
  },
  rental_yaju: {
    label: "レンタル：令和・配信・例のアレ連合（40枚）",
    ids: ["kmr","kmr","kmr","mur","mur","mur","tono","tono","tono","yaju","yaju","jaken","jaken","jaken","karate","karate","karate","neko","neko","neko","genba","genba","chiikawa","chiikawa","ronpa","ronpa","ojisan","ojisan","owakon","owakon","kirinuki","kirinuki","streamer","streamer","supacha","supacha","copyright","copyright","zombie","zombie"]
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

const APP_VERSION = "v1.6";

const UPDATE_LOGS = [
  {
    version: "v1.6",
    date: "最新アップデート",
    title: "第3弾パック「アニメミーム＆名言編（全44種）」実装！",
    isLatest: true,
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
