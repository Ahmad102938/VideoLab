// src/app/api/get-script/[podcastId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { podcastId: string } }
) {
  // ── 1) “params” is lazy, so await it before destructuring ──
  const { podcastId } = await params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ── 2) Fetch the script row and include the parent podcast’s userId ──
    const scriptRecord = await prisma.script.findUnique({
      where: { podcastId },
      include: {
        podcast: { select: { userId: true } },
      },
    });

    if (!scriptRecord) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }
    if (scriptRecord.podcast.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── 3) Return only the text & status fields ──
    return NextResponse.json(
      {
        script: {
          text: scriptRecord.text,
          status: scriptRecord.status,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in GET /api/get-script:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
