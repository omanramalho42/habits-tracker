/*
  Warnings:

  - You are about to drop the `Annotations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Goals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Annotations" DROP CONSTRAINT "Annotations_completion_id_fkey";

-- DropForeignKey
ALTER TABLE "_GoalsToHabit" DROP CONSTRAINT "_GoalsToHabit_A_fkey";

-- DropTable
DROP TABLE "Annotations";

-- DropTable
DROP TABLE "Goals";

-- CreateTable
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "completion_id" TEXT NOT NULL,
    "createdByAI" BOOLEAN DEFAULT false,
    "summary" TEXT,
    "imageUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "annotations_completion_id_key" ON "annotations"("completion_id");

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_completion_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "habit_completions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoalsToHabit" ADD CONSTRAINT "_GoalsToHabit_A_fkey" FOREIGN KEY ("A") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
