import { NextRequest, NextResponse } from "next/server";
import polly from "@/lib/polly";

export async function GET(req: NextRequest) {
  try {

    const data = await polly.describeVoices({ Engine: "neural" }).promise();

    const voices = (data.Voices || []).map((v) => ({
      id: v.Id,            
      name: v.Name,         
      languageCode: v.LanguageCode, 
      gender: v.Gender,     
      provider: "Amazon Polly",
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
