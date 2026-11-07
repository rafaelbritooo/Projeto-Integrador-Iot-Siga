import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import { C, cardStyle, ic, Badge, LevelBar, rainfallData, visibleAlerts, visibleDevices, SensorCircle } from "../data/sigaData";
import { MapViewportController, deviceToMarkerStatus } from "./Map";

export function KpiCard({ label1, label2, value, sub, subColor, iconBg, icon }: {
  label1: string; label2: string; value: number | string; sub: string; subColor: string; iconBg: string; icon: React.ReactNode;
}) {
  return (
    <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 20, padding: "0 24px", height: 118, flex: 1 }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.secondaryText, margin: 0 }}>{label1}</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.secondaryText, margin: 0 }}>{label2}</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: C.mainText, margin: "4px 0 2px", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: subColor, fontWeight: 500, margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}

export function DashboardHome({ selectedCity, selectedNeighborhood }: { selectedCity: string; selectedNeighborhood: string }) {
  const [range, setRange] = useState("Últimos 12 meses");
  const selectedDevices = visibleDevices.filter(device => device.city === selectedCity && device.neighborhood === selectedNeighborhood);
  const selectedAlerts = visibleAlerts.filter(alert => alert.city === selectedCity && alert.neighborhood === selectedNeighborhood);
  const selectedDevice = selectedDevices[0];
  const selectedAlert = selectedAlerts[0];
  const rainfallFactorByNeighborhood: Record<string, number> = { "Lagoa Seca": 1, Centro: 0.82, "Alto da Penha": 0.68 };
  const rainfallFactor = rainfallFactorByNeighborhood[selectedNeighborhood] ?? 0;
  const selectedRainfallData = rainfallData.map(item => ({ ...item, mm: Math.round(item.mm * rainfallFactor) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* KPIs */}
      <div style={{ display: "flex", gap: 22 }}>
        <KpiCard label1="Dispositivos" label2="Registrados" value={selectedDevices.length} sub="No local selecionado" subColor={C.secondaryText} iconBg="#EBF3FF"
          icon={<svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 6C10 6 6 12 6 12H10C10 12 12.5 9 16 9C19.5 9 22 12 22 12H26C26 12 22 6 16 6Z" fill={C.primaryBlue} opacity="0.3"/><path d="M16 8C11.5 8 8 13 8 13H12C12 13 13.8 10.5 16 10.5C18.2 10.5 20 13 20 13H24C24 13 20.5 8 16 8Z" fill={C.primaryBlue}/><circle cx="16" cy="20" r="4" fill={C.primaryBlue}/><circle cx="16" cy="20" r="2" fill="white"/><path d="M8 22 Q12 20 16 22 Q20 24 24 22" stroke={C.primaryBlue} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
        />
        <KpiCard label1="Dispositivos" label2="Ativos" value={selectedDevices.filter(device => device.status === "Ativo").length} sub="Online agora" subColor={C.green} iconBg={C.lightGreen}
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill={C.green}/></svg>}
        />
        <KpiCard label1="Alertas" label2="Hoje" value={selectedAlerts.length} sub="No local selecionado" subColor={C.red} iconBg={C.lightRed}
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/></svg>}
        />
        <KpiCard label1="Áreas" label2="Monitoradas" value={selectedDevices.length > 0 ? 1 : 0} sub="Região coberta" subColor={C.secondaryText} iconBg="#F3EEFF"
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>}
        />
      </div>

      {/* Chart + Alerts row */}
      <div style={{ display: "flex", gap: 22, alignItems: "stretch" }}>
        <div style={{ flex: "0 0 58%", display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Rainfall chart */}
          <div style={{ ...cardStyle, padding: "22px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.mainText }}>Índice de Chuvas por Mês</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>{ic.info()}</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select value={range} onChange={e => setRange(e.target.value)} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.mainText, background: C.card, cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
                  <option>Últimos 12 meses</option><option>Últimos 6 meses</option><option>Este ano</option>
                </select>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>{ic.dots()}</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={selectedRainfallData} barSize={20} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.secondaryText }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 600]} ticks={[0, 150, 300, 450, 600]} tick={{ fontSize: 11, fill: C.secondaryText }} axisLine={false} tickLine={false} label={{ value: "mm", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 10, fill: C.secondaryText } }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, boxShadow: "0 4px 12px rgba(15,39,71,0.08)" }} formatter={(v: number) => [`${v} mm`, "Índice de Chuva"]} />
                <Bar dataKey="mm" fill={C.primaryBlue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: C.primaryBlue, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: C.secondaryText }}>Índice de Chuva (mm)</span>
            </div>
          </div>
          {/* Monitoring map */}
          <div style={{ ...cardStyle, padding: "20px 22px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.mainText }}>Mapa de Monitoramento</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {[["#13B866", "Normal"], ["#F5A900", "Atenção"], ["#FF3838", "Risco"]].map(([color, label]) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.secondaryText }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />{label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ height: 230, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <MapContainer center={selectedDevice ? [selectedDevice.lat, selectedDevice.lng] : [-7.26, -39.36]} zoom={selectedDevice ? 15 : 11} style={{ height: "100%", width: "100%" }} zoomControl scrollWheelZoom={false}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapViewportController devices={selectedDevices} selectedDevice={selectedDevice ?? null} focusKey={`${selectedCity}-${selectedNeighborhood}`} />
                {selectedDevices.map(device => <SensorCircle key={device.id} lat={device.lat} lng={device.lng} status={deviceToMarkerStatus(device) === "risk" ? "risk" : "normal"} label={device.name} />)}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Alerts panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.mainText }}>Alertas Recentes</span>
              <button style={{ fontSize: 13, fontWeight: 500, color: C.primaryBlue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Ver todos</button>
            </div>
            <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>
              {selectedAlert ? <div style={{ background: C.lightRed, border: "1px solid #FFD0D0", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFEBEB", border: "2px solid #FFBBBB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ic.water()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.mainText, lineHeight: 1.3 }}>{selectedAlert.title}</span>
                      <span style={{ background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>Risco de Alagamento</span>
                    </div>
                    <p style={{ fontSize: 13, color: C.secondaryText, margin: "0 0 10px", lineHeight: 1.5 }}>{selectedAlert.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.secondaryText }}>
                      {ic.clock()}<span>há 5 minutos</span>
                      <span style={{ width: 1, height: 12, background: "#CBD5E1", margin: "0 2px" }} />
                      <span>Sensor: {selectedAlert.sensor}</span>
                    </div>
                  </div>
                </div>
              </div> : <div style={{ padding: 28, textAlign: "center", color: C.secondaryText, fontSize: 13 }}>Nenhum alerta para o local selecionado.</div>}
              <div style={{ height: 200, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, marginTop: 12 }}>
                <MapContainer center={selectedDevice ? [selectedDevice.lat, selectedDevice.lng] : [-7.26, -39.36]} zoom={selectedDevice ? 15 : 11} style={{ height: "100%", width: "100%" }} zoomControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} attributionControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapViewportController devices={selectedDevices} selectedDevice={selectedDevice ?? null} focusKey={`${selectedCity}-${selectedNeighborhood}-alert`} />
                  {selectedDevice && <>
                    <CircleMarker center={[selectedDevice.lat, selectedDevice.lng]} radius={22} pathOptions={{ color: C.red, weight: 1, fillColor: C.red, fillOpacity: 0.15 }} />
                    <CircleMarker center={[selectedDevice.lat, selectedDevice.lng]} radius={13} pathOptions={{ color: "#fff", weight: 3, fillColor: C.red, fillOpacity: 1 }} />
                    <CircleMarker center={[selectedDevice.lat, selectedDevice.lng]} radius={5} pathOptions={{ color: "#fff", weight: 0, fillColor: "#fff", fillOpacity: 1 }} />
                  </>}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Devices table */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px 16px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.mainText }}>Dispositivos Registrados</span>
          <button style={{ fontSize: 13, fontWeight: 500, color: C.primaryBlue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Ver todos</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["NOME","TIPO","STATUS","LOCALIDADE","ÚLTIMA LEITURA","NÍVEL ATUAL","IDENTIFICADOR","AÇÕES"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontSize: 11, fontWeight: 600, color: C.secondaryText, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {selectedDevices.map(device => <tr key={device.id}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EBF3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primaryBlue} strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill={C.primaryBlue}/></svg>
                    </div>
                    <span style={{ fontWeight: 600, color: C.mainText }}>{device.name}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 20px", color: C.secondaryText }}>{device.type}</td>
                <td style={{ padding: "16px 20px" }}><Badge label={device.status} /></td>
                <td style={{ padding: "16px 20px", color: C.secondaryText }}>{device.neighborhood}</td>
                <td style={{ padding: "16px 20px", color: C.secondaryText, lineHeight: 1.5 }}>{device.lastRead}<br/><span style={{ fontSize: 12, color: "#94A3B8" }}>{device.lastReadDate}</span></td>
                <td style={{ padding: "16px 20px" }}><LevelBar pct={device.level} /></td>
                <td style={{ padding: "16px 20px", color: C.secondaryText, fontFamily: "monospace", fontSize: 13 }}>{device.identifier}</td>
                <td style={{ padding: "16px 20px" }}><button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6 }}>{ic.dots()}</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.secondaryText }}>Mostrando {selectedDevices.length} de {selectedDevices.length} dispositivo{selectedDevices.length !== 1 ? "s" : ""}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 7, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic.chevL()}</button>
            <button style={{ width: 30, height: 30, border: "none", borderRadius: 7, background: C.primaryBlue, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>1</button>
            <button style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 7, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic.chevR()}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAPA PAGE
// ══════════════════════════════════════════════════════════════════════════════
// CRAJUBAR region center (covers Juazeiro do Norte, Crato, Barbalha)
