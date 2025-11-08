CREATE TABLE IF NOT EXISTS attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  taipei_id TEXT NOT NULL UNIQUE,
  introduction TEXT,
  images TEXT[],
  modified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attractions_location_id ON attractions(location_id);
CREATE INDEX IF NOT EXISTS idx_attractions_taipei_id ON attractions(taipei_id);

CREATE TRIGGER update_attractions_updated_at
BEFORE UPDATE ON attractions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
