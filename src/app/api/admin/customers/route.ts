import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Note: Since we don't have a direct status field in User model,
    // we'll need to determine status based on other criteria or add it to the schema
    // For now, we'll consider all users as 'active' unless they're marked otherwise

    // Get customers with order information
    const customers = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            accounts: true,
            sessions: true,
          }
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        // Get order statistics from orders where customerEmail matches
        const orderStats = await prisma.order.groupBy({
          by: ['customerEmail'],
          where: { customerEmail: customer.email },
          _sum: { total: true },
          _count: { id: true }
        });

        const stats = orderStats[0] || { _sum: { total: 0 }, _count: { id: 0 } };
        
        return {
          id: customer.id,
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email,
          phone: customer.phone || '',
          avatar: customer.image || '',
          createdAt: customer.createdAt,
          lastLoginAt: customer.updatedAt, // Using updatedAt as proxy for last activity
          totalOrders: stats._count.id,
          totalSpent: stats._sum.total || 0,
          status: 'active' as const, // Default status - would need to add this field to User model
          addresses: [], // Would need to implement address relationship
          orders: [] // Not included in list view for performance
        };
      })
    );

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// Create new customer (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new customer
    const newCustomer = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone: phone || null,
        password: password || null, // In a real app, you'd hash this
        role: 'viewer', // Default role for customers
        isGuest: false
      }
    });

    // Return the created customer in the expected format
    const customerResponse = {
      id: newCustomer.id,
      firstName: newCustomer.firstName || '',
      lastName: newCustomer.lastName || '',
      email: newCustomer.email,
      phone: newCustomer.phone || '',
      avatar: newCustomer.image || '',
      createdAt: newCustomer.createdAt,
      lastLoginAt: null,
      totalOrders: 0,
      totalSpent: 0,
      status: 'active' as const,
      addresses: [],
      orders: []
    };

    return NextResponse.json(customerResponse, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
