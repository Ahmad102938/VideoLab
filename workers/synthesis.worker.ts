import { Worker, Job } from 'bullmq';
import AWS from 'aws-sdk';
import { PrismaClient } from '@prisma/client';

// Define job data type
interface TTSJobData {
  text: string;
  voiceId: string;
  provider: string;
  segmentIndex: number;
  podcastId: string;
}

// Initialize AWS SDK and Prisma
const prisma = new PrismaClient();
const polly = new AWS.Polly({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

// Configure AWS credentials (assumes environment variables are set)
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// 1) Describe voices and build your lookup map
const voicesData = await polly.describeVoices({}).promise();
const voicesMap: Record<string, { supportsNeural: boolean; supportsStandard: boolean }> =
  voicesData.Voices?.reduce((map, v) => {
    if (v.Id) {
      map[v.Id] = {
        supportsNeural: v.SupportedEngines?.includes('neural') ?? false,
        supportsStandard: v.SupportedEngines?.includes('standard') ?? false,
      };
    }
    return map;
  }, {}) || {};

const worker = new Worker(
  'tts-queue',
  async (job: Job<TTSJobData>) => {
    const { text, voiceId, provider, segmentIndex, podcastId } = job.data;

    const normalizedProvider = provider.trim().toLowerCase();
if (!normalizedProvider.includes('polly')) {
  throw new Error(`Unsupported provider: ${provider}`);
}
const isAmazonPolly = normalizedProvider === 'amazon polly';
if (!isAmazonPolly) {
  throw new Error(`Unsupported provider: ${provider}`);
}
console.log('🚀 Provider raw:', JSON.stringify(provider));
console.log('🚀 Provider normalized:', JSON.stringify(normalizedProvider));

const caps = voicesMap[voiceId];
if (!caps) throw new Error(`Unknown voice: ${voiceId}`);

const engine = caps.supportsNeural
  ? 'neural'
  : caps.supportsStandard
  ? 'standard'
  : (() => { throw new Error(`Voice ${voiceId} supports neither engine`); })();

// now use it:
const pollyParams: AWS.Polly.SynthesizeSpeechInput = {
  Text: text,
  VoiceId: voiceId,
  OutputFormat: 'mp3',
  Engine: engine,
};
const pollyResult = await polly.synthesizeSpeech(pollyParams).promise();


    // Upload to S3
    const s3Key = `podcasts/${podcastId}/segments/${segmentIndex}.mp3`;
    const bucketName = process.env.AWS_S3_BUCKET!;
    const s3Params: AWS.S3.PutObjectRequest = {
      Bucket: bucketName, // Replace with your bucket name
      Key: s3Key,
      Body: pollyResult.AudioStream,
      ContentType: 'audio/mpeg',
    };
    await s3.upload(s3Params).promise();

    // Generate pre-signed URL for private bucket
    const s3Url = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 604800, // 7 days
    });

    // Update the Script's audioUrls
    const script = await prisma.script.findUnique({
      where: { podcastId },
    });
    if (!script) {
      throw new Error('Script not found');
    }
    const currentAudioUrls: string[] = script.audioUrls || [];
    const newAudioUrls = [...currentAudioUrls];
    newAudioUrls[segmentIndex] = s3Url;
    await prisma.script.update({
      where: { podcastId },
      data: { audioUrls: newAudioUrls },
    });

    // Check if all segments are processed
    const segments = (script.segments as any).segments as { segmentIndex: number }[];
    const allSegmentsProcessed =
      segments.every((segment) => newAudioUrls[segment.segmentIndex] !== undefined);
    if (allSegmentsProcessed) {
      await prisma.script.update({
        where: { podcastId },
        data: { status: 'SYNTHESIS_COMPLETE' },
      });
    }

    console.log(`Processed segment ${segmentIndex} for podcast ${podcastId}`);
  },
  {
    connection: {
      host: 'localhost',
      port: 6379,
    },
    concurrency: 1, // Process jobs one by one
  },
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});

worker.on('error', (err) => {
  console.error(`Worker error: ${err.message}`);
});

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
});