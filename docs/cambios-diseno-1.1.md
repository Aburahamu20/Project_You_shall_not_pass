# Cambios del Diseño 1.1

## Objetivo

Refinar el diseño conceptual sin cambiar la idea original ni comenzar todavía la implementación.

| Área | Diseño inicial | Diseño 1.1 |
|:---|:---|:---|
| API | Rutas preliminares | `/api/v1` y OpenAPI |
| Estados | Estados generales | Máquina de estados controlada |
| Concurrencia | No detallada | Una solicitud activa e idempotencia |
| Rostro | Rekognition opcional | `MOCK` y `REKOGNITION` |
| RFID | Web o Wokwi | Fuente, dispositivo y lugar |
| Reglas | Dentro de Lambda | Políticas separadas |
| Datos | Entidades iniciales | Eventos, perfiles y retención |
| Correcciones | Cambio manual | Evento compensatorio |
| Errores | Mensaje libre | Códigos estandarizados |
| Privacidad | Datos ficticios | Privacidad desde el diseño |
| Pruebas | Funcionales | Concurrencia, seguridad y privacidad |

## Lo que no cambia

- Web como simulador principal.
- Wokwi como complemento electrónico.
- AWS como punto común entre computadores.
- Guardia limitado y administrador completo.
- Anti-passback, aforo, visitantes y tarjetas perdidas.
- Arquitectura serverless compatible con Learner Lab.

## Historial

Los usuarios no podrán modificar o borrar eventos desde el dashboard. Las correcciones generarán nuevos eventos. La eliminación o anonimización ocurrirá únicamente mediante la política de conservación.

## Alcance

Este diseño define cómo se construirá. El código, infraestructura, circuito y pruebas ejecutadas pertenecen a fases posteriores.
