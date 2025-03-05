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
 * @param {String} unitId - ID of the unit to get
 * @returns {Promise<Object>} - Unit object
 */
export async function getUnit(unitId) {
  return Storage.getUnit(null, Storage.DEFAULT_NAMESPACE, unitId);
}

/**
 * Get all units from storage (backward compatibility)
 * @returns {Promise<Array>} - Array of unit objects
 */
export async function getAllUnits() {
  return Storage.getAllUnits(null, Storage.DEFAULT_NAMESPACE);
}

/**
 * Get units for a domain from storage (backward compatibility)
 * @param {String} domainId - ID of the domain to get units for
 * @returns {Promise<Array>} - Array of unit objects
 */
export async function getUnitsForDomain(domainId) {
  return Storage.getUnitsForDomain(null, Storage.DEFAULT_NAMESPACE, domainId);
}

/**
 * Save a unit to storage (backward compatibility)
 * @param {Object} unit - Unit object to save
 * @returns {Promise<Object>} - Saved unit object
 */
export async function saveUnit(unit) {
  return Storage.saveUnit(null, Storage.DEFAULT_NAMESPACE, unit);
}

/**
 * Delete a unit from storage (backward compatibility)
 * @param {String} unitId - ID of the unit to delete
 * @returns {Promise<Boolean>} - Whether the unit was deleted
 */
export async function deleteUnit(unitId) {
  return Storage.deleteUnit(null, Storage.DEFAULT_NAMESPACE, unitId);
}

/**
 * Get a domain from storage (backward compatibility)
 * @param {String} domainId - ID of the domain to get
 * @returns {Promise<Object>} - Domain object
 */
export async function getDomain(domainId) {
  return Storage.getDomain(null, Storage.DEFAULT_NAMESPACE, domainId);
}

/**
 * Get all domains from storage (backward compatibility)
 * @returns {Promise<Array>} - Array of domain objects
 */
export async function getAllDomains() {
  return Storage.getAllDomains(null, Storage.DEFAULT_NAMESPACE);
}

/**
 * Save a domain to storage (backward compatibility)
 * @param {Object} domain - Domain object to save
 * @returns {Promise<Object>} - Saved domain object
 */
export async function saveDomain(domain) {
  return Storage.saveDomain(null, Storage.DEFAULT_NAMESPACE, domain);
}

/**
 * Delete a domain from storage (backward compatibility)
 * @param {String} domainId - ID of the domain to delete
 * @returns {Promise<Boolean>} - Whether the domain was deleted
 */
export async function deleteDomain(domainId) {
  return Storage.deleteDomain(null, Storage.DEFAULT_NAMESPACE, domainId);
}

/**
 * Get a battle from storage (backward compatibility)
 * @param {String} battleId - ID of the battle to get
 * @returns {Promise<Object>} - Battle object
 */
export async function getBattle(battleId) {
  return Storage.getBattle(null, Storage.DEFAULT_NAMESPACE, battleId);
}

/**
 * Get all battles from storage (backward compatibility)
 * @returns {Promise<Array>} - Array of battle objects
 */
export async function getAllBattles() {
  return Storage.getAllBattles(null, Storage.DEFAULT_NAMESPACE);
}

/**
 * Get battles for a domain from storage (backward compatibility)
 * @param {String} domainId - ID of the domain to get battles for
 * @returns {Promise<Array>} - Array of battle objects
 */
export async function getBattlesForDomain(domainId) {
  return Storage.getBattlesForDomain(null, Storage.DEFAULT_NAMESPACE, domainId);
}

/**
 * Save a battle to storage (backward compatibility)
 * @param {Object} battle - Battle object to save
 * @returns {Promise<Object>} - Saved battle object
 */
export async function saveBattle(battle) {
  return Storage.saveBattle(null, Storage.DEFAULT_NAMESPACE, battle);
}

/**
 * Delete a battle from storage (backward compatibility)
 * @param {String} battleId - ID of the battle to delete
 * @returns {Promise<Boolean>} - Whether the battle was deleted
 */
export async function deleteBattle(battleId) {
  return Storage.deleteBattle(null, Storage.DEFAULT_NAMESPACE, battleId);
}

/**
 * Get an intrigue session from storage (backward compatibility)
 * @param {String} intrigueId - ID of the intrigue session to get
 * @returns {Promise<Object>} - Intrigue session object
 */
export async function getIntrigue(intrigueId) {
  return Storage.getIntrigue(null, Storage.DEFAULT_NAMESPACE, intrigueId);
}

/**
 * Get all intrigue sessions from storage (backward compatibility)
 * @returns {Promise<Array>} - Array of intrigue session objects
 */
export async function getAllIntrigues() {
  return Storage.getAllIntrigues(null, Storage.DEFAULT_NAMESPACE);
}

/**
 * Get intrigue sessions for a domain from storage (backward compatibility)
 * @param {String} domainId - ID of the domain to get intrigue sessions for
 * @returns {Promise<Array>} - Array of intrigue session objects
 */
export async function getIntriguesForDomain(domainId) {
  return Storage.getIntriguesForDomain(null, Storage.DEFAULT_NAMESPACE, domainId);
}

/**
 * Save an intrigue session to storage (backward compatibility)
 * @param {Object} intrigue - Intrigue session object to save
 * @returns {Promise<Object>} - Saved intrigue session object
 */
export async function saveIntrigue(intrigue) {
  return Storage.saveIntrigue(null, Storage.DEFAULT_NAMESPACE, intrigue);
}

/**
 * Delete an intrigue session from storage (backward compatibility)
 * @param {String} intrigueId - ID of the intrigue session to delete
 * @returns {Promise<Boolean>} - Whether the intrigue session was deleted
 */
export async function deleteIntrigue(intrigueId) {
  return Storage.deleteIntrigue(null, Storage.DEFAULT_NAMESPACE, intrigueId);
}

/**
 * Get data for a Discord server (backward compatibility)
 * @param {String} serverId - ID of the Discord server
 * @returns {Promise<Object>} - Server data
 */
export async function getServerData(serverId) {
  return Storage.getServerData(null, Storage.DEFAULT_NAMESPACE, serverId);
}

/**
 * Save data for a Discord server (backward compatibility)
 * @param {String} serverId - ID of the Discord server
 * @param {Object} data - Server data to save
 * @returns {Promise<Object>} - Saved server data
 */
export async function saveServerData(serverId, data) {
  return Storage.saveServerData(null, Storage.DEFAULT_NAMESPACE, serverId, data);
}

/**
 * Get data for a Discord channel (backward compatibility)
 * @param {String} channelId - ID of the Discord channel
 * @returns {Promise<Object>} - Channel data
 */
export async function getChannelData(channelId) {
  return Storage.getChannelData(null, Storage.DEFAULT_NAMESPACE, channelId);
}

/**
 * Save data for a Discord channel (backward compatibility)
 * @param {String} channelId - ID of the Discord channel
 * @param {Object} data - Channel data to save
 * @returns {Promise<Object>} - Saved channel data
 */
export async function saveChannelData(channelId, data) {
  return Storage.saveChannelData(null, Storage.DEFAULT_NAMESPACE, channelId, data);
}

/**
 * Get data for a Discord user (backward compatibility)
 * @param {String} userId - ID of the Discord user
 * @returns {Promise<Object>} - User data
 */
export async function getUserData(userId) {
  return Storage.getUserData(null, Storage.DEFAULT_NAMESPACE, userId);
}

/**
 * Save data for a Discord user (backward compatibility)
 * @param {String} userId - ID of the Discord user
 * @param {Object} data - User data to save
 * @returns {Promise<Object>} - Saved user data
 */
export async function saveUserData(userId, data) {
  return Storage.saveUserData(null, Storage.DEFAULT_NAMESPACE, userId, data);
}

/**
 * Clear all data from storage (backward compatibility)
 * @returns {Promise<Boolean>} - Whether the data was cleared
 */
export async function clearAllData() {
  return Storage.clearAllData(null, Storage.DEFAULT_NAMESPACE);
}
