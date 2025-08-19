import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Parse JSON from Customer Care form (following product upload pattern)
    const body = await request.json();
    
    const { emailAddress, mobileNumber, region, messageType, description, attachment, attachmentName } = body;

    // Validate required fields
    if (!emailAddress || !mobileNumber || !region || !messageType || !description) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate attachment if provided (check if it's a valid base64 data URL)
    let attachmentUrl: string | null = null;
    let finalAttachmentName: string | null = null;
    
    if (attachment && attachment.startsWith('data:')) {
      // Store base64 data URL directly (same as product images)
      attachmentUrl = attachment;
      finalAttachmentName = attachmentName || 'attachment';
    }

    // Create contact query in database
    const contactQuery = await prisma.contactQuery.create({
      data: {
        email: emailAddress.trim().toLowerCase(),
        mobileNumber: mobileNumber.trim(),
        region: region.trim(),
        messageType: messageType.trim(),
        description: description.trim(),
        attachmentUrl,
        attachmentName: finalAttachmentName,
        status: 'new'
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Contact query submitted successfully',
      id: contactQuery.id
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact query' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get contact queries with pagination
    const [contactQueries, totalCount] = await Promise.all([
      prisma.contactQuery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactQuery.count({ where }),
    ]);

    return NextResponse.json({
      contactQueries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contact queries' },
      { status: 500 }
    );
  }
}
