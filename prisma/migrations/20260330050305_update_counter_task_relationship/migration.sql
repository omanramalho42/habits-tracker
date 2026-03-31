/*
  Warnings:

  - You are about to drop the `Counter` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `index` to the `task_metric` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_counterId_fkey";

-- DropForeignKey
ALTER TABLE "task_metric" DROP CONSTRAINT "task_metric_counterId_fkey";

-- AlterTable
ALTER TABLE "task_metric" ADD COLUMN     "index" TEXT NOT NULL,
ADD COLUMN     "isComplete" BOOLEAN DEFAULT false,
ADD COLUMN     "limit" TEXT;

-- DropTable
DROP TABLE "Counter";

-- CreateTable
CREATE TABLE "counter" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(20) NOT NULL,
    "emoji" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',
    "valueNumber" DOUBLE PRECISION DEFAULT 0,
    "valueText" VARCHAR(20),
    "unit" TEXT,
    "userId" TEXT,
    "limit" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "counter_userId_label_valueNumber_unit_key" ON "counter"("userId", "label", "valueNumber", "unit");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "counter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter" ADD CONSTRAINT "counter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_metric" ADD CONSTRAINT "task_metric_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "counter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
