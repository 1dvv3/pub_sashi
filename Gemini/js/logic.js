// ===== PURE CALCULATION FUNCTIONS =====
import { RULES } from './state.js';

/** Ability modifier: floor((score - 10) / 2) */
export function calcModifier(score) {
  return Math.floor((score - 10) / 2);
}

/** Format modifier with sign: +2, -1, +0 */
export function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Total point-buy cost for current base stats */
export function calcPointsSpent(baseStats) {
  return RULES.STATS.reduce((sum, stat) => sum + (RULES.POINT_COSTS[baseStats[stat]] || 0), 0);
}

/** Remaining points from 27-point budget */
export function calcRemainingPoints(baseStats) {
  return RULES.POINT_BUY_BUDGET - calcPointsSpent(baseStats);
}

/** Get total stat score (base + race bonus) */
export function getTotalStat(baseStat, race, statKey) {
  const bonus = RULES.RACES[race]?.[statKey] || 0;
  return baseStat + bonus;
}

/** Get race bonus for a specific stat */
export function getRaceBonus(race, statKey) {
  return RULES.RACES[race]?.[statKey] || 0;
}

/** Determine level from XP */
export function calcLevel(xp) {
  for (let i = RULES.XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RULES.XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/** Proficiency bonus for a given level (1-indexed) */
export function calcProficiencyBonus(level) {
  return RULES.PROFICIENCY_BONUS[Math.max(0, Math.min(level - 1, 19))];
}

/** XP needed for next level */
export function xpForNextLevel(level) {
  if (level >= 20) return RULES.XP_THRESHOLDS[19];
  return RULES.XP_THRESHOLDS[level]; // level is 1-indexed, next level threshold
}

/** XP progress fraction toward next level (0-1) */
export function xpProgress(xp, level) {
  if (level >= 20) return 1;
  const current = RULES.XP_THRESHOLDS[level - 1];
  const next = RULES.XP_THRESHOLDS[level];
  if (next === current) return 1;
  return Math.min(1, (xp - current) / (next - current));
}

/** Calculate max HP: level 1 = hitDie + CON mod, level 2+ = avg die roll + CON mod per level */
export function calcMaxHP(className, level, conScore) {
  const hitDie = RULES.CLASSES[className]?.hitDie || 0;
  if (hitDie === 0 || level === 0) return 0;
  const conMod = calcModifier(conScore);
  const avgRoll = Math.ceil(hitDie / 2) + 1; // average rounded up
  let hp = hitDie + conMod; // level 1
  for (let i = 2; i <= level; i++) {
    hp += avgRoll + conMod;
  }
  return Math.max(1, hp);
}

/** Skill modifier: stat modifier + proficiency bonus if proficient */
export function calcSkillModifier(statScore, proficient, profBonus) {
  const mod = calcModifier(statScore);
  return proficient ? mod + profBonus : mod;
}

/** Clamp a value between min and max */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Check if stat can be incremented */
export function canIncrement(baseStats, statKey) {
  if (baseStats[statKey] >= RULES.STAT_MAX) return false;
  const nextCost = RULES.POINT_COSTS[baseStats[statKey] + 1] - RULES.POINT_COSTS[baseStats[statKey]];
  return calcRemainingPoints(baseStats) >= nextCost;
}

/** Check if stat can be decremented */
export function canDecrement(baseStats, statKey) {
  return baseStats[statKey] > RULES.STAT_MIN;
}

/** Calculate initiative (DEX modifier) */
export function calcInitiative(dexScore) {
  return calcModifier(dexScore);
}
