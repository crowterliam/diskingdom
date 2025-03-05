import { Env } from './db';

export interface UploadResult {
  success: boolean;
  key?: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  data?: ArrayBuffer;
  contentType?: string;
  error?: string;
}

// Upload a file to R2 storage
export async function uploadToR2(
  env: Env,
  data: ArrayBuffer | string | null,
  key: string,
  contentType: string = 'audio/mpeg'
): Promise<UploadResult> {
  try {
    await env.R2.put(key, data, {
      httpMetadata: { contentType }
    });
    
    return { success: true, key };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

// Download a file from R2 storage
export async function downloadFromR2(
  env: Env,
  key: string
): Promise<DownloadResult> {
  try {
    const object = await env.R2.get(key);
    
    if (!object) {
      return { success: false, error: 'File not found' };
    }
    
    const data = await object.arrayBuffer();
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
    
    return { success: true, data, contentType };
  } catch (error) {
    console.error('Error downloading from R2:', error);
    return { success: false, error: 'Failed to download file' };
  }
}

// Delete a file from R2 storage
export async function deleteFromR2(
  env: Env,
  key: string
): Promise<boolean> {
  try {
    await env.R2.delete(key);
    return true;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    return false;
  }
}

// Generate a unique key for a recording
export function generateRecordingKey(gameId: number, userId: number): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `recordings/${gameId}/${userId}/${timestamp}-${randomPart}.mp3`;
}

// Get a signed URL for direct browser upload (if needed)
export async function getSignedUploadUrl(
  env: Env,
  key: string,
  // Using the expirationSeconds parameter in the URL construction
  expirationSeconds: number = 3600
): Promise<string | null> {
  try {
    // Note: This is a placeholder as Cloudflare Workers R2 doesn't directly support
    // signed URLs in the same way as S3. In a real implementation, you would need
    // to create a Worker that generates a temporary URL and handles the upload.
    // Include expiration in seconds as a query parameter
    return `https://your-worker-url.workers.dev/upload?key=${encodeURIComponent(key)}&expires=${expirationSeconds}`;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

// Get a signed URL for direct browser download (if needed)
export async function getSignedDownloadUrl(
  env: Env,
  key: string,
  // Using the expirationSeconds parameter in the URL construction
  expirationSeconds: number = 3600,
  filename?: string
): Promise<string | null> {
  try {
    // Note: This is a placeholder as Cloudflare Workers R2 doesn't directly support
    // signed URLs in the same way as S3. In a real implementation, you would need
    // to create a Worker that generates a temporary URL and handles the download.
    const filenameParam = filename ? `&filename=${encodeURIComponent(filename)}` : '';
    // Include expiration in seconds as a query parameter
    return `https://your-worker-url.workers.dev/download?key=${encodeURIComponent(key)}${filenameParam}&expires=${expirationSeconds}`;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}
