// src/app/api/get-script/[podcastId]/route.ts

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
    // 1) Fetch the script record (and ensure it belongs to this user)
    const scriptRecord = await prisma.script.findUnique({
      where: { podcastId },
      include: {
        podcast: {
          select: { userId: true, hosts: true }, // also grab the hosts[] array
        },
      },
    });

    if (!scriptRecord) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }
    if (scriptRecord.podcast.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2) We now have:
    //    - scriptRecord.fullText (a big string, possibly containing "**[HostName]:** ..." lines)
    //    - scriptRecord.segments (we originally wrote a raw JSON, but we’ll re‐segment here to strip the tags)
    //    - scriptRecord.podcast.hosts (the array of hosts, e.g. ["rayn","mike"])
    const rawText = scriptRecord.fullText;
    const hostsList = scriptRecord.podcast.hosts.map((h) => h.toLowerCase());

    // 3) Split the full transcript into lines, filter out empty lines
    const lines = rawText.split(/\r?\n/).filter((ln) => ln.trim() !== "");

    // 4) Build a new "segments" array, where we detect "**[HostName]:**" or "[HostName]:"
    const segments: Array<{ hostName: string; text: string; segmentIndex: number }> = [];

    lines.forEach((line, idx) => {
      let hostName = hostsList[0]; // default to the first host if no tag matches
      let spokenText = line;

      // 4a) First, try to match the bold‐markdown "**[HostName]:** "
      //    e.g. "**[Rayn]:** Welcome back to Tech Deep Dive…"
      const mdBoldRegex = /^\*\*\s*\[(.+?)\]\s*:\s*\*\*\s*(.+)$/;
      const mdBoldMatch = line.match(mdBoldRegex);
      if (mdBoldMatch) {
        const maybeHost = mdBoldMatch[1].trim().toLowerCase(); // e.g. "rayn" or "mike"
        // If that host actually exists in our hostsList, use it:
        if (hostsList.includes(maybeHost)) {
          hostName = maybeHost;
        }
        spokenText = mdBoldMatch[2]; // the text after the "**[HostName]:** " portion
      } else {
        // 4b) If that didn’t match, try a simpler "[HostName]: text" (no markdown)
        const bracketTagRegex = /^\s*\[(.+?)\]\s*:\s*(.+)$/;
        const bracketMatch = line.match(bracketTagRegex);
        if (bracketMatch) {
          const maybeHost = bracketMatch[1].trim().toLowerCase();
          if (hostsList.includes(maybeHost)) {
            hostName = maybeHost;
          }
          spokenText = bracketMatch[2];
        }
      }

      // 4c) At this point:
      //    - hostName is either the matched host, or the default to hostsList[0]
      //    - spokenText has had the "[HostName]: " or "**[HostName]:** " stripped off
      segments.push({
        hostName,
        text: spokenText.trim(),
        segmentIndex: idx,
      });
    });

    // 5) Return fullText + our cleaned "segments" + status
    return NextResponse.json(
      {
        script: {
          fullText: rawText,
          segments,
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
