import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Inspection } from './inspections';

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
        
        <mat-form-field appearance="outline">
          <mat-label>Elemento</mat-label>
          <input matInput formControlName="element" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Pendiente">Pendiente</mat-option>
            <mat-option value="Aprobado">Aprobado</mat-option>
            <mat-option value="Rechazado">Rechazado</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha Programada (YYYY-MM-DD)</mat-label>
          <input matInput formControlName="scheduled_date">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha Ejecutada (YYYY-MM-DD)</mat-label>
          <input matInput formControlName="executed_date">
        </mat-form-field>
        
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
      min-width: 400px;
    }
  `]
})
export class InspectionDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InspectionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Inspection | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      element: [data?.element || '', Validators.required],
      status: [data?.status || 'Pendiente'],
      scheduled_date: [data?.scheduled_date || ''],
      executed_date: [data?.executed_date || ''],
      comments: [data?.comments || '']
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
