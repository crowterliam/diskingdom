/**
 * Main entry point for warfare commands
 * Exports the command definitions and handler functions
 */

import { InteractionResponseType } from 'discord-interactions';
import { handleUnitCommand } from './unit.js';
import { handleBattleCommand } from './battle.js';
import { handleRollCommand } from './roll.js';

// Define the warfare commands
export const WARFARE_COMMANDS = [
  {
    name: 'warfare',
    description: 'Commands for managing warfare in Kingdoms & Warfare',
    options: [
      {
        name: 'unit',
        description: 'Manage military units',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'action',
            description: 'Action to perform',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Create', value: 'create' },
              { name: 'View', value: 'view' },
              { name: 'List', value: 'list' },
              { name: 'Delete', value: 'delete' },
            ],
          },
          {
            name: 'name',
            description: 'Name of the unit',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'type',
            description: 'Type of the unit',
            type: 3, // STRING
            required: false,
            choices: [
              { name: 'Infantry', value: 'infantry' },
              { name: 'Cavalry', value: 'cavalry' },
              { name: 'Artillery', value: 'artillery' },
              { name: 'Aerial', value: 'aerial' },
            ],
          },
          {
            name: 'tier',
            description: 'Tier of the unit (1-5)',
            type: 4, // INTEGER
            required: false,
            choices: [
              { name: 'I', value: 1 },
              { name: 'II', value: 2 },
              { name: 'III', value: 3 },
              { name: 'IV', value: 4 },
              { name: 'V', value: 5 },
            ],
          },
          {
            name: 'domain',
            description: 'Domain the unit belongs to',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'id',
            description: 'ID of the unit',
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: 'battle',
        description: 'Manage battles',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'action',
            description: 'Action to perform',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Create', value: 'create' },
              { name: 'View', value: 'view' },
              { name: 'List', value: 'list' },
              { name: 'Delete', value: 'delete' },
              { name: 'Start', value: 'start' },
              { name: 'End', value: 'end' },
              { name: 'Add Domain', value: 'add_domain' },
              { name: 'Add Unit', value: 'add_unit' },
              { name: 'Deploy Unit', value: 'deploy_unit' },
              { name: 'Set Initiative', value: 'set_initiative' },
              { name: 'Next Turn', value: 'next_turn' },
            ],
          },
          {
            name: 'name',
            description: 'Name of the battle',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'id',
            description: 'ID of the battle',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'domain',
            description: 'Domain to add to the battle',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'unit',
            description: 'Unit to add or deploy',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'rank',
            description: 'Rank to deploy the unit to',
            type: 3, // STRING
            required: false,
            choices: [
              { name: 'Vanguard', value: 'vanguard' },
              { name: 'Center', value: 'center' },
              { name: 'Rear', value: 'rear' },
              { name: 'Reserve', value: 'reserve' },
            ],
          },
          {
            name: 'position',
            description: 'Position to deploy the unit to',
            type: 3, // STRING
            required: false,
            choices: [
              { name: 'Left', value: 'left' },
              { name: 'Center', value: 'center' },
              { name: 'Right', value: 'right' },
            ],
          },
        ],
      },
      {
        name: 'roll',
        description: 'Roll dice for warfare',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'type',
            description: 'Type of roll',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Attack', value: 'attack' },
              { name: 'Damage', value: 'damage' },
              { name: 'Morale', value: 'morale' },
              { name: 'Casualty', value: 'casualty' },
              { name: 'Custom', value: 'custom' },
            ],
          },
          {
            name: 'unit',
            description: 'Unit making the roll',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'target',
            description: 'Target of the roll',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'bonus',
            description: 'Bonus to add to the roll',
            type: 4, // INTEGER
            required: false,
          },
          {
            name: 'difficulty',
            description: 'Difficulty class (DC) for the roll',
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
            name: 'notation',
            description: 'Dice notation for custom roll (e.g. 2d6+3)',
            type: 3, // STRING
            required: false,
          },
        ],
      },
    ],
  },
];

/**
 * Handle warfare commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleWarfareCommand(interaction, env) {
  const { options } = interaction.data;
  const subCommand = options[0];
  
  switch (subCommand.name) {
    case 'unit':
      return handleUnitCommand(interaction, subCommand, env);
    
    case 'battle':
      return handleBattleCommand(interaction, subCommand, env);
    
    case 'roll':
      return handleRollCommand(interaction, subCommand, env);
    
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unknown warfare subcommand: ${subCommand.name}`,
        },
      };
  }
}
