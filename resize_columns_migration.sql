-- =========================================================================
-- QuestAI Database Optimization Migration: Column Size Reduction
-- Target Database: PostgreSQL / Supabase
--
-- This script reduces over-allocated VARCHAR columns across all 11 tables
-- to domain-optimized lengths, establishing strict data integrity,
-- optimal memory caching, and predictable index performance.
-- =========================================================================

BEGIN;

-- 1. Users Table
ALTER TABLE users 
    ALTER COLUMN email TYPE VARCHAR(100),
    ALTER COLUMN hashed_password TYPE VARCHAR(72),
    ALTER COLUMN full_name TYPE VARCHAR(60),
    ALTER COLUMN google_id TYPE VARCHAR(50),
    ALTER COLUMN profile_picture TYPE VARCHAR(500),
    ALTER COLUMN auth_provider TYPE VARCHAR(20),
    ALTER COLUMN role TYPE VARCHAR(20),
    ALTER COLUMN status TYPE VARCHAR(20),
    ALTER COLUMN phone_number TYPE VARCHAR(20);

-- 2. Documents Table
ALTER TABLE documents 
    ALTER COLUMN title TYPE VARCHAR(150),
    ALTER COLUMN file_name TYPE VARCHAR(150),
    ALTER COLUMN status TYPE VARCHAR(20);

-- 3. Password Reset OTPs Table
ALTER TABLE password_reset_otps 
    ALTER COLUMN verification_method TYPE VARCHAR(10),
    ALTER COLUMN phone_number TYPE VARCHAR(50),
    ALTER COLUMN email TYPE VARCHAR(100),
    ALTER COLUMN reference_id TYPE VARCHAR(64),
    ALTER COLUMN otp_hash TYPE VARCHAR(64);

-- 4. Modules Table
ALTER TABLE modules 
    ALTER COLUMN title TYPE VARCHAR(150);

-- 5. Quizzes Table
ALTER TABLE quizzes 
    ALTER COLUMN title TYPE VARCHAR(150),
    ALTER COLUMN source_type TYPE VARCHAR(20),
    ALTER COLUMN difficulty TYPE VARCHAR(20),
    ALTER COLUMN status TYPE VARCHAR(20);

-- 6. Chapters Table
ALTER TABLE chapters 
    ALTER COLUMN title TYPE VARCHAR(150);

-- 7. Questions Table
ALTER TABLE questions 
    ALTER COLUMN type TYPE VARCHAR(20),
    ALTER COLUMN source_chapter TYPE VARCHAR(150),
    ALTER COLUMN difficulty TYPE VARCHAR(20);

-- 8. Topics Table
ALTER TABLE topics 
    ALTER COLUMN title TYPE VARCHAR(150);

COMMIT;

-- Verification query: list updated character limits
SELECT 
    table_name, 
    column_name, 
    character_maximum_length, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND data_type = 'character varying'
ORDER BY table_name, column_name;
