# Contexto del Proyecto: FireSafety Ops Web App

Este documento mantiene el contexto general y la arquitectura del proyecto para que los agentes de IA comprendan rápidamente su estructura, tecnologías y convenciones sin tener que analizar todo el repositorio desde cero.

## 1. Descripción General
- **Nombre:** FireSafety Ops Web App
- **Propósito:** Aplicación web para el control de operaciones de seguridad contra incendios, registro de inspecciones, bitácora de materiales (submittals), pendientes (issues) y pruebas técnicas (eléctricas, válvulas, trips y pruebas por zona - PI LOG).
- **Stack Tecnológico:**
  - **Frontend:** Angular 17+ (Standalone Components).
  - **UI/Estilos:** Angular Material, CSS Vanilla, diseños y temas modernos (incluyendo *dark mode* interactivo).
  - **Backend / Base de Datos:** Supabase (Autenticación y base de datos PostgreSQL).
  - **Gráficas:** Chart.js con `ng2-charts` para visualización de datos en dashboards.

## 2. Estructura del Proyecto
El código fuente principal se encuentra en `src/app/` y se organiza modularmente (por funcionalidad):

- `app.ts` / `app.routes.ts`: Archivos principales de la aplicación y enrutamiento con navegación (Sidenav) y protección de rutas (`AuthGuard`).
- `supabase.service.ts`: Servicio encargado de la comunicación con Supabase (Autenticación e interacciones con la Base de Datos).
- `login/`: Módulo de autenticación que gestiona el acceso seguro a la app.
- `dashboard/`: Pantalla de inicio con métricas de KPI (tarjetas numéricas) y gráficas con animaciones integradas.
- `inspections/`, `issues/`, `material-log/`, `incentives/`: Módulos operativos.
- `electrical/`, `pi-log/`, `trips/`, `valves/`: Módulos técnicos.
- `settings/`: Configuración y catálogos de la plataforma.

**Nota sobre scripts externos:**
Los scripts de migración de datos (Python) y los archivos de Excel de respaldo o importación se almacenan fuera de `src`, dentro de la carpeta `/extras/` para mantener limpio el entorno Angular.

## 3. Decisiones de Diseño y Patrones
- **Componentes Standalone:** Angular está configurado para no usar `NgModules`. Cada componente importa sus dependencias directamente.
- **Signals:** Se prioriza el uso de *Signals* (introducidos en Angular recientes) sobre RxJS (`BehaviorSubject`/`Observable`) para el manejo del estado local en los componentes.
- **Autenticación:** Utiliza Supabase Auth. El sistema restringe el acceso al layout principal si no se detecta una sesión válida. (Si el usuario es "dixon", se asume el dominio internamente o acepta correos completos).
- **Estética:** Se favorecen colores vibrantes, *glassmorphism* u oscuros, priorizando animaciones fluidas y una experiencia premium.

---
*Este documento debe actualizarse constantemente a medida que se implementen grandes cambios arquitectónicos o nuevas funcionalidades en el proyecto.*
