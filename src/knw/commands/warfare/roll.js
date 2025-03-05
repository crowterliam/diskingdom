/**
 * Roll command handlers for Kingdoms & Warfare
 * Handles Discord commands related to dice rolls for warfare
 */

import { InteractionResponseType } from 'discord-interactions';

import * as Unit from '../../models/unit.js';
import * as Dice from '../../utils/dice.js';
import * as Storage from '../../utils/storage.js';
import * as Formatter from '../../utils/formatter.js';

/**
 * Handle roll commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} subCommand - Subcommand data
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleRollCommand(interaction, subCommand, env) {
  const { options } = subCommand;
  const rollType = options.find(opt => opt.name === 'type')?.value;
  const unitName = options.find(opt => opt.name === 'unit')?.value;
  const targetName = options.find(opt => opt.name === 'target')?.value;
  const bonus = options.find(opt => opt.name === 'bonus')?.value || 0;
  const difficulty = options.find(opt => opt.name === 'difficulty')?.value;
  const advantage = options.find(opt => opt.name === 'advantage')?.value || false;
  const disadvantage = options.find(opt => opt.name === 'disadvantage')?.value || false;
  const notation = options.find(opt => opt.name === 'notation')?.value;
  
  switch (rollType) {
    case 'attack':
      return handleAttackRoll(interaction, unitName, targetName, bonus, advantage, disadvantage, env);
    
    case 'damage':
      return handleDamageRoll(interaction, unitName, bonus, env);
    
    case 'morale':
      return handleMoraleRoll(interaction, unitName, difficulty, env);
    
    case 'casualty':
      return handleCasualtyRoll(interaction, unitName, env);
    
    case 'custom':
      return handleCustomRoll(interaction, notation, env);
    
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unknown roll type: ${rollType}`,
        },
      };
  }
}

/**
 * Handle an attack roll
 * @param {Object} interaction - Discord interaction
 * @param {String} unitName - Name of the unit making the attack
 * @param {String} targetName - Name of the target unit
 * @param {Number} bonus - Additional bonus to add to the roll
 * @param {Boolean} advantage - Whether to roll with advantage
 * @param {Boolean} disadvantage - Whether to roll with disadvantage
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleAttackRoll(interaction, unitName, targetName, bonus, advantage, disadvantage, env) {
  // Check if a unit name is provided
  if (!unitName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a unit name',
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
  
  let target;
  let defenseScore = 10;
  
  if (targetName) {
    // Find the target by name
    target = units.find(u => u.name.toLowerCase() === targetName.toLowerCase());
    
    if (!target) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Target unit not found: ${targetName}`,
        },
      };
    }
    
    defenseScore = target.stats.defense;
  }
  
  // Calculate the attack bonus
  const attackBonus = unit.stats.attack + bonus;
  
  // Roll the attack
  const result = Dice.rollAttack(attackBonus, defenseScore, advantage, disadvantage);
  
  // Format the result
  const formattedResult = Formatter.formatDiceRoll(result);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `**Attack Roll**\n${unit.name}${target ? ` vs ${target.name}` : ''}\n\n${formattedResult}`,
    },
  };
}

/**
 * Handle a damage roll
 * @param {Object} interaction - Discord interaction
 * @param {String} unitName - Name of the unit dealing damage
 * @param {Number} bonus - Additional bonus to add to the roll
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleDamageRoll(interaction, unitName, bonus, env) {
  // Check if a unit name is provided
  if (!unitName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a unit name',
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
  
  // Calculate the power bonus
  const powerBonus = unit.stats.power + bonus;
  
  // Roll the damage
  const result = Dice.rollDamage(unit.stats.attacks, unit.stats.damage, powerBonus);
  
  // Format the result
  const formattedResult = Formatter.formatDiceRoll(result);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `**Damage Roll**\n${unit.name}\n\n${formattedResult}`,
    },
  };
}

/**
 * Handle a morale check
 * @param {Object} interaction - Discord interaction
 * @param {String} unitName - Name of the unit making the morale check
 * @param {Number} difficulty - Difficulty class (DC) for the morale check
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleMoraleRoll(interaction, unitName, difficulty, env) {
  // Check if a unit name is provided
  if (!unitName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a unit name',
      },
    };
  }
  
  // Check if a difficulty is provided
  if (!difficulty) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a difficulty class (DC)',
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
  
  // Roll the morale check
  const result = Dice.rollMoraleCheck(unit.stats.morale, difficulty);
  
  // Format the result
  const formattedResult = Formatter.formatDiceRoll(result);
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `**Morale Check**\n${unit.name}\n\n${formattedResult}`,
    },
  };
}

/**
 * Handle a casualty roll
 * @param {Object} interaction - Discord interaction
 * @param {String} unitName - Name of the unit taking casualties
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleCasualtyRoll(interaction, unitName, env) {
  // Check if a unit name is provided
  if (!unitName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a unit name',
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
  
  // Roll a d6 for casualties
  const result = Dice.rollFromNotation('1d6');
  
  // Format the result
  const formattedResult = Formatter.formatDiceRoll(result);
  
  // Calculate the new casualty die value
  const newCasualtyDie = Math.max(0, unit.casualtyDie.current - result.result);
  
  // Determine if the unit is broken
  const isBroken = newCasualtyDie === 0;
  
  // Update the unit
  const updatedUnit = Unit.takeCasualties(unit, result.result);
  
  // Save the unit
  await Storage.saveUnit(updatedUnit);
  
  // Build the response
  let content = `**Casualty Roll**\n${unit.name}\n\n${formattedResult}\n\n`;
  content += `Casualty Die: ${unit.casualtyDie.current} → ${newCasualtyDie}/${unit.casualtyDie.max}`;
  
  if (isBroken) {
    content += '\n\n**Unit is broken!**';
  }
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
    },
  };
}

/**
 * Handle a custom dice roll
 * @param {Object} interaction - Discord interaction
 * @param {String} notation - Dice notation (e.g. 2d6+3)
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleCustomRoll(interaction, notation, env) {
  // Check if a notation is provided
  if (!notation) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a dice notation (e.g. 2d6+3)',
      },
    };
  }
  
  try {
    // Roll the dice
    const result = Dice.rollFromNotation(notation);
    
    // Format the result
    const formattedResult = Formatter.formatDiceRoll(result);
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `**Custom Roll**\n${notation}\n\n${formattedResult}`,
      },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Error rolling dice: ${error.message}`,
      },
    };
  }
}
