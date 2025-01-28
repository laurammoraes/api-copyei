-- CreateEnum
CREATE TYPE "WebsitesType" AS ENUM ('LOCAL', 'DRIVE');

-- AlterTable
ALTER TABLE "Websites" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "driveFolderId" TEXT,
ADD COLUMN     "type" "WebsitesType" NOT NULL DEFAULT 'LOCAL';
