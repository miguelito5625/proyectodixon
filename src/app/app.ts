import { Component, inject, Renderer2, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SupabaseService } from './supabase.service';
import { DataService } from './core/services/data.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    @if(supabase.session()) {
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="over" opened="false">
          <div class="sidenav-header">
            <mat-icon>local_fire_department</mat-icon>
            <h2>FireSafety Ops</h2>
          </div>
          
          <mat-nav-list class="nav-list">
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" class="nav-item" (click)="sidenav.close()">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/zonas" routerLinkActive="active-link" class="nav-item" (click)="sidenav.close()">
              <mat-icon matListItemIcon>map</mat-icon>
              <span matListItemTitle>Zonas</span>
            </a>
            <a mat-list-item routerLink="/lineas" routerLinkActive="active-link" class="nav-item" (click)="sidenav.close()">
              <mat-icon matListItemIcon>timeline</mat-icon>
              <span matListItemTitle>Líneas (Permisos)</span>
            </a>
            <a mat-list-item routerLink="/inspecciones" routerLinkActive="active-link" class="nav-item" (click)="sidenav.close()">
              <mat-icon matListItemIcon>list_alt</mat-icon>
              <span matListItemTitle>Inspecciones</span>
            </a>
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/reportes" routerLinkActive="active-link" (click)="sidenav.close()">
              <mat-icon matListItemIcon>bar_chart</mat-icon>
              <span matListItemTitle>Reportes</span>
            </a>
            <a mat-list-item routerLink="/configuracion" routerLinkActive="active-link" (click)="sidenav.close()">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Configuración</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary">
            <button
              type="button"
              aria-label="Toggle sidenav"
              mat-icon-button
              (click)="sidenav.toggle()">
              <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
            </button>
            <span class="spacer"></span>
            
            <mat-form-field appearance="outline" class="project-selector">
              <mat-select [ngModel]="dataService.activeProyectoId()" (ngModelChange)="onProjectChange($event)">
                @for(proyecto of proyectos(); track proyecto.id) {
                  <mat-option [value]="proyecto.id">{{ proyecto.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            
            <span class="spacer"></span>
            
            <!-- Animated Dark/Light Mode Toggle -->
            <button mat-icon-button (click)="toggleTheme()" aria-label="Toggle theme">
              <mat-icon class="theme-icon" [class.rotated]="isDarkMode()">
                {{ isDarkMode() ? 'dark_mode' : 'light_mode' }}
              </mat-icon>
            </button>

            <!-- Sign Out Button -->
            <button mat-icon-button (click)="signOut()" aria-label="Cerrar Sesión">
              <mat-icon>logout</mat-icon>
            </button>
          </mat-toolbar>

          <div class="container">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <!-- Blank layout for login -->
      <router-outlet></router-outlet>
    }
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background-color: var(--mat-sys-background);
    }
    
    .sidenav-header {
      padding: 24px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      color: var(--mat-sys-primary);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    
    .sidenav-header mat-icon {
      transform: scale(1.5);
      margin-left: 8px;
    }

    .sidenav-header h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    mat-sidenav {
      width: 250px;
      border-right: 1px solid var(--mat-sys-outline-variant);
    }

    mat-sidenav .mat-divider {
      margin: 0;
    }

    mat-expansion-panel-header {
      padding: 0 16px;
    }

    .mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-header:hover:not([aria-disabled=true]) {
      background: rgba(0,0,0,0.04);
    }

    .active-link {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container) !important;
      font-weight: 500;
    }
    
    .active-link mat-icon {
      color: var(--mat-sys-primary);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Animation for theme icon */
    .theme-icon {
      transition: transform 0.5s ease-in-out, opacity 0.3s ease;
    }
    .theme-icon.rotated {
      transform: rotate(360deg);
    }
    
    .project-selector {
      width: 400px;
      margin-top: 16px;
    }
    .project-selector .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class App {
  private breakpointObserver = inject(BreakpointObserver);
  private renderer = inject(Renderer2);
  private router = inject(Router);
  public supabase = inject(SupabaseService);
  public dataService = inject(DataService);
  
  proyectos = this.dataService.proyectos;
  
  isHandset = signal(false);
  isDarkMode = signal(false);

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isHandset.set(result.matches);
    });
    
    // Check initial system preference or localStorage if needed
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      this.toggleTheme(true);
    }
  }

  closeIfHandset(sidenav: any) {
    if (this.isHandset()) {
      sidenav.close();
    }
  }

  toggleTheme(forceDark?: boolean) {
    const newState = forceDark !== undefined ? forceDark : !this.isDarkMode();
    this.isDarkMode.set(newState);
    
    if (newState) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }

  onProjectChange(newId: number) {
    this.dataService.activeProyectoId.set(newId);
  }
}
