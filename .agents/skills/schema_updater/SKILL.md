---
name: schema_updater
description: Ejecuta los cambios del archivo `extras/schema.sql` en la base de datos de Supabase utilizando el CLI.
---

# Supabase Schema Updater Skill

Cuando hayas realizado modificaciones en el archivo `extras/schema.sql` (o cuando el usuario te pida explícitamente que apliques los cambios a la base de datos), **DEBES** seguir estas instrucciones:

## 1. Verificación de Entorno (Prerrequisitos)

Antes de intentar ejecutar nada, necesitas asegurarte de que el proyecto está vinculado a Supabase.
Verifica si existe el archivo `supabase/config.toml` (o similar) ejecutando un comando de revisión de directorio o usando tus herramientas, o directamente intenta ejecutar el comando `npx supabase status`.

- **Si el comando falla o te pide iniciar sesión:**
  **DEBES** detenerte y pedirle al usuario que abra una nueva terminal y ejecute los siguientes comandos manualmente antes de continuar:
  1. `npx supabase login` (Crear un token y pegarlo).
  2. `npx supabase link --project-ref [TU_PROJECT_REF]` (Para vincular su proyecto en la nube con esta carpeta).

- **Si el comando funciona y el proyecto está vinculado:** Puedes pasar al Paso 2.

## 2. Ejecutar los Cambios (PowerShell)

Dado que el entorno del usuario es Windows (PowerShell), inyecta el contenido del archivo SQL a Supabase utilizando el siguiente comando en la terminal:

```powershell
npx supabase db query --file extras/schema.sql --linked
```

## 3. Validación

1. Lee el resultado del comando. Si recibes errores de sintaxis o fallas de permisos, arréglalos y repite.
2. Si el comando se ejecuta con éxito, notifica al usuario que los cambios a la base de datos se han aplicado correctamente en producción (o en el entorno vinculado).
