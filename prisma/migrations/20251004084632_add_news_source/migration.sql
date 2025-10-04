/*
  Warnings:

  - You are about to drop the `scraping_metadata` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."news" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual';

-- DropTable
DROP TABLE "public"."scraping_metadata";
