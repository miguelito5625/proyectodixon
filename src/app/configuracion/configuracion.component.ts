import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../core/services/data.service';
import { Proyecto } from '../core/models/data.models';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-proyecto-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Editar' : 'Crear' }} Proyecto</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Proyecto</mat-label>
          <input matInput formControlName="nombre">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contratista General</mat-label>
          <input matInput formControlName="general_contractor">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Subcontratista PCI</mat-label>
          <input matInput formControlName="subcontratista_pci">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Autoridad (AHJ)</mat-label>
          <input matInput formControlName="ahj">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Permiso Padre</mat-label>
          <input matInput formControlName="permiso_padre">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
      min-width: 300px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class ProyectoDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProyectoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Proyecto | null
  ) {
    this.form = this.fb.group({
      nombre: [data?.nombre || '', Validators.required],
      general_contractor: [data?.general_contractor || ''],
      subcontratista_pci: [data?.subcontratista_pci || ''],
      ahj: [data?.ahj || ''],
      permiso_padre: [data?.permiso_padre || '']
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="config-header">
      <div class="header-text">
        <h1>Proyectos</h1>
        <p>Administra los proyectos disponibles en la plataforma.</p>
      </div>
      <button mat-flat-button color="primary" (click)="openDialog()">
        <mat-icon>add</mat-icon>
        Nuevo Proyecto
      </button>
    </div>

    <mat-card class="config-card">
      <mat-card-content>
        <table mat-table [dataSource]="dataService.proyectos()" class="proyectos-table">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Nombre del Proyecto </th>
            <td mat-cell *matCellDef="let p"> <strong>{{p.nombre}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="contratista">
            <th mat-header-cell *matHeaderCellDef> Contratista General </th>
            <td mat-cell *matCellDef="let p"> {{p.general_contractor || 'N/A'}} </td>
          </ng-container>

          <ng-container matColumnDef="permiso">
            <th mat-header-cell *matHeaderCellDef> Permiso Padre </th>
            <td mat-cell *matCellDef="let p"> {{p.permiso_padre || 'N/A'}} </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button color="primary" (click)="openDialog(p)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProyecto(p.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center" colspan="4">No hay proyectos registrados.</td>
          </tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .config-header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .config-header h1 {
      margin: 0;
      color: var(--primary-color);
    }
    .config-header p {
      margin: 4px 0 0;
      color: var(--text-secondary);
    }
    .config-card {
      border-radius: 12px;
      padding: 8px;
    }
    .proyectos-table {
      width: 100%;
    }
    .text-center {
      text-align: center;
      padding: 24px;
    }
  `]
})
export class ConfiguracionComponent {
  public dataService = inject(DataService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  displayedColumns = ['nombre', 'contratista', 'permiso', 'acciones'];

  openDialog(proyecto?: Proyecto) {
    const dialogRef = this.dialog.open(ProyectoDialog, {
      width: '400px',
      data: proyecto || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (proyecto) {
          this.dataService.updateProyecto(proyecto.id, result);
          this.snackBar.open('Proyecto actualizado', 'Cerrar', { duration: 3000 });
        } else {
          this.dataService.addProyecto(result);
          this.snackBar.open('Proyecto creado', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  deleteProyecto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      this.dataService.deleteProyecto(id);
      this.snackBar.open('Proyecto eliminado', 'Cerrar', { duration: 3000 });
    }
  }
}
