import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../supabase.service';
import { ActivatedRoute } from '@angular/router';
import { CatalogDialog, CatalogItem, CatalogDialogData } from './catalog-dialog';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="header-container">
      <h1>Configuración de Catálogos</h1>
    </div>

    <div class="settings-container mat-elevation-z8">
      <div class="loading-shade" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
      </div>

      <mat-tab-group [selectedIndex]="selectedTabIndex()">
        <mat-tab label="Áreas">
          <ng-container *ngTemplateOutlet="catalogTable; context: { table: 'areas', title: 'Área', data: areasData }"></ng-container>
        </mat-tab>
        <mat-tab label="Niveles">
          <ng-container *ngTemplateOutlet="catalogTable; context: { table: 'levels', title: 'Nivel', data: levelsData }"></ng-container>
        </mat-tab>
        <mat-tab label="Tipos de Inspección">
          <ng-container *ngTemplateOutlet="catalogTable; context: { table: 'inspection_types', title: 'Tipo de Inspección', data: typesData }"></ng-container>
        </mat-tab>
        <mat-tab label="Inspectores">
          <ng-container *ngTemplateOutlet="catalogTable; context: { table: 'inspectors', title: 'Inspector', data: inspectorsData }"></ng-container>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Reusable Template for Catalog Tables -->
    <ng-template #catalogTable let-tableName="table" let-title="title" let-dataSource="data">
      <div class="tab-content">
        <div class="actions-bar">
          <button mat-flat-button color="primary" (click)="openDialog(tableName, title)">
            <mat-icon>add</mat-icon> Nuevo {{ title }}
          </button>
        </div>
        
        <table mat-table [dataSource]="dataSource" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let row"> {{row.id}} </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let row"> <strong>{{row.name}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="openDialog(tableName, title, row)">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['id', 'name', 'actions']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['id', 'name', 'actions'];"></tr>
          
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="3">No hay registros creados.</td>
          </tr>
        </table>
      </div>
    </ng-template>
  `,
  styles: [`
    .header-container {
      margin-bottom: 16px;
    }
    .header-container h1 {
      margin: 0;
    }
    .settings-container {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background: var(--mat-sys-surface);
    }
    .tab-content {
      padding: 16px;
    }
    .actions-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class Settings implements OnInit {
  isLoading = signal(true);
  selectedTabIndex = signal(0);
  
  areasData = new MatTableDataSource<CatalogItem>();
  levelsData = new MatTableDataSource<CatalogItem>();
  typesData = new MatTableDataSource<CatalogItem>();
  inspectorsData = new MatTableDataSource<CatalogItem>();

  private supabase = inject(SupabaseService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selectedTabIndex.set(parseInt(params['tab'], 10));
      }
    });
    this.loadAllCatalogs();
  }

  async loadAllCatalogs() {
    this.isLoading.set(true);
    await Promise.all([
      this.loadCatalog('areas', this.areasData),
      this.loadCatalog('levels', this.levelsData),
      this.loadCatalog('inspection_types', this.typesData),
      this.loadCatalog('inspectors', this.inspectorsData)
    ]);
    this.isLoading.set(false);
  }

  async loadCatalog(tableName: string, dataSource: MatTableDataSource<CatalogItem>) {
    try {
      const { data, error } = await this.supabase.client
        .from(tableName)
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      dataSource.data = data as CatalogItem[];
    } catch (error) {
      console.error(`Error loading catalog ${tableName}:`, error);
    }
  }

  openDialog(tableName: string, title: string, item?: CatalogItem) {
    const dialogRef = this.dialog.open(CatalogDialog, {
      width: '400px',
      data: { title, item: item || null } as CatalogDialogData
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.isLoading.set(true);
        try {
          if (result.id) {
            const { error } = await this.supabase.client
              .from(tableName)
              .update({ name: result.name })
              .eq('id', result.id);
            if (error) throw error;
          } else {
            const { error } = await this.supabase.client
              .from(tableName)
              .insert({ name: result.name });
            if (error) throw error;
          }
          await this.loadAllCatalogs();
        } catch (error) {
          console.error(`Error saving ${tableName}:`, error);
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }
}
