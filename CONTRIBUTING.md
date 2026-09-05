# Cómo colaborar en el proyecto

Esta guía permite que varios integrantes trabajen sin sobrescribir el trabajo de los demás ni exponer información sensible.

## Antes de comenzar

1. Tener instalados Git, Node.js LTS y Visual Studio Code.
2. Clonar el repositorio.
3. Leer el [plan de implementación](docs/plan-implementacion.md).
4. Elegir una tarea que no esté siendo desarrollada por otra persona.

## Regla principal

No se trabaja directamente en `main`. Cada cambio se desarrolla en una rama y se revisa mediante un Pull Request.

## Flujo de trabajo

```bash
git switch main
git pull origin main
git switch -c tipo/nombre-corto
```

Tipos de rama recomendados:

- `feature/`: nueva funcionalidad.
- `fix/`: corrección de un error.
- `docs/`: documentación.
- `test/`: pruebas.

Ejemplos:

```text
feature/simulador-rfid
feature/dashboard-guardia
fix/contador-aforo
docs/actualizar-arquitectura
```

Al terminar:

```bash
git add .
git commit -m "tipo: descripción breve"
git push -u origin nombre-de-la-rama
```

Después se abre un Pull Request hacia `main` y otro integrante revisa los cambios antes de fusionarlos.

## Reglas de seguridad

Nunca subir al repositorio:

- Credenciales o claves de AWS.
- Contraseñas, tokens o secretos.
- Archivos `.env` con valores reales.
- Fotografías o capturas faciales reales.
- RUT, documentos u otros datos personales reales.
- Exportaciones de producción o registros sensibles.

Los archivos `.env.example` solo deben contener nombres de variables y ejemplos ficticios.

## Revisión del Pull Request

Antes de aprobar, comprobar:

- El cambio corresponde a la tarea indicada.
- La aplicación sigue iniciando correctamente.
- Las pruebas relacionadas pasan.
- No se agregaron secretos ni datos reales.
- La documentación se actualizó si cambió el funcionamiento.
- El Pull Request no mezcla tareas diferentes sin justificación.

## Trabajo en equipo

- Avisar qué tarea y rama se está utilizando.
- Mantener cada cambio pequeño y fácil de revisar.
- Pedir ayuda antes de reemplazar el trabajo de otra persona.
- Registrar decisiones importantes dentro de `docs/`.
- Usar datos ficticios durante todo el desarrollo académico.
