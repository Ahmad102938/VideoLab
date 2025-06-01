// src/app/api/generate-script/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth, currentUser } from '@clerk/nextjs/server';
import { PodcastPayload } from '@/types';
import { ScriptGeneratorService } from '@/services/scriptGenerator';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // 1) Extract userId from the request’s cookies/JWT
  const { userId } = getAuth(req);

  if (!userId) {
    // No valid session → 401
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Fetch the full Clerk “Backend User” object via currentUser()
  let clerkUser;
  try {
    // currentUser() will return null if not signed in
    clerkUser = await currentUser();
  } catch (err) {
    console.error('Error calling currentUser():', err);
    return NextResponse.json({ error: 'Failed to fetch Clerk user' }, { status: 500 });
  }

  if (!clerkUser || clerkUser.id !== userId) {
    // This is just an extra sanity check—if currentUser() returns null or a mismatched ID
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3) Grab the primary email from clerkUser.emailAddresses
  const primaryEmail = clerkUser.emailAddresses?.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
  }

  // 4) Upsert into Prisma
  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: primaryEmail,
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
          : null,
        createdAt: new Date(),
      },
    });
    console.log(`User ${userId} synced in database`);
  } catch (err) {
    console.error('Error ensuring user in DB:', err);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }

  // 5) Parse the incoming JSON payload
  let payload: PodcastPayload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error('Bad JSON:', err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 6) Validate required fields
  const { title, hosts, style, length_minutes, user_id } = payload;
  if (!title || !hosts || !style || !length_minutes || !user_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (user_id !== userId) {
    return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
  }

  // 7) Create a new Podcast record
  let podcast;
  try {
    podcast = await prisma.podcast.create({
      data: {
        userId: userId,
        title: title,
        status: 'DRAFT_PENDING_REVIEW',
      },
    });
  } catch (err) {
    console.error('Error creating podcast record:', err);
    return NextResponse.json({ error: 'Failed to create podcast' }, { status: 500 });
  }

  // 8) Generate the script
  let scriptText: string;
  try {
     const result = await new ScriptGeneratorService().generateScript(payload);
  
  // If result is { text: "..." }, do this:
  if (typeof result === 'object' && result !== null && 'text' in result) {
    scriptText = (result as any).text; 
  } else if (typeof result === 'string') {
    scriptText = result;
  } else {
    throw new Error('Unexpected return type from generateScript');
  }
  } catch (err) {
    console.error('Error generating script:', err);
    return NextResponse.json({ error: 'Script generation failed' }, { status: 500 });
  }

  // 9) Save the script in Prisma
  let script;
  try {
    script = await prisma.script.create({
      data: {
        podcastId: podcast.id,
        text: scriptText,
        status: 'DRAFT_PENDING_REVIEW',
      },
    });
  } catch (err) {
    console.error('Error saving script to DB:', err);
    return NextResponse.json({ error: 'Failed to save script' }, { status: 500 });
  }

  // 10) Return the created script info
  return NextResponse.json({
    scriptId: script.id,
    status: script.status,
    scriptDraft: script.text,
  });
}
