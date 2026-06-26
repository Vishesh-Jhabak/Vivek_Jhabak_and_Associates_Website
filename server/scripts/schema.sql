-- =========================================================================
-- VIVEK JHABAK & ASSOCIATES - SUPABASE POSTGRESQL TABLES SCHEMAS
-- =========================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Taxation',
    icon TEXT NOT NULL DEFAULT 'percent',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Pricing Plans Table
CREATE TABLE IF NOT EXISTS pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for time-slot booking checks
CREATE INDEX IF NOT EXISTS idx_appointments_date_timeslot ON appointments(date, time_slot);

-- 4. Jobs (Vacancies) Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Taxation & Auditing',
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    type TEXT NOT NULL DEFAULT 'Full-time' CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
    location TEXT NOT NULL DEFAULT 'Nawapara, Rajim',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Applicants Table (Referencing Jobs)
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    resume_path TEXT NOT NULL,
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Messages (Contact Forms) Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
