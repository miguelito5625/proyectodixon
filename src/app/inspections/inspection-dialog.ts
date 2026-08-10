import { Component, Inject, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Inspeccion } from '../core/models/data.models';

export interface EnrichedInspeccion extends Inspeccion {
  linea_nombre?: string;
  zona_nombre?: string;
}

export interface InspectionDialogData {
  inspection: EnrichedInspeccion | null;
  lineas: any[]; // { id, nombreLargo }
}

@Component({
  selector: 'app-inspection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [DatePipe],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nueva' }} Inspección</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Línea Asociada</mat-label>
          <mat-select formControlName="linea_id">
            <mat-option *ngFor="let l of data.lineas" [value]="l.id">
              {{ l.nombreLargo }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Tipo de Prueba</mat-label>
            <input matInput formControlName="tipo_prueba" required placeholder="Ej. Visual, Hidrostática">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado">
              <mat-option value="Pendiente">Pendiente</mat-option>
              <mat-option value="En Progreso">En Progreso</mat-option>
              <mat-option value="Aprobado">Aprobado</mat-option>
              <mat-option value="Rechazado">Rechazado</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de Inspección</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="fecha_inspeccion" readonly (click)="picker.open()">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
      min-width: 400px;
    }
    .row {
      display: flex;
      gap: 16px;
      width: 100%;
    }
    .flex-fill {
      flex: 1;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class InspectionDialog {
  form: FormGroup;
  isEdit = false;
  
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<InspectionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: InspectionDialogData
  ) {
    this.isEdit = !!data.inspection;
    const ins = data.inspection;
    this.form = this.fb.group({
      id: [ins?.id],
      linea_id: [ins?.linea_id || null, Validators.required],
      tipo_prueba: [ins?.tipo_prueba || '', Validators.required],
      estado: [ins?.estado || 'Pendiente', Validators.required],
      fecha_inspeccion: [ins?.fecha_inspeccion ? new Date(ins.fecha_inspeccion) : null]
    });
  }

  save() {
    if (this.form.valid) {
      const result = { ...this.form.value };
      
      if (result.fecha_inspeccion) {
        result.fecha_inspeccion = result.fecha_inspeccion.toISOString();
      } else {
        result.fecha_inspeccion = null;
      }

      this.dialogRef.close(result);
    }
  }
}
