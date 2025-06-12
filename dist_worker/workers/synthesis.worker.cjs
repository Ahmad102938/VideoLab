"use strict";
// workers/synthesis.worker.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const aws_sdk_1 = __importDefault(require("aws-sdk")); // OK because tsconfig.worker.json sets esModuleInterop=true
const prisma_1 = __importDefault(require("../src/lib/prisma")); // adjust path if needed
// 1) Configure AWS Polly + S3
const polly = new aws_sdk_1.default.Polly({
    apiVersion: "2016-06-10",
    region: process.env.AWS_REGION,
});
const s3 = new aws_sdk_1.default.S3({
    apiVersion: "2006-03-01",
    region: process.env.AWS_REGION,
});
// 2) Redis connection + queue name
const redisConnection = new ioredis_1.default(process.env.REDIS_URL);
const queueName = process.env.BULLMQ_QUEUE_NAME || "podcast-synthesis-queue";
const worker = new bullmq_1.Worker(queueName, async (job) => {
    const { podcastId } = job.data;
    console.log(`[Worker] Starting synthesis for podcast ${podcastId}`);
    // 4a) Fetch script & hostAssignments
    const scriptRecord = await prisma_1.default.script.findUnique({
        where: { podcastId },
        include: {
            podcast: { select: { hostAssignments: true, userId: true } },
        },
    });
    if (!scriptRecord) {
        throw new Error(`Script not found for podcastId ${podcastId}`);
    }
    if (scriptRecord.status !== "READY_FOR_ASSIGNMENT") {
        throw new Error(`Status must be READY_FOR_ASSIGNMENT, got ${scriptRecord.status}`);
    }
    // 4b) Build hostName → voiceId map
    const hostMap = {};
    scriptRecord.podcast.hostAssignments.forEach((ha) => {
        hostMap[ha.hostName.toLowerCase()] = ha.voiceId; // assert non-null
    });
    // 4c) Grab segments: { hostName, text, segmentIndex }[]
    const segments = scriptRecord.segments;
    // 4d) Mark script as in-progress
    await prisma_1.default.script.update({
        where: { podcastId },
        data: { status: "SYNTHESIS_IN_PROGRESS" },
    });
    // 4e) Loop over segments → Polly → S3
    const bucketName = process.env.AWS_S3_BUCKET;
    const urls = [];
    for (const seg of segments) {
        const voiceId = hostMap[seg.hostName.toLowerCase()];
        if (!voiceId) {
            throw new Error(`No voice assigned for host "${seg.hostName}"`);
        }
        // Synthesize with Polly
        const pollyResult = await polly
            .synthesizeSpeech({
            OutputFormat: "mp3",
            Text: seg.text,
            VoiceId: voiceId,
            Engine: "neural",
        })
            .promise();
        const audioBuffer = pollyResult.AudioStream;
        const objectKey = `podcasts/${podcastId}/segments/${seg.segmentIndex}.mp3`;
        // Upload to S3
        await s3
            .putObject({
            Bucket: bucketName,
            Key: objectKey,
            Body: audioBuffer,
            ContentType: "audio/mpeg",
            ACL: "public-read",
        })
            .promise();
        const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;
        urls.push(url);
        console.log(`[Worker] Uploaded segment ${seg.segmentIndex} → ${url}`);
    }
    // 4f) Update script with audioUrls & status
    await prisma_1.default.script.update({
        where: { podcastId },
        data: {
            audioUrls: { set: urls }, // use `set` for String[] fields
            status: "SYNTHESIS_COMPLETE",
        },
    });
    // 4g) Update podcast status
    await prisma_1.default.podcast.update({
        where: { id: podcastId },
        data: { status: "SYNTHESIS_COMPLETE" },
    });
    console.log(`[Worker] Completed synthesis for podcast ${podcastId}`);
    return true;
}, {
    connection: redisConnection,
    concurrency: 1,
});
worker.on("completed", (job) => {
    console.log(`[Worker] Job completed for podcast ${job.data.podcastId}`);
});
worker.on("failed", (job, err) => {
    console.error(`[Worker] Job FAILED for podcast ${job.data.podcastId}:`, err);
});
console.log("[Worker] Listening for jobs…");
