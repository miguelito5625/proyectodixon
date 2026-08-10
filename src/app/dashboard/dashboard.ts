import { Component, computed, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../core/services/data.service';
import { Inspeccion, Linea, Zona } from '../core/models/data.models';
import { Inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-date-picker-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Fecha de Inspección</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%; margin-top: 8px;">
        <mat-label>Seleccione una fecha</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate">
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="selectedDate" [disabled]="!selectedDate">Guardar</button>
    </mat-dialog-actions>
  `
})
export class DatePickerDialog {
  selectedDate: Date = new Date();
}

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Notas de Línea</h2>
    <mat-dialog-content>
      <p style="white-space: pre-wrap; line-height: 1.5;">{{ data.notas }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">Cerrar</button>
    </mat-dialog-actions>
  `
})
export class NoteDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { notas: string }) {}
}

@Component({
  selector: 'app-inspection-dropdown',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, FormsModule],
  template: `
    @if (inspeccion) {
      <mat-form-field appearance="outline" class="status-dropdown" [ngClass]="getStatusClass(inspeccion.estado)">
        <mat-select [ngModel]="inspeccion.estado" (ngModelChange)="onStatusChange($event)">
          <mat-option value="Pendiente">Pendiente</mat-option>
          <mat-option value="Aprobado">Aprobado</mat-option>
          <mat-option value="Rechazado">Rechazado</mat-option>
        </mat-select>
      </mat-form-field>
      @if (inspeccion.fecha_inspeccion) {
        <div class="date-label">
          {{ inspeccion.fecha_inspeccion | date:'shortDate' }}
        </div>
      }
    } @else {
      <span class="text-disabled">N/A</span>
    }
  `,
  styles: [`
    .status-dropdown {
      width: 120px;
    }
    .status-dropdown .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    .status-aprobado-field {
      --mdc-outlined-text-field-outline-color: var(--status-aprobado);
      --mdc-outlined-text-field-focus-outline-color: var(--status-aprobado);
    }
    .status-pendiente-field {
      --mdc-outlined-text-field-outline-color: var(--status-pendiente);
      --mdc-outlined-text-field-focus-outline-color: var(--status-pendiente);
    }
    .status-rechazado-field {
      --mdc-outlined-text-field-outline-color: var(--status-rechazado);
      --mdc-outlined-text-field-focus-outline-color: var(--status-rechazado);
    }
    .date-label {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 4px;
      text-align: center;
    }
  `]
})
export class InspectionDropdown {
  @Input() inspeccion?: Inspeccion;
  
  private dataService = inject(DataService);
  private dialog = inject(MatDialog);

  getStatusClass(estado: string) {
    if (estado === 'Aprobado' || estado === 'Aprobada') return 'status-aprobado-field';
    if (estado === 'Pendiente') return 'status-pendiente-field';
    if (estado === 'Rechazado' || estado === 'Reprobada') return 'status-rechazado-field';
    return '';
  }

  onStatusChange(newState: string) {
    if (!this.inspeccion) return;
    
    if (newState === 'Aprobado') {
      const dialogRef = this.dialog.open(DatePickerDialog, {
        width: '350px'
      });
      dialogRef.afterClosed().subscribe(date => {
        if (date) {
          this.dataService.updateInspectionStatus(this.inspeccion!.id, newState, date.toISOString());
        }
      });
    } else {
      this.dataService.updateInspectionStatus(this.inspeccion.id, newState, null);
    }
  }
}

@Component({
  selector: 'app-linea-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data?.linea?.id ? 'Editar' : 'Añadir' }} Línea a Zona {{data?.zonaId}}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
        <mat-form-field appearance="outline">
          <mat-label>Tipo (ej. Altas, Bajas)</mat-label>
          <input matInput formControlName="tipo">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Permiso Específico</mat-label>
          <input matInput formControlName="permiso_especifico">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Notas iniciales</mat-label>
          <textarea matInput formControlName="notas" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `
})
export class LineaDialog {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<LineaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { zonaId: number, linea: Linea | null }
  ) {
    this.form = this.fb.group({
      zona_id: [data.zonaId],
      tipo: [data.linea?.tipo || '', Validators.required],
      permiso_especifico: [data.linea?.permiso_especifico || ''],
      avance_fisico: [data.linea?.avance_fisico || false],
      porcentaje_completado: [data.linea?.porcentaje_completado || 0],
      notas: [data.linea?.notas || '']
    });
  }
  save() { if (this.form.valid) this.dialogRef.close(this.form.value); }
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    InspectionDropdown
  ],
  template: `
    <div class="dashboard-header">
      <h1>Panel de Control</h1>
      <p>Resumen de progreso e inspecciones</p>
    </div>

    <div class="summary-cards">
      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>Zonas Totales</mat-card-title>
          <mat-icon class="card-icon" color="primary">map</mat-icon>
        </mat-card-header>
        <mat-card-content>
          <h2 class="card-value">{{ dataService.totalZonas() }}</h2>
        </mat-card-content>
      </mat-card>

      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>Líneas Totales</mat-card-title>
          <mat-icon class="card-icon" color="primary">timeline</mat-icon>
        </mat-card-header>
        <mat-card-content>
          <h2 class="card-value">{{ dataService.totalLineas() }}</h2>
        </mat-card-content>
      </mat-card>

      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>Progreso Global</mat-card-title>
          <mat-icon class="card-icon" color="primary">trending_up</mat-icon>
        </mat-card-header>
        <mat-card-content>
          <h2 class="card-value">{{ (dataService.progresoGlobal() * 100).toFixed(1) }}%</h2>
        </mat-card-content>
      </mat-card>

      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>Insp. Aprobadas</mat-card-title>
          <mat-icon class="card-icon" color="primary">check_circle</mat-icon>
        </mat-card-header>
        <mat-card-content>
          <h2 class="card-value">{{ dataService.inspeccionesAprobadas() }}</h2>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="grid-section">
      <h2>Zonas y Líneas</h2>
      
      <mat-accordion multi>
        @for (zona of dataService.zonas(); track zona.id) {
          <mat-expansion-panel class="zona-panel">
            <mat-expansion-panel-header>
              <mat-panel-title style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <strong>Zona {{ zona.numero_zona }} ({{ zona.nivel }})</strong>
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <div style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
              <button mat-button color="primary" (click)="openLineaDialog(zona.id)">
                <mat-icon>add</mat-icon> Añadir Línea
              </button>
            </div>

            <div class="lineas-container">
              <table class="lineas-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Permiso</th>
                    <th>Avance Físico</th>
                    <th>% Completado</th>
                    <th>Visual</th>
                    <th>Hidrostática</th>
                    <th>Aire 24h</th>
                    <th>Disparo (Trip)</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (linea of getLineasForZona(zona.id); track linea.id) {
                    <tr>
                      <td>{{ linea.tipo }}</td>
                      <td>{{ linea.permiso_especifico || 'N/A' }}</td>
                      <td>
                        <mat-icon [class.text-success]="linea.avance_fisico" [class.text-disabled]="!linea.avance_fisico">
                          {{ linea.avance_fisico ? 'check_circle' : 'cancel' }}
                        </mat-icon>
                      </td>
                      <td>
                        <mat-form-field appearance="outline" class="dense-field progress-field">
                          <input matInput type="number" min="0" max="1" step="0.1" 
                                 [ngModel]="linea.porcentaje_completado" 
                                 (ngModelChange)="updateProgress(linea.id, $event)">
                        </mat-form-field>
                      </td>
                      
                      <!-- Tests columns -->
                      <td>
                        <app-inspection-dropdown [inspeccion]="getInspection(linea.id, 'Visual')"></app-inspection-dropdown>
                      </td>
                      <td>
                        <app-inspection-dropdown [inspeccion]="getInspection(linea.id, 'Hidrostática')"></app-inspection-dropdown>
                      </td>
                      <td>
                        <app-inspection-dropdown [inspeccion]="getInspection(linea.id, 'Aire 24h')"></app-inspection-dropdown>
                      </td>
                      <td>
                        <app-inspection-dropdown [inspeccion]="getInspection(linea.id, 'Disparo (Trip)')"></app-inspection-dropdown>
                      </td>
                      
                      <td>
                        <button mat-icon-button (click)="openNotes(linea.notas)" color="primary">
                          <mat-icon>comment</mat-icon>
                        </button>
                      </td>
                      <td>
                        <button mat-icon-button color="primary" (click)="openLineaDialog(zona.id, linea)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deleteLinea(linea.id)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </td>
                    </tr>
                  }
                  @if (getLineasForZona(zona.id).length === 0) {
                    <tr>
                      <td colspan="10" class="text-center">No hay líneas registradas en esta zona.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 24px;
    }
    .dashboard-header h1 {
      margin: 0;
      color: var(--primary-color);
    }
    .dashboard-header p {
      margin: 4px 0 0;
      color: var(--text-secondary);
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .summary-card {
      border-radius: 12px;
    }
    .summary-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      opacity: 0.8;
    }
    .card-value {
      font-size: 36px;
      font-weight: 300;
      margin: 16px 0 0;
      color: var(--text-primary);
    }
    
    .grid-section h2 {
      margin-bottom: 16px;
      color: var(--primary-color);
    }
    
    .zona-panel {
      margin-bottom: 12px;
      border-radius: 8px !important;
    }
    
    .lineas-container {
      overflow-x: auto;
      padding: 8px 0;
    }
    
    .lineas-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 900px;
    }
    .lineas-table th, .lineas-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: middle;
    }
    .lineas-table th {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      background-color: #fafafa;
    }
    .lineas-table td {
      font-size: 14px;
    }
    
    .text-success { color: var(--status-aprobado); }
    .text-disabled { color: #bdbdbd; }
    .text-center { text-align: center; }
    
    .dense-field {
      width: 80px;
      margin-top: 16px;
    }
    .dense-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    .progress-field input {
      text-align: center;
    }
  `]
})
export class Dashboard {
  public dataService = inject(DataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  getLineasForZona(zonaId: number): Linea[] {
    return this.dataService.lineas().filter(l => l.zona_id === zonaId);
  }

  getInspection(lineaId: number, tipo: string): Inspeccion | undefined {
    return this.dataService.inspecciones().find(i => i.linea_id === lineaId && i.tipo_prueba === tipo);
  }

  updateProgress(lineaId: number, progress: number) {
    this.dataService.updateLineProgress(lineaId, progress);
  }

  openNotes(notas: string | null) {
    this.dialog.open(NoteDialog, {
      width: '400px',
      data: { notas: notas || 'No hay notas registradas para esta línea.' }
    });
  }

  openLineaDialog(zonaId: number, linea?: Linea) {
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
          this.snackBar.open('Línea creada (con sus 4 inspecciones base)', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  deleteLinea(id: number) {
    if (confirm('Al eliminar esta línea se borrarán sus inspecciones asociadas. ¿Deseas continuar?')) {
      this.dataService.deleteLinea(id);
      this.snackBar.open('Línea eliminada', 'Cerrar', { duration: 3000 });
    }
  }
}
