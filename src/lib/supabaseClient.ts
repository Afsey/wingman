import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize client only if we have credentials
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Helper to upload base64 image to Supabase Storage
 */
export async function uploadBase64ToSupabase(base64Data: string, fileName: string, bucketName: string = 'wingman-assets') {
  if (!supabase) {
    throw new Error('Supabase credentials are not configured in .env');
  }

  // Ensure bucket exists or we just try to upload
  // A robust app might check if bucket exists, but we'll assume the admin created it.
  
  // Convert base64 to buffer
  const base64Content = base64Data.split(';base64,').pop();
  if (!base64Content) throw new Error('Invalid base64 string');
  
  const buffer = Buffer.from(base64Content, 'base64');

  // Detect mime type
  const mimeType = base64Data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Helper to upload a raw Buffer to Supabase Storage
 */
export async function uploadBufferToSupabase(buffer: Buffer, fileName: string, mimeType: string, bucketName: string = 'wingman-assets') {
  if (!supabase) {
    throw new Error('Supabase credentials are not configured in .env');
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Helper to delete a file from Supabase Storage
 */
export async function deleteFileFromSupabase(fileName: string, bucketName: string = 'wingman-assets') {
  if (!supabase) {
    throw new Error('Supabase credentials are not configured in .env');
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([fileName]);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
  
  return true;
}
