/*
  Warnings:

  - You are about to drop the column `startded_plan` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "startded_plan",
ADD COLUMN     "dueDate" TIMESTAMP(3);
