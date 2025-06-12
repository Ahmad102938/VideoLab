// src/app/api/start-generation/[podcastId]/route.ts

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

  // Verify script exists & belongs to this user
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

  // Update status → SYNTHESIS_QUEUED
  await prisma.script.update({
    where: { podcastId },
    data: { status: "SYNTHESIS_QUEUED" },
  });
  await prisma.podcast.update({
    where: { id: podcastId },
    data: { status: "SYNTHESIS_QUEUED" },
  });

  // Enqueue a job
  await synthesisQueue.add("synthesize-podcast", { podcastId });

  return NextResponse.json(
    { success: true, message: "Synthesis job queued." },
    { status: 200 }
  );
}
