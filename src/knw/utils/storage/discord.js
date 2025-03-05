/**
 * Discord storage utility for Kingdoms & Warfare
 * Provides functions for storing and retrieving Discord-related data
 */

import { 
  DEFAULT_NAMESPACE, 
  KEY_PREFIXES, 
  getValue, 
  putValue 
} from './core.js';

/**
 * Get data for a Discord server
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} serverId - ID of the Discord server
 * @returns {Promise<Object>} - Server data
 */
export async function getServerData(env, namespace = DEFAULT_NAMESPACE, serverId) {
  const key = `${KEY_PREFIXES.SERVER}${serverId}`;
  const data = await getValue(env, namespace, key);
  
  if (!data) {
    // Initialize server data if it doesn't exist
    return {
      id: serverId,
      units: [],
      domains: [],
      battles: [],
      intrigues: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
  }
  
  return data;
}

/**
 * Save data for a Discord server
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} serverId - ID of the Discord server
 * @param {Object} data - Server data to save
 * @returns {Promise<Object>} - Saved server data
 */
export async function saveServerData(env, namespace = DEFAULT_NAMESPACE, serverId, data) {
  const key = `${KEY_PREFIXES.SERVER}${serverId}`;
  const updatedData = {
    ...data,
    updated: new Date().toISOString(),
  };
  
  await putValue(env, namespace, key, updatedData);
  
  return updatedData;
}

/**
 * Get data for a Discord channel
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @returns {Promise<Object>} - Channel data
 */
export async function getChannelData(env, namespace = DEFAULT_NAMESPACE, channelId) {
  const key = `${KEY_PREFIXES.CHANNEL}${channelId}`;
  const data = await getValue(env, namespace, key);
  
  if (!data) {
    // Initialize channel data if it doesn't exist
    return {
      id: channelId,
      activeBattle: null,
      activeIntrigue: null,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
  }
  
  return data;
}

/**
 * Save data for a Discord channel
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @param {Object} data - Channel data to save
 * @returns {Promise<Object>} - Saved channel data
 */
export async function saveChannelData(env, namespace = DEFAULT_NAMESPACE, channelId, data) {
  const key = `${KEY_PREFIXES.CHANNEL}${channelId}`;
  const updatedData = {
    ...data,
    updated: new Date().toISOString(),
  };
  
  await putValue(env, namespace, key, updatedData);
  
  return updatedData;
}

/**
 * Get data for a Discord user
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} userId - ID of the Discord user
 * @returns {Promise<Object>} - User data
 */
export async function getUserData(env, namespace = DEFAULT_NAMESPACE, userId) {
  const key = `${KEY_PREFIXES.USER}${userId}`;
  const data = await getValue(env, namespace, key);
  
  if (!data) {
    // Initialize user data if it doesn't exist
    return {
      id: userId,
      domains: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
  }
  
  return data;
}

/**
 * Save data for a Discord user
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} userId - ID of the Discord user
 * @param {Object} data - User data to save
 * @returns {Promise<Object>} - Saved user data
 */
export async function saveUserData(env, namespace = DEFAULT_NAMESPACE, userId, data) {
  const key = `${KEY_PREFIXES.USER}${userId}`;
  const updatedData = {
    ...data,
    updated: new Date().toISOString(),
  };
  
  await putValue(env, namespace, key, updatedData);
  
  return updatedData;
}

/**
 * Set the active battle for a channel
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @param {String} battleId - ID of the battle to set as active
 * @returns {Promise<Object>} - Updated channel data
 */
export async function setActiveBattle(env, namespace = DEFAULT_NAMESPACE, channelId, battleId) {
  const channelData = await getChannelData(env, namespace, channelId);
  
  channelData.activeBattle = battleId;
  
  return saveChannelData(env, namespace, channelId, channelData);
}

/**
 * Get the active battle for a channel
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @returns {Promise<String>} - ID of the active battle
 */
export async function getActiveBattle(env, namespace = DEFAULT_NAMESPACE, channelId) {
  const channelData = await getChannelData(env, namespace, channelId);
  
  return channelData.activeBattle;
}

/**
 * Set the active intrigue session for a channel
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @param {String} intrigueId - ID of the intrigue session to set as active
 * @returns {Promise<Object>} - Updated channel data
 */
export async function setActiveIntrigue(env, namespace = DEFAULT_NAMESPACE, channelId, intrigueId) {
  const channelData = await getChannelData(env, namespace, channelId);
  
  channelData.activeIntrigue = intrigueId;
  
  return saveChannelData(env, namespace, channelId, channelData);
}

/**
 * Get the active intrigue session for a channel
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} channelId - ID of the Discord channel
 * @returns {Promise<String>} - ID of the active intrigue session
 */
export async function getActiveIntrigue(env, namespace = DEFAULT_NAMESPACE, channelId) {
  const channelData = await getChannelData(env, namespace, channelId);
  
  return channelData.activeIntrigue;
}

/**
 * Add a domain to a user
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} userId - ID of the Discord user
 * @param {String} domainId - ID of the domain to add
 * @returns {Promise<Object>} - Updated user data
 */
export async function addDomainToUser(env, namespace = DEFAULT_NAMESPACE, userId, domainId) {
  const userData = await getUserData(env, namespace, userId);
  
  if (!userData.domains) {
    userData.domains = [];
  }
  
  if (!userData.domains.includes(domainId)) {
    userData.domains.push(domainId);
    return saveUserData(env, namespace, userId, userData);
  }
  
  return userData;
}

/**
 * Remove a domain from a user
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} userId - ID of the Discord user
 * @param {String} domainId - ID of the domain to remove
 * @returns {Promise<Object>} - Updated user data
 */
export async function removeDomainFromUser(env, namespace = DEFAULT_NAMESPACE, userId, domainId) {
  const userData = await getUserData(env, namespace, userId);
  
  if (!userData.domains) {
    return userData;
  }
  
  if (userData.domains.includes(domainId)) {
    userData.domains = userData.domains.filter(id => id !== domainId);
    return saveUserData(env, namespace, userId, userData);
  }
  
  return userData;
}
