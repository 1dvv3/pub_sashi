// Pure functions and state mutators for Sashi D&D Character Sheet
import { state, RULES } from './state.js';

/**
 * Calculate the modifier for a given ability score.
 * @param {number} score - Ability score (typically 3-30)
 * @returns {number} Modifier (floor((score - 10) / 2))
 */
export function calcModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Adjust an ability score during point-buy phase.
 * This function respects point-buy costs and the 8-15 range for point-buy.
 * @param {string} stat - The stat to adjust (STR, DEX, CON, INT, WIS, CHA)
 * @param {number} amount - The amount to adjust (typically -1 or +1)
 * @returns {boolean} True if the adjustment was successful, false otherwise
 */
export function adjustStat(stat, amount) {
  // Only allow adjustments during point-buy (when pointBuy.remaining > 0 or adjusting within pool)
  // We allow decreasing any time to refund points, but increasing only if we have points.
  const currentScore = state.stats[stat];
  const newScore = currentScore + amount;

  // Check bounds: point-buy allows 8 to 15, but note that after point-buy we can go beyond via racial bonuses.
  // This function is intended for point-buy adjustment, so we enforce 8-15.
  if (newScore < 8 || newScore > 15) {
    return false;
  }

  // Calculate point-buy cost difference
  const currentCost = RULES.pointBuyCosts[currentScore] || 0;
  const newCost = RULES.pointBuyCosts[newScore] || 0;
  const costDifference = newCost - currentCost;

  // Check if we have enough points for increasing, or if decreasing we refund points
  if (amount > 0 && state.pointBuy.remaining < costDifference) {
    return false; // Not enough points
  }

  // Apply the adjustment
  state.stats[stat] = newScore;
  state.pointBuy.remaining -= costDifference;
  state.pointBuy.used = -state.pointBuy.remaining + 27; // Alternatively, track used separately

  return true;
}

/**
 * Apply racial bonuses to stats.
 * This function is used after point-buy is complete and can push stats beyond 15.
 * @param {Object} raceBonus - An object with stat bonuses, e.g., { STR: 2, DEX: 1 }
 */
export function applyRaceBonus(raceBonus) {
  for (const [stat, bonus] of Object.entries(raceBonus)) {
    if (state.stats.hasOwnProperty(stat)) {
      state.stats[stat] += bonus;
    }
  }
}

/**
 * Calculate hit points based on constitution and level.
 * @returns {number} Maximum HP
 */
export function calculateMaxHP() {
  const conModifier = calcModifier(state.stats.CON);
  // Assume hit die is d8 for simplicity (can be made configurable by class later)
  const hitDie = 8;
  return state.level * (hitDie + conModifier);
}

/**
 * Update current HP, respecting maximum and temporary HP.
 * @param {number} change - Amount to change HP (positive for healing, negative for damage)
 */
export function changeHP(change) {
  // Apply temporary HP first
  if (change < 0 && state.hp.temp > 0) {
    // If we have temp HP, absorb damage there first
    if (Math.abs(change) <= state.hp.temp) {
      state.hp.temp += change; // change is negative
      return;
    } else {
      // Damage exceeds temp HP, reduce temp HP to zero and apply rest to real HP
      change += state.hp.temp; // change is negative, adding a negative reduces the magnitude
      state.hp.temp = 0;
    }
  }

  // Now apply change to real HP
  let newHP = state.hp.current + change;
  // Clamp between 0 and max HP
  newHP = Math.max(0, Math.min(state.hp.max, newHP));
  state.hp.current = newHP;
}

/**
 * Update temporary HP.
 * @param {number} temp - Temporary HP to set (replaces current temp HP)
 */
export function setTempHP(temp) {
  state.hp.temp = Math.max(0, temp); // Temp HP can't be negative
}

/**
 * Add experience points and check for level up.
 * @param {number} xpGain - Amount of XP to add
 */
export function addXP(xpGain) {
  state.xp += xpGain;
  // Check for level up
  const currentLevel = state.level;
  const newLevel = RULES.xpThresholds.findIndex(threshold => threshold > state.xp);
  // If the XP is beyond the last threshold, cap at level 20
  let level = newLevel === -1 ? 20 : newLevel;
  // Ensure we don't exceed level 20
  if (level > 20) level = 20;

  if (level > state.level) {
    state.level = level;
    state.proficiencyBonus = RULES.proficiencyBonus[level];
    // Recalculate max HP when leveling up
    state.hp.max = calculateMaxHP();
    // If current HP is greater than new max, clamp it
    if (state.hp.current > state.hp.max) {
      state.hp.current = state.hp.max;
    }
  }
}

/**
 * Record a death save success or failure.
 * @param {string} type - Either 'success' or 'failure'
 */
export function recordDeathSave(type) {
  if (type === 'success') {
    state.deathSaves.success = Math.min(state.deathSaves.success + 1, 3);
  } else if (type === 'failure') {
    state.deathSaves.failure = Math.min(state.deathSaves.failure + 1, 3);
  }
}

/**
 * Reset death saves (when HP > 0).
 */
export function resetDeathSaves() {
  if (state.hp.current > 0) {
    state.deathSaves.success = 0;
    state.deathSaves.failure = 0;
  }
}

/**
 * Toggle session mode between campaign and one-shot.
 */
export function toggleSessionMode() {
  state.sessionMode = state.sessionMode === 'campaign' ? 'one-shot' : 'campaign';
}

/**
 * Save state to appropriate storage based on session mode.
 * (This is a stub; actual implementation will be in state.js or here later)
 */
export function saveState() {
  // TODO: Implement actual saving
  console.log('Saving state for session mode:', state.sessionMode);
}

/**
 * Load state from appropriate storage based on session mode.
 * (This is a stub; actual implementation will be in state.js or here later)
 * @returns {Object} The loaded state
 */
export function loadState() {
  // TODO: Implement actual loading
  console.log('Loading state for session mode:', state.sessionMode);
  return state; // For now, return current state
}

/**
 * Clear state based on session mode.
 */
export function clearState() {
  if (state.sessionMode === 'one-shot') {
    // Reset to initial state for one-shot
    // We'll need a function to reset state to initial values
    console.log('Clearing one-shot state');
    // For now, we just reset the main counters; a full reset would be more complex
    state.hp.current = state.hp.max;
    state.hp.temp = 0;
    state.deathSaves.success = 0;
    state.deathSaves.failure = 0;
    state.xp = 0;
    state.level = 1;
    state.proficiencyBonus = 2;
    // Note: stats and pointBuy are not reset here for simplicity; in a full reset we would.
  } else {
    // For campaign, we might want to clear the current character but keep others?
    // Since we only support one character for now, we reset.
    console.log('Clearing campaign state (not implemented fully)');
  }
}