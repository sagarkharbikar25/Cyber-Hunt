import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // screenshots are compressed via canvas and uploaded directly in solution transmission
    // we return a standard mock success for legacy static screenshot uploads page.
    return NextResponse.json({ success: true, message: "Screenshot proof processed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
