/**
 * Domain storage utility for Kingdoms & Warfare
 * Provides functions for storing and retrieving domain data
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
 * Get a domain from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get
 * @returns {Promise<Object>} - Domain object
 */
export async function getDomain(env, namespace = DEFAULT_NAMESPACE, domainId) {
  return getValue(env, namespace, `${KEY_PREFIXES.DOMAIN}${domainId}`);
}

/**
 * Get all domains from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of domain objects
 */
export async function getAllDomains(env, namespace = DEFAULT_NAMESPACE) {
  const keys = await listKeys(env, namespace, KEY_PREFIXES.DOMAIN);
  const domains = await Promise.all(keys.map(key => getValue(env, namespace, key)));
  return domains.filter(domain => domain !== null);
}

/**
 * Save a domain to storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} domain - Domain object to save
 * @returns {Promise<Object>} - Saved domain object
 */
export async function saveDomain(env, namespace = DEFAULT_NAMESPACE, domain) {
  const updatedDomain = {
    ...domain,
    updated: new Date().toISOString(),
  };
  
  await putValue(env, namespace, `${KEY_PREFIXES.DOMAIN}${domain.id}`, updatedDomain);
  
  // Update the domain index
  const indexKey = `${KEY_PREFIXES.INDEX}domains`;
  const domainIndex = await getValue(env, namespace, indexKey) || [];
  
  if (!domainIndex.includes(domain.id)) {
    domainIndex.push(domain.id);
    await putValue(env, namespace, indexKey, domainIndex);
  }
  
  return updatedDomain;
}

/**
 * Delete a domain from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to delete
 * @returns {Promise<Boolean>} - Whether the domain was deleted
 */
export async function deleteDomain(env, namespace = DEFAULT_NAMESPACE, domainId) {
  const domain = await getDomain(env, namespace, domainId);
  
  if (!domain) {
    return false;
  }
  
  await deleteValue(env, namespace, `${KEY_PREFIXES.DOMAIN}${domainId}`);
  
  // Update the domain index
  const indexKey = `${KEY_PREFIXES.INDEX}domains`;
  const domainIndex = await getValue(env, namespace, indexKey) || [];
  
  if (domainIndex.includes(domainId)) {
    const updatedIndex = domainIndex.filter(id => id !== domainId);
    await putValue(env, namespace, indexKey, updatedIndex);
  }
  
  // Remove the domain from any battles
  const battleKeys = await listKeys(env, namespace, KEY_PREFIXES.BATTLE);
  
  for (const battleKey of battleKeys) {
    const battle = await getValue(env, namespace, battleKey);
    
    if (battle && battle.domains && battle.domains.includes(domainId)) {
      battle.domains = battle.domains.filter(id => id !== domainId);
      await putValue(env, namespace, battleKey, battle);
    }
  }
  
  // Remove the domain from any intrigues
  const intrigueKeys = await listKeys(env, namespace, KEY_PREFIXES.INTRIGUE);
  
  for (const intrigueKey of intrigueKeys) {
    const intrigue = await getValue(env, namespace, intrigueKey);
    let updated = false;
    
    if (intrigue && intrigue.domains && intrigue.domains.includes(domainId)) {
      intrigue.domains = intrigue.domains.filter(id => id !== domainId);
      updated = true;
    }
    
    if (intrigue && intrigue.initiator === domainId) {
      intrigue.initiator = null;
      updated = true;
    }
    
    if (updated) {
      await putValue(env, namespace, intrigueKey, intrigue);
    }
  }
  
  return true;
}

/**
 * Find domains by name
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} name - Name to search for
 * @returns {Promise<Array>} - Array of matching domain objects
 */
export async function findDomainsByName(env, namespace = DEFAULT_NAMESPACE, name) {
  const domains = await getAllDomains(env, namespace);
  return domains.filter(domain => 
    domain.name.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Add a unit to a domain
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain
 * @param {String} unitId - ID of the unit to add
 * @returns {Promise<Object>} - Updated domain object
 */
export async function addUnitToDomain(env, namespace = DEFAULT_NAMESPACE, domainId, unitId) {
  const domain = await getDomain(env, namespace, domainId);
  
  if (!domain) {
    return null;
  }
  
  if (!domain.units) {
    domain.units = [];
  }
  
  if (!domain.units.includes(unitId)) {
    domain.units.push(unitId);
    return saveDomain(env, namespace, domain);
  }
  
  return domain;
}

/**
 * Remove a unit from a domain
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain
 * @param {String} unitId - ID of the unit to remove
 * @returns {Promise<Object>} - Updated domain object
 */
export async function removeUnitFromDomain(env, namespace = DEFAULT_NAMESPACE, domainId, unitId) {
  const domain = await getDomain(env, namespace, domainId);
  
  if (!domain || !domain.units) {
    return domain;
  }
  
  if (domain.units.includes(unitId)) {
    domain.units = domain.units.filter(id => id !== unitId);
    return saveDomain(env, namespace, domain);
  }
  
  return domain;
}
