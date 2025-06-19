
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { podcastId: string } }
) {
  const { podcastId } = await params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingPodcast = await prisma.podcast.findUnique({
    where: { id: podcastId },
    select: { userId: true },
  });
  if (!existingPodcast || existingPodcast.userId !== userId) {
    return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
  }

  let body: {
    segments?: Array<{ hostName: string; text: string; segmentIndex: number }>;
    status?: string;
  };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { segments, status } = body;
  if (!Array.isArray(segments) && typeof status !== "string") {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Build update payload
  const dataToUpdate: any = {};
  if (Array.isArray(segments)) {
    const fullText = segments
      .map((seg) => `${seg.hostName}: ${seg.text}`)
      .join("\n");
    dataToUpdate.fullText = fullText;
    dataToUpdate.segments = segments;
  }
  if (typeof status === "string") {
    dataToUpdate.status = status;
  }

  try {
    const updatedScript = await prisma.script.update({
      where: { podcastId },
      data: dataToUpdate,
      select: { fullText: true, segments: true, status: true },
    });
    return NextResponse.json({ script: updatedScript }, { status: 200 });
  } catch (err) {
    console.error("Error updating script:", err);
    return NextResponse.json({ error: "Failed to update script" }, { status: 500 });
  }
}
