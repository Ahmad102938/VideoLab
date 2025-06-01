import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type VoiceAssignment = {
  hostName: string;
  voiceId: string;
  provider: string;
};

export async function POST(req: NextRequest, { params }: { params: { podcastId: string } }) {
  const { podcastId } = params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Make sure podcast belongs to this user
  const existingPodcast = await prisma.podcast.findUnique({
    where: { id: podcastId },
    select: { userId: true },
  });
  if (!existingPodcast || existingPodcast.userId !== userId) {
    return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
  }

  // Parse the incoming assignments
  let body: { assignments?: VoiceAssignment[] };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { assignments } = body;
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return NextResponse.json({ error: "No assignments provided" }, { status: 400 });
  }

  // Validate shape of each assignment
  for (const a of assignments) {
    if (typeof a.hostName !== "string" || typeof a.voiceId !== "string" || typeof a.provider !== "string") {
      return NextResponse.json({ error: "Invalid assignment format" }, { status: 400 });
    }
  }

  // Create HostAssignment rows in a transaction (or at least in bulk)
  try {
    // First, optionally: clear out any existing assignments for this podcast
    await prisma.hostAssignment.deleteMany({
      where: { podcastId: podcastId },
    });

    // Now, bulk create
    const created = await prisma.hostAssignment.createMany({
      data: assignments.map((a) => ({
        podcastId: podcastId,
        hostName: a.hostName,
        voiceId: a.voiceId,
        provider: a.provider,
        // segmentIndex: 0 (if you need segments later)
      })),
      skipDuplicates: true, // just in case
    });

    // Optionally, update Podcast.status to "SYNTHESIS_PENDING" or flip Script.status again:
    await prisma.podcast.update({
      where: { id: podcastId },
      data: { status: "SYNTHESIS_PENDING" },
    });

    return NextResponse.json({ success: true, createdCount: created.count }, { status: 200 });
  } catch (err) {
    console.error("Error saving assignments:", err);
    return NextResponse.json({ error: "Failed to save voice assignments" }, { status: 500 });
  }
}
