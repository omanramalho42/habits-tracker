-- CreateTable
CREATE TABLE "habits" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "goal" VARCHAR(255) NOT NULL,
    "motivation" VARCHAR(255) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminder" BOOLEAN NOT NULL DEFAULT false,
    "frequency" JSONB NOT NULL DEFAULT '["M","T","W","T","F","S","S"]',
    "color" VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_schedules" (
    "id" SERIAL NOT NULL,
    "habit_id" INTEGER NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_completions" (
    "id" SERIAL NOT NULL,
    "habit_id" INTEGER NOT NULL,
    "completed_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_entries" (
    "id" SERIAL NOT NULL,
    "mood_type" VARCHAR(50) NOT NULL,
    "mood_level" VARCHAR(50) NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habit_schedules_scheduled_date_idx" ON "habit_schedules"("scheduled_date");

-- CreateIndex
CREATE INDEX "habit_schedules_habit_id_scheduled_date_idx" ON "habit_schedules"("habit_id", "scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "habit_schedules_habit_id_scheduled_date_key" ON "habit_schedules"("habit_id", "scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "mood_entries_entry_date_key" ON "mood_entries"("entry_date");

-- CreateIndex
CREATE INDEX "mood_entries_entry_date_idx" ON "mood_entries"("entry_date");

-- AddForeignKey
ALTER TABLE "habit_schedules" ADD CONSTRAINT "habit_schedules_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
