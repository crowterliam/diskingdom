/**
 * Storage utility for Kingdoms & Warfare
 * Main entry point that exports all storage functions
 */

// Export core storage functions
export {
  DEFAULT_NAMESPACE,
  KEY_PREFIXES,
  memoryStorage,
  isCloudflareEnvironment,
  getKVNamespace,
  getValue,
  putValue,
  deleteValue,
  listKeys,
  clearAllData,
} from './core.js';

// Export unit storage functions
export {
  getUnit,
  getAllUnits,
  getUnitsForDomain,
  saveUnit,
  deleteUnit,
} from './unit.js';

// Export domain storage functions
export {
  getDomain,
  getAllDomains,
  saveDomain,
  deleteDomain,
  findDomainsByName,
  addUnitToDomain,
  removeUnitFromDomain,
} from './domain.js';

// Export battle storage functions
export {
  getBattle,
  getAllBattles,
  getBattlesForDomain,
  saveBattle,
  deleteBattle,
  findBattlesByName,
  addDomainToBattle,
  removeDomainFromBattle,
  addUnitToBattle,
  removeUnitFromBattle,
} from './battle.js';

// Export intrigue storage functions
export {
  getIntrigue,
  getAllIntrigues,
  getIntriguesForDomain,
  saveIntrigue,
  deleteIntrigue,
  findIntriguesByName,
  addDomainToIntrigue,
  removeDomainFromIntrigue,
  setIntrigueInitiator,
  addIntrigueTurn,
  startIntrigue,
  endIntrigue,
} from './intrigue.js';

// Export Discord storage functions
export {
  getServerData,
  saveServerData,
  getChannelData,
  saveChannelData,
  getUserData,
  saveUserData,
  setActiveBattle,
  getActiveBattle,
  setActiveIntrigue,
  getActiveIntrigue,
  addDomainToUser,
  removeDomainFromUser,
} from './discord.js';
