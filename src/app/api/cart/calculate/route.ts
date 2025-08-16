import { NextRequest, NextResponse } from 'next/server';
import { calculateCartTotals } from '@/lib/taxShippingUtils';

export async function POST(request: NextRequest) {
  try {
    const { items, shippingCountry = 'SA' } = await request.json();

    // Validate items
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items must be an array' }, { status: 400 });
    }

    // Calculate totals
    const calculation = await calculateCartTotals(items);

    return NextResponse.json({
      success: true,
      calculation
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
