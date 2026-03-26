/*
  Warnings:

  - You are about to drop the column `checkpoint_id` on the `task` table. All the data in the column will be lost.
  - Added the required column `counterId` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cronId` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequencyId` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('NUMERIC', 'STRING', 'FLOAT');

-- AlterTable
ALTER TABLE "task" DROP COLUMN "checkpoint_id",
ADD COLUMN     "color" VARCHAR(10),
ADD COLUMN     "counterId" TEXT NOT NULL,
ADD COLUMN     "cronId" TEXT NOT NULL,
ADD COLUMN     "frequencyId" TEXT NOT NULL,
ADD COLUMN     "image_url" VARCHAR(255),
ADD COLUMN     "isPlus" BOOLEAN DEFAULT true,
ADD COLUMN     "video_url" VARCHAR(255);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(20) NOT NULL,
    "emoji" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',
    "valueNumber" DOUBLE PRECISION DEFAULT 0,
    "valueText" VARCHAR(20),
    "unit" TEXT,
    "limit" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frequencu" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "emoji" VARCHAR(10),
    "color" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "value" JSONB NOT NULL,
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "frequencu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "emoji" VARCHAR(10),
    "color" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "value" TEXT NOT NULL,
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "cron_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_metric" (
    "id" TEXT NOT NULL,
    "field_type" "MetricType" DEFAULT 'NUMERIC',
    "field" VARCHAR(20),
    "value" VARCHAR(20),
    "date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "counterId" TEXT NOT NULL,
    "completion_id" TEXT NOT NULL,

    CONSTRAINT "task_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "imageUrl" VARCHAR(255),
    "videoUrl" VARCHAR(255),
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CronToFrequency" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CronToFrequency_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AnnotationsToTaskMetric" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnnotationsToTaskMetric_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "task_metric_date_idx" ON "task_metric"("date");

-- CreateIndex
CREATE INDEX "_CronToFrequency_B_index" ON "_CronToFrequency"("B");

-- CreateIndex
CREATE INDEX "_AnnotationsToTaskMetric_B_index" ON "_AnnotationsToTaskMetric"("B");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "Counter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_cronId_fkey" FOREIGN KEY ("cronId") REFERENCES "cron"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_frequencyId_fkey" FOREIGN KEY ("frequencyId") REFERENCES "frequencu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_metric" ADD CONSTRAINT "task_metric_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "Counter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_metric" ADD CONSTRAINT "task_metric_completion_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "task_completion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CronToFrequency" ADD CONSTRAINT "_CronToFrequency_A_fkey" FOREIGN KEY ("A") REFERENCES "cron"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CronToFrequency" ADD CONSTRAINT "_CronToFrequency_B_fkey" FOREIGN KEY ("B") REFERENCES "frequencu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnotationsToTaskMetric" ADD CONSTRAINT "_AnnotationsToTaskMetric_A_fkey" FOREIGN KEY ("A") REFERENCES "annotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnotationsToTaskMetric" ADD CONSTRAINT "_AnnotationsToTaskMetric_B_fkey" FOREIGN KEY ("B") REFERENCES "task_metric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
