// src/app/api/generate-script/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { PodcastPayload, Script } from "@/types";
import { ScriptGeneratorService } from "@/services/scriptGenerator";
import prisma from "@/lib/prisma";

/**
 * POST /api/generate-script
 * 
 * Expects a JSON body of the shape PodcastPayload:
 * {
 *   title: string;
 *   description: string;
 *   hosts: string[];        // e.g. ["Alice","Bob"]
 *   style: string;
 *   length_minutes: number;
 *   user_id: string;
 * }
 */
export async function POST(req: NextRequest) {
  // ── 1) Clerk auth: ensure there’s a logged‐in user ──
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Fetch the full Clerk User (optional extra check)
  let clerkUser;
  try {
    clerkUser = await currentUser();
  } catch (err) {
    console.error("Error calling currentUser():", err);
    return NextResponse.json({ error: "Failed to fetch Clerk user" }, { status: 500 });
  }
  if (!clerkUser || clerkUser.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3) Grab primaryEmail (and sync user into our Prisma DB)
  const primaryEmail = clerkUser.emailAddresses?.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;
  if (!primaryEmail) {
    return NextResponse.json({ error: "No email found for user" }, { status: 400 });
  }

  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: primaryEmail,
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : null,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Error ensuring user in DB:", err);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }

  // ── 4) Parse incoming JSON payload ──
  let payload: PodcastPayload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Bad JSON:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 5) Validate required fields
  const { title, description, hosts, style, length_minutes, user_id } = payload;
  if (
    !title ||
    description === undefined || // allow empty string but not undefined
    !Array.isArray(hosts) ||
    hosts.length === 0 ||
    !style ||
    !length_minutes ||
    !user_id
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (user_id !== userId) {
    return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
  }

  // ── 6) Create a new Podcast record, storing hosts[] immediately ──
  let podcast;
  try {
    podcast = await prisma.podcast.create({
      data: {
        userId: userId,
        title: title,
        description: description,
        hosts: hosts,                      // ← save the array of host names
        status: "DRAFT_PENDING_REVIEW",     // or whatever initial state you want
      },
    });
  } catch (err) {
    console.error("Error creating podcast record:", err);
    return NextResponse.json({ error: "Failed to create podcast" }, { status: 500 });
  }

  // ── 7) Generate the script text from AI ──
  let aiResult: { text: string };
  try {
    aiResult = await new ScriptGeneratorService().generateScript(payload);
  } catch (err) {
    console.error("Error generating script:", err);
    return NextResponse.json({ error: "Script generation failed" }, { status: 500 });
  }

  // aiResult.text is a single string, e.g.:
  // "Alice: Hey Bob, question...\nBob: Yeah, Alice, I think...\nAlice: Let's dive in...\n..."
  const fullText = aiResult.text;

  // ── 8) Simple segmentation: split on newline, parse "[HostName]: text" ──
  // This is a basic approach. You can make it more robust if needed.
  const lines = fullText.split(/\r?\n/).filter((line) => line.trim() !== "");
  const segments: Array<{ hostName: string; text: string; segmentIndex: number }> = [];

  lines.forEach((line, idx) => {
    // Try to match "HostName: the spoken text"
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const hostName = match[1];
      const spokenText = match[2];

      // Only accept hostName if it’s in the payload.hosts array
      if (hosts.includes(hostName)) {
        segments.push({ hostName, text: spokenText, segmentIndex: idx });
      } else {
        // If the speaker tag isn’t in payload.hosts, attribute to the first host
        segments.push({
          hostName: hosts[0],
          text: line,
          segmentIndex: idx,
        });
      }
    } else {
      // No clear "HostName:" tag → attribute to the first host
      segments.push({
        hostName: hosts[0],
        text: line,
        segmentIndex: idx,
      });
    }
  });

  // ── 9) Save the Script record with fullText + segments JSON ──
  let script;
  try {
    script = await prisma.script.create({
      data: {
        podcastId: podcast.id,
        fullText: fullText,
        segments: segments as any,           // Prisma’s Json type accepts a JS object/array
        status: "READY_FOR_ASSIGNMENT",      // now waiting for the user to pick voices
      },
    });
  } catch (err) {
    console.error("Error saving script to DB:", err);
    return NextResponse.json({ error: "Failed to save script" }, { status: 500 });
  }

  // ── 10) Return the “draft” info so the front end can show/edit it ──
  return NextResponse.json(
    {
      podcastId: podcast.id,
      scriptId: script.id,
      status: script.status,
      fullText: script.fullText,
      segments: script.segments,
    },
    { status: 201 }
  );
}
