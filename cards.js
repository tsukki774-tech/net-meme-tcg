const DECK_DATA = {
  "2ch": {
    label: "2ch・Flash黎明期",
    cards: [
      { id: "mona", name: "モナー", type: "meme", era: "2ch", cost: 1, atk: 1, hp: 2, freshness: 4, icon: "🐱‍👤", desc: "オマエモナー。鮮度が落ちにくい（4ターン持続）。" },
      { id: "giko", name: "ギコ猫", type: "meme", era: "2ch", cost: 2, atk: 3, hp: 2, freshness: 4, icon: "😼", desc: "「逝ってよし」攻撃的なAAキャラ。" },
      { id: "yaruo", name: "やる夫", type: "meme", era: "2ch", cost: 2, atk: 2, hp: 4, freshness: 4, icon: "🍙", desc: "高い体力を誇る頼れる壁役。" },
      { id: "numai", name: "ぬるぽ", type: "spell", era: "2ch", cost: 1, icon: "🔨", desc: "【ガッ】相手ミーム1体に2ダメージを与える。" },
      { id: "kusa", name: "ｗｗｗ（大草原）", type: "spell", era: "2ch", cost: 2, icon: "🌱", desc: "自分の場のミーム全ての攻撃力を+1する。" },
      { id: "kaiko", name: "懐古厨の説教", type: "spell", era: "2ch", cost: 2, icon: "📺", desc: "【メタ】相手の場に「令和」ミームがいる場合、相手本体に3ダメージ。" }
    ]
  },
  "niconico": {
    label: "ニコニコ・MAD全盛期",
    cards: [
      { id: "donald", name: "ドナルド", type: "meme", era: "ニコニコ", cost: 2, atk: 2, hp: 2, freshness: 3, icon: "🤡", desc: "召喚時：相手のメンタルに2ダメージを与える。" },
      { id: "kbc", name: "キーボードクラッシャー", type: "meme", era: "ニコニコ", cost: 4, atk: 5, hp: 4, freshness: 3, icon: "⌨️", desc: "圧倒的破壊力を持つニコニコの伝説。" },
      { id: "shuzo", name: "松岡修造", type: "meme", era: "ニコニコ", cost: 3, atk: 3, hp: 3, freshness: 3, icon: "🔥", desc: "熱血応援！召喚時、他の味方全体の攻撃力+1。" },
      { id: "danmaku", name: "弾幕コメント", type: "spell", era: "ニコニコ", cost: 2, icon: "💬", desc: "自分の場のミーム全ての攻撃力を+1し、1枚ドロー。" },
      { id: "kaiko2", name: "懐古厨の説教", type: "spell", era: "ニコニコ", cost: 2, icon: "📺", desc: "【メタ】相手の場に「令和」ミームがいる場合、相手本体に3ダメージ。" }
    ]
  },
  "reiwa": {
    label: "令和・SNSバズ世代",
    cards: [
      { id: "neko", name: "猫ミーム", type: "meme", era: "令和", cost: 1, atk: 2, hp: 1, freshness: 3, icon: "🐱", desc: "召喚時：手札を1枚引く。軽くて使いやすい。" },
      { id: "genba", name: "現場猫（ヨシ！）", type: "meme", era: "令和", cost: 2, atk: 3, hp: 2, freshness: 3, icon: "👷", desc: "召喚時：50%で攻撃力+2、50%で労災（自爆）。" },
      { id: "chiikawa", name: "ちいかわ構文", type: "meme", era: "令和", cost: 2, atk: 2, hp: 3, freshness: 3, icon: "🐹", desc: "「〇〇ってコト！？」場持ちが良い癒やし枠。" },
      { id: "ronpa", name: "それってあなたの感想ですよね？", type: "spell", era: "令和", cost: 2, icon: "🤔", desc: "【論破】相手の場のミーム1体に3ダメージ。" },
      { id: "ojisan", name: "おじさん構文", type: "spell", era: "令和", cost: 2, icon: "👴", desc: "【デバフ】相手のミーム全ての攻撃力を-2する。" },
      { id: "owakon", name: "時代遅れ（オワコン認定）", type: "spell", era: "令和", cost: 3, icon: "📉", desc: "【メタ】相手の「2ch」「ニコニコ」ミーム1体を即消滅させる。" }
    ]
  }
};
