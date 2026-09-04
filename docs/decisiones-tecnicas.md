# Decisiones técnicas

| Decisión | Motivo | Futuro posible |
|:---|:---|:---|
| Web principal | Cámara, dashboard y acceso remoto | App móvil |
| Wokwi complementario | Electrónica sin hardware | ESP32 físico |
| Serverless | Menor administración y costo | Contenedores |
| DynamoDB | Eventos y Learner Lab | Aurora/RDS |
| Polling inicial | Simplicidad | WebSocket |
| Cognito | Usuarios y grupos | Otro proveedor |
| Proveedor facial intercambiable | Avanzar sin Rekognition | Otro motor |
| `MOCK` inicial | Evitar costo y biometría real | Rekognition |
| API v1 + OpenAPI | Contrato común para el equipo | GraphQL |
| Repositorios | Separar dominio y DynamoDB | Otro almacenamiento |
| Eventos compensatorios | Mantener auditoría | No editar directo |
| UTC + `America/Santiago` | Evitar errores de horario | — |
| Infraestructura como código | Cambiar de Learner Lab | Creación manual |
| Método alternativo | No depender de biometría | Credencial temporal |

## Costo

- Sin EC2, RDS ni NAT Gateway inicialmente.
- `MOCK` durante desarrollo.
- Retención corta de CloudWatch.
- TTL para solicitudes.
- Rekognition solo en demostración controlada.
- Eliminar recursos cuando no se utilicen si el laboratorio no lo hace.

## Expansión

`Location`, `Device`, `AccessPolicy` y la API versionada permitirán nuevas oficinas o lectores sin reemplazar la lógica.
