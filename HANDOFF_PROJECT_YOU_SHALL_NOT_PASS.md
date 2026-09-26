# Traspaso del proyecto “Project You Shall Not Pass”

**Propietario:** Abraham Castro  
**Repositorio:** `https://github.com/Aburahamu20/Project_You_shall_not_pass`  
**Fecha del traspaso:** 25 de septiembre de 2026  
**Estado:** pausado voluntariamente, guardado y funcional

## Instrucción para la próxima IA

Este documento es la fuente de continuidad del proyecto. Antes de proponer cambios:

1. Confirmar la rama y el estado real del repositorio con Git.
2. No repetir las funciones ya implementadas que aparecen en este documento.
3. Trabajar en bloques pequeños y verificables.
4. Entregar comandos para **Windows PowerShell**.
5. Ejecutar pruebas, compilación y `git status --short` antes de cada commit.
6. No hacer commits, pushes, merges ni pull requests sin que Abraham lo solicite o confirme.
7. Si se reemplaza un archivo importante, entregar el contenido completo para evitar errores al copiar fragmentos.

La frase **“sigamos con el proyecto No Pasarás”** significa que hay que retomar desde este estado.

## Contexto del proyecto

Sistema de control de acceso mediante tarjeta RFID y reconocimiento facial simulado. Representa un torniquete o puerta de oficina y permite validar entradas y salidas, controlar el aforo, bloquear tarjetas y conservar un historial de intentos.

Inicialmente fue un proyecto universitario, pero el profesor cambió el encargo por el caso Induplac. Abraham decidió conservar “Project You Shall Not Pass” como proyecto personal y de portafolio. No está abandonado.

## Estructura general

- `frontend/`: React, Vite y TypeScript.
- `edge/`: Node.js, Express y TypeScript. Simula el controlador local que posteriormente podría ejecutarse en una Raspberry Pi 4.
- `backend/`: reservado para componentes cloud.
- `infrastructure/`: reservado para infraestructura AWS.
- `docs/`: documentación general.

## Arquitectura prevista

La arquitectura final es híbrida:

- La Raspberry Pi funciona como controlador Edge.
- En modo online consulta servicios y sincroniza información con AWS.
- En modo offline utiliza reglas y usuarios almacenados localmente.
- La interfaz web permite simular tarjeta, rostro, dirección y resultados.
- La base SQLite conserva el estado local aunque Edge se reinicie.
- La sincronización con AWS se planteó inicialmente cada 12 horas.

Modos contemplados en el código:

- `ONLINE`
- `OFFLINE_VALID`
- `OFFLINE_EXPIRED`
- `SYNCING`
- `LOCKDOWN`

## Reglas funcionales implementadas

- La tarjeta RFID y el rostro son obligatorios.
- El rostro debe corresponder al propietario de la tarjeta.
- Una tarjeta bloqueada es rechazada.
- No se permite una segunda entrada si la persona ya está dentro.
- No se permite una salida si la persona ya está fuera.
- El cruce confirmado actualiza el estado `inside` de la persona.
- Una entrada confirmada aumenta `entriesToday`.
- El aforo máximo simulado es 10 personas.
- Las solicitudes expiran después de cinco minutos.
- La confirmación usa una clave de idempotencia para impedir el procesamiento duplicado.
- Solo la confirmación del cruce cambia realmente la ocupación.

## Personas simuladas

La base se inicializa solamente si la tabla `people` está vacía:

| ID | Nombre | Tarjeta | Dentro | Bloqueada | Entradas del día |
|---|---|---|---:|---:|---:|
| `1` | Ana Torres | `RFID-001` | No | No | 0 |
| `2` | Bruno Silva | `RFID-002` | Sí | No | 1 |
| `3` | Camila Rojas | `RFID-003` | No | Sí | 0 |

## API Edge disponible

Puerto predeterminado: `8080`.

- `GET /health`
- `POST /api/v1/access-requests`
- `GET /api/v1/access-requests/:requestId`
- `POST /api/v1/access-requests/:requestId/face-verification`
- `POST /api/v1/access-requests/:requestId/confirm`
- `GET /api/v1/occupancy?locationId=OFFICE-01`

El frontend se ejecuta normalmente en `http://localhost:5173` y Vite redirige `/api` hacia `http://localhost:8080`.

## Estados de las solicitudes

- `PENDING_FACE`
- `VALIDATING`
- `AUTHORIZED`
- `CONFIRMED`
- `REJECTED`
- `EXPIRED`
- `CANCELLED`

Cada solicitud almacena:

- `requestId`
- `cardUid`
- `direction`: `ENTRY` o `EXIT`
- `source`
- `deviceId`
- `locationId`
- `state`
- `reasonCode`
- `operationMode`
- `createdAt`
- `expiresAt`

## Persistencia SQLite terminada

Se utiliza `node:sqlite` incluido en Node.js 24; no se instaló `better-sqlite3` ni otra dependencia externa.

Versión de Node utilizada durante el desarrollo: `v24.20.0`.

Archivo local de producción:

```text
edge/data/edge.sqlite
```

También pueden aparecer:

```text
edge.sqlite-shm
edge.sqlite-wal
```

Estos archivos están excluidos por `.gitignore` junto con `edge/data/`, `*.db`, `*.sqlite` y variantes.

### Tablas creadas

- `people`
- `access_requests`
- `confirmation_idempotency_keys`

La clave foránea de `confirmation_idempotency_keys.request_id` utiliza `ON DELETE CASCADE`.

SQLite usa claves foráneas y modo WAL para la base guardada en disco. Las pruebas utilizan `:memory:` mediante la variable de Vitest para no modificar los datos reales.

### Persistencia de personas

`edge/src/data/mockPeople.ts` conserva la interfaz pública utilizada por el resto del sistema:

- `people`
- `findPersonByCardUid`
- `findPersonById`
- `savePerson`
- `resetPeople`

Los cambios en `inside` y `entriesToday` se guardan en SQLite mediante `savePerson`. Se comprobó manualmente que la ocupación continuaba en `2 / 10` después de reiniciar Edge.

### Persistencia de solicitudes

`edge/src/stores/accessRequestStore.ts` guarda y recupera las solicitudes y las claves de idempotencia en SQLite. Conserva estas funciones públicas:

- `saveAccessRequest`
- `findAccessRequest`
- `saveConfirmationIdempotencyKey`
- `findRequestIdByIdempotencyKey`
- `clearAccessRequests`
- `cleanupAccessRequests`

Se comprobó manualmente la persistencia reiniciando Edge. La solicitud de prueba `5a3b632e-e3be-4658-af66-635c22e9739c` continuó disponible con el estado `PENDING_FACE` y los mismos datos después del reinicio.

### Limpieza automática

La expiración que antes solo ocurría al consultar una solicitud ahora también se procesa automáticamente:

1. Al iniciar Edge.
2. Periódicamente, de manera predeterminada cada 60 minutos.

La limpieza:

- Marca como `EXPIRED` las solicitudes vencidas que estén en `PENDING_FACE`, `VALIDATING` o `AUTHORIZED`.
- Asigna `REQUEST_EXPIRED` como motivo.
- Conserva el historial durante 30 días de forma predeterminada.
- Elimina después solamente solicitudes en estados finales: `CONFIRMED`, `REJECTED`, `EXPIRED` y `CANCELLED`.
- Elimina por cascada las claves de idempotencia relacionadas.
- No elimina solicitudes activas que todavía no hayan vencido.

Variables configurables:

```text
ACCESS_REQUEST_RETENTION_DAYS=30
ACCESS_REQUEST_CLEANUP_INTERVAL_MINUTES=60
```

## Frontend terminado hasta este punto

- Formulario para seleccionar entrada o salida.
- Selección de tarjeta RFID y rostro simulado.
- Botón para validar identidad.
- Controles bloqueados mientras se procesa una validación.
- Texto `Validando…` durante el procesamiento.
- Resumen de personas dentro, modo de operación y torniquete.
- Historial de intentos autorizados y rechazados.
- Integración completa con el servicio Edge mediante `frontend/src/services/edgeApi.ts`.
- Proxy de Vite configurado hacia el puerto 8080.

Flujo completo implementado:

```text
Crear solicitud → validar rostro → autorizar/rechazar → confirmar cruce → actualizar ocupación
```

## Diseño visual implementado

La aplicación ya tiene una interfaz visual completa; no es solamente una API. La referencia visual debe mantenerse al continuar el proyecto.

### Apariencia general

- Fondo principal azul grisáceo muy claro.
- Paneles blancos con esquinas redondeadas, bordes suaves y sombra ligera.
- Tipografía oscura y de alto contraste.
- Azul como color principal para selección y acciones.
- Azul marino para el botón principal `Validar identidad`.
- Verde para estados positivos o autorizados.
- Rojo para bloqueo o rechazo.
- Diseño limpio similar a un panel administrativo moderno.

### Encabezado

En la parte superior izquierda aparece:

```text
PROJECT YOU SHALL NOT PASS
Control de acceso
```

En la esquina superior derecha aparece una cápsula verde con el texto:

```text
AWS simulado
```

### Tarjetas de resumen

Debajo del encabezado hay tres tarjetas:

| Tarjeta | Contenido visual | Ejemplo observado |
|---|---|---|
| Personas dentro | Cantidad actual sobre capacidad y disponibilidad | `1 / 10` o `2 / 10`, `Acceso disponible` |
| Modo de operación | Estado grande y descripción | `ONLINE`, `Validación mediante el servicio Edge` |
| Torniquete | Estado grande y mensaje operativo | `BLOQUEADO`, `Esperando una validación` |

`BLOQUEADO` aparece en rojo. El texto secundario del torniquete cambia según el estado del servicio o la validación.

### Zona principal

En escritorio se divide en dos paneles:

| Panel izquierdo | Panel derecho |
|---|---|
| `Simulador de validación` | `Últimos intentos` |
| Selector Entrada/Salida | Historial de solicitudes |
| Selector Tarjeta RFID | Nombre de la persona |
| Selector Rostro simulado | Dirección y hora |
| Botón Validar identidad | Motivo y resultado |

### Simulador de validación

- `Entrada` y `Salida` funcionan como pestañas dentro de una barra clara.
- La pestaña seleccionada utiliza fondo azul y texto blanco.
- Hay un selector `Tarjeta RFID` con opciones como `RFID-001 — Ana Torres`.
- Hay un selector `Rostro simulado` con el nombre de la persona.
- El botón `Validar identidad` ocupa todo el ancho del panel.
- Durante una solicitud se deshabilitan los controles y el botón muestra `Validando…`.
- Esta desactivación evita solicitudes repetidas mientras la anterior está en curso.

### Historial de intentos

Cuando no existen registros se muestra un recuadro vacío con:

```text
Todavía no existen registros.
```

Cuando existen intentos, cada uno aparece en su propia tarjeta clara e incluye:

- Nombre en negrita.
- Dirección `ENTRADA` o `SALIDA`.
- Hora del intento.
- Explicación del resultado.
- Insignia alineada a la derecha.

Estados visuales observados:

| Resultado | Insignia | Ejemplo de explicación |
|---|---|---|
| Autorizado | Cápsula verde `AUTORIZADO` | `Identidad verificada y cruce confirmado` |
| Rechazado | Cápsula roja `RECHAZADO` | `La persona ya se encuentra dentro` |

El historial más reciente aparece arriba.

### Comportamiento adaptable

- En una ventana ancha, las tres tarjetas de resumen aparecen en una fila y la zona principal usa dos columnas.
- En una ventana más estrecha, las tarjetas y paneles se apilan verticalmente.
- Los selectores y botones conservan el ancho disponible para seguir siendo utilizables.

### Componentes visuales principales

- `frontend/src/App.tsx`: estado general, comunicación con Edge y composición de la pantalla.
- `frontend/src/components/AccessForm.tsx`: dirección, tarjeta, rostro, estado de validación y botón.
- `frontend/src/components/AccessHistory.tsx`: lista de intentos y estado vacío.
- `frontend/src/components/SummaryCard.tsx`: tarjetas superiores.
- `frontend/src/services/edgeApi.ts`: comunicación con el API, sin responsabilidad visual directa.

Al modificar el frontend, la próxima IA debe conservar esta estructura visual y comprobar al menos estos estados:

1. Pantalla inicial sin historial.
2. Validación en curso con controles bloqueados.
3. Acceso autorizado.
4. Acceso rechazado.
5. Entrada y salida.
6. Diseño ancho y diseño apilado.

## Pruebas y compilación

Último resultado comprobado en `edge/`:

```text
Test Files  11 passed (11)
Tests       49 passed (49)
```

La compilación también terminó correctamente:

```powershell
npm.cmd run build
```

Las pruebas relevantes incluyen:

- Reglas de decisión de acceso.
- Creación de solicitudes.
- Verificación facial simulada.
- Confirmación del cruce.
- Ocupación.
- Salud del servidor.
- Inicialización de SQLite.
- Persistencia de personas.
- Persistencia de solicitudes e idempotencia.
- Expiración y limpieza de solicitudes antiguas.

El frontend tenía siete pruebas aprobadas antes del trabajo de SQLite.

## Estado de Git al pausar

Rama de trabajo:

```text
feature/sqlite-persistence
```

La rama quedó subida a GitHub y el último `git status --short` estaba vacío.

Commits importantes de SQLite:

| Commit | Mensaje |
|---|---|
| `ce61591` | `feat(edge): inicializar base de datos sqlite` |
| `540110b` | `feat(edge): persistir personas en sqlite` |
| `b16b8c5` | `feat(edge): persistir solicitudes en sqlite` |
| `c8b62ae` | `feat(edge): limpiar solicitudes antiguas` |

Trabajo anterior de Edge y frontend:

- Fue integrado en `main` mediante el PR #8.
- Commit de merge conocido: `049aaeb`.
- La rama antigua `feature/edge-simulator` fue eliminada del remoto después del merge.

La rama `feature/sqlite-persistence` **no se registró como fusionada con `main` al momento de pausar**. Antes de hacer cambios futuros hay que verificar GitHub y Git local.

## Comandos para retomar

Desde PowerShell:

```powershell
Set-Location "C:\Users\abrah\Desktop\Project_You_shall_not_pass"
git switch feature/sqlite-persistence
git pull --ff-only
git status --short

Set-Location edge
npm.cmd run test
npm.cmd run build
```

Resultados esperados si nada cambió:

- Rama sincronizada con `origin/feature/sqlite-persistence`.
- `git status --short` vacío.
- 11 archivos de prueba aprobados.
- 49 pruebas aprobadas.
- Compilación TypeScript sin errores.

Para iniciar el sistema se necesitan dos terminales:

```powershell
# Terminal 1
Set-Location "C:\Users\abrah\Desktop\Project_You_shall_not_pass\edge"
npm.cmd run dev
```

```powershell
# Terminal 2
Set-Location "C:\Users\abrah\Desktop\Project_You_shall_not_pass\frontend"
npm.cmd run dev
```

Luego abrir:

```text
http://localhost:5173
```

## Próximo bloque recomendado

El siguiente trabajo razonable es cerrar formalmente la rama SQLite:

1. Documentar SQLite y las dos variables de limpieza en `edge/README.md` y, si existe, `.env.example`.
2. Ejecutar nuevamente pruebas y compilación.
3. Revisar el diff completo de la rama contra `main`.
4. Crear un pull request de `feature/sqlite-persistence` hacia `main`.
5. Verificar el merge y actualizar el repositorio local.

Después se puede continuar con una de estas etapas:

- Sincronización Edge ↔ AWS y cola para eventos offline.
- Administración de usuarios, tarjetas, dispositivos y sedes.
- Visitantes autorizados por el guardia durante un día.
- Dashboard con filtros e informes.
- Simulación o integración física con Raspberry Pi, lector RFID, cámara y relé/torniquete.

## Mejoras necesarias para uso empresarial real

Aunque el prototipo funcione al 100 %, para convertirlo en un producto real habría que agregar:

- Detección de vida para impedir el uso de fotografías ante la cámara.
- Cifrado y protección de datos biométricos.
- Permisos administrativos y auditoría.
- Copias de seguridad.
- Actualizaciones seguras.
- Protección física de la Raspberry Pi.
- Apertura de emergencia y salidas que nunca queden bloqueadas.
- Evaluación legal y consentimiento para usar reconocimiento facial.
- Pruebas de seguridad y funcionamiento continuo.

También podría evolucionar a un servicio mensual para que distintas empresas administren sedes, dispositivos, usuarios e informes. Eso requeriría una arquitectura multiempresa, autenticación, aislamiento de datos, facturación, monitoreo y soporte.

## Forma de trabajo acordada con Abraham

- Explicar en español y con pasos claros.
- Utilizar comandos de PowerShell.
- Avanzar en bloques pequeños con commits separados.
- Revisar siempre pruebas, build y estado de Git antes de guardar un bloque.
- Si VS Code muestra errores, resolverlos antes del commit.
- No confundir este proyecto con el nuevo caso universitario Induplac.
- No reiniciar el desarrollo desde cero: el sistema Edge, frontend y SQLite ya están funcionales.
