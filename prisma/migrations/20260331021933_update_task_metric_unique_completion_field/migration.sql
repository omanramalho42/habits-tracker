/*
  Warnings:

  - A unique constraint covering the columns `[completion_id,field]` on the table `task_metric` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "task_metric_completion_id_field_key" ON "task_metric"("completion_id", "field");
