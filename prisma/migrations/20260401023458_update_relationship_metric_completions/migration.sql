/*
  Warnings:

  - You are about to drop the column `date` on the `task_metric` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `task_metric` table. All the data in the column will be lost.
  - You are about to drop the column `isComplete` on the `task_metric` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `task_metric` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[completion_id,field,limit,unit,field_type]` on the table `task_metric` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "task_metric_date_idx";

-- AlterTable
ALTER TABLE "task_metric" DROP COLUMN "date",
DROP COLUMN "index",
DROP COLUMN "isComplete",
DROP COLUMN "value";

-- CreateTable
CREATE TABLE "task_metric_completion" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "isComplete" BOOLEAN DEFAULT false,
    "task_metric_id" TEXT NOT NULL,
    "creted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "task_metric_completion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_metric_completion_date_index_idx" ON "task_metric_completion"("date", "index");

-- CreateIndex
CREATE UNIQUE INDEX "task_metric_completion_date_index_task_metric_id_key" ON "task_metric_completion"("date", "index", "task_metric_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_metric_completion_id_field_limit_unit_field_type_key" ON "task_metric"("completion_id", "field", "limit", "unit", "field_type");

-- AddForeignKey
ALTER TABLE "task_metric_completion" ADD CONSTRAINT "task_metric_completion_task_metric_id_fkey" FOREIGN KEY ("task_metric_id") REFERENCES "task_metric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
