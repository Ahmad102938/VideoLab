export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { PodcastPayload, Script } from "@/types";
import { ScriptGeneratorService } from "@/services/scriptGenerator";
import prisma from "../../../lib/prisma";  

export async function POST(req: NextRequest) {
  
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
 
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

  const primaryEmail = clerkUser.emailAddresses?.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;
  if (!primaryEmail) {
    return NextResponse.json({ error: "No email found for user" }, { status: 400 });
  }

  console.log("prisma is", prisma);
console.log("prisma.user is", (prisma as any)?.user);

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

  let payload: PodcastPayload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Bad JSON:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, hosts, style, length_minutes, user_id } = payload;
  if (
    !title ||
    description === undefined || 
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

  let podcast;
  try {
    podcast = await prisma.podcast.create({
      data: {
        userId: userId,
        title: title,
        description: description,
        hosts: hosts,                      
        status: "DRAFT_PENDING_REVIEW",    
      },
    });
  } catch (err) {
    console.error("Error creating podcast record:", err);
    return NextResponse.json({ error: "Failed to create podcast" }, { status: 500 });
  }

  let aiResult: { text: string };
  try {
    aiResult = await new ScriptGeneratorService().generateScript(payload);
  } catch (err) {
    console.error("Error generating script:", err);
    return NextResponse.json({ error: "Script generation failed" }, { status: 500 });
  }


  const fullText = aiResult.text;

const lines = fullText.split(/\r?\n/).filter((line) => line.trim() !== "");
const segments: Array<{ hostName: string; text: string; segmentIndex: number }> = [];

lines.forEach((line, idx) => {

  const match = line.match(/^\*+\s*\[?([A-Za-z0-9_ -]+)\]?\s*:\*+\s*(.+)$/) ||
                line.match(/^\[?([A-Za-z0-9_ -]+)\]?\s*:\s*(.+)$/);

  if (match) {
    const hostName = match[1].trim();
    const spokenText = match[2].trim();

    const matchedHost = hosts.find(
      (h) => h.trim().toLowerCase() === hostName.toLowerCase()
    );
    if (matchedHost) {
      segments.push({ hostName: matchedHost, text: spokenText, segmentIndex: idx });
    } else {
      segments.push({
        hostName: hosts[0],
        text: line,
        segmentIndex: idx,
      });
    }
  } else {
    segments.push({
      hostName: hosts[0],
      text: line,
      segmentIndex: idx,
    });
  }
});

  let script;
  try {
    script = await prisma.script.create({
      data: {
        podcastId: podcast.id,
        fullText: fullText,
        segments: segments as any,           
        status: "READY_FOR_ASSIGNMENT",      
      },
    });
  } catch (err) {
    console.error("Error saving script to DB:", err);
    return NextResponse.json({ error: "Failed to save script" }, { status: 500 });
  }

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
