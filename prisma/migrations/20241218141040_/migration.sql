-- DropIndex
DROP INDEX "Users_email_key";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "paused_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Loggers" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "function_name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Loggers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Loggers" ADD CONSTRAINT "Loggers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
