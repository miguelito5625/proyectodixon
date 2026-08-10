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

-- 2. Proyectos (Fase 2)
CREATE TABLE IF NOT EXISTS public.proyectos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ahj VARCHAR(255),
    general_contractor VARCHAR(255),
    subcontratista_pci VARCHAR(255),
    permiso_padre VARCHAR(255)
);

-- Insert default project if not exists
INSERT INTO public.proyectos (id, nombre, ahj, general_contractor, subcontratista_pci, permiso_padre)
VALUES (1, '25410 Meadowdale Drive, Chantilly, Virginia 20152 — IAD 158 (Data Center)', 'Loudoun County Fire Marshal''s Office (Plans Review Section)', 'Clark Construction', 'American Fire Systems', 'FIREC-2026-003725 — Rev. 4 aprobada 18/06/2026')
ON CONFLICT (id) DO NOTHING;

-- 3. Inspecciones (Control de Inspecciones Fase 1)
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

-- Vincular inspecciones existentes al proyecto por defecto sin borrarlas
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS proyecto_id INTEGER REFERENCES public.proyectos(id) DEFAULT 1;

-- 4. Estructura Completa (Fase 2 - Zonas, Líneas e Inspecciones Nuevas)
CREATE TABLE IF NOT EXISTS public.zonas (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES public.proyectos(id) ON DELETE CASCADE,
    nivel VARCHAR(100),
    numero_zona INTEGER
);

CREATE TABLE IF NOT EXISTS public.lineas (
    id SERIAL PRIMARY KEY,
    zona_id INTEGER REFERENCES public.zonas(id) ON DELETE CASCADE,
    tipo VARCHAR(100),
    permiso_especifico VARCHAR(255),
    avance_fisico BOOLEAN DEFAULT false,
    porcentaje_completado INTEGER DEFAULT 0,
    notas TEXT
);

CREATE TABLE IF NOT EXISTS public.inspecciones (
    id SERIAL PRIMARY KEY,
    linea_id INTEGER REFERENCES public.lineas(id) ON DELETE CASCADE,
    tipo_prueba VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'Pendiente',
    fecha_inspeccion TIMESTAMP WITH TIME ZONE
);
