-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_cronId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_frequencyId_fkey";

-- AlterTable
ALTER TABLE "task" ALTER COLUMN "cronId" DROP NOT NULL,
ALTER COLUMN "frequencyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_cronId_fkey" FOREIGN KEY ("cronId") REFERENCES "cron"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_frequencyId_fkey" FOREIGN KEY ("frequencyId") REFERENCES "frequencu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
