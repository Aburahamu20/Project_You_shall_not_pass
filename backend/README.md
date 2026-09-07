# Backend

Contendrá las funciones Lambda y la lógica del dominio.

## Módulos

- Controladores `/api/v1`.
- Casos de uso.
- Políticas de acceso.
- Proveedores `MOCK` y `REKOGNITION`.
- Casos de uso de configuración Edge y sincronización de eventos.
- Repositorios desacoplados.
- Eventos, errores, retención y anonimización.

## Reglas

- Variables de entorno; `FACE_PROVIDER=MOCK` inicialmente.
- Confirmaciones idempotentes y transaccionales.
- Una solicitud activa por persona y dispositivo.
- Tiempo en UTC.
- Sin fotografías o secretos en logs.
- Permisos validados en backend.
- AWS será la fuente oficial de reglas y datos.
- La configuración Edge se versionará y vencerá después de 12 horas.
- Los eventos offline se recibirán con idempotencia.
- Fallo seguro y continuidad local según [modos de operación](../docs/modos-operacion.md).

Contrato: [../docs/openapi.yaml](../docs/openapi.yaml).
