/*
  Warnings:

  - You are about to drop the column `limitCounter` on the `task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_metric" DROP CONSTRAINT "task_metric_completion_id_fkey";

-- AlterTable
ALTER TABLE "task" DROP COLUMN "limitCounter",
ADD COLUMN     "limit_counter" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "task_metric" ALTER COLUMN "completion_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "task_metric" ADD CONSTRAINT "task_metric_completion_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "task_completion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
