import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

export interface Issue {
  id?: number;
  item_number: string;
  detail: string;
  priority: string;
  status: string;
  responsible: string;
  notes: string;
}

@Component({
  selector: 'app-issues-dialog',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nuevo' }} Pendiente</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>No. de Ítem</mat-label>
            <input matInput formControlName="item_number">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Prioridad</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="Alta">Alta</mat-option>
              <mat-option value="Media">Media</mat-option>
              <mat-option value="Baja">Baja</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Detalle del Pendiente</mat-label>
          <textarea matInput formControlName="detail" required rows="3"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Pendiente">Pendiente</mat-option>
              <mat-option value="En Progreso">En Progreso</mat-option>
              <mat-option value="Completado">Completado</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Responsable</mat-label>
            <input matInput formControlName="responsible">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Notas adicionales</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
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
export class IssuesDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<IssuesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Issue | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      item_number: [data?.item_number || ''],
      detail: [data?.detail || '', Validators.required],
      priority: [data?.priority || 'Media'],
      status: [data?.status || 'Pendiente'],
      responsible: [data?.responsible || ''],
      notes: [data?.notes || '']
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
