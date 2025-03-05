/**
 * Command handlers for the /record command.
 * Handles starting and stopping voice channel recordings.
 */

import { InteractionResponseType } from 'discord-interactions';
import { joinVoiceChannel, createAudioReceiver } from '../utils/voice.js';
import { startRecording, stopRecording, getActiveRecording } from '../utils/recording.js';

/**
 * Handle the /record command and its subcommands
 */
export async function handleRecordCommand(interaction, env) {
  const subcommand = interaction.data.options[0].name;
  
  switch (subcommand) {
    case 'start':
      return handleStartRecording(interaction, env);
    case 'stop':
      return handleStopRecording(interaction, env);
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
 * Handle the /record start subcommand
 * Starts recording the voice channel the user is currently in
 */
async function handleStartRecording(interaction, env) {
  const userId = interaction.member.user.id;
  const guildId = interaction.guild_id;
  
  // Get the session name from the options
  const sessionName = interaction.data.options[0].options.find(
    option => option.name === 'session_name'
  )?.value;
  
  if (!sessionName) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Please provide a session name.'
      }
    };
  }
  
  // Check if the user is in a voice channel
  // Note: This requires additional API calls to Discord which may not be
  // directly available through discord-interactions. In a full implementation,
  // you would use discord.js to get this information.
  
  // For now, we'll respond with a message that we're starting the recording
  // In a real implementation, you would:
  // 1. Check if the user is in a voice channel
  // 2. Join that voice channel
  // 3. Start recording
  
  try {
    // Check if there's already an active recording
    const activeRecording = await getActiveRecording(env, guildId);
    if (activeRecording) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `There's already an active recording session: "${activeRecording.sessionName}". Stop it first before starting a new one.`
        }
      };
    }
    
    // In a real implementation, you would:
    // const voiceChannel = await getVoiceChannel(userId, guildId);
    // const connection = await joinVoiceChannel(voiceChannel);
    // const recordingId = await startRecording(env, connection, guildId, userId, sessionName);
    
    // For now, we'll just create a placeholder recording entry
    const recordingId = await startRecording(env, guildId, userId, sessionName);
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Started recording session "${sessionName}" with ID: ${recordingId}. Use \`/record stop\` to end the recording.`
      }
    };
  } catch (error) {
    console.error('Error starting recording:', error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Failed to start recording: ${error.message}`
      }
    };
  }
}

/**
 * Handle the /record stop subcommand
 * Stops the current recording session
 */
async function handleStopRecording(interaction, env) {
  const guildId = interaction.guild_id;
  
  try {
    // Check if there's an active recording
    const activeRecording = await getActiveRecording(env, guildId);
    if (!activeRecording) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'There is no active recording session to stop.'
        }
      };
    }
    
    // Stop the recording
    const recordingInfo = await stopRecording(env, guildId, activeRecording.id);
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Stopped recording session "${recordingInfo.sessionName}". The recording will be processed and transcribed shortly.`
      }
    };
  } catch (error) {
    console.error('Error stopping recording:', error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Failed to stop recording: ${error.message}`
      }
    };
  }
}
