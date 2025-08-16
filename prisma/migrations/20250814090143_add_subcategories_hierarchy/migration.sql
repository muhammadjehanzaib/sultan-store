/*
  Warnings:

  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description_ar" TEXT,
ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metaDesc_ar" TEXT,
ADD COLUMN     "metaDesc_en" TEXT,
ADD COLUMN     "metaTitle_ar" TEXT,
ADD COLUMN     "metaTitle_en" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "path" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPercent" DOUBLE PRECISION,
ADD COLUMN     "onSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saleEndDate" TIMESTAMP(3),
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "saleStartDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_level_idx" ON "Category"("level");

-- CreateIndex
CREATE INDEX "Category_path_idx" ON "Category"("path");

-- CreateIndex
CREATE INDEX "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
