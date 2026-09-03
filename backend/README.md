# Backend

Esta carpeta contendrá las funciones AWS Lambda y la lógica del sistema.

## Funciones previstas

- Crear solicitud de acceso.
- Validar RFID y estado de tarjeta.
- Asociar y validar rostro.
- Aplicar permisos y anti-passback.
- Autorizar un único paso.
- Confirmar el cruce y actualizar aforo.
- Administrar visitantes temporales.
- Consultar presencia e historial.
- Registrar auditorías y rechazos.

## Reglas de desarrollo

- La lógica no dependerá de nombres fijos de tablas.
- Las funciones recibirán configuración mediante variables de entorno.
- Las operaciones de confirmación deberán ser idempotentes.
- El acceso a DynamoDB utilizará `LabRole` en Learner Lab.
- Los errores deberán registrarse sin exponer información sensible.
