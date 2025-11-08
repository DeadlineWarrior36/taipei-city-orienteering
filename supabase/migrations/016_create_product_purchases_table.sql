-- Create product_purchases table
CREATE TABLE product_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_points INTEGER NOT NULL CHECK (total_points >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_product_purchases_user_id ON product_purchases(user_id);
CREATE INDEX idx_product_purchases_product_id ON product_purchases(product_id);
CREATE INDEX idx_product_purchases_created_at ON product_purchases(created_at DESC);
