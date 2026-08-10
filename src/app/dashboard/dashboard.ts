import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../supabase.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  template: `
    <div class="dashboard-header">
      <h1>Dashboard Operativo</h1>
      <p>Resumen general del estado del proyecto FireSafety Ops</p>
    </div>

    <!-- Metrics Cards -->
    <div class="cards-grid">
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

    <!-- Charts Section -->
    <div class="charts-grid">
      
      <!-- Inspections Status Chart -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Estatus de Inspecciones</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-container" *ngIf="!isLoadingCharts(); else loading">
            <canvas baseChart
              [data]="pieChartData"
              [type]="pieChartType"
              [options]="pieChartOptions">
            </canvas>
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
      margin-bottom: 24px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 24px;
    }

    .metric-card, .chart-card {
      padding: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 12px;
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

    .inspections-icon { background-color: var(--mat-sys-primary); }
    .pending-icon { background-color: var(--mat-sys-error); }

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
      align-items: center;
      height: 100%;
      min-height: 200px;
    }

    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
      margin-top: 16px;
    }
  `]
})
export class Dashboard implements OnInit {
  private supabase = inject(SupabaseService);

  totalInspections = signal(0);
  pendingInspections = signal(0);
  
  isLoadingInspections = signal(true);
  isLoadingCharts = signal(true);

  // --- PIE CHART CONFIG ---
  public pieChartType: ChartType = 'doughnut';
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { position: 'right' }
    }
  };
  public pieChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: ['Aprobada', 'Pendiente', 'Rechazada'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      hoverBackgroundColor: ['#66bb6a', '#ffb74d', '#e57373']
    }]
  };

  ngOnInit() {
    this.loadMetrics();
    this.loadChartData();
  }

  async loadMetrics() {
    this.isLoadingInspections.set(true);

    try {
      // Get total inspections
      const { count: insCount, error: insError } = await this.supabase.client
        .from('inspections')
        .select('*', { count: 'exact', head: true });
        
      if (!insError) this.totalInspections.set(insCount || 0);

      // Get pending inspections
      const { count: pendCount, error: pendError } = await this.supabase.client
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pendiente');
        
      if (!pendError) this.pendingInspections.set(pendCount || 0);
      
    } catch (error) {
      console.error('Exception fetching metrics:', error);
    } finally {
      this.isLoadingInspections.set(false);
    }
  }

  async loadChartData() {
    this.isLoadingCharts.set(true);
    try {
      // Fetch Inspections Status
      const { data: insData, error: insError } = await this.supabase.client
        .from('inspections')
        .select('status');

      if (!insError && insData) {
        let aprobadas = 0;
        let pendientes = 0;
        let rechazadas = 0;

        insData.forEach(i => {
          if (i.status === 'Aprobada') aprobadas++;
          else if (i.status === 'Rechazada') rechazadas++;
          else pendientes++;
        });

        this.pieChartData = {
          labels: ['Aprobada', 'Pendiente', 'Rechazada'],
          datasets: [{
            data: [aprobadas, pendientes, rechazadas],
            backgroundColor: ['#4caf50', '#ff9800', '#f44336']
          }]
        };
      }
    } catch (error) {
      console.error('Exception fetching chart data:', error);
    } finally {
      this.isLoadingCharts.set(false);
    }
  }
}
