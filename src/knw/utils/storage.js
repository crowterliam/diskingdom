/**
 * Storage utility for Kingdoms & Warfare
 * Provides functions for storing and retrieving data
 * 
 * This file re-exports all storage functions from the modular storage system
 * for backward compatibility.
 */

// Re-export everything from the modular storage system
export * from './storage/index.js';

// For backward compatibility, provide versions of the functions that don't require env
import * as Storage from './storage/index.js';

/**
 * Get a unit from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} unitId - ID of the unit to get
 * @returns {Promise<Object>} - Unit object
 */
export async function getUnit(env, namespace, unitId) {
  // If only unitId is provided, shift parameters
  if (unitId === undefined && typeof namespace === 'string') {
    unitId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    unitId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getUnit(env, namespace, unitId);
}

/**
 * Get all units from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of unit objects
 */
export async function getAllUnits(env, namespace) {
  return Storage.getAllUnits(env, namespace);
}

/**
 * Get units for a domain from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get units for
 * @returns {Promise<Array>} - Array of unit objects
 */
export async function getUnitsForDomain(env, namespace, domainId) {
  // If only domainId is provided, shift parameters
  if (domainId === undefined && typeof namespace === 'string') {
    domainId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    domainId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getUnitsForDomain(env, namespace, domainId);
}

/**
 * Save a unit to storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} unit - Unit object to save
 * @returns {Promise<Object>} - Saved unit object
 */
export async function saveUnit(env, namespace, unit) {
  // If only unit is provided, shift parameters
  if (unit === undefined && typeof namespace === 'object') {
    unit = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'object' && !env[Storage.DEFAULT_NAMESPACE]) {
    unit = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.saveUnit(env, namespace, unit);
}

/**
 * Delete a unit from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} unitId - ID of the unit to delete
 * @returns {Promise<Boolean>} - Whether the unit was deleted
 */
export async function deleteUnit(env, namespace, unitId) {
  // If only unitId is provided, shift parameters
  if (unitId === undefined && typeof namespace === 'string') {
    unitId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    unitId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.deleteUnit(env, namespace, unitId);
}

/**
 * Get a domain from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get
 * @returns {Promise<Object>} - Domain object
 */
export async function getDomain(env, namespace, domainId) {
  // If only domainId is provided, shift parameters
  if (domainId === undefined && typeof namespace === 'string') {
    domainId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    domainId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getDomain(env, namespace, domainId);
}

/**
 * Get all domains from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of domain objects
 */
export async function getAllDomains(env, namespace) {
  return Storage.getAllDomains(env, namespace);
}

/**
 * Save a domain to storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} domain - Domain object to save
 * @returns {Promise<Object>} - Saved domain object
 */
export async function saveDomain(env, namespace, domain) {
  // If only domain is provided, shift parameters
  if (domain === undefined && typeof namespace === 'object') {
    domain = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'object' && !env[Storage.DEFAULT_NAMESPACE]) {
    domain = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.saveDomain(env, namespace, domain);
}

/**
 * Delete a domain from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to delete
 * @returns {Promise<Boolean>} - Whether the domain was deleted
 */
export async function deleteDomain(env, namespace, domainId) {
  // If only domainId is provided, shift parameters
  if (domainId === undefined && typeof namespace === 'string') {
    domainId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    domainId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.deleteDomain(env, namespace, domainId);
}

/**
 * Get a battle from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle to get
 * @returns {Promise<Object>} - Battle object
 */
export async function getBattle(env, namespace, battleId) {
  // If only battleId is provided, shift parameters
  if (battleId === undefined && typeof namespace === 'string') {
    battleId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    battleId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getBattle(env, namespace, battleId);
}

/**
 * Get all battles from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of battle objects
 */
export async function getAllBattles(env, namespace) {
  return Storage.getAllBattles(env, namespace);
}

/**
 * Get battles for a domain from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get battles for
 * @returns {Promise<Array>} - Array of battle objects
 */
export async function getBattlesForDomain(env, namespace, domainId) {
  // If only domainId is provided, shift parameters
  if (domainId === undefined && typeof namespace === 'string') {
    domainId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    domainId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getBattlesForDomain(env, namespace, domainId);
}

/**
 * Save a battle to storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} battle - Battle object to save
 * @returns {Promise<Object>} - Saved battle object
 */
export async function saveBattle(env, namespace, battle) {
  // If only battle is provided, shift parameters
  if (battle === undefined && typeof namespace === 'object') {
    battle = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'object' && !env[Storage.DEFAULT_NAMESPACE]) {
    battle = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.saveBattle(env, namespace, battle);
}

/**
 * Delete a battle from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} battleId - ID of the battle to delete
 * @returns {Promise<Boolean>} - Whether the battle was deleted
 */
export async function deleteBattle(env, namespace, battleId) {
  // If only battleId is provided, shift parameters
  if (battleId === undefined && typeof namespace === 'string') {
    battleId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    battleId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.deleteBattle(env, namespace, battleId);
}

/**
 * Get an intrigue session from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session to get
 * @returns {Promise<Object>} - Intrigue session object
 */
export async function getIntrigue(env, namespace, intrigueId) {
  // If only intrigueId is provided, shift parameters
  if (intrigueId === undefined && typeof namespace === 'string') {
    intrigueId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    intrigueId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getIntrigue(env, namespace, intrigueId);
}

/**
 * Get all intrigue sessions from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of intrigue session objects
 */
export async function getAllIntrigues(env, namespace) {
  return Storage.getAllIntrigues(env, namespace);
}

/**
 * Get intrigue sessions for a domain from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get intrigue sessions for
 * @returns {Promise<Array>} - Array of intrigue session objects
 */
export async function getIntriguesForDomain(env, namespace, domainId) {
  // If only domainId is provided, shift parameters
  if (domainId === undefined && typeof namespace === 'string') {
    domainId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    domainId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getIntriguesForDomain(env, namespace, domainId);
}

/**
 * Save an intrigue session to storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} intrigue - Intrigue session object to save
 * @returns {Promise<Object>} - Saved intrigue session object
 */
export async function saveIntrigue(env, namespace, intrigue) {
  // If only intrigue is provided, shift parameters
  if (intrigue === undefined && typeof namespace === 'object') {
    intrigue = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'object' && !env[Storage.DEFAULT_NAMESPACE]) {
    intrigue = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.saveIntrigue(env, namespace, intrigue);
}

/**
 * Delete an intrigue session from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session to delete
 * @returns {Promise<Boolean>} - Whether the intrigue session was deleted
 */
export async function deleteIntrigue(env, namespace, intrigueId) {
  // If only intrigueId is provided, shift parameters
  if (intrigueId === undefined && typeof namespace === 'string') {
    intrigueId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    intrigueId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.deleteIntrigue(env, namespace, intrigueId);
}

/**
 * Get data for a Discord server (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} serverId - ID of the Discord server
 * @returns {Promise<Object>} - Server data
 */
export async function getServerData(env, namespace, serverId) {
  // If only serverId is provided, shift parameters
  if (serverId === undefined && typeof namespace === 'string') {
    serverId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    serverId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getServerData(env, namespace, serverId);
}

/**
 * Save data for a Discord server (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} serverId - ID of the Discord server
 * @param {Object} data - Server data to save
 * @returns {Promise<Object>} - Saved server data
 */
export async function saveServerData(env, namespace, serverId, data) {
  // If only serverId and data are provided, shift parameters
  if (data === undefined && serverId !== undefined) {
    data = serverId;
    serverId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (serverId === undefined && namespace !== undefined) {
    data = namespace;
    serverId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.saveServerData(env, namespace, serverId, data);
}

/**
 * Get data for a Discord channel (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @returns {Promise<Object>} - Channel data
 */
export async function getChannelData(env, namespace, channelId) {
  // If only channelId is provided, shift parameters
  if (channelId === undefined && typeof namespace === 'string') {
    channelId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    channelId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getChannelData(env, namespace, channelId);
}

/**
 * Save data for a Discord channel (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @param {Object} data - Channel data to save
 * @returns {Promise<Object>} - Saved channel data
 */
export async function saveChannelData(env, namespace, channelId, data) {
  // If only channelId and data are provided, shift parameters
  if (data === undefined && channelId !== undefined) {
    data = channelId;
    channelId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (channelId === undefined && namespace !== undefined) {
    data = namespace;
    channelId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.saveChannelData(env, namespace, channelId, data);
}

/**
 * Get data for a Discord user (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} userId - ID of the Discord user
 * @returns {Promise<Object>} - User data
 */
export async function getUserData(env, namespace, userId) {
  // If only userId is provided, shift parameters
  if (userId === undefined && typeof namespace === 'string') {
    userId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (namespace === undefined && typeof env === 'string') {
    userId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.getUserData(env, namespace, userId);
}

/**
 * Save data for a Discord user (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} userId - ID of the Discord user
 * @param {Object} data - User data to save
 * @returns {Promise<Object>} - Saved user data
 */
export async function saveUserData(env, namespace, userId, data) {
  // If only userId and data are provided, shift parameters
  if (data === undefined && userId !== undefined) {
    data = userId;
    userId = namespace;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  if (userId === undefined && namespace !== undefined) {
    data = namespace;
    userId = env;
    env = null;
    namespace = Storage.DEFAULT_NAMESPACE;
  }
  
  return Storage.saveUserData(env, namespace, userId, data);
}

/**
 * Clear all data from storage (backward compatibility)
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Boolean>} - Whether the data was cleared
 */
export async function clearAllData(env, namespace) {
  return Storage.clearAllData(env, namespace);
}
