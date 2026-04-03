/*
  Warnings:

  - You are about to drop the `CounterAux` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[date,index,task_metric_id,taskId]` on the table `task_metric_completion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taskId` to the `task_metric_completion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CounterAux" DROP CONSTRAINT "CounterAux_counterId_fkey";

-- DropIndex
DROP INDEX "task_metric_completion_date_index_task_metric_id_key";

-- AlterTable
ALTER TABLE "task_metric_completion" ADD COLUMN     "taskId" TEXT NOT NULL;

-- DropTable
DROP TABLE "CounterAux";

-- CreateTable
CREATE TABLE "counter_aux" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,
    "counter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "counter_aux_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "counter_aux_counter_id_date_key" ON "counter_aux"("counter_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "task_metric_completion_date_index_task_metric_id_taskId_key" ON "task_metric_completion"("date", "index", "task_metric_id", "taskId");

-- AddForeignKey
ALTER TABLE "counter_aux" ADD CONSTRAINT "counter_aux_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "counter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_metric_completion" ADD CONSTRAINT "task_metric_completion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
