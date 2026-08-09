-- Esquema para Supabase - FireSafety Ops (Fase 2)

-- Limpieza de tablas (Fase 2) si existían previamente
DROP TABLE IF EXISTS public.zone_tests;
DROP TABLE IF EXISTS public.trip_tests;
DROP TABLE IF EXISTS public.issues_log;
DROP TABLE IF EXISTS public.electrical_requirements;

-- 1. Pruebas por Zona (PI LOG - IAD 157/158)
CREATE TABLE IF NOT EXISTS public.zone_tests (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(255) NOT NULL,
    visual_date DATE,
    hydro_date DATE,
    thirty_min_date DATE,
    twenty_four_air_date DATE,
    trip_date DATE,
    comments TEXT,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Trips (Pruebas de Disparo - Parámetros Técnicos)
CREATE TABLE IF NOT EXISTS public.trip_tests (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(100) NOT NULL,
    accelerator_yn VARCHAR(10),
    starting_water NUMERIC,
    starting_air NUMERIC,
    time_to_trip NUMERIC,
    air_at_trip NUMERIC,
    wto NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Pendientes (Issues Log)
CREATE TABLE IF NOT EXISTS public.issues_log (
    id SERIAL PRIMARY KEY,
    item_number VARCHAR(50),
    detail TEXT NOT NULL,
    priority VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pendiente',
    responsible VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Eléctrico (Requerimientos)
CREATE TABLE IF NOT EXISTS public.electrical_requirements (
    id SERIAL PRIMARY KEY,
    quantity VARCHAR(50),
    equipment VARCHAR(255),
    location VARCHAR(255),
    voltage VARCHAR(50),
    phase VARCHAR(50),
    hz VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
