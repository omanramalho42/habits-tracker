/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "notification_user_id_key" ON "notification"("user_id");
