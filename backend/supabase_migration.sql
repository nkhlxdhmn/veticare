-- ============================================================
-- Migration: Make Supabase tables compatible with custom auth
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add email and hashed_password to profiles (if missing)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email VARCHAR(320) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255) NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS ix_profiles_email ON profiles(email);

-- 2. Drop FK constraint that links profiles.id to auth.users
--    (our custom auth creates profiles independently)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Drop role check constraint (only allows 'user'/'admin')
--    Our app uses roles like 'pet_owner'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 4. Add animal_id FK to pets (backend uses animal_id, not text column)
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS animal_id UUID REFERENCES animals(id) ON DELETE SET NULL;

-- 5. Drop NOT NULL on pets.animal (ORM uses animal_id instead)
ALTER TABLE pets ALTER COLUMN animal DROP NOT NULL;

-- 6. Add updated_at to tables that may be missing it
ALTER TABLE animals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE animal_diseases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE care_guides ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 7. Add confidence check constraint
ALTER TABLE prediction_history
  DROP CONSTRAINT IF EXISTS ck_prediction_confidence;
ALTER TABLE prediction_history
  ADD CONSTRAINT ck_prediction_confidence CHECK (confidence >= 0 AND confidence <= 1);

-- 8. Verify
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('profiles', 'pets')
ORDER BY table_name, ordinal_position;
