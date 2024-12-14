/*
  Warnings:

  - You are about to drop the column `domain` on the `Websites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[domain_id]` on the table `Websites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `domain_id` to the `Websites` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Websites_domain_key";

-- AlterTable
ALTER TABLE "Websites" DROP COLUMN "domain",
ADD COLUMN     "domain_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Domains" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Domains_domain_key" ON "Domains"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Websites_domain_id_key" ON "Websites"("domain_id");

-- AddForeignKey
ALTER TABLE "Domains" ADD CONSTRAINT "Domains_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Websites" ADD CONSTRAINT "Websites_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "Domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
