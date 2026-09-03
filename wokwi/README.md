# Simulación electrónica en Wokwi

Esta carpeta contendrá el firmware y el diagrama de la parte electrónica virtual.

## Componentes previstos

- ESP32.
- Lector RFID MFRC522.
- Tarjetas con UID ficticios.
- Servomotor que represente el torniquete.
- LED verde, amarillo y rojo.
- Pantalla LCD u OLED.
- Sensor o botón para confirmar el cruce.
- Buzzer opcional para rechazos o alertas.

## Integración prevista

El ESP32 se conectará a internet mediante la simulación Wi-Fi de Wokwi y utilizará HTTP para comunicarse con API Gateway.

Secuencia:

1. Leer el UID.
2. Enviar una solicitud a AWS.
3. Esperar la validación facial realizada desde la aplicación web.
4. Consultar el estado de la solicitud.
5. Mover el servomotor si fue autorizada.
6. Enviar la confirmación del sensor.
7. Volver al estado bloqueado.

No se incluirán claves privadas de AWS ni datos personales reales dentro del proyecto de Wokwi.
