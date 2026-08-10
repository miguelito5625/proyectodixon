import { Component, computed, inject, ViewChild, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { DataService } from '../core/services/data.service';

interface ZonaStat {
  id: number;
  numero_zona: number;
  nivel: string;
  total_lineas: number;
  promedio_avance: number;
}

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatCardModule
  ],
  template: `
    <div class="zonas-header">
      <h1>Gestión de Zonas</h1>
      <p>Vista general de las zonas del proyecto y su progreso consolidado.</p>
    </div>

    <mat-card class="zonas-card">
      <mat-card-content>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filtrar zonas (ej. Nivel 1)</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Escribe para buscar..." #input>
        </mat-form-field>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="zonas-table">
            
            <ng-container matColumnDef="numero_zona">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Número de Zona </th>
              <td mat-cell *matCellDef="let row"> Zona {{row.numero_zona}} </td>
            </ng-container>

            <ng-container matColumnDef="nivel">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Nivel </th>
              <td mat-cell *matCellDef="let row"> {{row.nivel}} </td>
            </ng-container>

            <ng-container matColumnDef="total_lineas">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Total Líneas </th>
              <td mat-cell *matCellDef="let row"> {{row.total_lineas}} </td>
            </ng-container>

            <ng-container matColumnDef="promedio_avance">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Avance (%) </th>
              <td mat-cell *matCellDef="let row"> 
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" [style.width.%]="row.promedio_avance * 100"></div>
                </div>
                <span class="progress-text">{{ (row.promedio_avance * 100).toFixed(1) }}%</span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="4">No se encontraron zonas que coincidan con el filtro "{{input.value}}"</td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .zonas-header {
      margin-bottom: 24px;
    }
    .zonas-header h1 {
      margin: 0;
      color: var(--primary-color);
    }
    .zonas-header p {
      margin: 4px 0 0;
      color: var(--text-secondary);
    }
    .zonas-card {
      border-radius: 12px;
      padding: 8px;
    }
    .filter-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 8px;
    }
    .table-container {
      overflow-x: auto;
    }
    .zonas-table {
      width: 100%;
    }
    
    .progress-bar-bg {
      width: 120px;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }
    .progress-bar-fill {
      height: 100%;
      background-color: var(--primary-color);
    }
    .progress-text {
      font-size: 13px;
      color: var(--text-secondary);
      vertical-align: middle;
    }
  `]
})
export class ZonasComponent {
  public dataService = inject(DataService);
  
  displayedColumns: string[] = ['numero_zona', 'nivel', 'total_lineas', 'promedio_avance'];
  dataSource: MatTableDataSource<ZonaStat>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource<ZonaStat>([]);
    
    // Create an effect to watch for signal changes and update the table
    effect(() => {
      const zonas = this.dataService.zonas();
      const lineas = this.dataService.lineas();
      
      const stats: ZonaStat[] = zonas.map(z => {
        const lineasDeZona = lineas.filter(l => l.zona_id === z.id);
        const totalLineas = lineasDeZona.length;
        let promedio = 0;
        
        if (totalLineas > 0) {
          const sumProgreso = lineasDeZona.reduce((acc, l) => acc + (l.porcentaje_completado || 0), 0);
          promedio = sumProgreso / totalLineas;
        }
        
        return {
          id: z.id,
          numero_zona: z.numero_zona,
          nivel: z.nivel,
          total_lineas: totalLineas,
          promedio_avance: promedio
        };
      });
      
      this.dataSource.data = stats;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
