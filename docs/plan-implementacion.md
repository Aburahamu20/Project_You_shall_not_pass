# Plan de implementación

## Propósito

Construir el simulador por etapas pequeñas, comprobables y transportables entre cuentas AWS. Cada fase debe funcionar antes de comenzar la siguiente.

## Fases

| Fase | Objetivo | Se considera terminada cuando... |
|:---:|:---|:---|
| 0 | Preparar el proyecto | El repositorio abre en Visual Studio Code, instala dependencias y ejecuta una página básica |
| 1 | Crear el simulador web local | Se pueden capturar o simular RFID, rostro, dirección y sensor sin tomar decisiones en el navegador |
| 2 | Separar reglas y contratos | Las reglas se prueban sin depender de la interfaz, DynamoDB ni proveedores faciales |
| 3 | Crear el simulador Edge | Recibe la solicitud web, identifica dispositivo y controla el torniquete virtual |
| 4 | Conectar AWS | El Edge llama a `/api/v1/health`, AWS decide y DynamoDB guarda un evento ficticio |
| 5 | Incorporar usuarios y roles | Guardia y administrador ven únicamente las funciones permitidas |
| 6 | Incorporar continuidad offline | SQLite guarda configuración vigente, presencia, aforo y eventos pendientes |
| 7 | Incorporar sincronización | El Edge actualiza reglas cada 5 minutos y recupera eventos sin duplicarlos |
| 8 | Incorporar validación facial | `MOCK` funciona; Rekognition online y proveedor `LOCAL` se prueban de forma controlada |
| 9 | Completar pruebas y demostración | Se prueban modos, fallos, costos y recuperación en otra cuenta AWS |

## Primera funcionalidad completa

La primera demostración local deberá permitir:

1. Seleccionar una persona y una tarjeta ficticias.
2. Marcar una entrada.
3. Aumentar el aforo solamente después de confirmar el cruce.
4. Rechazar una segunda entrada si la persona todavía figura dentro.
5. Marcar la salida y disminuir el aforo.
6. Rechazar nuevas entradas cuando se alcance la capacidad máxima.
7. Mostrar el motivo de cada rechazo.
8. Guardar un historial temporal de los movimientos.

## División inicial del trabajo

El equipo puede repartir responsabilidades sin separar el proyecto en repositorios diferentes:

| Área | Carpeta principal | Responsabilidad |
|:---|:---|:---|
| Interfaz | `frontend/` | Pantallas del torniquete, guardia y administrador |
| Reglas | `backend/` | Acceso, anti-passback, aforo, visitantes y eventos |
| AWS | `infrastructure/` | SAM, API Gateway, Lambda, DynamoDB y configuración |
| Edge | `edge/` | Raspberry simulada, SQLite, sincronización, sensor y torniquete |
| Pruebas y documentación | `docs/` | Casos, evidencias, costos, privacidad y decisiones |

Una persona puede ayudar en más de un área, pero cada tarea debe tener un responsable identificado.

## Orden de las primeras ramas

1. `feature/project-bootstrap`
2. `feature/simulador-acceso-local`
3. `feature/reglas-acceso`
4. `feature/edge-simulator`
5. `feature/aws-health-check`
6. `feature/dynamodb-eventos`
7. `feature/edge-offline-sync`

Las ramas posteriores se crearán cuando las anteriores estén integradas y comprobadas.

## Criterio general de finalización

Una tarea está terminada cuando:

- Funciona según el caso de prueba relacionado.
- No contiene credenciales ni datos personales reales.
- Incluye pruebas cuando corresponde.
- No rompe funcionalidades existentes.
- Su documentación refleja el comportamiento actual.
- Otro integrante revisó el Pull Request.

## Lo que no se hará al comienzo

- Crear recursos AWS sin una plantilla o propósito comprobable.
- Utilizar rostros o documentos reales.
- Conectar hardware físico antes de tener estable el simulador Edge.
- Implementar reconocimiento facial local antes de probar el flujo con `MOCK`.
- Implementar Rekognition antes del modo `MOCK`.
- Trabajar directamente en `main`.
