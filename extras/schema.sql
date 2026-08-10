-- Esquema Oficial FireSafety Ops (Alineado con db_seed.json)

CREATE TABLE IF NOT EXISTS public.proyectos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ahj VARCHAR(255),
    general_contractor VARCHAR(255),
    subcontratista_pci VARCHAR(255),
    permiso_padre VARCHAR(255)
);

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
