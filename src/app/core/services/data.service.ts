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
    this.proyectos.update(projs => projs.map(p => p.id === id ? { ...p, ...data } : p));
  }

  addProyecto(proyecto: Omit<Proyecto, 'id'>) {
    this.proyectos.update(projs => [...projs, { ...proyecto, id: this.generateId(projs) }]);
  }

  deleteProyecto(id: number) {
    this.proyectos.update(projs => projs.filter(p => p.id !== id));
    // We could cascade delete zonas of this proyecto if we want, but for now just the project
  }

  // Zonas CRUD
  addZona(zona: Omit<Zona, 'id'>) {
    this.zonas.update(zonas => [...zonas, { ...zona, id: this.generateId(zonas) }]);
  }

  updateZona(id: number, data: Partial<Zona>) {
    this.zonas.update(zonas => zonas.map(z => z.id === id ? { ...z, ...data } : z));
  }

  deleteZona(id: number) {
    this.zonas.update(zonas => zonas.filter(z => z.id !== id));
    // Cascade delete lineas
    const lineasToDel = this.lineas().filter(l => l.zona_id === id);
    lineasToDel.forEach(l => this.deleteLinea(l.id));
  }

  // Lineas CRUD
  addLinea(linea: Omit<Linea, 'id'>) {
    const newLineaId = this.generateId(this.lineas());
    this.lineas.update(lines => [...lines, { ...linea, id: newLineaId }]);
    
    // Auto-generate inspections
    const pruebas = ['Visual', 'Hidrostática', 'Aire 24h', 'Disparo (Trip)'];
    const newInspections = pruebas.map(prueba => ({
      id: 0, // will be replaced
      linea_id: newLineaId,
      tipo_prueba: prueba,
      estado: 'Pendiente',
      fecha_inspeccion: null
    }));
    
    this.inspecciones.update(insps => {
      let maxId = this.generateId(insps);
      const generated = newInspections.map(i => ({ ...i, id: maxId++ }));
      return [...insps, ...generated];
    });
  }

  updateLinea(id: number, data: Partial<Linea>) {
    this.lineas.update(lines => lines.map(l => l.id === id ? { ...l, ...data } : l));
  }

  deleteLinea(id: number) {
    this.lineas.update(lines => lines.filter(l => l.id !== id));
    // Cascade delete inspections
    this.inspecciones.update(insps => insps.filter(i => i.linea_id !== id));
  }

  // Inspecciones CRUD
  addInspeccion(inspeccion: Omit<Inspeccion, 'id'>) {
    this.inspecciones.update(insps => [...insps, { ...inspeccion, id: this.generateId(insps) }]);
  }

  updateInspeccion(id: number, data: Partial<Inspeccion>) {
    this.inspecciones.update(insps => insps.map(i => i.id === id ? { ...i, ...data } : i));
  }

  deleteInspeccion(id: number) {
    this.inspecciones.update(insps => insps.filter(i => i.id !== id));
  }

  private generateId(items: any[]): number {
    return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  }
}
