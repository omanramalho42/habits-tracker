/*
  Warnings:

  - You are about to drop the column `counter` on the `habits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "habit_completions" ADD COLUMN     "counter" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "habits" DROP COLUMN "counter",
ALTER COLUMN "limitCounter" SET DEFAULT 1;
