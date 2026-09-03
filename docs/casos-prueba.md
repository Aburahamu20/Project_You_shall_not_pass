# Casos de prueba previstos

| ID | Escenario | Datos principales | Resultado esperado |
|:---|:---|:---|:---|
| CP-01 | Entrada normal | RFID y rostro correctos, persona fuera, aforo disponible | Habilitar un paso y registrar al cruzar |
| CP-02 | Rostro incorrecto | RFID válido y rostro de otra persona | Rechazar y registrar discrepancia |
| CP-03 | RFID desconocido | UID inexistente | Rechazar |
| CP-04 | Tarjeta perdida | UID con estado `LOST` | Rechazar y alertar |
| CP-05 | Anti-passback | Persona ya figura dentro | Rechazar segunda entrada |
| CP-06 | Salida normal | Persona dentro y validación correcta | Habilitar salida y disminuir aforo al cruzar |
| CP-07 | Salida inválida | Persona figura fuera | Rechazar y no modificar aforo |
| CP-08 | Aforo lleno | Ocupación igual al máximo | Rechazar entrada |
| CP-09 | Aforo cercano al máximo | Ocupación alcanza umbral de advertencia | Autorizar si corresponde y mostrar aviso |
| CP-10 | No atraviesa | Autorización correcta sin señal del sensor | Vencer solicitud sin registrar entrada |
| CP-11 | Doble confirmación | Mismo `requestId` confirmado dos veces | Aplicar solo una modificación |
| CP-12 | Visitante autorizado | Visita activa dentro de horario | Autorizar según método definido |
| CP-13 | Visitante vencido | Hora actual posterior a `validUntil` | Rechazar |
| CP-14 | Guardia registra visitante | Datos obligatorios completos | Crear permiso diario y auditoría |
| CP-15 | Guardia cambia aforo | Rol sin permiso administrativo | Rechazar por autorización |
| CP-16 | Administrador cambia aforo | Rol correcto y valor válido | Actualizar configuración y auditar |
| CP-17 | Contador en cero | Solicitud de salida adicional | Mantener cero y rechazar |
| CP-18 | Dos computadores | Wokwi y dashboard usan la misma API | Mantener estados sincronizados |
| CP-19 | API temporalmente inaccesible | Falla de conexión | Mantener torniquete bloqueado |
| CP-20 | Corrección manual | Guardia autorizado y motivo registrado | Corregir estado con trazabilidad |

## Evidencia futura

Cuando se ejecuten las pruebas, cada caso deberá registrar:

- Fecha y responsable.
- Versión del código.
- Datos ficticios utilizados.
- Resultado obtenido.
- Captura o registro de CloudWatch cuando corresponda.
- Estado: aprobado, rechazado o pendiente.
- Observaciones y corrección aplicada.
