import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { uploadToStorage } from "@/lib/storage";
import { submitRatelimit, checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Allowed file types: only PNG and JPG/JPEG
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the team session
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1.a Rate limit submissions per team to avoid DB/IO overload
    const limited = await checkRateLimit(submitRatelimit, `submit:${user.team_id}`);
    if (limited) return limited;

    // 2. Parse request form-data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const levelIdStr = formData.get("level_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const level_id = parseInt(levelIdStr || "1");

    // 3. Enforce file size limit (5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`[upload] File size exceeded limit: team_id=${user.team_id} size=${file.size} bytes`);
      return NextResponse.json(
        { error: "File size limit exceeded. Maximum upload size is 5MB." },
        { status: 400 }
      );
    }

    // 4. Enforce file type limits (only PNG and JPG/JPEG, strictly no PDF or other formats)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.warn(`[upload] File type rejected: team_id=${user.team_id} type=${file.type}`);
      return NextResponse.json(
        { error: "Unsupported file type. Only JPG, JPEG, and PNG images are allowed." },
        { status: 400 }
      );
    }

    // 5. Convert file to buffer for storage upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a clean unique path: e.g. team-name/level_1_timestamp.png
    const extension = file.type.split("/")[1] || "jpg";
    const cleanFileName = `${user.team_id.toLowerCase().replace(/[^a-z0-9_-]/g, "")}/level_${level_id}_${Date.now()}.${extension}`;

    // 6. Upload file directly to Supabase Storage Bucket
    console.log(`[upload] Uploading screenshot to Supabase Storage: ${cleanFileName}`);
    const publicUrl = await uploadToStorage(buffer, cleanFileName, file.type);

    return NextResponse.json({
      success: true,
      publicUrl,
      message: "Screenshot proof uploaded successfully."
    });

  } catch (error: any) {
    console.error("[upload] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}
