/**
 * Battle storage utility for Kingdoms & Warfare
 * Provides functions for storing and retrieving battle data
 */

import { 
  DEFAULT_NAMESPACE, 
  KEY_PREFIXES, 
  getValue, 
  putValue, 
  deleteValue, 
  listKeys 
} from './core.js';

/**
 * Get a battle from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle to get
 * @returns {Promise<Object>} - Battle object
 */
export async function getBattle(env, namespace = DEFAULT_NAMESPACE, battleId) {
  return getValue(env, namespace, `${KEY_PREFIXES.BATTLE}${battleId}`);
}

/**
 * Get all battles from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of battle objects
 */
export async function getAllBattles(env, namespace = DEFAULT_NAMESPACE) {
  const keys = await listKeys(env, namespace, KEY_PREFIXES.BATTLE);
  const battles = await Promise.all(keys.map(key => getValue(env, namespace, key)));
  return battles.filter(battle => battle !== null);
}

/**
 * Get battles for a domain from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get battles for
 * @returns {Promise<Array>} - Array of battle objects
 */
export async function getBattlesForDomain(env, namespace = DEFAULT_NAMESPACE, domainId) {
  const battles = await getAllBattles(env, namespace);
  return battles.filter(battle => battle.domains && battle.domains.includes(domainId));
}

/**
 * Save a battle to storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} battle - Battle object to save
 * @returns {Promise<Object>} - Saved battle object
 */
export async function saveBattle(env, namespace = DEFAULT_NAMESPACE, battle) {
  const updatedBattle = {
    ...battle,
    updated: new Date().toISOString(),
  };
  
  await putValue(env, namespace, `${KEY_PREFIXES.BATTLE}${battle.id}`, updatedBattle);
  
  // Update the battle index
  const indexKey = `${KEY_PREFIXES.INDEX}battles`;
  const battleIndex = await getValue(env, namespace, indexKey) || [];
  
  if (!battleIndex.includes(battle.id)) {
    battleIndex.push(battle.id);
    await putValue(env, namespace, indexKey, battleIndex);
  }
  
  return updatedBattle;
}

/**
 * Delete a battle from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle to delete
 * @returns {Promise<Boolean>} - Whether the battle was deleted
 */
export async function deleteBattle(env, namespace = DEFAULT_NAMESPACE, battleId) {
  const battle = await getBattle(env, namespace, battleId);
  
  if (!battle) {
    return false;
  }
  
  await deleteValue(env, namespace, `${KEY_PREFIXES.BATTLE}${battleId}`);
  
  // Update the battle index
  const indexKey = `${KEY_PREFIXES.INDEX}battles`;
  const battleIndex = await getValue(env, namespace, indexKey) || [];
  
  if (battleIndex.includes(battleId)) {
    const updatedIndex = battleIndex.filter(id => id !== battleId);
    await putValue(env, namespace, indexKey, updatedIndex);
  }
  
  return true;
}

/**
 * Find battles by name
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} name - Name to search for
 * @returns {Promise<Array>} - Array of matching battle objects
 */
export async function findBattlesByName(env, namespace = DEFAULT_NAMESPACE, name) {
  const battles = await getAllBattles(env, namespace);
  return battles.filter(battle => 
    battle.name.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Add a domain to a battle
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle
 * @param {String} domainId - ID of the domain to add
 * @returns {Promise<Object>} - Updated battle object
 */
export async function addDomainToBattle(env, namespace = DEFAULT_NAMESPACE, battleId, domainId) {
  const battle = await getBattle(env, namespace, battleId);
  
  if (!battle) {
    return null;
  }
  
  if (!battle.domains) {
    battle.domains = [];
  }
  
  if (!battle.domains.includes(domainId)) {
    battle.domains.push(domainId);
    return saveBattle(env, namespace, battle);
  }
  
  return battle;
}

/**
 * Remove a domain from a battle
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle
 * @param {String} domainId - ID of the domain to remove
 * @returns {Promise<Object>} - Updated battle object
 */
export async function removeDomainFromBattle(env, namespace = DEFAULT_NAMESPACE, battleId, domainId) {
  const battle = await getBattle(env, namespace, battleId);
  
  if (!battle || !battle.domains) {
    return battle;
  }
  
  if (battle.domains.includes(domainId)) {
    battle.domains = battle.domains.filter(id => id !== domainId);
    
    // Also remove any units belonging to this domain
    if (battle.units) {
      Object.keys(battle.units).forEach(unitId => {
        if (battle.units[unitId].domainId === domainId) {
          delete battle.units[unitId];
        }
      });
    }
    
    return saveBattle(env, namespace, battle);
  }
  
  return battle;
}

/**
 * Add a unit to a battle
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle
 * @param {String} unitId - ID of the unit to add
 * @param {String} domainId - ID of the domain the unit belongs to
 * @returns {Promise<Object>} - Updated battle object
 */
export async function addUnitToBattle(env, namespace = DEFAULT_NAMESPACE, battleId, unitId, domainId) {
  const battle = await getBattle(env, namespace, battleId);
  
  if (!battle) {
    return null;
  }
  
  // Make sure the domain is in the battle
  if (!battle.domains || !battle.domains.includes(domainId)) {
    battle.domains = battle.domains || [];
    battle.domains.push(domainId);
  }
  
  // Initialize units object if it doesn't exist
  if (!battle.units) {
    battle.units = {};
  }
  
  // Check if the unit is already in the battle
  if (battle.units[unitId]) {
    return battle;
  }
  
  // Add the unit to the battle
  battle.units[unitId] = {
    id: unitId,
    domainId,
    position: {
      rank: 'not_deployed',
      column: null,
    },
    activated: false,
    usedReaction: false,
    tokens: [],
  };
  
  // Add the unit to the not_deployed grid
  if (!battle.grid) {
    battle.grid = {
      vanguard: {
        left: null,
        center: null,
        right: null,
      },
      center: {
        left: null,
        center: null,
        right: null,
      },
      rear: {
        left: null,
        center: null,
        right: null,
      },
      reserve: [],
      not_deployed: [],
    };
  }
  
  if (!battle.grid.not_deployed) {
    battle.grid.not_deployed = [];
  }
  
  battle.grid.not_deployed.push(unitId);
  
  return saveBattle(env, namespace, battle);
}

/**
 * Remove a unit from a battle
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle
 * @param {String} unitId - ID of the unit to remove
 * @returns {Promise<Object>} - Updated battle object
 */
export async function removeUnitFromBattle(env, namespace = DEFAULT_NAMESPACE, battleId, unitId) {
  const battle = await getBattle(env, namespace, battleId);
  
  if (!battle || !battle.units || !battle.units[unitId]) {
    return battle;
  }
  
  // Get the unit's position
  const { rank, column } = battle.units[unitId].position;
  
  // Remove the unit from the grid
  if (rank === 'not_deployed' || rank === 'reserve') {
    if (battle.grid && battle.grid[rank]) {
      battle.grid[rank] = battle.grid[rank].filter(id => id !== unitId);
    }
  } else {
    if (battle.grid && battle.grid[rank] && battle.grid[rank][column] === unitId) {
      battle.grid[rank][column] = null;
    }
  }
  
  // Remove the unit from the initiative order
  if (battle.initiative) {
    battle.initiative = battle.initiative.filter(id => id !== unitId);
  }
  
  // Remove the unit from the units object
  delete battle.units[unitId];
  
  return saveBattle(env, namespace, battle);
}
