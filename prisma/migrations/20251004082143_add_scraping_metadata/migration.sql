-- CreateTable
CREATE TABLE "public"."scraping_metadata" (
    "id" SERIAL NOT NULL,
    "lastScrapeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "articlesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scraping_metadata_pkey" PRIMARY KEY ("id")
);
