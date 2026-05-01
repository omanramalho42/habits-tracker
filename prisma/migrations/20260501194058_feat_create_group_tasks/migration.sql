-- CreateTable
CREATE TABLE "group_task" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "group_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupTaskToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupTaskToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupTaskToTask_B_index" ON "_GroupTaskToTask"("B");

-- AddForeignKey
ALTER TABLE "group_task" ADD CONSTRAINT "group_task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupTaskToTask" ADD CONSTRAINT "_GroupTaskToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "group_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupTaskToTask" ADD CONSTRAINT "_GroupTaskToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
