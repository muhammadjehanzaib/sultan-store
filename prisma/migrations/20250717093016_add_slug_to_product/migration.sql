-- Add slug column to Product table
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- Fill slug with a default value for existing products (e.g., use id as slug temporarily)
UPDATE "Product" SET "slug" = "id" WHERE "slug" IS NULL;

-- Add unique constraint to slug
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug"); 