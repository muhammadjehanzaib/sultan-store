import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, CacheKeys } from '@/lib/cache';

export const revalidate = 600; // 10 minutes (for Vercel ISR if used)

export async function GET() {
  try {
    const slides = await cache.cached(
      CacheKeys.campaignSlidesActive(),
      async () => {
        const rows = await prisma.campaignSlide.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });

        // Map DB shape to CampaignSlider SlideData shape
        return rows.map((s) => {
          const en = (s.ctaText_en || '').trim();
          const ar = (s.ctaText_ar || '').trim();
          const hasText = en.length > 0 || ar.length > 0;
          return {
            id: s.id,
            title: { en: s.title_en, ar: s.title_ar },
            subtitle: { en: s.subtitle_en || '', ar: s.subtitle_ar || '' },
            description: { en: s.description_en || '', ar: s.description_ar || '' },
            image: s.image,
            ctaText: { en, ar },
            // Only expose a link if at least one CTA text is provided
            ctaLink: hasText ? (s.ctaHref || '#featured-products') : '',
            backgroundColor: s.background || 'from-purple-600 to-pink-600',
            textColor: s.textClass || 'text-white',
            discount: s.discount || undefined,
          };
        });
      },
      { ttl: 600 }
    );

    return NextResponse.json({ slides });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
