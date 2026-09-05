# Simulación electrónica en Wokwi

Contendrá ESP32, MFRC522, UID ficticios, servomotor, semáforo, pantalla, sensor y buzzer opcional.

## Integración

El ESP32 llamará `/api/v1` con `source=WOKWI`, `deviceId`, `locationId` y dirección.

1. Leer RFID.
2. Crear una solicitud única.
3. Esperar la validación web.
4. Consultar el mismo `requestId`.
5. Habilitar un paso solo en `AUTHORIZED`.
6. Confirmar con clave idempotente.
7. Volver a bloqueado.

Ante error, vencimiento o pérdida de red, permanecerá bloqueado. No incluirá claves AWS ni datos personales.
