/*
  Warnings:

  - A unique constraint covering the columns `[habit_id,completed_date]` on the table `habit_completions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "habit_completions_habit_id_completed_date_key" ON "habit_completions"("habit_id", "completed_date");
