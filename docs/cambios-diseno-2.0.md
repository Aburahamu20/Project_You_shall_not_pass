# Cambios del Diseño 2.0

## Motivo

El Diseño 1.1 dependía de AWS para cada acceso y utilizaba un ESP32 virtual en Wokwi. El Diseño 2.0 introduce un controlador local compatible con Raspberry Pi para que el punto de acceso continúe funcionando de manera limitada cuando AWS no esté disponible y aclara dónde se captura, procesa y almacena cada dato.

## Antes y después

| Área | Diseño 1.1 | Diseño 2.0 |
|:---|:---|:---|
| Controlador | ESP32 virtual en Wokwi | Raspberry Pi 4 o simulador Edge |
| Aplicación web | Captura y validación facial | Captura y visualización, sin decisión de seguridad |
| Operación online | Web/Wokwi llaman directamente a AWS | Edge coordina y AWS decide |
| Operación offline | Torniquete bloqueado | Continuidad local controlada |
| Base local | No definida | SQLite |
| Reglas offline | No definidas | Instantánea versionada desde AWS |
| Frecuencia | No definida | Inicio, cada 5 minutos y reconexión |
| Vigencia | No definida | 12 horas |
| Recuperación | Reintento HTTP | Cola de eventos, idempotencia y reconciliación |
| Rostro offline | No disponible | Proveedor `LOCAL` futuro; `MOCK` inicialmente |
| Arquitectura | Diagrama de servicios | Capas, flujos, datos, protocolos y fallos |

## Elementos conservados

- Aplicación React, Vite y TypeScript.
- API `/api/v1` y contrato OpenAPI.
- Lambda, DynamoDB, Cognito, Rekognition y CloudWatch.
- Reglas de permisos, aforo, anti-passback y visitantes.
- Autorización de un paso confirmada mediante sensor.
- Identificadores únicos, idempotencia y eventos compensatorios.
- Privacidad, datos ficticios e infraestructura como código.

## Elementos retirados del diseño activo

- Wokwi y ESP32 como controlador principal.
- Procesamiento o decisión facial en el navegador.
- Bloqueo total inmediato ante cualquier interrupción de AWS.
- Suposición de que una aplicación publicada en cloud siempre estará disponible.

Wokwi queda registrado como alternativa evaluada, pero no forma parte de la implementación activa del Diseño 2.0.

