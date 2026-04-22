// Central state object and RULES constants for Sashi D&D Character Sheet

// RULES constants
const RULES = {
  // Point Buy costs for scores 8-15 (standard 5e point buy)
  pointBuyCosts: {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9
  },

  // XP thresholds for levels 1-20
  xpThresholds: [
    0,      // Level 1
    300,    // Level 2
    900,    // Level 3
    2700,   // Level 4
    6500,   // Level 5
    14000,  // Level 6
    23000,  // Level 7
    34000,  // Level 8
    48000,  // Level 9
    64000,  // Level 10
    85000,  // Level 11
    100000, // Level 12
    120000, // Level 13
    140000, // Level 14
    165000, // Level 15
    195000, // Level 16
    225000, // Level 17
    265000, // Level 18
    305000, // Level 19
    355000  // Level 20
  ],

  // Proficiency bonus by level
  proficiencyBonus: {
    1: 2, 2: 2, 3: 2, 4: 2, 5: 3,
    6: 3, 7: 3, 8: 3, 9: 4, 10: 4,
    11: 4, 12: 4, 13: 5, 14: 5, 15: 5,
    16: 5, 17: 6, 18: 6, 19: 6, 20: 6
  }
};

// Central state object
const state = {
  // Character stats (STR, DEX, CON, INT, WIS, CHA)
  stats: {
    STR: 8,
    DEX: 8,
    CON: 8,
    INT: 8,
    WIS: 8,
    CHA: 8
  },

  // Hit Points
  hp: {
    current: 10,
    max: 10,
    temp: 0
  },

  // Armor Class
  ac: 10,

  // Initiative
  initiative: 0,

  // Speed
  speed: 30,

  // Proficiency and Level
  proficiencyBonus: 2,
  level: 1,
  xp: 0,

  // Death Saves
  deathSaves: {
    success: 0,
    failure: 0
  },

  // Point Buy tracking
  pointBuy: {
    remaining: 27,
    used: 0
  },

  // Session mode: 'campaign' (persistent) or 'one-shot' (temporary)
  sessionMode: 'campaign'
};

// Storage functions (to be implemented in Phase 3)
function saveState() {
  // TODO: Implement saving to localStorage (campaign) or sessionStorage (one-shot)
  console.log('Save state function called');
}

function loadState() {
  // TODO: Implement loading from storage
  console.log('Load state function called');
  return state; // Return current state for now
}

function clearState() {
  // TODO: Implement clearing state based on session mode
  console.log('Clear state function called');
}

// Export for use in other modules (if using ES6 modules)
// In a real ES6 module, we would export these, but for simplicity in this project,
// we'll attach to window for global access in the browser.
// However, note that we are using type="module" in app.js, so we should use ES6 exports.

// Since we are creating a module, we'll export the state and RULES
export { state, RULES, saveState, loadState, clearState };