import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

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
            attributeValues: true,
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
      const stock = product.inventory?.stock || 0;
      const stockThreshold = product.inventory?.stockThreshold || 5;
      
      return {
        id: product.id,
        name_en: product.name_en,
        name_ar: product.name_ar,
        slug: product.slug,
        image: product.image,
        price: product.price,
        category: product.category,
        stock,
        stockThreshold,
        isLowStock: stock <= stockThreshold,
        variants: product.variants,
        totalVariantStock: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
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
    console.error('[GET /api/inventory]', error);
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
      // Get or create inventory record
      let inventory = await tx.inventory.findUnique({
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

    return NextResponse.json({
      message: 'Inventory updated successfully',
      inventory: result,
      product: updatedProduct
    });

  } catch (error) {
    console.error('[POST /api/inventory]', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' }, 
      { status: 500 }
    );
  }
}
