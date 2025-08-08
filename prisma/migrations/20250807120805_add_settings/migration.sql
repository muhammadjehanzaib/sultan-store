/*
  Warnings:

  - You are about to drop the column `attributeValues` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "attributeValues";

-- CreateTable
CREATE TABLE "VariantAttributeValue" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "attributeValueId" TEXT NOT NULL,

    CONSTRAINT "VariantAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "shippingRate" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "businessName" TEXT NOT NULL DEFAULT 'SaudiSafety',
    "businessEmail" TEXT NOT NULL DEFAULT 'support@saudisafety.com',
    "businessPhone" TEXT NOT NULL DEFAULT '+966 XXX XXXX',
    "businessAddress" TEXT NOT NULL DEFAULT 'Riyadh, Saudi Arabia',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VariantAttributeValue_variantId_attributeValueId_key" ON "VariantAttributeValue"("variantId", "attributeValueId");

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "AttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
