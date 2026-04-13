-- CreateTable
CREATE TABLE "assistants" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "emoji_id" TEXT NOT NULL,
    "prompt" TEXT,
    "voice_id" TEXT,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "creativity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "memory_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assistants_userId_idx" ON "assistants"("userId");

-- AddForeignKey
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_emoji_id_fkey" FOREIGN KEY ("emoji_id") REFERENCES "emoji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
