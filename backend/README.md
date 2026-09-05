# Backend

Contendrá las funciones Lambda y la lógica del dominio.

## Módulos

- Controladores `/api/v1`.
- Casos de uso.
- Políticas de acceso.
- Proveedores `MOCK` y `REKOGNITION`.
- Repositorios desacoplados.
- Eventos, errores, retención y anonimización.

## Reglas

- Variables de entorno; `FACE_PROVIDER=MOCK` inicialmente.
- Confirmaciones idempotentes y transaccionales.
- Una solicitud activa por persona y dispositivo.
- Tiempo en UTC.
- Sin fotografías o secretos en logs.
- Permisos validados en backend.
- Fallo seguro: torniquete bloqueado.

Contrato: [../docs/openapi.yaml](../docs/openapi.yaml).
