-- Migration: Add gender fields to user_profiles, product_series, and categories
-- Date: 2025-11-27

-- 1. Add gender field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'male'
CHECK (gender IN ('male', 'female'));

-- 2. Add target_gender field to product_series table
ALTER TABLE product_series 
ADD COLUMN IF NOT EXISTS target_gender VARCHAR(10) DEFAULT 'all'
CHECK (target_gender IN ('male', 'female', 'all'));

-- 3. Add target_gender field to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS target_gender VARCHAR(10) DEFAULT 'all'
CHECK (target_gender IN ('male', 'female', 'all'));

-- 4. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_series_target_gender ON product_series(target_gender);
CREATE INDEX IF NOT EXISTS idx_categories_target_gender ON categories(target_gender);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);

-- 5. Update existing records to have 'all' as default for series and categories
UPDATE product_series SET target_gender = 'all' WHERE target_gender IS NULL;
UPDATE categories SET target_gender = 'all' WHERE target_gender IS NULL;
UPDATE user_profiles SET gender = 'male' WHERE gender IS NULL;
