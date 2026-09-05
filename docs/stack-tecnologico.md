# Stack tecnológico del proyecto

## Objetivo

Definir las herramientas comunes antes de programar para evitar que cada integrante construya una parte con tecnologías incompatibles.

## Tecnologías elegidas

| Parte | Tecnología | Motivo sencillo |
|:---|:---|:---|
| Aplicación web | React + Vite + TypeScript | Permite crear pantallas por componentes y detectar errores antes de ejecutar |
| Estilos iniciales | CSS | Evita agregar dependencias innecesarias al comienzo |
| Backend | Node.js + TypeScript | Permite usar el mismo lenguaje en la web y las funciones Lambda |
| API | Amazon API Gateway HTTP API | Conecta la web y Wokwi con AWS con bajo costo por solicitud |
| Funciones | AWS Lambda | Ejecuta las reglas solo cuando se recibe una solicitud |
| Base de datos | Amazon DynamoDB | Guarda personas, permisos, estados y eventos sin mantener un servidor |
| Autenticación | Amazon Cognito | Separa las cuentas y permisos de guardia y administrador |
| Infraestructura | AWS SAM y CloudFormation | Permite reconstruir los recursos en otra cuenta de Learner Lab |
| Simulación electrónica | Wokwi + ESP32 + Arduino C++ | Representa RFID, luces, pantalla, sensor y torniquete |
| Reconocimiento facial | Proveedor `MOCK` y luego Rekognition | Permite avanzar sin gastar créditos ni utilizar rostros reales |
| Pruebas | Vitest | Comprueba reglas del frontend y backend de forma rápida |
| Calidad de código | ESLint + Prettier | Detecta problemas comunes y mantiene un formato uniforme |
| Paquetes | npm | Se instala junto con Node.js y será común para todo el equipo |
| Control de versiones | Git + GitHub | Organiza ramas, revisiones y versiones del proyecto |

## Versiones

Durante la preparación se utilizará una versión LTS de Node.js. La versión exacta quedará registrada junto con el primer código para que todos utilicen la misma.

Las dependencias se guardarán en los archivos `package.json` y sus archivos de bloqueo. No se actualizarán todas las dependencias justo antes de una demostración.

## Organización prevista

```text
frontend/        React, Vite y TypeScript
backend/         Lambda, reglas y acceso a datos
infrastructure/  Plantilla AWS SAM
wokwi/           Circuito y código del ESP32
docs/            Diseño, decisiones y pruebas
```

## Decisiones para la primera versión

- Comenzar con datos e identidad facial ficticios.
- Probar primero la web y las reglas en local.
- Conectar AWS cuando el flujo local sea estable.
- Incorporar Wokwi después de comprobar la API.
- Probar Rekognition al final y de manera controlada.
- Evitar EC2, RDS, NAT Gateway y servidores con cobro permanente.

Cambiar una tecnología principal requerirá explicarlo en un Pull Request y actualizar este documento.
