import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Inspection } from './inspections';
import { CatalogItem } from '../settings/catalog-dialog';

export interface InspectionDialogData {
  inspection: Inspection | null;
  areas: CatalogItem[];
  levels: CatalogItem[];
  inspectionTypes: CatalogItem[];
  inspectors: CatalogItem[];
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
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nueva' }} Inspección</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Elemento</mat-label>
            <input matInput formControlName="element" required>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="type_id">
              <mat-option [value]="null">-- Ninguno --</mat-option>
              <mat-option *ngFor="let t of data.inspectionTypes" [value]="t.id">{{ t.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Área</mat-label>
            <mat-select formControlName="area_id">
              <mat-option [value]="null">-- Ninguna --</mat-option>
              <mat-option *ngFor="let a of data.areas" [value]="a.id">{{ a.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Nivel</mat-label>
            <mat-select formControlName="level_id">
              <mat-option [value]="null">-- Ninguno --</mat-option>
              <mat-option *ngFor="let l of data.levels" [value]="l.id">{{ l.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Pendiente">Pendiente</mat-option>
              <mat-option value="Aprobado">Aprobado</mat-option>
              <mat-option value="Rechazado">Rechazado</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Inspector</mat-label>
            <mat-select formControlName="inspector_id">
              <mat-option [value]="null">-- Ninguno --</mat-option>
              <mat-option *ngFor="let i of data.inspectors" [value]="i.id">{{ i.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Fecha Programada (YYYY-MM-DD)</mat-label>
            <input matInput formControlName="scheduled_date">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Fecha Ejecutada (YYYY-MM-DD)</mat-label>
            <input matInput formControlName="executed_date">
          </mat-form-field>
        </div>
        
        <mat-form-field appearance="outline">
          <mat-label>Comentarios</mat-label>
          <textarea matInput formControlName="comments" rows="3"></textarea>
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
      min-width: 500px;
    }
    .row {
      display: flex;
      gap: 16px;
      width: 100%;
    }
    .flex-fill {
      flex: 1;
    }
  `]
})
export class InspectionDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InspectionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: InspectionDialogData
  ) {
    this.isEdit = !!data.inspection;
    const ins = data.inspection;
    this.form = this.fb.group({
      id: [ins?.id],
      element: [ins?.element || '', Validators.required],
      type_id: [ins?.type_id || null],
      area_id: [ins?.area_id || null],
      level_id: [ins?.level_id || null],
      status: [ins?.status || 'Pendiente'],
      inspector_id: [ins?.inspector_id || null],
      scheduled_date: [ins?.scheduled_date || ''],
      executed_date: [ins?.executed_date || ''],
      comments: [ins?.comments || '']
    });
  }

  save() {
    if (this.form.valid) {
      // Neturalize empty dates to avoid postgres errors if not properly formatted
      const result = this.form.value;
      if (!result.scheduled_date) result.scheduled_date = null;
      if (!result.executed_date) result.executed_date = null;
      
      this.dialogRef.close(result);
    }
  }
}
