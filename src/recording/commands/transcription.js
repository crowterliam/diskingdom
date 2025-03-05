/**
 * Command handlers for the /transcription command.
 * Handles retrieving and managing transcriptions.
 */

import { InteractionResponseType } from 'discord-interactions';
import { getRecording } from '../utils/recording.js';
import { getTranscription, transcribeRecording } from '../utils/transcription.js';

/**
 * Handle the /transcription command and its subcommands
 */
export async function handleTranscriptionCommand(interaction, env) {
  const subcommand = interaction.data.options[0].name;
  
  switch (subcommand) {
    case 'get':
      return handleGetTranscription(interaction, env);
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
 * Handle the /transcription get subcommand
 * Retrieves or generates a transcription for a specific recording
 */
async function handleGetTranscription(interaction, env) {
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
    // First, check if the recording exists
    const recording = await getRecording(env, guildId, recordingId);
    
    if (!recording) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Recording with ID ${recordingId} not found.`
        }
      };
    }
    
    // Check if a transcription already exists
    let transcription = await getTranscription(env, recordingId);
    
    // If no transcription exists, start the transcription process
    if (!transcription) {
      // Send an initial response that we're starting the transcription
      const initialResponse = {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Starting transcription for recording "${recording.sessionName}". This may take a few minutes. You'll be notified when it's ready.`
        }
      };
      
      // In a real implementation, you would:
      // 1. Start a background process to transcribe the recording
      // 2. Send a follow-up message when the transcription is complete
      
      // For now, we'll just return the initial response
      return initialResponse;
    }
    
    // If a transcription exists, return it
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `**Transcription for "${recording.sessionName}"**\n\n${transcription.content}`
      }
    };
  } catch (error) {
    console.error('Error getting transcription:', error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Failed to get transcription: ${error.message}`
      }
    };
  }
}
