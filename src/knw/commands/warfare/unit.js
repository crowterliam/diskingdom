/**
 * Unit command handlers for Kingdoms & Warfare
 * Handles Discord commands related to military units
 */

import { InteractionResponseType } from 'discord-interactions';
import { v4 as uuidv4 } from 'uuid';

import * as Unit from '../../models/unit.js';
import * as Domain from '../../models/domain.js';
import * as Storage from '../../utils/storage.js';
import * as Formatter from '../../utils/formatter.js';

/**
 * Handle unit commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} subCommand - Subcommand data
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleUnitCommand(interaction, subCommand, env) {
  const { options } = subCommand;
  const action = options.find(opt => opt.name === 'action')?.value;
  
  switch (action) {
    case 'create':
      return handleCreateUnit(interaction, options, env);
    
    case 'view':
      return handleViewUnit(interaction, options, env);
    
    case 'list':
      return handleListUnits(interaction, options, env);
    
    case 'delete':
      return handleDeleteUnit(interaction, options, env);
    
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unknown unit action: ${action}`,
        },
      };
  }
}

/**
 * Handle creating a unit
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleCreateUnit(interaction, options, env) {
  const name = options.find(opt => opt.name === 'name')?.value;
  const type = options.find(opt => opt.name === 'type')?.value || Unit.UNIT_TYPES.INFANTRY;
  const tier = options.find(opt => opt.name === 'tier')?.value || Unit.UNIT_TIERS.I;
  const domainName = options.find(opt => opt.name === 'domain')?.value;
  
  // Check if the name is provided
  if (!name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a name for the unit',
      },
    };
  }
  
  // Create the unit
  const unit = Unit.createUnit({
    name,
    type,
    tier,
  });
  
  // Save the unit
  await Storage.saveUnit(unit);
  
  // If a domain is provided, add the unit to the domain
  if (domainName) {
    // Get all domains
    const domains = await Storage.getAllDomains();
    
    // Find the domain by name
    const domain = domains.find(d => d.name.toLowerCase() === domainName.toLowerCase());
    
    if (domain) {
      // Add the unit to the domain
      const updatedDomain = Domain.addUnit(domain, unit.id);
      
      // Save the domain
      await Storage.saveDomain(updatedDomain);
    }
  }
  
  // Format the unit for display
  const formattedUnit = Formatter.formatUnit(unit);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Unit created:\n\n${formattedUnit}`,
    },
  };
}

/**
 * Handle viewing a unit
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleViewUnit(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  
  // Check if either an ID or a name is provided
  if (!id && !name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide either an ID or a name for the unit',
      },
    };
  }
  
  let unit;
  
  if (id) {
    // Get the unit by ID
    unit = await Storage.getUnit(id);
  } else {
    // Get all units
    const units = await Storage.getAllUnits();
    
    // Find the unit by name
    unit = units.find(u => u.name.toLowerCase() === name.toLowerCase());
  }
  
  if (!unit) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Unit not found',
      },
    };
  }
  
  // Format the unit for display
  const formattedUnit = Formatter.formatUnit(unit);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: formattedUnit,
    },
  };
}

/**
 * Handle listing units
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleListUnits(interaction, options, env) {
  const domainName = options.find(opt => opt.name === 'domain')?.value;
  
  let units;
  
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
    
    // Get the units for the domain
    units = await Storage.getUnitsForDomain(domain.id);
  } else {
    // Get all units
    units = await Storage.getAllUnits();
  }
  
  if (units.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: domainName ? `No units found for domain: ${domainName}` : 'No units found',
      },
    };
  }
  
  // Format the units for display
  let formattedUnits = '';
  
  units.forEach(unit => {
    formattedUnits += `- **${unit.name}** (${unit.type}, Tier ${unit.tier})\n`;
  });
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Units${domainName ? ` for domain ${domainName}` : ''}:\n\n${formattedUnits}`,
    },
  };
}

/**
 * Handle deleting a unit
 * @param {Object} interaction - Discord interaction
 * @param {Array} options - Command options
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleDeleteUnit(interaction, options, env) {
  const id = options.find(opt => opt.name === 'id')?.value;
  const name = options.find(opt => opt.name === 'name')?.value;
  
  // Check if either an ID or a name is provided
  if (!id && !name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide either an ID or a name for the unit',
      },
    };
  }
  
  let unitId;
  
  if (id) {
    // Use the provided ID
    unitId = id;
  } else {
    // Get all units
    const units = await Storage.getAllUnits();
    
    // Find the unit by name
    const unit = units.find(u => u.name.toLowerCase() === name.toLowerCase());
    
    if (!unit) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unit not found: ${name}`,
        },
      };
    }
    
    unitId = unit.id;
  }
  
  // Delete the unit
  const deleted = await Storage.deleteUnit(unitId);
  
  if (!deleted) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Unit not found with ID: ${unitId}`,
      },
    };
  }
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'Unit deleted',
    },
  };
}
