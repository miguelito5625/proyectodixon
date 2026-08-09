import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface LaborIncentive {
  id?: number;
  zone: string;
  bid_heads: number;
  actual_heads: number;
  hours_logged: number;
  target_cost: number;
  site_super_incentive: number;
  foreman_incentive: number;
  fitter_incentive: number;
}

@Component({
  selector: 'app-incentives-dialog',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nuevo' }} Incentivo Laboral</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <mat-form-field appearance="outline">
          <mat-label>Zona</mat-label>
          <input matInput formControlName="zone" required>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Cabezas (Bid)</mat-label>
            <input matInput type="number" formControlName="bid_heads">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Cabezas (Actual)</mat-label>
            <input matInput type="number" formControlName="actual_heads">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Horas Registradas</mat-label>
            <input matInput type="number" formControlName="hours_logged">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Costo Objetivo ($)</mat-label>
            <input matInput type="number" formControlName="target_cost">
          </mat-form-field>
        </div>

        <h3 class="subtitle">Desglose de Incentivos ($)</h3>
        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Site Super</mat-label>
            <input matInput type="number" formControlName="site_super_incentive">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Foreman</mat-label>
            <input matInput type="number" formControlName="foreman_incentive">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Fitter</mat-label>
            <input matInput type="number" formControlName="fitter_incentive">
          </mat-form-field>
        </div>

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
    .subtitle {
      margin: 8px 0 0 0;
      color: var(--mat-sys-primary);
      font-size: 14px;
      font-weight: 500;
    }
  `]
})
export class IncentivesDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<IncentivesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: LaborIncentive | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      zone: [data?.zone || '', Validators.required],
      bid_heads: [data?.bid_heads || null],
      actual_heads: [data?.actual_heads || null],
      hours_logged: [data?.hours_logged || null],
      target_cost: [data?.target_cost || null],
      site_super_incentive: [data?.site_super_incentive || null],
      foreman_incentive: [data?.foreman_incentive || null],
      fitter_incentive: [data?.fitter_incentive || null]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
