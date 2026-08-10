import { Component, computed, inject, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../core/services/data.service';
import { Linea } from '../core/models/data.models';
import { LineaDialog, NoteDialog } from '../dashboard/dashboard';

interface EnrichedLinea extends Linea {
  zona_nombre: string;
}

@Component({
  selector: 'app-lineas',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="lineas-header">
      <div class="header-text">
        <h1>Gestión de Líneas</h1>
        <p>Catálogo de líneas, permisos y avance físico.</p>
      </div>
    </div>

    <mat-card class="lineas-card">
      <mat-card-content>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filtrar líneas (ej. Altas, Permiso...)</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Escribe para buscar..." #input>
        </mat-form-field>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="lineas-table">
            
            <ng-container matColumnDef="zona">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Zona </th>
              <td mat-cell *matCellDef="let row"> <strong>{{row.zona_nombre}}</strong> </td>
            </ng-container>

            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Tipo de Línea </th>
              <td mat-cell *matCellDef="let row"> {{row.tipo}} </td>
            </ng-container>

            <ng-container matColumnDef="permiso">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Permiso Específico </th>
              <td mat-cell *matCellDef="let row">
                <span class="permiso-badge" *ngIf="row.permiso_especifico">{{row.permiso_especifico}}</span>
                <span class="text-disabled" *ngIf="!row.permiso_especifico">N/A</span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="avance">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Avance Físico </th>
              <td mat-cell *matCellDef="let row">
                <mat-icon [class.text-success]="row.avance_fisico" [class.text-disabled]="!row.avance_fisico">
                  {{ row.avance_fisico ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="porcentaje">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> % Completado </th>
              <td mat-cell *matCellDef="let row"> 
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" [style.width.%]="(row.porcentaje_completado || 0) * 100"></div>
                </div>
                <span class="progress-text">{{ ((row.porcentaje_completado || 0) * 100).toFixed(0) }}%</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef> Acciones </th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button color="primary" (click)="openNotes(row.notas)" matTooltip="Ver Notas">
                  <mat-icon>comment</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="openDialog(row.zona_id, row)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteLinea(row.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="6" style="text-align:center; padding:24px;">
                No se encontraron líneas que coincidan con el filtro "{{input.value}}"
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .lineas-header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .lineas-header h1 { margin: 0; color: var(--primary-color); }
    .lineas-header p { margin: 4px 0 0; color: var(--text-secondary); }
    .lineas-card { border-radius: 12px; padding: 8px; }
    .filter-field { width: 100%; max-width: 400px; margin-bottom: 8px; }
    .table-container { overflow-x: auto; }
    .lineas-table { width: 100%; min-width: 800px; }
    .text-success { color: var(--status-aprobado); }
    .text-disabled { color: #bdbdbd; }
    .permiso-badge {
      background-color: #e3f2fd;
      color: #1565c0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .progress-bar-bg {
      width: 80px; height: 8px; background-color: #e0e0e0; border-radius: 4px;
      overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 8px;
    }
    .progress-bar-fill { height: 100%; background-color: var(--primary-color); }
    .progress-text { font-size: 13px; color: var(--text-secondary); vertical-align: middle; }
  `]
})
export class LineasComponent {
  public dataService = inject(DataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  displayedColumns: string[] = ['zona', 'tipo', 'permiso', 'avance', 'porcentaje', 'acciones'];
  dataSource: MatTableDataSource<EnrichedLinea>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource<EnrichedLinea>([]);
    
    effect(() => {
      const lineas = this.dataService.lineas();
      const zonas = this.dataService.zonas();
      
      const enriched: EnrichedLinea[] = lineas.map(l => {
        const zona = zonas.find(z => z.id === l.zona_id);
        return {
          ...l,
          zona_nombre: zona ? 'Zona ' + zona.numero_zona + ' (' + zona.nivel + ')' : 'Desconocida'
        };
      });
      
      this.dataSource.data = enriched;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: EnrichedLinea, filter: string) => {
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

  openNotes(notas: string | null) {
    this.dialog.open(NoteDialog, {
      width: '400px',
      data: { notas: notas || 'No hay notas registradas para esta línea.' }
    });
  }

  openDialog(zonaId: number, linea?: Linea) {
    const dialogRef = this.dialog.open(LineaDialog, {
      width: '400px',
      data: { zonaId, linea: linea || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (linea) {
          this.dataService.updateLinea(linea.id, result);
          this.snackBar.open('Línea actualizada', 'Cerrar', { duration: 3000 });
        } else {
          this.dataService.addLinea(result);
          this.snackBar.open('Línea creada', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  deleteLinea(id: number) {
    if (confirm('Al eliminar esta línea se borrarán sus inspecciones. ¿Estás seguro?')) {
      this.dataService.deleteLinea(id);
      this.snackBar.open('Línea eliminada', 'Cerrar', { duration: 3000 });
    }
  }
}
