# Seguridad y roles

## Roles

### Guardia

Puede:

- Consultar aforo y presencia actual.
- Ver solicitudes recientes y alertas.
- Registrar, autorizar y finalizar visitas del día.
- Reportar tarjetas perdidas.
- Solicitar una corrección manual indicando un motivo.

No puede:

- Crear empleados permanentes.
- Asignar rostros o credenciales permanentes.
- Cambiar capacidad o reglas generales.
- Administrar cuentas de otros usuarios.
- Alterar o eliminar el historial.

### Administrador

Puede realizar las acciones del guardia y además:

- Crear o desactivar personas.
- Asignar y bloquear credenciales.
- Administrar permisos permanentes.
- Configurar aforo y torniquetes.
- Administrar cuentas y roles.
- Consultar auditorías completas.

## Aplicación de permisos

La aplicación podrá ocultar opciones según el rol, pero AWS Lambda también deberá comprobar los permisos en el backend. Nunca se aceptará una acción privilegiada solamente porque proviene del dashboard.

## Auditoría

Las siguientes operaciones generarán un evento:

- Acceso autorizado.
- Acceso rechazado y motivo.
- Autorización vencida sin cruce.
- Creación o finalización de visitante.
- Bloqueo o reporte de tarjeta.
- Corrección manual de presencia.
- Cambio administrativo de permisos o capacidad.

## Datos biométricos

Durante el prototipo se utilizarán identidades ficticias. Si se incorporan rostros reales posteriormente, el equipo deberá definir consentimiento, acceso limitado, tiempo de conservación y eliminación segura antes de capturarlos.

## Secretos y configuración

- No subir archivos `.env`.
- No incluir claves de acceso de AWS.
- No incluir contraseñas ni tokens en Wokwi.
- No hacer pública información real de empleados o visitantes.
- Mantener un archivo `.env.example` únicamente con nombres de variables.
