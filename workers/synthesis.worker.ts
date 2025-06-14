import { Worker, Job } from 'bullmq';
import AWS from 'aws-sdk';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';

// Define job data type
type TTSJobData = {
  text: string;
  voiceId: string;
  provider: string;
  segmentIndex: number;
  podcastId: string;
};

// Initialize AWS SDK and Prisma
const prisma = new PrismaClient();

// Configure AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION,
});

const polly = new AWS.Polly();
const s3 = new AWS.S3();

// Initialize merge queue
const mergeQueue = new Queue('merge-queue', {
  connection: { host: 'localhost', port: 6379 },
});

// Worker to process TTS jobs (using neural engine only)
const worker = new Worker(
  'tts-queue',
  async (job: Job<TTSJobData>) => {
    const { text, voiceId, provider, segmentIndex, podcastId } = job.data;

    console.log(`Starting TTS job ${job.id} for podcast ${podcastId}, segment ${segmentIndex}`);

    // Validate provider
    if (!provider.trim().toLowerCase().includes('polly')) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Synthesize speech
    const pollyResult = await polly
      .synthesizeSpeech({
        Text: text,
        VoiceId: voiceId,
        OutputFormat: 'mp3',
        Engine: 'neural',
      })
      .promise();

    if (!pollyResult.AudioStream) {
      throw new Error('No audio returned from Polly');
    }

    // Upload to S3
    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    if (!bucket) {
      throw new Error('Missing AWS_S3_BUCKET_NAME environment variable');
    }

    const s3Key = `podcasts/${podcastId}/segments/${segmentIndex}.mp3`;
    await s3
      .upload({
        Bucket: bucket,
        Key: s3Key,
        Body: pollyResult.AudioStream,
        ContentType: 'audio/mpeg',
      })
      .promise();

    // Generate pre-signed URL
    const url = s3.getSignedUrl('getObject', {
      Bucket: bucket,
      Key: s3Key,
      Expires: 7 * 24 * 3600,
    });

    // Update script record
    const script = await prisma.script.findUnique({ where: { podcastId } });
    if (!script) {
      throw new Error('Script not found');
    }

    // Ensure audioUrls array matches number of segments
    const segments = Array.isArray(script.segments) ? script.segments : [];
    if (segments.length === 0) {
      throw new Error(`No segments found for script with podcastId: ${podcastId}`);
    }
    const total = segments.length;

    // Validate segmentIndex
    if (
      typeof segmentIndex !== 'number' ||
      segmentIndex < 0 ||
      segmentIndex >= total
    ) {
      throw new Error(`Invalid segmentIndex: ${segmentIndex}, expected 0 to ${total - 1}`);
    }

    const updated = Array(total).fill('');
    // Copy existing URLs if any
    (script.audioUrls || []).forEach((u, idx) => {
      if (u) updated[idx] = u;
    });
    // Set current segment URL
    updated[segmentIndex] = url;

    // Persist
    await prisma.script.update({
      where: { podcastId },
      data: { audioUrls: updated },
    });

    // Log current state
    console.log(`Updated audioUrls for podcast ${podcastId}:`, updated);
    console.log(`Segments for podcast ${podcastId}:`, segments);

    // Check completion
    const allDone = updated.every((u) => u !== '');
    console.log(`All segments done for podcast ${podcastId}: ${allDone}`);

    if (allDone) {
      await prisma.script.update({
        where: { podcastId },
        data: { status: 'SYNTHESIS_COMPLETE' },
      });
      await prisma.podcast.update({
        where: { id: podcastId },
        data: { status: 'AUDIO_PROCESSING' },
      });
      await mergeQueue.add('merge', { podcastId });
      console.log(`All segments processed for podcast ${podcastId}. Queued merge job.`);
    }

    console.log(`Processed segment ${segmentIndex} of podcast ${podcastId}`);
  },
  {
    connection: { host: 'localhost', port: 6379 },
    concurrency: 1,
  }
);

worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) =>
  console.error(`Job ${job?.id} failed: ${err.message}`)
);
worker.on('error', (err) => console.error(`Worker error: ${err.message}`));

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
});