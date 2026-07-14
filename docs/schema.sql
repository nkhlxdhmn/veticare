-- =========================================================================
-- VetiCare Production Database Schema (PostgreSQL 14+)
-- Refined by: Staff Backend Engineer & ML Engineer
-- Optimized for: FastAPI (SQLAlchemy ORM), PostgreSQL performance, and Supabase security
-- =========================================================================

-- =========================================================================
-- 0. SYSTEM CONFIGURATION & EXTENSIONS
-- =========================================================================

-- Enable citext (case-insensitive text) for email lookups to guarantee uniqueness 
-- regardless of casing, without requiring complex index expressions.
CREATE EXTENSION IF NOT EXISTS "citext";

-- =========================================================================
-- 1. DATABASE TRIGGERS & UTILITY FUNCTIONS
-- =========================================================================

-- Standardized trigger function to dynamically keep updated_at columns in sync.
-- Guaranteed execution at database transaction level to prevent drift from app logic.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 2. TABLE DEFINITIONS
-- =========================================================================

-- -------------------------------------------------------------------------
-- TABLE: users
-- -------------------------------------------------------------------------
CREATE TABLE users (
    -- Native gen_random_uuid() is used (PostgreSQL 13+) to remove external 
    -- extension dependencies like uuid-ossp.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Using CITEXT for email to enforce case-insensitivity at the database level.
    email CITEXT NOT NULL UNIQUE,
    
    -- Store as TEXT to handle variable length password hashing algorithms 
    -- (e.g., Argon2id or Bcrypt) without risk of truncation.
    hashed_password TEXT NOT NULL,
    
    -- Enforce alphanumeric lowercase usernames to prevent spoofing or route confusion.
    username VARCHAR(30) NOT NULL UNIQUE,
    
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Domain Validation Constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_username_format CHECK (username ~ '^[a-z0-9_.-]{3,30}$')
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- TABLE: pets
-- -------------------------------------------------------------------------
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    species VARCHAR(50) NOT NULL, -- e.g., Dog, Cat, Cow, Buffalo
    breed VARCHAR(50),
    gender VARCHAR(20) DEFAULT 'Unknown' NOT NULL,
    weight NUMERIC(5, 2), -- weight in kg/lbs
    date_of_birth DATE, -- dynamic age calculation source
    image_url TEXT, -- Supabase Storage URL
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints & Foreign Keys
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_pet_dob CHECK (date_of_birth <= CURRENT_DATE),
    CONSTRAINT chk_pet_weight CHECK (weight >= 0.00),
    CONSTRAINT chk_pet_gender CHECK (gender IN ('Male', 'Female', 'Unknown')),
    CONSTRAINT chk_pet_species CHECK (species IN ('Dog', 'Cat', 'Cow', 'Buffalo', 'Sheep', 'Goat', 'Horse', 'Pig', 'Rabbit', 'Other'))
);

CREATE TRIGGER trg_pets_updated_at
    BEFORE UPDATE ON pets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- TABLE: vaccinations
-- -------------------------------------------------------------------------
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    date_administered DATE NOT NULL,
    next_due_date DATE,
    clinic_name VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints & Foreign Keys
    CONSTRAINT fk_vaccinations_pet FOREIGN KEY (pet_id) 
        REFERENCES pets(id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_dates CHECK (next_due_date IS NULL OR next_due_date >= date_administered)
);

CREATE TRIGGER trg_vaccinations_updated_at
    BEFORE UPDATE ON vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- TABLE: predictions
-- -------------------------------------------------------------------------
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL,
    
    -- JSONB for flexible symptoms storage (allows severity models/objects in future).
    symptoms JSONB NOT NULL, 
    predicted_disease VARCHAR(100) NOT NULL,
    
    -- Double precision confidence ratio (e.g. 0.94 instead of 94.00)
    confidence DOUBLE PRECISION NOT NULL, 
    dangerous BOOLEAN DEFAULT FALSE NOT NULL,
    model_version VARCHAR(50) NOT NULL, -- e.g. RandomForest-v1
    processing_time_ms INTEGER NOT NULL, -- latency metrics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints & Foreign Keys
    CONSTRAINT fk_predictions_pet FOREIGN KEY (pet_id) 
        REFERENCES pets(id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_confidence CHECK (confidence BETWEEN 0.0 AND 1.0),
    CONSTRAINT chk_processing_time CHECK (processing_time_ms >= 0)
);

CREATE TRIGGER trg_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- TABLE: contacts
-- -------------------------------------------------------------------------
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Nullable to support guest form submissions
    name VARCHAR(100) NOT NULL,
    email CITEXT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL, -- OPEN, IN_PROGRESS, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints & Foreign Keys
    CONSTRAINT fk_contacts_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_contacts_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_contact_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED'))
);

CREATE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 3. INDEXES FOR PERFORMANCE & SCALE
-- =========================================================================

-- Composite index to optimize user profiles listing pets sorted by name.
CREATE INDEX idx_pets_owner_name ON pets (owner_id, name);

-- Optimizes filtering by animal species for aggregate reporting.
CREATE INDEX idx_pets_species ON pets (species);

-- Composite index covering pet medical history queries sorted chronologically.
CREATE INDEX idx_vaccinations_pet_date ON vaccinations (pet_id, date_administered DESC);

-- Index on vaccine reminders/due dates.
CREATE INDEX idx_vaccinations_next_due ON vaccinations (next_due_date) WHERE next_due_date IS NOT NULL;

-- Composite index to retrieve prediction lists for individual pets.
CREATE INDEX idx_predictions_pet_created ON predictions (pet_id, created_at DESC);

-- GIN (Generalized Inverted Index) on symptoms JSONB array.
-- Employs jsonb_path_ops to optimize key-value searches within flexible documents.
CREATE INDEX idx_predictions_symptoms_gin ON predictions USING gin (symptoms jsonb_path_ops);

-- Composite index to optimize inquiries searches by users.
CREATE INDEX idx_contacts_user_created ON contacts (user_id, created_at DESC);

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) FOR SUPABASE ENVIRONMENT
-- =========================================================================

-- Enable RLS on all tables to ensure secure access.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
