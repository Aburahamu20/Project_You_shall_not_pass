# Casos de prueba previstos — Diseño 2.0

| ID | Escenario | Resultado esperado |
|:---|:---|:---|
| CP-01 | RFID y rostro correctos | Autorizar un paso |
| CP-02 | Rostro incorrecto | `FACE_MISMATCH` |
| CP-03 | RFID desconocido | `CARD_UNKNOWN` |
| CP-04 | Tarjeta perdida | `CARD_LOST` |
| CP-05 | Segunda entrada | `ALREADY_INSIDE` |
| CP-06 | Salida normal | Disminuir aforo |
| CP-07 | Salida de una persona que figura fuera | `ALREADY_OUTSIDE` |
| CP-08 | Aforo lleno | `CAPACITY_FULL` |
| CP-09 | Autorización sin cruce | Vencer sin cambiar aforo |
| CP-10 | Visitante vigente | Autorizar |
| CP-11 | Visitante vencido | `PERMISSION_EXPIRED` |
| CP-12 | Sin permiso | `PERMISSION_DENIED` |
| CP-13 | Error facial | Bloquear y registrar |
| CP-14 | Método alternativo | Autorizar con trazabilidad |
| CP-15 | Doble confirmación | Cambiar aforo una sola vez |
| CP-16 | Dos entradas simultáneas | Una sola solicitud activa |
| CP-17 | Dos torniquetes con un último cupo | Autorizar uno |
| CP-18 | Reintento HTTP | Devolver resultado previo |
| CP-19 | Solicitud vencida confirmada | No alterar estado |
| CP-20 | Guardia cambia aforo | `FORBIDDEN` |
| CP-21 | Guardia consulta biometría | `FORBIDDEN` |
| CP-22 | Sin autenticación | `UNAUTHORIZED` |
| CP-23 | Dispositivo desconocido | `DEVICE_UNKNOWN` |
| CP-24 | AWS inaccesible con configuración vigente | Cambiar a `OFFLINE_VALID` |
| CP-25 | Corrección manual | Evento compensatorio |
| CP-26 | Captura procesada | No aparece en base ni logs |
| CP-27 | Identidad ficticia | Funciona con `MOCK` |
| CP-28 | Solicitud alcanza TTL | Eliminación controlada |
| CP-29 | Evento cumple retención | Eliminar o anonimizar |
| CP-30 | Cambio de consentimiento | Registrar fecha y efecto |
| CP-31 | Edge y dashboard en dos PCs | Compartir solicitud y estado mediante AWS |
| CP-32 | UTC mostrado en Chile | Conversión correcta |
| CP-33 | Horario de verano | Mantener UTC correcto |
| CP-34 | Cambio de proveedor | No cambiar políticas |
| CP-35 | Cambio de Learner Lab | Solo configuración |
| CP-36 | Configuración alcanza 12 horas | Cambiar a `OFFLINE_EXPIRED` |
| CP-37 | Salida en modo restringido | Permitir salida segura y registrar |
| CP-38 | Entrada automática con configuración vencida | Rechazar |
| CP-39 | Tarjeta conocida durante modo offline | Aplicar permiso, rostro, presencia y aforo local |
| CP-40 | Tarjeta desconocida durante modo offline | `CARD_UNKNOWN` |
| CP-41 | Tarjeta bloqueada localmente | `CARD_BLOCKED` o `CARD_LOST` |
| CP-42 | Descarga de configuración dañada | Conservar la última copia válida |
| CP-43 | No existen cambios de configuración | Mantener versión sin descargar datos completos |
| CP-44 | Evento offline pendiente | Persistir en SQLite tras reinicio |
| CP-45 | Regresa AWS | Enviar pendientes y cambiar a `ONLINE` |
| CP-46 | Evento offline reenviado | No duplicar movimiento ni aforo |
| CP-47 | Visitante previamente sincronizado | Respetar su vigencia original |
| CP-48 | Visitante nuevo offline | Exigir excepción de guardia con motivo |
| CP-49 | PC captura imagen | No reconocer ni decidir en el navegador |
| CP-50 | Rostro online | Procesar mediante `MOCK` o Rekognition en AWS |
| CP-51 | Rostro offline | Procesar mediante `MOCK` o proveedor `LOCAL` en Edge |

## Evidencia futura

Cada prueba registrará responsable, fecha, versión, datos ficticios, resultado esperado y obtenido, estado y evidencia. Se ocultarán tokens, imágenes y datos personales.
