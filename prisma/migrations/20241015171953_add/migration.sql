/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Websites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Websites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Websites" ADD COLUMN     "title" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Websites_title_key" ON "Websites"("title");
