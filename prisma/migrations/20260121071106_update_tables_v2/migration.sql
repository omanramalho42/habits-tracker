/*
  Warnings:

  - The `status` column on the `goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `glock` on the `habits` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "HabitStatus" DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "habits" DROP COLUMN "glock",
ADD COLUMN     "clock" VARCHAR(8);
