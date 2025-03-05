/**
 * Battle command handlers for Kingdoms & Warfare
 * Handles Discord commands related to warfare battles
 */

import { InteractionResponseType } from 'discord-interactions';
import { v4 as uuidv4 } from 'uuid';

import * as Battle from '../../models/battle.js';
import * as Storage from '../../utils/storage.js';
import * as Formatter from '../../utils/formatter.js';

/**
 * Handle battle commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} subCommand - Subcommand data
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleBattleCommand(interaction, subCommand, env) {
  const { options } = subCommand;
  const action = options.find(opt => opt.name === 'action')?.value;
  
  switch (action) {
    case 'create':
      return handleCreateBattle(interaction, options, env);
    
    case 'view':
      return handleViewBattle(interaction, options, env);
    
    case 'list':
      return handleListBattles(interaction, options, env);
    
    case 'delete':
      return handleDeleteBattle(interaction, options, env);
    
    case 'start':
      return handleStartBattle(interaction, options, env);
    
    case 'end':
      return handleEndBattle(interaction, options, env);
    
    case 'add_domain':
      return handleAddDomainToBattle(interaction, options, env);
    
    case 'add_unit':
      return handleAddUnitToBattle(interaction, options, env);
    
    case 'deploy_unit':
      return handleDeployUnit(interaction, options, env);
    
    case 'set_initiative':
      return handleSetInitiative(interaction, options, env);
    
    case 'next_turn':
      return handleNextTurn(interaction, options, env);
    
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unknown battle action: ${action}`,
        },
      };
  }
}

/**
 * Handle creating a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleCreateBattle(interaction, options, env) {
  const name = options.find(opt => opt.name === 'name')?.value;
  
  // Check if the name is provided
  if (!name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a name for the battle',
      },
    };
  }
  
  // Create the battle
  const battle = Battle.createBattle({
    name,
  });
  
  // Save the battle
  await Storage.saveBattle(battle);
  
  // Save the battle to the channel
  const channelData = await Storage.getChannelData(interaction.channel_id);
  channelData.activeBattle = battle.id;
  await Storage.saveChannelData(interaction.channel_id, channelData);
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(battle);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Battle created:\n\n${formattedBattle}`,
    },
  };
}

/**
 * Handle viewing a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleViewBattle(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Get the domains and units for the battle
  const domains = {};
  const units = {};
  
  // Get the domains
  for (const domainId of battle.domains) {
    const domain = await Storage.getDomain(domainId);
    if (domain) {
      domains[domainId] = domain;
    }
  }
  
  // Get the units
  for (const unitId of Object.keys(battle.units)) {
    const unit = await Storage.getUnit(unitId);
    if (unit) {
      units[unitId] = unit;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(battle, domains, units);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: formattedBattle,
    },
  };
}

/**
 * Handle listing battles
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleListBattles(interaction, options, env) {
  const domainName = options.find(opt => opt.name === 'domain')?.value;
  
  let battles;
  
  if (domainName) {
    // Get all domains
    const domains = await Storage.getAllDomains();
    
    // Find the domain by name
    const domain = domains.find(d => d.name.toLowerCase() === domainName.toLowerCase());
    
    if (!domain) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Domain not found: ${domainName}`,
        },
      };
    }
    
    // Get the battles for the domain
    battles = await Storage.getBattlesForDomain(domain.id);
  } else {
    // Get all battles
    battles = await Storage.getAllBattles();
  }
  
  if (battles.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: domainName ? `No battles found for domain: ${domainName}` : 'No battles found',
      },
    };
  }
  
  // Format the battles for display
  let formattedBattles = '';
  
  battles.forEach(battle => {
    const phaseFormatted = Object.entries(Battle.BATTLE_PHASES).find(([key, value]) => value === battle.phase)?.[0] || battle.phase;
    formattedBattles += `- **${battle.name}** (${phaseFormatted}, Round ${battle.round})\n`;
  });
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Battles${domainName ? ` for domain ${domainName}` : ''}:\n\n${formattedBattles}`,
    },
  };
}

/**
 * Handle deleting a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleDeleteBattle(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
    
    // Clear the active battle for the channel
    channelData.activeBattle = null;
    await Storage.saveChannelData(interaction.channel_id, channelData);
  }
  
  // Delete the battle
  const deleted = await Storage.deleteBattle(battleId);
  
  if (!deleted) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'Battle deleted',
    },
  };
}

/**
 * Handle starting a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleStartBattle(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Start the battle
  const updatedBattle = Battle.startBattle(battle);
  
  // Save the battle
  await Storage.saveBattle(updatedBattle);
  
  // Get the domains and units for the battle
  const domains = {};
  const units = {};
  
  // Get the domains
  for (const domainId of updatedBattle.domains) {
    const domain = await Storage.getDomain(domainId);
    if (domain) {
      domains[domainId] = domain;
    }
  }
  
  // Get the units
  for (const unitId of Object.keys(updatedBattle.units)) {
    const unit = await Storage.getUnit(unitId);
    if (unit) {
      units[unitId] = unit;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(updatedBattle, domains, units);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Battle started:\n\n${formattedBattle}`,
    },
  };
}

/**
 * Handle ending a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleEndBattle(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  const domainName = options.find(opt => opt.name === 'domain')?.value;
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Get the winning domain
  let winningDomainId;
  
  if (domainName) {
    // Get all domains
    const domains = await Storage.getAllDomains();
    
    // Find the domain by name
    const domain = domains.find(d => d.name.toLowerCase() === domainName.toLowerCase());
    
    if (!domain) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Domain not found: ${domainName}`,
        },
      };
    }
    
    winningDomainId = domain.id;
  }
  
  // End the battle
  const updatedBattle = Battle.endBattle(battle, winningDomainId);
  
  // Save the battle
  await Storage.saveBattle(updatedBattle);
  
  // Get the domains and units for the battle
  const domains = {};
  const units = {};
  
  // Get the domains
  for (const domainId of updatedBattle.domains) {
    const domain = await Storage.getDomain(domainId);
    if (domain) {
      domains[domainId] = domain;
    }
  }
  
  // Get the units
  for (const unitId of Object.keys(updatedBattle.units)) {
    const unit = await Storage.getUnit(unitId);
    if (unit) {
      units[unitId] = unit;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(updatedBattle, domains, units);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Battle ended:\n\n${formattedBattle}`,
    },
  };
}

/**
 * Handle adding a domain to a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleAddDomainToBattle(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  const domainName = options.find(opt => opt.name === 'domain')?.value;
  
  // Check if a domain name is provided
  if (!domainName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a domain name',
      },
    };
  }
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Get all domains
  const domains = await Storage.getAllDomains();
  
  // Find the domain by name
  const domain = domains.find(d => d.name.toLowerCase() === domainName.toLowerCase());
  
  if (!domain) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Domain not found: ${domainName}`,
      },
    };
  }
  
  // Add the domain to the battle
  const updatedBattle = Battle.addDomain(battle, domain.id);
  
  // Save the battle
  await Storage.saveBattle(updatedBattle);
  
  // Get the domains and units for the battle
  const battleDomains = {};
  const units = {};
  
  // Get the domains
  for (const domainId of updatedBattle.domains) {
    const d = await Storage.getDomain(domainId);
    if (d) {
      battleDomains[domainId] = d;
    }
  }
  
  // Get the units
  for (const unitId of Object.keys(updatedBattle.units)) {
    const unit = await Storage.getUnit(unitId);
    if (unit) {
      units[unitId] = unit;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(updatedBattle, battleDomains, units);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Domain added to battle:\n\n${formattedBattle}`,
    },
  };
}

/**
 * Handle adding a unit to a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleAddUnitToBattle(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  const unitName = options.find(opt => opt.name === 'unit')?.value;
  
  // Check if a unit name is provided
  if (!unitName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a unit name',
      },
    };
  }
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Get all units
  const units = await Storage.getAllUnits();
  
  // Find the unit by name
  const unit = units.find(u => u.name.toLowerCase() === unitName.toLowerCase());
  
  if (!unit) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Unit not found: ${unitName}`,
      },
    };
  }
  
  // Find the domain the unit belongs to
  const domains = await Storage.getAllDomains();
  let domainId;
  
  for (const domain of domains) {
    if (domain.units.includes(unit.id)) {
      domainId = domain.id;
      break;
    }
  }
  
  if (!domainId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Unit ${unitName} does not belong to any domain`,
      },
    };
  }
  
  // Add the unit to the battle
  const updatedBattle = Battle.addUnit(battle, unit.id, domainId);
  
  // Save the battle
  await Storage.saveBattle(updatedBattle);
  
  // Get the domains and units for the battle
  const battleDomains = {};
  const battleUnits = {};
  
  // Get the domains
  for (const dId of updatedBattle.domains) {
    const d = await Storage.getDomain(dId);
    if (d) {
      battleDomains[dId] = d;
    }
  }
  
  // Get the units
  for (const unitId of Object.keys(updatedBattle.units)) {
    const u = await Storage.getUnit(unitId);
    if (u) {
      battleUnits[unitId] = u;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(updatedBattle, battleDomains, battleUnits);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Unit added to battle:\n\n${formattedBattle}`,
    },
  };
}

/**
 * Handle deploying a unit in a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleDeployUnit(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  const unitName = options.find(opt => opt.name === 'unit')?.value;
  const rank = options.find(opt => opt.name === 'rank')?.value;
  const position = options.find(opt => opt.name === 'position')?.value;
  
  // Check if a unit name is provided
  if (!unitName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a unit name',
      },
    };
  }
  
  // Check if a rank is provided
  if (!rank) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a rank',
      },
    };
  }
  
  // Check if a position is provided for non-reserve ranks
  if (rank !== Battle.BATTLE_RANKS.RESERVE && !position) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a position',
      },
    };
  }
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Get all units
  const units = await Storage.getAllUnits();
  
  // Find the unit by name
  const unit = units.find(u => u.name.toLowerCase() === unitName.toLowerCase());
  
  if (!unit) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Unit not found: ${unitName}`,
      },
    };
  }
  
  // Check if the unit is in the battle
  if (!battle.units[unit.id]) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Unit ${unitName} is not in the battle`,
      },
    };
  }
  
  // Deploy the unit
  const updatedBattle = Battle.deployUnit(battle, unit.id, rank, position);
  
  // Save the battle
  await Storage.saveBattle(updatedBattle);
  
  // Get the domains and units for the battle
  const domains = {};
  const battleUnits = {};
  
  // Get the domains
  for (const domainId of updatedBattle.domains) {
    const domain = await Storage.getDomain(domainId);
    if (domain) {
      domains[domainId] = domain;
    }
  }
  
  // Get the units
  for (const unitId of Object.keys(updatedBattle.units)) {
    const u = await Storage.getUnit(unitId);
    if (u) {
      battleUnits[unitId] = u;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(updatedBattle, domains, battleUnits);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Unit deployed:\n\n${formattedBattle}`,
    },
  };
}

/**
 * Handle setting initiative in a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleSetInitiative(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Get all units in the battle that are deployed
  const deployedUnitIds = [];
  
  // Add units from the vanguard
  Object.values(battle.grid[Battle.BATTLE_RANKS.VANGUARD]).forEach(unitId => {
    if (unitId) {
      deployedUnitIds.push(unitId);
    }
  });
  
  // Add units from the center
  Object.values(battle.grid[Battle.BATTLE_RANKS.CENTER]).forEach(unitId => {
    if (unitId) {
      deployedUnitIds.push(unitId);
    }
  });
  
  // Add units from the rear
  Object.values(battle.grid[Battle.BATTLE_RANKS.REAR]).forEach(unitId => {
    if (unitId) {
      deployedUnitIds.push(unitId);
    }
  });
  
  // Add units from the reserve
  battle.grid[Battle.BATTLE_RANKS.RESERVE].forEach(unitId => {
    deployedUnitIds.push(unitId);
  });
  
  // Get the units
  const units = {};
  
  for (const unitId of deployedUnitIds) {
    const unit = await Storage.getUnit(unitId);
    if (unit) {
      units[unitId] = unit;
    }
  }
  
  // Sort the units by command bonus
  const sortedUnitIds = deployedUnitIds.sort((a, b) => {
    const unitA = units[a];
    const unitB = units[b];
    
    if (!unitA || !unitB) {
      return 0;
    }
    
    return unitB.stats.command - unitA.stats.command;
  });
  
  // Set the initiative
  const updatedBattle = Battle.setInitiative(battle, sortedUnitIds);
  
  // Save the battle
  await Storage.saveBattle(updatedBattle);
  
  // Get the domains for the battle
  const domains = {};
  
  // Get the domains
  for (const domainId of updatedBattle.domains) {
    const domain = await Storage.getDomain(domainId);
    if (domain) {
      domains[domainId] = domain;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(updatedBattle, domains, units);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Initiative set:\n\n${formattedBattle}`,
    },
  };
}

/**
 * Handle advancing to the next turn in a battle
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleNextTurn(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  
  let battleId;
  
  if (id) {
    // Use the provided ID
    battleId = id;
  } else if (name) {
    // Get all battles
    const battles = await Storage.getAllBattles();
    
    // Find the battle by name
    const battle = battles.find(b => b.name.toLowerCase() === name.toLowerCase());
    
    if (!battle) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Battle not found: ${name}`,
        },
      };
    }
    
    battleId = battle.id;
  } else {
    // Use the active battle for the channel
    const channelData = await Storage.getChannelData(interaction.channel_id);
    battleId = channelData.activeBattle;
    
    if (!battleId) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No active battle in this channel. Please provide a battle name or ID.',
        },
      };
    }
  }
  
  // Get the battle
  const battle = await Storage.getBattle(battleId);
  
  if (!battle) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Battle not found with ID: ${battleId}`,
      },
    };
  }
  
  // Check if the battle is in the battle phase
  if (battle.phase !== Battle.BATTLE_PHASES.BATTLE) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'The battle must be in the battle phase to advance turns',
      },
    };
  }
  
  // Check if initiative has been set
  if (battle.initiative.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Initiative must be set before advancing turns',
      },
    };
  }
  
  // Advance to the next turn
  const updatedBattle = Battle.endTurn(battle);
  
  // Save the battle
  await Storage.saveBattle(updatedBattle);
  
  // Get the domains and units for the battle
  const domains = {};
  const units = {};
  
  // Get the domains
  for (const domainId of updatedBattle.domains) {
    const domain = await Storage.getDomain(domainId);
    if (domain) {
      domains[domainId] = domain;
    }
  }
  
  // Get the units
  for (const unitId of Object.keys(updatedBattle.units)) {
    const unit = await Storage.getUnit(unitId);
    if (unit) {
      units[unitId] = unit;
    }
  }
  
  // Format the battle for display
  const formattedBattle = Formatter.formatBattle(updatedBattle, domains, units);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Next turn:\n\n${formattedBattle}`,
    },
  };
}
