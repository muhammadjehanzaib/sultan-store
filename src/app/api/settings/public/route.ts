import { NextRequest, NextResponse } from 'next/server';
import { getTaxInfo, getShippingInfo } from '@/lib/taxShippingUtils';

// Public endpoint to get tax and shipping information for frontend
export async function GET() {
  try {
    const [taxInfo, shippingInfo] = await Promise.all([
      getTaxInfo(),
      getShippingInfo()
    ]);

    return NextResponse.json({
      tax: taxInfo,
      shipping: shippingInfo
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    
    // Return default values if there's an error
    return NextResponse.json({
      tax: {
        rate: 0.15,
        percentage: 15,
        name: 'VAT'
      },
      shipping: {
        rate: 15.0,
        freeThreshold: 50.0,
        freeShippingMessage: 'Free shipping on orders over SAR 50.00'
      }
    });
  }
}
