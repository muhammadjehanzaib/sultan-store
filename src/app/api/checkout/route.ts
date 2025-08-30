import { NextResponse } from 'next/server';
import { calculateCartTotals } from '@/lib/taxShippingUtils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      customerEmail, 
      customerName, 
      items, 
      billingAddress, 
      shippingAddress, 
      paymentMethod,
      codFee = 0
    } = body;
    
    // Validate required fields
    if (!customerEmail || !customerName || !items) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Cart is empty' 
      }, { status: 400 });
    }

    // Calculate totals using the tax and shipping utils
    const calculation = await calculateCartTotals(items);
    // Add COD fee to the total if applicable
    const finalTotal = calculation.total + (codFee || 0);

    // Create order data with calculated totals
    const orderData = {
      customerEmail,
      customerName,
      items: items.map((item: any) => {
        // Use variant price if available, otherwise fallback to product price
        const itemPrice = item.variantPrice || item.product.price;
        return {
          productId: item.product.id,
          quantity: item.quantity,
          price: itemPrice,
          total: itemPrice * item.quantity,
          selectedAttributes: item.selectedAttributes || null,
          variantImage: item.variantImage || null,
          variantId: item.variantId || null
        };
      }),
      subtotal: calculation.subtotal,
      tax: calculation.taxAmount,
      shipping: calculation.shippingAmount,
      codFee: codFee || 0,
      total: finalTotal,
      billingAddress,
      shippingAddress,
      paymentMethod
    };

    // Create order directly in database
    const order = await prisma.order.create({
      data: {
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        codFee: orderData.codFee,
        total: orderData.total,
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
        billingAddress: orderData.billingAddress,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        items: {
          create: orderData.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            selectedAttributes: item.selectedAttributes || null,
            variantImage: item.variantImage || null
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update inventory for each item (both product-level and variant-specific)
    const loopStart = Date.now();
    let perItemMax = 0;
    let perItemTotal = 0;
    for (const item of orderData.items) {
      const i0 = Date.now();
      try {
        
        // Try fast path: variantId provided by client
        let targetVariant: { id: string; stockQuantity: number } | null = null;
        if (item.variantId) {
          const found = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, stockQuantity: true, productId: true }
          });
          if (found && found.productId === item.productId) {
            targetVariant = { id: found.id, stockQuantity: found.stockQuantity };
          }
        }

        // No fallback variant lookup: we rely on client-provided variantId only. If absent or invalid,
        // we skip variant stock updates and still adjust product-level inventory.
        // Perform variant update, inventory update, and stock history in a single transaction
        const invResult = await prisma.$transaction(async (tx) => {
          // Update variant stock if we found a matching variant
          if (targetVariant) {
            const newStockQuantity = Math.max(0, targetVariant.stockQuantity - item.quantity);
            const shouldMarkOutOfStock = newStockQuantity === 0;

            await tx.productVariant.update({
              where: { id: targetVariant.id },
              data: {
                stockQuantity: newStockQuantity,
                inStock: !shouldMarkOutOfStock
              }
            });
          }

          // Upsert product inventory and select needed fields
          const inv = await tx.inventory.upsert({
            where: { productId: item.productId },
            update: {
              stock: {
                decrement: item.quantity
              }
            },
            create: {
              productId: item.productId,
              stock: Math.max(0, -item.quantity),
              stockThreshold: 10
            },
            select: {
              stock: true,
              stockThreshold: true,
              product: { select: { name_en: true, name_ar: true } }
            }
          });

          // Record stock history (both product-level and variant-specific)
          await tx.stockHistory.create({
            data: {
              productId: item.productId,
              variantId: (item.variantId as string | null) || null, // Use provided variantId only
              change: -item.quantity,
              reason: `Order ${order.id}${item.variantId ? ` - Variant ${item.variantId}` : ''}`
            }
          });

          return inv;
        });

        // Check for low stock after purchase and send notification if needed (non-blocking)
        if (invResult) {
          try {
            const stock = invResult.stock;
            const threshold = (invResult.stockThreshold ?? 10);
            const productName = invResult.product?.name_en || invResult.product?.name_ar || `Product ${item.productId}`;
            if (stock <= threshold && stock > 0) {
              void notificationService.notifyLowStock(productName, stock, threshold).catch(() => {});
            }
          } catch (lowStockError) {
            // Ignore notification errors
          }
        }
        
      } catch (inventoryError) {
        // Continue with other items but log the error
      } finally {
        const dt = Date.now() - i0;
        perItemTotal += dt;
        if (dt > perItemMax) perItemMax = dt;
      }
    }

    // Send order confirmation notification (non-blocking)
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        void notificationService
          .notifyOrderCreated(session.user.id, order.id, orderData.total)
          .catch(() => {});
      }
      // Always notify admin users about new orders
      void notificationService
        .notifyAdminNewOrder(
          order.id,
          orderData.customerEmail,
          orderData.total
        )
        .catch(() => {});
    } catch (notificationError) {
      // Ignore notification errors
    }

    // TODO: Integrate with payment gateway here
    // For now, we'll just return success
    // In a real implementation, you would:
    // 1. Process payment with Stripe/PayPal
    // 2. Update order status based on payment result

    return NextResponse.json({ 
      success: true,
      order,
      message: 'Order created successfully'
    });

  } catch (err) {
    return NextResponse.json({ 
      error: 'Server Error' 
    }, { status: 500 });
  }
} 