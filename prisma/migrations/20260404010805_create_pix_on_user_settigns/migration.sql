-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('CPF', 'EMAIL', 'PHONE', 'RANDOM');

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "pix_key" VARCHAR(255),
ADD COLUMN     "pix_key_type" "PixKeyType" DEFAULT 'CPF';
