-- Create Session table for Shopify authentication
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "shop" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "isOnline" BOOLEAN NOT NULL DEFAULT false,
  "scope" TEXT,
  "expires" TIMESTAMP,
  "accessToken" TEXT NOT NULL,
  "userId" BIGINT,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "accountOwner" BOOLEAN NOT NULL DEFAULT false,
  "locale" TEXT,
  "collaborator" BOOLEAN DEFAULT false,
  "emailVerified" BOOLEAN DEFAULT false
);

-- Create GeneratedContent table for caching AI-generated product content
CREATE TABLE IF NOT EXISTS "GeneratedContent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP NOT NULL,
  CONSTRAINT "GeneratedContent_shop_productId_selectedVariant_key" UNIQUE ("shop", "productId", "selectedVariant")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "GeneratedContent_shop_idx" ON "GeneratedContent"("shop");
CREATE INDEX IF NOT EXISTS "GeneratedContent_productId_idx" ON "GeneratedContent"("productId");
CREATE INDEX IF NOT EXISTS "GeneratedContent_expiresAt_idx" ON "GeneratedContent"("expiresAt");
