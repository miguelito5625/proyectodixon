-- Esquema para Supabase - FireSafety Ops

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

-- 2. Inspecciones (Control de Inspecciones)
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

-- 3. Logística y Materiales
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

-- 4. Valve Take Off (Técnico)
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

-- 5. Incentivos (Acceso Restringido)
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
