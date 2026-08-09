import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-header">
      <h1>Dashboard Operativo</h1>
      <p>Resumen general del estado del proyecto FireSafety Ops</p>
    </div>

    <div class="cards-grid">
      <!-- Inspections Card -->
      <mat-card class="metric-card">
        <mat-card-header>
          <div mat-card-avatar class="card-icon inspections-icon">
            <mat-icon>fact_check</mat-icon>
          </div>
          <mat-card-title>Inspecciones Totales</mat-card-title>
          <mat-card-subtitle>Registradas en el sistema</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="metric-value" *ngIf="!isLoadingInspections(); else loading">
            {{ totalInspections() }}
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Materials Card -->
      <mat-card class="metric-card">
        <mat-card-header>
          <div mat-card-avatar class="card-icon materials-icon">
            <mat-icon>inventory_2</mat-icon>
          </div>
          <mat-card-title>Log de Materiales</mat-card-title>
          <mat-card-subtitle>Submittals registrados</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="metric-value" *ngIf="!isLoadingMaterials(); else loading">
            {{ totalMaterials() }}
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Pending Inspections Card -->
      <mat-card class="metric-card">
        <mat-card-header>
          <div mat-card-avatar class="card-icon pending-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <mat-card-title>Inspecciones Pendientes</mat-card-title>
          <mat-card-subtitle>Requieren atención</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="metric-value" *ngIf="!isLoadingInspections(); else loading">
            {{ pendingInspections() }}
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <ng-template #loading>
      <div class="spinner-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      margin: 0;
      color: var(--mat-sys-on-surface);
    }
    
    .dashboard-header p {
      color: var(--mat-sys-on-surface-variant);
      margin-top: 8px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .metric-card {
      padding: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--mat-sys-elevation-level3);
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      margin-right: 16px;
    }

    .card-icon mat-icon {
      color: white;
    }

    .inspections-icon {
      background-color: var(--mat-sys-primary);
    }

    .materials-icon {
      background-color: var(--mat-sys-tertiary);
    }
    
    .pending-icon {
      background-color: var(--mat-sys-error);
    }

    .metric-value {
      font-size: 3rem;
      font-weight: 300;
      margin-top: 16px;
      color: var(--mat-sys-on-surface);
      text-align: center;
    }
    
    .spinner-container {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }
  `]
})
export class Dashboard implements OnInit {
  private supabase = inject(SupabaseService);

  totalInspections = signal(0);
  pendingInspections = signal(0);
  totalMaterials = signal(0);
  
  isLoadingInspections = signal(true);
  isLoadingMaterials = signal(true);

  ngOnInit() {
    this.loadMetrics();
  }

  async loadMetrics() {
    this.isLoadingInspections.set(true);
    this.isLoadingMaterials.set(true);

    try {
      console.log('Fetching inspections count...');
      // Get total inspections
      const { count: insCount, error: insError } = await this.supabase.client
        .from('inspections')
        .select('*', { count: 'exact', head: true });
        
      if (insError) {
        console.error('Error in insCount:', insError);
      } else {
        console.log('Total inspections:', insCount);
        this.totalInspections.set(insCount || 0);
      }

      // Get pending inspections
      const { count: pendCount, error: pendError } = await this.supabase.client
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pendiente');
        
      if (pendError) {
        console.error('Error in pendCount:', pendError);
      } else {
        this.pendingInspections.set(pendCount || 0);
      }
      
      this.isLoadingInspections.set(false);

      console.log('Fetching materials count...');
      // Get total materials
      const { count: matCount, error: matError } = await this.supabase.client
        .from('materials')
        .select('*', { count: 'exact', head: true });
        
      if (matError) {
        console.error('Error in matCount:', matError);
      } else {
        console.log('Total materials:', matCount);
        this.totalMaterials.set(matCount || 0);
      }
      
      this.isLoadingMaterials.set(false);
      
    } catch (error) {
      console.error('Exception fetching metrics:', error);
      this.isLoadingInspections.set(false);
      this.isLoadingMaterials.set(false);
    }
  }
}
