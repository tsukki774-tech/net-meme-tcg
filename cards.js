const ALL_CARDS = [
  // ① 2ch・Flash黎明期
  { id: "mona", name: "モナー", type: "meme", era: "2ch", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 4, icon: "🐱‍👤", desc: "オマエモナー。鮮度が落ちにくい（4ターン持続）。" },
  { id: "giko", name: "ギコ猫", type: "meme", era: "2ch", rarity: "N", cost: 2, atk: 3, hp: 2, freshness: 4, icon: "😼", desc: "「逝ってよし」攻撃的なAAキャラ。" },
  { id: "yaruo", name: "やる夫", type: "meme", era: "2ch", rarity: "R", cost: 2, atk: 2, hp: 4, freshness: 4, icon: "🍙", desc: "高い体力を誇る頼れる壁役。" },
  { id: "numai", name: "ぬるぽ", type: "spell", era: "2ch", rarity: "N", cost: 1, icon: "🔨", desc: "【ガッ】相手ミーム1体に2ダメージを与える。" },
  { id: "kusa", name: "ｗｗｗ（大草原）", type: "spell", era: "2ch", rarity: "R", cost: 2, icon: "🌱", desc: "自分の場のミーム全ての攻撃力を+1する。" },
  { id: "kaiko", name: "懐古厨の説教", type: "spell", era: "2ch", rarity: "SR", cost: 2, icon: "📺", desc: "【メタ】相手本体に1ダメ。相手の場に「令和・配信者・X炎上」がいれば4ダメに強化！" },

  // ② ニコニコ・MAD全盛期
  { id: "donald", name: "ドナルド", type: "meme", era: "ニコニコ", rarity: "R", cost: 2, atk: 2, hp: 2, freshness: 3, icon: "🤡", desc: "召喚時：相手のメンタルに2ダメージを与える。" },
  { id: "kbc", name: "キーボードクラッシャー", type: "meme", era: "ニコニコ", rarity: "UR", cost: 4, atk: 5, hp: 4, freshness: 3, icon: "⌨️", desc: "圧倒的破壊力を持つニコニコの伝説。" },
  { id: "shuzo", name: "松岡修造", type: "meme", era: "ニコニコ", rarity: "SR", cost: 3, atk: 3, hp: 3, freshness: 3, icon: "🔥", desc: "熱血応援！召喚時、他の味方全体の攻撃力+1。" },
  { id: "danmaku", name: "弾幕コメント", type: "spell", era: "ニコニコ", rarity: "R", cost: 2, icon: "💬", desc: "自分の場のミーム全ての攻撃力を+1し、1枚ドロー。" },

  // ③ 令和・SNSバズ世代
  { id: "neko", name: "猫ミーム", type: "meme", era: "令和", rarity: "N", cost: 1, atk: 2, hp: 1, freshness: 3, icon: "🐱", desc: "召喚時：手札を1枚引く。軽くて使いやすい。" },
  { id: "genba", name: "現場猫（ヨシ！）", type: "meme", era: "令和", rarity: "R", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "👷", desc: "召喚時：50%で攻撃力+2、50%で労災（自爆）。" },
  { id: "chiikawa", name: "ちいかわ構文", type: "meme", era: "令和", rarity: "N", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🐹", desc: "「〇〇ってコト！？」場持ちが良い癒やし枠。" },
  { id: "ronpa", name: "それってあなたの感想ですよね？", type: "spell", era: "令和", rarity: "R", cost: 2, icon: "🤔", desc: "【論破】相手の場のミーム1体に3ダメージ。" },
  { id: "ojisan", name: "おじさん構文", type: "spell", era: "令和", rarity: "R", cost: 2, icon: "👴", desc: "【デバフ】相手のミーム全ての攻撃力を-2する。" },
  { id: "owakon", name: "時代遅れ（オワコン認定）", type: "spell", era: "令和", rarity: "SR", cost: 3, icon: "📉", desc: "【メタ】相手の「2ch・ニコニコ・例のアレ・VIP/なんJ」ミーム1体を即消滅させる。" },

  // ④ 野獣先輩（例のアレ）世代
  { id: "kmr", name: "KMR", type: "meme", era: "例のアレ", rarity: "N", cost: 1, atk: 1, hp: 2, freshness: 3, icon: "👀", desc: "「まずいですよ！」軽くて出しやすい壁役。" },
  { id: "mur", name: "MUR", type: "meme", era: "例のアレ", rarity: "N", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "😼", desc: "「そうだよ（便乗）」序盤の速攻アタッカー。" },
  { id: "tono", name: "遠野", type: "meme", era: "例のアレ", rarity: "R", cost: 2, atk: 2, hp: 3, freshness: 4, icon: "🍵", desc: "召喚時：アイスティーを差し入れ（1枚ドロー）。" },
  { id: "yaju", name: "野獣先輩", type: "meme", era: "例のアレ", rarity: "UR", cost: 4, atk: 4, hp: 4, freshness: 4, icon: "🦁", desc: "召喚時：圧倒的プレッシャーで自身の攻撃力+1。" },
  { id: "jaken", name: "邪剣「夜」", type: "spell", era: "例のアレ", rarity: "SR", cost: 3, icon: "🗡️", desc: "【闇の力】相手ミーム1体に4ダメージ＆相手本体に2ダメージ。" },
  { id: "karate", name: "迫真空手部", type: "spell", era: "例のアレ", rarity: "R", cost: 2, icon: "🥋", desc: "厳しい特訓により、味方全員の攻撃力を+2する。" },

  // ⑤ VIP・なんJ世代
  { id: "chigyu", name: "チー牛", type: "meme", era: "VIP/なんJ", rarity: "N", cost: 1, atk: 1, hp: 3, freshness: 3, icon: "👓", desc: "「すいません、三色チーズ牛丼の特盛りに温玉付きで」" },
  { id: "savanna", name: "サバンナ男", type: "meme", era: "VIP/なんJ", rarity: "R", cost: 3, atk: 3, hp: 3, freshness: 3, icon: "🦁", desc: "召喚時：相手ミーム1体の攻撃力を1にする。" },
  { id: "seiron", name: "正論パンチ", type: "spell", era: "VIP/なんJ", rarity: "SR", cost: 2, icon: "🥊", desc: "相手ミーム1体に4ダメージを与える。" },
  { id: "tokutei", name: "特定班の特定作業", type: "spell", era: "VIP/なんJ", rarity: "SR", cost: 2, icon: "🔍", desc: "【メタ】相手の「配信者・X炎上」ミーム1体の攻撃力を0、鮮度を1にする。" },

  // ⑥ 海外ミーム世代
  { id: "doge", name: "Doge（柴犬）", type: "meme", era: "海外", rarity: "R", cost: 2, atk: 2, hp: 3, freshness: 4, icon: "🐕", desc: "Such wow. バランスの良い海外の顔。" },
  { id: "nyan", name: "Nyan Cat", type: "meme", era: "海外", rarity: "SR", cost: 3, atk: 3, hp: 2, freshness: 3, icon: "🌈", desc: "召喚時：1枚ドローし、自身の攻撃力+1。" },
  { id: "gigachad", name: "GigaChad", type: "meme", era: "海外", rarity: "UR", cost: 5, atk: 6, hp: 6, freshness: 4, icon: "🗿", desc: "圧倒的フィジカルを誇る完璧超人。" },
  { id: "rickroll", name: "Rickroll（釣り動画）", type: "spell", era: "海外", rarity: "SR", cost: 2, icon: "🕺", desc: "相手の手札を1枚ランダムに捨てさせる。" },
  { id: "honyaku", name: "翻訳ニキの解説", type: "spell", era: "海外", rarity: "R", cost: 2, icon: "🌐", desc: "1枚ドロー。自分の場に「海外」ミームがいればさらに1枚ドロー。" },

  // ⑦ VTuber・配信者世代
  { id: "kirinuki", name: "切り抜き職人", type: "meme", era: "配信者", rarity: "N", cost: 1, atk: 1, hp: 1, freshness: 3, icon: "✂️", desc: "召喚時：カードを1枚ドローする。" },
  { id: "streamer", name: "大手配信者", type: "meme", era: "配信者", rarity: "SR", cost: 3, atk: 3, hp: 4, freshness: 3, icon: "🎙️", desc: "召喚時：自分のギガを1回復する。" },
  { id: "supacha", name: "赤スパチャ", type: "spell", era: "配信者", rarity: "R", cost: 1, icon: "💸", desc: "自分のギガを+2回復する（最大値は超えない）。" },
  { id: "shazai", name: "炎上謝罪会見", type: "spell", era: "配信者", rarity: "UR", cost: 4, icon: "🙇", desc: "お互いの場のミームを全て消滅させる。" },
  { id: "copyright", name: "著作権侵害の申し立て", type: "spell", era: "配信者", rarity: "SR", cost: 2, icon: "⚠️", desc: "【メタ】相手の「ニコニコ・海外」ミーム1体を即消滅させ、1枚ドロー。" },

  // ⑧ X（Twitter）炎上世代
  { id: "zombie", name: "インプレゾンビ", type: "meme", era: "X炎上", rarity: "N", cost: 0, atk: 1, hp: 1, freshness: 1, icon: "🧟", desc: "コスト0で出せるが1ターンで消える。数を並べる用。" },
  { id: "kagiaka", name: "鍵垢の監視者", type: "meme", era: "X炎上", rarity: "N", cost: 1, atk: 0, hp: 4, freshness: 4, icon: "🔒", desc: "攻撃力は0だが非常に硬い壁役。" },
  { id: "comnote", name: "コミュニティノート", type: "spell", era: "X炎上", rarity: "SR", cost: 2, icon: "📝", desc: "相手ミーム1体に3ダメージ＆自分のメンタルを2回復。" },
  { id: "gakkyukai", name: "Xの学級会", type: "spell", era: "X炎上", rarity: "R", cost: 2, icon: "🔥", desc: "お互いの場のミーム全てに2ダメージを与える。" },
  { id: "ban", name: "アカウント凍結", type: "spell", era: "X炎上", rarity: "UR", cost: 4, icon: "❄️", desc: "相手ミーム1体を消滅させ、相手本体に2ダメージ。" }
];

const RENTAL_DECKS = {
  rental_2ch: {
    label: "レンタル：① 2ch・Flash黎明期",
    ids: ["mona","mona","mona","giko","giko","giko","yaruo","yaruo","yaruo","numai","numai","kusa","kusa","kaiko","kaiko"]
  },
  rental_yaju: {
    label: "レンタル：④ 野獣先輩（例のアレ）",
    ids: ["kmr","kmr","kmr","mur","mur","mur","tono","tono","tono","yaju","yaju","jaken","jaken","karate","karate"]
  }
};
