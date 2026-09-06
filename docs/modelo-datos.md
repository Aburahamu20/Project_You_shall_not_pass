# Modelo de datos conceptual — Diseño 2.0

## Principios

- Los eventos confirmados no se sobrescriben.
- Las correcciones crean eventos compensatorios.
- El aforo cambia únicamente al confirmar el sensor.
- Solicitudes, confirmaciones y eventos usan identificadores únicos.
- Fechas en UTC y visualización en `America/Santiago`.
- Las capturas faciales temporales no se almacenan.
- Los repositorios desacoplan la lógica de DynamoDB.
- DynamoDB es la fuente oficial; SQLite contiene una copia local limitada.
- Los eventos offline se anexan y sincronizan mediante identificadores únicos.

## Entidades lógicas

| Entidad | Función |
|:---|:---|
| `Person` | Identidad y estado general |
| `Card` | RFID, propietario y estado |
| `BiometricProfile` | Referencia restringida; nunca la captura |
| `Visitor` | Permiso diario y guardia |
| `AccessRequest` | Flujo activo |
| `AccessEvent` | Hecho y código de resultado |
| `Presence` | Dentro/fuera |
| `Occupancy` | Aforo por ubicación |
| `AccessPolicy` | Reglas de acceso |
| `Location` | Oficina o zona |
| `Device` | Torniquete o simulador |
| `User` | Guardia o administrador |
| `PrivacyConsent` | Evidencia cuando corresponda |
| `RetentionPolicy` | Plazo y acción final |
| `EdgeDevice` | Identidad, ubicación, modo y salud del controlador local |
| `ConfigurationSnapshot` | Versión, generación, vencimiento e integridad de reglas offline |
| `SyncState` | Última sincronización correcta y cantidad de eventos pendientes |
| `PendingEvent` | Evento local pendiente de confirmación en AWS |

Son entidades conceptuales; no obligan a crear una tabla DynamoDB por entidad.

## Ejemplos

```json
{
  "requestId": "REQ-001",
  "personId": "PER-001",
  "cardUid": "01:02:03:04",
  "source": "EDGE_SIMULATOR",
  "deviceId": "TURNSTILE-01",
  "locationId": "OFFICE-01",
  "operationMode": "ONLINE",
  "direction": "ENTRY",
  "state": "PENDING_FACE",
  "createdAt": "2026-09-04T16:00:00Z",
  "expiresAt": "2026-09-04T16:05:00Z"
}
```

```json
{
  "deviceId": "TURNSTILE-01",
  "locationId": "OFFICE-01",
  "operationMode": "OFFLINE_VALID",
  "configurationVersion": 16,
  "lastSyncedAt": "2026-09-06T14:00:00Z",
  "validUntil": "2026-09-07T02:00:00Z",
  "pendingEventCount": 3
}
```

```json
{
  "eventId": "EVT-001",
  "requestId": "REQ-001",
  "eventType": "ACCESS_REJECTED",
  "reasonCode": "ALREADY_INSIDE",
  "occurredAt": "2026-09-04T16:00:05Z",
  "deviceId": "TURNSTILE-01",
  "locationId": "OFFICE-01",
  "retentionUntil": "2026-12-03T16:00:05Z"
}
```

## Valores controlados

- Tarjeta: `ACTIVE`, `BLOCKED`, `LOST`, `EXPIRED`.
- Presencia: `OUTSIDE`, `INSIDE`, `UNKNOWN`.
- Proveedor: `MOCK`, `REKOGNITION`, `LOCAL`.
- Fuente: `WEB_SIMULATOR`, `EDGE_SIMULATOR`, `RASPBERRY_PI`, `PHYSICAL_READER`.
- Modo: `ONLINE`, `OFFLINE_VALID`, `OFFLINE_EXPIRED`, `SYNCING`, `LOCKDOWN`.
- Solicitudes: [estados-acceso.md](estados-acceso.md).

## Consistencia

La confirmación del sensor actualizará atómicamente la solicitud, el evento, la presencia, el aforo y el contador diario cuando se concrete el cruce. Una confirmación repetida devolverá el resultado anterior.

Durante el modo offline, SQLite realizará la transición local y guardará el evento como `PENDING_SYNC`. AWS aplicará la misma idempotencia al recibirlo y devolverá una confirmación sin sobrescribir el evento original.

Los plazos están en [cumplimiento-legal.md](cumplimiento-legal.md); son configurables y no son plazos legales obligatorios.
