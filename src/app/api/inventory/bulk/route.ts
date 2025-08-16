import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

interface BulkInventoryUpdate {
  productId: string;
  stockChange?: number;
  stockThreshold?: number;
  reason?: string;
}

// POST - Bulk update inventory for multiple products
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates }: { updates: BulkInventoryUpdate[] } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each update
    for (const update of updates) {
      if (!update.productId) {
        return NextResponse.json(
          { error: 'Each update must have a productId' },
          { status: 400 }
        );
      }
      
      if (update.stockChange !== undefined && typeof update.stockChange !== 'number') {
        return NextResponse.json(
          { error: 'stockChange must be a number if provided' },
          { status: 400 }
        );
      }

      if (update.stockThreshold !== undefined && (typeof update.stockThreshold !== 'number' || update.stockThreshold < 0)) {
        return NextResponse.json(
          { error: 'stockThreshold must be a non-negative number if provided' },
          { status: 400 }
        );
      }
    }

    // Process bulk updates in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const updateResults = [];

      for (const update of updates) {
        const { productId, stockChange, stockThreshold, reason = 'Bulk update' } = update;

        // Check if product exists
        const product = await tx.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          updateResults.push({
            productId,
            success: false,
            error: 'Product not found'
          });
          continue;
        }

        try {
          // Get or create inventory record
          let inventory = await tx.inventory.findUnique({
            where: { productId }
          });

          if (!inventory) {
            inventory = await tx.inventory.create({
              data: {
                productId,
                stock: stockChange ? Math.max(0, stockChange) : 0,
                stockThreshold: stockThreshold ?? 5,
              }
            });
          } else {
            // Update existing inventory
            const updateData: any = {};
            
            if (stockChange !== undefined) {
              updateData.stock = Math.max(0, inventory.stock + stockChange);
            }
            
            if (stockThreshold !== undefined) {
              updateData.stockThreshold = stockThreshold;
            }

            if (Object.keys(updateData).length > 0) {
              inventory = await tx.inventory.update({
                where: { productId },
                data: updateData
              });
            }
          }

          // Record stock history if stock changed
          if (stockChange !== undefined && stockChange !== 0) {
            await tx.stockHistory.create({
              data: {
                productId,
                change: stockChange,
                reason
              }
            });
          }

          // Update product inStock status based on inventory
          await tx.product.update({
            where: { id: productId },
            data: {
              inStock: inventory.stock > 0
            }
          });

          updateResults.push({
            productId,
            success: true,
            inventory,
            isLowStock: inventory.stock <= (inventory.stockThreshold ?? 5)
          });

        } catch (error) {
          updateResults.push({
            productId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return updateResults;
    });

    const successCount = results.filter(result => result.success).length;
    const failureCount = results.filter(result => !result.success).length;

    return NextResponse.json({
      message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: updates.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process bulk inventory update' },
      { status: 500 }
    );
  }
}
