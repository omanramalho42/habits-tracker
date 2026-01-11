/*
  Warnings:

  - The primary key for the `habit_completions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `completed_date` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `habit_completions` table. All the data in the column will be lost.
  - The primary key for the `habit_schedules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `habits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `mood_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[habit_id,completedDate]` on the table `habit_completions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,entry_date]` on the table `mood_entries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `completedDate` to the `habit_completions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `habits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `mood_entries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "habit_completions" DROP CONSTRAINT "habit_completions_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "habit_schedules" DROP CONSTRAINT "habit_schedules_habit_id_fkey";

-- DropIndex
DROP INDEX "habit_completions_habit_id_completed_date_key";

-- AlterTable
ALTER TABLE "habit_completions" DROP CONSTRAINT "habit_completions_pkey",
DROP COLUMN "completed_date",
DROP COLUMN "created_at",
ADD COLUMN     "completedDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "habit_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "habit_completions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "habit_completions_id_seq";

-- AlterTable
ALTER TABLE "habit_schedules" DROP CONSTRAINT "habit_schedules_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "habit_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "habit_schedules_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "habit_schedules_id_seq";

-- AlterTable
ALTER TABLE "habits" DROP CONSTRAINT "habits_pkey",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "habits_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "habits_id_seq";

-- AlterTable
ALTER TABLE "mood_entries" DROP CONSTRAINT "mood_entries_pkey",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "mood_entries_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "habit_completions_habit_id_completedDate_key" ON "habit_completions"("habit_id", "completedDate");

-- CreateIndex
CREATE INDEX "habits_user_id_idx" ON "habits"("user_id");

-- CreateIndex
CREATE INDEX "mood_entries_user_id_idx" ON "mood_entries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mood_entries_user_id_entry_date_key" ON "mood_entries"("user_id", "entry_date");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_schedules" ADD CONSTRAINT "habit_schedules_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
