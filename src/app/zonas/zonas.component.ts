import { Component, computed, inject, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../core/services/data.service';
import { Zona } from '../core/models/data.models';
import { Inject } from '@angular/core';

interface ZonaStat extends Zona {
  total_lineas: number;
  promedio_avance: number;
}

@Component({
  selector: 'app-zona-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Editar' : 'Crear' }} Zona</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Proyecto ID (Fijo por ahora = 1)</mat-label>
          <input matInput formControlName="proyecto_id" type="number">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Número de Zona</mat-label>
          <input matInput formControlName="numero_zona" type="number">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nivel</mat-label>
          <input matInput formControlName="nivel">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
      min-width: 300px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class ZonaDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ZonaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Zona | null
  ) {
    this.form = this.fb.group({
      proyecto_id: [data?.proyecto_id || 1, Validators.required],
      numero_zona: [data?.numero_zona || '', Validators.required],
      nivel: [data?.nivel || '', Validators.required]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="zonas-header">
      <div class="header-text">
        <h1>Gestión de Zonas</h1>
        <p>Catálogo de zonas y progreso consolidado.</p>
      </div>
      <button mat-flat-button color="primary" (click)="openDialog()">
        <mat-icon>add</mat-icon>
        Nueva Zona
      </button>
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

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef> Acciones </th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button color="primary" (click)="openDialog(row)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteZona(row.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="5">No se encontraron zonas que coincidan con el filtro "{{input.value}}"</td>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
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
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  displayedColumns: string[] = ['numero_zona', 'nivel', 'total_lineas', 'promedio_avance', 'acciones'];
  dataSource: MatTableDataSource<ZonaStat>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource<ZonaStat>([]);
    
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
          ...z,
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

  openDialog(zona?: Zona) {
    const dialogRef = this.dialog.open(ZonaDialog, {
      width: '400px',
      data: zona || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (zona) {
          this.dataService.updateZona(zona.id, result);
          this.snackBar.open('Zona actualizada', 'Cerrar', { duration: 3000 });
        } else {
          this.dataService.addZona(result);
          this.snackBar.open('Zona creada', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  deleteZona(id: number) {
    if (confirm('Al eliminar esta zona también se borrarán todas sus líneas e inspecciones. ¿Estás seguro?')) {
      this.dataService.deleteZona(id);
      this.snackBar.open('Zona eliminada', 'Cerrar', { duration: 3000 });
    }
  }
}
