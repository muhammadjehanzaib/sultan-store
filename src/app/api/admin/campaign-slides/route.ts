import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { invalidateCampaignSlides } from '@/lib/cache';

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  const adminRoles = ['admin', 'manager'];
  if (!session?.user || !adminRoles.includes(session.user.role as string)) {
    return null;
  }
  return session.user;
};

// GET: list slides (optionally include inactive)
export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true';

  const slides = await prisma.campaignSlide.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ slides });
}

// POST: create slide
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    title_en,
    title_ar,
    subtitle_en,
    subtitle_ar,
    description_en,
    description_ar,
    image, // base64
    ctaText_en,
    ctaText_ar,
    ctaHref,
    background,
    textClass,
    discount,
    isActive = true,
    sortOrder = 0,
  } = body;

  if (!title_en || !title_ar || !image) {
    return NextResponse.json({ error: 'title_en, title_ar and image are required' }, { status: 400 });
  }

  const created = await prisma.campaignSlide.create({
    data: {
      title_en,
      title_ar,
      subtitle_en: subtitle_en || null,
      subtitle_ar: subtitle_ar || null,
      description_en: description_en || null,
      description_ar: description_ar || null,
      image,
      ctaText_en: ctaText_en || null,
      ctaText_ar: ctaText_ar || null,
      ctaHref: ctaHref || '#featured-products',
      background: background || 'from-purple-600 to-pink-600',
      textClass: textClass || 'text-white',
      discount: discount || null,
      isActive,
      sortOrder,
    },
  });

  invalidateCampaignSlides();
  return NextResponse.json({ slide: created }, { status: 201 });
}

// PUT: update slide by id
export async function PUT(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const body = await req.json();

  const updated = await prisma.campaignSlide.update({
    where: { id },
    data: {
      ...(body.title_en !== undefined && { title_en: body.title_en }),
      ...(body.title_ar !== undefined && { title_ar: body.title_ar }),
      ...(body.subtitle_en !== undefined && { subtitle_en: body.subtitle_en }),
      ...(body.subtitle_ar !== undefined && { subtitle_ar: body.subtitle_ar }),
      ...(body.description_en !== undefined && { description_en: body.description_en }),
      ...(body.description_ar !== undefined && { description_ar: body.description_ar }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.ctaText_en !== undefined && { ctaText_en: body.ctaText_en }),
      ...(body.ctaText_ar !== undefined && { ctaText_ar: body.ctaText_ar }),
      ...(body.ctaHref !== undefined && { ctaHref: body.ctaHref }),
      ...(body.background !== undefined && { background: body.background }),
      ...(body.textClass !== undefined && { textClass: body.textClass }),
      ...(body.discount !== undefined && { discount: body.discount }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  });

  invalidateCampaignSlides();
  return NextResponse.json({ slide: updated });
}

// DELETE: delete slide by id
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await prisma.campaignSlide.delete({ where: { id } });
  invalidateCampaignSlides();
  return NextResponse.json({ success: true });
}
