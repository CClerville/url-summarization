-- CreateTable
CREATE TABLE "UrlSummary" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrlSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UrlSummary_createdAt_idx" ON "UrlSummary"("createdAt");

-- CreateIndex
CREATE INDEX "UrlSummary_url_idx" ON "UrlSummary"("url");
