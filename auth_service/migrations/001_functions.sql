-- migrations/001_functions.sql
-- Description: Shared reusable Postgres functions

-- Trigger to update updated_at on row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS  TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
