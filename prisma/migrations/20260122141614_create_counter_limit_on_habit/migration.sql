/*
  Warnings:

  - You are about to drop the column `updated_at` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `habit_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `habit_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `is_completed` on the `habit_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_date` on the `habit_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `mood_entries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[habit_id,scheduledDate]` on the table `habit_schedules` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scheduledDate` to the `habit_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "habit_schedules_habit_id_scheduled_date_idx";

-- DropIndex
DROP INDEX "habit_schedules_habit_id_scheduled_date_key";

-- DropIndex
DROP INDEX "habit_schedules_scheduled_date_idx";

-- AlterTable
ALTER TABLE "habit_completions" DROP COLUMN "updated_at",
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "habit_schedules" DROP COLUMN "completed_at",
DROP COLUMN "created_at",
DROP COLUMN "is_completed",
DROP COLUMN "scheduled_date",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "limitCounter" INTEGER;

-- AlterTable
ALTER TABLE "mood_entries" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "habit_schedules_scheduledDate_idx" ON "habit_schedules"("scheduledDate");

-- CreateIndex
CREATE INDEX "habit_schedules_habit_id_scheduledDate_idx" ON "habit_schedules"("habit_id", "scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "habit_schedules_habit_id_scheduledDate_key" ON "habit_schedules"("habit_id", "scheduledDate");
