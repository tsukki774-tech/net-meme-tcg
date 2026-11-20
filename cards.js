// cards.js - カード一覧・レンタルデッキ・ミッションデータ定義

const ALL_CARDS = [
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
  { id: "god_killer_503", pack: 2, name: "鯖落ち（503 Error）", type: "spell", era: "2ch", rarity: "UR", cost: 2, icon: "🔌", desc: "【GODキラー】相手の「GOD」レアを無敵バリアごと即消滅＆本体3ダメ＆2枚ドロー！※GOD以外無効" }
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
