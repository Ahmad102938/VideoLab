import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';

interface GenerateTTSRequest {
  podcastId: string;
}

interface Segment {
  hostName: string;
  text: string;
  segmentIndex: number;
}

const prisma = new PrismaClient();
const queue = new Queue('tts-queue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateTTSRequest;
    const { podcastId } = body;

    if (!podcastId) {
      return NextResponse.json({ message: 'Missing podcastId' }, { status: 400 });
    }

    const script = await prisma.script.findUnique({
      where: { podcastId },
    });
    if (!script) {
      return NextResponse.json({ message: 'Script not found' }, { status: 404 });
    }

    await prisma.script.update({
      where: { podcastId },
      data: { status: 'SYNTHESIS_QUEUED' },
    });

    const hostAssignments = await prisma.hostAssignment.findMany({
      where: { podcastId },
    });

    const hostMap: Record<string, { voiceId: string | null; provider: string | null }> = {};
    hostAssignments.forEach((ha) => {
      hostMap[ha.hostName] = { voiceId: ha.voiceId, provider: ha.provider };
    });

const segments = script.segments as unknown as Segment[];
if (!Array.isArray(segments)) {
  return NextResponse.json({ message: 'Invalid segments format' }, { status: 500 });
}

console.log('Segments to process:', segments);
    for (const segment of segments) {
      const { hostName, text, segmentIndex } = segment;
      if (!hostName || !text || segmentIndex === undefined) {
        throw new Error('Invalid segment data');
      }
      const host = hostMap[hostName];
      if (!host || !host.voiceId || !host.provider) {
        throw new Error(`HostAssignment not found or incomplete for host: ${hostName}`);
      }
      await queue.add('tts', {
        text,
        voiceId: host.voiceId,
        provider: host.provider,
        segmentIndex,
        podcastId,
      });
    }

    await prisma.script.update({
      where: { podcastId },
      data: { status: 'SYNTHESIS_IN_PROGRESS' },
    });

    return NextResponse.json({ message: 'Jobs added to queue' }, { status: 200 });
  } catch (error) {
    console.error('Error adding jobs:', error);
    return NextResponse.json(
      { message: 'Error adding jobs', error: (error as Error).message },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}