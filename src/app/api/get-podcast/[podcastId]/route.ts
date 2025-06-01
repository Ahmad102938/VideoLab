// src/app/api/get-podcast/[podcastId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { podcastId: string } }
) {
  // 1) “params” is lazy, so await it before destructuring
  const { podcastId } = await params;

  // 2) Auth check
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 3) Fetch the podcast (including its owner and its HostAssignment rows)
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        finalAudioUrl: true,
        userId: true, // so we can check ownership
        hostAssignments: {
          select: {
            hostName: true,
            voiceId: true,
            provider: true,
          },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    // 4) Ownership check
    if (podcast.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5) Return only the fields the frontend needs
    return NextResponse.json(
      {
        podcast: {
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          status: podcast.status,
          createdAt: podcast.createdAt,
          finalAudioUrl: podcast.finalAudioUrl,
          hosts: podcast.hostAssignments.map((ha) => ({
            hostName: ha.hostName,
            voiceId: ha.voiceId,
            provider: ha.provider,
          })),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in GET /api/get-podcast:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
