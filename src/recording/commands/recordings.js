/**
 * Command handlers for the /recordings command.
 * Handles listing and retrieving recordings.
 */

import { InteractionResponseType } from 'discord-interactions';
import { listRecordings, getRecording, generateDownloadUrl } from '../utils/recording.js';

/**
 * Handle the /recordings command and its subcommands
 */
export async function handleRecordingsCommand(interaction, env) {
  const subcommand = interaction.data.options[0].name;
  
  switch (subcommand) {
    case 'list':
      return handleListRecordings(interaction, env);
    case 'get':
      return handleGetRecording(interaction, env);
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Unknown subcommand: ${subcommand}`
        }
      };
  }
}

/**
 * Handle the /recordings list subcommand
 * Lists all available recordings for the current guild
 */
async function handleListRecordings(interaction, env) {
  const guildId = interaction.guild_id;
  
  try {
    const recordings = await listRecordings(env, guildId);
    
    if (recordings.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'No recordings found for this server.'
        }
      };
    }
    
    // Format the recordings list
    const recordingsList = recordings.map((recording, index) => {
      const date = new Date(recording.recordedAt).toLocaleString();
      const duration = recording.duration 
        ? `${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}`
        : 'Unknown';
      
      return `${index + 1}. **${recording.sessionName}** (ID: \`${recording.id}\`)
        • Recorded: ${date}
        • Duration: ${duration}
        • Status: ${recording.status}`;
    }).join('\n\n');
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `**Recordings for this server:**\n\n${recordingsList}\n\nUse \`/recordings get recording_id\` to download a specific recording.`
      }
    };
  } catch (error) {
    console.error('Error listing recordings:', error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Failed to list recordings: ${error.message}`
      }
    };
  }
}

/**
 * Handle the /recordings get subcommand
 * Retrieves a specific recording by ID
 */
async function handleGetRecording(interaction, env) {
  const guildId = interaction.guild_id;
  
  // Get the recording ID from the options
  const recordingId = interaction.data.options[0].options.find(
    option => option.name === 'recording_id'
  )?.value;
  
  if (!recordingId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a recording ID.'
      }
    };
  }
  
  try {
    const recording = await getRecording(env, guildId, recordingId);
    
    if (!recording) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Recording with ID ${recordingId} not found.`
        }
      };
    }
    
    // Generate a download URL for the recording
    const downloadUrl = await generateDownloadUrl(env, recording.r2Key);
    
    // Format the recording details
    const date = new Date(recording.recordedAt).toLocaleString();
    const duration = recording.duration 
      ? `${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}`
      : 'Unknown';
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `**Recording: ${recording.sessionName}**
          • Recorded: ${date}
          • Duration: ${duration}
          • Status: ${recording.status}
          
          Download link (expires in 1 hour): ${downloadUrl}
          
          Use \`/transcription get ${recordingId}\` to get the transcription for this recording.`
      }
    };
  } catch (error) {
    console.error('Error getting recording:', error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Failed to get recording: ${error.message}`
      }
    };
  }
}
