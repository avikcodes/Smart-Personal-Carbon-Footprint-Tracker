-- Database Schema for Carbon Footprint Tracking App
-- PostgreSQL Compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily logs table
-- Groups entries by date and stores aggregated data
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    total_transport_footprint_kg DECIMAL(12, 4) DEFAULT 0,
    total_food_footprint_kg DECIMAL(12, 4) DEFAULT 0,
    total_energy_footprint_kg DECIMAL(12, 4) DEFAULT 0,
    total_carbon_footprint_kg DECIMAL(12, 4) GENERATED ALWAYS AS (
        total_transport_footprint_kg + total_food_footprint_kg + total_energy_footprint_kg
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, log_date)
);

-- 3. Transportation entries table
CREATE TABLE transportation_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    mode TEXT NOT NULL, -- e.g., 'car', 'bus', 'train', 'flight'
    distance DECIMAL(12, 4) NOT NULL,
    distance_unit TEXT NOT NULL DEFAULT 'km', -- e.g., 'km', 'miles'
    carbon_footprint_kg DECIMAL(12, 4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Food consumption entries table
CREATE TABLE food_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    food_type TEXT NOT NULL, -- e.g., 'beef', 'chicken', 'vegetables', 'dairy'
    quantity DECIMAL(12, 4) NOT NULL,
    quantity_unit TEXT NOT NULL, -- e.g., 'kg', 'servings'
    carbon_footprint_kg DECIMAL(12, 4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Energy usage entries table
CREATE TABLE energy_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    energy_type TEXT NOT NULL, -- e.g., 'electricity', 'gas', 'heating'
    kwh DECIMAL(12, 4) NOT NULL,
    carbon_footprint_kg DECIMAL(12, 4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date);
CREATE INDEX idx_transp_log_id ON transportation_entries(log_id);
CREATE INDEX idx_food_log_id ON food_entries(log_id);
CREATE INDEX idx_energy_log_id ON energy_entries(log_id);

-- Trigger to update updated_at on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
