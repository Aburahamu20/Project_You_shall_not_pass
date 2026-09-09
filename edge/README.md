# Servicio Edge - Simulador de control de acceso

Este directorio contiene el servicio Edge del proyecto **You Shall Not Pass**.

Su objetivo es simular el controlador local de un punto de acceso que posteriormente podrá ejecutarse en una Raspberry Pi 4 y comunicarse con servicios de AWS.

Actualmente funciona como una API local desarrollada con Node.js, Express y TypeScript. Los datos se mantienen temporalmente en memoria y se utilizan identidades ficticias.

## Funcionalidades implementadas

- Creación y consulta de solicitudes de acceso.
- Validación de datos con Zod.
- Verificación facial simulada mediante el proveedor `MOCK`.
- Comparación entre el propietario de la tarjeta y la identidad facial.
- Reglas contra tarjetas desconocidas o bloqueadas.
- Prevención de entradas y salidas duplicadas.
- Confirmación del cruce mediante una clave de idempotencia.
- Actualización de la presencia de las personas.
- Consulta del aforo actual.
- Bloqueo de entradas cuando el aforo está completo.
- Permiso de salida aunque el aforo esté completo.
- Expiración automática de solicitudes pendientes o autorizadas.
- Pruebas automatizadas con Vitest y Supertest.

## Tecnologías utilizadas

- Node.js
- Express
- TypeScript
- Zod
- Vitest
- Supertest

## Instalación

Desde este directorio ejecuta:

```powershell
npm.cmd install
```

## Ejecutar el servidor en desarrollo

```powershell
npm.cmd run dev
```

De forma predeterminada, la API queda disponible en:

```text
http://localhost:3001
```

## Compilar el proyecto

```powershell
npm.cmd run build
```

## Ejecutar las pruebas

```powershell
npm.cmd run test
```

## Endpoints disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Comprueba el estado del simulador Edge. |
| `POST` | `/api/v1/access-requests` | Crea una solicitud de entrada o salida. |
| `GET` | `/api/v1/access-requests/:requestId` | Consulta una solicitud existente. |
| `POST` | `/api/v1/access-requests/:requestId/face-verification` | Procesa la validación facial simulada. |
| `POST` | `/api/v1/access-requests/:requestId/confirm` | Confirma que la persona cruzó el acceso. |
| `GET` | `/api/v1/occupancy?locationId=OFFICE-01` | Consulta el aforo actual. |

## Personas ficticias

| Identidad | Tarjeta | Estado inicial | Bloqueada |
|---|---|---|---|
| Ana Torres (`1`) | `RFID-001` | Fuera | No |
| Bruno Silva (`2`) | `RFID-002` | Dentro | No |
| Camila Rojas (`3`) | `RFID-003` | Fuera | Sí |

Los datos vuelven a su estado inicial cuando se reinicia el servidor.

## Probar el flujo completo en PowerShell

Primero inicia el servidor:

```powershell
npm.cmd run dev
```

Abre otra terminal dentro del directorio `edge` y sigue estos pasos.

### 1. Comprobar el estado del servidor

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3001/health"
```

### 2. Crear una solicitud de entrada

```powershell
$body = @{
  cardUid = "RFID-001"
  direction = "ENTRY"
  source = "EDGE_SIMULATOR"
  deviceId = "TURNSTILE-01"
  locationId = "OFFICE-01"
} | ConvertTo-Json

$accessRequest = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3001/api/v1/access-requests" `
  -ContentType "application/json" `
  -Body $body

$accessRequest
```

La solicitud se crea inicialmente con el estado:

```text
PENDING_FACE
```

### 3. Simular la verificación facial

```powershell
$faceBody = @{
  provider = "MOCK"
  mockIdentityId = "1"
} | ConvertTo-Json

$faceResult = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3001/api/v1/access-requests/$($accessRequest.requestId)/face-verification" `
  -ContentType "application/json" `
  -Body $faceBody

$faceResult
```

Si la tarjeta y el rostro coinciden y todas las reglas se cumplen, la solicitud queda en estado:

```text
AUTHORIZED
```

### 4. Confirmar el cruce

```powershell
$headers = @{
  "Idempotency-Key" = [guid]::NewGuid().ToString()
}

$confirmation = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3001/api/v1/access-requests/$($accessRequest.requestId)/confirm" `
  -Headers $headers

$confirmation
```

La confirmación cambia la solicitud al estado `CONFIRMED` y actualiza la presencia de la persona.

La clave de idempotencia evita que una misma confirmación se procese más de una vez.

### 5. Consultar el aforo

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:3001/api/v1/occupancy?locationId=OFFICE-01"
```

La respuesta contiene una estructura similar a:

```json
{
  "locationId": "OFFICE-01",
  "current": 2,
  "maximum": 10,
  "status": "AVAILABLE"
}
```

## Estados de una solicitud

| Estado | Significado |
|---|---|
| `PENDING_FACE` | Esperando la validación facial. |
| `VALIDATING` | Validación en proceso. |
| `AUTHORIZED` | Acceso autorizado, esperando confirmación física. |
| `CONFIRMED` | La persona cruzó el punto de acceso. |
| `REJECTED` | Solicitud rechazada por una regla de acceso. |
| `EXPIRED` | La solicitud superó su tiempo permitido. |
| `CANCELLED` | Solicitud cancelada. |

## Reglas de acceso implementadas

Una solicitud puede rechazarse por las siguientes razones:

| Código | Motivo |
|---|---|
| `CARD_UNKNOWN` | La tarjeta no pertenece a una persona registrada. |
| `FACE_MISMATCH` | El rostro no coincide con el propietario de la tarjeta. |
| `CARD_BLOCKED` | La tarjeta está bloqueada. |
| `ALREADY_INSIDE` | La persona intenta entrar cuando ya está dentro. |
| `ALREADY_OUTSIDE` | La persona intenta salir cuando ya está fuera. |
| `CAPACITY_FULL` | El lugar alcanzó su capacidad máxima. |
| `REQUEST_EXPIRED` | La solicitud superó su tiempo permitido. |

## Limitaciones actuales

- Los datos están almacenados solamente en memoria.
- Al reiniciar el servidor se pierden las solicitudes creadas.
- El proveedor facial `MOCK` es el único operativo.
- Los proveedores `REKOGNITION` y `LOCAL` aún no están implementados.
- La aplicación todavía no utiliza una base de datos SQLite.
- La sincronización con AWS todavía no está implementada.
- El control GPIO de una Raspberry Pi todavía no está implementado.

No se guardan credenciales, fotografías ni bases de datos reales en GitHub.

## Próximas etapas

1. Conectar el frontend con la API Edge.
2. Agregar persistencia local mediante SQLite.
3. Implementar los modos sin conexión.
4. Sincronizar configuraciones y eventos con AWS.
5. Integrar un proveedor de reconocimiento facial.
6. Adaptar el servicio para una Raspberry Pi 4 física.