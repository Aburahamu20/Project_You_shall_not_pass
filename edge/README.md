# Servicio Edge — Raspberry Pi

Esta carpeta contendrá el controlador local del punto de acceso. Durante la primera implementación se ejecutará en un computador para simular una Raspberry Pi 4; posteriormente podrá desplegarse en el dispositivo físico.

## Responsabilidades

- Recibir RFID, dirección y captura facial temporal desde la aplicación.
- Comprobar la disponibilidad de AWS.
- Reenviar solicitudes al backend durante `ONLINE`.
- Mantener una instantánea local de reglas en SQLite.
- Aplicar el modo `OFFLINE_VALID` durante un máximo de 12 horas.
- Procesar el proveedor facial `LOCAL` sin guardar la captura.
- Controlar el torniquete y recibir la confirmación del sensor.
- Guardar y sincronizar eventos pendientes de forma idempotente.
- Informar modo, versión de configuración y salud al dashboard.

## Implementación gradual

1. Simulador Edge con datos ficticios y proveedor `MOCK`.
2. API local y detección de disponibilidad de AWS.
3. SQLite e instantánea de configuración.
4. Cola de eventos y recuperación de conexión.
5. Proveedor facial local.
6. Adaptadores GPIO para una Raspberry Pi 4 física.

No se guardarán credenciales, fotografías ni bases SQLite reales en GitHub.

