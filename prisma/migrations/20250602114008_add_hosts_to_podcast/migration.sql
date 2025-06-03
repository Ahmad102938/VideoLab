/*
  Warnings:

  - You are about to drop the column `text` on the `Script` table. All the data in the column will be lost.
  - Added the required column `fullText` to the `Script` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segments` to the `Script` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HostAssignment" ALTER COLUMN "voiceId" DROP NOT NULL,
ALTER COLUMN "provider" DROP NOT NULL,
ALTER COLUMN "segmentIndex" DROP NOT NULL,
ALTER COLUMN "segmentIndex" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "hosts" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Script" DROP COLUMN "text",
ADD COLUMN     "fullText" TEXT NOT NULL,
ADD COLUMN     "segments" JSONB NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'READY_FOR_ASSIGNMENT';
