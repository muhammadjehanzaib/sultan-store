import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/user/addresses/[id] - Update an existing address
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const addressId = id;
    
    // Check if address exists and belongs to the current user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
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
          type: type,
          id: { not: addressId } // Don't update the current address
        },
        data: {
          isDefault: false
        }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
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
      message: 'Address updated successfully',
      address: updatedAddress
    });

  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/addresses/[id] - Delete an address
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const addressId = id;
    
    // Check if address exists and belongs to the current user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    return NextResponse.json({
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
