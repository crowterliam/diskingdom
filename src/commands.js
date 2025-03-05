/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

import { WARFARE_COMMANDS } from './knw/commands/warfare.js';
import { INTRIGUE_COMMANDS } from './knw/commands/intrigue.js';

// Export all commands
export const ALL_COMMANDS = [
  ...WARFARE_COMMANDS,
  ...INTRIGUE_COMMANDS,
];
