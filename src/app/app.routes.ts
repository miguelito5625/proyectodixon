import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Inspections } from './inspections/inspections';
import { Login } from './login/login';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'inspections', component: Inspections, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
