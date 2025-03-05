/**
 * Unit storage utility for Kingdoms & Warfare
 * Provides functions for storing and retrieving unit data
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
 * Get a unit from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} unitId - ID of the unit to get
 * @returns {Promise<Object>} - Unit object
 */
export async function getUnit(env, namespace = DEFAULT_NAMESPACE, unitId) {
  return getValue(env, namespace, `${KEY_PREFIXES.UNIT}${unitId}`);
}

/**
 * Get all units from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of unit objects
 */
export async function getAllUnits(env, namespace = DEFAULT_NAMESPACE) {
  const keys = await listKeys(env, namespace, KEY_PREFIXES.UNIT);
  const units = await Promise.all(keys.map(key => getValue(env, namespace, key)));
  return units.filter(unit => unit !== null);
}

/**
 * Get units for a domain from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get units for
 * @returns {Promise<Array>} - Array of unit objects
 */
export async function getUnitsForDomain(env, namespace = DEFAULT_NAMESPACE, domainId) {
  const domain = await getValue(env, namespace, `${KEY_PREFIXES.DOMAIN}${domainId}`);
  
  if (!domain || !domain.units || domain.units.length === 0) {
    return [];
  }
  
  const units = await Promise.all(domain.units.map(unitId => getUnit(env, namespace, unitId)));
  return units.filter(unit => unit !== null);
}

/**
 * Save a unit to storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} unit - Unit object to save
 * @returns {Promise<Object>} - Saved unit object
 */
export async function saveUnit(env, namespace = DEFAULT_NAMESPACE, unit) {
  const updatedUnit = {
    ...unit,
    updated: new Date().toISOString(),
  };
  
  await putValue(env, namespace, `${KEY_PREFIXES.UNIT}${unit.id}`, updatedUnit);
  
  // Update the unit index
  const indexKey = `${KEY_PREFIXES.INDEX}units`;
  const unitIndex = await getValue(env, namespace, indexKey) || [];
  
  if (!unitIndex.includes(unit.id)) {
    unitIndex.push(unit.id);
    await putValue(env, namespace, indexKey, unitIndex);
  }
  
  return updatedUnit;
}

/**
 * Delete a unit from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} unitId - ID of the unit to delete
 * @returns {Promise<Boolean>} - Whether the unit was deleted
 */
export async function deleteUnit(env, namespace = DEFAULT_NAMESPACE, unitId) {
  const unit = await getUnit(env, namespace, unitId);
  
  if (!unit) {
    return false;
  }
  
  await deleteValue(env, namespace, `${KEY_PREFIXES.UNIT}${unitId}`);
  
  // Update the unit index
  const indexKey = `${KEY_PREFIXES.INDEX}units`;
  const unitIndex = await getValue(env, namespace, indexKey) || [];
  
  if (unitIndex.includes(unitId)) {
    const updatedIndex = unitIndex.filter(id => id !== unitId);
    await putValue(env, namespace, indexKey, updatedIndex);
  }
  
  // Remove the unit from any domains
  const domainKeys = await listKeys(env, namespace, KEY_PREFIXES.DOMAIN);
  
  for (const domainKey of domainKeys) {
    const domain = await getValue(env, namespace, domainKey);
    
    if (domain && domain.units && domain.units.includes(unitId)) {
      domain.units = domain.units.filter(id => id !== unitId);
      await putValue(env, namespace, domainKey, domain);
    }
  }
  
  return true;
}
