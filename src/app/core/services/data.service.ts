import { Injectable, computed, signal } from '@angular/core';
import { DataSeed, Inspeccion, Linea, Proyecto, Zona } from '../models/data.models';
// @ts-ignore
import dbSeed from '../../../../extras/db_seed.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private initialData = dbSeed as DataSeed;

  // Signals for local state
  proyectos = signal<Proyecto[]>(this.initialData.proyectos);
  zonas = signal<Zona[]>(this.initialData.zonas);
  lineas = signal<Linea[]>(this.initialData.lineas);
  inspecciones = signal<Inspeccion[]>(this.initialData.inspecciones);

  // Computed properties for the dashboard
  progresoGlobal = computed(() => {
    const lines = this.lineas();
    if (lines.length === 0) return 0;
    const total = lines.reduce((acc, l) => acc + (l.porcentaje_completado || 0), 0);
    return total / lines.length;
  });

  inspeccionesAprobadas = computed(() => {
    return this.inspecciones().filter(i => i.estado === 'Aprobado' || i.estado === 'Aprobada').length;
  });

  totalZonas = computed(() => this.zonas().length);
  totalLineas = computed(() => this.lineas().length);

  // Actions to modify state
  updateInspectionStatus(inspeccionId: number, newState: string, date: string | null = null) {
    this.inspecciones.update(insps => insps.map(insp => {
      if (insp.id === inspeccionId) {
        return { ...insp, estado: newState, fecha_inspeccion: date };
      }
      return insp;
    }));
  }

  updateLineProgress(lineaId: number, progress: number) {
    this.lineas.update(lines => lines.map(line => {
      if (line.id === lineaId) {
        return { ...line, porcentaje_completado: progress };
      }
      return line;
    }));
  }

  updateProyecto(id: number, data: Partial<Proyecto>) {
    this.proyectos.update(projs => projs.map(p => {
      if (p.id === id) {
        return { ...p, ...data };
      }
      return p;
    }));
  }
}
