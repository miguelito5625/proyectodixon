import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

export interface TripTest {
  id?: number;
  zone: string;
  accelerator_yn: string;
  starting_water: number;
  starting_air: number;
  time_to_trip: number;
  air_at_trip: number;
  wto: number;
}

@Component({
  selector: 'app-trips-dialog',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nueva' }} Prueba de Disparo (Trip Test)</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Zona</mat-label>
            <input matInput formControlName="zone" required>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>¿Acelerador?</mat-label>
            <mat-select formControlName="accelerator_yn">
              <mat-option value="Si">Sí</mat-option>
              <mat-option value="No">No</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Starting Water (psi)</mat-label>
            <input matInput type="number" formControlName="starting_water">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Starting Air (psi)</mat-label>
            <input matInput type="number" formControlName="starting_air">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Time to Trip (sec)</mat-label>
            <input matInput type="number" formControlName="time_to_trip">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Air at Trip (psi)</mat-label>
            <input matInput type="number" formControlName="air_at_trip">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>WTO (Water Time Output)</mat-label>
          <input matInput type="number" formControlName="wto">
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
export class TripsDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TripsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TripTest | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      zone: [data?.zone || '', Validators.required],
      accelerator_yn: [data?.accelerator_yn || 'No'],
      starting_water: [data?.starting_water || null],
      starting_air: [data?.starting_air || null],
      time_to_trip: [data?.time_to_trip || null],
      air_at_trip: [data?.air_at_trip || null],
      wto: [data?.wto || null]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
