-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'CLONING');

-- AlterTable
ALTER TABLE "Websites" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'CLONING';
