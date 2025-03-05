/**
 * Formatter utility for Kingdoms & Warfare
 * Provides functions for formatting data for Discord messages
 */

import { UNIT_TYPES, UNIT_TIERS, UNIT_CONDITIONS } from '../models/unit.js';
import { DOMAIN_SKILLS, DOMAIN_DEFENSES, DOMAIN_SIZES } from '../models/domain.js';
import { BATTLE_PHASES, BATTLE_RANKS, GRID_POSITIONS } from '../models/battle.js';
import { INTRIGUE_PHASES, INTRIGUE_ACTION_TYPES } from '../models/intrigue.js';

/**
 * Format a unit for display
 * @param {Object} unit - Unit to format
 * @returns {String} - Formatted unit
 */
export function formatUnit(unit) {
  if (!unit) {
    return 'No unit found';
  }
  
  // Format the unit type
  const typeFormatted = Object.entries(UNIT_TYPES).find(([key, value]) => value === unit.type)?.[0] || unit.type;
  
  // Format the unit tier
  const tierFormatted = Object.entries(UNIT_TIERS).find(([key, value]) => value === unit.tier)?.[0] || `Tier ${unit.tier}`;
  
  // Format the unit conditions
  const conditionsFormatted = unit.conditions.map(condition => {
    return Object.entries(UNIT_CONDITIONS).find(([key, value]) => value === condition)?.[0] || condition;
  }).join(', ');
  
  // Format the unit traits
  const traitsFormatted = unit.traits.join(', ');
  
  // Build the formatted string
  let formatted = `**${unit.name}** (${typeFormatted} ${tierFormatted})\n`;
  formatted += `Casualty Die: ${unit.casualtyDie.current}/${unit.casualtyDie.max}\n`;
  formatted += `Attack: +${unit.stats.attack} (${unit.stats.attacks} attacks, ${unit.stats.damage} damage)\n`;
  formatted += `Power: +${unit.stats.power}\n`;
  formatted += `Defense: ${unit.stats.defense}\n`;
  formatted += `Toughness: ${unit.stats.toughness}\n`;
  formatted += `Morale: ${unit.stats.morale}\n`;
  formatted += `Command: +${unit.stats.command}\n`;
  
  if (unit.conditions.length > 0) {
    formatted += `Conditions: ${conditionsFormatted}\n`;
  }
  
  if (unit.traits.length > 0) {
    formatted += `Traits: ${traitsFormatted}\n`;
  }
  
  if (unit.battles > 0) {
    formatted += `Battles: ${unit.battles}\n`;
  }
  
  if (unit.experience > 0) {
    formatted += `Experience: ${unit.experience}\n`;
  }
  
  return formatted;
}

/**
 * Format a domain for display
 * @param {Object} domain - Domain to format
 * @returns {String} - Formatted domain
 */
export function formatDomain(domain) {
  if (!domain) {
    return 'No domain found';
  }
  
  // Format the domain size
  const sizeFormatted = DOMAIN_SIZES[domain.size]?.name || `Size ${domain.size}`;
  
  // Build the formatted string
  let formatted = `**${domain.name}** (${sizeFormatted})\n`;
  formatted += `Diplomacy: +${domain.skills[DOMAIN_SKILLS.DIPLOMACY]}\n`;
  formatted += `Espionage: +${domain.skills[DOMAIN_SKILLS.ESPIONAGE]}\n`;
  formatted += `Lore: +${domain.skills[DOMAIN_SKILLS.LORE]}\n`;
  formatted += `Operations: +${domain.skills[DOMAIN_SKILLS.OPERATIONS]}\n\n`;
  
  formatted += `Communications: ${domain.defenseScores[DOMAIN_DEFENSES.COMMUNICATIONS]} (Level ${domain.defenseLevels[DOMAIN_DEFENSES.COMMUNICATIONS]})\n`;
  formatted += `Resolve: ${domain.defenseScores[DOMAIN_DEFENSES.RESOLVE]} (Level ${domain.defenseLevels[DOMAIN_DEFENSES.RESOLVE]})\n`;
  formatted += `Resources: ${domain.defenseScores[DOMAIN_DEFENSES.RESOURCES]} (Level ${domain.defenseLevels[DOMAIN_DEFENSES.RESOURCES]})\n\n`;
  
  formatted += `Resource Points: ${domain.resources}\n`;
  formatted += `Units: ${domain.units.length}\n`;
  formatted += `Officers: ${domain.officers.length}\n`;
  
  return formatted;
}

/**
 * Format a battle for display
 * @param {Object} battle - Battle to format
 * @param {Object} domains - Map of domain IDs to domain objects
 * @param {Object} units - Map of unit IDs to unit objects
 * @returns {String} - Formatted battle
 */
export function formatBattle(battle, domains = {}, units = {}) {
  if (!battle) {
    return 'No battle found';
  }
  
  // Format the battle phase
  const phaseFormatted = Object.entries(BATTLE_PHASES).find(([key, value]) => value === battle.phase)?.[0] || battle.phase;
  
  // Build the formatted string
  let formatted = `**${battle.name}** (${phaseFormatted})\n`;
  formatted += `Round: ${battle.round}\n\n`;
  
  // Format the domains
  formatted += `**Domains:**\n`;
  battle.domains.forEach(domainId => {
    const domain = domains[domainId];
    formatted += `- ${domain ? domain.name : domainId}\n`;
  });
  
  // Format the battlefield grid
  if (battle.phase !== BATTLE_PHASES.SETUP) {
    formatted += `\n**Battlefield:**\n`;
    
    // Format the vanguard
    formatted += `Vanguard: `;
    formatted += formatBattlefieldRank(battle.grid[BATTLE_RANKS.VANGUARD], units);
    formatted += `\n`;
    
    // Format the center
    formatted += `Center: `;
    formatted += formatBattlefieldRank(battle.grid[BATTLE_RANKS.CENTER], units);
    formatted += `\n`;
    
    // Format the rear
    formatted += `Rear: `;
    formatted += formatBattlefieldRank(battle.grid[BATTLE_RANKS.REAR], units);
    formatted += `\n`;
    
    // Format the reserve
    formatted += `Reserve: `;
    if (battle.grid[BATTLE_RANKS.RESERVE].length > 0) {
      formatted += battle.grid[BATTLE_RANKS.RESERVE].map(unitId => {
        const unit = units[unitId];
        return unit ? unit.name : unitId;
      }).join(', ');
    } else {
      formatted += 'None';
    }
    formatted += `\n`;
    
    // Format the not deployed
    formatted += `Not Deployed: `;
    if (battle.grid[BATTLE_RANKS.NOT_DEPLOYED].length > 0) {
      formatted += battle.grid[BATTLE_RANKS.NOT_DEPLOYED].map(unitId => {
        const unit = units[unitId];
        return unit ? unit.name : unitId;
      }).join(', ');
    } else {
      formatted += 'None';
    }
    formatted += `\n`;
  }
  
  // Format the initiative order
  if (battle.phase === BATTLE_PHASES.BATTLE && battle.initiative.length > 0) {
    formatted += `\n**Initiative Order:**\n`;
    battle.initiative.forEach((unitId, index) => {
      const unit = units[unitId];
      const unitName = unit ? unit.name : unitId;
      const current = index === battle.currentTurn ? '→ ' : '';
      formatted += `${current}${index + 1}. ${unitName}\n`;
    });
  }
  
  return formatted;
}

/**
 * Format a battlefield rank for display
 * @param {Object} rank - Rank to format
 * @param {Object} units - Map of unit IDs to unit objects
 * @returns {String} - Formatted rank
 */
function formatBattlefieldRank(rank, units) {
  const left = rank[GRID_POSITIONS.LEFT];
  const center = rank[GRID_POSITIONS.CENTER];
  const right = rank[GRID_POSITIONS.RIGHT];
  
  const leftFormatted = left ? (units[left]?.name || left) : 'Empty';
  const centerFormatted = center ? (units[center]?.name || center) : 'Empty';
  const rightFormatted = right ? (units[right]?.name || right) : 'Empty';
  
  return `[${leftFormatted}] [${centerFormatted}] [${rightFormatted}]`;
}

/**
 * Format an intrigue session for display
 * @param {Object} intrigue - Intrigue session to format
 * @param {Object} domains - Map of domain IDs to domain objects
 * @returns {String} - Formatted intrigue session
 */
export function formatIntrigue(intrigue, domains = {}) {
  if (!intrigue) {
    return 'No intrigue session found';
  }
  
  // Format the intrigue phase
  const phaseFormatted = Object.entries(INTRIGUE_PHASES).find(([key, value]) => value === intrigue.phase)?.[0] || intrigue.phase;
  
  // Build the formatted string
  let formatted = `**${intrigue.name}** (${phaseFormatted})\n\n`;
  
  // Format the domains
  formatted += `**Domains:**\n`;
  intrigue.domains.forEach(domainId => {
    const domain = domains[domainId];
    const domainName = domain ? domain.name : domainId;
    const initiator = domainId === intrigue.initiator ? ' (Initiator)' : '';
    formatted += `- ${domainName}${initiator}\n`;
  });
  
  // Format the turn order
  if (intrigue.phase === INTRIGUE_PHASES.ACTIVE && intrigue.turnOrder.length > 0) {
    formatted += `\n**Turn Order:**\n`;
    intrigue.turnOrder.forEach((domainId, index) => {
      const domain = domains[domainId];
      const domainName = domain ? domain.name : domainId;
      const current = index === intrigue.currentDomainIndex ? '→ ' : '';
      formatted += `${current}${index + 1}. ${domainName}\n`;
    });
  }
  
  // Format the turns
  if (intrigue.turns.length > 0) {
    formatted += `\n**Recent Turns:**\n`;
    // Show the last 5 turns
    const recentTurns = intrigue.turns.slice(-5);
    recentTurns.forEach(turn => {
      const domain = domains[turn.domainId];
      const domainName = domain ? domain.name : turn.domainId;
      formatted += `- ${domainName}: ${formatIntrigueAction(turn.action)}\n`;
    });
  }
  
  return formatted;
}

/**
 * Format an intrigue action for display
 * @param {Object} action - Intrigue action to format
 * @returns {String} - Formatted intrigue action
 */
function formatIntrigueAction(action) {
  if (!action) {
    return 'Unknown action';
  }
  
  // Format the action type
  const typeFormatted = Object.entries(INTRIGUE_ACTION_TYPES).find(([key, value]) => value === action.type)?.[0] || action.type;
  
  // Format the action based on its type
  switch (action.type) {
    case INTRIGUE_ACTION_TYPES.SKILL_TEST:
      return `${typeFormatted}: ${action.skill} test${action.target ? ` against ${action.target}` : ''}${action.difficulty ? ` (DC ${action.difficulty})` : ''}`;
    
    case INTRIGUE_ACTION_TYPES.DEFENSE_MODIFICATION:
      return `${typeFormatted}: ${action.defense} ${action.change >= 0 ? '+' : ''}${action.change} to ${action.target}`;
    
    case INTRIGUE_ACTION_TYPES.RESOURCE_TRANSFER:
      return `${typeFormatted}: ${action.amount} resources from ${action.source} to ${action.target}`;
    
    case INTRIGUE_ACTION_TYPES.UNIT_CREATION:
      return `${typeFormatted}: ${action.unitType} (Tier ${action.unitTier}) for ${action.cost} resources`;
    
    case INTRIGUE_ACTION_TYPES.UNIT_MODIFICATION:
      return `${typeFormatted}: Modified ${action.unitId}`;
    
    case INTRIGUE_ACTION_TYPES.SPECIAL:
      return `${typeFormatted}: ${action.name}`;
    
    default:
      return `${typeFormatted}`;
  }
}

/**
 * Format a dice roll result for display
 * @param {Object} result - Dice roll result to format
 * @returns {String} - Formatted dice roll result
 */
export function formatDiceRoll(result) {
  if (!result) {
    return 'No dice roll result';
  }
  
  // Format based on the type of roll
  if (result.notation) {
    // This is a roll from notation
    let formatted = `**Roll:** ${result.notation}\n`;
    formatted += `**Dice:** [${result.rolls.join(', ')}]\n`;
    
    if (result.modifier) {
      formatted += `**Modifier:** ${result.modifier}\n`;
    }
    
    formatted += `**Result:** ${result.result}`;
    
    return formatted;
  } else if (result.dieRoll) {
    // This is a skill check or attack
    let formatted = `**Roll:** ${result.dieRoll}`;
    
    if (result.allRolls && result.allRolls.length > 1) {
      formatted += ` [${result.allRolls.join(', ')}]`;
    }
    
    formatted += `\n`;
    
    if (result.bonus) {
      formatted += `**Bonus:** ${result.bonus >= 0 ? '+' : ''}${result.bonus}\n`;
    }
    
    formatted += `**Total:** ${result.total}\n`;
    
    if (result.difficulty) {
      formatted += `**DC:** ${result.difficulty}\n`;
      formatted += `**Result:** ${result.success ? 'Success' : 'Failure'}`;
    } else if (result.attackBonus) {
      formatted += `**Attack Bonus:** ${result.attackBonus}\n`;
      formatted += `**Result:** ${result.success ? 'Success' : 'Failure'}`;
    }
    
    return formatted;
  } else if (result.rolls) {
    // This is a damage roll
    let formatted = `**Dice:** [${result.rolls.join(', ')}]\n`;
    formatted += `**Sum:** ${result.sum}\n`;
    
    if (result.powerBonus) {
      formatted += `**Power Bonus:** ${result.powerBonus >= 0 ? '+' : ''}${result.powerBonus}\n`;
    }
    
    formatted += `**Total Damage:** ${result.total}`;
    
    return formatted;
  } else {
    // This is some other kind of roll
    return `**Result:** ${JSON.stringify(result)}`;
  }
}

/**
 * Format an embed for Discord
 * @param {String} title - Title of the embed
 * @param {String} description - Description of the embed
 * @param {Array} fields - Fields to add to the embed
 * @param {String} color - Color of the embed
 * @returns {Object} - Formatted embed
 */
export function formatEmbed(title, description, fields = [], color = '#0099ff') {
  return {
    title,
    description,
    color,
    fields: fields.map(field => ({
      name: field.name,
      value: field.value,
      inline: field.inline || false,
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format a help message for a command
 * @param {Object} command - Command to format
 * @returns {String} - Formatted help message
 */
export function formatCommandHelp(command) {
  if (!command) {
    return 'No command found';
  }
  
  let formatted = `**${command.name}**\n`;
  formatted += `${command.description}\n\n`;
  
  if (command.options && command.options.length > 0) {
    formatted += `**Options:**\n`;
    command.options.forEach(option => {
      const required = option.required ? ' (required)' : '';
      formatted += `- \`${option.name}\`${required}: ${option.description}\n`;
    });
  }
  
  if (command.examples && command.examples.length > 0) {
    formatted += `\n**Examples:**\n`;
    command.examples.forEach(example => {
      formatted += `- \`/${command.name} ${example}\`\n`;
    });
  }
  
  return formatted;
}
