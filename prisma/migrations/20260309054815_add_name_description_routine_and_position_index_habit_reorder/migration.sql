/*
  Warnings:

  - Added the required column `name` to the `routine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "indexPos" INTEGER,
ALTER COLUMN "frequency" SET DEFAULT '["S","M","T","W","TH","F","SA"]';

-- AlterTable
ALTER TABLE "routine" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "emoji" DROP NOT NULL,
ALTER COLUMN "emoji" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "habits_indexPos_idx" ON "habits"("indexPos");
