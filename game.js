let state = {
  turn: 1,
  isPlayerTurn: true,
  player: { label: "", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
  cpu: { label: "", hp: 20, maxGiga: 1, giga: 1, deck: [], hand: [], field: [] },
  selectedAttackerIndex: null
};

function startGame(playerEraKey) {
  const eraKeys = Object.keys(DECK_DATA);
  const cpuEraKeys = eraKeys.filter(k => k !== playerEraKey);
  const cpuEraKey = cpuEraKeys[Math.floor(Math.random() * cpuEraKeys.length)];

  state.player.label = DECK_DATA[playerEraKey].label;
  state.cpu.label = DECK_DATA[cpuEraKey].label;
  state.player.deck = createDeck(DECK_DATA[playerEraKey].cards);
  state.cpu.deck = createDeck(DECK_DATA[cpuEraKey].cards);

  document.getElementById("deck-select-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  document.getElementById("player-title").innerText = `🧑 あなた（${state.player.label}）`;
  document.getElementById("cpu-title").innerText = `👾 CPU（${state.cpu.label}）`;

  for (let i = 0; i < 4; i++) {
    drawCard('player');
    drawCard('cpu');
  }
  log(`対戦開始！『${state.player.label}』vs『${state.cpu.label}』！`);
  render();
}

function createDeck(cardPool) {
  let deck = [];
  for (let i = 0; i < 3; i++) {
    cardPool.forEach(c => deck.push(JSON.parse(JSON.stringify(c))));
  }
  return deck.sort(() => Math.random() - 0.5);
}

function drawCard(who) {
  let p = state[who];
  if (p.deck.length === 0) {
    p.hp -= 2;
    log(`${who === 'player' ? 'あなた' : 'CPU'}はネタ切れ（山札0）でメンタルに2ダメージ！`);
    return;
  }
  if (p.hand.length < 7) p.hand.push(p.deck.pop());
}

function log(msg) {
  const logBox = document.getElementById("log");
  logBox.innerHTML += `<p>> ${msg}</p>`;
  logBox.scrollTop = logBox.scrollHeight;
}

function playCard(handIndex) {
  if (!state.isPlayerTurn) return;
  const p = state.player;
  const card = p.hand[handIndex];

  if (p.giga < card.cost) {
    log("⚠️ ギガ（コスト）が足りません！");
    return;
  }

  if (card.type === "meme") {
    if (p.field.length >= 3) {
      log("⚠️ タイムラインがいっぱいです（最大3体）。");
      return;
    }
    p.giga -= card.cost;
    p.hand.splice(handIndex, 1);
    card.canAttack = true;
    card.isBuzz = true;
    p.field.push(card);
    log(`📱 「${card.name}」を投稿！バズ状態で攻撃可能！`);
    triggerSummonEffect('player', card);
  } else if (card.type === "spell") {
    p.giga -= card.cost;
    p.hand.splice(handIndex, 1);
    log(`⚡ 構文発動：「${card.name}」！`);
    executeSpell('player', card);
  }

  state.selectedAttackerIndex = null;
  checkGameOver();
  render();
}

function triggerSummonEffect(who, card) {
  const self = state[who];
  const opponent = who === 'player' ? state.cpu : state.player;

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
    opponent.hp -= 2;
    log("🤡 ランランルー！相手メンタルに2ダメージ！");
  } else if (card.id === "shuzo") {
    self.field.forEach(m => { if (m !== card) m.atk += 1; });
    log("🔥 修造の熱血応援！他の味方全員の攻撃力+1！");
  }
}

function executeSpell(who, card) {
  const opponent = who === 'player' ? state.cpu : state.player;
  const self = state[who];

  if (card.id === "ronpa" && opponent.field.length > 0) {
    opponent.field[0].hp -= 3;
    log(`🤔 論破！「${opponent.field[0].name}」に3ダメージ！`);
  } else if (card.id === "numai" && opponent.field.length > 0) {
    opponent.field[0].hp -= 2;
    log(`🔨 ガッ！「${opponent.field[0].name}」に2ダメージ！`);
  } else if (card.id === "ojisan") {
    opponent.field.forEach(m => m.atk = Math.max(0, m.atk - 2));
    log("👴 おじさん構文のキツさで相手ミーム全員の攻撃力が-2！");
  } else if (card.id === "owakon") {
    const idx = opponent.field.findIndex(m => m.era === "2ch" || m.era === "ニコニコ");
    if (idx !== -1) {
      log(`📉 「${opponent.field[idx].name}」はオワコン認定され消滅した！`);
      opponent.field.splice(idx, 1);
    }
  } else if (card.id === "kusa") {
    self.field.forEach(m => m.atk += 1);
    log("🌱 大草原！味方全員の攻撃力+1！");
  } else if (card.id === "danmaku") {
    self.field.forEach(m => m.atk += 1);
    drawCard(who);
    log("💬 弾幕展開！味方全員の攻撃力+1＆1枚ドロー！");
  } else if (card.id === "kaiko" || card.id === "kaiko2") {
    if (opponent.field.some(m => m.era === "令和")) {
      opponent.hp -= 3;
      log("📺 懐古厨の説教が刺さり、相手メンタルに3ダメージ！");
    }
  }
  cleanupDeadMemes();
}

function selectAttacker(index) {
  if (!state.isPlayerTurn) return;
  const meme = state.player.field[index];
  if (!meme.canAttack) {
    log("⚠️ このミームは既に行動済みです。");
    return;
  }
  state.selectedAttackerIndex = (state.selectedAttackerIndex === index) ? null : index;
  render();
}

function attackMeme(targetIndex) {
  if (!state.isPlayerTurn || state.selectedAttackerIndex === null) return;
  const attacker = state.player.field[state.selectedAttackerIndex];
  const target = state.cpu.field[targetIndex];

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
  if (!state.isPlayerTurn || state.selectedAttackerIndex === null) return;
  const attacker = state.player.field[state.selectedAttackerIndex];
  const atkPower = attacker.atk + (attacker.isBuzz ? 1 : 0);

  state.cpu.hp -= atkPower;
  attacker.canAttack = false;
  log(`🔥 「${attacker.name}」のダイレクトレスバ！相手メンタルに ${atkPower} ダメージ！`);

  state.selectedAttackerIndex = null;
  checkGameOver();
  render();
}

function cleanupDeadMemes() {
  state.player.field = state.player.field.filter(m => m.hp > 0);
  state.cpu.field = state.cpu.field.filter(m => m.hp > 0);
}

function endTurn() {
  if (!state.isPlayerTurn) return;
  state.isPlayerTurn = false;
  state.selectedAttackerIndex = null;
  processTurnStart('cpu');
  render();
  setTimeout(cpuAI, 800);
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
  const cpu = state.cpu;
  log(`--- CPU（${cpu.label}）のターン ---`);

  for (let i = cpu.hand.length - 1; i >= 0; i--) {
    const card = cpu.hand[i];
    if (card.cost <= cpu.giga) {
      if (card.type === "meme" && cpu.field.length < 3) {
        cpu.giga -= card.cost;
        cpu.hand.splice(i, 1);
        card.isBuzz = true;
        cpu.field.push(card);
        log(`👾 CPUが「${card.name}」を召喚！`);
        triggerSummonEffect('cpu', card);
      } else if (card.type === "spell") {
        cpu.giga -= card.cost;
        cpu.hand.splice(i, 1);
        log(`👾 CPUが「${card.name}」を発動！`);
        executeSpell('cpu', card);
      }
    }
  }

  cpu.field.forEach(m => {
    const power = m.atk + (m.isBuzz ? 1 : 0);
    if (state.player.field.length > 0) {
      const target = state.player.field[0];
      target.hp -= power;
      m.hp -= (target.atk + (target.isBuzz ? 1 : 0));
      log(`👾 CPUの「${m.name}」が「${target.name}」を攻撃！`);
      cleanupDeadMemes();
    } else {
      state.player.hp -= power;
      log(`👾 CPUの「${m.name}」が直接攻撃！メンタルに ${power} ダメージ！`);
    }
  });

  if (checkGameOver()) return;

  state.turn++;
  state.isPlayerTurn = true;
  processTurnStart('player');
  log(`--- あなたのターン（ターン ${state.turn}） ---`);
  render();
}

function checkGameOver() {
  if (state.cpu.hp <= 0) {
    alert("🎉 勝利！相手のアカウントを凍結（メンタル0）に追い込みました！");
    location.reload();
    return true;
  }
  if (state.player.hp <= 0) {
    alert("💀 敗北... レスバに負けてSNSを引退しました...");
    location.reload();
    return true;
  }
  return false;
}

function render() {
  document.getElementById("cpu-hp").innerText = state.cpu.hp;
  document.getElementById("cpu-giga").innerText = `${state.cpu.giga}/${state.cpu.maxGiga}`;
  document.getElementById("cpu-deck-count").innerText = `(山札: ${state.cpu.deck.length}枚)`;

  document.getElementById("player-hp").innerText = state.player.hp;
  document.getElementById("player-giga").innerText = `${state.player.giga}/${state.player.maxGiga}`;
  document.getElementById("player-deck-count").innerText = `(山札: ${state.player.deck.length}枚)`;

  const directBtn = document.getElementById("direct-attack-btn");
  directBtn.disabled = !(state.isPlayerTurn && state.selectedAttackerIndex !== null && state.cpu.field.length === 0);
  document.getElementById("end-turn-btn").disabled = !state.isPlayerTurn;

  const cpuFieldEl = document.getElementById("cpu-field");
  cpuFieldEl.innerHTML = "";
  state.cpu.field.forEach((c, idx) => {
    cpuFieldEl.appendChild(createCardElement(c, () => attackMeme(idx), false, false));
  });

  const playerFieldEl = document.getElementById("player-field");
  playerFieldEl.innerHTML = "";
  state.player.field.forEach((c, idx) => {
    const isSelected = state.selectedAttackerIndex === idx;
    const canAtk = state.isPlayerTurn && c.canAttack;
    playerFieldEl.appendChild(createCardElement(c, () => selectAttacker(idx), isSelected, canAtk));
  });

  const handEl = document.getElementById("player-hand");
  handEl.innerHTML = "";
  state.player.hand.forEach((c, idx) => {
    handEl.appendChild(createCardElement(c, () => playCard(idx), false, false));
  });
}

function createCardElement(card, onClick, isSelected, canAttack) {
  const div = document.createElement("div");
  div.className = `card ${card.type === 'spell' ? 'spell' : ''} ${isSelected ? 'selected' : ''} ${canAttack ? 'can-attack' : ''}`;
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
