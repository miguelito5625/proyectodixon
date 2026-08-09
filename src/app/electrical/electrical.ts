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
import { ElectricalDialog, ElectricalReq } from './electrical-dialog';

@Component({
  selector: 'app-electrical',
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
        <h1>Req. Eléctricos</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nuevo
        </button>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Filtrar</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Panel..." #input>
      </mat-form-field>
    </div>

    <div class="mat-elevation-z8 table-container">
      <div class="loading-shade" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="dataSource" matSort>

        <!-- Equipment -->
        <ng-container matColumnDef="equipment">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Equipo </th>
          <td mat-cell *matCellDef="let row"> 
            <strong>{{row.equipment || '--'}}</strong> <br>
            <small>Cant: {{ row.quantity || '1' }}</small>
          </td>
        </ng-container>

        <!-- Location -->
        <ng-container matColumnDef="location">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Ubicación </th>
          <td mat-cell *matCellDef="let row"> {{row.location || '--'}} </td>
        </ng-container>

        <!-- Power Specs -->
        <ng-container matColumnDef="power">
          <th mat-header-cell *matHeaderCellDef> Especificaciones (V / Ph / Hz) </th>
          <td mat-cell *matCellDef="let row"> 
            {{ row.voltage || '-' }}V / {{ row.phase || '-' }}Ph / {{ row.hz || '-' }}Hz
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
          <td class="mat-cell" colspan="4">No hay datos que coincidan con "{{input.value}}"</td>
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
export class Electrical implements OnInit {
  displayedColumns: string[] = [
    'equipment', 
    'location', 
    'power', 
    'actions'
  ];
  dataSource: MatTableDataSource<ElectricalReq>;
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
        .from('electrical_requirements')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      
      this.dataSource.data = (data || []) as ElectricalReq[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      console.error('Error cargando req. eléctricos:', error);
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

  openDialog(req?: ElectricalReq) {
    const dialogRef = this.dialog.open(ElectricalDialog, {
      width: '600px',
      data: req || null
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.isLoading.set(true);
        try {
          if (result.id) {
            const { error } = await this.supabase.client
              .from('electrical_requirements')
              .update(result)
              .eq('id', result.id);
            if (error) throw error;
          } else {
            const { error } = await this.supabase.client
              .from('electrical_requirements')
              .insert(result);
            if (error) throw error;
          }
          this.loadData();
        } catch (error) {
          console.error('Error saving electrical req:', error);
          this.isLoading.set(false);
        }
      }
    });
  }
}
