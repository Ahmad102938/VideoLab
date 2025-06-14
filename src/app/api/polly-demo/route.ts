
import { NextRequest, NextResponse } from "next/server";
import polly from "@/lib/polly";

export async function GET(req: NextRequest) {
  // Expect a query parameter: ?voiceId=Joanna
  const voiceId = req.nextUrl.searchParams.get("voiceId") || "Joanna";
  const sampleText = "Hello, this is a quick demo of what this voice sounds like.";

  try {
    const result = await polly
      .synthesizeSpeech({
        OutputFormat: "mp3",
        Text: sampleText,
        VoiceId: voiceId,
        Engine: "neural", 
      })
      .promise();

    // result.AudioStream is a Buffer
    const audioBase64 = result.AudioStream?.toString("base64");
    const url = `data:audio/mp3;base64,${audioBase64}`;
    return NextResponse.json({ demoUrl: url }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/polly-demo:", err);
    return NextResponse.json(
      { error: "Failed to generate demo audio" },
      { status: 500 }
    );
  }
}
