-- CreateEnum
CREATE TYPE "HABIT_LAYOUT" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "habit_layout" "HABIT_LAYOUT" DEFAULT 'VERTICAL',
ADD COLUMN     "show_graphs" BOOLEAN DEFAULT true;
