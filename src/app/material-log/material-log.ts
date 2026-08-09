import { Component, OnInit, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MaterialDialog } from './material-dialog';

export interface Material {
  id: number;
  submittal_number: string;
  description: string;
  model: string;
  lead_time_weeks?: number;
  issues_comments: string;
}

@Component({
  selector: 'app-material-log',
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
        <h1>Material Log</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nuevo
        </button>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Filtrar</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Ej. 211200..." #input>
      </mat-form-field>
    </div>

    <div class="mat-elevation-z8 table-container">
      <div class="loading-shade" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="dataSource" matSort>

        <!-- Submittal Column -->
        <ng-container matColumnDef="submittal_number">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Submittal # </th>
          <td mat-cell *matCellDef="let row"> {{row.submittal_number}} </td>
        </ng-container>

        <!-- Description Column -->
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Descripción </th>
          <td mat-cell *matCellDef="let row"> {{row.description || 'N/A'}} </td>
        </ng-container>

        <!-- Model Column -->
        <ng-container matColumnDef="model">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Modelo </th>
          <td mat-cell *matCellDef="let row"> {{row.model || 'N/A'}} </td>
        </ng-container>

        <!-- Issues Column -->
        <ng-container matColumnDef="issues_comments">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Issues / Comments </th>
          <td mat-cell *matCellDef="let row">
            <span [class.has-issue]="row.issues_comments">
              {{row.issues_comments || 'Sin comentarios'}}
            </span>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <!-- Row shown when there is no matching data. -->
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="4">No hay datos que coincidan con el filtro "{{input.value}}"</td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[10, 25, 100]" aria-label="Select page of materials"></mat-paginator>
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

    .has-issue {
      color: var(--mat-sys-error);
      font-weight: 500;
    }
  `]
})
export class MaterialLog implements OnInit {
  displayedColumns: string[] = ['submittal_number', 'description', 'model', 'issues_comments'];
  dataSource: MatTableDataSource<Material>;
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
        .from('materials')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      
      this.dataSource.data = data as Material[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      console.error('Error cargando materiales:', error);
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

  openDialog(material?: Material) {
    const dialogRef = this.dialog.open(MaterialDialog, {
      width: '500px',
      data: material || null
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.isLoading.set(true);
        try {
          if (result.id) {
            // Update
            const { error } = await this.supabase.client
              .from('materials')
              .update(result)
              .eq('id', result.id);
            if (error) throw error;
          } else {
            // Insert
            const { error } = await this.supabase.client
              .from('materials')
              .insert(result);
            if (error) throw error;
          }
          this.loadData(); // Reload table
        } catch (error) {
          console.error('Error saving material:', error);
          this.isLoading.set(false);
        }
      }
    });
  }
}
