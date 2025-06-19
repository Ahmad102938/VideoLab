import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { podcastId: string } }
) {
  const { podcastId } = await params;
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("Looking for podcastId:", podcastId);
  const scriptRecord = await prisma.script.findUnique({
    where: { podcastId },
    include: {
      podcast: {
        select: { userId: true },
      },
    },
  });
  console.log("🔍 scriptRecord is", scriptRecord);
  if (!scriptRecord) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }
  if (scriptRecord.podcast.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(
    {
      script: {
        fullText: scriptRecord.fullText,
        segments: scriptRecord.segments,
        audioUrls: scriptRecord.audioUrls || [],
        status: scriptRecord.status,
      },
    },
    { status: 200 }
  );
}
