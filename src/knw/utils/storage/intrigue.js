/**
 * Intrigue storage utility for Kingdoms & Warfare
 * Provides functions for storing and retrieving intrigue data
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
 * Get an intrigue session from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session to get
 * @returns {Promise<Object>} - Intrigue session object
 */
export async function getIntrigue(env, namespace = DEFAULT_NAMESPACE, intrigueId) {
  return getValue(env, namespace, `${KEY_PREFIXES.INTRIGUE}${intrigueId}`);
}

/**
 * Get all intrigue sessions from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @returns {Promise<Array>} - Array of intrigue session objects
 */
export async function getAllIntrigues(env, namespace = DEFAULT_NAMESPACE) {
  const keys = await listKeys(env, namespace, KEY_PREFIXES.INTRIGUE);
  const intrigues = await Promise.all(keys.map(key => getValue(env, namespace, key)));
  return intrigues.filter(intrigue => intrigue !== null);
}

/**
 * Get intrigue sessions for a domain from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} domainId - ID of the domain to get intrigue sessions for
 * @returns {Promise<Array>} - Array of intrigue session objects
 */
export async function getIntriguesForDomain(env, namespace = DEFAULT_NAMESPACE, domainId) {
  const intrigues = await getAllIntrigues(env, namespace);
  return intrigues.filter(intrigue => intrigue.domains && intrigue.domains.includes(domainId));
}

/**
 * Save an intrigue session to storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {Object} intrigue - Intrigue session object to save
 * @returns {Promise<Object>} - Saved intrigue session object
 */
export async function saveIntrigue(env, namespace = DEFAULT_NAMESPACE, intrigue) {
  const updatedIntrigue = {
    ...intrigue,
    updated: new Date().toISOString(),
  };
  
  await putValue(env, namespace, `${KEY_PREFIXES.INTRIGUE}${intrigue.id}`, updatedIntrigue);
  
  // Update the intrigue index
  const indexKey = `${KEY_PREFIXES.INDEX}intrigues`;
  const intrigueIndex = await getValue(env, namespace, indexKey) || [];
  
  if (!intrigueIndex.includes(intrigue.id)) {
    intrigueIndex.push(intrigue.id);
    await putValue(env, namespace, indexKey, intrigueIndex);
  }
  
  return updatedIntrigue;
}

/**
 * Delete an intrigue session from storage
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session to delete
 * @returns {Promise<Boolean>} - Whether the intrigue session was deleted
 */
export async function deleteIntrigue(env, namespace = DEFAULT_NAMESPACE, intrigueId) {
  const intrigue = await getIntrigue(env, namespace, intrigueId);
  
  if (!intrigue) {
    return false;
  }
  
  await deleteValue(env, namespace, `${KEY_PREFIXES.INTRIGUE}${intrigueId}`);
  
  // Update the intrigue index
  const indexKey = `${KEY_PREFIXES.INDEX}intrigues`;
  const intrigueIndex = await getValue(env, namespace, indexKey) || [];
  
  if (intrigueIndex.includes(intrigueId)) {
    const updatedIndex = intrigueIndex.filter(id => id !== intrigueId);
    await putValue(env, namespace, indexKey, updatedIndex);
  }
  
  return true;
}

/**
 * Find intrigue sessions by name
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} name - Name to search for
 * @returns {Promise<Array>} - Array of matching intrigue session objects
 */
export async function findIntriguesByName(env, namespace = DEFAULT_NAMESPACE, name) {
  const intrigues = await getAllIntrigues(env, namespace);
  return intrigues.filter(intrigue => 
    intrigue.name.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Add a domain to an intrigue session
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session
 * @param {String} domainId - ID of the domain to add
 * @returns {Promise<Object>} - Updated intrigue session object
 */
export async function addDomainToIntrigue(env, namespace = DEFAULT_NAMESPACE, intrigueId, domainId) {
  const intrigue = await getIntrigue(env, namespace, intrigueId);
  
  if (!intrigue) {
    return null;
  }
  
  if (!intrigue.domains) {
    intrigue.domains = [];
  }
  
  if (!intrigue.domains.includes(domainId)) {
    intrigue.domains.push(domainId);
    return saveIntrigue(env, namespace, intrigue);
  }
  
  return intrigue;
}

/**
 * Remove a domain from an intrigue session
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session
 * @param {String} domainId - ID of the domain to remove
 * @returns {Promise<Object>} - Updated intrigue session object
 */
export async function removeDomainFromIntrigue(env, namespace = DEFAULT_NAMESPACE, intrigueId, domainId) {
  const intrigue = await getIntrigue(env, namespace, intrigueId);
  
  if (!intrigue || !intrigue.domains) {
    return intrigue;
  }
  
  let updated = false;
  
  if (intrigue.domains.includes(domainId)) {
    intrigue.domains = intrigue.domains.filter(id => id !== domainId);
    updated = true;
  }
  
  if (intrigue.initiator === domainId) {
    intrigue.initiator = null;
    updated = true;
  }
  
  if (updated) {
    return saveIntrigue(env, namespace, intrigue);
  }
  
  return intrigue;
}

/**
 * Set the initiator domain for an intrigue session
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session
 * @param {String} domainId - ID of the initiator domain
 * @returns {Promise<Object>} - Updated intrigue session object
 */
export async function setIntrigueInitiator(env, namespace = DEFAULT_NAMESPACE, intrigueId, domainId) {
  const intrigue = await getIntrigue(env, namespace, intrigueId);
  
  if (!intrigue) {
    return null;
  }
  
  // Make sure the domain is in the intrigue session
  if (!intrigue.domains || !intrigue.domains.includes(domainId)) {
    if (!intrigue.domains) {
      intrigue.domains = [];
    }
    
    intrigue.domains.push(domainId);
  }
  
  intrigue.initiator = domainId;
  
  return saveIntrigue(env, namespace, intrigue);
}

/**
 * Add a turn to an intrigue session
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session
 * @param {String} domainId - ID of the domain taking the turn
 * @param {Object} action - Action to take
 * @returns {Promise<Object>} - Updated intrigue session object
 */
export async function addIntrigueTurn(env, namespace = DEFAULT_NAMESPACE, intrigueId, domainId, action) {
  const intrigue = await getIntrigue(env, namespace, intrigueId);
  
  if (!intrigue) {
    return null;
  }
  
  // Make sure the domain is in the intrigue session
  if (!intrigue.domains || !intrigue.domains.includes(domainId)) {
    return intrigue;
  }
  
  // Initialize turns array if it doesn't exist
  if (!intrigue.turns) {
    intrigue.turns = [];
  }
  
  // Add the turn
  intrigue.turns.push({
    domainId,
    action,
    timestamp: new Date().toISOString(),
  });
  
  // Log the turn
  if (!intrigue.log) {
    intrigue.log = [];
  }
  
  intrigue.log.push({
    type: 'turn_taken',
    domainId,
    action,
    timestamp: new Date().toISOString(),
  });
  
  // Advance to the next domain
  if (intrigue.turnOrder && intrigue.turnOrder.length > 0) {
    intrigue.currentDomainIndex = (intrigue.currentDomainIndex + 1) % intrigue.turnOrder.length;
  }
  
  return saveIntrigue(env, namespace, intrigue);
}

/**
 * Start an intrigue session
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session
 * @returns {Promise<Object>} - Updated intrigue session object
 */
export async function startIntrigue(env, namespace = DEFAULT_NAMESPACE, intrigueId) {
  const intrigue = await getIntrigue(env, namespace, intrigueId);
  
  if (!intrigue) {
    return null;
  }
  
  // Check if the intrigue session is in the setup phase
  if (intrigue.phase !== 'setup') {
    return intrigue;
  }
  
  // Check if there's an initiator
  if (!intrigue.initiator) {
    return intrigue;
  }
  
  // Check if there are at least two domains
  if (!intrigue.domains || intrigue.domains.length < 2) {
    return intrigue;
  }
  
  // Start the intrigue session
  intrigue.phase = 'active';
  
  // Set the turn order if it's not already set
  if (!intrigue.turnOrder || intrigue.turnOrder.length === 0) {
    // The initiator goes first, followed by the other domains in the order they were added
    const otherDomains = intrigue.domains.filter(id => id !== intrigue.initiator);
    intrigue.turnOrder = [intrigue.initiator, ...otherDomains];
  }
  
  // Initialize the current domain index
  intrigue.currentDomainIndex = 0;
  
  // Log the intrigue start
  if (!intrigue.log) {
    intrigue.log = [];
  }
  
  intrigue.log.push({
    type: 'intrigue_start',
    timestamp: new Date().toISOString(),
  });
  
  return saveIntrigue(env, namespace, intrigue);
}

/**
 * End an intrigue session
 * @param {Object} env - Environment variables
 * @param {String} namespace - KV namespace
 * @param {String} intrigueId - ID of the intrigue session
 * @returns {Promise<Object>} - Updated intrigue session object
 */
export async function endIntrigue(env, namespace = DEFAULT_NAMESPACE, intrigueId) {
  const intrigue = await getIntrigue(env, namespace, intrigueId);
  
  if (!intrigue) {
    return null;
  }
  
  // Check if the intrigue session is in the active phase
  if (intrigue.phase !== 'active') {
    return intrigue;
  }
  
  // End the intrigue session
  intrigue.phase = 'resolution';
  
  // Log the intrigue end
  if (!intrigue.log) {
    intrigue.log = [];
  }
  
  intrigue.log.push({
    type: 'intrigue_end',
    timestamp: new Date().toISOString(),
  });
  
  return saveIntrigue(env, namespace, intrigue);
}
