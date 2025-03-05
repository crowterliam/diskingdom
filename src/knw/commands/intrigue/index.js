/**
 * Main entry point for intrigue commands
 * Exports the command definitions and handler functions
 */

import { InteractionResponseType } from 'discord-interactions';
import { handleDomainCommand } from './domain.js';
import { handleSessionCommand } from './session.js';
import { handleRollCommand } from './roll.js';
import { handleReferenceCommand } from './reference.js';
import { DOMAIN_SKILLS, DOMAIN_DEFENSES, DOMAIN_SIZES } from '../../models/domain.js';
import { INTRIGUE_PHASES, INTRIGUE_ACTION_TYPES } from '../../models/intrigue.js';

// KV namespace for data storage
export const KV_NAMESPACE = 'KNW_DATA';

// Intrigue command definitions
export const INTRIGUE_COMMANDS = [
  {
    name: 'intrigue',
    description: 'Commands for managing intrigue in Kingdoms & Warfare',
    options: [
      {
        name: 'domain',
        description: 'Manage domains',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'action',
            description: 'Action to perform',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'create', value: 'create' },
              { name: 'view', value: 'view' },
              { name: 'list', value: 'list' },
              { name: 'delete', value: 'delete' },
            ],
          },
          {
            name: 'name',
            description: 'Name of the domain',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'size',
            description: 'Size of the domain (1-5)',
            type: 4, // INTEGER
            required: false,
            choices: [
              { name: '1 (d4)', value: 1 },
              { name: '2 (d6)', value: 2 },
              { name: '3 (d8)', value: 3 },
              { name: '4 (d10)', value: 4 },
              { name: '5 (d12)', value: 5 },
            ],
          },
          {
            name: 'diplomacy',
            description: 'Diplomacy skill modifier',
            type: 4, // INTEGER
            required: false,
          },
          {
            name: 'espionage',
            description: 'Espionage skill modifier',
            type: 4, // INTEGER
            required: false,
          },
          {
            name: 'lore',
            description: 'Lore skill modifier',
            type: 4, // INTEGER
            required: false,
          },
          {
            name: 'operations',
            description: 'Operations skill modifier',
            type: 4, // INTEGER
            required: false,
          },
        ],
      },
      {
        name: 'session',
        description: 'Manage intrigue sessions',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'action',
            description: 'Action to perform',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'create', value: 'create' },
              { name: 'view', value: 'view' },
              { name: 'list', value: 'list' },
              { name: 'delete', value: 'delete' },
              { name: 'start', value: 'start' },
              { name: 'action', value: 'action' },
            ],
          },
          {
            name: 'name',
            description: 'Name of the intrigue session',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'session_id',
            description: 'ID of the intrigue session',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'domain_id',
            description: 'ID of the domain',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'initiator_id',
            description: 'ID of the initiating domain',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'skill',
            description: 'Skill to use for the action',
            type: 3, // STRING
            required: false,
            choices: [
              { name: 'Diplomacy', value: DOMAIN_SKILLS.DIPLOMACY },
              { name: 'Espionage', value: DOMAIN_SKILLS.ESPIONAGE },
              { name: 'Lore', value: DOMAIN_SKILLS.LORE },
              { name: 'Operations', value: DOMAIN_SKILLS.OPERATIONS },
            ],
          },
          {
            name: 'target_id',
            description: 'ID of the target domain',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'difficulty',
            description: 'Difficulty class (DC) for the skill check',
            type: 4, // INTEGER
            required: false,
          },
          {
            name: 'description',
            description: 'Description of the action',
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: 'roll',
        description: 'Roll dice for intrigue',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'skill',
            description: 'Skill to roll',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Diplomacy', value: DOMAIN_SKILLS.DIPLOMACY },
              { name: 'Espionage', value: DOMAIN_SKILLS.ESPIONAGE },
              { name: 'Lore', value: DOMAIN_SKILLS.LORE },
              { name: 'Operations', value: DOMAIN_SKILLS.OPERATIONS },
            ],
          },
          {
            name: 'modifier',
            description: 'Skill modifier',
            type: 4, // INTEGER
            required: false,
          },
          {
            name: 'proficiency',
            description: 'Proficiency bonus',
            type: 4, // INTEGER
            required: false,
          },
          {
            name: 'advantage',
            description: 'Roll with advantage',
            type: 5, // BOOLEAN
            required: false,
          },
          {
            name: 'disadvantage',
            description: 'Roll with disadvantage',
            type: 5, // BOOLEAN
            required: false,
          },
          {
            name: 'dc',
            description: 'Difficulty class (DC)',
            type: 4, // INTEGER
            required: false,
          },
        ],
      },
      {
        name: 'reference',
        description: 'Get reference information about intrigue',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'topic',
            description: 'Topic to get reference for',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Intrigue', value: 'intrigue' },
              { name: 'Domain Skills', value: 'domain_skills' },
              { name: 'Domain Defenses', value: 'domain_defenses' },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Handle intrigue commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleIntrigueCommand(interaction, env) {
  const { options } = interaction.data;
  const subcommand = options[0];
  
  switch (subcommand.name) {
    case 'domain':
      return handleDomainCommand(interaction, env);
    case 'session':
      return handleSessionCommand(interaction, env);
    case 'roll':
      return handleRollCommand(interaction, env);
    case 'reference':
      return handleReferenceCommand(interaction, env);
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Unknown intrigue subcommand: ${subcommand.name}` },
      };
  }
}

/**
 * Capitalize the first letter of a string
 * @param {String} str - String to capitalize
 * @returns {String} - Capitalized string
 */
export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get the Roman numeral for a number
 * @param {Number} num - Number to convert
 * @returns {String} - Roman numeral
 */
export function getRomanNumeral(num) {
  const romanNumerals = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
  };
  
  return romanNumerals[num] || num.toString();
}

/**
 * Format an intrigue action for display
 * @param {Object} action - Intrigue action object
 * @returns {String} - Formatted intrigue action text
 */
export function formatIntrigueAction(action) {
  switch (action.type) {
    case INTRIGUE_ACTION_TYPES.SKILL_TEST:
      return `Skill Test - ${capitalizeFirstLetter(action.skill)} vs ${action.target || 'DC ' + action.difficulty}${action.result ? ` (${action.result})` : ''}${action.description ? ` - ${action.description}` : ''}`;
    
    case INTRIGUE_ACTION_TYPES.DEFENSE_MODIFICATION:
      return `Defense Modification - ${capitalizeFirstLetter(action.defense)} of ${action.target} by ${action.change > 0 ? '+' : ''}${action.change}${action.description ? ` - ${action.description}` : ''}`;
    
    case INTRIGUE_ACTION_TYPES.RESOURCE_TRANSFER:
      return `Resource Transfer - ${action.amount} from ${action.source} to ${action.target}${action.description ? ` - ${action.description}` : ''}`;
    
    case INTRIGUE_ACTION_TYPES.UNIT_CREATION:
      return `Unit Creation - Tier ${getRomanNumeral(action.unitTier)} ${capitalizeFirstLetter(action.unitType)} (Cost: ${action.cost})${action.description ? ` - ${action.description}` : ''}`;
    
    case INTRIGUE_ACTION_TYPES.UNIT_MODIFICATION:
      return `Unit Modification - ${action.unitId}${action.description ? ` - ${action.description}` : ''}`;
    
    case INTRIGUE_ACTION_TYPES.SPECIAL:
      return `Special Action - ${action.name}${action.description ? ` - ${action.description}` : ''}`;
    
    default:
      return `Unknown Action Type: ${action.type}`;
  }
}
