import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notificationService';

const prisma = new PrismaClient();

// GET all inventory items with low stock alerts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
    
    // Get all products with inventory data
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
        category: {
          select: {
            name_en: true,
            name_ar: true,
          }
        },
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            image: true,
            inStock: true,
            stockQuantity: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            },
            createdAt: true,
          }
        },
        attributes: {
          include: {
            values: {
              select: {
                id: true,
                value: true,
                label: true,
                hexColor: true,
                priceModifier: true,
                inStock: true,
                imageUrl: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to include computed fields
    let inventoryData = products.map(product => {
      const inventoryStock = product.inventory?.stock || 0;
      const stockThreshold = product.inventory?.stockThreshold || 5;
      
      // Calculate total variant stock
      const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
      
      // For products with variants, use variant stock total; otherwise use inventory stock
      const actualStock = product.variants.length > 0 ? totalVariantStock : inventoryStock;
      
      return {
        id: product.id,
        name_en: product.name_en,
        name_ar: product.name_ar,
        slug: product.slug,
        image: product.image,
        price: product.price,
        category: product.category,
        stock: actualStock,
        stockThreshold,
        isLowStock: actualStock <= stockThreshold,
        variants: product.variants,
        totalVariantStock,
        updatedAt: product.inventory?.updatedAt || product.createdAt,
      };
    });

    // Filter for low stock only if requested
    if (lowStockOnly) {
      inventoryData = inventoryData.filter(item => item.isLowStock);
    }

    return NextResponse.json({ 
      inventory: inventoryData,
      products: products, // Include full product data with attributes
      totalProducts: inventoryData.length,
      lowStockCount: inventoryData.filter(item => item.isLowStock).length
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' }, 
      { status: 500 }
    );
  }
}

// POST - Update inventory for a product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, stockChange, reason = 'Manual adjustment' } = body;

    if (!productId || typeof stockChange !== 'number') {
      return NextResponse.json(
        { error: 'productId and stockChange are required' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if product has variants
      const productWithVariants = await tx.product.findUnique({
        where: { id: productId },
        include: { variants: true }
      });

      if (!productWithVariants) {
        throw new Error('Product not found');
      }

      let inventory;

      if (productWithVariants.variants.length > 0) {
        // Product has variants - distribute stock change across variants proportionally
        const totalCurrentVariantStock = productWithVariants.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
        
        if (totalCurrentVariantStock > 0 || stockChange > 0) {
          // Update variants proportionally
          for (const variant of productWithVariants.variants) {
            const proportion = totalCurrentVariantStock > 0 ? variant.stockQuantity / totalCurrentVariantStock : 1 / productWithVariants.variants.length;
            const variantStockChange = Math.round(stockChange * proportion);
            
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stockQuantity: Math.max(0, variant.stockQuantity + variantStockChange),
                inStock: Math.max(0, variant.stockQuantity + variantStockChange) > 0
              }
            });
          }

          // Calculate new total variant stock
          const updatedVariants = await tx.productVariant.findMany({
            where: { productId }
          });
          const newTotalStock = updatedVariants.reduce((sum, variant) => sum + variant.stockQuantity, 0);

          // Get or create inventory record for the product
          inventory = await tx.inventory.upsert({
            where: { productId },
            update: {
              stock: newTotalStock
            },
            create: {
              productId,
              stock: newTotalStock,
              stockThreshold: 5
            }
          });
        } else {
          // All variants are at 0, just update inventory record
          inventory = await tx.inventory.upsert({
            where: { productId },
            update: {
              stock: 0
            },
            create: {
              productId,
              stock: 0,
              stockThreshold: 5
            }
          });
        }
      } else {
        // Product has no variants - handle normally
        inventory = await tx.inventory.findUnique({
          where: { productId }
        });

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: {
              productId,
              stock: Math.max(0, stockChange),
              stockThreshold: 5, // Default threshold
            }
          });
        } else {
          // Update existing inventory
          inventory = await tx.inventory.update({
            where: { productId },
            data: {
              stock: Math.max(0, inventory.stock + stockChange)
            }
          });
        }
      }

      // Record stock history
      await tx.stockHistory.create({
        data: {
          productId,
          change: stockChange,
          reason
        }
      });

      // Update product inStock status based on inventory
      await tx.product.update({
        where: { id: productId },
        data: {
          inStock: inventory.stock > 0
        }
      });

      return inventory;
    });

    // Fetch updated product with inventory
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventory: true,
        category: {
          select: {
            name_en: true,
            name_ar: true,
          }
        }
      }
    });

    // Check for low stock and send notification if needed
    if (updatedProduct && updatedProduct.inventory) {
      const { stock, stockThreshold } = updatedProduct.inventory;
      const productName = updatedProduct.name_en || updatedProduct.name_ar || 'Unknown Product';
      
      // Use default threshold of 5 if stockThreshold is null
      const threshold = stockThreshold ?? 5;
      
      if (stock <= threshold && stock > 0) {
        try {
          await notificationService.notifyLowStock(productName, stock, threshold);
        } catch (notificationError) {
        }
      }
    }

    return NextResponse.json({
      message: 'Inventory updated successfully',
      inventory: result,
      product: updatedProduct
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update inventory' }, 
      { status: 500 }
    );
  }
}
