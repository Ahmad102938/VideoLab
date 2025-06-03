// src/services/scriptGenerator.ts

import { generateScriptWithAI } from "@/lib/generateScriptAI";
import { PodcastPayload, Script } from "@/types";

export class ScriptGeneratorService {
  async generateScript(
    payload: PodcastPayload
  ): Promise<{ text: string }> {
    const ScriptDraft = await generateScriptWithAI(payload);
    if (ScriptDraft) {
      return ScriptDraft; // { text: "Alice: …\nBob: …" }
    } else {
      throw new Error("Failed to generate script");
    }
  }
}
