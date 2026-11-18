let state = {
  mode: 'cpu', // 'cpu' or 'pvp'
  turn: 1,
  activeSide: 'p1', // 'p1' or 'p2'
  isInputLocked: false,
  p1: { name: "プレイヤー1", label: "", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
  p2: { name: "CPU", label: "", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
  selectedAttackerIndex: null
};

let p1SelectedEra = null;

function selectMode(mode) {
  state.mode = mode;
  document.getElementById("step-mode").style.display = "none";
  document.getElementById("step-deck").style.display = "block";
  document.getElementById("deck-select-title").innerText =
    mode === 'cpu' ? "使用する世代デッキを選択してください" : "プレイヤー1（先攻）のデッキを選択";
}

function selectDeck(eraKey) {
  if (state.mode === 'cpu') {
    const eraKeys = Object.keys(DECK_DATA);
    const cpuEraKeys = eraKeys.filter(k => k !== eraKey);
    const cpuEraKey = cpuEraKeys[Math.floor(Math.random() * cpuEraKeys.length)];
    initMatch(eraKey, cpuEraKey);
  } else {
    if (!p1SelectedEra) {
      p1SelectedEra = eraKey;
      document.getElementById("deck-select-title").innerText = "プレイヤー2（後攻）のデッキを選択";
    } else {
      initMatch(p1SelectedEra, eraKey);
    }
  }
}

function initMatch(p1Era, p2Era) {
  state.p1.label = DECK_DATA[p1Era].label;
  state.p2.label = DECK_DATA[p2Era].label;
  state.p2.name = state.mode === 'cpu' ? "CPU" : "プレイヤー2";

  state.p1.deck = createDeck(DECK_DATA[p1Era].cards);
  state.p2.deck = createDeck(DECK_DATA[p2Era].cards);

  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";

  for (let i = 0; i < 4; i++) {
    drawCard('p1');
    drawCard('p2');
  }
  log(`対戦開始！『${state.p1.label}』vs『${state.p2.label}』！`);
  showCutin(`⚔️ 対戦開始！\n${state.p1.name}のターン`);
  render();
}

function createDeck(cardPool) {
  let deck = [];
  for (let i = 0; i < 3; i++) {
    cardPool.forEach(c => deck.push(JSON.parse(JSON.stringify(c))));
  }
  return deck.sort(() => Math.random() - 0.5);
}

function getSelf() { return state[state.activeSide]; }
function getOpp() { return state[state.activeSide === 'p1' ? 'p2' : 'p1']; }

function drawCard(who) {
  let p = state[who];
  if (p.deck.length === 0) {
    p.hp -= 2;
    log(`${p.name}はネタ切れ（山札0）でメンタルに2ダメージ！`);
    return;
  }
  if (p.hand.length < 7) p.hand.push(p.deck.pop());
}

function log(msg) {
  const logBox = document.getElementById("log");
  logBox.innerHTML = `<p>> ${msg}</p>` + logBox.innerHTML;
}

function showCutin(text, duration = 1100) {
  const overlay = document.getElementById("cutin-overlay");
  document.getElementById("cutin-text").innerText = text;
  overlay.style.display = "flex";
  setTimeout(() => { overlay.style.display = "none"; }, duration);
}

function playCard(handIndex) {
  if (state.isInputLocked) return;
  const self = getSelf();
  const card = self.hand[handIndex];

  if (self.giga < card.cost) {
    log("⚠️ ギガ（コスト）が足りません！");
    return;
  }

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
    log(`📱 ${self.name}が「${card.name}」を投稿！`);
    triggerSummonEffect(state.activeSide, card);
  } else if (card.type === "spell") {
    self.giga -= card.cost;
    self.hand.splice(handIndex, 1);
    log(`⚡ ${self.name}が構文「${card.name}」を発動！`);
    executeSpell(state.activeSide, card);
  }

  state.selectedAttackerIndex = null;
  checkGameOver();
  render();
}

function triggerSummonEffect(who, card) {
  const self = state[who];
  const opp = state[who === 'p1' ? 'p2' : 'p1'];

  if (card.id === "neko") {
    drawCard(who);
    log("🐱 猫ミーム効果：1枚ドロー！");
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
    log(`🤡 ランランルー！${opp.name}のメンタルに2ダメージ！`);
  } else if (card.id === "shuzo") {
    self.field.forEach(m => { if (m !== card) m.atk += 1; });
    log("🔥 修造の熱血応援！他の味方全員の攻撃力+1！");
  }
}

function executeSpell(who, card) {
  const self = state[who];
  const opp = state[who === 'p1' ? 'p2' : 'p1'];

  if (card.id === "ronpa" && opp.field.length > 0) {
    opp.field[0].hp -= 3;
    log(`🤔 論破！「${opp.field[0].name}」に3ダメージ！`);
  } else if (card.id === "numai" && opp.field.length > 0) {
    opp.field[0].hp -= 2;
    log(`🔨 ガッ！「${opp.field[0].name}」に2ダメージ！`);
  } else if (card.id === "ojisan") {
    opp.field.forEach(m => m.atk = Math.max(0, m.atk - 2));
    log("👴 おじさん構文のキツさで相手ミーム全員の攻撃力が-2！");
  } else if (card.id === "owakon") {
    const idx = opp.field.findIndex(m => m.era === "2ch" || m.era === "ニコニコ");
    if (idx !== -1) {
      log(`📉 「${opp.field[idx].name}」はオワコン認定され消滅した！`);
      opp.field.splice(idx, 1);
    }
  } else if (card.id === "kusa") {
    self.field.forEach(m => m.atk += 1);
    log("🌱 大草原！味方全員の攻撃力+1！");
  } else if (card.id === "danmaku") {
    self.field.forEach(m => m.atk += 1);
    drawCard(who);
    log("💬 弾幕展開！味方全員の攻撃力+1＆1枚ドロー！");
  } else if (card.id === "kaiko" || card.id === "kaiko2") {
    if (opp.field.some(m => m.era === "令和")) {
      opp.hp -= 3;
      log(`📺 懐古厨の説教が刺さり、${opp.name}のメンタルに3ダメージ！`);
    }
  }
  cleanupDeadMemes();
}

function selectAttacker(index) {
  if (state.isInputLocked) return;
  const meme = getSelf().field[index];
  if (!meme.canAttack) {
    log("⚠️ このミームは既に行動済みです。");
    return;
  }
  state.selectedAttackerIndex = (state.selectedAttackerIndex === index) ? null : index;
  render();
}

function attackMeme(targetIndex) {
  if (state.isInputLocked || state.selectedAttackerIndex === null) return;
  const self = getSelf();
  const opp = getOpp();
  const attacker = self.field[state.selectedAttackerIndex];
  const target = opp.field[targetIndex];

  const atkPower = attacker.atk + (attacker.isBuzz ? 1 : 0);
  const targetPower = target.atk + (target.isBuzz ? 1 : 0);

  target.hp -= atkPower;
  attacker.hp -= targetPower;
  attacker.canAttack = false;

  log(`⚔️ 「${attacker.name}」が「${target.name}」とレスバ！`);
  state.selectedAttackerIndex = null;
  cleanupDeadMemes();
  checkGameOver();
  render();
}

function directAttack() {
  if (state.isInputLocked || state.selectedAttackerIndex === null) return;
  const self = getSelf();
  const opp = getOpp();
  const attacker = self.field[state.selectedAttackerIndex];
  const atkPower = attacker.atk + (attacker.isBuzz ? 1 : 0);

  opp.hp -= atkPower;
  attacker.canAttack = false;
  log(`🔥 「${attacker.name}」の直接攻撃！${opp.name}のメンタルに ${atkPower} ダメージ！`);

  state.selectedAttackerIndex = null;
  checkGameOver();
  render();
}

function cleanupDeadMemes() {
  state.p1.field = state.p1.field.filter(m => m.hp > 0);
  state.p2.field = state.p2.field.filter(m => m.hp > 0);
}

function endTurn() {
  if (state.isInputLocked) return;
  state.selectedAttackerIndex = null;

  if (state.mode === 'cpu') {
    state.activeSide = 'p2';
    state.isInputLocked = true;
    processTurnStart('p2');
    showCutin(`👾 CPUのターン（思考中...）`, 1100);
    render();
    setTimeout(cpuAI, 1200);
  } else {
    // 2人対戦モード：交代画面を出す
    state.activeSide = state.activeSide === 'p1' ? 'p2' : 'p1';
    if (state.activeSide === 'p1') state.turn++;
    processTurnStart(state.activeSide);
    document.getElementById("pass-title").innerText = `📱 ${getSelf().name}のターンです`;
    document.getElementById("pass-screen").style.display = "flex";
  }
}

function resumeTurn() {
  document.getElementById("pass-screen").style.display = "none";
  log(`--- ${getSelf().name}のターン（ターン ${state.turn}） ---`);
  render();
}

function processTurnStart(who) {
  const p = state[who];
  if (p.maxGiga < 10) p.maxGiga++;
  p.giga = p.maxGiga;
  drawCard(who);

  p.field.forEach(m => {
    m.isBuzz = false;
    m.freshness--;
    m.canAttack = true;
  });
  const expired = p.field.filter(m => m.freshness <= 0);
  expired.forEach(m => log(`⌛ 「${m.name}」は飽きられてオワコン化（消滅）した...`));
  p.field = p.field.filter(m => m.freshness > 0);
}

function cpuAI() {
  const cpu = state.p2;
  let actions = [];

  for (let i = cpu.hand.length - 1; i >= 0; i--) {
    const card = cpu.hand[i];
    if (card.cost <= cpu.giga) {
      if (card.type === "meme" && cpu.field.length < 3) {
        cpu.giga -= card.cost;
        cpu.hand.splice(i, 1);
        card.isBuzz = true;
        cpu.field.push(card);
        actions.push(`「${card.name}」を召喚`);
        log(`👾 CPUが「${card.name}」を召喚！`);
        triggerSummonEffect('p2', card);
      } else if (card.type === "spell") {
        cpu.giga -= card.cost;
        cpu.hand.splice(i, 1);
        actions.push(`「${card.name}」を発動`);
        log(`👾 CPUが「${card.name}」を発動！`);
        executeSpell('p2', card);
      }
    }
  }

  cpu.field.forEach(m => {
    const power = m.atk + (m.isBuzz ? 1 : 0);
    if (state.p1.field.length > 0) {
      const target = state.p1.field[0];
      target.hp -= power;
      m.hp -= (target.atk + (target.isBuzz ? 1 : 0));
      actions.push(`「${m.name}」で攻撃`);
      log(`👾 CPUの「${m.name}」が「${target.name}」を攻撃！`);
      cleanupDeadMemes();
    } else {
      state.p1.hp -= power;
      actions.push(`「${m.name}」で直接攻撃(${power}ダメ)`);
      log(`👾 CPUの「${m.name}」が直接攻撃！メンタルに ${power} ダメージ！`);
    }
  });

  if (checkGameOver()) return;

  state.turn++;
  state.activeSide = 'p1';
  state.isInputLocked = false;
  processTurnStart('p1');
  const summary = actions.length > 0 ? `CPUは ${actions.join(" → ")}！\n` : "CPUは何もしなかった。\n";
  showCutin(`${summary}🧑 あなたのターン（ターン ${state.turn}）`, 1400);
  log(`--- あなたのターン（ターン ${state.turn}） ---`);
  render();
}

function checkGameOver() {
  if (state.p2.hp <= 0) {
    setTimeout(() => { alert(`🎉 ${state.p1.name}の勝利！相手をSNS引退に追い込みました！`); location.reload(); }, 200);
    return true;
  }
  if (state.p1.hp <= 0) {
    setTimeout(() => { alert(`🎉 ${state.p2.name}の勝利！相手をSNS引退に追い込みました！`); location.reload(); }, 200);
    return true;
  }
  return false;
}

function updateGuideBanner() {
  const banner = document.getElementById("guide-banner");
  const self = getSelf();
  const opp = getOpp();

  if (state.isInputLocked) {
    banner.innerText = "⏳ CPUのターンです...";
    banner.style.borderColor = "#ff6b6b";
    return;
  }
  banner.style.borderColor = "#00d2ff";

  if (state.selectedAttackerIndex !== null) {
    const attacker = self.field[state.selectedAttackerIndex];
    if (opp.field.length > 0) {
      banner.innerText = `🎯 「${attacker.name}」で攻撃！赤く点滅している相手のミームをタップしよう`;
    } else {
      banner.innerText = `🔥 相手の場が空です！「💥 相手本体に直接攻撃」ボタンを押そう！`;
    }
    return;
  }

  const canPlayAny = self.hand.some(c => c.cost <= self.giga);
  const canAttackAny = self.field.some(m => m.canAttack);

  if (canPlayAny && canAttackAny) {
    banner.innerText = `💡 ${self.name}のターン：手札（緑枠）を出すか、場のミーム（緑枠）で攻撃しよう！`;
  } else if (canPlayAny) {
    banner.innerText = `💡 ${self.name}のターン：手札の緑枠カードをタップして投稿しよう！`;
  } else if (canAttackAny) {
    banner.innerText = `⚔️ 場の緑枠ミームをタップして攻撃しよう！`;
  } else {
    banner.innerText = `✅ できる行動がありません。「⏭️ ターン終了」を押そう！`;
  }
}

function render() {
  const self = getSelf();
  const opp = getOpp();

  document.getElementById("opp-title").innerText = `👾 ${opp.name}（${opp.label}）`;
  document.getElementById("opp-hp").innerText = opp.hp;
  document.getElementById("opp-giga").innerText = `${opp.giga}/${opp.maxGiga}`;
  document.getElementById("opp-deck-count").innerText = `(山札: ${opp.deck.length}枚)`;

  document.getElementById("self-title").innerText = `🧑 ${self.name}（${self.label}）`;
  document.getElementById("self-hp").innerText = self.hp;
  document.getElementById("self-giga").innerText = `${self.giga}/${self.maxGiga}`;
  document.getElementById("self-deck-count").innerText = `(山札: ${self.deck.length}枚)`;

  updateGuideBanner();

  const canDirect = !state.isInputLocked && state.selectedAttackerIndex !== null && opp.field.length === 0;
  const directBtn = document.getElementById("direct-attack-btn");
  directBtn.disabled = !canDirect;
  if (canDirect) directBtn.classList.add("ready");
  else directBtn.classList.remove("ready");

  document.getElementById("end-turn-btn").disabled = state.isInputLocked;

  // 相手フィールド描画
  const oppFieldEl = document.getElementById("opp-field");
  oppFieldEl.innerHTML = opp.field.length === 0 ? `<span class="empty-msg">相手の場にミームはいません</span>` : "";
  opp.field.forEach((c, idx) => {
    const isTarget = !state.isInputLocked && state.selectedAttackerIndex !== null;
    oppFieldEl.appendChild(createCardElement(c, () => attackMeme(idx), { isTarget }));
  });

  // 自分フィールド描画
  const selfFieldEl = document.getElementById("self-field");
  selfFieldEl.innerHTML = self.field.length === 0 ? `<span class="empty-msg">自分の場にミームはいません</span>` : "";
  self.field.forEach((c, idx) => {
    const isSelected = state.selectedAttackerIndex === idx;
    const canAttack = !state.isInputLocked && c.canAttack;
    selfFieldEl.appendChild(createCardElement(c, () => selectAttacker(idx), { isSelected, canAttack }));
  });

  // 自分の手札描画
  const handEl = document.getElementById("self-hand");
  handEl.innerHTML = "";
  self.hand.forEach((c, idx) => {
    const playable = !state.isInputLocked && c.cost <= self.giga;
    handEl.appendChild(createCardElement(c, () => playCard(idx), { playable, unplayable: !playable }));
  });
}

function createCardElement(card, onClick, flags = {}) {
  const div = document.createElement("div");
  let classes = ["card"];
  if (card.type === 'spell') classes.push("spell");
  if (flags.isSelected) classes.push("selected");
  if (flags.canAttack) classes.push("can-attack");
  if (flags.isTarget) classes.push("targetable");
  if (flags.playable) classes.push("playable");
  if (flags.unplayable) classes.push("unplayable");

  div.className = classes.join(" ");
  div.onclick = onClick;

  const displayAtk = card.atk + (card.isBuzz ? 1 : 0);
  const buzzBadge = card.isBuzz ? `<div class="buzz-badge">🔥バズ中(+1)</div>` : '';
  const statsHtml = card.type === 'meme'
    ? `<div class="card-stats"><span>⚔️${displayAtk}</span><span>⏳鮮度:${card.freshness}</span><span>❤️${card.hp}</span></div>`
    : `<div class="card-stats" style="justify-content:center; color:#ffd32a;">【構文 / スペル】</div>`;

  div.innerHTML = `
    ${buzzBadge}
    <div class="card-header">
      <span class="cost-badge">${card.cost}</span>
      <span class="era-tag">${card.era}</span>
    </div>
    <div class="card-title">${card.name}</div>
    <div class="card-art">${card.icon}</div>
    <div class="card-desc">${card.desc}</div>
    ${statsHtml}
  `;
  return div;
}
