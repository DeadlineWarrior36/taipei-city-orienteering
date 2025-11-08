import { supabaseAdmin } from '@/lib/supabase';

export interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPurchaseRecord {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_points: number;
  created_at: string;
}

export async function getProducts(includeUnavailable = false): Promise<ProductRecord[]> {
  const supabase = supabaseAdmin();

  let query = supabase.from('products').select('*').order('name');

  if (!includeUnavailable) {
    query = query.eq('is_available', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return data || [];
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data;
}

export async function createProduct(params: {
  name: string;
  description?: string;
  points_required: number;
  stock: number;
  is_available?: boolean;
}): Promise<string> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: params.name,
      description: params.description || null,
      points_required: params.points_required,
      stock: params.stock,
      is_available: params.is_available ?? true,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data.id;
}

export async function updateProduct(
  id: string,
  params: {
    name?: string;
    description?: string;
    points_required?: number;
    stock?: number;
    is_available?: boolean;
  }
): Promise<void> {
  const supabase = supabaseAdmin();

  const { error } = await supabase
    .from('products')
    .update(params)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = supabaseAdmin();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

export async function createProductPurchase(params: {
  userId: string;
  productId: string;
  quantity: number;
}): Promise<string> {
  const supabase = supabaseAdmin();

  const product = await getProductById(params.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.is_available) {
    throw new Error('Product is not available');
  }

  if (product.stock < params.quantity) {
    throw new Error('Insufficient stock');
  }

  const totalPoints = product.points_required * params.quantity;

  const { data, error } = await supabase
    .from('product_purchases')
    .insert({
      user_id: params.userId,
      product_id: params.productId,
      quantity: params.quantity,
      total_points: totalPoints,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create product purchase: ${error.message}`);
  }

  // Update product stock
  await updateProduct(params.productId, {
    stock: product.stock - params.quantity,
  });

  // Deduct points from user
  const { error: pointsError } = await supabase.rpc('increment_user_points', {
    p_user_id: params.userId,
    p_points: -totalPoints,
  });

  if (pointsError) {
    throw new Error(`Failed to deduct user points: ${pointsError.message}`);
  }

  return data.id;
}

export async function getProductPurchases(userId?: string): Promise<ProductPurchaseRecord[]> {
  const supabase = supabaseAdmin();

  let query = supabase
    .from('product_purchases')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch product purchases: ${error.message}`);
  }

  return data || [];
}
