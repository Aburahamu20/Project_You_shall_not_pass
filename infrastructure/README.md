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

## Portabilidad, costo y privacidad

Sin ARN, cuenta o URL fijos; sin EC2, RDS ni NAT Gateway inicialmente. Se parametrizarán región, ambiente, tablas y proveedor. Las plantillas definirán cifrado, retención y eliminación, sin almacenamiento permanente de capturas faciales.
