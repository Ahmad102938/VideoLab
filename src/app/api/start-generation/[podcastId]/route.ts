
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { synthesisQueue } from "@/lib/queue";

export async function POST(
  req: NextRequest,
  { params }: { params: { podcastId: string } }
) {
  const { podcastId } = await params;
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scriptRecord = await prisma.script.findUnique({
    where: { podcastId },
    include: {
      podcast: {
        select: { userId: true },
      },
    },
  });
  if (!scriptRecord) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }
  if (scriptRecord.podcast.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (scriptRecord.status !== "READY_FOR_ASSIGNMENT") {
    return NextResponse.json(
      { error: `Script not ready (status: ${scriptRecord.status})` },
      { status: 400 }
    );
  }

  await prisma.script.update({
    where: { podcastId },
    data: { status: "SYNTHESIS_QUEUED" },
  });
  await prisma.podcast.update({
    where: { id: podcastId },
    data: { status: "SYNTHESIS_QUEUED" },
  });

  await synthesisQueue.add("synthesize-podcast", { podcastId });

  const script = await prisma.script.findUnique({
    where: { podcastId },
  });
  if (!script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }
  type Segment = { hostName: string; text: string; segmentIndex: number };
  const segments: Segment[] = Array.isArray(script.segments)
    ? script.segments.filter(
        (s): s is Segment =>
          typeof s === "object" &&
          s !== null &&
          "hostName" in s &&
          "text" in s &&
          "segmentIndex" in s
      )
    : [];

  const hostAssignments = await prisma.hostAssignment.findMany({ where: { podcastId } });
  const hostMap = Object.fromEntries(
    hostAssignments.map((h) => [h.hostName, { voiceId: h.voiceId, provider: h.provider }])
  );

  for (const segment of segments) {
    if (!segment) continue;
    const assignment = hostMap[segment.hostName] || {};
    await synthesisQueue.add("tts-job", {
      podcastId,
      text: segment.text,
      segmentIndex: segment.segmentIndex,
      voiceId: assignment.voiceId || "",
      provider: assignment.provider || "",
    });
  }

  return NextResponse.json(
    { success: true, message: "Synthesis jobs queued." },
    { status: 200 }
  );
}
