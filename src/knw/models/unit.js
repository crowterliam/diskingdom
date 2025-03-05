/**
 * Unit model for Kingdoms & Warfare
 * Represents military units in warfare
 */

import { v4 as uuidv4 } from 'uuid';

// Unit types
export const UNIT_TYPES = {
  INFANTRY: 'infantry',
  CAVALRY: 'cavalry',
  ARTILLERY: 'artillery',
  AERIAL: 'aerial',
};

// Unit tiers
export const UNIT_TIERS = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
};

// Unit conditions
export const UNIT_CONDITIONS = {
  BROKEN: 'broken',
  DISBANDED: 'disbanded',
  DISORGANIZED: 'disorganized',
  DISORIENTED: 'disoriented',
  EXPOSED: 'exposed',
  HIDDEN: 'hidden',
  MISLED: 'misled',
  WEAKENED: 'weakened',
};

/**
 * Create a new unit
 * @param {Object} options - Unit options
 * @param {String} options.name - Unit name
 * @param {String} options.type - Unit type
 * @param {Number} options.tier - Unit tier
 * @param {Number} options.attack - Attack bonus
 * @param {Number} options.power - Power bonus
 * @param {Number} options.defense - Defense score
 * @param {Number} options.toughness - Toughness score
 * @param {Number} options.morale - Morale score
 * @param {Number} options.command - Command bonus
 * @returns {Object} - New unit
 */
export function createUnit({
  name,
  type = UNIT_TYPES.INFANTRY,
  tier = UNIT_TIERS.I,
  attack = 0,
  power = 0,
  defense = 10,
  toughness = 10,
  morale = 10,
  command = 0,
}) {
  // Calculate derived stats based on tier and type
  const attacks = calculateAttacks(tier, type);
  const damage = calculateDamage(tier, type);
  const casualtyDieMax = calculateCasualtyDie(tier, type);
  
  return {
    id: uuidv4(),
    name,
    type,
    tier,
    stats: {
      attack,
      power,
      defense,
      toughness,
      morale,
      command,
      attacks,
      damage,
    },
    casualtyDie: {
      current: casualtyDieMax,
      max: casualtyDieMax,
    },
    traits: [],
    conditions: [],
    experience: 0,
    battles: 0,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

/**
 * Calculate the number of attacks for a unit
 * @param {Number} tier - Unit tier
 * @param {String} type - Unit type
 * @returns {Number} - Number of attacks
 */
function calculateAttacks(tier, type) {
  // Base attacks by tier
  const baseAttacks = {
    [UNIT_TIERS.I]: 1,
    [UNIT_TIERS.II]: 1,
    [UNIT_TIERS.III]: 2,
    [UNIT_TIERS.IV]: 2,
    [UNIT_TIERS.V]: 3,
  };
  
  // Type modifiers
  const typeModifiers = {
    [UNIT_TYPES.INFANTRY]: 0,
    [UNIT_TYPES.CAVALRY]: 0,
    [UNIT_TYPES.ARTILLERY]: -1,
    [UNIT_TYPES.AERIAL]: 0,
  };
  
  // Calculate attacks
  let attacks = baseAttacks[tier] || 1;
  attacks += typeModifiers[type] || 0;
  
  // Minimum of 1 attack
  return Math.max(1, attacks);
}

/**
 * Calculate the damage for a unit
 * @param {Number} tier - Unit tier
 * @param {String} type - Unit type
 * @returns {Number} - Damage
 */
function calculateDamage(tier, type) {
  // Base damage by tier
  const baseDamage = {
    [UNIT_TIERS.I]: 1,
    [UNIT_TIERS.II]: 1,
    [UNIT_TIERS.III]: 2,
    [UNIT_TIERS.IV]: 2,
    [UNIT_TIERS.V]: 3,
  };
  
  // Type modifiers
  const typeModifiers = {
    [UNIT_TYPES.INFANTRY]: 0,
    [UNIT_TYPES.CAVALRY]: 1,
    [UNIT_TYPES.ARTILLERY]: 1,
    [UNIT_TYPES.AERIAL]: 0,
  };
  
  // Calculate damage
  let damage = baseDamage[tier] || 1;
  damage += typeModifiers[type] || 0;
  
  return damage;
}

/**
 * Calculate the casualty die for a unit
 * @param {Number} tier - Unit tier
 * @param {String} type - Unit type
 * @returns {Number} - Casualty die
 */
function calculateCasualtyDie(tier, type) {
  // Base casualty die by tier
  const baseCasualtyDie = {
    [UNIT_TIERS.I]: 1,
    [UNIT_TIERS.II]: 2,
    [UNIT_TIERS.III]: 3,
    [UNIT_TIERS.IV]: 4,
    [UNIT_TIERS.V]: 5,
  };
  
  // Type modifiers
  const typeModifiers = {
    [UNIT_TYPES.INFANTRY]: 0,
    [UNIT_TYPES.CAVALRY]: 0,
    [UNIT_TYPES.ARTILLERY]: -1,
    [UNIT_TYPES.AERIAL]: -1,
  };
  
  // Calculate casualty die
  let casualtyDie = baseCasualtyDie[tier] || 1;
  casualtyDie += typeModifiers[type] || 0;
  
  // Minimum of 1 casualty die
  return Math.max(1, casualtyDie);
}

/**
 * Add a trait to a unit
 * @param {Object} unit - Unit to modify
 * @param {String} trait - Trait to add
 * @returns {Object} - Updated unit
 */
export function addTrait(unit, trait) {
  if (!unit.traits.includes(trait)) {
    return {
      ...unit,
      traits: [...unit.traits, trait],
      updated: new Date().toISOString(),
    };
  }
  
  return unit;
}

/**
 * Remove a trait from a unit
 * @param {Object} unit - Unit to modify
 * @param {String} trait - Trait to remove
 * @returns {Object} - Updated unit
 */
export function removeTrait(unit, trait) {
  return {
    ...unit,
    traits: unit.traits.filter(t => t !== trait),
    updated: new Date().toISOString(),
  };
}

/**
 * Add a condition to a unit
 * @param {Object} unit - Unit to modify
 * @param {String} condition - Condition to add
 * @returns {Object} - Updated unit
 */
export function addCondition(unit, condition) {
  if (!unit.conditions.includes(condition)) {
    return {
      ...unit,
      conditions: [...unit.conditions, condition],
      updated: new Date().toISOString(),
    };
  }
  
  return unit;
}

/**
 * Remove a condition from a unit
 * @param {Object} unit - Unit to modify
 * @param {String} condition - Condition to remove
 * @returns {Object} - Updated unit
 */
export function removeCondition(unit, condition) {
  return {
    ...unit,
    conditions: unit.conditions.filter(c => c !== condition),
    updated: new Date().toISOString(),
  };
}

/**
 * Take casualties on a unit
 * @param {Object} unit - Unit to modify
 * @param {Number} casualties - Number of casualties to take
 * @returns {Object} - Updated unit
 */
export function takeCasualties(unit, casualties) {
  const newCasualtyDie = Math.max(0, unit.casualtyDie.current - casualties);
  
  // Check if the unit is broken
  const isBroken = newCasualtyDie === 0;
  
  const updatedUnit = {
    ...unit,
    casualtyDie: {
      ...unit.casualtyDie,
      current: newCasualtyDie,
    },
    updated: new Date().toISOString(),
  };
  
  // Add the broken condition if the unit is broken
  if (isBroken && !unit.conditions.includes(UNIT_CONDITIONS.BROKEN)) {
    updatedUnit.conditions = [...updatedUnit.conditions, UNIT_CONDITIONS.BROKEN];
  }
  
  return updatedUnit;
}

/**
 * Rally a unit to recover casualties
 * @param {Object} unit - Unit to modify
 * @param {Number} casualties - Number of casualties to recover
 * @returns {Object} - Updated unit
 */
export function rallyCasualties(unit, casualties) {
  const newCasualtyDie = Math.min(unit.casualtyDie.max, unit.casualtyDie.current + casualties);
  
  const updatedUnit = {
    ...unit,
    casualtyDie: {
      ...unit.casualtyDie,
      current: newCasualtyDie,
    },
    updated: new Date().toISOString(),
  };
  
  // Remove the broken condition if the unit is no longer broken
  if (newCasualtyDie > 0 && unit.conditions.includes(UNIT_CONDITIONS.BROKEN)) {
    updatedUnit.conditions = updatedUnit.conditions.filter(c => c !== UNIT_CONDITIONS.BROKEN);
  }
  
  return updatedUnit;
}

/**
 * Add experience to a unit
 * @param {Object} unit - Unit to modify
 * @param {Number} experience - Experience to add
 * @returns {Object} - Updated unit
 */
export function addExperience(unit, experience) {
  return {
    ...unit,
    experience: unit.experience + experience,
    updated: new Date().toISOString(),
  };
}

/**
 * Add a battle to a unit's record
 * @param {Object} unit - Unit to modify
 * @returns {Object} - Updated unit
 */
export function addBattle(unit) {
  return {
    ...unit,
    battles: unit.battles + 1,
    updated: new Date().toISOString(),
  };
}
