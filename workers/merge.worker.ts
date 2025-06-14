import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

// Initialize Prisma and AWS S3
const prisma = new PrismaClient();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

// Configure FFmpeg paths
ffmpeg.setFfmpegPath('C:/ffmpeg/ffmpeg-2025-06-11-git-f019dd69f0-full_build/bin/ffmpeg.exe'); 
ffmpeg.setFfprobePath('C:/ffmpeg/ffmpeg-2025-06-11-git-f019dd69f0-full_build/bin/ffprobe.exe'); 

// Merge worker
const mergeWorker = new Worker(
  'merge-queue',
  async (job) => {
    const { podcastId } = job.data;
    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    const tempDir = path.join('/tmp', podcastId);

    console.log(`Starting merge job ${job.id} for podcast ${podcastId}`);

    try {
      // Fetch script and podcast
      const script = await prisma.script.findUnique({
        where: { podcastId },
        include: { podcast: true },
      });
      if (!script || !script.podcast) throw new Error('Script or Podcast not found');

      const audioUrls = script.audioUrls || [];
      if (audioUrls.length === 0) throw new Error('No audio clips found');

      // Validate audioUrls
      console.log(`Found ${audioUrls.length} audio URLs for podcast ${podcastId}`);
      audioUrls.forEach((url, index) => {
        if (!url || typeof url !== 'string') {
          throw new Error(`Invalid URL at index ${index}: ${url}`);
        }
        console.log(`URL ${index}: ${url}`);
      });

      // Create temporary directory
      await fs.mkdir(tempDir, { recursive: true });

      // Download clips using pre-signed URLs directly
      const clipBuffers = await Promise.all(
        audioUrls.map(async (url, index) => {
          try {
            console.log(`Attempting to download clip ${index} from URL: ${url}`);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            if (!buffer || buffer.length === 0) {
              throw new Error(`Empty response for clip ${index} at URL: ${url}`);
            }
            console.log(`Successfully downloaded clip ${index} for podcast ${podcastId}`);
            return buffer;
          } catch (error) {
            console.error(`Failed to download clip ${index} from ${url}:`, error.message);
            throw new Error(`Failed to download clip ${index}: ${error.message}`);
          }
        })
      );

      // Save clips to temporary files
      const tempPaths = await Promise.all(
        clipBuffers.map((buffer, index) =>
          fs.writeFile(path.join(tempDir, `clip-${index}.mp3`), buffer).then(() => path.join(tempDir, `clip-${index}.mp3`))
        )
      );

      // Merge clips with FFmpeg
      const outputPath = path.join(tempDir, 'final.mp3');
      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg();
        tempPaths.forEach((p) => command.input(p));
        command
          .audioCodec('libmp3lame')
          .format('mp3')
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(new Error(`FFmpeg error: ${err.message}`));
          })
          .on('end', () => {
            console.log(`Merged clips into ${outputPath} for podcast ${podcastId}`);
            resolve();
          })
          .mergeToFile(outputPath, tempDir);
      });

      // Upload merged file to S3
      const s3Key = `podcasts/${podcastId}/final.mp3`;
      await s3.upload({
        Bucket: bucket,
        Key: s3Key,
        Body: await fs.readFile(outputPath),
        ContentType: 'audio/mpeg',
      }).promise();

      const finalAudioUrl = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: s3Key,
        Expires: 7 * 24 * 3600, // 7 days
      });

      // Update podcast with final audio URL
      await prisma.podcast.update({
        where: { id: podcastId },
        data: { finalAudioUrl, status: 'AUDIO_READY' },
      });

      console.log(`Merged audio for podcast ${podcastId}: ${finalAudioUrl}`);
    } catch (error) {
      console.error(`Merge job failed for podcast ${podcastId}:`, error.message);
      await prisma.podcast.update({
        where: { id: podcastId },
        data: { status: 'AUDIO_FAILED' },
      });
      throw error;
    } finally {
      // Clean up temporary files
      await fs.rm(tempDir, { recursive: true, force: true }).catch((err) =>
        console.warn(`Failed to clean up temp files for ${podcastId}: ${err.message}`)
      );
    }
  },
  {
    connection: { host: 'localhost', port: 6379 }, // Adjust if using a different Redis setup
  }
);

mergeWorker.on('completed', (job) => console.log(`Merge job ${job.id} completed`));
mergeWorker.on('failed', (job, err) => console.error(`Merge job ${job?.id} failed: ${err.message}`));
mergeWorker.on('error', (err) => console.error(`Worker error: ${err.message}`));

process.on('SIGTERM', async () => {
  await mergeWorker.close();
  await prisma.$disconnect();
});