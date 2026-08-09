-- Esquema Consolidado para Supabase - FireSafety Ops (Fases 1 y 2)

-- Limpieza de tablas (Fase 2) si existían previamente
DROP TABLE IF EXISTS public.zone_tests;
DROP TABLE IF EXISTS public.trip_tests;
DROP TABLE IF EXISTS public.issues_log;
DROP TABLE IF EXISTS public.electrical_requirements;

-- 1. Catálogos
CREATE TABLE IF NOT EXISTS public.areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.inspection_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.inspectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) -- Optional link to auth
);

-- 2. Inspecciones (Control de Inspecciones Fase 1)
CREATE TABLE IF NOT EXISTS public.inspections (
    id SERIAL PRIMARY KEY,
    element VARCHAR(255) NOT NULL,
    area_id INTEGER REFERENCES public.areas(id),
    level_id INTEGER REFERENCES public.levels(id),
    type_id INTEGER REFERENCES public.inspection_types(id),
    inspector_id INTEGER REFERENCES public.inspectors(id),
    scheduled_date DATE,
    executed_date DATE,
    status VARCHAR(50) DEFAULT 'Pendiente',
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Pruebas por Zona (PI LOG - IAD 157/158 - Fase 2)
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

-- 4. Trips (Pruebas de Disparo - Parámetros Técnicos - Fase 2)
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

-- 5. Pendientes (Issues Log - Fase 2)
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

-- 6. Eléctrico (Requerimientos - Fase 2)
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

-- 7. Logística y Materiales
CREATE TABLE IF NOT EXISTS public.materials (
    id SERIAL PRIMARY KEY,
    submittal_number VARCHAR(100),
    description TEXT,
    model VARCHAR(100),
    lead_time_weeks INTEGER,
    required_onsite_date DATE,
    required_release_date DATE,
    actual_release_date DATE,
    expected_delivery DATE,
    po_number VARCHAR(100),
    issues_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Valve Take Off (Técnico)
CREATE TABLE IF NOT EXISTS public.valve_configs (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(100),
    valve_size VARCHAR(50),
    valve_type VARCHAR(50),
    system_cap VARCHAR(50),
    room VARCHAR(100),
    conversion_kit BOOLEAN,
    addt_bfv_required BOOLEAN,
    test_header_valve BOOLEAN,
    amd_needed BOOLEAN,
    accelerator INTEGER,
    smallest_k_factor VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Incentivos (Acceso Restringido)
CREATE TABLE IF NOT EXISTS public.labor_incentives (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(100),
    bid_heads INTEGER,
    actual_heads INTEGER,
    hours_logged NUMERIC,
    target_cost NUMERIC,
    site_super_incentive NUMERIC,
    foreman_incentive NUMERIC,
    fitter_incentive NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) para ocultar incentivos a usuarios normales
ALTER TABLE public.labor_incentives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow managers full access to incentives" 
ON public.labor_incentives 
FOR ALL 
TO authenticated 
USING ( (SELECT auth.jwt() ->> 'role') = 'manager' );
