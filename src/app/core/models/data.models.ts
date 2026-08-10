export interface Proyecto {
  id: number;
  nombre: string;
  ahj: string;
  general_contractor: string;
  subcontratista_pci: string;
  permiso_padre: string;
}

export interface Zona {
  id: number;
  proyecto_id: number;
  nivel: string;
  numero_zona: number;
}

export interface Linea {
  id: number;
  zona_id: number;
  tipo: string;
  permiso_especifico: string | null;
  avance_fisico: boolean;
  porcentaje_completado: number;
  notas: string | null;
}

export interface Inspeccion {
  id: number;
  linea_id: number;
  tipo_prueba: string;
  estado: string; // 'Aprobado' | 'Pendiente' | 'Rechazado'
  fecha_inspeccion: string | null;
}

export interface DataSeed {
  proyectos: Proyecto[];
  zonas: Zona[];
  lineas: Linea[];
  inspecciones: Inspeccion[];
}
