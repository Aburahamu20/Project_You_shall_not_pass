# Plan de implementación

## Propósito

Construir el simulador por etapas pequeñas, comprobables y transportables entre cuentas AWS. Cada fase debe funcionar antes de comenzar la siguiente.

## Fases

| Fase | Objetivo | Se considera terminada cuando... |
|:---:|:---|:---|
| 0 | Preparar el proyecto | El repositorio abre en Visual Studio Code, instala dependencias y ejecuta una página básica |
| 1 | Crear el simulador web local | Se pueden simular tarjetas, entradas, salidas, aforo y rechazos con datos ficticios |
| 2 | Separar el backend y las reglas | Las reglas se prueban sin depender de la interfaz, DynamoDB ni Rekognition |
| 3 | Conectar AWS | La web llama a `/api/v1/health` y guarda un evento ficticio en DynamoDB |
| 4 | Incorporar usuarios y roles | Guardia y administrador ven únicamente las funciones permitidas |
| 5 | Incorporar Wokwi | El ESP32 virtual envía un UID, recibe la decisión y representa el torniquete |
| 6 | Incorporar validación facial | El modo `MOCK` funciona y Rekognition se prueba de forma opcional y controlada |
| 7 | Completar pruebas y demostración | Se ejecutan los casos críticos, se revisan costos y se prueba la recuperación en otra cuenta |

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
| Electrónica | `wokwi/` | ESP32, RFID, luces, pantalla, sensor y servomotor |
| Pruebas y documentación | `docs/` | Casos, evidencias, costos, privacidad y decisiones |

Una persona puede ayudar en más de un área, pero cada tarea debe tener un responsable identificado.

## Orden de las primeras ramas

1. `feature/project-bootstrap`
2. `feature/simulador-acceso-local`
3. `feature/reglas-acceso`
4. `feature/aws-health-check`
5. `feature/dynamodb-eventos`

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
- Conectar Wokwi antes de tener una API estable.
- Implementar Rekognition antes del modo `MOCK`.
- Trabajar directamente en `main`.
