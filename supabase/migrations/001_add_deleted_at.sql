-- Setup: demo user for MVP auth
-- 1. Create user in Supabase Dashboard > Authentication > Users
--    Email: demo@kosmos.local  Password: Demo123456!
-- 2. Copy the user's UUID and run the INSERT below (replace YOUR_AUTH_USER_ID)

-- INSERT INTO usuarios (id, email, nome)
-- VALUES ('YOUR_AUTH_USER_ID', 'demo@kosmos.local', 'Operador Demo');

-- Migration: soft delete columns (run before using Records page)
ALTER TABLE producao_vick ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE producao_coldbox ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE producao_macharia ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE refugo ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
