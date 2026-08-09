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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SupabaseService } from '../supabase.service';
import { IssuesDialog, Issue } from './issues-dialog';

@Component({
  selector: 'app-issues',
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
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="header-container">
      <div class="title-group">
        <h1>Pendientes (Issues)</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nuevo
        </button>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Filtrar</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Fuga..." #input>
      </mat-form-field>
    </div>

    <div class="mat-elevation-z8 table-container">
      <div class="loading-shade" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="dataSource" matSort>

        <!-- Item Number -->
        <ng-container matColumnDef="item_number">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Ítem </th>
          <td mat-cell *matCellDef="let row"> <strong>{{row.item_number || '--'}}</strong> </td>
        </ng-container>

        <!-- Detail Column -->
        <ng-container matColumnDef="detail">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Detalle </th>
          <td mat-cell *matCellDef="let row"> {{row.detail}} </td>
        </ng-container>

        <!-- Priority Column -->
        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Prioridad </th>
          <td mat-cell *matCellDef="let row"> 
            <mat-chip [color]="getPriorityColor(row.priority)" highlighted>
              {{row.priority}}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
          <td mat-cell *matCellDef="let row"> 
            <mat-chip [color]="getStatusColor(row.status)" highlighted>
              {{row.status}}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Responsible Column -->
        <ng-container matColumnDef="responsible">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Responsable </th>
          <td mat-cell *matCellDef="let row"> {{row.responsible || '--'}} </td>
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
          <td class="mat-cell" colspan="6">No hay datos que coincidan con "{{input.value}}"</td>
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
export class Issues implements OnInit {
  displayedColumns: string[] = [
    'item_number', 
    'detail', 
    'priority', 
    'status', 
    'responsible', 
    'actions'
  ];
  dataSource: MatTableDataSource<Issue>;
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
        .from('issues_log')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      
      this.dataSource.data = (data || []) as Issue[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      console.error('Error cargando pendientes:', error);
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

  getPriorityColor(priority: string) {
    if (priority === 'Alta') return 'warn';
    if (priority === 'Media') return 'accent';
    return 'primary';
  }

  getStatusColor(status: string) {
    if (status === 'Completado') return 'primary';
    if (status === 'En Progreso') return 'accent';
    return 'warn'; // Pendiente
  }

  openDialog(issue?: Issue) {
    const dialogRef = this.dialog.open(IssuesDialog, {
      width: '600px',
      data: issue || null
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.isLoading.set(true);
        try {
          if (result.id) {
            const { error } = await this.supabase.client
              .from('issues_log')
              .update(result)
              .eq('id', result.id);
            if (error) throw error;
          } else {
            const { error } = await this.supabase.client
              .from('issues_log')
              .insert(result);
            if (error) throw error;
          }
          this.loadData();
        } catch (error) {
          console.error('Error saving issue:', error);
          this.isLoading.set(false);
        }
      }
    });
  }
}
