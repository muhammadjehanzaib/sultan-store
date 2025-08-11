import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer details
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        sessions: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get customer's orders
    const orders = await prisma.order.findMany({
      where: { customerEmail: customer.email },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate order statistics
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Get last login from sessions
    const lastSession = await prisma.session.findFirst({
      where: { userId: customer.id },
      orderBy: { expires: 'desc' }
    });

    const customerResponse = {
      id: customer.id,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email,
      phone: customer.phone || '',
      avatar: customer.image || '',
      createdAt: customer.createdAt,
      lastLoginAt: lastSession?.expires || customer.updatedAt,
      totalOrders,
      totalSpent,
      status: 'active' as const, // Would need to add this field to User model
      addresses: [], // Would need to implement address relationship
      orders: orders.map(order => ({
        id: order.id,
        items: order.items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name_en,
            slug: item.product.slug,
            price: item.product.price,
            image: item.product.image,
            category: item.product.categoryId,
            description: item.product.description_en,
            inStock: item.product.inStock,
            rating: item.product.rating,
            reviews: item.product.reviews
          },
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          selectedAttributes: item.selectedAttributes
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        billingAddress: order.billingAddress,
        shippingAddress: order.shippingAddress,
        paymentMethod: { id: 'card', type: 'card' as const, name: order.paymentMethod },
        status: order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        trackingNumber: order.trackingNumber,
        trackingProvider: order.trackingProvider as 'fedex' | 'ups' | 'usps' | 'dhl' | 'custom' | undefined
      }))
    };

    return NextResponse.json(customerResponse);

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { firstName, lastName, email, phone, role, status } = body;

    // Check if customer exists
    const existingCustomer = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // If email is being changed, check if new email is available
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 409 }
        );
      }
    }

    // Update customer
    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName || existingCustomer.firstName,
        lastName: lastName || existingCustomer.lastName,
        name: firstName && lastName ? `${firstName} ${lastName}` : existingCustomer.name,
        email: email || existingCustomer.email,
        phone: phone !== undefined ? phone : existingCustomer.phone,
        role: role || existingCustomer.role,
        // Note: Status update would require adding status field to User model
      }
    });

    // Get updated statistics
    const orderStats = await prisma.order.groupBy({
      by: ['customerEmail'],
      where: { customerEmail: updatedCustomer.email },
      _sum: { total: true },
      _count: { id: true }
    });

    const stats = orderStats[0] || { _sum: { total: 0 }, _count: { id: 0 } };

    const customerResponse = {
      id: updatedCustomer.id,
      firstName: updatedCustomer.firstName || '',
      lastName: updatedCustomer.lastName || '',
      email: updatedCustomer.email,
      phone: updatedCustomer.phone || '',
      avatar: updatedCustomer.image || '',
      createdAt: updatedCustomer.createdAt,
      lastLoginAt: updatedCustomer.updatedAt,
      totalOrders: stats._count.id,
      totalSpent: stats._sum.total || 0,
      status: 'active' as const,
      addresses: [],
      orders: []
    };

    return NextResponse.json(customerResponse);

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if customer has orders
    const orderCount = await prisma.order.count({
      where: { customerEmail: customer.email }
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      );
    }

    // Delete customer (this will cascade delete accounts, sessions, etc.)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
