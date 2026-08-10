---
name: build_checker
description: Verifica que el proyecto de Angular compile correctamente usando `ng build` tras realizar cambios en el código.
---

# Build Checker Skill

Cuando hayas realizado modificaciones en el código del proyecto (archivos `.ts`, `.html`, `.css`, etc.), **DEBES** seguir estas instrucciones antes de indicarle al usuario que la tarea está lista:

1. Ejecuta el comando `ng build` en la terminal.
2. Si el comando falla (por ejemplo, con errores de TypeScript o plantillas de Angular), **DEBES** analizar el mensaje de error.
3. Corrige los errores en los archivos correspondientes (usando tus herramientas de edición).
4. Vuelve a ejecutar `ng build`.
5. Repite este ciclo hasta que `ng build` sea exitoso (Exit code 0).
6. Solo cuando el proyecto compile sin errores, puedes proceder a hacer commit y notificar al usuario.
