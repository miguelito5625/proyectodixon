import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px;">
      <h1>Gestión de Zonas</h1>
      <p>Próximamente: Vista detallada y administración de las zonas del proyecto.</p>
    </div>
  `
})
export class ZonasComponent {}
