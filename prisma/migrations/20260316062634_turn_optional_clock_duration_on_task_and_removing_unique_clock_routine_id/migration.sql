-- DropIndex
DROP INDEX "habit_schedule_routine_id_clock_key";

-- DropIndex
DROP INDEX "task_schedule_routine_id_clock_key";

-- AlterTable
ALTER TABLE "task_schedule" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "clock" DROP NOT NULL;
