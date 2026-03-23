-- CreateEnum
CREATE TYPE "THEME" AS ENUM ('light', 'dark');

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "avatar_url" VARCHAR(255),
ADD COLUMN     "banner_url" VARCHAR(255),
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "theme" "THEME" DEFAULT 'dark',
ALTER COLUMN "notifications_enabled" DROP NOT NULL,
ALTER COLUMN "notifications_enabled" SET DEFAULT false,
ALTER COLUMN "email_notifications" DROP NOT NULL,
ALTER COLUMN "email_notifications" SET DEFAULT false,
ALTER COLUMN "sms_notifications" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;
