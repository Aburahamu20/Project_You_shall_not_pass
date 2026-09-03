# Infraestructura AWS

Esta carpeta contendrá las plantillas para desplegar el proyecto en AWS Academy Learner Lab.

## Recursos previstos

- Tablas DynamoDB.
- Funciones Lambda.
- API Gateway.
- Configuración permitida de Cognito.
- Permisos compatibles con `LabRole`.
- Logs de CloudWatch.
- Hosting estático si el laboratorio lo permite.

## Objetivo de portabilidad

La infraestructura deberá poder recrearse en una segunda cuenta de Learner Lab con el menor número posible de cambios. Se evitarán identificadores de cuenta, ARN y URL escritos directamente en el código.

Cuando comience la implementación se evaluará AWS SAM o CloudFormation, según los permisos disponibles en el laboratorio.
