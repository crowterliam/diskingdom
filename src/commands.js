/**
 * Command definitions for the Kingdoms & Warfare Discord bot.
 * These commands are registered with Discord and used by the bot.
 */

import { WARFARE_COMMANDS } from './knw/commands/warfare.js';
import { INTRIGUE_COMMANDS } from './knw/commands/intrigue.js';

/**
 * All commands that will be registered with Discord.
 * This includes warfare and intrigue commands for Kingdoms & Warfare.
 */
export const ALL_COMMANDS = [
  ...WARFARE_COMMANDS,
  ...INTRIGUE_COMMANDS,
];
