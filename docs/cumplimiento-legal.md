# Cumplimiento legal y privacidad

## Alcance

Orientación de diseño para una simulación académica en Chile. No constituye asesoría jurídica ni certifica una eventual instalación real.

## Normativa considerada

| Norma o criterio | Relación |
|:---|:---|
| [Ley 19.628](https://www.bcn.cl/leychile/navegar?idNorma=141599) | Marco vigente sobre datos personales |
| [Ley 21.719](https://www.bcn.cl/leychile/navegar?idNorma=1209272) | Nueva regulación y Agencia de Protección de Datos; vigencia desde el 1 de diciembre de 2026 |
| [Código del Trabajo](https://www.bcn.cl/leychile/navegar?idNorma=207436) | Relevante si se convierte en control de asistencia |
| [ORD. N.º 91 de la DT](https://www.dt.gob.cl/legislacion/1624/w3-article-127462.html) | Consentimiento expreso para biometría en asistencia |
| [Ley 21.663](https://www.bcn.cl/leychile/navegar?idNorma=1202434) | Referencia de ciberseguridad |
| [Ley 20.422](https://www.bcn.cl/leychile/Navegar?idLey=20422) | Referencia para accesibilidad |

El proyecto se preparará para la Ley 21.719 aunque todavía no esté vigente al aprobarse este diseño.

## Finalidad

Solo control de acceso, aforo, presencia, visitantes, investigación de intentos y auditoría. No se reutilizarán los datos para productividad, perfiles, publicidad u otros fines incompatibles.

## Modo ficticio

- Personas, UID, documentos e identidades faciales ficticias.
- `MOCK` como proveedor predeterminado.
- Ningún dato real en GitHub.

Si excepcionalmente se usan personas reales, antes deberán definirse finalidad, información entregada, base jurídica aplicable, consentimiento cuando corresponda, responsable, proveedor, plazo y eliminación. Una instalación empresarial necesitaría revisión jurídica específica.

## Minimización y alternativa

- No guardar video ni captura facial.
- No registrar imágenes o documentos completos.
- Mostrar al guardia solo el resultado.
- Separar identidad, perfil biométrico y auditoría.
- Evitar RUT en demostraciones.
- Ofrecer RFID más guardia, código temporal o validación manual auditada.

## Conservación inicial

| Dato | Plazo de diseño | Acción |
|:---|:---|:---|
| Captura facial | Solo durante comparación | Descartar |
| Solicitud incompleta | 5–10 minutos | TTL |
| Permiso visitante | Hasta vencimiento | Desactivar |
| Eventos | 90 días iniciales | Eliminar o anonimizar |
| CloudWatch | Periodo corto | Eliminar automáticamente |
| Perfil real de prueba | Hasta terminar prueba | Eliminar referencia |

Son decisiones del prototipo, no plazos legales obligatorios.

## Seguridad y derechos

El diseño permitirá localizar datos por persona, corregir mediante trazabilidad y ejecutar bloqueo, eliminación o anonimización cuando corresponda. Estas acciones serán restringidas y auditadas.

El guardia verá información operacional; el administrador configurará el sistema; el responsable del proyecto definirá finalidad y conservación. AWS será el proveedor tecnológico y se documentarán región, servicios y flujo.

## AWS

- Región inicial `us-east-1`.
- HTTPS, cifrado y permisos mínimos.
- Sin capturas en DynamoDB o CloudWatch.
- Documentar si una prueba real implica tratamiento fuera de Chile.
- Eliminar referencias y recursos al terminar.

Referencia: [protección de datos en Rekognition](https://docs.aws.amazon.com/rekognition/latest/dg/data-protection.html).

## Acceso versus asistencia

El prototipo controla acceso físico y cuenta movimientos. No es un sistema certificado de asistencia laboral. Convertirlo en registro oficial de jornada exige revisar requisitos adicionales.
