import { NextResponse } from "next/server";
import { createXaiVoiceSession, isXaiVoiceConfigured } from "@/lib/voice/xai";

export async function POST() {
  if (!isXaiVoiceConfigured()) {
    return NextResponse.json({ error: "Voice is not configured." }, { status: 503 });
  }

  try {
    const session = await createXaiVoiceSession();
    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start a voice session.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
