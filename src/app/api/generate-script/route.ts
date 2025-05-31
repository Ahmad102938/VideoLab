import { NextRequest, NextResponse } from 'next/server';
import { PodcastPayload } from '@/types';
import { ScriptGeneratorService } from '@/services/scriptGenerator';

export async function POST(req: NextRequest) {
  try {
    const payload: PodcastPayload = await req.json();

    // Validate payload
    if (!payload.title || !payload.hosts || !payload.style || !payload.length_minutes || !payload.user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const scriptGenerator = new ScriptGeneratorService();
    const script = await scriptGenerator.generateScript(payload);

    console.log('Generated script:', script);

    return NextResponse.json({
      scriptId: script.id,
      status: script.status,
      scriptDraft: script.script_draft,
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}