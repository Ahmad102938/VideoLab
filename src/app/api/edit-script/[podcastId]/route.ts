import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { podcastId: string } }) {
  const { podcastId } = params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // double-check the podcast belongs to this user
  const existingPodcast = await prisma.podcast.findUnique({
    where: { id: podcastId },
    select: { userId: true, script: true },
  });
  if (!existingPodcast || existingPodcast.userId !== userId) {
    return NextResponse.json({ error: "Podcast not found or access denied" }, { status: 404 });
  }

  // parse incoming JSON
  let body: { text?: string; status?: string };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, status } = body;
  if (typeof text !== "string" && typeof status !== "string") {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Build the update payload
  const dataToUpdate: any = {};
  if (typeof text === "string") dataToUpdate.text = text;
  if (typeof status === "string") dataToUpdate.status = status;

  try {
    const updatedScript = await prisma.script.update({
      where: { podcastId: podcastId },
      data: dataToUpdate,
    });
    return NextResponse.json({ script: updatedScript }, { status: 200 });
  } catch (err) {
    console.error("Error updating script:", err);
    return NextResponse.json({ error: "Failed to update script" }, { status: 500 });
  }
}
