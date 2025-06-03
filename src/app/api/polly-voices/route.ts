// src/app/api/polly-voices/route.ts

import { NextRequest, NextResponse } from "next/server";
import polly from "@/lib/polly";

export async function GET(req: NextRequest) {
  try {
    // DescribeVoices can filter by LanguageCode or Engine, but we'll just grab all neural voices
    const data = await polly.describeVoices({ Engine: "neural" }).promise();

    // data.Voices is an array of AWS.Polly.Voice (lots of fields)
    // We’ll pick only these for the front end: Id, Name, LanguageCode, Gender, SampleRate
    const voices = (data.Voices || []).map((v) => ({
      id: v.Id,             // e.g. "Joanna"
      name: v.Name,         // e.g. "Joanna"
      languageCode: v.LanguageCode, // e.g. "en-US"
      gender: v.Gender,     // "Female" | "Male"
      provider: "Amazon Polly",
      // NOTE: Polly doesn’t give a sample URL here, we'll make a demo route separately
    }));

    return NextResponse.json({ voices }, { status: 200 });
  } catch (err) {
    console.error("Error calling Polly.describeVoices():", err);
    return NextResponse.json(
      { error: "Failed to fetch Polly voices" },
      { status: 500 }
    );
  }
}
