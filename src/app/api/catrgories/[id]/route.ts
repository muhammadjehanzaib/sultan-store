import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@/generated/prisma";


const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, context: any) {
  try {
    const body = await req.json();
    const { name_en, name_ar, slug, icon } = body;
    const { id } = context.params;

    if (!id || !name_en || !name_ar || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name_en, name_ar, slug, icon },
    });

    return NextResponse.json({ category: updatedCategory }, { status: 200 });
  } catch (err) {
    console.error('[PUT /categories/:id]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (err) {
    console.error('[DELETE /categories/:id]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
