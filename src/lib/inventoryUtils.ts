import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize stock quantities for all variants
export async function initializeVariantStock(defaultQuantity: number = 10) {
  try {
    
    // Update all variants with 0 stock quantity to have the default quantity
    const result = await prisma.productVariant.updateMany({
      where: {
        stockQuantity: {
          lte: 0
        }
      },
      data: {
        stockQuantity: defaultQuantity,
        inStock: true
      }
    });
    
    
    return result;
  } catch (error) {
    throw error;
  }
}

// Get real-time stock status for a variant
export async function getVariantStockStatus(variantId: string) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        stockQuantity: true,
        inStock: true
      }
    });
    
    if (!variant) {
      return null;
    }
    
    return {
      stockQuantity: variant.stockQuantity,
      inStock: variant.inStock && variant.stockQuantity > 0
    };
  } catch (error) {
    return null;
  }
}

// Update variant stock (for admin use)
export async function updateVariantStock(variantId: string, newQuantity: number, reason?: string) {
  try {
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stockQuantity: Math.max(0, newQuantity),
        inStock: newQuantity > 0
      }
    });
    
    // Record the change in stock history
    if (reason) {
      await prisma.stockHistory.create({
        data: {
          productId: variant.productId,
          change: newQuantity - variant.stockQuantity,
          reason: reason
        }
      });
    }
    
    return variant;
  } catch (error) {
    throw error;
  }
}

// Check if a variant combination is available
export async function isVariantAvailable(productId: string, selectedAttributes: { [key: string]: string }) {
  try {
    // Get all variants for this product
    const productVariants = await prisma.productVariant.findMany({
      where: { productId },
      include: {
        attributeValues: {
          include: {
            attributeValue: {
              include: {
                attribute: true
              }
            }
          }
        }
      }
    });
    
    // Find the variant that matches all selected attributes
    const targetVariant = productVariants.find(variant => {
      const variantAttributes: { [key: string]: string } = {};
      
      // Build a map of attribute ID to value ID for this variant
      variant.attributeValues.forEach(av => {
        variantAttributes[av.attributeValue.attribute.id] = av.attributeValue.id;
      });
      
      // Check if all selected attributes match this variant
      const selectedAttributeIds = Object.keys(selectedAttributes);
      return selectedAttributeIds.every(attrId => 
        variantAttributes[attrId] === selectedAttributes[attrId]
      );
    });
    
    if (!targetVariant) {
      return false; // No matching variant found
    }
    
    return targetVariant.inStock && targetVariant.stockQuantity > 0;
  } catch (error) {
    return false;
  }
}

export default {
  initializeVariantStock,
  getVariantStockStatus,
  updateVariantStock,
  isVariantAvailable
};
