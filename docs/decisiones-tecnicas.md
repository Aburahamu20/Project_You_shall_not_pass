# Decisiones técnicas

| Decisión | Motivo | Futuro posible |
|:---|:---|:---|
| Web principal | Captura, dashboard y acceso remoto; no decide el acceso | App móvil |
| Controlador Edge | Raspberry Pi 4 o simulador local | Raspberry física con GPIO |
| Arquitectura híbrida | AWS decide online y Edge mantiene continuidad offline | Varios puntos de acceso |
| Base local SQLite | Configuración y eventos pendientes sin servidor | Motor local alternativo |
| Sincronización cada 5 minutos | Mantener permisos recientes con bajo tráfico | Notificaciones push/MQTT |
| Vigencia offline de 12 horas | Limitar el uso de permisos desactualizados | Política configurable por empresa |
| Serverless | Menor administración y costo | Contenedores |
| DynamoDB | Eventos y Learner Lab | Aurora/RDS |
| Polling inicial | Simplicidad | WebSocket |
| Cognito | Usuarios y grupos | Otro proveedor |
| Proveedor facial intercambiable | `MOCK`, `REKOGNITION` y `LOCAL` sin cambiar reglas | Otro motor |
| `MOCK` inicial | Evitar costo y biometría real | Rekognition |
| API Gateway HTTP API | Menor costo por solicitud si cubre los requisitos | REST API solo si se justifica |
| API v1 + OpenAPI | Contrato común para el equipo | GraphQL |
| Repositorios | Separar dominio y DynamoDB | Otro almacenamiento |
| Eventos compensatorios | Mantener auditoría | No editar directo |
| UTC + `America/Santiago` | Evitar errores de horario | — |
| Infraestructura como código | Cambiar de Learner Lab | Creación manual |
| Método alternativo | No depender de biometría | Credencial temporal |
| Wokwi retirado del diseño activo | No simula Raspberry Pi 4 ni el respaldo Linux requerido | Demostración electrónica aislada |

## Costo

- Sin EC2, RDS ni NAT Gateway inicialmente.
- `MOCK` durante desarrollo.
- Retención corta de CloudWatch.
- TTL para solicitudes.
- Rekognition solo en demostración controlada.
- Eliminar recursos cuando no se utilicen si el laboratorio no lo hace.
- Mantener un límite interno de USD 10 y revisar el saldo después de cada jornada.
- Preparar respaldo cuando queden USD 15; detener pruebas costosas al llegar a USD 10.

Detalles: [costos-y-migracion-aws.md](costos-y-migracion-aws.md).

## Expansión

`Location`, `Device`, `AccessPolicy` y la API versionada permitirán nuevas oficinas o lectores sin reemplazar la lógica.
