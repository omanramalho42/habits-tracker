-- -- Add column `status` to task_metric
ALTER TABLE "task_metric"
ADD COLUMN "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE';