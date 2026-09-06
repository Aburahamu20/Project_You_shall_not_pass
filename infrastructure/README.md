# Infraestructura AWS

Contendrá AWS SAM o CloudFormation compatible con Learner Lab.

## Recursos

- DynamoDB con TTL.
- Lambda con permisos mínimos.
- API Gateway HTTPS.
- Cognito si el laboratorio permite crearlo.
- CloudWatch con retención corta.
- S3 privado y hosting si corresponde.
- Rekognition opcional y desactivado por defecto.
- Endpoints para configuración Edge, estado y sincronización idempotente.

## Portabilidad, costo y privacidad

Sin ARN, cuenta o URL fijos; sin EC2, RDS ni NAT Gateway inicialmente. Se parametrizarán región, ambiente, tablas, proveedor facial y vigencia offline. Las plantillas definirán cifrado, retención y eliminación, sin almacenamiento permanente de capturas faciales.


## Respaldo entre cuentas

La implementación futura incluirá una plantilla `template.yaml`, parámetros de ejemplo, datos ficticios iniciales y scripts de exportación/importación. No se crearán archivos vacíos antes de implementar los recursos.

Plan: [../docs/costos-y-migracion-aws.md](../docs/costos-y-migracion-aws.md).
