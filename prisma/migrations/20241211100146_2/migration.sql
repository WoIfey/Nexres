/*
  Warnings:

  - Added the required column `endDate` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;
