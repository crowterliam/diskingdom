/**
 * Core storage utility for Kingdoms & Warfare
 * Provides basic functions for storing and retrieving data
 * Supports both in-memory storage for development and Cloudflare KV for production
 */

// Default namespace for KV storage
export const DEFAULT_NAMESPACE = 'KNW_DATA';

// In-memory storage for development
export const memoryStorage = {
  units: {},
  domains: {},
  battles: {},
  intrigues: {},
};

// Prefix keys for different data types
export const KEY_PREFIXES = {
  UNIT: 'unit:',
  DOMAIN: 'domain:',
  BATTLE: 'battle:',
  INTRIGUE: 'intrigue:',
  SERVER: 'server:',
  CHANNEL: 'channel:',
  USER: 'user:',
  INDEX: 'index:',
};

/**
 * Check if we're running in a Cloudflare Worker environment
 * @param {Object} env - Environment variables
 * @returns {Boolean} - Whether we're in a Cloudflare Worker environment
 */
export function isCloudflareEnvironment(env) {
  return env && typeof env === 'object' && env[DEFAULT_NAMESPACE];
}

/**
 * Get the KV namespace from the environment
 * @param {Object} env - Environment variables
 * @param {String} namespace - Namespace to use
 * @returns {Object} - KV namespace
 */
export function getKVNamespace(env, namespace = DEFAULT_NAMESPACE) {
  // If namespace is a string and env has that namespace, return it
  if (typeof namespace === 'string' && env && env[namespace]) {
    return env[namespace];
  }
  
  // If env is null or undefined, return null
  if (!env) {
    return null;
  }
  
  // If namespace is the actual KV namespace object, return it
  if (typeof namespace === 'object' && namespace !== null) {
    return namespace;
  }
  
  // Default to the default namespace
  return env[DEFAULT_NAMESPACE];
}

/**
 * Get a value from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} key - Key to get
 * @returns {Promise<Object>} - Value
 */
export async function getValue(env, namespace, key) {
  if (isCloudflareEnvironment(env)) {
    const kv = getKVNamespace(env, namespace);
    const value = await kv.get(key, { type: 'json' });
    return value;
  }
  
  // Use in-memory storage
  const parts = key.split(':');
  const type = parts[0];
  const id = parts[1];
  
  switch (type) {
    case 'unit':
      return memoryStorage.units[id] || null;
    case 'domain':
      return memoryStorage.domains[id] || null;
    case 'battle':
      return memoryStorage.battles[id] || null;
    case 'intrigue':
      return memoryStorage.intrigues[id] || null;
    default:
      return memoryStorage[key] || null;
  }
}

/**
 * Put a value in storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} key - Key to put
 * @param {Object} value - Value to put
 * @returns {Promise<void>}
 */
export async function putValue(env, namespace, key, value) {
  if (isCloudflareEnvironment(env)) {
    const kv = getKVNamespace(env, namespace);
    await kv.put(key, JSON.stringify(value));
    return;
  }
  
  // Use in-memory storage
  const parts = key.split(':');
  const type = parts[0];
  const id = parts[1];
  
  switch (type) {
    case 'unit':
      memoryStorage.units[id] = value;
      break;
    case 'domain':
      memoryStorage.domains[id] = value;
      break;
    case 'battle':
      memoryStorage.battles[id] = value;
      break;
    case 'intrigue':
      memoryStorage.intrigues[id] = value;
      break;
    default:
      memoryStorage[key] = value;
      break;
  }
}

/**
 * Delete a value from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} key - Key to delete
 * @returns {Promise<void>}
 */
export async function deleteValue(env, namespace, key) {
  if (isCloudflareEnvironment(env)) {
    const kv = getKVNamespace(env, namespace);
    await kv.delete(key);
    return;
  }
  
  // Use in-memory storage
  const parts = key.split(':');
  const type = parts[0];
  const id = parts[1];
  
  switch (type) {
    case 'unit':
      delete memoryStorage.units[id];
      break;
    case 'domain':
      delete memoryStorage.domains[id];
      break;
    case 'battle':
      delete memoryStorage.battles[id];
      break;
    case 'intrigue':
      delete memoryStorage.intrigues[id];
      break;
    default:
      delete memoryStorage[key];
      break;
  }
}

/**
 * List keys with a prefix
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} prefix - Prefix to list
 * @returns {Promise<Array>} - Array of keys
 */
export async function listKeys(env, namespace, prefix) {
  if (isCloudflareEnvironment(env)) {
    const kv = getKVNamespace(env, namespace);
    const { keys } = await kv.list({ prefix });
    return keys.map(key => key.name);
  }
  
  // Use in-memory storage
  switch (prefix) {
    case KEY_PREFIXES.UNIT:
      return Object.keys(memoryStorage.units).map(id => `${KEY_PREFIXES.UNIT}${id}`);
    case KEY_PREFIXES.DOMAIN:
      return Object.keys(memoryStorage.domains).map(id => `${KEY_PREFIXES.DOMAIN}${id}`);
    case KEY_PREFIXES.BATTLE:
      return Object.keys(memoryStorage.battles).map(id => `${KEY_PREFIXES.BATTLE}${id}`);
    case KEY_PREFIXES.INTRIGUE:
      return Object.keys(memoryStorage.intrigues).map(id => `${KEY_PREFIXES.INTRIGUE}${id}`);
    default:
      return Object.keys(memoryStorage)
        .filter(key => key.startsWith(prefix))
        .map(key => key);
  }
}

/**
 * Clear all data from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Boolean>} - Whether the data was cleared
 */
export async function clearAllData(env, namespace = DEFAULT_NAMESPACE) {
  if (isCloudflareEnvironment(env)) {
    const kv = getKVNamespace(env, namespace);
    
    // List all keys
    const { keys } = await kv.list();
    
    // Delete all keys
    await Promise.all(keys.map(key => kv.delete(key.name)));
    
    return true;
  }
  
  // Clear in-memory storage
  Object.keys(memoryStorage).forEach(key => {
    delete memoryStorage[key];
  });
  
  // Reset the storage
  memoryStorage.units = {};
  memoryStorage.domains = {};
  memoryStorage.battles = {};
  memoryStorage.intrigues = {};
  
  return true;
}
