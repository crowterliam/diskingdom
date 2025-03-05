/**
 * Intrigue model for Kingdoms & Warfare
 * Represents political intrigue sessions between domains
 */

import { v4 as uuidv4 } from 'uuid';
import { DOMAIN_SKILLS, DOMAIN_DEFENSES } from './domain.js';

// Intrigue phases
export const INTRIGUE_PHASES = {
  SETUP: 'setup',
  ACTIVE: 'active',
  RESOLUTION: 'resolution',
};

// Intrigue action types
export const INTRIGUE_ACTION_TYPES = {
  SKILL_TEST: 'skill_test',
  DEFENSE_MODIFICATION: 'defense_modification',
  RESOURCE_TRANSFER: 'resource_transfer',
  UNIT_CREATION: 'unit_creation',
  UNIT_MODIFICATION: 'unit_modification',
  SPECIAL: 'special',
};

/**
 * Create a new intrigue session
 * @param {Object} options - Intrigue options
 * @param {String} options.name - Intrigue name
 * @returns {Object} - New intrigue session
 */
export function createIntrigue({
  name,
}) {
  return {
    id: uuidv4(),
    name,
    phase: INTRIGUE_PHASES.SETUP,
    domains: [],
    initiator: null,
    turnOrder: [],
    currentDomainIndex: 0,
    turns: [],
    log: [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

/**
 * Add a domain to an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @param {String} domainId - ID of the domain to add
 * @returns {Object} - Updated intrigue session
 */
export function addDomain(intrigue, domainId) {
  if (!intrigue.domains.includes(domainId)) {
    return {
      ...intrigue,
      domains: [...intrigue.domains, domainId],
      updated: new Date().toISOString(),
    };
  }
  
  return intrigue;
}

/**
 * Remove a domain from an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @param {String} domainId - ID of the domain to remove
 * @returns {Object} - Updated intrigue session
 */
export function removeDomain(intrigue, domainId) {
  // Remove the domain
  const updatedIntrigue = {
    ...intrigue,
    domains: intrigue.domains.filter(id => id !== domainId),
    updated: new Date().toISOString(),
  };
  
  // If the domain is the initiator, clear the initiator
  if (intrigue.initiator === domainId) {
    updatedIntrigue.initiator = null;
  }
  
  // Remove the domain from the turn order
  updatedIntrigue.turnOrder = updatedIntrigue.turnOrder.filter(id => id !== domainId);
  
  return updatedIntrigue;
}

/**
 * Set the initiator domain for an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @param {String} domainId - ID of the initiator domain
 * @returns {Object} - Updated intrigue session
 */
export function setInitiator(intrigue, domainId) {
  // Check if the domain is in the intrigue session
  if (!intrigue.domains.includes(domainId)) {
    return addDomain(intrigue, domainId);
  }
  
  return {
    ...intrigue,
    initiator: domainId,
    updated: new Date().toISOString(),
  };
}

/**
 * Set the turn order for an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @param {Array} turnOrder - Array of domain IDs in turn order
 * @returns {Object} - Updated intrigue session
 */
export function setTurnOrder(intrigue, turnOrder) {
  return {
    ...intrigue,
    turnOrder,
    updated: new Date().toISOString(),
  };
}

/**
 * Start an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @returns {Object} - Updated intrigue session
 */
export function startIntrigue(intrigue) {
  // Check if the intrigue session is in the setup phase
  if (intrigue.phase !== INTRIGUE_PHASES.SETUP) {
    return intrigue;
  }
  
  // Check if there's an initiator
  if (!intrigue.initiator) {
    return intrigue;
  }
  
  // Check if there are at least two domains
  if (intrigue.domains.length < 2) {
    return intrigue;
  }
  
  // Start the intrigue session
  const updatedIntrigue = {
    ...intrigue,
    phase: INTRIGUE_PHASES.ACTIVE,
    updated: new Date().toISOString(),
  };
  
  // Set the turn order if it's not already set
  if (updatedIntrigue.turnOrder.length === 0) {
    // The initiator goes first, followed by the other domains in the order they were added
    const otherDomains = updatedIntrigue.domains.filter(id => id !== updatedIntrigue.initiator);
    updatedIntrigue.turnOrder = [updatedIntrigue.initiator, ...otherDomains];
  }
  
  // Log the intrigue start
  updatedIntrigue.log.push({
    type: 'intrigue_start',
    timestamp: new Date().toISOString(),
  });
  
  return updatedIntrigue;
}

/**
 * End an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @returns {Object} - Updated intrigue session
 */
export function endIntrigue(intrigue) {
  // Check if the intrigue session is in the active phase
  if (intrigue.phase !== INTRIGUE_PHASES.ACTIVE) {
    return intrigue;
  }
  
  // End the intrigue session
  const updatedIntrigue = {
    ...intrigue,
    phase: INTRIGUE_PHASES.RESOLUTION,
    updated: new Date().toISOString(),
  };
  
  // Log the intrigue end
  updatedIntrigue.log.push({
    type: 'intrigue_end',
    timestamp: new Date().toISOString(),
  });
  
  return updatedIntrigue;
}

/**
 * Take a turn in an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @param {String} domainId - ID of the domain taking the turn
 * @param {Object} action - Action to take
 * @returns {Object} - Updated intrigue session
 */
export function takeTurn(intrigue, domainId, action) {
  // Check if the intrigue session is in the active phase
  if (intrigue.phase !== INTRIGUE_PHASES.ACTIVE) {
    return intrigue;
  }
  
  // Check if the domain is in the intrigue session
  if (!intrigue.domains.includes(domainId)) {
    return intrigue;
  }
  
  // Check if it's the domain's turn
  if (intrigue.turnOrder[intrigue.currentDomainIndex] !== domainId) {
    return intrigue;
  }
  
  // Take the turn
  const updatedIntrigue = {
    ...intrigue,
    turns: [
      ...intrigue.turns,
      {
        domainId,
        action,
        timestamp: new Date().toISOString(),
      },
    ],
    updated: new Date().toISOString(),
  };
  
  // Log the turn
  updatedIntrigue.log.push({
    type: 'turn_taken',
    domainId,
    action,
    timestamp: new Date().toISOString(),
  });
  
  // Advance to the next domain
  updatedIntrigue.currentDomainIndex = (updatedIntrigue.currentDomainIndex + 1) % updatedIntrigue.turnOrder.length;
  
  return updatedIntrigue;
}

/**
 * Create a skill test action
 * @param {Object} options - Action options
 * @param {String} options.skill - Skill to test
 * @param {String} options.target - Target domain ID
 * @param {Number} options.difficulty - Difficulty class (DC)
 * @param {String} options.description - Description of the action
 * @returns {Object} - Skill test action
 */
export function createSkillTestAction({
  skill,
  target = null,
  difficulty = null,
  description = '',
}) {
  return {
    type: INTRIGUE_ACTION_TYPES.SKILL_TEST,
    skill,
    target,
    difficulty,
    description,
    result: null,
  };
}

/**
 * Create a defense modification action
 * @param {Object} options - Action options
 * @param {String} options.defense - Defense to modify
 * @param {String} options.target - Target domain ID
 * @param {Number} options.change - Amount to change the defense by
 * @param {String} options.description - Description of the action
 * @returns {Object} - Defense modification action
 */
export function createDefenseModificationAction({
  defense,
  target,
  change,
  description = '',
}) {
  return {
    type: INTRIGUE_ACTION_TYPES.DEFENSE_MODIFICATION,
    defense,
    target,
    change,
    description,
  };
}

/**
 * Create a resource transfer action
 * @param {Object} options - Action options
 * @param {String} options.source - Source domain ID
 * @param {String} options.target - Target domain ID
 * @param {Number} options.amount - Amount of resources to transfer
 * @param {String} options.description - Description of the action
 * @returns {Object} - Resource transfer action
 */
export function createResourceTransferAction({
  source,
  target,
  amount,
  description = '',
}) {
  return {
    type: INTRIGUE_ACTION_TYPES.RESOURCE_TRANSFER,
    source,
    target,
    amount,
    description,
  };
}

/**
 * Create a unit creation action
 * @param {Object} options - Action options
 * @param {String} options.unitType - Type of unit to create
 * @param {Number} options.unitTier - Tier of unit to create
 * @param {Number} options.cost - Cost of the unit
 * @param {String} options.description - Description of the action
 * @returns {Object} - Unit creation action
 */
export function createUnitCreationAction({
  unitType,
  unitTier,
  cost,
  description = '',
}) {
  return {
    type: INTRIGUE_ACTION_TYPES.UNIT_CREATION,
    unitType,
    unitTier,
    cost,
    description,
  };
}

/**
 * Create a unit modification action
 * @param {Object} options - Action options
 * @param {String} options.unitId - ID of the unit to modify
 * @param {Object} options.modifications - Modifications to make to the unit
 * @param {String} options.description - Description of the action
 * @returns {Object} - Unit modification action
 */
export function createUnitModificationAction({
  unitId,
  modifications,
  description = '',
}) {
  return {
    type: INTRIGUE_ACTION_TYPES.UNIT_MODIFICATION,
    unitId,
    modifications,
    description,
  };
}

/**
 * Create a special action
 * @param {Object} options - Action options
 * @param {String} options.name - Name of the special action
 * @param {String} options.description - Description of the action
 * @returns {Object} - Special action
 */
export function createSpecialAction({
  name,
  description = '',
}) {
  return {
    type: INTRIGUE_ACTION_TYPES.SPECIAL,
    name,
    description,
  };
}

/**
 * Log an event in an intrigue session
 * @param {Object} intrigue - Intrigue session to modify
 * @param {Object} event - Event to log
 * @returns {Object} - Updated intrigue session
 */
export function logEvent(intrigue, event) {
  return {
    ...intrigue,
    log: [...intrigue.log, { ...event, timestamp: new Date().toISOString() }],
    updated: new Date().toISOString(),
  };
}
