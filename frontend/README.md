# Frontend

Aplicación web del proyecto **Project You Shall Not Pass**.

Representa virtualmente el lector RFID, la validación facial, el torniquete, el aforo y los registros de acceso. También contendrá los paneles del guardia y del administrador.

> Actualmente AWS, Raspberry Pi, RFID y reconocimiento facial son simulados. La interfaz todavía no está conectada a servicios reales.

## Estado actual

La primera versión funcional permite:

- Simular entradas y salidas.
- Seleccionar una tarjeta RFID ficticia.
- Seleccionar un rostro ficticio.
- Comprobar que la tarjeta y el rostro pertenezcan a la misma persona.
- Rechazar tarjetas bloqueadas.
- Impedir una segunda entrada si la persona todavía aparece dentro.
- Impedir una salida si la persona no aparece dentro.
- Bloquear entradas cuando se alcance el aforo máximo.
- Habilitar virtualmente el torniquete durante tres segundos.
- Actualizar el aforo.
- Mostrar intentos autorizados y rechazados.
- Simular los estados online de AWS y offline de Raspberry Pi.
- Ejecutar pruebas automáticas sobre las reglas de acceso.

## Pendiente

Todavía falta implementar:

- Captura temporal mediante webcam.
- Comparación facial con Amazon Rekognition.
- Comparación facial local mediante Raspberry Pi.
- Comunicación con el servicio Edge.
- Backend y base de datos en AWS.
- Inicio de sesión con Amazon Cognito.
- Panel limitado del guardia.
- Dashboard administrativo.
- Registro y autorización de visitantes.
- Persistencia de eventos.
- Sincronización después de recuperar internet.
- Configuración local válida durante doce horas.
- Modo restringido cuando la configuración expire.

## Tecnologías

- React.
- TypeScript.
- Vite.
- Vitest.
- CSS.

## Ejecutar localmente

Desde la carpeta `frontend`:

```powershell
npm.cmd install
npm.cmd run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

## Revisiones del proyecto

Ejecutar las pruebas automáticas:

```powershell
npm.cmd run test
```

Revisar la calidad del código:

```powershell
npm.cmd run lint
```

Crear la versión de producción:

```powershell
npm.cmd run build
```

Antes de subir cambios se deben ejecutar los tres comandos.

## Reglas probadas automáticamente

Las pruebas verifican:

1. Acceso autorizado con RFID y rostro coincidentes.
2. Rechazo por credenciales incompletas.
3. Rechazo cuando RFID y rostro no coinciden.
4. Rechazo de una tarjeta bloqueada.
5. Rechazo de una segunda entrada.
6. Rechazo de una salida inválida.
7. Rechazo cuando el aforo está completo.

## Estructura actual

```text
src/
├── components/
│   ├── AccessForm.tsx
│   ├── AccessHistory.tsx
│   └── SummaryCard.tsx
├── data/
│   └── mockPeople.ts
├── services/
│   ├── accessRules.ts
│   └── accessRules.test.ts
├── types/
│   └── access.ts
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```

### Responsabilidad de cada parte

- `components`: elementos visuales de la aplicación.
- `data`: información ficticia para las demostraciones.
- `services`: reglas que autorizan o rechazan accesos.
- `types`: estructura que deben respetar los datos.
- `App.tsx`: coordina la pantalla y sus estados.
- `App.css`: contiene el diseño visual.

## Configuración futura

Las variables previstas son:

```text
VITE_API_BASE_URL=
VITE_EDGE_BASE_URL=http://localhost:8080
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_AWS_REGION=us-east-1
VITE_FACE_MODE=MOCK
```

`VITE_EDGE_BASE_URL` permitirá utilizar primero un servicio Edge simulado en el computador y posteriormente el servicio instalado en Raspberry Pi.

Las credenciales de AWS nunca se guardarán en el navegador ni se subirán a GitHub.

## Privacidad

Durante el desarrollo se utilizarán identidades ficticias.

Cuando se incorpore la webcam:

- El navegador solamente capturará temporalmente la imagen.
- La interfaz no decidirá por sí misma si el acceso está autorizado.
- La imagen se enviará a AWS o al servicio Edge.
- La captura se eliminará después de procesarla.
- No se almacenarán fotografías en los registros de acceso.

## Flujo actual simulado

1. La persona selecciona entrada o salida.
2. Presenta una tarjeta RFID ficticia.
3. Presenta un rostro ficticio.
4. El servicio de reglas evalúa la solicitud.
5. El torniquete se habilita o permanece bloqueado.
6. El aforo se actualiza cuando corresponde.
7. El intento queda visible en el historial.

Este flujo será conservado cuando se conecten AWS y Raspberry Pi; cambiará el origen de los datos, pero no será necesario reconstruir toda la interfaz.