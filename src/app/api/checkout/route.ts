import { NextResponse } from 'next/server';
import { calculateCartTotals } from '@/lib/taxShippingUtils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { notificationService } from '@/lib/notificationService';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    console.log('🔍 Checkout API: Starting POST request');
    const body = await request.json();
    console.log('🔍 Checkout API: Request body:', JSON.stringify(body, null, 2));
    
    const { 
      customerEmail, 
      customerName, 
      items, 
      billingAddress, 
      shippingAddress, 
      paymentMethod,
      codFee = 0
    } = body;
    
    console.log('🔍 Checkout API: Extracted values:', {
      customerEmail,
      customerName,
      itemsCount: items?.length,
      paymentMethod,
      codFee
    });

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
          selectedAttributes: item.selectedAttributes || null
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
            selectedAttributes: item.selectedAttributes || null
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

    // Update inventory for each item
    for (const item of orderData.items) {
      try {
        // First, try to find existing inventory record
        const existingInventory = await prisma.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (existingInventory) {
          // Update existing inventory
          await prisma.inventory.update({
            where: { productId: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        } else {
          // Create new inventory record with initial stock of 0 (since we're decrementing)
          await prisma.inventory.create({
            data: {
              productId: item.productId,
              stock: Math.max(0, -item.quantity), // Ensure non-negative stock
              stockThreshold: 10 // Default threshold
            }
          });
        }

        // Record stock history
        await prisma.stockHistory.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${order.id}`
          }
        });
      } catch (inventoryError) {
        console.error(`Error updating inventory for product ${item.productId}:`, inventoryError);
        // Continue with other items but log the error
      }
    }

    // Send order confirmation notification
    try {
      const session = await getServerSession(authOptions);
      console.log('🔔 Session for notification:', session?.user?.id, session?.user?.email);
      
      if (session?.user?.id) {
        console.log('🔔 Sending customer notification for order:', order.id, 'to user:', session.user.id);
        
        await notificationService.notifyOrderCreated(
          session.user.id, 
          order.id, 
          orderData.total
        );
        
        console.log('✅ Customer notification sent successfully');
      } else {
        console.log('❌ No session user ID found for customer notification');
      }
      
      // Always notify admin users about new orders
      console.log('🔔 Sending admin notifications for new order:', order.id);
      await notificationService.notifyAdminNewOrder(
        order.id,
        orderData.customerEmail,
        orderData.total
      );
      console.log('✅ Admin notifications sent successfully');
      
    } catch (notificationError) {
      console.error('❌ Failed to send notifications:', notificationError);
      // Don't fail the order creation if notification fails
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
    console.error('[POST /checkout]', err);
    return NextResponse.json({ 
      error: 'Server Error' 
    }, { status: 500 });
  }
} 