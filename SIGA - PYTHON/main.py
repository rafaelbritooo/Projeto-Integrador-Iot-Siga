import time
import network
import urequests
import ujson
import gc

from machine import Pin, time_pulse_us


# ==========================================
# CONFIGURACOES GERAIS
# ==========================================

WIFI_SSID = "moto g54 5G_7947"
WIFI_PASSWORD = "82jose45"

API_URL = "http:// 10.137.222.4:8000/api/sensor-data"
DEVICE_CODE = "SIGA-ESP32-01"

CHAMBER_DEPTH_CM = 80.0

# A BOMBA LIGA QUANDO A DISTANCIA CHEGAR A 2 CM
LIMITE_CM = 7.0

SEND_INTERVAL = 10
WIFI_SCAN_INTERVAL = 300


# ==========================================
# PINOS
# ==========================================

TRIG_PIN = 4
ECHO_PIN = 5
RAIN_SENSOR_PIN = 21
RELAY_PIN = 23

trig = Pin(TRIG_PIN, Pin.OUT)
trig.value(0)

echo = Pin(ECHO_PIN, Pin.IN, Pin.PULL_DOWN)

rain_sensor = Pin(RAIN_SENSOR_PIN, Pin.IN)


# ==========================================
# RELE E BOMBA
# ==========================================

# True = rele ativo em LOW
# False = rele ativo em HIGH

RELE_ATIVO_EM_LOW = True

relay = Pin(
    RELAY_PIN,
    Pin.OUT,
    value=1 if RELE_ATIVO_EM_LOW else 0
)

pump_on = False


def bomba(ligar):
    global pump_on

    pump_on = bool(ligar)

    if RELE_ATIVO_EM_LOW:
        relay.value(0 if pump_on else 1)
    else:
        relay.value(1 if pump_on else 0)

    print(
        "BOMBA:",
        "LIGADA" if pump_on else "DESLIGADA"
    )


# Inicia com a bomba desligada
bomba(False)


# ==========================================
# CONEXAO WI-FI
# ==========================================

wifi = network.WLAN(network.STA_IF)
wifi.active(True)

wifi_connect_started = None


def connect_wifi():
    global wifi_connect_started

    if wifi.isconnected():
        wifi_connect_started = None
        return True

    if wifi_connect_started is None:
        try:
            print("Conectando ao Wi-Fi...")

            wifi.connect(WIFI_SSID, WIFI_PASSWORD)

            wifi_connect_started = time.time()

        except Exception as error:
            print("Erro ao iniciar conexao Wi-Fi:", error)
            return False

    if time.time() - wifi_connect_started >= 20:

        print("Tempo limite da conexao Wi-Fi excedido.")

        try:
            wifi.disconnect()
        except Exception as error:
            print("Erro ao desconectar Wi-Fi:", error)

        wifi_connect_started = None
        return False

    return False


# ==========================================
# VARREDURA DE REDES WI-FI
# ==========================================

last_wifi_scan = 0
cached_wifi_networks = []


def format_mac(mac):
    return ":".join("%02X" % value for value in mac)


def scan_wifi_networks(force=False):
    global last_wifi_scan
    global cached_wifi_networks

    current_time = time.time()

    if (
        not force
        and current_time - last_wifi_scan < WIFI_SCAN_INTERVAL
    ):
        return cached_wifi_networks

    try:
        print("Buscando redes Wi-Fi proximas...")

        access_points = []

        for item in wifi.scan():

            ssid, bssid, channel, rssi, authmode, hidden = item

            if not bssid:
                continue

            access_points.append({
                "macAddress": format_mac(bssid),
                "signalStrength": rssi,
                "channel": channel
            })

        access_points.sort(
            key=lambda item: item["signalStrength"],
            reverse=True
        )

        cached_wifi_networks = access_points[:15]
        last_wifi_scan = current_time

        print("Redes encontradas:", len(cached_wifi_networks))

    except Exception as error:
        print("Erro na varredura Wi-Fi:", error)

    return cached_wifi_networks


# ==========================================
# SENSOR ULTRASSONICO HC-SR04
# ==========================================

def ler_distancia():

    leituras = []

    try:

        for _ in range(3):

            trig.value(0)
            time.sleep_us(2)

            trig.value(1)
            time.sleep_us(10)

            trig.value(0)

            duracao = time_pulse_us(echo, 1, 30000)

            if duracao <= 0:
                raise OSError(
                    "Sem resposta do sensor ultrassonico"
                )

            distancia = duracao / 58.0

            # Permite leituras proximas de 2 cm.
            # Abaixo da distancia minima recomendada,
            # a precisao do HC-SR04 pode ser comprometida.

            if distancia < 1.0 or distancia > 400:
                raise OSError(
                    "Leitura ultrassonica fora do intervalo valido"
                )

            leituras.append(distancia)

            time.sleep_ms(60)

        # Verifica se as leituras estao estaveis
        if max(leituras) - min(leituras) > 2:
            raise OSError(
                "Leituras ultrassonicas instaveis"
            )

        leituras.sort()

        # Retorna a leitura mediana
        return round(leituras[1], 1)

    except Exception as error:

        print("Erro na leitura do ultrassonico:", error)

        return None


# ==========================================
# CALCULO DO NIVEL DE AGUA
# ==========================================

def calcular_nivel(distancia):

    nivel = CHAMBER_DEPTH_CM - distancia

    nivel = max(
        0,
        min(CHAMBER_DEPTH_CM, nivel)
    )

    return round(nivel, 1)


# ==========================================
# CONTROLE DA BOMBA
# ==========================================

def controlar_bomba(distancia):

    # Liga quando a distancia for 2 cm ou menor
    if distancia <= LIMITE_CM:

        if not pump_on:
            print("LIMITE DE 2 CM ATINGIDO!")
            print("ACIONANDO BOMBA...")

            bomba(True)

    # Desliga quando a distancia ultrapassar 2 cm
    else:

        if pump_on:
            print("DISTANCIA ACIMA DE 2 CM.")
            print("DESLIGANDO BOMBA...")

            bomba(False)


# ==========================================
# ENVIO DOS DADOS PARA O LARAVEL
# ==========================================

def enviar_dados(distancia):

    if not connect_wifi():

        print("Wi-Fi indisponivel.")
        print("Controle local continua funcionando.")

        return

    nivel = calcular_nivel(distancia)

    status = "critical" if pump_on else "normal"

    redes_wifi = scan_wifi_networks()

    data = {
        "device_code": DEVICE_CODE,
        "water_level_cm": nivel,
        "rain_sensor_raw": rain_sensor.value(),
        "water_status": status,
        "pump_on": pump_on,
        "simulation": False,
        "wifi_access_points": redes_wifi
    }

    print("--------------------------------")
    print("DISPOSITIVO:", DEVICE_CODE)
    print("DISTANCIA:", distancia, "cm")
    print("NIVEL ESTIMADO:", nivel, "cm")
    print("LIMITE DA BOMBA:", LIMITE_CM, "cm")
    print("CHUVA:", data["rain_sensor_raw"])
    print("STATUS:", status)
    print("BOMBA:", "LIGADA" if pump_on else "DESLIGADA")
    print("REDES WI-FI:", len(redes_wifi))
    print("--------------------------------")

    response = None

    try:

        response = urequests.post(
            API_URL,
            data=ujson.dumps(data),
            headers={
                "Content-Type": "application/json"
            }
        )

        print("HTTP:", response.status_code)
        print("Resposta:", response.text)

    except Exception as error:

        print("Erro ao enviar dados para a API:", error)

    finally:

        if response is not None:
            response.close()

        gc.collect()


# ==========================================
# INICIALIZACAO DO SISTEMA
# ==========================================

print("================================")
print("SIGA - MONITORAMENTO INICIADO")
print("================================")

print("DISPOSITIVO:", DEVICE_CODE)
print("LIMITE PARA LIGAR:", LIMITE_CM, "cm")

connect_wifi()

ultimo_envio = time.time() - SEND_INTERVAL


# ==========================================
# LOOP PRINCIPAL
# ==========================================

while True:

    try:

        distancia = ler_distancia()

        if distancia is None:

            print("Leitura invalida.")
            print("Bomba desligada por seguranca.")

            bomba(False)

        else:

            print("--------------------------------")
            print("DISTANCIA DETECTADA:", distancia, "cm")

            controlar_bomba(distancia)

            print(
                "ESTADO DA BOMBA:",
                "LIGADA" if pump_on else "DESLIGADA"
            )

            # Envia dados a cada 10 segundos
            if time.time() - ultimo_envio >= SEND_INTERVAL:

                ultimo_envio = time.time()

                enviar_dados(distancia)

        # Tenta reconectar ao Wi-Fi sem interromper
        # o controle local da bomba.

        connect_wifi()

    except Exception as error:

        print("Erro inesperado:", error)

        bomba(False)

    time.sleep(1)

    gc.collect()