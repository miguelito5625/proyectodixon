import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../core/services/data.service';
import { Proyecto } from '../core/models/data.models';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="config-header">
      <h1>Configuración del Proyecto</h1>
      <p>Administra los metadatos y opciones generales del proyecto activo.</p>
    </div>

    @if (activeProyecto()) {
      <mat-card class="config-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">settings</mat-icon>
          <mat-card-title>Detalles Generales</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="config-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre del Proyecto</mat-label>
              <input matInput formControlName="nombre">
              @if (configForm.get('nombre')?.hasError('required')) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Contratista General</mat-label>
                <input matInput formControlName="general_contractor">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Subcontratista PCI</mat-label>
                <input matInput formControlName="subcontratista_pci">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Autoridad (AHJ)</mat-label>
                <input matInput formControlName="ahj">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Permiso Padre</mat-label>
                <input matInput formControlName="permiso_padre">
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="!configForm.valid || !configForm.dirty">
                <mat-icon>save</mat-icon>
                Guardar Cambios
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    } @else {
      <p>No hay un proyecto activo seleccionado.</p>
    }
  `,
  styles: [`
    .config-header {
      margin-bottom: 24px;
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
      max-width: 800px;
      padding: 16px;
      border-radius: 12px;
    }
    .config-form {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
  `]
})
export class ConfiguracionComponent {
  public dataService = inject(DataService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  activeProyecto = computed(() => {
    const proyectos = this.dataService.proyectos();
    return proyectos.length > 0 ? proyectos[0] : null;
  });

  configForm: FormGroup;

  constructor() {
    this.configForm = this.fb.group({
      nombre: ['', Validators.required],
      general_contractor: [''],
      subcontratista_pci: [''],
      ahj: [''],
      permiso_padre: ['']
    });

    // Efecto para cargar los datos del proyecto activo cuando cambia
    // Usamos el constructor para suscribirnos a initial load
    setTimeout(() => {
      const proj = this.activeProyecto();
      if (proj) {
        this.configForm.patchValue({
          nombre: proj.nombre,
          general_contractor: proj.general_contractor,
          subcontratista_pci: proj.subcontratista_pci,
          ahj: proj.ahj,
          permiso_padre: proj.permiso_padre
        });
      }
    });
  }

  saveConfig() {
    if (this.configForm.valid) {
      const proj = this.activeProyecto();
      if (proj) {
        this.dataService.updateProyecto(proj.id, this.configForm.value);
        this.configForm.markAsPristine();
        this.snackBar.open('Configuración guardada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    }
  }
}
