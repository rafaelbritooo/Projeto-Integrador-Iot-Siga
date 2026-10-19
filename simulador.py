import time
import json
from urllib.request import Request, urlopen

API_URL = "http://127.0.0.1:8000/api/sensor-data"
PUMP_ON_CM = 50
PUMP_OFF_CM = 20
levels = [49, 50, 21,20]
pump_on = False


def send_data(cycle):
    global pump_on
    level = levels[cycle % len(levels)]
    rain = 1200 + cycle * 100  # Valores fictícios para testar a API.

    if level >= PUMP_ON_CM:
        pump_on = True
    elif level <= PUMP_OFF_CM:
        pump_on = False

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
        "simulation": True
    }

    request = Request(API_URL, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=5) as response:
        print("Enviado:", data, "| HTTP", response.status)


for i in range(10):
    try:
        send_data(i)
        time.sleep(1)
    except Exception as e:
        print("Erro. Confira se api.py está rodando:", e)
        break
