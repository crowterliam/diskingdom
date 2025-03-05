/**
 * Command definitions for the Harper Discord bot.
 * These commands are registered with Discord and used by the bot.
 */

/**
 * All commands that will be registered with Discord.
 * This includes commands for recording and transcribing audio.
 */
export const ALL_COMMANDS = [
  {
    name: 'record',
    description: 'Record audio from a voice channel',
    options: [
      {
        name: 'start',
        description: 'Start recording the current voice channel',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'session_name',
            description: 'Name of the recording session',
            type: 3, // STRING
            required: true
          }
        ]
      },
      {
        name: 'stop',
        description: 'Stop the current recording session',
        type: 1 // SUB_COMMAND
      }
    ]
  },
  {
    name: 'recordings',
    description: 'Manage recorded sessions',
    options: [
      {
        name: 'list',
        description: 'List all available recordings',
        type: 1 // SUB_COMMAND
      },
      {
        name: 'get',
        description: 'Get a specific recording',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'recording_id',
            description: 'ID of the recording to retrieve',
            type: 3, // STRING
            required: true
          }
        ]
      }
    ]
  },
  {
    name: 'transcription',
    description: 'Get transcriptions of recorded sessions',
    options: [
      {
        name: 'get',
        description: 'Get the transcription for a recording',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'recording_id',
            description: 'ID of the recording to transcribe',
            type: 3, // STRING
            required: true
          }
        ]
      }
    ]
  }
];
