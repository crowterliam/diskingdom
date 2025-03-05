/**
 * Utilities for working with audio recordings
 */

import { v4 as uuidv4 } from 'uuid';
import { processRecording } from './transcription.js';

// Recording status constants
export const RecordingStatus = {
  RECORDING: 'recording',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Start recording a voice channel
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} guildId - The guild's Discord ID
 * @param {string} userId - The user's Discord ID who started the recording
 * @param {string} sessionName - The name of the recording session
 * @returns {Promise<string>} - The ID of the new recording
 */
export async function startRecording(env, guildId, userId, sessionName) {
  try {
    // Generate a unique ID for the recording
    const recordingId = uuidv4();
    
    // Create a new recording entry
    const recording = {
      id: recordingId,
      guildId,
      userId,
      sessionName,
      channelId: 'mock-voice-channel-id', // In a real implementation, this would be the actual channel ID
      status: RecordingStatus.RECORDING,
      recordedAt: Date.now(),
      duration: null,
      r2Key: `recordings/${guildId}/${recordingId}.opus`,
      transcriptionId: null
    };
    
    // Store the recording in KV
    await env.HARPER_DATA.put(`recording:${recordingId}`, JSON.stringify(recording));
    
    // Store the active recording for this guild
    await env.HARPER_DATA.put(`active_recording:${guildId}`, recordingId);
    
    // Add to the list of recordings for this guild
    const recordingsList = await getRecordingsList(env, guildId);
    recordingsList.push(recordingId);
    await env.HARPER_DATA.put(`recordings:${guildId}`, JSON.stringify(recordingsList));
    
    return recordingId;
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
}

/**
 * Stop the current recording session
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} guildId - The guild's Discord ID
 * @param {string} recordingId - The ID of the recording to stop
 * @returns {Promise<Object>} - The updated recording object
 */
export async function stopRecording(env, guildId, recordingId) {
  try {
    // Get the recording
    const recording = await getRecording(env, guildId, recordingId);
    
    if (!recording) {
      throw new Error(`Recording ${recordingId} not found`);
    }
    
    // Update the recording status
    recording.status = RecordingStatus.PROCESSING;
    recording.duration = Math.floor((Date.now() - recording.recordedAt) / 1000); // Duration in seconds
    
    // Store the updated recording
    await env.HARPER_DATA.put(`recording:${recordingId}`, JSON.stringify(recording));
    
    // Clear the active recording for this guild
    await env.HARPER_DATA.delete(`active_recording:${guildId}`);
    
    // In a real implementation, you would:
    // 1. Stop the audio recording
    // 2. Process the audio file
    // 3. Upload it to R2
    // 4. Start the transcription process
    
    // For now, we'll just simulate this process
    setTimeout(() => {
      processRecording(env, recordingId, recording.r2Key).catch(console.error);
    }, 1000);
    
    return recording;
  } catch (error) {
    console.error('Error stopping recording:', error);
    throw error;
  }
}

/**
 * Get the active recording for a guild
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} guildId - The guild's Discord ID
 * @returns {Promise<Object|null>} - The active recording or null if none
 */
export async function getActiveRecording(env, guildId) {
  try {
    const activeRecordingId = await env.HARPER_DATA.get(`active_recording:${guildId}`);
    
    if (!activeRecordingId) {
      return null;
    }
    
    return getRecording(env, guildId, activeRecordingId);
  } catch (error) {
    console.error('Error getting active recording:', error);
    throw error;
  }
}

/**
 * Get a recording by ID
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} guildId - The guild's Discord ID
 * @param {string} recordingId - The ID of the recording to get
 * @returns {Promise<Object|null>} - The recording or null if not found
 */
export async function getRecording(env, guildId, recordingId) {
  try {
    const recordingJson = await env.HARPER_DATA.get(`recording:${recordingId}`);
    
    if (!recordingJson) {
      return null;
    }
    
    const recording = JSON.parse(recordingJson);
    
    // Verify that the recording belongs to the specified guild
    if (recording.guildId !== guildId) {
      return null;
    }
    
    return recording;
  } catch (error) {
    console.error('Error getting recording:', error);
    throw error;
  }
}

/**
 * List all recordings for a guild
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} guildId - The guild's Discord ID
 * @returns {Promise<Array>} - Array of recording objects
 */
export async function listRecordings(env, guildId) {
  try {
    const recordingsList = await getRecordingsList(env, guildId);
    
    if (recordingsList.length === 0) {
      return [];
    }
    
    // Get all recordings
    const recordings = [];
    
    for (const recordingId of recordingsList) {
      const recording = await getRecording(env, guildId, recordingId);
      
      if (recording) {
        recordings.push(recording);
      }
    }
    
    // Sort by recorded date, newest first
    return recordings.sort((a, b) => b.recordedAt - a.recordedAt);
  } catch (error) {
    console.error('Error listing recordings:', error);
    throw error;
  }
}

/**
 * Get the list of recording IDs for a guild
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} guildId - The guild's Discord ID
 * @returns {Promise<Array>} - Array of recording IDs
 */
async function getRecordingsList(env, guildId) {
  try {
    const recordingsListJson = await env.HARPER_DATA.get(`recordings:${guildId}`);
    
    if (!recordingsListJson) {
      return [];
    }
    
    return JSON.parse(recordingsListJson);
  } catch (error) {
    console.error('Error getting recordings list:', error);
    throw error;
  }
}

/**
 * Update a recording
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} recordingId - The ID of the recording to update
 * @param {Object} updates - The updates to apply to the recording
 * @returns {Promise<Object>} - The updated recording
 */
export async function updateRecording(env, recordingId, updates) {
  try {
    const recordingJson = await env.HARPER_DATA.get(`recording:${recordingId}`);
    
    if (!recordingJson) {
      throw new Error(`Recording ${recordingId} not found`);
    }
    
    const recording = JSON.parse(recordingJson);
    
    // Apply updates
    Object.assign(recording, updates);
    
    // Store the updated recording
    await env.HARPER_DATA.put(`recording:${recordingId}`, JSON.stringify(recording));
    
    return recording;
  } catch (error) {
    console.error('Error updating recording:', error);
    throw error;
  }
}

/**
 * Generate a download URL for a recording
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} r2Key - The R2 key of the recording
 * @returns {Promise<string>} - The download URL
 */
export async function generateDownloadUrl(env, r2Key) {
  try {
    // In a real implementation, you would generate a signed URL for the R2 object
    // For now, we'll just return a mock URL
    return `https://example.com/download/${r2Key}?token=mock-token`;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw error;
  }
}

/**
 * Delete a recording
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} guildId - The guild's Discord ID
 * @param {string} recordingId - The ID of the recording to delete
 * @returns {Promise<boolean>} - True if successful
 */
export async function deleteRecording(env, guildId, recordingId) {
  try {
    // Get the recording
    const recording = await getRecording(env, guildId, recordingId);
    
    if (!recording) {
      throw new Error(`Recording ${recordingId} not found`);
    }
    
    // Delete the recording from R2
    await env.RECORDINGS_BUCKET.delete(recording.r2Key);
    
    // Delete the recording from KV
    await env.HARPER_DATA.delete(`recording:${recordingId}`);
    
    // Remove from the list of recordings for this guild
    const recordingsList = await getRecordingsList(env, guildId);
    const updatedList = recordingsList.filter(id => id !== recordingId);
    await env.HARPER_DATA.put(`recordings:${guildId}`, JSON.stringify(updatedList));
    
    // If there's a transcription, delete it too
    if (recording.transcriptionId) {
      await env.HARPER_DATA.delete(`transcription:${recording.transcriptionId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
}
