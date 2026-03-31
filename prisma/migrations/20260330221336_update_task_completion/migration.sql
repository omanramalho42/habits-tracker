/*
  Warnings:

  - You are about to drop the column `counter` on the `task_completion` table. All the data in the column will be lost.
  - Added the required column `counterId` to the `task_completion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "task_completion" DROP COLUMN "counter",
ADD COLUMN     "counterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "counter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
