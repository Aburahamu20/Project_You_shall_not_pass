# Seguridad, privacidad y roles — Diseño 2.0

## Permisos

| Función | Guardia | Administrador |
|:---|:---:|:---:|
| Ver aforo y presencia | Sí | Sí |
| Ver solicitudes y alertas | Sí | Sí |
| Crear/finalizar visita diaria | Sí | Sí |
| Reportar tarjeta perdida | Sí | Sí |
| Solicitar corrección con motivo | Sí | Sí |
| Crear personas permanentes | No | Sí |
| Asignar credenciales o perfiles | No | Sí |
| Cambiar políticas y aforo | No | Sí |
| Administrar usuarios/dispositivos | No | Sí |
| Auditoría completa | No | Sí |
| Ver capturas faciales | No | No |
| Borrar eventos desde dashboard | No | No |

Cognito y Lambda comprobarán los permisos. Ocultar botones no será suficiente.

## Biometría y privacidad

- `MOCK` será el modo inicial.
- La aplicación web solo capturará y transmitirá; no comparará identidades.
- La captura real se mantendrá solo durante la comparación en AWS o Edge.
- No se almacenará en DynamoDB, eventos, logs ni GitHub.
- Los perfiles necesarios para el proveedor `LOCAL` se almacenarán protegidos en el Edge, separados de los registros operacionales.
- El guardia verá el resultado, no el perfil biométrico.
- Si se usan personas reales se documentarán finalidad, base aplicable, consentimiento cuando corresponda, proveedor y eliminación.
- Existirá un método alternativo.

## Auditoría

Se registrarán solicitudes, validaciones, autorizaciones, rechazos, vencimientos, cruces, visitas, tarjetas, correcciones, cambios administrativos y procesos de eliminación o anonimización.

Los logs no incluirán imágenes, tokens, claves ni documentos completos.

## Correcciones

El guardia solicitará una corrección indicando motivo. Si se aprueba, el backend creará un evento compensatorio; no se sobrescribirá el evento original.

## Seguridad del servicio Edge

- Cada Edge tendrá `deviceId`, ubicación e identidad propias.
- Las credenciales del dispositivo no se guardarán en el frontend ni en GitHub.
- La configuración offline tendrá versión, integridad, fecha de generación y vencimiento.
- Una configuración nueva se activará solo después de validarse completamente.
- SQLite no contendrá contraseñas de Cognito ni fotografías faciales.
- El dashboard mostrará última sincronización, versión y eventos pendientes.
- Los eventos offline usarán identificadores únicos e idempotencia.

## Secretos y fallo seguro

- Sin archivos `.env`, claves AWS, contraseñas o tokens.
- Solo nombres de variables en `.env.example`.
- HTTPS y permisos mínimos.
- Con configuración vigente, una caída de AWS activa continuidad offline controlada.
- Después de 12 horas sin sincronización se restringen las entradas automáticas.
- Las salidas se mantienen disponibles por seguridad.
- Ante autenticación inválida, configuración dañada o fallo de SQLite se bloquean las entradas automáticas.
- Solo datos ficticios en el repositorio público.

Más detalles: [cumplimiento-legal.md](cumplimiento-legal.md).
