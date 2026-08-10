import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px;">
      <h1>Reportes</h1>
      <p>Próximamente: Módulo de generación y exportación de reportes PDF/Excel.</p>
    </div>
  `
})
export class ReportesComponent {}
