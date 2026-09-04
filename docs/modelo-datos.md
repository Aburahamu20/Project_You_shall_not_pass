# Modelo de datos conceptual — Diseño 1.1

## Principios

- Los eventos confirmados no se sobrescriben.
- Las correcciones crean eventos compensatorios.
- El aforo cambia únicamente al confirmar el sensor.
- Solicitudes, confirmaciones y eventos usan identificadores únicos.
- Fechas en UTC y visualización en `America/Santiago`.
- Las capturas faciales temporales no se almacenan.
- Los repositorios desacoplan la lógica de DynamoDB.

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

Son entidades conceptuales; no obligan a crear una tabla DynamoDB por entidad.

## Ejemplos

```json
{
  "requestId": "REQ-001",
  "personId": "PER-001",
  "cardUid": "01:02:03:04",
  "source": "WOKWI",
  "deviceId": "TURNSTILE-01",
  "locationId": "OFFICE-01",
  "direction": "ENTRY",
  "state": "PENDING_FACE",
  "createdAt": "2026-09-04T16:00:00Z",
  "expiresAt": "2026-09-04T16:05:00Z"
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
- Proveedor: `MOCK`, `REKOGNITION`.
- Fuente: `WEB_SIMULATOR`, `WOKWI`, `PHYSICAL_READER`.
- Solicitudes: [estados-acceso.md](estados-acceso.md).

## Consistencia

Confirmar el sensor actualizará atómicamente solicitud, evento, presencia, aforo y contador diario si se materializa. Una confirmación repetida devolverá el resultado anterior.

Los plazos están en [cumplimiento-legal.md](cumplimiento-legal.md); son configurables y no plazos legales obligatorios.
