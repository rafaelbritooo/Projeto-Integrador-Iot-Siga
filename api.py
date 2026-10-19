from http.server import BaseHTTPRequestHandler, HTTPServer
import json

latest_data = None

class ApiHandler(BaseHTTPRequestHandler):
    def send_json(self, status, data):
        response = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"ok": True, "service": "Joyce API"})
        elif self.path == "/api/latest":
            self.send_json(200, latest_data or {"message": "Nenhum dado recebido ainda"})
        else:
            self.send_error(404, "Rota nao encontrada")

    def do_POST(self):
        global latest_data

        if self.path != "/api/sensor-data":
            self.send_error(404, "Rota nao encontrada")
            return

        try:
            size = int(self.headers.get("Content-Length", 0))
            latest_data = json.loads(self.rfile.read(size).decode("utf-8"))
            print("\nDados recebidos pela Joyce:")
            print(json.dumps(latest_data, indent=2, ensure_ascii=False))
            self.send_json(201, {"ok": True})
        except Exception as e:
            self.send_json(400, {"ok": False, "error": str(e)})

    def log_message(self, format, *args):
        return

print("API Siga rodando em http://127.0.0.1:8000")
HTTPServer(("0.0.0.0", 8000), ApiHandler).serve_forever()
