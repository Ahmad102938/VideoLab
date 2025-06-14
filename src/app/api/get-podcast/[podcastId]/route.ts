
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

  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        finalAudioUrl: true,
        userId: true,
        hosts: true,
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
    if (podcast.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If there are NO HostAssignment rows, fall back to the bare hosts[]
    let assignments: Array<{ hostName: string; voiceId: string; provider: string }> = [];

    if (podcast.hostAssignments.length > 0) {
      // Use the real assignments
      assignments = podcast.hostAssignments.map((ha) => ({
        hostName: ha.hostName,
        voiceId: ha.voiceId || "",
        provider: ha.provider || "",
      }));
    } else {
      // No assignments yet → build one per name in podcast.hosts
      assignments = podcast.hosts.map((h) => ({
        hostName: h,
        voiceId: "",
        provider: "",
      }));
    }

    return NextResponse.json(
      {
        podcast: {
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          status: podcast.status,
          createdAt: podcast.createdAt,
          finalAudioUrl: podcast.finalAudioUrl,
          hosts: assignments, 
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in GET /api/get-podcast:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
