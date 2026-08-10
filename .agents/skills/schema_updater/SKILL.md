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

## 2. Ejecutar los Cambios y Sincronizar (Modo Estricto)

El objetivo de esta skill es que la base de datos coincida **exactamente** con lo que está definido en `extras/schema.sql` (ni más, ni menos). Dado que `schema.sql` suele usar solo `CREATE TABLE IF NOT EXISTS`, ejecutarlo directamente no borra las tablas eliminadas del archivo. Por lo tanto, debes seguir estos pasos:

1. **Obtener tablas remotas:** Ejecuta `npx supabase db query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" --linked`
2. **Comparar:** Compara la lista de tablas remotas devuelta por el comando con las tablas explícitamente definidas en `extras/schema.sql`.
3. **Limpiar sobrantes:** Si encuentras tablas en la base remota que **no** están en el archivo `schema.sql`, elimínalas primero ejecutando:
   `npx supabase db query "DROP TABLE IF EXISTS tabla1, tabla2 CASCADE;" --linked`
4. **Aplicar el nuevo esquema:** Inyecta el contenido del archivo SQL a Supabase utilizando el siguiente comando en la terminal (PowerShell):

```powershell
npx supabase db query --file extras/schema.sql --linked
```

## 3. Validación

1. Lee el resultado del comando. Si recibes errores de sintaxis o fallas de permisos, arréglalos y repite.
2. Si el comando se ejecuta con éxito, notifica al usuario que los cambios a la base de datos se han aplicado correctamente en producción (o en el entorno vinculado).
