import { NextResponse } from 'next/server';
import { calculateCartTotals } from '@/lib/taxShippingUtils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { notificationService } from '@/lib/notificationService';

const prisma = new PrismaClient();

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
          variantImage: item.variantImage || null
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
    for (const item of orderData.items) {
      try {
        
        // Find the specific variant based on selected attributes
        let targetVariant = null;
        if (item.selectedAttributes) {
          
          // Get all variants for this product with their attribute values
          const productVariants = await prisma.productVariant.findMany({
            where: { productId: item.productId },
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
          targetVariant = productVariants.find(variant => {
            const variantAttributes: { [key: string]: string } = {};
            
            // Build a map of attribute ID to value ID for this variant
            variant.attributeValues.forEach(av => {
              variantAttributes[av.attributeValue.attribute.id] = av.attributeValue.id;
            });
            
            // Check if all selected attributes match this variant
            const selectedAttributeIds = Object.keys(item.selectedAttributes);
            return selectedAttributeIds.every(attrId => 
              variantAttributes[attrId] === item.selectedAttributes[attrId]
            );
          });
          
          if (targetVariant) {
          } else {
          }
        }
        
        // Update variant stock if we found a matching variant
        if (targetVariant) {
          const newStockQuantity = Math.max(0, targetVariant.stockQuantity - item.quantity);
          const shouldMarkOutOfStock = newStockQuantity === 0;
          
          
          await prisma.productVariant.update({
            where: { id: targetVariant.id },
            data: {
              stockQuantity: newStockQuantity,
              inStock: !shouldMarkOutOfStock // Mark as out of stock if quantity is 0
            }
          });
          
          if (shouldMarkOutOfStock) {
          }
        }
        
        // Also update general product inventory (for backward compatibility)
        const existingInventory = await prisma.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (existingInventory) {
          await prisma.inventory.update({
            where: { productId: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        } else {
          await prisma.inventory.create({
            data: {
              productId: item.productId,
              stock: Math.max(0, -item.quantity),
              stockThreshold: 10
            }
          });
        }

        // Record stock history (both product-level and variant-specific)
        await prisma.stockHistory.create({
          data: {
            productId: item.productId,
            variantId: targetVariant?.id || null, // Add variant ID if available
            change: -item.quantity,
            reason: `Order ${order.id}${targetVariant ? ` - Variant ${targetVariant.id}` : ''}`
          }
        });
        
        
        // Check for low stock after purchase and send notification if needed
        try {
          const updatedInventory = await prisma.inventory.findUnique({
            where: { productId: item.productId },
            include: {
              product: {
                select: {
                  name_en: true,
                  name_ar: true
                }
              }
            }
          });
          
          if (updatedInventory) {
            const { stock, stockThreshold, product } = updatedInventory;
            const productName = product?.name_en || product?.name_ar || `Product ${item.productId}`;
            
            // Use default threshold of 10 if stockThreshold is null
            const threshold = stockThreshold ?? 10;
            
            if (stock <= threshold && stock > 0) {
              await notificationService.notifyLowStock(productName, stock, threshold);
            } else if (stock === 0) {
              // Could add out-of-stock notification here if needed
            }
          }
        } catch (lowStockError) {
          // Don't fail the order creation if low stock notification fails
        }
        
      } catch (inventoryError) {
        // Continue with other items but log the error
      }
    }

    // Send order confirmation notification
    try {
      const session = await getServerSession(authOptions);
      
      if (session?.user?.id) {
        
        await notificationService.notifyOrderCreated(
          session.user.id, 
          order.id, 
          orderData.total
        );
        
      } else {
      }
      
      // Always notify admin users about new orders
      await notificationService.notifyAdminNewOrder(
        order.id,
        orderData.customerEmail,
        orderData.total
      );
      
    } catch (notificationError) {
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
    return NextResponse.json({ 
      error: 'Server Error' 
    }, { status: 500 });
  }
} 