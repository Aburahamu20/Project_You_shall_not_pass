# Modelo de datos conceptual

## Principios

- Los movimientos confirmados son inmutables.
- El estado actual de una persona debe concordar con su último movimiento.
- El aforo cambia únicamente después de la confirmación del sensor.
- Cada solicitud y evento utiliza un identificador único.
- Las fechas se guardan en UTC y se muestran con la zona horaria de Chile.

## Entidades

### Persona

```json
{
  "personId": "PER-001",
  "name": "Usuario de prueba",
  "type": "EMPLOYEE",
  "presenceStatus": "OUTSIDE",
  "active": true,
  "createdAt": "2026-09-03T16:00:00Z"
}
```

### Tarjeta

```json
{
  "cardUid": "01:02:03:04",
  "personId": "PER-001",
  "status": "ACTIVE",
  "reportedLostAt": null
}
```

### Visitante

```json
{
  "visitorId": "VIS-001",
  "name": "Visitante de prueba",
  "hostPersonId": "PER-001",
  "reason": "Reunión",
  "validFrom": "2026-09-03T13:00:00Z",
  "validUntil": "2026-09-03T21:00:00Z",
  "authorizedBy": "USR-GUARD-01",
  "status": "AUTHORIZED"
}
```

### Solicitud de acceso

```json
{
  "requestId": "REQ-001",
  "turnstileId": "TORNIQUETE-01",
  "cardUid": "01:02:03:04",
  "personId": "PER-001",
  "direction": "ENTRY",
  "status": "PENDING_FACE",
  "expiresAt": "2026-09-03T16:00:20Z"
}
```

### Evento

```json
{
  "eventId": "EVT-001",
  "requestId": "REQ-001",
  "personId": "PER-001",
  "direction": "ENTRY",
  "result": "AUTHORIZED",
  "reason": "ACCESS_CONFIRMED",
  "method": "RFID_AND_FACE",
  "turnstileId": "TORNIQUETE-01",
  "createdAt": "2026-09-03T16:00:10Z"
}
```

### Aforo

```json
{
  "locationId": "OFICINA-01",
  "currentOccupancy": 12,
  "maximumCapacity": 25,
  "updatedAt": "2026-09-03T16:00:10Z"
}
```

## Valores controlados

### Estado de presencia

- `OUTSIDE`: puede solicitar entrada.
- `INSIDE`: puede solicitar salida.
- `UNKNOWN`: requiere revisión manual.

### Estado de tarjeta

- `ACTIVE`
- `BLOCKED`
- `LOST`
- `EXPIRED`

### Estado de solicitud

- `PENDING_FACE`
- `VALIDATING`
- `AUTHORIZED`
- `REJECTED`
- `CROSSED`
- `EXPIRED`

## Consistencia

La confirmación del cruce deberá actualizar conjuntamente el movimiento, el estado de presencia y el aforo. DynamoDB permite aplicar escrituras condicionales y transacciones para impedir que dos solicitudes modifiquen incorrectamente el mismo estado.
