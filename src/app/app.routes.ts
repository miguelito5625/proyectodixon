import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Inspections } from './inspections/inspections';
import { ZonasComponent } from './zonas/zonas.component';
import { LineasComponent } from './lineas/lineas.component';
import { ReportesComponent } from './reportes/reportes.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { Login } from './login/login';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'inspecciones', component: Inspections, canActivate: [authGuard] },
  { path: 'zonas', component: ZonasComponent, canActivate: [authGuard] },
  { path: 'lineas', component: LineasComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
