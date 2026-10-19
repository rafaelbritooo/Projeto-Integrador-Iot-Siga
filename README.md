# Joyce IoT — código simplificado

## Testar no VS Code sem ESP32

1. Abra esta pasta no VS Code.
2. No terminal 1, execute `python api.py`.
3. No terminal 2, execute `python simulador.py`.

O simulador envia 10 leituras fictícias e não aciona uma bomba física.

## Executar no ESP32

`main.py` é para ESP32 com MicroPython, não para o Python comum do computador. Edite o Wi-Fi, o IP do computador na `API_URL`, a profundidade da câmara e confirme a pinagem.

Pinagem de exemplo: TRIG 5, ECHO 18, sensor analógico de chuva 35 e relé 26. O relé está configurado como ativo em LOW. Se usar HC-SR04, adapte o sinal ECHO de 5 V para um nível seguro ao ESP32. Nunca conecte a bomba diretamente ao GPIO.

O código liga a bomba em 50 cm e desliga quando o nível cai para 20 cm ou menos. A profundidade de 80 cm e os limites são exemplos para validar com a equipe. `rain_sensor_raw` é uma leitura analógica bruta, não milímetros de chuva. Se o pluviômetro do projeto for de báscula/pulsos, será preciso adaptar a leitura.
