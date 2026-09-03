# Frontend

Esta carpeta contendrá la aplicación web desarrollada en Visual Studio Code.

## Módulos previstos

- Simulador web del acceso sin Wokwi.
- Captura de webcam o selección de identidad ficticia.
- Panel limitado del guardia.
- Dashboard administrativo.
- Registro de visitantes.
- Aforo, presencia e historial.

## Configuración prevista

Las direcciones de AWS deberán recibirse mediante variables de entorno, por ejemplo:

```text
VITE_API_BASE_URL=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_AWS_REGION=us-east-1
```

No se guardarán credenciales AWS en el navegador.
