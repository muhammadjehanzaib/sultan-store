import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { initializeVariantStock } from '@/lib/inventoryUtils';

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { defaultQuantity = 10 } = body;


    // Initialize stock for all variants
    const result = await initializeVariantStock(defaultQuantity);

    return NextResponse.json({
      success: true,
      message: `Successfully initialized stock for ${result.count} variants`,
      updatedCount: result.count
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to initialize inventory' 
    }, { status: 500 });
  }
}
