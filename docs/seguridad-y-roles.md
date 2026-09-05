# Seguridad, privacidad y roles — Diseño 1.1

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
- La captura real se mantendrá solo durante la comparación.
- No irá a DynamoDB, eventos, logs o GitHub.
- El guardia verá el resultado, no el perfil biométrico.
- Si se usan personas reales se documentarán finalidad, base aplicable, consentimiento cuando corresponda, proveedor y eliminación.
- Existirá un método alternativo.

## Auditoría

Se registrarán solicitudes, validaciones, autorizaciones, rechazos, vencimientos, cruces, visitas, tarjetas, correcciones, cambios administrativos y procesos de eliminación o anonimización.

Los logs no incluirán imágenes, tokens, claves ni documentos completos.

## Correcciones

El guardia solicitará una corrección indicando motivo. Si se aprueba, el backend creará un evento compensatorio; no se sobrescribirá el evento original.

## Secretos y fallo seguro

- Sin archivos `.env`, claves AWS, contraseñas o tokens.
- Solo nombres de variables en `.env.example`.
- HTTPS y permisos mínimos.
- El torniquete queda bloqueado ante fallas de autenticación, red o backend.
- Solo datos ficticios en el repositorio público.

Más detalles: [cumplimiento-legal.md](cumplimiento-legal.md).
