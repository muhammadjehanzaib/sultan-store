import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { name_en, name_ar, slug, icon, isActive } = body;
    const { id } = await params;

    if (!id || !name_en || !name_ar || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData: any = { name_en, name_ar, slug, icon };
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ category: updatedCategory }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }

    // Allow partial updates
    const updateData: any = {};
    if (body.name_en !== undefined) updateData.name_en = body.name_en;
    if (body.name_ar !== undefined) updateData.name_ar = body.name_ar;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ category: updatedCategory }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
