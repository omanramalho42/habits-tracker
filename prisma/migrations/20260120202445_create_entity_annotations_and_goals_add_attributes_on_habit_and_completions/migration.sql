/*
  Warnings:

  - You are about to drop the column `goal` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `motivation` on the `habits` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HabitStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "habit_completions" ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "habits" DROP COLUMN "goal",
DROP COLUMN "motivation",
ADD COLUMN     "counter" INTEGER,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "glock" TIMESTAMP(3),
ADD COLUMN     "status" "HabitStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(3),
ALTER COLUMN "emoji" DROP NOT NULL,
ALTER COLUMN "reminder" DROP NOT NULL,
ALTER COLUMN "frequency" DROP NOT NULL,
ALTER COLUMN "color" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annotations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "completion_id" TEXT NOT NULL,
    "createdByAI" BOOLEAN DEFAULT false,
    "summary" TEXT,
    "imageUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GoalsToHabit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GoalsToHabit_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Annotations_completion_id_key" ON "Annotations"("completion_id");

-- CreateIndex
CREATE INDEX "_GoalsToHabit_B_index" ON "_GoalsToHabit"("B");

-- AddForeignKey
ALTER TABLE "Annotations" ADD CONSTRAINT "Annotations_completion_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "habit_completions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoalsToHabit" ADD CONSTRAINT "_GoalsToHabit_A_fkey" FOREIGN KEY ("A") REFERENCES "Goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoalsToHabit" ADD CONSTRAINT "_GoalsToHabit_B_fkey" FOREIGN KEY ("B") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
