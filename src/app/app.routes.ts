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

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'inspections', component: Inspections },
  { path: 'material-log', component: MaterialLog },
  { path: 'pi-log', component: PiLog },
  { path: 'issues', component: Issues },
  { path: 'electrical', component: Electrical },
  { path: 'valves', component: Valves },
  { path: 'trips', component: Trips },
  { path: 'incentives', component: Incentives },
  { path: 'settings', component: Settings }
];
