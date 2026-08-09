import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface ZoneTest {
  id?: number;
  zone_name: string;
  visual_date?: string;
  hydro_date?: string;
  thirty_min_date?: string;
  twenty_four_air_date?: string;
  trip_date?: string;
  comments?: string;
  resolution?: string;
}

@Component({
  selector: 'app-pi-log-dialog',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nueva' }} Prueba de Zona (PI LOG)</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <mat-form-field appearance="outline">
          <mat-label>Nombre de Zona</mat-label>
          <input matInput formControlName="zone_name" required>
        </mat-form-field>

        <div class="dates-grid">
          <mat-form-field appearance="outline">
            <mat-label>Prueba Visual (Fecha)</mat-label>
            <input matInput formControlName="visual_date" type="date">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hydro (Fecha)</mat-label>
            <input matInput formControlName="hydro_date" type="date">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Aire 30 Min (Fecha)</mat-label>
            <input matInput formControlName="thirty_min_date" type="date">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Aire 24 Hrs (Fecha)</mat-label>
            <input matInput formControlName="twenty_four_air_date" type="date">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Disparo/Trip (Fecha)</mat-label>
            <input matInput formControlName="trip_date" type="date">
          </mat-form-field>
        </div>
        
        <mat-form-field appearance="outline">
          <mat-label>Comentarios</mat-label>
          <textarea matInput formControlName="comments" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Resolución</mat-label>
          <textarea matInput formControlName="resolution" rows="2"></textarea>
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
    .dates-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
  `]
})
export class PiLogDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PiLogDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ZoneTest | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      zone_name: [data?.zone_name || '', Validators.required],
      visual_date: [data?.visual_date || ''],
      hydro_date: [data?.hydro_date || ''],
      thirty_min_date: [data?.thirty_min_date || ''],
      twenty_four_air_date: [data?.twenty_four_air_date || ''],
      trip_date: [data?.trip_date || ''],
      comments: [data?.comments || ''],
      resolution: [data?.resolution || '']
    });
  }

  save() {
    if (this.form.valid) {
      const result = this.form.value;
      // Convert empty strings to null for postgres date fields
      const dateFields = ['visual_date', 'hydro_date', 'thirty_min_date', 'twenty_four_air_date', 'trip_date'];
      dateFields.forEach(field => {
        if (!result[field]) result[field] = null;
      });
      this.dialogRef.close(result);
    }
  }
}
