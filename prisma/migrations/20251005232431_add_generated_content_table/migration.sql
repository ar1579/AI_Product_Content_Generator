-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "selectedVariant" TEXT,
    "title" TEXT NOT NULL,
    "productDescription" TEXT NOT NULL,
    "keyFeatures" TEXT NOT NULL,
    "whyBuy" TEXT NOT NULL,
    "faqs" TEXT NOT NULL,
    "imageRecommendations" TEXT NOT NULL,
    "shortTailKeywords" TEXT NOT NULL,
    "longTailKeywords" TEXT NOT NULL,
    "shopifyTags" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "metafields" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "originalDescription" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "GeneratedContent_shop_idx" ON "GeneratedContent"("shop");

-- CreateIndex
CREATE INDEX "GeneratedContent_productId_idx" ON "GeneratedContent"("productId");

-- CreateIndex
CREATE INDEX "GeneratedContent_expiresAt_idx" ON "GeneratedContent"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContent_shop_productId_selectedVariant_key" ON "GeneratedContent"("shop", "productId", "selectedVariant");
