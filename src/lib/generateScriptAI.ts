// src/lib/generateScriptAI.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PodcastPayload, Script } from "@/types";

export async function generateScriptWithAI(
  payload: PodcastPayload
): Promise<{ text: string }> {
  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY as string
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Generate a podcast script with the following details:
- Title: ${payload.title}
- Hosts: ${payload.hosts.join(", ")}
- Style: ${payload.style}
- Approximate length: ${payload.length_minutes} minutes

Please include dialogue for each host, with speaker tags like [Host Name]: ...
Ensure the script is engaging and matches the specified style.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { text };
  } catch (error) {
    console.error("Error generating script with AI:", error);
    throw new Error("Failed to generate script with AI");
  }
}
