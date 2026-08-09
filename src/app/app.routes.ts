import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Inspections } from './inspections/inspections';
import { MaterialLog } from './material-log/material-log';
import { PiLog } from './pi-log/pi-log';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'inspections', component: Inspections },
  { path: 'material-log', component: MaterialLog },
  { path: 'pi-log', component: PiLog }
];
