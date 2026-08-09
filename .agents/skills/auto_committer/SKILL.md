---
name: auto_committer
description: Skill diseñada para registrar (commit) y subir (push) automáticamente los cambios al repositorio de GitHub al finalizar tareas o por petición explícita del usuario.
---

# Auto Committer

Esta skill te da instrucciones para mantener el repositorio Git actualizado en todo momento tras haber modificado código fuente o configuraciones en el espacio de trabajo.

## Instrucciones de Ejecución

Cuando el usuario pida aplicar cambios, completar una tarea de código, o invoque expresamente esta skill, debes seguir este flujo de trabajo obligatoriamente:

1. **Añadir cambios al staging area:**
   Ejecuta el comando en terminal:
   `git add .`

2. **Crear el commit:**
   Ejecuta el comando en terminal generando un mensaje claro que describa lo que hiciste en este turno:
   `git commit -m "<breve resumen de los cambios (ej. feat: agrega modulo de PI LOG)>"`

3. **Subir cambios a remoto:**
   Ejecuta el comando en terminal para subir a GitHub:
   `git push`

4. **Confirmación:**
   Informa al usuario en tu respuesta final de chat que los cambios se subieron con éxito a GitHub.
