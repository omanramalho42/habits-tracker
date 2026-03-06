/*
  Warnings:

  - You are about to drop the column `createdAt` on the `annotations` table. All the data in the column will be lost.
  - You are about to drop the column `createdByAI` on the `annotations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `annotations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `completedDate` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `habit_completions` table. All the data in the column will be lost.
  - You are about to drop the `habit_schedules` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[habit_id,completed_date]` on the table `habit_completions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "habit_schedules" DROP CONSTRAINT "habit_schedules_habit_id_fkey";

-- DropIndex
DROP INDEX "habit_completions_habit_id_completedDate_key";

-- DropIndex
DROP INDEX "mood_entries_entry_date_key";

-- AlterTable
ALTER TABLE "annotations" DROP COLUMN "createdAt",
DROP COLUMN "createdByAI",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by_ai" BOOLEAN DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "emoji" DROP NOT NULL;

-- AlterTable
ALTER TABLE "habit_completions" DROP COLUMN "completedDate",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "completed_date" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "habit_schedules";

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',
    "checkpoint_id" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoint" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),

    CONSTRAINT "checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_completion" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3) NOT NULL,
    "is_completed" BOOLEAN DEFAULT false,
    "task_id" TEXT NOT NULL,

    CONSTRAINT "task_completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "cron" TEXT DEFAULT '',
    "frequency" JSONB DEFAULT '["M","T","W","T","F","S","S"]',
    "emoji" VARCHAR(10) NOT NULL,
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_schedule" (
    "id" TEXT NOT NULL,
    "duration" VARCHAR(20) NOT NULL,
    "clock" VARCHAR(20) NOT NULL,
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "routine_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,

    CONSTRAINT "task_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_schedule" (
    "id" TEXT NOT NULL,
    "duration" VARCHAR(20) NOT NULL,
    "clock" VARCHAR(20) NOT NULL,
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "routine_id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,

    CONSTRAINT "habit_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emoji" VARCHAR(10),
    "color" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "status" "HabitStatus" DEFAULT 'ACTIVE',

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CheckPointToGoals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CheckPointToGoals_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CheckPointToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CheckPointToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GoalsToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GoalsToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoriesToHabit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoriesToHabit_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AnnotationsToTaskCompletion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnnotationsToTaskCompletion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkpoint_id_key" ON "checkpoint"("id");

-- CreateIndex
CREATE INDEX "task_completion_completed_date_idx" ON "task_completion"("completed_date");

-- CreateIndex
CREATE UNIQUE INDEX "task_completion_task_id_completed_date_key" ON "task_completion"("task_id", "completed_date");

-- CreateIndex
CREATE UNIQUE INDEX "task_schedule_id_key" ON "task_schedule"("id");

-- CreateIndex
CREATE INDEX "task_schedule_routine_id_clock_idx" ON "task_schedule"("routine_id", "clock");

-- CreateIndex
CREATE UNIQUE INDEX "task_schedule_routine_id_clock_key" ON "task_schedule"("routine_id", "clock");

-- CreateIndex
CREATE UNIQUE INDEX "habit_schedule_id_key" ON "habit_schedule"("id");

-- CreateIndex
CREATE INDEX "habit_schedule_routine_id_clock_idx" ON "habit_schedule"("routine_id", "clock");

-- CreateIndex
CREATE UNIQUE INDEX "habit_schedule_routine_id_clock_key" ON "habit_schedule"("routine_id", "clock");

-- CreateIndex
CREATE INDEX "_CheckPointToGoals_B_index" ON "_CheckPointToGoals"("B");

-- CreateIndex
CREATE INDEX "_CheckPointToTask_B_index" ON "_CheckPointToTask"("B");

-- CreateIndex
CREATE INDEX "_GoalsToTask_B_index" ON "_GoalsToTask"("B");

-- CreateIndex
CREATE INDEX "_CategoriesToHabit_B_index" ON "_CategoriesToHabit"("B");

-- CreateIndex
CREATE INDEX "_AnnotationsToTaskCompletion_B_index" ON "_AnnotationsToTaskCompletion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "habit_completions_habit_id_completed_date_key" ON "habit_completions"("habit_id", "completed_date");

-- AddForeignKey
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_schedule" ADD CONSTRAINT "task_schedule_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_schedule" ADD CONSTRAINT "task_schedule_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_schedule" ADD CONSTRAINT "habit_schedule_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_schedule" ADD CONSTRAINT "habit_schedule_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CheckPointToGoals" ADD CONSTRAINT "_CheckPointToGoals_A_fkey" FOREIGN KEY ("A") REFERENCES "checkpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CheckPointToGoals" ADD CONSTRAINT "_CheckPointToGoals_B_fkey" FOREIGN KEY ("B") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CheckPointToTask" ADD CONSTRAINT "_CheckPointToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "checkpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CheckPointToTask" ADD CONSTRAINT "_CheckPointToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoalsToTask" ADD CONSTRAINT "_GoalsToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoalsToTask" ADD CONSTRAINT "_GoalsToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToHabit" ADD CONSTRAINT "_CategoriesToHabit_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToHabit" ADD CONSTRAINT "_CategoriesToHabit_B_fkey" FOREIGN KEY ("B") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnotationsToTaskCompletion" ADD CONSTRAINT "_AnnotationsToTaskCompletion_A_fkey" FOREIGN KEY ("A") REFERENCES "annotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnotationsToTaskCompletion" ADD CONSTRAINT "_AnnotationsToTaskCompletion_B_fkey" FOREIGN KEY ("B") REFERENCES "task_completion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
