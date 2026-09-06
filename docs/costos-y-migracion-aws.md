# Costos y migración entre cuentas AWS

## Objetivo

Mantener el prototipo dentro de los USD 50 de AWS Academy Learner Lab y poder reconstruirlo en otra cuenta si se terminan los créditos o vence el laboratorio.

Las cifras son estimaciones basadas en precios públicos de AWS para `us-east-1`. Learner Lab puede aplicar condiciones distintas, por lo que el saldo visible del laboratorio será la fuente de control operativo.

## Estimación del prototipo

Escenario mensual conservador:

- 100.000 solicitudes HTTP.
- 100.000 ejecuciones Lambda breves.
- Menos de 1 GB entre datos y archivos.
- Menos de 0,5 GB de logs.
- Hasta 1.000 imágenes procesadas por Rekognition.
- Pocos usuarios de Cognito.

| Servicio | Estimación orientativa |
|:---|---:|
| API Gateway HTTP API | Cerca de USD 0,10 por 100.000 solicitudes |
| Lambda | Menos de USD 0,30 en el escenario |
| DynamoDB bajo demanda | Centavos |
| S3 menor a 1 GB | Centavos |
| CloudWatch con logs limitados | Aproximadamente USD 0,20–0,50 |
| Rekognition | Cerca de USD 1 por 1.000 imágenes procesadas |
| Cognito con pocos usuarios | Consumo mínimo |
| Total de referencia | Menos de USD 3–5 |

No se dependerá del Free Tier para justificar el presupuesto.

Fuentes oficiales:

- [Precios de API Gateway](https://aws.amazon.com/api-gateway/pricing/)
- [Precios de Lambda](https://aws.amazon.com/lambda/pricing/)
- [Precios de DynamoDB](https://aws.amazon.com/dynamodb/pricing/)
- [Precios de S3](https://aws.amazon.com/s3/pricing/)
- [Precios de CloudWatch](https://aws.amazon.com/cloudwatch/pricing/)
- [Precios de Rekognition](https://aws.amazon.com/rekognition/pricing/)

## Presupuesto interno

| Nivel | Acción |
|:---|:---|
| USD 50–16 disponibles | Desarrollo normal con `MOCK` |
| USD 15 disponibles | Verificar respaldo y probar reconstrucción |
| USD 10 disponibles | Detener Rekognition y pruebas de alto volumen |
| USD 5 disponibles | No crear recursos nuevos; preparar migración |
| Cuenta nueva | Desplegar desde infraestructura como código |

El objetivo interno será consumir como máximo **USD 10** durante todo el prototipo, dejando margen para errores.

## Controles de costo

- `FACE_PROVIDER=MOCK` durante desarrollo.
- Rekognition solo en pruebas finales y con cantidad definida.
- API Gateway HTTP API en lugar de REST API, si cubre autenticación y rutas.
- Polling de solicitudes solo mientras exista una validación pendiente.
- Sincronización Edge cada 5 minutos, descargando datos completos solo si cambia la versión.
- Tiempo máximo de polling de 30–60 segundos.
- Sin EC2, RDS, NAT Gateway, caché de API Gateway ni Provisioned Concurrency.
- DynamoDB bajo demanda y TTL para solicitudes temporales.
- Retención corta y mensajes pequeños en CloudWatch.
- Sin fotografías en S3, DynamoDB o logs.
- Eliminar recursos de prueba duplicados.
- Revisar saldo y Cost Explorer o herramientas disponibles después de cada jornada.
- Etiquetar recursos con `Project=YouShallNotPass` y `Environment=dev`.

## Riesgos principales

1. Polling continuo desde varios computadores.
2. Enviar la misma imagen repetidamente a Rekognition.
3. Guardar capturas o respuestas completas en logs.
4. Crear servicios con cobro por hora.
5. Duplicar stacks o recursos.
6. Olvidar recursos después de las pruebas.
7. Transferir archivos grandes innecesariamente.

Un dispositivo consultando una vez por segundo durante todo un mes genera aproximadamente 2,6 millones de solicitudes. Por eso el polling tendrá duración limitada.

## Estrategia de respaldo

El respaldo principal no será una copia manual de la consola. Estará compuesto por:

| Elemento | Ubicación futura |
|:---|:---|
| Frontend, backend y servicio Edge | Repositorio GitHub |
| API y modelos | `docs/openapi.yaml` y documentación |
| Infraestructura | `infrastructure/template.yaml` |
| Parámetros sin secretos | Archivos `*.example` |
| Datos ficticios iniciales | `data/seed-*.json` |
| Configuración local inicial | `data/edge-config.example.json` |
| Exportación/importación | `scripts/` |
| Procedimiento | Este documento |

La plantilla AWS SAM definirá la aplicación serverless y CloudFormation creará los recursos. Referencia: [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).

Los archivos `template.yaml`, datos y scripts se crearán durante la implementación, cuando existan recursos reales que describir y probar.

## Respaldo por servicio

| Servicio | Qué se respalda | Cómo se recupera |
|:---|:---|:---|
| Lambda | Código y dependencias | Nuevo despliegue SAM |
| API Gateway | OpenAPI y SAM | Se crea una URL nueva |
| DynamoDB | Esquema, semillas y exportación JSON | Crear tablas e importar |
| S3 | Archivos no sensibles | Volver a publicar |
| Cognito | Configuración y grupos | Recrear usuarios ficticios |
| Rekognition | Configuración, no capturas | Reinscribir referencias autorizadas |
| CloudWatch | Configuración de retención | No migrar logs antiguos |
| Frontend | Código y variables de ejemplo | Publicar con URL nueva |
| Servicio Edge | Código y configuración sin secretos | Cambiar `API_BASE_URL` y volver a sincronizar |

AWS ofrece exportación de DynamoDB a S3 e importación en otra cuenta, pero puede requerir permisos que Learner Lab no entregue. Referencia: [migración de DynamoDB entre cuentas](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-migrating-table-between-accounts.html).

Para el volumen pequeño de la simulación se implementará además una exportación JSON controlada por la aplicación. No contendrá capturas faciales ni secretos.

## Procedimiento de migración

1. Confirmar que el repositorio está actualizado.
2. Exportar datos ficticios y configuraciones permitidas.
3. Crear o recibir el nuevo Learner Lab.
4. Configurar las credenciales temporales y `us-east-1`.
5. Ejecutar `sam build`.
6. Ejecutar `sam deploy --guided`.
7. Importar datos ficticios.
8. Recrear usuarios y grupos de Cognito.
9. Actualizar las variables del frontend y del servicio Edge con la nueva URL.
10. Probar `GET /api/v1/health`.
11. Ejecutar los casos críticos de acceso, aforo y permisos.
12. Eliminar copias temporales que ya no sean necesarias.

## Elementos que no se trasladan directamente

- Contraseñas de usuarios.
- URL anterior de API Gateway.
- Identificadores físicos, ARN y números de cuenta.
- Logs históricos de CloudWatch.
- Capturas faciales temporales.
- Credenciales AWS.

Estos valores se recrean o reemplazan mediante configuración.

## Prueba de recuperación

Antes de depender del respaldo, el equipo deberá realizar al menos una reconstrucción de prueba. Un respaldo no se considera válido solamente porque los archivos existen; debe demostrarse que permiten desplegar, cargar datos ficticios y completar un acceso de prueba.
