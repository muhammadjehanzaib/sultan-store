import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@/generated/prisma";


const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await req.json();
    const { name_en, name_ar, slug, icon } = body;

    if (!name_en || !name_ar || !slug) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name_en, name_ar, slug, icon },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error('[PUT /categories/:id]', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /categories/:id]', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
