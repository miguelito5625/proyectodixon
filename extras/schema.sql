-- Esquema Consolidado para Supabase - FireSafety Ops (Fases 1)

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
