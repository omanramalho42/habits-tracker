-- CreateTable
CREATE TABLE "alarms" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "triggerTime" TEXT NOT NULL,
    "message" TEXT,
    "habit_schedule_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alarms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alarms_id_key" ON "alarms"("id");

-- AddForeignKey
ALTER TABLE "alarms" ADD CONSTRAINT "alarms_habit_schedule_id_fkey" FOREIGN KEY ("habit_schedule_id") REFERENCES "habit_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
