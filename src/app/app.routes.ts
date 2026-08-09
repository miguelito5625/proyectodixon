import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Inspections } from './inspections/inspections';
import { MaterialLog } from './material-log/material-log';
import { PiLog } from './pi-log/pi-log';
import { Settings } from './settings/settings';
import { Issues } from './issues/issues';
import { Electrical } from './electrical/electrical';
import { Valves } from './valves/valves';
import { Trips } from './trips/trips';
import { Incentives } from './incentives/incentives';
import { Login } from './login/login';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'inspections', component: Inspections, canActivate: [authGuard] },
  { path: 'material-log', component: MaterialLog, canActivate: [authGuard] },
  { path: 'pi-log', component: PiLog, canActivate: [authGuard] },
  { path: 'issues', component: Issues, canActivate: [authGuard] },
  { path: 'electrical', component: Electrical, canActivate: [authGuard] },
  { path: 'valves', component: Valves, canActivate: [authGuard] },
  { path: 'trips', component: Trips, canActivate: [authGuard] },
  { path: 'incentives', component: Incentives, canActivate: [authGuard] },
  { path: 'settings', component: Settings, canActivate: [authGuard] }
];
