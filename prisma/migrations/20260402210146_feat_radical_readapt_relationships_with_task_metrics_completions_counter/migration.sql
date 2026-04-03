/*
  Warnings:

  - You are about to drop the column `counterId` on the `task_completion` table. All the data in the column will be lost.
  - You are about to drop the column `completion_id` on the `task_metric` table. All the data in the column will be lost.
  - You are about to drop the column `counterId` on the `task_metric` table. All the data in the column will be lost.
  - You are about to drop the column `creted_at` on the `task_metric_completion` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `task_metric_completion` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `task_metric_completion` table. All the data in the column will be lost.
  - You are about to drop the `counter_aux` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[field,limit,unit,field_type,task_id]` on the table `task_metric` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `step` to the `task_metric_completion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "counter_aux" DROP CONSTRAINT "counter_aux_counter_id_fkey";

-- DropForeignKey
ALTER TABLE "task_completion" DROP CONSTRAINT "task_completion_counterId_fkey";

-- DropForeignKey
ALTER TABLE "task_metric" DROP CONSTRAINT "task_metric_completion_id_fkey";

-- DropForeignKey
ALTER TABLE "task_metric" DROP CONSTRAINT "task_metric_counterId_fkey";

-- DropForeignKey
ALTER TABLE "task_metric_completion" DROP CONSTRAINT "task_metric_completion_taskId_fkey";

-- DropIndex
DROP INDEX "task_metric_completion_id_field_limit_unit_field_type_key";

-- DropIndex
DROP INDEX "task_metric_completion_date_index_idx";

-- DropIndex
DROP INDEX "task_metric_completion_date_index_task_metric_id_taskId_key";

-- AlterTable
ALTER TABLE "task_completion" DROP COLUMN "counterId";

-- AlterTable
ALTER TABLE "task_metric" DROP COLUMN "completion_id",
DROP COLUMN "counterId",
ADD COLUMN     "task_id" TEXT;

-- AlterTable
ALTER TABLE "task_metric_completion" DROP COLUMN "creted_at",
DROP COLUMN "index",
DROP COLUMN "taskId",
ADD COLUMN     "completion_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "step" INTEGER NOT NULL;

-- DropTable
DROP TABLE "counter_aux";

-- CreateTable
CREATE TABLE "counter_step" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,
    "counter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "completion_id" TEXT NOT NULL,

    CONSTRAINT "counter_step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "counter_step_completion_id_key" ON "counter_step"("completion_id");

-- CreateIndex
CREATE UNIQUE INDEX "counter_step_counter_id_date_completion_id_key" ON "counter_step"("counter_id", "date", "completion_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_metric_field_limit_unit_field_type_task_id_key" ON "task_metric"("field", "limit", "unit", "field_type", "task_id");

-- AddForeignKey
ALTER TABLE "counter_step" ADD CONSTRAINT "counter_step_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "counter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_step" ADD CONSTRAINT "counter_step_completion_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "task_completion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_metric" ADD CONSTRAINT "task_metric_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_metric_completion" ADD CONSTRAINT "task_metric_completion_completion_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "task_completion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
