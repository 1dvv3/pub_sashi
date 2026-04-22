// UI functions for DOM rendering and event handling for Sashi D&D Character Sheet
import { state, RULES } from './state.js';
import {
  calcModifier,
  adjustStat,
  applyRaceBonus,
  changeHP,
  setTempHP,
  addXP,
  recordDeathSave,
  resetDeathSaves,
  toggleSessionMode,
  saveState,
  loadState,
  clearState
} from './logic.js';

// DOM Elements
const tabs = {
  overview: document.querySelector('[data-tab="overview"]'),
  stats: document.querySelector('[data-tab="stats"]'),
  combat: document.querySelector('[data-tab="combat"]'),
  progression: document.querySelector('[data-tab="progression"]'),
  storage: document.querySelector('[data-tab="storage"]')
};

const tabContents = {
  overview: document.getElementById('overview-tab'),
  stats: document.getElementById('stats-tab'),
  combat: document.getElementById('combat-tab'),
  progression: document.getElementById('progression-tab'),
  storage: document.getElementById('storage-tab')
};

// Stats tab elements
const pointBuyRemainingEl = document.getElementById('point-buy-remaining');
const statsContainerEl = document.getElementById('stats-container');

// Combat tab elements
const acValueEl = document.getElementById('ac-value');
const initiativeValueEl = document.getElementById('initiative-value');
const speedValueEl = document.getElementById('speed-value');
const hpCurrentEl = document.getElementById('hp-current');
const hpMaxEl = document.getElementById('hp-max');
const tempHpEl = document.getElementById('temp-hp');
const hpHeal5Btn = document.getElementById('hp-heal-5');
const hpHeal2Btn = document.getElementById('hp-heal-2');
const hpDamage2Btn = document.getElementById('hp-damage-2');
const hpDamage5Btn = document.getElementById('hp-damage-5');
const tempHpInputEl = document.getElementById('temp-hp-input');
const setTempHpBtn = document.getElementById('set-temp-hp');

// Progression tab elements
const progLevelEl = document.getElementById('prog-level');
const progProficiencyEl = document.getElementById('prog-proficiency');
const progXpEl = document.getElementById('prog-xp');
const progXpNextEl = document.getElementById('prog-xp-next');
const deathSavesSuccessEl = document.getElementById('death-saves-success');
const deathSavesFailureEl = document.getElementById('death-saves-failure');
const deathSavesStatusEl = document.getElementById('death-saves-status');

// Storage tab elements
const sessionModeEl = document.getElementById('session-mode');
const toggleSessionModeBtn = document.getElementById('toggle-session-mode');
const saveCharacterBtn = document.getElementById('save-character');
const loadCharacterBtn = document.getElementById('load-character');
const clearCharacterBtn = document.getElementById('clear-character');
const exportJsonBtn = document.getElementById('export-json');
const importJsonInputEl = document.getElementById('import-json');
const importJsonBtn = document.getElementById('import-json-button');

// Overview tab elements (for future expansion)
const charNameEl = document.getElementById('char-name');
const charClassEl = document.getElementById('char-class');
const charLevelEl = document.getElementById('char-level');
const charBackgroundEl = document.getElementById('char-background');
const charRaceEl = document.getElementById('char-race');
const charAlignmentEl = document.getElementById('char-alignment');
const charXpEl = document.getElementById('char-xp');

// Initialize the UI
function initUI() {
  // Set up tab switching
  Object.keys(tabs).forEach(tabKey => {
    tabs[tabKey].addEventListener('click', () => switchTab(tabKey));
  });

  // Set up stat buttons (will be populated after rendering stats)
  // We'll set up event listeners for stats after rendering

  // Set up combat buttons
  hpHeal5Btn.addEventListener('click', () => changeHP(5));
  hpHeal2Btn.addEventListener('click', () => changeHP(2));
  hpDamage2Btn.addEventListener('click', () => changeHP(-2));
  hpDamage5Btn.addEventListener('click', () => changeHP(-5));
  setTempHpBtn.addEventListener('click', () => {
    const temp = parseInt(tempHpInputEl.value) || 0;
    setTempHP(temp);
    updateCombatTab();
  });

  // Set up storage buttons
  toggleSessionModeBtn.addEventListener('click', () => {
    toggleSessionMode();
    updateStorageTab();
  });
  saveCharacterBtn.addEventListener('click', () => {
    saveState();
    // Optionally show a success message
    alert('Character saved!');
  });
  loadCharacterBtn.addEventListener('click', () => {
    const loadedState = loadState();
    if (loadedState) {
      // In a real app, we would merge loaded state, but for now we just reload the page to reflect changes
      // For simplicity, we'll just alert and then reload the state from storage on next init
      alert('Character loaded! Please note: for simplicity, this demo requires a refresh to see changes. In a full app, we would update the state directly.');
    } else {
      alert('No saved character found.');
    }
  });
  clearCharacterBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the character? This cannot be undone.')) {
      clearState();
      // Reload the UI to reflect cleared state
      initUI(); // Re-initialize to reset the UI (this will call render functions)
    }
  });
  exportJsonBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'character.json';
    a.click();
    URL.revokeObjectURL(url);
  });
  importJsonBtn.addEventListener('click', () => {
    const file = importJsonInputEl.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedState = JSON.parse(e.target.result);
          // For simplicity, we replace the state (in a real app, we might validate and merge)
          Object.assign(state, loadedState);
          // Update the UI to reflect the new state
          updateAllTabs();
          alert('Character imported successfully!');
        } catch (err) {
          alert('Error parsing JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a JSON file to import.');
    }
  });

  // Initial render
  updateAllTabs();
}

// Switch tab function
function switchTab(tabKey) {
  // Deactivate all tabs and tab contents
  Object.keys(tabs).forEach(key => {
    tabs[key].classList.remove('active');
    tabContents[key].classList.remove('active');
  });
  // Activate the selected tab and its content
  tabs[tabKey].classList.add('active');
  tabContents[tabKey].classList.add('active');
}

// Update all tabs
function updateAllTabs() {
  updateOverviewTab();
  updateStatsTab();
  updateCombatTab();
  updateProgressionTab();
  updateStorageTab();
}

// Update Overview Tab (placeholder for now)
function updateOverviewTab() {
  charNameEl.textContent = state.name || 'Unnamed';
  charClassEl.textContent = state.characterClass || '---';
  charLevelEl.textContent = state.level;
  charBackgroundEl.textContent = state.background || '---';
  charRaceEl.textContent = state.race || '---';
  charAlignmentEl.textContent = state.alignment || '---';
  charXpEl.textContent = state.xp;
}

// Update Stats Tab (including point-buy and stat modifiers)
function updateStatsTab() {
  pointBuyRemainingEl.textContent = state.pointBuy.remaining;

  // Clear and rebuild stats container
  statsContainerEl.innerHTML = '';

  const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  stats.forEach(stat => {
    const statDiv = document.createElement('div');
    statDiv.className = 'stat';

    const label = document.createElement('label');
    label.textContent = stat;
    statDiv.appendChild(label);

    const value = document.createElement('span');
    value.className = 'stat-value';
    value.textContent = state.stats[stat];
    statDiv.appendChild(value);

    const modifier = document.createElement('span');
    modifier.className = 'stat-modifier';
    modifier.textContent = `(${calcModifier(state.stats[stat]) >= 0 ? '+' : ''}${calcModifier(state.stats[stat])})`;
    statDiv.appendChild(modifier);

    // Stepper buttons
    const minusBtn = document.createElement('button');
    minusBtn.textContent = '−';
    minusBtn.className = 'stat-stepper';
    minusBtn.addEventListener('click', () => {
      if (adjustStat(stat, -1)) {
        updateStatsTab();
        // Update dependent tabs (combat, progression) because modifiers affect AC, HP, etc.
        updateCombatTab();
        updateProgressionTab();
      }
    });
    statDiv.appendChild(minusBtn);

    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.className = 'stat-stepper';
    plusBtn.addEventListener('click', () => {
      if (adjustStat(stat, 1)) {
        updateStatsTab();
        updateCombatTab();
        updateProgressionTab();
      }
    });
    statDiv.appendChild(plusBtn);

    statsContainerEl.appendChild(statDiv);
  });
}

// Update Combat Tab
function updateCombatTab() {
  acValueEl.textContent = state.ac; // Note: AC calculation is not implemented yet; we'll just show state.ac
  initiativeValueEl.textContent = state.initiative;
  speedValueEl.textContent = `${state.speed} ft.`;
  hpCurrentEl.textContent = state.hp.current;
  hpMaxEl.textContent = state.hp.max;
  tempHpEl.textContent = state.hp.temp;

  // Update death saves status text (also shown in progression tab, but we can update here too if needed)
  // We'll leave the death saves status to the progression tab.
}

// Update Progression Tab
function updateProgressionTab() {
  progLevelEl.textContent = state.level;
  progProficiencyEl.textContent = `+${state.proficiencyBonus}`;
  progXpEl.textContent = state.xp;
  const nextLevelThreshold = RULES.xpThresholds[state.level] || 355000; // If level 20, use the last threshold
  progXpNextEl.textContent = nextLevelThreshold;
  deathSavesSuccessEl.textContent = state.deathSaves.success;
  deathSavesFailureEl.textContent = state.deathSaves.failure;

  // Update death saves status
  if (state.hp.current > 0) {
    deathSavesStatusEl.textContent = '';
    deathSavesStatusEl.className = '';
  } else {
    if (state.deathSaves.failure >= 3) {
      deathSavesStatusEl.textContent = 'DEAD';
      deathSavesStatusEl.className = 'dead';
    } else if (state.deathSaves.success >= 3) {
      deathSavesStatusEl.textContent = 'STABLE';
      deathSavesStatusEl.className = 'stable';
    } else {
      deathSavesStatusEl.textContent = 'DYING';
      deathSavesStatusEl.className = 'dying';
    }
  }
}

// Update Storage Tab
function updateStorageTab() {
  sessionModeEl.textContent = state.sessionMode.charAt(0).toUpperCase() + state.sessionMode.slice(1);
}