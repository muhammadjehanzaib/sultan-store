import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch current settings
export async function GET() {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);
    const adminRoles = ['admin', 'manager'];
    
    if (!session?.user || !adminRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create default settings
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {}
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);
    const adminRoles = ['admin', 'manager'];
    
    if (!session?.user || !adminRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const {
      taxRate,
      shippingRate,
      freeShippingThreshold,
      businessName,
      businessEmail,
      businessPhone,
      businessAddress
    } = body;

    // Validate numeric values
    if (taxRate !== undefined && (isNaN(taxRate) || taxRate < 0 || taxRate > 1)) {
      return NextResponse.json({ error: 'Tax rate must be between 0 and 1 (0-100%)' }, { status: 400 });
    }
    
    if (shippingRate !== undefined && (isNaN(shippingRate) || shippingRate < 0)) {
      return NextResponse.json({ error: 'Shipping rate must be a positive number' }, { status: 400 });
    }
    
    if (freeShippingThreshold !== undefined && (isNaN(freeShippingThreshold) || freeShippingThreshold < 0)) {
      return NextResponse.json({ error: 'Free shipping threshold must be a positive number' }, { status: 400 });
    }

    // Get existing settings or create if none exist
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          taxRate: taxRate || 0.15,
          shippingRate: shippingRate || 15.0,
          freeShippingThreshold: freeShippingThreshold || 50.0,
          businessName: businessName || 'SaudiSafety',
          businessEmail: businessEmail || 'support@saudisafety.com',
          businessPhone: businessPhone || '+966 XXX XXXX',
          businessAddress: businessAddress || 'Riyadh, Saudi Arabia'
        }
      });
    } else {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          ...(taxRate !== undefined && { taxRate }),
          ...(shippingRate !== undefined && { shippingRate }),
          ...(freeShippingThreshold !== undefined && { freeShippingThreshold }),
          ...(businessName !== undefined && { businessName }),
          ...(businessEmail !== undefined && { businessEmail }),
          ...(businessPhone !== undefined && { businessPhone }),
          ...(businessAddress !== undefined && { businessAddress })
        }
      });
    }

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
