-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_counterId_fkey";

-- AlterTable
ALTER TABLE "task" ALTER COLUMN "counterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "Counter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
