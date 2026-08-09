import { Component, OnInit, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { SupabaseService } from '../supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InspectionDialog, InspectionDialogData } from './inspection-dialog';
import { CatalogItem } from '../settings/catalog-dialog';

export interface Inspection {
  id: number;
  element: string;
  status: string;
  comments: string;
  scheduled_date: string;
  executed_date: string;
  area_id?: number;
  level_id?: number;
  type_id?: number;
  inspector_id?: number;
  areas?: { name: string };
  levels?: { name: string };
  inspection_types?: { name: string };
  inspectors?: { name: string };
}

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="header-container">
      <div class="title-group">
        <h1>Control de Inspecciones</h1>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nueva
        </button>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Buscar Elemento</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Válvula de control..." #input>
      </mat-form-field>
    </div>

    <div class="mat-elevation-z8 table-container">
      <div class="loading-shade" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
      </div>

      <table mat-table [dataSource]="dataSource" matSort>

        <ng-container matColumnDef="area">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Área / Nivel </th>
          <td mat-cell *matCellDef="let row"> 
            {{ row.areas?.name || 'N/A' }} <br>
            <small>{{ row.levels?.name || '' }}</small>
          </td>
        </ng-container>

        <!-- Element Column -->
        <ng-container matColumnDef="element">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Elemento / Tipo </th>
          <td mat-cell *matCellDef="let row"> 
            <strong>{{row.element}}</strong> <br>
            <small>{{ row.inspection_types?.name || '' }}</small>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
          <td mat-cell *matCellDef="let row">
            <mat-chip [color]="getStatusColor(row.status)" highlighted>
              {{row.status || 'Pendiente'}}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Scheduled Date Column -->
        <ng-container matColumnDef="scheduled_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha Prog. </th>
          <td mat-cell *matCellDef="let row"> {{row.scheduled_date || '--'}} </td>
        </ng-container>
        
        <!-- Executed Date Column -->
        <ng-container matColumnDef="executed_date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha Ejec. </th>
          <td mat-cell *matCellDef="let row"> {{row.executed_date || '--'}} </td>
        </ng-container>

        <!-- Inspector Column -->
        <ng-container matColumnDef="inspector">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Inspector </th>
          <td mat-cell *matCellDef="let row"> {{row.inspectors?.name || '--'}} </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Acciones </th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="openDialog(row)">
              <mat-icon>edit</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <!-- Row shown when there is no matching data. -->
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
    
    mat-chip {
      font-weight: 500;
    }
  `]
})
export class Inspections implements OnInit {
  displayedColumns: string[] = [
    'element',
    'area',
    'status', 
    'scheduled_date', 
    'executed_date', 
    'inspector',
    'actions'
  ];
  dataSource: MatTableDataSource<Inspection>;
  isLoading = signal(true);

  // Catalogs
  areas: CatalogItem[] = [];
  levels: CatalogItem[] = [];
  inspectionTypes: CatalogItem[] = [];
  inspectors: CatalogItem[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private supabase = inject(SupabaseService);
  private dialog = inject(MatDialog);

  constructor() {
    this.dataSource = new MatTableDataSource();
  }

  async ngOnInit() {
    await this.loadCatalogs();
    this.loadData();
  }

  async loadCatalogs() {
    try {
      const [areasRes, levelsRes, typesRes, inspectorsRes] = await Promise.all([
        this.supabase.client.from('areas').select('*'),
        this.supabase.client.from('levels').select('*'),
        this.supabase.client.from('inspection_types').select('*'),
        this.supabase.client.from('inspectors').select('*')
      ]);
      this.areas = areasRes.data as CatalogItem[] || [];
      this.levels = levelsRes.data as CatalogItem[] || [];
      this.inspectionTypes = typesRes.data as CatalogItem[] || [];
      this.inspectors = inspectorsRes.data as CatalogItem[] || [];
    } catch (e) {
      console.error('Error loading catalogs:', e);
    }
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.client
        .from('inspections')
        .select(`
          *,
          areas(name),
          levels(name),
          inspection_types(name),
          inspectors(name)
        `)
        .order('id', { ascending: false });

      if (error) throw error;
      
      this.dataSource.data = data as Inspection[];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      console.error('Error cargando inspecciones:', error);
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

  getStatusColor(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('aprobado') || s.includes('approved') || s.includes('ok')) {
      return 'primary'; // Greenish in some themes
    } else if (s.includes('rechazado') || s.includes('rejected')) {
      return 'warn'; // Red
    }
    return 'accent'; // Default for Pending
  }

  openDialog(inspection?: Inspection) {
    const dialogRef = this.dialog.open(InspectionDialog, {
      width: '600px',
      data: {
        inspection: inspection || null,
        areas: this.areas,
        levels: this.levels,
        inspectionTypes: this.inspectionTypes,
        inspectors: this.inspectors
      } as InspectionDialogData
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.isLoading.set(true);
        try {
          if (result.id) {
            // Update
            const { error } = await this.supabase.client
              .from('inspections')
              .update(result)
              .eq('id', result.id);
            if (error) throw error;
          } else {
            // Insert
            const { error } = await this.supabase.client
              .from('inspections')
              .insert(result);
            if (error) throw error;
          }
          this.loadData(); // Reload table
        } catch (error) {
          console.error('Error saving inspection:', error);
          this.isLoading.set(false);
        }
      }
    });
  }
}
