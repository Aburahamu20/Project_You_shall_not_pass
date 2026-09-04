# Frontend

Contendrá la aplicación web y los dashboards.

## Módulos

- RFID web.
- Webcam temporal o identidad ficticia.
- Método alternativo.
- Panel limitado del guardia.
- Dashboard administrativo.
- Visitantes, aforo, presencia y eventos.

## Privacidad

La captura facial no se guardará localmente y se descartará después de comparar. El guardia no verá fotografías ni perfiles. Las demostraciones usarán datos ficticios.

## Configuración

```text
VITE_API_BASE_URL=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_AWS_REGION=us-east-1
VITE_FACE_MODE=MOCK
```

No se guardarán credenciales AWS en el navegador.
