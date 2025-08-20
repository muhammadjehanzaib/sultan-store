import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/addresses - Get all addresses for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' }, // Default addresses first
        { createdAt: 'desc' }   // Most recent first
      ]
    });

    return NextResponse.json({ addresses });

  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      type, 
      firstName, 
      lastName, 
      address, 
      city, 
      state, 
      zipCode, 
      country, 
      phone,
      isDefault 
    } = body;

    // Validate required fields
    if (!type || !firstName || !lastName || !address || !city || !state || !zipCode || !country) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'billing' && type !== 'shipping') {
      return NextResponse.json(
        { error: 'Type must be either "billing" or "shipping"' },
        { status: 400 }
      );
    }

    // If this is being set as default, unset other default addresses of the same type
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          type: type
        },
        data: {
          isDefault: false
        }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        type,
        firstName,
        lastName,
        address,
        city,
        state,
        zipCode,
        country,
        phone: phone || null,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({
      message: 'Address created successfully',
      address: newAddress
    });

  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
