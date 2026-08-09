import { Component, OnInit, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SupabaseService } from '../supabase.service';
import { IncentivesDialog, LaborIncentive } from './incentives-dialog';

@Component({
  selector: 'app-incentives',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="header-container">
      <div class="title-group">
        <h1>Incentivos Laborales</h1>
        <button mat-flat-button color="primary" (click)="openDialog()" [disabled]="hasPermissionError()">
          <mat-icon>add</mat-icon> Nuevo
        </button>
      </div>
      <mat-form-field appearance="outline" *ngIf="!hasPermissionError()">
        <mat-label>Filtrar</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Zona 1..." #input>
      </mat-form-field>
    </div>

    <div class="error-banner mat-elevation-z4" *ngIf="hasPermissionError()">
      <mat-icon color="warn">lock</mat-icon>
      <div class="error-text">
        <h3>Acceso Restringido</h3>
        <p>No tienes los permisos necesarios (Rol: Manager) para visualizar o editar los incentivos laborales. Esta tabla está protegida por políticas de seguridad (RLS) en la base de datos.</p>
      </div>
    </div>

    <div class="mat-elevation-z8 table-container" *ngIf="!hasPermissionError()">
      <div class="loading-shade" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="dataSource" matSort>

        <ng-container matColumnDef="zone">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Zona </th>
          <td mat-cell *matCellDef="let row"> <strong>{{row.zone}}</strong> </td>
        </ng-container>

        <ng-container matColumnDef="heads">
          <th mat-header-cell *matHeaderCellDef> Cabezas (Bid / Actual) </th>
          <td mat-cell *matCellDef="let row"> 
            {{row.bid_heads || 0}} / {{row.actual_heads || 0}}
          </td>
        </ng-container>

        <ng-container matColumnDef="performance">
          <th mat-header-cell *matHeaderCellDef> Horas / Target Cost </th>
          <td mat-cell *matCellDef="let row"> 
            {{row.hours_logged || 0}} hrs / {{row.target_cost | currency}}
          </td>
        </ng-container>

        <ng-container matColumnDef="incentives">
          <th mat-header-cell *matHeaderCellDef> Incentivos (SS / F / Fit) </th>
          <td mat-cell *matCellDef="let row" class="money-text"> 
            {{row.site_super_incentive | currency}} / 
            {{row.foreman_incentive | currency}} / 
            {{row.fitter_incentive | currency}}
          </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Acciones </th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button color="primary" (click)="openDialog(row)">
              <mat-icon>edit</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="5">No hay datos que coincidan.</td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
    </div>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .title-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-group h1 {
      margin: 0;
    }

    .table-container {
      position: relative;
      overflow: auto;
      border-radius: 8px;
    }

    table {
      width: 100%;
    }

    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      padding: 24px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .error-banner mat-icon {
      transform: scale(1.5);
    }

    .error-text h3 {
      margin: 0 0 4px 0;
    }
    
    .error-text p {
      margin: 0;
    }

    .money-text {
      color: #2e7d32;
      font-weight: 500;
    }
  `]
})
export class Incentives implements OnInit {
  displayedColumns: string[] = [
    'zone', 
    'heads', 
    'performance', 
    'incentives',
    'actions'
  ];
  dataSource: MatTableDataSource<LaborIncentive>;
  isLoading = signal(true);
  hasPermissionError = signal(false);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private supabase = inject(SupabaseService);
  private dialog = inject(MatDialog);

  constructor() {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    this.hasPermissionError.set(false);
    
    try {
      const { data, error } = await this.supabase.client
        .from('labor_incentives')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      
      this.dataSource.data = (data || []) as LaborIncentive[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error: any) {
      console.error('Error cargando incentivos:', error);
      if (error?.code === '42501' || error?.message?.includes('RLS')) {
        this.hasPermissionError.set(true);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(incentive?: LaborIncentive) {
    if (this.hasPermissionError()) return;
    
    const dialogRef = this.dialog.open(IncentivesDialog, {
      width: '600px',
      data: incentive || null
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.isLoading.set(true);
        try {
          if (result.id) {
            const { error } = await this.supabase.client
              .from('labor_incentives')
              .update(result)
              .eq('id', result.id);
            if (error) throw error;
          } else {
            const { error } = await this.supabase.client
              .from('labor_incentives')
              .insert(result);
            if (error) throw error;
          }
          this.loadData();
        } catch (error: any) {
          console.error('Error saving incentive:', error);
          if (error?.code === '42501' || error?.message?.includes('RLS')) {
            alert('No tienes permisos para realizar esta acción.');
          }
          this.isLoading.set(false);
        }
      }
    });
  }
}
