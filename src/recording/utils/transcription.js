/**
 * Utilities for working with audio transcriptions
 */

import { v4 as uuidv4 } from 'uuid';
import { updateRecording, RecordingStatus } from './recording.js';

/**
 * Process a recording for transcription
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} recordingId - The ID of the recording to process
 * @param {string} r2Key - The R2 key of the recording
 * @returns {Promise<Object>} - The transcription object
 */
export async function processRecording(env, recordingId, r2Key) {
  try {
    console.log(`Processing recording ${recordingId} with R2 key ${r2Key}`);
    
    // In a real implementation, you would:
    // 1. Download the audio file from R2
    // 2. Transcribe it using groq-distil-whisper
    // 3. Store the transcription
    
    // For now, we'll just create a mock transcription
    const transcriptionId = uuidv4();
    const transcription = {
      id: transcriptionId,
      recordingId,
      content: `This is a mock transcription for recording ${recordingId}. In a real implementation, this would be the actual transcription of the audio.`,
      transcribedAt: Date.now()
    };
    
    // Store the transcription
    await env.HARPER_DATA.put(`transcription:${transcriptionId}`, JSON.stringify(transcription));
    
    // Update the recording with the transcription ID and status
    await updateRecording(env, recordingId, {
      transcriptionId,
      status: RecordingStatus.COMPLETED
    });
    
    return transcription;
  } catch (error) {
    console.error('Error processing recording:', error);
    
    // Update the recording status to failed
    await updateRecording(env, recordingId, {
      status: RecordingStatus.FAILED
    });
    
    throw error;
  }
}

/**
 * Transcribe audio using groq-distil-whisper
 * @param {ArrayBuffer} audioData - The audio data to transcribe
 * @returns {Promise<string>} - The transcription text
 */
export async function transcribeAudio(audioData) {
  try {
    // In a real implementation, you would:
    // 1. Convert the audio data to the format required by groq-distil-whisper
    // 2. Make an API request to groq-distil-whisper
    // 3. Parse the response and return the transcription
    
    // For now, we'll just return a mock transcription
    return 'This is a mock transcription. In a real implementation, this would be the actual transcription of the audio.';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Get a transcription by recording ID
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} recordingId - The ID of the recording
 * @returns {Promise<Object|null>} - The transcription or null if not found
 */
export async function getTranscription(env, recordingId) {
  try {
    // Get the recording to find the transcription ID
    const recordingJson = await env.HARPER_DATA.get(`recording:${recordingId}`);
    
    if (!recordingJson) {
      return null;
    }
    
    const recording = JSON.parse(recordingJson);
    
    if (!recording.transcriptionId) {
      return null;
    }
    
    // Get the transcription
    const transcriptionJson = await env.HARPER_DATA.get(`transcription:${recording.transcriptionId}`);
    
    if (!transcriptionJson) {
      return null;
    }
    
    return JSON.parse(transcriptionJson);
  } catch (error) {
    console.error('Error getting transcription:', error);
    throw error;
  }
}

/**
 * Transcribe a recording
 * @param {Object} env - The environment object with KV and R2 bindings
 * @param {string} recordingId - The ID of the recording to transcribe
 * @returns {Promise<Object>} - The transcription object
 */
export async function transcribeRecording(env, recordingId) {
  try {
    // Get the recording
    const recordingJson = await env.HARPER_DATA.get(`recording:${recordingId}`);
    
    if (!recordingJson) {
      throw new Error(`Recording ${recordingId} not found`);
    }
    
    const recording = JSON.parse(recordingJson);
    
    // Check if a transcription already exists
    if (recording.transcriptionId) {
      const transcriptionJson = await env.HARPER_DATA.get(`transcription:${recording.transcriptionId}`);
      
      if (transcriptionJson) {
        return JSON.parse(transcriptionJson);
      }
    }
    
    // Start the transcription process
    return processRecording(env, recordingId, recording.r2Key);
  } catch (error) {
    console.error('Error transcribing recording:', error);
    throw error;
  }
}

/**
 * Implementation of the groq-distil-whisper API integration
 * @param {ArrayBuffer} audioData - The audio data to transcribe
 * @returns {Promise<string>} - The transcription text
 */
async function groqDistilWhisperTranscribe(audioData) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }
    
    // Convert ArrayBuffer to base64 for API transmission
    const base64Audio = arrayBufferToBase64(audioData);
    
    // Create form data for the API request
    const formData = new FormData();
    
    // Convert base64 back to a Blob for the form
    const blob = base64ToBlob(base64Audio, 'audio/mpeg');
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'distil-whisper');
    
    // Make the API request
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    return result.text;
  } catch (error) {
    console.error('Error using groq-distil-whisper:', error);
    throw error;
  }
}

/**
 * Helper function to convert ArrayBuffer to base64
 * @param {ArrayBuffer} buffer - The buffer to convert
 * @returns {string} - The base64 string
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

/**
 * Helper function to convert base64 to Blob
 * @param {string} base64 - The base64 string
 * @param {string} mimeType - The MIME type of the data
 * @returns {Blob} - The Blob object
 */
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}
