import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

export interface ValveConfig {
  id?: number;
  zone: string;
  valve_size: string;
  valve_type: string;
  system_cap: string;
  room: string;
  conversion_kit: boolean;
  addt_bfv_required: boolean;
  test_header_valve: boolean;
  amd_needed: boolean;
  accelerator: number;
  smallest_k_factor: string;
}

@Component({
  selector: 'app-valves-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nueva' }} Configuración de Válvula</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Zona</mat-label>
            <input matInput formControlName="zone" required>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Cuarto (Room)</mat-label>
            <input matInput formControlName="room">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Tamaño de Válvula</mat-label>
            <input matInput formControlName="valve_size">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Tipo de Válvula</mat-label>
            <input matInput formControlName="valve_type">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Capacidad del Sistema</mat-label>
            <input matInput formControlName="system_cap">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Smallest K Factor</mat-label>
            <input matInput formControlName="smallest_k_factor">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Acelerador (Cant)</mat-label>
            <input matInput type="number" formControlName="accelerator">
          </mat-form-field>
        </div>

        <div class="toggles-container">
          <mat-slide-toggle formControlName="conversion_kit">Conversion Kit</mat-slide-toggle>
          <mat-slide-toggle formControlName="addt_bfv_required">Addt BFV Required</mat-slide-toggle>
          <mat-slide-toggle formControlName="test_header_valve">Test Header Valve</mat-slide-toggle>
          <mat-slide-toggle formControlName="amd_needed">AMD Needed</mat-slide-toggle>
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
      min-width: 600px;
    }
    .row {
      display: flex;
      gap: 16px;
      width: 100%;
    }
    .flex-fill {
      flex: 1;
    }
    .toggles-container {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin-top: 8px;
      padding: 16px;
      background: var(--mat-sys-surface-container-low);
      border-radius: 8px;
    }
  `]
})
export class ValvesDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ValvesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ValveConfig | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      zone: [data?.zone || '', Validators.required],
      valve_size: [data?.valve_size || ''],
      valve_type: [data?.valve_type || ''],
      system_cap: [data?.system_cap || ''],
      room: [data?.room || ''],
      conversion_kit: [!!data?.conversion_kit],
      addt_bfv_required: [!!data?.addt_bfv_required],
      test_header_valve: [!!data?.test_header_valve],
      amd_needed: [!!data?.amd_needed],
      accelerator: [data?.accelerator || 0],
      smallest_k_factor: [data?.smallest_k_factor || '']
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
