import { generateScriptWithAI } from "@/lib/generateScriptAI";
import { PodcastPayload } from "@/types";
import { Script } from "@/types";

export class ScriptGeneratorService {
    async generateScript(payLoad: PodcastPayload): Promise<Script> {
        //generating script using AI
        const ScriptDraft = await generateScriptWithAI(payLoad);
        if(ScriptDraft) {
            return ScriptDraft;
        } else {
            throw new Error("Failed to generate script");
        }
    }
}