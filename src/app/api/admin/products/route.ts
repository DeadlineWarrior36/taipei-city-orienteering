import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db/products';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeUnavailable = searchParams.get('include_unavailable') === 'true';

    const products = await getProducts(includeUnavailable);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, points_required, stock, is_available } = body;

    if (!name || points_required === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = await createProduct({
      name,
      description,
      points_required,
      stock,
      is_available,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
