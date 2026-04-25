// ===== DOM RENDERING & TAB MANAGEMENT =====
import { state, RULES, saveState } from './state.js';
import * as Logic from './logic.js';

const TABS = [
  { id: 'overview',    label: 'Overview',  icon: '📋' },
  { id: 'stats',       label: 'Stats',     icon: '⚔️' },
  { id: 'combat',      label: 'Combat',    icon: '🛡️' },
  { id: 'progression', label: 'Level',     icon: '📈' },
  { id: 'storage',     label: 'Storage',   icon: '💾' }
];

let activeTab = 'overview';

// ===== INIT =====
export function initUI() {
  renderTabBar();
  renderAllPanels();
  switchTab('overview');
}

// ===== TAB BAR =====
function renderTabBar() {
  const bar = document.getElementById('tab-bar');
  bar.innerHTML = TABS.map(t => `
    <button class="tab-btn${t.id === activeTab ? ' active' : ''}"
            role="tab" id="tab-${t.id}" aria-controls="panel-${t.id}"
            aria-selected="${t.id === activeTab}" data-tab="${t.id}">
      <span class="tab-icon">${t.icon}</span>${t.label}
    </button>
  `).join('');
}

export function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tabId}`);
  });
  updateActivePanel();
}

// ===== RENDER ALL PANELS =====
function renderAllPanels() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    ${overviewPanel()}
    ${statsPanel()}
    ${combatPanel()}
    ${progressionPanel()}
    ${storagePanel()}
  `;
}

// ===== OVERVIEW PANEL =====
function overviewPanel() {
  const raceOptions = Object.keys(RULES.RACES).map(r =>
    `<option value="${r}"${state.character.race === r ? ' selected' : ''}>${r}</option>`
  ).join('');
  const classOptions = Object.keys(RULES.CLASSES).map(c =>
    `<option value="${c}"${state.character.class === c ? ' selected' : ''}>${c}</option>`
  ).join('');

  return `
  <section id="panel-overview" class="tab-panel" role="tabpanel" aria-labelledby="tab-overview">
    <div class="card">
      <div class="card-title">Identity</div>
      <div class="form-group">
        <label class="card-label" for="char-name">Character Name</label>
        <input class="input" type="text" id="char-name" data-field="name"
               placeholder="Enter name…" value="${esc(state.character.name)}" maxlength="50">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="card-label" for="char-race">Race</label>
          <select class="select" id="char-race" data-field="race">${raceOptions}</select>
        </div>
        <div class="form-group">
          <label class="card-label" for="char-class">Class</label>
          <select class="select" id="char-class" data-field="class">${classOptions}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="card-label" for="char-dci">DCI Number</label>
          <input class="input" type="text" id="char-dci" data-field="dciNumber"
                 placeholder="Optional" value="${esc(state.dciNumber)}" maxlength="20">
        </div>
        <div class="form-group">
          <label class="card-label" for="char-faction">Faction</label>
          <input class="input" type="text" id="char-faction" data-field="faction"
                 placeholder="Optional" value="${esc(state.faction)}" maxlength="50">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Ability Scores</div>
      <div class="stat-grid" id="stat-summary"></div>
    </div>

    <div class="card">
      <div class="card-title">Quick Info</div>
      <div class="combat-row">
        <div class="combat-stat">
          <div class="combat-stat-value" id="ov-level">${state.character.level}</div>
          <div class="combat-stat-label">Level</div>
        </div>
        <div class="combat-stat">
          <div class="combat-stat-value" id="ov-prof">${Logic.formatModifier(Logic.calcProficiencyBonus(state.character.level))}</div>
          <div class="combat-stat-label">Proficiency</div>
        </div>
        <div class="combat-stat">
          <div class="combat-stat-value" id="ov-hp">${state.hp.current}/${state.hp.max}</div>
          <div class="combat-stat-label">Hit Points</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Proficiencies & Languages</div>
      <div class="form-group">
        <label class="card-label" for="char-proficiencies">Other Proficiencies</label>
        <textarea class="input textarea-sm" id="char-proficiencies" data-field="proficiencies"
                  placeholder="Armor, weapons, tools…">${esc(state.proficiencies)}</textarea>
      </div>
      <div class="form-group">
        <label class="card-label" for="char-languages">Languages</label>
        <textarea class="input textarea-sm" id="char-languages" data-field="languages"
                  placeholder="Common, Elvish…">${esc(state.languages)}</textarea>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Personality</div>
      <div class="form-group">
        <label class="card-label" for="char-personality">Personality Traits</label>
        <textarea class="input textarea-sm" id="char-personality" data-field="personalityTraits"
                  placeholder="Describe your character's personality…">${esc(state.personalityTraits)}</textarea>
      </div>
      <div class="form-group">
        <label class="card-label" for="char-ideals">Ideals</label>
        <textarea class="input textarea-sm" id="char-ideals" data-field="ideals"
                  placeholder="What drives your character…">${esc(state.ideals)}</textarea>
      </div>
      <div class="form-group">
        <label class="card-label" for="char-bonds">Bonds</label>
        <textarea class="input textarea-sm" id="char-bonds" data-field="bonds"
                  placeholder="Connections to people, places, events…">${esc(state.bonds)}</textarea>
      </div>
      <div class="form-group">
        <label class="card-label" for="char-flaws">Flaws</label>
        <textarea class="input textarea-sm" id="char-flaws" data-field="flaws"
                  placeholder="Weaknesses, vices…">${esc(state.flaws)}</textarea>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Features & Traits</div>
      <textarea class="input" id="char-features" data-field="featuresTraits"
                placeholder="Racial traits, class features, feats…">${esc(state.featuresTraits)}</textarea>
    </div>

    <div class="card">
      <div class="card-title">Notes</div>
      <textarea class="input" id="char-notes" data-field="notes"
                placeholder="Backstory, session notes…">${esc(state.notes)}</textarea>
    </div>
  </section>`;
}

// ===== STATS PANEL =====
function statsPanel() {
  return `
  <section id="panel-stats" class="tab-panel" role="tabpanel" aria-labelledby="tab-stats">
    <div class="point-budget">
      <div class="card-label">Point Buy Budget</div>
      <div class="point-budget-value" id="points-remaining">${Logic.calcRemainingPoints(state.baseStats)}</div>
      <div class="text-muted" style="font-size:var(--fs-xs)">of ${RULES.POINT_BUY_BUDGET} points remaining</div>
    </div>

    <div id="stat-rows"></div>

    <div class="divider"></div>

    <div class="card">
      <div class="card-title">Skills</div>
      <div class="skills-list" id="skills-list"></div>
    </div>
  </section>`;
}

// ===== COMBAT PANEL =====
function combatPanel() {
  return `
  <section id="panel-combat" class="tab-panel" role="tabpanel" aria-labelledby="tab-combat">
    <div class="hp-display" id="hp-display">
      <div class="hp-label">Hit Points</div>
      <div class="hp-numbers">
        <span class="hp-current" id="hp-current">${state.hp.current}</span>
        <span class="hp-separator">/</span>
        <span class="hp-max" id="hp-max">${state.hp.max}</span>
      </div>
      <div class="hp-bar"><div class="hp-bar-fill" id="hp-bar-fill"></div></div>
      <div class="hp-controls">
        <button class="btn btn-danger btn-sm" data-action="damage" id="btn-damage">− DMG</button>
        <input class="input" type="number" id="hp-amount" value="1" min="1" max="999" style="width:70px">
        <button class="btn btn-sm" data-action="heal" id="btn-heal"
                style="background:var(--success-dim);color:var(--success);border:1px solid rgba(74,222,128,0.2)">+ HEAL</button>
      </div>
    </div>

    <div class="hp-temp">
      <span class="hp-temp-label">Temporary Hit Points</span>
      <input class="input" type="number" id="temp-hp" value="${state.hp.temp}" min="0" max="999">
    </div>

    <div class="combat-row">
      <div class="combat-stat">
        <div class="combat-stat-value" id="combat-ac">${state.ac}</div>
        <div class="combat-stat-label">Armor Class</div>
        <div class="mt-sm"><input class="input" type="number" id="ac-input" value="${state.ac}" min="1" max="30" style="width:60px;margin:0 auto;text-align:center"></div>
      </div>
      <div class="combat-stat">
        <div class="combat-stat-value" id="combat-init">${Logic.formatModifier(Logic.calcInitiative(Logic.getTotalStat(state.baseStats.DEX, state.character.race, 'DEX')))}</div>
        <div class="combat-stat-label">Initiative</div>
      </div>
      <div class="combat-stat">
        <div class="combat-stat-value" id="combat-speed">${state.speed}</div>
        <div class="combat-stat-label">Speed</div>
        <div class="mt-sm"><input class="input" type="number" id="speed-input" value="${state.speed}" min="0" max="120" style="width:60px;margin:0 auto;text-align:center"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Attacks & Spellcasting</div>
      <div id="attacks-list"></div>
      <div class="add-row-form" id="attack-form">
        <input class="input input-sm" type="text" id="atk-name" placeholder="Name" maxlength="30">
        <input class="input input-sm" type="text" id="atk-bonus" placeholder="+Hit" maxlength="6" style="width:60px">
        <input class="input input-sm" type="text" id="atk-damage" placeholder="Damage" maxlength="20" style="width:80px">
        <input class="input input-sm" type="text" id="atk-type" placeholder="Type" maxlength="15" style="width:70px">
        <button class="btn btn-primary btn-sm btn-add" data-action="addAttack" id="btn-add-attack">+</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Equipment</div>
      <div id="equipment-list"></div>
      <div class="add-row-form" id="equip-form">
        <input class="input input-sm" type="text" id="equip-name" placeholder="Item name" maxlength="40">
        <input class="input input-sm" type="number" id="equip-qty" placeholder="Qty" min="1" max="999" value="1" style="width:60px">
        <button class="btn btn-primary btn-sm btn-add" data-action="addEquipment" id="btn-add-equip">+</button>
      </div>
    </div>

    <div class="death-saves" id="death-saves-section">
      <div class="death-saves-title">Death Saves</div>
      <div class="death-saves-row">
        <span class="death-saves-label">Successes</span>
        <div class="death-pips" id="death-successes"></div>
      </div>
      <div class="death-saves-row">
        <span class="death-saves-label">Failures</span>
        <div class="death-pips" id="death-failures"></div>
      </div>
      <div class="death-status" id="death-status"></div>
    </div>
  </section>`;
}

// ===== PROGRESSION PANEL =====
function progressionPanel() {
  return `
  <section id="panel-progression" class="tab-panel" role="tabpanel" aria-labelledby="tab-progression">
    <div class="level-display">
      <div class="level-label">Level</div>
      <div class="level-number" id="prog-level">${state.character.level}</div>
      <div class="card-label mt-sm">Proficiency Bonus: <span class="text-accent" id="prog-prof">${Logic.formatModifier(Logic.calcProficiencyBonus(state.character.level))}</span></div>
    </div>

    <div class="xp-section">
      <div class="xp-bar-container">
        <div class="xp-info">
          <span id="xp-current">${state.character.xp.toLocaleString()} Experience</span>
          <span id="xp-next">Next: ${Logic.xpForNextLevel(state.character.level).toLocaleString()} Experience</span>
        </div>
        <div class="xp-bar"><div class="xp-bar-fill" id="xp-bar-fill"></div></div>
        <div class="xp-controls">
          <input class="input" type="number" id="xp-amount" value="100" min="0" max="355000">
          <button class="btn btn-primary btn-sm" data-action="addXP" id="btn-add-xp">+ Add Experience</button>
          <button class="btn btn-secondary btn-sm" data-action="setXP" id="btn-set-xp">Set</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Milestones</div>
      <div id="milestones" style="max-height:250px;overflow-y:auto"></div>
    </div>
  </section>`;
}

// ===== STORAGE PANEL =====
function storagePanel() {
  return `
  <section id="panel-storage" class="tab-panel" role="tabpanel" aria-labelledby="tab-storage">
    <div class="card">
      <div class="card-title">Session Mode</div>
      <div class="toggle-group">
        <button class="toggle-option${state.sessionMode === 'campaign' ? ' active' : ''}"
                data-action="setMode" data-mode="campaign" id="mode-campaign">⚔️ Campaign</button>
        <button class="toggle-option${state.sessionMode === 'oneshot' ? ' active' : ''}"
                data-action="setMode" data-mode="oneshot" id="mode-oneshot">🎲 One-Shot</button>
      </div>
      <p class="text-muted" style="font-size:var(--fs-xs)" id="mode-desc">
        ${state.sessionMode === 'campaign' ? 'Character persists between sessions (localStorage).' : 'Character cleared when tab closes (sessionStorage).'}
      </p>
    </div>

    <div class="card">
      <div class="card-title">Data</div>
      <button class="btn btn-primary btn-block mb-md" data-action="export" id="btn-export">📥 Export Character (JSON)</button>
      <label class="btn btn-secondary btn-block mb-md" style="cursor:pointer" id="btn-import-label">
        📤 Import Character
        <input type="file" accept=".json" id="import-file" data-action="import" style="display:none">
      </label>
      <div class="divider"></div>
      <button class="btn btn-danger btn-block" data-action="reset" id="btn-reset">🗑️ Reset Character</button>
    </div>

    <div class="card">
      <div class="card-title">Info</div>
      <p class="text-muted" style="font-size:var(--fs-xs)">
        Created: <span id="info-created">${state.created ? new Date(state.created).toLocaleDateString() : '—'}</span><br>
        Last Modified: <span id="info-modified">${state.lastModified ? new Date(state.lastModified).toLocaleString() : '—'}</span>
      </p>
    </div>
  </section>`;
}

// ===== UPDATE FUNCTIONS =====
export function updateActivePanel() {
  switch (activeTab) {
    case 'overview': updateOverview(); break;
    case 'stats': updateStats(); break;
    case 'combat': updateCombat(); break;
    case 'progression': updateProgression(); break;
  }
}

export function updateAll() {
  updateOverview();
  updateStats();
  updateCombat();
  updateProgression();
}

export function updateOverview() {
  // Stat summary grid
  const grid = document.getElementById('stat-summary');
  if (!grid) return;
  grid.innerHTML = RULES.STATS.map(stat => {
    const total = Logic.getTotalStat(state.baseStats[stat], state.character.race, stat);
    const mod = Logic.calcModifier(total);
    return `
      <div class="stat-circle">
        <div class="stat-circle-label">${RULES.STAT_NAMES[stat]}</div>
        <div class="stat-circle-score">${total}</div>
        <div class="stat-circle-mod">${Logic.formatModifier(mod)}</div>
      </div>`;
  }).join('');
  // Quick info
  const lv = document.getElementById('ov-level');
  const prof = document.getElementById('ov-prof');
  const hp = document.getElementById('ov-hp');
  if (lv) lv.textContent = state.character.level;
  if (prof) prof.textContent = Logic.formatModifier(Logic.calcProficiencyBonus(state.character.level));
  if (hp) hp.textContent = `${state.hp.current}/${state.hp.max}`;
}

export function updateStats() {
  // Points remaining
  const remaining = Logic.calcRemainingPoints(state.baseStats);
  const el = document.getElementById('points-remaining');
  if (el) {
    el.textContent = remaining;
    el.classList.toggle('over-budget', remaining < 0);
  }

  // Stat rows
  const container = document.getElementById('stat-rows');
  if (!container) return;
  container.innerHTML = RULES.STATS.map(stat => {
    const base = state.baseStats[stat];
    const bonus = Logic.getRaceBonus(state.character.race, stat);
    const total = base + bonus;
    const mod = Logic.calcModifier(total);
    const cost = RULES.POINT_COSTS[base];
    return `
      <div class="stat-row">
        <span class="stat-name">${RULES.STAT_NAMES[stat]}</span>
        <div class="stat-controls">
          <button class="stepper-btn" data-action="decStat" data-stat="${stat}"
                  ${!Logic.canDecrement(state.baseStats, stat) ? 'disabled' : ''} aria-label="Decrease ${RULES.STAT_NAMES[stat]}">−</button>
          <span class="stat-value">${base}</span>
          <button class="stepper-btn" data-action="incStat" data-stat="${stat}"
                  ${!Logic.canIncrement(state.baseStats, stat) ? 'disabled' : ''} aria-label="Increase ${RULES.STAT_NAMES[stat]}">+</button>
        </div>
        ${bonus ? `<span class="stat-bonus">+${bonus}</span>` : '<span class="stat-bonus"></span>'}
        <span class="stat-modifier">${Logic.formatModifier(mod)}</span>
        <span class="stat-cost">${cost} pts</span>
      </div>`;
  }).join('');

  // Skills
  const skillsList = document.getElementById('skills-list');
  if (!skillsList) return;
  const profBonus = Logic.calcProficiencyBonus(state.character.level);
  skillsList.innerHTML = Object.entries(RULES.SKILLS).map(([skill, stat]) => {
    const total = Logic.getTotalStat(state.baseStats[stat], state.character.race, stat);
    const mod = Logic.calcSkillModifier(total, state.skills[skill], profBonus);
    return `
      <label class="skill-row">
        <input class="skill-check" type="checkbox" data-action="toggleSkill" data-skill="${skill}"
               ${state.skills[skill] ? 'checked' : ''}>
        <span class="skill-name">${skill}</span>
        <span class="skill-stat">${RULES.STAT_NAMES[stat]}</span>
        <span class="skill-mod">${Logic.formatModifier(mod)}</span>
      </label>`;
  }).join('');
}

export function updateCombat() {
  const pct = state.hp.max > 0 ? (state.hp.current / state.hp.max) * 100 : 0;
  const hpClass = pct <= 25 ? 'critical' : pct <= 50 ? 'hurt' : '';

  const cur = document.getElementById('hp-current');
  const max = document.getElementById('hp-max');
  const bar = document.getElementById('hp-bar-fill');
  if (cur) { cur.textContent = state.hp.current; cur.className = `hp-current ${hpClass}`; }
  if (max) max.textContent = state.hp.max;
  if (bar) { bar.style.width = `${pct}%`; bar.className = `hp-bar-fill ${hpClass}`; }

  // Initiative
  const init = document.getElementById('combat-init');
  if (init) init.textContent = Logic.formatModifier(Logic.calcInitiative(Logic.getTotalStat(state.baseStats.DEX, state.character.race, 'DEX')));

  // AC & Speed
  const ac = document.getElementById('combat-ac');
  if (ac) ac.textContent = state.ac;
  const spd = document.getElementById('combat-speed');
  if (spd) spd.textContent = state.speed;

  // Death saves
  const succEl = document.getElementById('death-successes');
  const failEl = document.getElementById('death-failures');
  if (succEl) succEl.innerHTML = [0,1,2].map(i =>
    `<div class="death-pip${i < state.deathSaves.successes ? ' success-active' : ''}"
          data-action="deathSuccess" data-index="${i}" role="button" aria-label="Death save success ${i+1}"></div>`
  ).join('');
  if (failEl) failEl.innerHTML = [0,1,2].map(i =>
    `<div class="death-pip${i < state.deathSaves.failures ? ' fail-active' : ''}"
          data-action="deathFailure" data-index="${i}" role="button" aria-label="Death save failure ${i+1}"></div>`
  ).join('');

  const status = document.getElementById('death-status');
  if (status) {
    status.className = 'death-status';
    status.textContent = '';
    if (state.deathSaves.successes >= 3) { status.classList.add('stable'); status.textContent = '✦ Stabilized ✦'; }
    else if (state.deathSaves.failures >= 3) { status.classList.add('dead'); status.textContent = '✦ Dead ✦'; }
  }

  // Attacks & Spellcasting
  const atkList = document.getElementById('attacks-list');
  if (atkList) {
    const attacks = state.attacks || [];
    if (attacks.length === 0) {
      atkList.innerHTML = '<div class="empty-list">No attacks added yet</div>';
    } else {
      atkList.innerHTML = attacks.map((atk, i) => `
        <div class="list-entry">
          <span class="list-entry-name">${esc(atk.name || '')}</span>
          <span class="list-entry-detail">${esc(atk.bonus || '')}</span>
          <span class="list-entry-detail">${esc(atk.damage || '')}</span>
          <span class="list-entry-detail">${esc(atk.type || '')}</span>
          <button class="btn-remove" data-action="removeAttack" data-index="${i}" aria-label="Remove ${esc(atk.name || '')}">✕</button>
        </div>`).join('');
    }
  }

  // Equipment
  const equipList = document.getElementById('equipment-list');
  if (equipList) {
    const equipment = state.equipment || [];
    if (equipment.length === 0) {
      equipList.innerHTML = '<div class="empty-list">No equipment added yet</div>';
    } else {
      equipList.innerHTML = equipment.map((item, i) => `
        <div class="list-entry">
          <span class="list-entry-name">${esc(item.name || '')}</span>
          <span class="list-entry-qty">×${item.qty || 1}</span>
          <button class="btn-remove" data-action="removeEquipment" data-index="${i}" aria-label="Remove ${esc(item.name || '')}">✕</button>
        </div>`).join('');
    }
  }
}

export function updateProgression() {
  const level = state.character.level;
  const lv = document.getElementById('prog-level');
  const prof = document.getElementById('prog-prof');
  if (lv) lv.textContent = level;
  if (prof) prof.textContent = Logic.formatModifier(Logic.calcProficiencyBonus(level));

  const curXP = document.getElementById('xp-current');
  const nextXP = document.getElementById('xp-next');
  const bar = document.getElementById('xp-bar-fill');
  if (curXP) curXP.textContent = `${state.character.xp.toLocaleString()} Experience`;
  if (nextXP) nextXP.textContent = level >= 20 ? 'MAX LEVEL' : `Next: ${Logic.xpForNextLevel(level).toLocaleString()} Experience`;
  if (bar) bar.style.width = `${Logic.xpProgress(state.character.xp, level) * 100}%`;

  // Milestones
  const ms = document.getElementById('milestones');
  if (ms) {
    ms.innerHTML = RULES.XP_THRESHOLDS.map((xp, i) => {
      const lv = i + 1;
      const reached = state.character.xp >= xp;
      return `<div style="display:flex;justify-content:space-between;padding:6px 8px;font-size:var(--fs-sm);
                          color:${reached ? 'var(--accent)' : 'var(--text-muted)'}; border-bottom:1px solid var(--border)">
        <span>Level ${lv}</span><span>${xp.toLocaleString()} Experience</span>
      </div>`;
    }).join('');
  }
}

// ===== TOAST =====
let toastTimer;
export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2500);
}

// ===== UPDATE HEADER =====
export function updateHeader() {
  const logo = document.getElementById('char-logo');
  if (!logo) return;
  const name = state.character.name?.trim();
  if (name) {
    logo.textContent = name;
    logo.classList.add('animate-in');
  } else {
    logo.textContent = "D&D 5e Character Sheet";
    logo.classList.remove('animate-in');
  }
}

// ===== HELPERS =====
function esc(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
