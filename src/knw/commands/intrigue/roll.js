/**
 * Roll command handlers for Kingdoms & Warfare
 * Handles Discord commands related to dice rolls for intrigue
 */

import { InteractionResponseType } from 'discord-interactions';
import { rollSkillCheck } from '../../utils/dice.js';
import { formatDiceRoll } from '../../utils/formatter.js';
import { capitalizeFirstLetter } from './index.js';

/**
 * Handle roll commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleRollCommand(interaction, env) {
  const { options } = interaction.data.options[0];
  const skill = options.find(opt => opt.name === 'skill').value;
  const modifier = options.find(opt => opt.name === 'modifier')?.value || 0;
  const proficiency = options.find(opt => opt.name === 'proficiency')?.value || 0;
  const advantage = options.find(opt => opt.name === 'advantage')?.value || false;
  const disadvantage = options.find(opt => opt.name === 'disadvantage')?.value || false;
  const dc = options.find(opt => opt.name === 'dc')?.value;
  
  // Roll the skill check
  const rollResult = rollSkillCheck({
    skillModifier: modifier,
    proficiencyBonus: proficiency,
    advantage,
    disadvantage,
    dc,
  });
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: `**${capitalizeFirstLetter(skill)} Check**\n${formatDiceRoll(rollResult)}` },
  };
}
