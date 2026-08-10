import { Component, OnInit, inject, ViewChild, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InspectionDialog, InspectionDialogData, EnrichedInspeccion } from './inspection-dialog';
import { DataService } from '../core/services/data.service';

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [DatePipe],
  template: `
    <div class="header-container">
      <div class="title-group">
        <h1>Catálogo General de Inspecciones</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nueva
        </button>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Buscar (Zona, Línea, Prueba)</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Visual..." #input>
      </mat-form-field>
    </div>

    <div class="mat-elevation-z8 table-container">
      <table mat-table [dataSource]="dataSource" matSort>

        <ng-container matColumnDef="zona">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Zona / Nivel </th>
          <td mat-cell *matCellDef="let row"> 
            <strong>{{ row.zona_nombre || 'Desconocida' }}</strong>
          </td>
        </ng-container>

        <ng-container matColumnDef="linea">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Línea (Tipo) </th>
          <td mat-cell *matCellDef="let row"> 
            {{ row.linea_nombre || 'Desconocida' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="prueba">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Prueba </th>
          <td mat-cell *matCellDef="let row"> 
            <strong>{{ row.tipo_prueba }}</strong>
          </td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
          <td mat-cell *matCellDef="let row">
            <span class="status-label" [ngClass]="getStatusClass(row.status || row.estado)">
              {{row.estado || 'Pendiente'}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha </th>
          <td mat-cell *matCellDef="let row"> {{ (row.fecha_inspeccion | date:'dd/MM/yyyy') || '--' }} </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Acciones </th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button color="primary" (click)="openDialog(row)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteInspeccion(row.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="6" style="text-align: center; padding: 24px;">
            No hay inspecciones que coincidan con "{{input.value}}"
          </td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
    </div>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .title-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-group h1 {
      margin: 0;
    }

    .table-container {
      overflow: auto;
      border-radius: 8px;
    }

    table {
      width: 100%;
    }
  `]
})
export class Inspections implements OnInit {
  displayedColumns: string[] = [
    'zona',
    'linea',
    'prueba', 
    'estado', 
    'fecha', 
    'actions'
  ];
  dataSource: MatTableDataSource<EnrichedInspeccion>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public dataService = inject(DataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  // Catalogo de líneas para el modal de añadir
  private lineasParaModal: any[] = [];

  constructor() {
    this.dataSource = new MatTableDataSource();
    
    // Auto-update table when data changes
    effect(() => {
      const insps = this.dataService.inspecciones();
      const lineas = this.dataService.lineas();
      const zonas = this.dataService.zonas();
      
      const enriched: EnrichedInspeccion[] = insps.map(i => {
        const linea = lineas.find(l => l.id === i.linea_id);
        const zona = linea ? zonas.find(z => z.id === linea.zona_id) : undefined;
        
        return {
          ...i,
          linea_nombre: linea ? linea.tipo : 'Desconocida',
          zona_nombre: zona ? `Zona ${zona.numero_zona} (${zona.nivel})` : 'Desconocida'
        };
      });
      
      this.dataSource.data = enriched;
      
      // Update lineasParaModal
      this.lineasParaModal = lineas.map(l => {
        const z = zonas.find(zona => zona.id === l.zona_id);
        const zName = z ? `Zona ${z.numero_zona} (${z.nivel})` : 'Zona Desconocida';
        return {
          id: l.id,
          nombreLargo: `${zName} - ${l.tipo}`
        };
      });
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Set custom filter to search through nested object strings
    this.dataSource.filterPredicate = (data: EnrichedInspeccion, filter: string) => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return currentTerm + (data as any)[key] + '◬';
      }, '').toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('aprobado') || s.includes('approved') || s.includes('ok')) {
      return 'status-aprobado';
    } else if (s.includes('rechazado') || s.includes('rejected') || s.includes('reprobada')) {
      return 'status-rechazado';
    } else if (s.includes('progreso') || s.includes('progress')) {
      return 'status-en-progreso';
    }
    return 'status-pendiente';
  }

  openDialog(inspection?: EnrichedInspeccion) {
    const dialogRef = this.dialog.open(InspectionDialog, {
      width: '600px',
      data: {
        inspection: inspection || null,
        lineas: this.lineasParaModal
      } as InspectionDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.dataService.updateInspeccion(result.id, result);
          this.snackBar.open('Inspección actualizada', 'Cerrar', { duration: 3000 });
        } else {
          this.dataService.addInspeccion(result);
          this.snackBar.open('Inspección creada', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
  
  deleteInspeccion(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta inspección?')) {
      this.dataService.deleteInspeccion(id);
      this.snackBar.open('Inspección eliminada', 'Cerrar', { duration: 3000 });
    }
  }
}
