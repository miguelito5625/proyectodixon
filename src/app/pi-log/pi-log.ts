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
import { PiLogDialog, ZoneTest } from './pi-log-dialog';

@Component({
  selector: 'app-pi-log',
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
        <h1>Pruebas por Zona (PI LOG)</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nueva Zona
        </button>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Buscar Zona</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Ej. LEVEL 1..." #input>
      </mat-form-field>
    </div>

    <div class="mat-elevation-z8 table-container">
      <div class="loading-shade" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="dataSource" matSort>

        <!-- Zone Column -->
        <ng-container matColumnDef="zone_name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Zona </th>
          <td mat-cell *matCellDef="let row"> <strong>{{row.zone_name}}</strong> </td>
        </ng-container>

        <!-- Visual Date Column -->
        <ng-container matColumnDef="visual_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Visual </th>
          <td mat-cell *matCellDef="let row"> {{row.visual_date || '--'}} </td>
        </ng-container>

        <!-- Hydro Date Column -->
        <ng-container matColumnDef="hydro_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Hydro </th>
          <td mat-cell *matCellDef="let row"> {{row.hydro_date || '--'}} </td>
        </ng-container>
        
        <!-- 30 Min Date Column -->
        <ng-container matColumnDef="thirty_min_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Aire 30 Min </th>
          <td mat-cell *matCellDef="let row"> {{row.thirty_min_date || '--'}} </td>
        </ng-container>

        <!-- 24 Air Date Column -->
        <ng-container matColumnDef="twenty_four_air_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Aire 24 Hrs </th>
          <td mat-cell *matCellDef="let row"> {{row.twenty_four_air_date || '--'}} </td>
        </ng-container>

        <!-- Trip Date Column -->
        <ng-container matColumnDef="trip_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Trip </th>
          <td mat-cell *matCellDef="let row"> {{row.trip_date || '--'}} </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Acciones </th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button color="primary" (click)="openDialog(row)" matTooltip="Editar">
              <mat-icon>edit</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="7">No hay datos que coincidan con "{{input.value}}"</td>
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
  `]
})
export class PiLog implements OnInit {
  displayedColumns: string[] = [
    'zone_name', 
    'visual_date', 
    'hydro_date', 
    'thirty_min_date', 
    'twenty_four_air_date', 
    'trip_date',
    'actions'
  ];
  dataSource: MatTableDataSource<ZoneTest>;
  isLoading = signal(true);

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
    try {
      const { data, error } = await this.supabase.client
        .from('zone_tests')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          console.error('La tabla zone_tests aún no existe. Por favor ejecuta el script de migración SQL.');
        } else {
          throw error;
        }
      }
      
      this.dataSource.data = (data || []) as ZoneTest[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      console.error('Error cargando zone_tests:', error);
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

  openDialog(zoneTest?: ZoneTest) {
    const dialogRef = this.dialog.open(PiLogDialog, {
      width: '600px',
      data: zoneTest || null
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.isLoading.set(true);
        try {
          if (result.id) {
            const { error } = await this.supabase.client
              .from('zone_tests')
              .update(result)
              .eq('id', result.id);
            if (error) throw error;
          } else {
            const { error } = await this.supabase.client
              .from('zone_tests')
              .insert(result);
            if (error) throw error;
          }
          this.loadData();
        } catch (error) {
          console.error('Error saving zone_test:', error);
          this.isLoading.set(false);
        }
      }
    });
  }
}
