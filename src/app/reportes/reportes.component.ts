import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DataService } from '../core/services/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, MatCardModule, BaseChartDirective, MatButtonModule, MatIconModule, MatSnackBarModule],
  providers: [
    provideCharts(withDefaultRegisterables())
  ],
  template: `
    <div class="reportes-header">
      <div class="header-text">
        <h1>Reportes y Estadísticas</h1>
        <p>Métricas de progreso y estados de inspección de DataHall.</p>
      </div>
      
      <button mat-flat-button color="primary" (click)="exportReport()">
        <mat-icon>download</mat-icon>
        Exportar Reporte
      </button>
    </div>

    <div class="charts-container">
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Estado Global de Inspecciones</mat-card-title>
        </mat-card-header>
        <mat-card-content class="chart-content">
          <canvas baseChart
            [data]="pieChartData"
            [type]="pieChartType"
            [options]="pieChartOptions">
          </canvas>
        </mat-card-content>
      </mat-card>

      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Avance Físico Promedio por Zona (%)</mat-card-title>
        </mat-card-header>
        <mat-card-content class="chart-content">
          <canvas baseChart
            [data]="barChartData"
            [options]="barChartOptions"
            [type]="barChartType">
          </canvas>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reportes-header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .reportes-header h1 {
      margin: 0;
      color: var(--primary-color);
    }
    .reportes-header p {
      margin: 4px 0 0;
      color: var(--text-secondary);
    }
    @media (max-width: 600px) {
      .reportes-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
    .charts-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .charts-container {
        grid-template-columns: 1fr;
      }
    }
    .chart-card {
      border-radius: 12px;
      padding: 8px;
    }
    .chart-content {
      padding-top: 16px;
      display: block;
      height: 300px;
    }
  `]
})
export class ReportesComponent {
  private dataService = inject(DataService);
  private snackBar = inject(MatSnackBar);

  // Pie Chart config
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Aprobado', 'En Progreso', 'Pendiente', 'Rechazado'],
    datasets: [ { 
      data: [0, 0, 0, 0],
      backgroundColor: ['#4caf50', '#ff9800', '#9e9e9e', '#f44336']
    } ]
  };
  public pieChartType: ChartType = 'pie';

  // Bar Chart config
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100 }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Avance (%)', backgroundColor: '#0d47a1' }
    ]
  };

  constructor() {
    effect(() => {
      // Calculate Pie Chart Data
      const inspecciones = this.dataService.inspecciones();
      let aprobados = 0;
      let enProgreso = 0;
      let pendientes = 0;
      let rechazados = 0;

      inspecciones.forEach(i => {
        if (i.estado === 'Aprobado' || i.estado === 'Aprobada') aprobados++;
        else if (i.estado === 'Rechazado' || i.estado === 'Reprobada') rechazados++;
        else if (i.estado === 'En Progreso' || i.estado === 'En progreso') enProgreso++;
        else pendientes++;
      });

      this.pieChartData = {
        labels: ['Aprobado', 'En Progreso', 'Pendiente', 'Rechazado'],
        datasets: [{
          data: [aprobados, enProgreso, pendientes, rechazados],
          backgroundColor: ['#4caf50', '#ff9800', '#9e9e9e', '#f44336']
        }]
      };

      // Calculate Bar Chart Data
      const zonas = this.dataService.zonas();
      const lineas = this.dataService.lineas();
      
      const labels = zonas.map(z => `Zona ${z.numero_zona}`);
      const data = zonas.map(z => {
        const lineasDeZona = lineas.filter(l => l.zona_id === z.id);
        if (lineasDeZona.length === 0) return 0;
        const totalProg = lineasDeZona.reduce((acc, l) => acc + (l.porcentaje_completado || 0), 0);
        return (totalProg / lineasDeZona.length) * 100;
      });

      this.barChartData = {
        labels,
        datasets: [{
          data,
          label: 'Avance (%)',
          backgroundColor: '#0d47a1'
        }]
      };
    });
  }

  exportReport() {
    this.snackBar.open('Generando reporte PDF...', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}
