/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

import { WARFARE_COMMANDS } from './knw/commands/warfare.js';
import { INTRIGUE_COMMANDS } from './knw/commands/intrigue.js';

export const AWW_COMMAND = {
  name: 'awwww',
  description: 'Drop some cuteness on this channel.',
};

export const INVITE_COMMAND = {
  name: 'invite',
  description: 'Get an invite link to add the bot to your server',
};

// Export all commands
export const ALL_COMMANDS = [
  AWW_COMMAND,
  INVITE_COMMAND,
  ...WARFARE_COMMANDS,
  ...INTRIGUE_COMMANDS,
];
