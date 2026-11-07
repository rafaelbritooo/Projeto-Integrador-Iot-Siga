import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { C, cardStyle, ic, Badge, BatteryBar, LevelBar, visibleDevices, visibleAlerts, type Device } from "../data/sigaData";

export const CRAJUBAR_CENTER: [number, number] = [-7.26, -39.36];

export function deviceToMarkerStatus(d: Device): "normal" | "attention" | "risk" | "offline" | "maintenance" {
  if (d.status === "Inativo") return "offline";
  if (d.status === "Manutenção") return "maintenance";
  if (d.status === "Atenção") return "attention";
  if (d.level > 70) return "risk";
  return "normal";
}

export function MapViewportController({
  devices,
  selectedDevice,
  focusKey,
}: {
  devices: Device[];
  selectedDevice: Device | null;
  focusKey: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedDevice) {
      map.flyTo([selectedDevice.lat, selectedDevice.lng], 16, { duration: 0.7 });
      return;
    }

    if (devices.length === 1) {
      const [device] = devices;
      map.flyTo([device.lat, device.lng], 15, { duration: 0.7 });
      return;
    }

    if (devices.length > 1) {
      map.fitBounds(
        L.latLngBounds(devices.map(device => [device.lat, device.lng] as [number, number])),
        { padding: [48, 48], maxZoom: 14, animate: true, duration: 0.7 },
      );
      return;
    }

    map.flyTo(CRAJUBAR_CENTER, 11, { duration: 0.7 });
  }, [focusKey, map, selectedDevice]);

  return null;
}

export function MapPage() {
  const [filterCity, setFilterCity] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterType, setFilterType] = useState("Todos");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const cities = ["Todas", "Juazeiro do Norte", "Crato", "Barbalha"];
  const statuses = ["Todos", "Ativo", "Atenção", "Inativo", "Manutenção"];
  const types = ["Todos", ...Array.from(new Set(visibleDevices.map(d => d.type)))];

  const filtered = visibleDevices.filter(d =>
    (filterCity === "Todas" || d.city === filterCity) &&
    (filterStatus === "Todos" || d.status === filterStatus) &&
    (filterType === "Todos" || d.type === filterType)
  );

  useEffect(() => {
    if (selectedDevice && !filtered.some(device => device.id === selectedDevice.id)) {
      setSelectedDevice(null);
    }
  }, [filterCity, filterStatus, filterType]);

  const focusKey = `${filterCity}-${filterStatus}-${filterType}-${selectedDevice?.id ?? "all"}-${filtered.map(device => device.id).join(",")}`;

  const statusMarkerColor: Record<string, string> = {
    normal: C.green, attention: C.amber, risk: C.red,
    offline: "#94A3B8", maintenance: C.purple,
  };

  const sel = selectedDevice;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      {/* Filter bar */}
      <div style={{ ...cardStyle, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.secondaryText, fontSize: 13 }}>
          {ic.filter()}<span style={{ fontWeight: 600 }}>Filtros:</span>
        </div>
        {[
          { label: "Cidade", value: filterCity, set: setFilterCity, opts: cities },
          { label: "Status", value: filterStatus, set: setFilterStatus, opts: statuses },
          { label: "Tipo", value: filterType, set: setFilterType, opts: types },
        ].map(f => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, color: C.secondaryText, fontWeight: 500 }}>{f.label}:</label>
            <select value={f.value} onChange={e => f.set(e.target.value)} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", color: C.mainText, background: C.card, cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {[["#13B866", "Normal"], ["#F5A900", "Atenção"], ["#FF3838", "Risco"], ["#94A3B8", "Inativo"], [C.purple, "Manutenção"]].map(([color, label]) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.secondaryText }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />{label}
            </span>
          ))}
        </div>
      </div>

      {/* Map + sidebar */}
      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        {/* Map */}
        <div style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.mainText }}>Crajubar — Juazeiro do Norte · Crato · Barbalha</span>
            <span style={{ fontSize: 12, color: C.secondaryText }}>{filtered.length} sensor{filtered.length !== 1 ? "es" : ""} exibido{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <MapContainer center={CRAJUBAR_CENTER} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapViewportController devices={filtered} selectedDevice={sel} focusKey={focusKey} />
              {filtered.map(d => {
                const ms = deviceToMarkerStatus(d);
                const color = statusMarkerColor[ms];
                const isRisk = ms === "risk";
                const isSel = sel?.id === d.id;
                return (
                  <CircleMarker key={d.id} center={[d.lat, d.lng]}
                    radius={isSel ? 14 : isRisk ? 10 : 8}
                    pathOptions={{ color: isSel ? "#fff" : "#fff", weight: isSel ? 3 : 2, fillColor: color, fillOpacity: 1 }}
                    eventHandlers={{ click: () => setSelectedDevice(d) }}
                  >
                    {isRisk && <CircleMarker center={[d.lat, d.lng]} radius={20} pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.18 }} />}
                    <Popup>
                      <strong>{d.name}</strong><br/>
                      {d.type}<br/>
                      {d.neighborhood}, {d.city}<br/>
                      Nível: {d.level}% | Bateria: {d.battery}%
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Sensor panel */}
        <div style={{ ...cardStyle, width: 300, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {sel ? (
            <>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.mainText }}>{sel.name}</span>
                <button onClick={() => setSelectedDevice(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.secondaryText }}>{ic.x()}</button>
              </div>
              <div style={{ padding: "14px 18px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Badge label={sel.status} />
                  <span style={{ fontSize: 11, color: C.secondaryText }}>{sel.identifier}</span>
                </div>
                {[
                  ["Tipo", sel.type], ["Cidade", sel.city], ["Bairro", sel.neighborhood],
                  ["Endereço", sel.address], ["Última Leitura", sel.lastRead], ["Região", sel.region],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ fontSize: 11, color: C.secondaryText, margin: 0 }}>{k}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: C.mainText, margin: "2px 0 0" }}>{v}</p>
                  </div>
                ))}
                <div>
                  <p style={{ fontSize: 11, color: C.secondaryText, margin: "0 0 6px" }}>Nível Atual</p>
                  <LevelBar pct={sel.level} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.secondaryText, margin: "0 0 6px" }}>Bateria</p>
                  <BatteryBar pct={sel.battery} />
                </div>
                <div style={{ padding: "10px 12px", background: "#F8FAFC", borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, color: C.secondaryText, margin: "0 0 2px" }}>Tecnologia</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.mainText, margin: 0 }}>{sel.technology}</p>
                  <p style={{ fontSize: 11, color: C.secondaryText, margin: "6px 0 2px" }}>Sinal</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.mainText, margin: 0 }}>{sel.signal} dBm</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.mainText }}>Sensores ({filtered.length})</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {filtered.map(d => {
                  const ms = deviceToMarkerStatus(d);
                  const color = statusMarkerColor[ms];
                  return (
                    <button key={d.id} onClick={() => setSelectedDevice(d)} style={{
                      display: "flex", alignItems: "center", gap: 12, width: "100%",
                      padding: "12px 18px", border: "none", borderBottom: `1px solid ${C.border}`,
                      background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.mainText, margin: 0 }}>{d.name}</p>
                        <p style={{ fontSize: 11, color: C.secondaryText, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.neighborhood} · {d.city}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: d.level > 70 ? C.red : C.mainText, margin: 0 }}>{d.level}%</p>
                        <p style={{ fontSize: 10, color: C.secondaryText, margin: "2px 0 0" }}>{d.battery}% bat.</p>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ padding: 24, textAlign: "center", color: C.secondaryText, fontSize: 13 }}>Nenhum sensor encontrado.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICAÇÕES PAGE
// ══════════════════════════════════════════════════════════════════════════════
