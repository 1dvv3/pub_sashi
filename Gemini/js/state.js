// ===== D&D 5e RULES CONSTANTS =====
export const RULES = {
  STATS: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
  STAT_NAMES: {
    STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution',
    INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma'
  },
  POINT_BUY_BUDGET: 27,
  STAT_MIN: 8,
  STAT_MAX: 15,
  POINT_COSTS: { 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9 },
  XP_THRESHOLDS: [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ],
  PROFICIENCY_BONUS: [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6],
  RACES: {
    'None':             { STR:0, DEX:0, CON:0, INT:0, WIS:0, CHA:0 },
    'Human':            { STR:1, DEX:1, CON:1, INT:1, WIS:1, CHA:1 },
    'Dwarf (Hill)':     { STR:0, DEX:0, CON:2, INT:0, WIS:1, CHA:0 },
    'Dwarf (Mountain)': { STR:2, DEX:0, CON:2, INT:0, WIS:0, CHA:0 },
    'Elf (High)':       { STR:0, DEX:2, CON:0, INT:1, WIS:0, CHA:0 },
    'Elf (Wood)':       { STR:0, DEX:2, CON:0, INT:0, WIS:1, CHA:0 },
    'Halfling (Lightfoot)': { STR:0, DEX:2, CON:0, INT:0, WIS:0, CHA:1 },
    'Halfling (Stout)':     { STR:0, DEX:2, CON:1, INT:0, WIS:0, CHA:0 },
    'Dragonborn':       { STR:2, DEX:0, CON:0, INT:0, WIS:0, CHA:1 },
    'Gnome (Forest)':   { STR:0, DEX:1, CON:0, INT:2, WIS:0, CHA:0 },
    'Gnome (Rock)':     { STR:0, DEX:0, CON:1, INT:2, WIS:0, CHA:0 },
    'Half-Elf':         { STR:0, DEX:1, CON:1, INT:0, WIS:0, CHA:2 },
    'Half-Orc':         { STR:2, DEX:0, CON:1, INT:0, WIS:0, CHA:0 },
    'Tiefling':         { STR:0, DEX:0, CON:0, INT:1, WIS:0, CHA:2 }
  },
  CLASSES: {
    'None':       { hitDie: 0 },
    'Barbarian':  { hitDie: 12 },
    'Bard':       { hitDie: 8 },
    'Cleric':     { hitDie: 8 },
    'Druid':      { hitDie: 8 },
    'Fighter':    { hitDie: 10 },
    'Monk':       { hitDie: 8 },
    'Paladin':    { hitDie: 10 },
    'Ranger':     { hitDie: 10 },
    'Rogue':      { hitDie: 8 },
    'Sorcerer':   { hitDie: 6 },
    'Warlock':    { hitDie: 8 },
    'Wizard':     { hitDie: 6 }
  },
  SKILLS: {
    'Acrobatics': 'DEX', 'Animal Handling': 'WIS', 'Arcana': 'INT',
    'Athletics': 'STR', 'Deception': 'CHA', 'History': 'INT',
    'Insight': 'WIS', 'Intimidation': 'CHA', 'Investigation': 'INT',
    'Medicine': 'WIS', 'Nature': 'INT', 'Perception': 'WIS',
    'Performance': 'CHA', 'Persuasion': 'CHA', 'Religion': 'INT',
    'Sleight of Hand': 'DEX', 'Stealth': 'DEX', 'Survival': 'WIS'
  }
};

// ===== DEFAULT STATE =====
function createDefaultState() {
  const skills = {};
  Object.keys(RULES.SKILLS).forEach(s => skills[s] = false);
  return {
    character: { name: '', race: 'None', class: 'None', level: 1, xp: 0 },
    baseStats: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
    hp: { current: 0, max: 0, temp: 0 },
    ac: 10,
    speed: 30,
    deathSaves: { successes: 0, failures: 0 },
    skills,
    // Overview – optional identity fields
    proficiencies: '',
    languages: '',
    dciNumber: '',
    faction: '',
    // Overview – character personality / roleplay
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    featuresTraits: '',
    // Combat – attacks & spellcasting list
    attacks: [],   // [{name, bonus, damage, type}]
    // Combat – equipment list
    equipment: [],  // [{name, qty}]
    notes: '',
    sessionMode: 'campaign',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
}

export let state = createDefaultState();

// ===== PERSISTENCE =====
const STORAGE_KEY = 'dnd_character';

export function saveState() {
  state.lastModified = new Date().toISOString();
  const storage = state.sessionMode === 'campaign' ? localStorage : sessionStorage;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save failed:', e);
  }
}

function mergeState(parsed) {
  const def = createDefaultState();
  return {
    ...def,
    ...parsed,
    character: { ...def.character, ...(parsed.character || {}) },
    baseStats: { ...def.baseStats, ...(parsed.baseStats || {}) },
    hp: { ...def.hp, ...(parsed.hp || {}) },
    deathSaves: { ...def.deathSaves, ...(parsed.deathSaves || {}) },
    skills: { ...def.skills, ...(parsed.skills || {}) },
    attacks: Array.isArray(parsed.attacks) ? parsed.attacks : def.attacks,
    equipment: Array.isArray(parsed.equipment) ? parsed.equipment : def.equipment
  };
}

export function loadState() {
  let data = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      state = mergeState(parsed);
    } catch (e) {
      console.error('Load failed:', e);
      state = createDefaultState();
    }
  } else {
    state = createDefaultState();
  }
  return state;
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  return state;
}

export function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${state.character.name || 'sheet'}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        state = mergeState(parsed);
        saveState();
        resolve(state);
      } catch (err) {
        reject(new Error('Invalid character file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
