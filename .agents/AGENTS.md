# Proyecto: FireSafety Ops Web App

## Reglas del Agente (Rules)

1. **Auto Committer:** Siempre que completes una tarea solicitada por el usuario que involucre crear o modificar archivos en el proyecto, debes asegurarte de registrar y subir los cambios a GitHub. Si es necesario, invoca la skill `auto_committer` o ejecuta directamente los comandos de git para añadir, hacer commit y empujar los cambios (add, commit, push).

2. **Mantener Contexto del Proyecto:** Existe un archivo llamado `.agents/project_context.md` que contiene un resumen de la arquitectura, tecnologías y estructura del proyecto. Cada vez que realices cambios significativos en el proyecto (nuevos módulos, nuevas tecnologías, cambios arquitectónicos importantes), debes actualizar obligatoriamente este archivo para reflejar el estado actual del proyecto.
