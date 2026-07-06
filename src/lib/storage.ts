import { supabase } from "./supabase";

/**
 * Uploads a file buffer directly to Supabase Storage Bucket.
 * Returns the public CDN URL of the uploaded file.
 * 
 * @param fileBuffer - The file buffer to upload
 * @param fileName - Target file name inside the bucket
 * @param contentType - MIME type of the file (image/png, image/jpeg)
 */
export async function uploadToStorage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = "proofs";

  // Upload the file to the bucket (upsert: true overwrites if it already exists)
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType,
      duplex: "half",
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Get the public URL of the uploaded object
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  if (!data?.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase Storage");
  }

  return data.publicUrl;
}
