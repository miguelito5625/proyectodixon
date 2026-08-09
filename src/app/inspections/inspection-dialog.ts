import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Inspection } from './inspections';
import { CatalogDialog, CatalogDialogData, CatalogItem } from '../settings/catalog-dialog';
import { SupabaseService } from '../supabase.service';

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
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule
  ],
  providers: [DatePipe],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nueva' }} Inspección</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        
        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Elemento</mat-label>
            <input matInput formControlName="element" required>
          </mat-form-field>
          <div class="field-with-action flex-fill">
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type_id">
                <mat-option [value]="null">-- Ninguno --</mat-option>
                <mat-option *ngFor="let t of data.inspectionTypes" [value]="t.id">{{ t.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button color="primary" type="button" (click)="addNewCatalogItem('inspection_types', 'Tipo', 'type_id', data.inspectionTypes)">
              <mat-icon>add</mat-icon>
            </button>
          </div>
        </div>

        <div class="row">
          <div class="field-with-action flex-fill">
            <mat-form-field appearance="outline">
              <mat-label>Área</mat-label>
              <mat-select formControlName="area_id">
                <mat-option [value]="null">-- Ninguna --</mat-option>
                <mat-option *ngFor="let a of data.areas" [value]="a.id">{{ a.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button color="primary" type="button" (click)="addNewCatalogItem('areas', 'Área', 'area_id', data.areas)">
              <mat-icon>add</mat-icon>
            </button>
          </div>
          <div class="field-with-action flex-fill">
            <mat-form-field appearance="outline">
              <mat-label>Nivel</mat-label>
              <mat-select formControlName="level_id">
                <mat-option [value]="null">-- Ninguno --</mat-option>
                <mat-option *ngFor="let l of data.levels" [value]="l.id">{{ l.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button color="primary" type="button" (click)="addNewCatalogItem('levels', 'Nivel', 'level_id', data.levels)">
              <mat-icon>add</mat-icon>
            </button>
          </div>
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
          <div class="field-with-action flex-fill">
            <mat-form-field appearance="outline">
              <mat-label>Inspector</mat-label>
              <mat-select formControlName="inspector_id">
                <mat-option [value]="null">-- Ninguno --</mat-option>
                <mat-option *ngFor="let i of data.inspectors" [value]="i.id">{{ i.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button color="primary" type="button" (click)="addNewCatalogItem('inspectors', 'Inspector', 'inspector_id', data.inspectors)">
              <mat-icon>add</mat-icon>
            </button>
          </div>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Fecha Programada</mat-label>
            <input matInput [matDatepicker]="pickerProg" formControlName="scheduled_date" readonly (click)="pickerProg.open()">
            <mat-datepicker-toggle matIconSuffix [for]="pickerProg"></mat-datepicker-toggle>
            <mat-datepicker #pickerProg></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-fill">
            <mat-label>Fecha Ejecutada</mat-label>
            <input matInput [matDatepicker]="pickerEjec" formControlName="executed_date" readonly (click)="pickerEjec.open()">
            <mat-datepicker-toggle matIconSuffix [for]="pickerEjec"></mat-datepicker-toggle>
            <mat-datepicker #pickerEjec></mat-datepicker>
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
    .field-with-action {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .field-with-action mat-form-field {
      flex: 1;
    }
  `]
})
export class InspectionDialog {
  form: FormGroup;
  isEdit = false;
  
  private dialog = inject(MatDialog);
  private supabase = inject(SupabaseService);

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
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
      scheduled_date: [ins?.scheduled_date ? new Date(ins.scheduled_date) : null],
      executed_date: [ins?.executed_date ? new Date(ins.executed_date) : null],
      comments: [ins?.comments || '']
    });
  }

  addNewCatalogItem(tableName: string, title: string, controlName: string, localArray: CatalogItem[]) {
    const dialogRef = this.dialog.open(CatalogDialog, {
      width: '400px',
      data: { title, item: null } as CatalogDialogData
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.name) {
        try {
          const { data, error } = await this.supabase.client
            .from(tableName)
            .insert({ name: result.name })
            .select('*')
            .single();
            
          if (error) throw error;
          
          if (data) {
            localArray.push(data as CatalogItem);
            this.form.get(controlName)?.setValue(data.id);
          }
        } catch (error) {
          console.error(`Error saving ${tableName}:`, error);
        }
      }
    });
  }

  save() {
    if (this.form.valid) {
      const result = { ...this.form.value };
      
      // Convert dates to YYYY-MM-DD strings for Supabase
      if (result.scheduled_date) {
        result.scheduled_date = this.datePipe.transform(result.scheduled_date, 'yyyy-MM-dd');
      } else {
        result.scheduled_date = null;
      }
      
      if (result.executed_date) {
        result.executed_date = this.datePipe.transform(result.executed_date, 'yyyy-MM-dd');
      } else {
        result.executed_date = null;
      }

      this.dialogRef.close(result);
    }
  }
}
