/*
  Warnings:

  - You are about to drop the column `intervalDays` on the `Habit` table. All the data in the column will be lost.
  - The `daysOfWeek` column on the `Habit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "intervalDays",
DROP COLUMN "daysOfWeek",
ADD COLUMN     "daysOfWeek" TEXT[];
