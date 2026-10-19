import time
from machine import Pin, ADC, time_pulse_us
import network
import urequests
import ujson
import gc

# Configurações
WIFI_SSID = "NOME_DO_WIFI"
WIFI_PASSWORD = "SENHA_DO_WIFI"
API_URL = "http://192.168.0.103:8000/api/sensor-data"
CHAMBER_DEPTH_CM = 80
PUMP_ON_CM = 50
PUMP_OFF_CM = 20

# Sensores e relé
trigger = Pin(5, Pin.OUT)
echo = Pin(18, Pin.IN)
rain_sensor = ADC(Pin(35))
rain_sensor.atten(ADC.ATTN_6DB)
relay = Pin(26, Pin.OUT)
relay.value(1)  # Relé ativo em LOW: começa desligado.
pump_on = False

# Conexão Wi-Fi
wifi = network.WLAN(network.STA_IF)
wifi.active(True)
if not wifi.isconnected():
    wifi.connect(WIFI_SSID, WIFI_PASSWORD)
    while not wifi.isconnected():
        time.sleep(1)
print("Wi-Fi conectado:", wifi.ifconfig()[0])


def read_sensors():
    try:
        trigger.value(0)
        time.sleep_us(2)
        trigger.value(1)
        time.sleep_us(10)
        trigger.value(0)

        pulse = time_pulse_us(echo, 1, 30000)
        if pulse <= 0:
            raise OSError("Sem leitura do sensor de nível")

        distance = pulse * 0.0343 / 2
        level = max(0, min(CHAMBER_DEPTH_CM, CHAMBER_DEPTH_CM - distance))
        return round(level, 1), rain_sensor.read()
    except Exception as e:
        print("Erro na leitura:", e)
        return None, None


def send_data():
    global pump_on
    level, rain = read_sensors()
    if level is None:
        return

    if level >= PUMP_ON_CM:
        pump_on = True
    elif level <= PUMP_OFF_CM:
        pump_on = False
    relay.value(0 if pump_on else 1)

    if level >= PUMP_ON_CM:
        status = "critical"
    elif level >= PUMP_OFF_CM:
        status = "attention"
    else:
        status = "normal"
    data = {
        "water_level_cm": level,
        "rain_sensor_raw": rain,
        "water_status": status,
        "pump_on": pump_on,
        "simulation": False
    }

    try:
        response = urequests.post(API_URL, data=ujson.dumps(data), headers={"Content-Type": "application/json"})
        print("Servidor respondeu:", response.text)
        response.close()
    except Exception as e:
        print("Erro ao enviar dados:", e)
    gc.collect()


while True:
    send_data()
    time.sleep(10)
    gc.collect()
