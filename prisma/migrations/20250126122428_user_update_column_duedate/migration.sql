/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "dueDate",
ADD COLUMN     "due_date" TIMESTAMP(3);
