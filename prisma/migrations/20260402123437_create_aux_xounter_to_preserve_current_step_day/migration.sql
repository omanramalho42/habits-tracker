-- AlterTable
ALTER TABLE "counter" ALTER COLUMN "status" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CounterAux" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,
    "counterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CounterAux_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CounterAux_counterId_date_key" ON "CounterAux"("counterId", "date");

-- AddForeignKey
ALTER TABLE "CounterAux" ADD CONSTRAINT "CounterAux_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "counter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
