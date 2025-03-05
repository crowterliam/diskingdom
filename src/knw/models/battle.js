/**
 * Battle model for Kingdoms & Warfare
 * Represents warfare battles between domains
 */

import { v4 as uuidv4 } from 'uuid';

// Battle phases
export const BATTLE_PHASES = {
  SETUP: 'setup',
  DEPLOYMENT: 'deployment',
  BATTLE: 'battle',
  AFTERMATH: 'aftermath',
};

// Battle ranks
export const BATTLE_RANKS = {
  VANGUARD: 'vanguard',
  CENTER: 'center',
  REAR: 'rear',
  RESERVE: 'reserve',
  NOT_DEPLOYED: 'not_deployed',
};

// Grid positions
export const GRID_POSITIONS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

/**
 * Create a new battle
 * @param {Object} options - Battle options
 * @param {String} options.name - Battle name
 * @returns {Object} - New battle
 */
export function createBattle({
  name,
}) {
  return {
    id: uuidv4(),
    name,
    phase: BATTLE_PHASES.SETUP,
    round: 0,
    domains: [],
    units: {},
    grid: {
      [BATTLE_RANKS.VANGUARD]: {
        [GRID_POSITIONS.LEFT]: null,
        [GRID_POSITIONS.CENTER]: null,
        [GRID_POSITIONS.RIGHT]: null,
      },
      [BATTLE_RANKS.CENTER]: {
        [GRID_POSITIONS.LEFT]: null,
        [GRID_POSITIONS.CENTER]: null,
        [GRID_POSITIONS.RIGHT]: null,
      },
      [BATTLE_RANKS.REAR]: {
        [GRID_POSITIONS.LEFT]: null,
        [GRID_POSITIONS.CENTER]: null,
        [GRID_POSITIONS.RIGHT]: null,
      },
      [BATTLE_RANKS.RESERVE]: [],
      [BATTLE_RANKS.NOT_DEPLOYED]: [],
    },
    initiative: [],
    currentTurn: 0,
    log: [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

/**
 * Add a domain to a battle
 * @param {Object} battle - Battle to modify
 * @param {String} domainId - ID of the domain to add
 * @returns {Object} - Updated battle
 */
export function addDomain(battle, domainId) {
  if (!battle.domains.includes(domainId)) {
    return {
      ...battle,
      domains: [...battle.domains, domainId],
      updated: new Date().toISOString(),
    };
  }
  
  return battle;
}

/**
 * Remove a domain from a battle
 * @param {Object} battle - Battle to modify
 * @param {String} domainId - ID of the domain to remove
 * @returns {Object} - Updated battle
 */
export function removeDomain(battle, domainId) {
  // Remove the domain
  let updatedBattle = {
    ...battle,
    domains: battle.domains.filter(id => id !== domainId),
    updated: new Date().toISOString(),
  };
  
  // Remove all units belonging to the domain
  const unitIds = Object.keys(battle.units).filter(unitId => battle.units[unitId].domainId === domainId);
  
  unitIds.forEach(unitId => {
    updatedBattle = removeUnit(updatedBattle, unitId);
  });
  
  return updatedBattle;
}

/**
 * Add a unit to a battle
 * @param {Object} battle - Battle to modify
 * @param {String} unitId - ID of the unit to add
 * @param {String} domainId - ID of the domain the unit belongs to
 * @returns {Object} - Updated battle
 */
export function addUnit(battle, unitId, domainId) {
  // Check if the unit is already in the battle
  if (battle.units[unitId]) {
    return battle;
  }
  
  // Check if the domain is in the battle
  if (!battle.domains.includes(domainId)) {
    return addDomain(battle, domainId);
  }
  
  // Add the unit
  const updatedBattle = {
    ...battle,
    units: {
      ...battle.units,
      [unitId]: {
        id: unitId,
        domainId,
        position: {
          rank: BATTLE_RANKS.NOT_DEPLOYED,
          column: null,
        },
        activated: false,
        usedReaction: false,
        tokens: [],
      },
    },
    grid: {
      ...battle.grid,
      [BATTLE_RANKS.NOT_DEPLOYED]: [...battle.grid[BATTLE_RANKS.NOT_DEPLOYED], unitId],
    },
    updated: new Date().toISOString(),
  };
  
  return updatedBattle;
}

/**
 * Remove a unit from a battle
 * @param {Object} battle - Battle to modify
 * @param {String} unitId - ID of the unit to remove
 * @returns {Object} - Updated battle
 */
export function removeUnit(battle, unitId) {
  // Check if the unit is in the battle
  if (!battle.units[unitId]) {
    return battle;
  }
  
  // Get the unit's position
  const { rank, column } = battle.units[unitId].position;
  
  // Create a copy of the battle
  const updatedBattle = { ...battle };
  
  // Remove the unit from the grid
  if (rank === BATTLE_RANKS.NOT_DEPLOYED || rank === BATTLE_RANKS.RESERVE) {
    updatedBattle.grid[rank] = updatedBattle.grid[rank].filter(id => id !== unitId);
  } else {
    updatedBattle.grid[rank][column] = null;
  }
  
  // Remove the unit from the initiative order
  updatedBattle.initiative = updatedBattle.initiative.filter(id => id !== unitId);
  
  // Remove the unit from the units object
  const { [unitId]: removedUnit, ...remainingUnits } = updatedBattle.units;
  updatedBattle.units = remainingUnits;
  
  // Update the timestamp
  updatedBattle.updated = new Date().toISOString();
  
  return updatedBattle;
}

/**
 * Deploy a unit to a position on the battlefield
 * @param {Object} battle - Battle to modify
 * @param {String} unitId - ID of the unit to deploy
 * @param {String} rank - Rank to deploy to
 * @param {String} column - Column to deploy to
 * @returns {Object} - Updated battle
 */
export function deployUnit(battle, unitId, rank, column) {
  // Check if the unit is in the battle
  if (!battle.units[unitId]) {
    return battle;
  }
  
  // Check if the position is valid
  if (rank !== BATTLE_RANKS.RESERVE && rank !== BATTLE_RANKS.NOT_DEPLOYED && !GRID_POSITIONS[column]) {
    return battle;
  }
  
  // Check if the position is occupied
  if (rank !== BATTLE_RANKS.RESERVE && rank !== BATTLE_RANKS.NOT_DEPLOYED && battle.grid[rank][column] !== null) {
    return battle;
  }
  
  // Get the unit's current position
  const { rank: currentRank, column: currentColumn } = battle.units[unitId].position;
  
  // Create a copy of the battle
  const updatedBattle = { ...battle };
  
  // Remove the unit from its current position
  if (currentRank === BATTLE_RANKS.NOT_DEPLOYED || currentRank === BATTLE_RANKS.RESERVE) {
    updatedBattle.grid[currentRank] = updatedBattle.grid[currentRank].filter(id => id !== unitId);
  } else {
    updatedBattle.grid[currentRank][currentColumn] = null;
  }
  
  // Update the unit's position
  updatedBattle.units[unitId].position = {
    rank,
    column: rank === BATTLE_RANKS.RESERVE || rank === BATTLE_RANKS.NOT_DEPLOYED ? null : column,
  };
  
  // Add the unit to its new position
  if (rank === BATTLE_RANKS.NOT_DEPLOYED || rank === BATTLE_RANKS.RESERVE) {
    updatedBattle.grid[rank].push(unitId);
  } else {
    updatedBattle.grid[rank][column] = unitId;
  }
  
  // Update the timestamp
  updatedBattle.updated = new Date().toISOString();
  
  return updatedBattle;
}

/**
 * Set the initiative order for a battle
 * @param {Object} battle - Battle to modify
 * @param {Array} initiative - Array of unit IDs in initiative order
 * @returns {Object} - Updated battle
 */
export function setInitiative(battle, initiative) {
  return {
    ...battle,
    initiative,
    updated: new Date().toISOString(),
  };
}

/**
 * Start a battle
 * @param {Object} battle - Battle to modify
 * @returns {Object} - Updated battle
 */
export function startBattle(battle) {
  // Check if the battle is in the setup phase
  if (battle.phase !== BATTLE_PHASES.SETUP) {
    return battle;
  }
  
  // Start the battle
  const updatedBattle = {
    ...battle,
    phase: BATTLE_PHASES.BATTLE,
    round: 1,
    updated: new Date().toISOString(),
  };
  
  // Log the battle start
  updatedBattle.log.push({
    type: 'battle_start',
    round: 1,
    timestamp: new Date().toISOString(),
  });
  
  return updatedBattle;
}

/**
 * End a battle
 * @param {Object} battle - Battle to modify
 * @param {String} winningDomainId - ID of the winning domain
 * @returns {Object} - Updated battle
 */
export function endBattle(battle, winningDomainId) {
  // Check if the battle is in the battle phase
  if (battle.phase !== BATTLE_PHASES.BATTLE) {
    return battle;
  }
  
  // End the battle
  const updatedBattle = {
    ...battle,
    phase: BATTLE_PHASES.AFTERMATH,
    updated: new Date().toISOString(),
  };
  
  // Log the battle end
  updatedBattle.log.push({
    type: 'battle_end',
    winningDomainId,
    timestamp: new Date().toISOString(),
  });
  
  return updatedBattle;
}

/**
 * Activate a unit in a battle
 * @param {Object} battle - Battle to modify
 * @param {String} unitId - ID of the unit to activate
 * @returns {Object} - Updated battle
 */
export function activateUnit(battle, unitId) {
  // Check if the battle is in the battle phase
  if (battle.phase !== BATTLE_PHASES.BATTLE) {
    return battle;
  }
  
  // Check if the unit is in the battle
  if (!battle.units[unitId]) {
    return battle;
  }
  
  // Check if it's the unit's turn
  if (battle.initiative[battle.currentTurn] !== unitId) {
    return battle;
  }
  
  // Activate the unit
  const updatedBattle = {
    ...battle,
    units: {
      ...battle.units,
      [unitId]: {
        ...battle.units[unitId],
        activated: true,
      },
    },
    updated: new Date().toISOString(),
  };
  
  // Log the activation
  updatedBattle.log.push({
    type: 'unit_activated',
    unitId,
    timestamp: new Date().toISOString(),
  });
  
  return updatedBattle;
}

/**
 * End a unit's turn in a battle
 * @param {Object} battle - Battle to modify
 * @returns {Object} - Updated battle
 */
export function endTurn(battle) {
  // Check if the battle is in the battle phase
  if (battle.phase !== BATTLE_PHASES.BATTLE) {
    return battle;
  }
  
  // Get the current unit
  const currentUnitId = battle.initiative[battle.currentTurn];
  
  // Create a copy of the battle
  const updatedBattle = { ...battle };
  
  // Reset the unit's activation
  if (currentUnitId && updatedBattle.units[currentUnitId]) {
    updatedBattle.units[currentUnitId].activated = false;
  }
  
  // Increment the turn counter
  updatedBattle.currentTurn = (updatedBattle.currentTurn + 1) % updatedBattle.initiative.length;
  
  // Check if we've completed a round
  if (updatedBattle.currentTurn === 0) {
    updatedBattle.round += 1;
    
    // Reset all units' reaction flags
    Object.keys(updatedBattle.units).forEach(unitId => {
      updatedBattle.units[unitId].usedReaction = false;
    });
    
    // Log the round end
    updatedBattle.log.push({
      type: 'round_end',
      round: updatedBattle.round - 1,
      timestamp: new Date().toISOString(),
    });
    
    // Log the round start
    updatedBattle.log.push({
      type: 'round_start',
      round: updatedBattle.round,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Update the timestamp
  updatedBattle.updated = new Date().toISOString();
  
  return updatedBattle;
}

/**
 * Add a token to a unit in a battle
 * @param {Object} battle - Battle to modify
 * @param {String} unitId - ID of the unit to add a token to
 * @param {String} token - Token to add
 * @returns {Object} - Updated battle
 */
export function addToken(battle, unitId, token) {
  // Check if the unit is in the battle
  if (!battle.units[unitId]) {
    return battle;
  }
  
  // Add the token
  return {
    ...battle,
    units: {
      ...battle.units,
      [unitId]: {
        ...battle.units[unitId],
        tokens: [...battle.units[unitId].tokens, token],
      },
    },
    updated: new Date().toISOString(),
  };
}

/**
 * Remove a token from a unit in a battle
 * @param {Object} battle - Battle to modify
 * @param {String} unitId - ID of the unit to remove a token from
 * @param {String} token - Token to remove
 * @returns {Object} - Updated battle
 */
export function removeToken(battle, unitId, token) {
  // Check if the unit is in the battle
  if (!battle.units[unitId]) {
    return battle;
  }
  
  // Remove the token
  return {
    ...battle,
    units: {
      ...battle.units,
      [unitId]: {
        ...battle.units[unitId],
        tokens: battle.units[unitId].tokens.filter(t => t !== token),
      },
    },
    updated: new Date().toISOString(),
  };
}

/**
 * Log an event in a battle
 * @param {Object} battle - Battle to modify
 * @param {Object} event - Event to log
 * @returns {Object} - Updated battle
 */
export function logEvent(battle, event) {
  return {
    ...battle,
    log: [...battle.log, { ...event, timestamp: new Date().toISOString() }],
    updated: new Date().toISOString(),
  };
}
