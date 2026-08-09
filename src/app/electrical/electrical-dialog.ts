import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface ElectricalReq {
  id?: number;
  quantity: string;
  equipment: string;
  location: string;
  voltage: string;
  phase: string;
  hz: string;
  notes: string;
}

@Component({
  selector: 'app-electrical-dialog',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nuevo' }} Requerimiento Eléctrico</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <div class="row">
          <mat-form-field appearance="outline" class="flex-small">
            <mat-label>Cantidad</mat-label>
            <input matInput formControlName="quantity">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Equipo</mat-label>
            <input matInput formControlName="equipment" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Ubicación</mat-label>
          <input matInput formControlName="location">
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Voltaje</mat-label>
            <input matInput formControlName="voltage">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Fase</mat-label>
            <input matInput formControlName="phase">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Hz</mat-label>
            <input matInput formControlName="hz">
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
    .flex-small {
      flex: 0.3;
    }
  `]
})
export class ElectricalDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ElectricalDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ElectricalReq | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      quantity: [data?.quantity || ''],
      equipment: [data?.equipment || '', Validators.required],
      location: [data?.location || ''],
      voltage: [data?.voltage || ''],
      phase: [data?.phase || ''],
      hz: [data?.hz || ''],
      notes: [data?.notes || '']
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
