// ===== APP INITIALIZATION & EVENT HANDLING =====
import { state, RULES, saveState, loadState, resetState, exportJSON, importJSON } from './state.js';
import * as Logic from './logic.js';
import { initUI, switchTab, updateAll, updateStats, updateCombat, updateOverview, updateProgression, showToast } from './ui.js';

function init() {
  loadState();
  recalcDerived();
  initUI();
  bindEvents();
}

/** Recalculate level, HP max, and other derived values */
function recalcDerived() {
  state.character.level = Logic.calcLevel(state.character.xp);
  const conTotal = Logic.getTotalStat(state.baseStats.CON, state.character.race, 'CON');
  const calculatedMax = Logic.calcMaxHP(state.character.class, state.character.level, conTotal);
  // Only auto-set HP max if class is selected
  if (state.character.class !== 'None' && calculatedMax > 0) {
    const oldMax = state.hp.max;
    state.hp.max = calculatedMax;
    // If HP was at old max or this is first calculation, set current to max
    if (state.hp.current === 0 || state.hp.current === oldMax) {
      state.hp.current = state.hp.max;
    }
    state.hp.current = Logic.clamp(state.hp.current, 0, state.hp.max);
  }
}

function bindEvents() {
  // Tab bar clicks
  document.getElementById('tab-bar').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (btn) switchTab(btn.dataset.tab);
  });

  const main = document.getElementById('main-content');

  // Click delegation
  main.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case 'incStat': {
        const stat = el.dataset.stat;
        if (Logic.canIncrement(state.baseStats, stat)) {
          state.baseStats[stat]++;
          recalcDerived();
          saveState();
          updateStats();
          updateOverview();
          updateCombat();
        }
        break;
      }
      case 'decStat': {
        const stat = el.dataset.stat;
        if (Logic.canDecrement(state.baseStats, stat)) {
          state.baseStats[stat]--;
          recalcDerived();
          saveState();
          updateStats();
          updateOverview();
          updateCombat();
        }
        break;
      }
      case 'damage': {
        const amount = parseInt(document.getElementById('hp-amount')?.value) || 0;
        if (amount <= 0) return;
        // Absorb temp HP first
        if (state.hp.temp > 0) {
          const absorbed = Math.min(state.hp.temp, amount);
          state.hp.temp -= absorbed;
          const remaining = amount - absorbed;
          state.hp.current = Logic.clamp(state.hp.current - remaining, 0, state.hp.max);
          document.getElementById('temp-hp').value = state.hp.temp;
        } else {
          state.hp.current = Logic.clamp(state.hp.current - amount, 0, state.hp.max);
        }
        saveState();
        updateCombat();
        updateOverview();
        showToast(`Took ${amount} damage`, 'error');
        break;
      }
      case 'heal': {
        const amount = parseInt(document.getElementById('hp-amount')?.value) || 0;
        if (amount <= 0) return;
        state.hp.current = Logic.clamp(state.hp.current + amount, 0, state.hp.max);
        // Reset death saves on heal from 0
        if (state.hp.current > 0) {
          state.deathSaves.successes = 0;
          state.deathSaves.failures = 0;
        }
        saveState();
        updateCombat();
        updateOverview();
        showToast(`Healed ${amount} HP`, 'success');
        break;
      }
      case 'deathSuccess': {
        const idx = parseInt(el.dataset.index);
        state.deathSaves.successes = state.deathSaves.successes === idx + 1 ? idx : idx + 1;
        saveState();
        updateCombat();
        if (state.deathSaves.successes >= 3) showToast('Stabilized!', 'success');
        break;
      }
      case 'deathFailure': {
        const idx = parseInt(el.dataset.index);
        state.deathSaves.failures = state.deathSaves.failures === idx + 1 ? idx : idx + 1;
        saveState();
        updateCombat();
        if (state.deathSaves.failures >= 3) showToast('Character has died.', 'error');
        break;
      }
      case 'addXP': {
        const amount = parseInt(document.getElementById('xp-amount')?.value) || 0;
        if (amount <= 0) return;
        const oldLevel = state.character.level;
        state.character.xp = Logic.clamp(state.character.xp + amount, 0, 355000);
        recalcDerived();
        saveState();
        updateProgression();
        updateOverview();
        updateCombat();
        if (state.character.level > oldLevel) {
          showToast(`Level up! Now level ${state.character.level}`, 'success');
        } else {
          showToast(`+${amount} XP`, 'success');
        }
        break;
      }
      case 'setXP': {
        const amount = parseInt(document.getElementById('xp-amount')?.value) || 0;
        state.character.xp = Logic.clamp(amount, 0, 355000);
        recalcDerived();
        saveState();
        updateProgression();
        updateOverview();
        updateCombat();
        showToast(`XP set to ${state.character.xp.toLocaleString()}`, 'success');
        break;
      }
      case 'setMode': {
        const oldMode = state.sessionMode;
        const newMode = el.dataset.mode;
        if (oldMode === newMode) return;
        // Clear old storage
        if (oldMode === 'campaign') localStorage.removeItem('sashi_character');
        else sessionStorage.removeItem('sashi_character');
        state.sessionMode = newMode;
        saveState();
        // Update toggle UI
        document.querySelectorAll('.toggle-option').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.mode === newMode);
        });
        const desc = document.getElementById('mode-desc');
        if (desc) desc.textContent = newMode === 'campaign'
          ? 'Character persists between sessions (localStorage).'
          : 'Character cleared when tab closes (sessionStorage).';
        showToast(`Switched to ${newMode} mode`);
        break;
      }
      case 'export': {
        exportJSON();
        showToast('Character exported!', 'success');
        break;
      }
      case 'addAttack': {
        const name = document.getElementById('atk-name')?.value.trim();
        if (!name) { showToast('Enter attack name', 'error'); break; }
        const bonus = document.getElementById('atk-bonus')?.value.trim() || '';
        const damage = document.getElementById('atk-damage')?.value.trim() || '';
        const type = document.getElementById('atk-type')?.value.trim() || '';
        if (!state.attacks) state.attacks = [];
        state.attacks.push({ name, bonus, damage, type });
        saveState();
        updateCombat();
        document.getElementById('atk-name').value = '';
        document.getElementById('atk-bonus').value = '';
        document.getElementById('atk-damage').value = '';
        document.getElementById('atk-type').value = '';
        showToast(`Added ${name}`, 'success');
        break;
      }
      case 'removeAttack': {
        const idx = parseInt(el.dataset.index);
        if (!state.attacks) state.attacks = [];
        const removed = state.attacks.splice(idx, 1);
        saveState();
        updateCombat();
        showToast(`Removed ${removed[0]?.name || 'attack'}`, 'error');
        break;
      }
      case 'addEquipment': {
        const name = document.getElementById('equip-name')?.value.trim();
        if (!name) { showToast('Enter item name', 'error'); break; }
        const qty = parseInt(document.getElementById('equip-qty')?.value) || 1;
        if (!state.equipment) state.equipment = [];
        state.equipment.push({ name, qty });
        saveState();
        updateCombat();
        document.getElementById('equip-name').value = '';
        document.getElementById('equip-qty').value = '1';
        showToast(`Added ${name}`, 'success');
        break;
      }
      case 'removeEquipment': {
        const idx = parseInt(el.dataset.index);
        if (!state.equipment) state.equipment = [];
        const removed = state.equipment.splice(idx, 1);
        saveState();
        updateCombat();
        showToast(`Removed ${removed[0]?.name || 'item'}`, 'error');
        break;
      }
      case 'reset': {
        if (confirm('Are you sure you want to reset this character? This cannot be undone.')) {
          resetState();
          recalcDerived();
          initUI();
          showToast('Character reset', 'error');
        }
        break;
      }
    }
  });

  // Change delegation (selects, checkboxes)
  main.addEventListener('change', (e) => {
    const el = e.target;

    if (el.dataset.field === 'race') {
      state.character.race = el.value;
      recalcDerived();
      saveState();
      updateAll();
      showToast(`Race: ${el.value}`);
    }
    else if (el.dataset.field === 'class') {
      state.character.class = el.value;
      recalcDerived();
      saveState();
      updateAll();
      showToast(`Class: ${el.value}`);
    }
    else if (el.dataset.action === 'toggleSkill') {
      state.skills[el.dataset.skill] = el.checked;
      saveState();
      updateStats();
    }
    else if (el.id === 'import-file' && el.files.length > 0) {
      importJSON(el.files[0]).then(() => {
        recalcDerived();
        initUI();
        showToast('Character imported!', 'success');
      }).catch(err => {
        showToast(err.message, 'error');
      });
    }
  });

  // Input delegation (text fields, number inputs)
  // Fields that map directly to top-level state keys via data-field
  const DIRECT_FIELDS = ['notes','proficiencies','languages','dciNumber','faction',
                         'personalityTraits','ideals','bonds','flaws','featuresTraits'];

  main.addEventListener('input', (e) => {
    const el = e.target;

    if (el.dataset.field === 'name') {
      state.character.name = el.value;
      saveState();
    }
    else if (el.dataset.field && DIRECT_FIELDS.includes(el.dataset.field)) {
      state[el.dataset.field] = el.value;
      saveState();
    }
    else if (el.id === 'ac-input') {
      state.ac = Logic.clamp(parseInt(el.value) || 10, 1, 30);
      const display = document.getElementById('combat-ac');
      if (display) display.textContent = state.ac;
      saveState();
    }
    else if (el.id === 'speed-input') {
      state.speed = Logic.clamp(parseInt(el.value) || 30, 0, 120);
      const display = document.getElementById('combat-speed');
      if (display) display.textContent = state.speed;
      saveState();
    }
    else if (el.id === 'temp-hp') {
      state.hp.temp = Logic.clamp(parseInt(el.value) || 0, 0, 999);
      saveState();
    }
  });

}

document.addEventListener('DOMContentLoaded', init);
