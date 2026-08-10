import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px;">
      <h1>Configuración</h1>
      <p>Próximamente: Ajustes del sistema y preferencias de usuario.</p>
    </div>
  `
})
export class ConfiguracionComponent {}
