import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

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
    MatButtonModule,
    MatDatepickerModule
  ],
  providers: [DatePipe, provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nueva' }} Prueba de Zona (PI LOG)</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <mat-form-field appearance="outline">
          <mat-label>Nombre de Zona</mat-label>
          <input matInput formControlName="zone_name" required>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Prueba Visual (Fecha)</mat-label>
            <input matInput [matDatepicker]="pickerVisual" formControlName="visual_date">
            <mat-datepicker-toggle matIconSuffix [for]="pickerVisual"></mat-datepicker-toggle>
            <mat-datepicker #pickerVisual></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Hydro (Fecha)</mat-label>
            <input matInput [matDatepicker]="pickerHydro" formControlName="hydro_date">
            <mat-datepicker-toggle matIconSuffix [for]="pickerHydro"></mat-datepicker-toggle>
            <mat-datepicker #pickerHydro></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Aire 30 Min (Fecha)</mat-label>
            <input matInput [matDatepicker]="picker30m" formControlName="thirty_min_date">
            <mat-datepicker-toggle matIconSuffix [for]="picker30m"></mat-datepicker-toggle>
            <mat-datepicker #picker30m></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Aire 24 Hrs (Fecha)</mat-label>
            <input matInput [matDatepicker]="picker24h" formControlName="twenty_four_air_date">
            <mat-datepicker-toggle matIconSuffix [for]="picker24h"></mat-datepicker-toggle>
            <mat-datepicker #picker24h></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Disparo/Trip (Fecha)</mat-label>
          <input matInput [matDatepicker]="pickerTrip" formControlName="trip_date">
          <mat-datepicker-toggle matIconSuffix [for]="pickerTrip"></mat-datepicker-toggle>
          <mat-datepicker #pickerTrip></mat-datepicker>
        </mat-form-field>
        
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
    .row {
      display: flex;
      gap: 16px;
    }
    .flex-fill {
      flex: 1;
    }
  `]
})
export class PiLogDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<PiLogDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ZoneTest | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id],
      zone_name: [data?.zone_name || '', Validators.required],
      visual_date: [data?.visual_date ? new Date(data.visual_date) : null],
      hydro_date: [data?.hydro_date ? new Date(data.hydro_date) : null],
      thirty_min_date: [data?.thirty_min_date ? new Date(data.thirty_min_date) : null],
      twenty_four_air_date: [data?.twenty_four_air_date ? new Date(data.twenty_four_air_date) : null],
      trip_date: [data?.trip_date ? new Date(data.trip_date) : null],
      comments: [data?.comments || ''],
      resolution: [data?.resolution || '']
    });
  }

  save() {
    if (this.form.valid) {
      const result = { ...this.form.value };
      
      const dateFields = ['visual_date', 'hydro_date', 'thirty_min_date', 'twenty_four_air_date', 'trip_date'];
      dateFields.forEach(field => {
        if (result[field]) {
          result[field] = this.datePipe.transform(result[field], 'yyyy-MM-dd');
        } else {
          result[field] = null;
        }
      });
      
      this.dialogRef.close(result);
    }
  }
}
