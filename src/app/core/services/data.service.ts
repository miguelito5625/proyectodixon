import { Injectable, computed, signal, inject } from '@angular/core';
import { DataSeed, Inspeccion, Linea, Proyecto, Zona } from '../models/data.models';
import { SupabaseService } from '../../supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private supabase = inject(SupabaseService);

  proyectos = signal<Proyecto[]>([]);
  
  // Writable signals for all data
  private _zonas = signal<Zona[]>([]);
  private _lineas = signal<Linea[]>([]);
  private _inspecciones = signal<Inspeccion[]>([]);

  // Active project selection
  activeProyectoId = signal<number>(0);

  // Computed signals filtered by active project
  zonas = computed(() => this._zonas().filter(z => z.proyecto_id === this.activeProyectoId()));
  
  constructor() {
    this.loadInitialData();
  }

  async loadInitialData() {
    // 1. Cargar Proyectos
    const { data: pData } = await this.supabase.client.from('proyectos').select('*');
    if (pData) {
      this.proyectos.set(pData);
      if (pData.length > 0) {
        this.activeProyectoId.set(pData[0].id);
      }
    }

    // 2. Cargar Zonas
    const { data: zData } = await this.supabase.client.from('zonas').select('*');
    if (zData) this._zonas.set(zData);

    // 3. Cargar Líneas
    const { data: lData } = await this.supabase.client.from('lineas').select('*');
    if (lData) this._lineas.set(lData);

    // 4. Cargar Inspecciones
    const { data: iData } = await this.supabase.client.from('inspecciones').select('*');
    if (iData) this._inspecciones.set(iData);
  }
  
  lineas = computed(() => {
    const activeZonas = this.zonas().map(z => z.id);
    return this._lineas().filter(l => activeZonas.includes(l.zona_id));
  });

  inspecciones = computed(() => {
    const activeLineas = this.lineas().map(l => l.id);
    return this._inspecciones().filter(i => activeLineas.includes(i.linea_id));
  });

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

  // Proyectos CRUD
  async updateProyecto(id: number, data: Partial<Proyecto>) {
    this.proyectos.update(projs => projs.map(p => p.id === id ? { ...p, ...data } : p));
    await this.supabase.client.from('proyectos').update(data).eq('id', id);
  }

  async addProyecto(proyecto: Omit<Proyecto, 'id'>) {
    const { data, error } = await this.supabase.client.from('proyectos').insert(proyecto).select().single();
    if (data) {
      this.proyectos.update(projs => [...projs, data]);
      if (this.activeProyectoId() === 0) this.activeProyectoId.set(data.id);
    } else {
      console.error(error);
    }
  }

  async deleteProyecto(id: number) {
    this.proyectos.update(projs => projs.filter(p => p.id !== id));
    await this.supabase.client.from('proyectos').delete().eq('id', id);
  }

  // Zonas CRUD
  async addZona(zona: Omit<Zona, 'id'>) {
    const { data, error } = await this.supabase.client.from('zonas').insert(zona).select().single();
    if (data) {
      this._zonas.update(zonas => [...zonas, data]);
    } else {
      console.error(error);
    }
  }

  async updateZona(id: number, data: Partial<Zona>) {
    this._zonas.update(zonas => zonas.map(z => z.id === id ? { ...z, ...data } : z));
    await this.supabase.client.from('zonas').update(data).eq('id', id);
  }

  async deleteZona(id: number) {
    this._zonas.update(zonas => zonas.filter(z => z.id !== id));
    await this.supabase.client.from('zonas').delete().eq('id', id);
    // Cascada: local memory clear
    const lineasToDel = this._lineas().filter(l => l.zona_id === id);
    lineasToDel.forEach(l => {
      this._lineas.update(lines => lines.filter(lx => lx.id !== l.id));
      this._inspecciones.update(insps => insps.filter(i => i.linea_id !== l.id));
    });
  }

  // Lineas CRUD
  async addLinea(linea: Omit<Linea, 'id'>) {
    const { data, error } = await this.supabase.client.from('lineas').insert(linea).select().single();
    if (data) {
      const newLineaId = data.id;
      this._lineas.update(lines => [...lines, data]);
      
      // Auto-generate inspections for the new line
      const pruebas = ['Visual', 'Hidrostática', 'Aire 24h', 'Disparo (Trip)'];
      const newInspections = pruebas.map(prueba => ({
        linea_id: newLineaId,
        tipo_prueba: prueba,
        estado: 'Pendiente',
        fecha_inspeccion: null
      }));
      
      const { data: insData } = await this.supabase.client.from('inspecciones').insert(newInspections).select();
      if (insData) {
        this._inspecciones.update(insps => [...insps, ...insData]);
      }
    } else {
      console.error(error);
    }
  }

  async updateLinea(id: number, data: Partial<Linea>) {
    this._lineas.update(lines => lines.map(l => l.id === id ? { ...l, ...data } : l));
    await this.supabase.client.from('lineas').update(data).eq('id', id);
  }

  async updateLineProgress(lineaId: number, progress: number) {
    this.updateLinea(lineaId, { porcentaje_completado: progress });
  }

  async deleteLinea(id: number) {
    this._lineas.update(lines => lines.filter(l => l.id !== id));
    await this.supabase.client.from('lineas').delete().eq('id', id);
    this._inspecciones.update(insps => insps.filter(i => i.linea_id !== id));
  }

  // Inspecciones CRUD
  async addInspeccion(inspeccion: Omit<Inspeccion, 'id'>) {
    const { data } = await this.supabase.client.from('inspecciones').insert(inspeccion).select().single();
    if (data) {
      this._inspecciones.update(insps => [...insps, data]);
    }
  }

  async updateInspeccion(id: number, data: Partial<Inspeccion>) {
    this._inspecciones.update(insps => insps.map(i => i.id === id ? { ...i, ...data } : i));
    await this.supabase.client.from('inspecciones').update(data).eq('id', id);
  }
  
  async updateInspectionStatus(inspeccionId: number, newState: string, date: string | null = null) {
    this.updateInspeccion(inspeccionId, { estado: newState, fecha_inspeccion: date });
  }

  async deleteInspeccion(id: number) {
    this._inspecciones.update(insps => insps.filter(i => i.id !== id));
    await this.supabase.client.from('inspecciones').delete().eq('id', id);
  }
}
