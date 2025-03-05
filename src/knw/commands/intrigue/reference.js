/**
 * Reference command handlers for Kingdoms & Warfare
 * Handles Discord commands related to reference information for intrigue
 */

import { InteractionResponseType } from 'discord-interactions';
import { DOMAIN_SKILLS, DOMAIN_DEFENSES } from '../../models/domain.js';
import { INTRIGUE_PHASES, INTRIGUE_ACTION_TYPES } from '../../models/intrigue.js';
import { formatReference } from '../../utils/formatter.js';

/**
 * Handle reference commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleReferenceCommand(interaction, env) {
  const { options } = interaction.data.options[0];
  const topic = options.find(opt => opt.name === 'topic').value;
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: formatReference(topic) },
  };
}

/**
 * Format reference information
 * @param {String} topic - Topic to get reference for
 * @returns {String} - Formatted reference information
 */
function formatReference(topic) {
  switch (topic) {
    case 'intrigue':
      return formatIntrigueReference();
    case 'domain_skills':
      return formatDomainSkillsReference();
    case 'domain_defenses':
      return formatDomainDefensesReference();
    default:
      return `Unknown reference topic: ${topic}`;
  }
}

/**
 * Format intrigue reference information
 * @returns {String} - Formatted intrigue reference information
 */
function formatIntrigueReference() {
  let content = '**Intrigue Reference**\n\n';
  
  content += '**Phases**\n';
  Object.entries(INTRIGUE_PHASES).forEach(([key, value]) => {
    content += `- **${key}**: ${value}\n`;
  });
  
  content += '\n**Action Types**\n';
  Object.entries(INTRIGUE_ACTION_TYPES).forEach(([key, value]) => {
    content += `- **${key}**: ${value}\n`;
  });
  
  return content;
}

/**
 * Format domain skills reference information
 * @returns {String} - Formatted domain skills reference information
 */
function formatDomainSkillsReference() {
  let content = '**Domain Skills Reference**\n\n';
  
  content += '**Skills**\n';
  content += `- **Diplomacy**: Used for diplomatic actions, alliances, and negotiations.\n`;
  content += `- **Espionage**: Used for spying, sabotage, and gathering intelligence.\n`;
  content += `- **Lore**: Used for research, magical development, and understanding ancient knowledge.\n`;
  content += `- **Operations**: Used for military actions, logistics, and infrastructure development.\n`;
  
  return content;
}

/**
 * Format domain defenses reference information
 * @returns {String} - Formatted domain defenses reference information
 */
function formatDomainDefensesReference() {
  let content = '**Domain Defenses Reference**\n\n';
  
  content += '**Defenses**\n';
  content += `- **Communications**: Protects against espionage and information warfare.\n`;
  content += `- **Resolve**: Protects against diplomatic pressure and morale attacks.\n`;
  content += `- **Resources**: Protects against economic warfare and resource depletion.\n`;
  
  return content;
}
