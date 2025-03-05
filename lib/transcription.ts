import { Env } from './db';
import { downloadFromR2 } from './storage';
import { createTranscription } from './models';

// Interface for transcription result
export interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
}

// Function to transcribe audio using groq-distil-whisper
export async function transcribeAudio(
  audioData: ArrayBuffer
): Promise<TranscriptionResult> {
  try {
    // Convert ArrayBuffer to base64 for API transmission
    const base64Audio = arrayBufferToBase64(audioData);
    
    // Groq API endpoint for distil-whisper
    const endpoint = 'https://api.groq.com/openai/v1/audio/transcriptions';
    
    // Get API key from environment
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GROQ_API_KEY is not set' };
    }
    
    // Create form data for the API request
    const formData = new FormData();
    
    // Convert base64 back to a Blob for the form
    const blob = base64ToBlob(base64Audio, 'audio/mpeg');
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'distil-whisper');
    
    // Make the API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `API error: ${response.status} - ${errorText}` };
    }
    
    const result = await response.json();
    
    return { success: true, text: result.text };
  } catch (error) {
    console.error('Transcription error:', error);
    return { success: false, error: `Transcription failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
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

// Function to process a recording from R2 and save the transcription
export async function processRecording(
  env: Env,
  recordingId: number,
  r2Key: string
): Promise<TranscriptionResult> {
  try {
    // Download the recording from R2
    const downloadResult = await downloadFromR2(env, r2Key);
    
    if (!downloadResult.success || !downloadResult.data) {
      return { success: false, error: downloadResult.error || 'Failed to download recording' };
    }
    
    // Transcribe the audio
    const transcriptionResult = await transcribeAudio(downloadResult.data);
    
    if (!transcriptionResult.success || !transcriptionResult.text) {
      return { success: false, error: transcriptionResult.error || 'Failed to transcribe audio' };
    }
    
    // Save the transcription to the database
    await createTranscription(env, recordingId, transcriptionResult.text);
    
    return { success: true, text: transcriptionResult.text };
  } catch (error) {
    console.error('Error processing recording:', error);
    return { success: false, error: `Processing failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}
