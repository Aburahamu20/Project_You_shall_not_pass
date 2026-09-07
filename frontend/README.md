# Frontend

Contendrá la aplicación web y los dashboards.

## Módulos

- RFID web.
- Webcam temporal o identidad ficticia; el navegador no realiza la comparación facial.
- Método alternativo.
- Panel limitado del guardia.
- Dashboard administrativo.
- Visitantes, aforo, presencia y eventos.
- Estado online/offline, última sincronización y eventos pendientes.

## Privacidad

La captura facial no se guardará en el navegador y se descartará después de enviarse a AWS o al servicio Edge. El guardia no verá fotografías ni perfiles. Las demostraciones usarán datos ficticios.

## Configuración

```text
VITE_API_BASE_URL=
VITE_EDGE_BASE_URL=http://localhost:8080
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_AWS_REGION=us-east-1
VITE_FACE_MODE=MOCK
```

`VITE_EDGE_BASE_URL` permitirá usar el simulador local y posteriormente una Raspberry Pi sin reescribir la interfaz. No se guardarán credenciales AWS en el navegador.
