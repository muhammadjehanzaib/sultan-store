import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name_en, name_ar, slug, icon } = body;

        if (!name_en || !name_ar || !slug) {
            return NextResponse.json({ error: 'Missing request fields' }, { status: 400 })
        }

        const category = await prisma.category.create({
            data: {
                name_en,
                name_ar,
                slug,
                icon,
            }
        });

        return NextResponse.json({ category }, { status: 201 });

    } catch (err) {
        console.error('[POST / Categoories]', err);
        return NextResponse.json({ error: 'Serve Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ categories });
    } catch (err) {
        console.error('[GET / categories]', err);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });

    }
}