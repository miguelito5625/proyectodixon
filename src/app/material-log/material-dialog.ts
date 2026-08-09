import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Material } from './material-log';

@Component({
  selector: 'app-material-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nuevo' }} Material</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <mat-form-field appearance="outline">
          <mat-label>Submittal Number</mat-label>
          <input matInput formControlName="submittal_number" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <input matInput formControlName="description">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Modelo</mat-label>
          <input matInput formControlName="model">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Lead Time (Weeks)</mat-label>
          <input matInput type="number" formControlName="lead_time_weeks">
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Issues / Comments</mat-label>
          <textarea matInput formControlName="issues_comments" rows="3"></textarea>
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
export class MaterialDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MaterialDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Material | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      submittal_number: [data?.submittal_number || '', Validators.required],
      description: [data?.description || ''],
      model: [data?.model || ''],
      lead_time_weeks: [data?.lead_time_weeks || null],
      issues_comments: [data?.issues_comments || '']
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
