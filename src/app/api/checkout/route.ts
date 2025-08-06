import { NextResponse } from 'next/server';

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
      subtotal,
      tax,
      shipping,
      total 
    } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !items || !total) {
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

    // Create order data
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
      subtotal,
      tax: tax || 0,
      shipping: shipping || 0,
      total,
      billingAddress,
      shippingAddress,
      paymentMethod
    };

    // Create order via orders API
    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      return NextResponse.json({ 
        error: errorData.error || 'Failed to create order' 
      }, { status: orderResponse.status });
    }

    const { order } = await orderResponse.json();

    // TODO: Integrate with payment gateway here
    // For now, we'll just return success
    // In a real implementation, you would:
    // 1. Process payment with Stripe/PayPal
    // 2. Update order status based on payment result
    // 3. Send confirmation email
    // 4. Update inventory

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