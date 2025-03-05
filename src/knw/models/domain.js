/**
 * Domain model for Kingdoms & Warfare
 * Represents political domains in intrigue
 */

import { v4 as uuidv4 } from 'uuid';

// Domain skills
export const DOMAIN_SKILLS = {
  DIPLOMACY: 'diplomacy',
  ESPIONAGE: 'espionage',
  LORE: 'lore',
  OPERATIONS: 'operations',
};

// Domain defenses
export const DOMAIN_DEFENSES = {
  COMMUNICATIONS: 'communications',
  RESOLVE: 'resolve',
  RESOURCES: 'resources',
};

// Domain sizes and their corresponding dice
export const DOMAIN_SIZES = {
  1: { name: 'Small', die: 'd4' },
  2: { name: 'Medium', die: 'd6' },
  3: { name: 'Large', die: 'd8' },
  4: { name: 'Huge', die: 'd10' },
  5: { name: 'Massive', die: 'd12' },
};

/**
 * Create a new domain
 * @param {Object} options - Domain options
 * @param {String} options.name - Domain name
 * @param {Number} options.size - Domain size (1-5)
 * @param {Object} options.skills - Domain skills
 * @param {Number} options.skills.diplomacy - Diplomacy skill modifier
 * @param {Number} options.skills.espionage - Espionage skill modifier
 * @param {Number} options.skills.lore - Lore skill modifier
 * @param {Number} options.skills.operations - Operations skill modifier
 * @returns {Object} - New domain
 */
export function createDomain({
  name,
  size = 1,
  skills = {
    [DOMAIN_SKILLS.DIPLOMACY]: 0,
    [DOMAIN_SKILLS.ESPIONAGE]: 0,
    [DOMAIN_SKILLS.LORE]: 0,
    [DOMAIN_SKILLS.OPERATIONS]: 0,
  },
}) {
  // Calculate defense scores based on skills
  const defenseScores = calculateDefenseScores(skills);
  
  return {
    id: uuidv4(),
    name,
    size,
    skills: {
      [DOMAIN_SKILLS.DIPLOMACY]: skills[DOMAIN_SKILLS.DIPLOMACY] || 0,
      [DOMAIN_SKILLS.ESPIONAGE]: skills[DOMAIN_SKILLS.ESPIONAGE] || 0,
      [DOMAIN_SKILLS.LORE]: skills[DOMAIN_SKILLS.LORE] || 0,
      [DOMAIN_SKILLS.OPERATIONS]: skills[DOMAIN_SKILLS.OPERATIONS] || 0,
    },
    defenseScores,
    defenseLevels: {
      [DOMAIN_DEFENSES.COMMUNICATIONS]: 0,
      [DOMAIN_DEFENSES.RESOLVE]: 0,
      [DOMAIN_DEFENSES.RESOURCES]: 0,
    },
    resources: 0,
    units: [],
    officers: [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

/**
 * Calculate defense scores based on skills
 * @param {Object} skills - Domain skills
 * @returns {Object} - Defense scores
 */
function calculateDefenseScores(skills) {
  return {
    [DOMAIN_DEFENSES.COMMUNICATIONS]: 10 + Math.floor((skills[DOMAIN_SKILLS.DIPLOMACY] + skills[DOMAIN_SKILLS.ESPIONAGE]) / 2),
    [DOMAIN_DEFENSES.RESOLVE]: 10 + Math.floor((skills[DOMAIN_SKILLS.DIPLOMACY] + skills[DOMAIN_SKILLS.LORE]) / 2),
    [DOMAIN_DEFENSES.RESOURCES]: 10 + Math.floor((skills[DOMAIN_SKILLS.OPERATIONS] + skills[DOMAIN_SKILLS.LORE]) / 2),
  };
}

/**
 * Update a domain's skills
 * @param {Object} domain - Domain to modify
 * @param {Object} skills - New skills
 * @returns {Object} - Updated domain
 */
export function updateSkills(domain, skills) {
  const updatedSkills = {
    ...domain.skills,
    ...skills,
  };
  
  // Recalculate defense scores
  const defenseScores = calculateDefenseScores(updatedSkills);
  
  return {
    ...domain,
    skills: updatedSkills,
    defenseScores,
    updated: new Date().toISOString(),
  };
}

/**
 * Update a domain's defense levels
 * @param {Object} domain - Domain to modify
 * @param {Object} defenseLevels - New defense levels
 * @returns {Object} - Updated domain
 */
export function updateDefenseLevels(domain, defenseLevels) {
  return {
    ...domain,
    defenseLevels: {
      ...domain.defenseLevels,
      ...defenseLevels,
    },
    updated: new Date().toISOString(),
  };
}

/**
 * Add resources to a domain
 * @param {Object} domain - Domain to modify
 * @param {Number} amount - Amount of resources to add
 * @returns {Object} - Updated domain
 */
export function addResources(domain, amount) {
  return {
    ...domain,
    resources: domain.resources + amount,
    updated: new Date().toISOString(),
  };
}

/**
 * Remove resources from a domain
 * @param {Object} domain - Domain to modify
 * @param {Number} amount - Amount of resources to remove
 * @returns {Object} - Updated domain
 */
export function removeResources(domain, amount) {
  return {
    ...domain,
    resources: Math.max(0, domain.resources - amount),
    updated: new Date().toISOString(),
  };
}

/**
 * Add a unit to a domain
 * @param {Object} domain - Domain to modify
 * @param {String} unitId - ID of the unit to add
 * @returns {Object} - Updated domain
 */
export function addUnit(domain, unitId) {
  if (!domain.units.includes(unitId)) {
    return {
      ...domain,
      units: [...domain.units, unitId],
      updated: new Date().toISOString(),
    };
  }
  
  return domain;
}

/**
 * Remove a unit from a domain
 * @param {Object} domain - Domain to modify
 * @param {String} unitId - ID of the unit to remove
 * @returns {Object} - Updated domain
 */
export function removeUnit(domain, unitId) {
  return {
    ...domain,
    units: domain.units.filter(id => id !== unitId),
    updated: new Date().toISOString(),
  };
}

/**
 * Add an officer to a domain
 * @param {Object} domain - Domain to modify
 * @param {String} officerId - ID of the officer to add
 * @returns {Object} - Updated domain
 */
export function addOfficer(domain, officerId) {
  if (!domain.officers.includes(officerId)) {
    return {
      ...domain,
      officers: [...domain.officers, officerId],
      updated: new Date().toISOString(),
    };
  }
  
  return domain;
}

/**
 * Remove an officer from a domain
 * @param {Object} domain - Domain to modify
 * @param {String} officerId - ID of the officer to remove
 * @returns {Object} - Updated domain
 */
export function removeOfficer(domain, officerId) {
  return {
    ...domain,
    officers: domain.officers.filter(id => id !== officerId),
    updated: new Date().toISOString(),
  };
}

/**
 * Calculate the number of actions a domain can take in intrigue
 * @param {Object} domain - Domain to calculate for
 * @returns {Number} - Number of actions
 */
export function calculateActions(domain) {
  // Base actions (4) plus domain size
  return 4 + domain.size;
}

/**
 * Calculate the proficiency bonus for a domain
 * @param {Object} domain - Domain to calculate for
 * @returns {Number} - Proficiency bonus
 */
export function calculateProficiencyBonus(domain) {
  // Proficiency bonus is 2 + floor(domain size / 2)
  return 2 + Math.floor(domain.size / 2);
}
