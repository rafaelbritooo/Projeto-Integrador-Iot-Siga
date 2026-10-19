import { useState } from "react";
import { CircleMarker } from "react-leaflet";
import { C, cardStyle, ic, Badge, BatteryBar, LevelBar, visibleDevices, visibleAlerts, type Device } from "../data/sigaData";

type DeviceTab = "Geral" | "Localização" | "Sensores" | "Conectividade" | "Bateria" | "Manutenção";

export function DeviceDetailModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const [tab, setTab] = useState<DeviceTab>("Geral");
  const tabs: DeviceTab[] = ["Geral", "Localização", "Sensores"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,39,71,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.card, borderRadius: 20, width: 700, maxWidth: "95vw", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(15,39,71,0.25)" }}>
        {/* Modal header */}
        <div style={{ padding: "20px 28px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#EBF3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.primaryBlue} strokeWidth="1.8"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill={C.primaryBlue}/></svg>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: C.mainText, margin: 0 }}>{device.name}</h2>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: device.status === "Ativo" ? C.green : device.status === "Atenção" ? C.amber : C.red, display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: device.status === "Ativo" ? C.green : C.secondaryText, fontWeight: 500 }}>{device.status}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 11, background: "#EBF3FF", color: C.primaryBlue, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{device.technology}</span>
                  <span style={{ fontSize: 11, background: "#F1F5F9", color: C.secondaryText, padding: "2px 8px", borderRadius: 6 }}>Última atualização: {device.lastRead}</span>
                  <span style={{ fontSize: 11, background: C.lightGreen, color: C.green, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>ESP32 conectado</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.secondaryText, padding: 4 }}>{ic.x()}</button>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 16px", fontSize: 13, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? C.primaryBlue : C.secondaryText,
                background: "none", border: "none", borderBottom: tab === t ? `2px solid ${C.primaryBlue}` : "2px solid transparent",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1 }}>
          {tab === "Geral" && (
            <div style={{ ...cardStyle, padding: "18px 22px" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.mainText, margin: "0 0 16px" }}>Informações Gerais</p>
              {[
                ["ID do dispositivo", device.identifier], ["Controlador", "ESP32"],
                ["Tipo", "Sensor de Alagamento"], ["Status", device.status],
                ["Descrição", "Medição de nível da água para acionamento da drenagem."],
                ["Última leitura", device.lastReadDate],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, color: C.secondaryText }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: k === "Status" ? (v === "Ativo" ? C.green : v === "Atenção" ? C.amber : C.red) : C.mainText }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Localização" && (
            <div>
              <div style={{ ...cardStyle, padding: "18px 22px", marginBottom: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: C.mainText, margin: "0 0 16px" }}>Localização</p>
                {[
                  ["Cidade", `${device.city} - CE`], ["Bairro", device.neighborhood],
                  ["Endereço", device.address], ["Latitude", device.lat.toFixed(4)],
                  ["Longitude", device.lng.toFixed(4)], ["Região Operacional", device.region],
                  ["Responsável", device.responsible],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.secondaryText }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.mainText }}>{String(v)}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 200, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <MapContainer center={[device.lat, device.lng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false} scrollWheelZoom={false} attributionControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={[device.lat, device.lng]} radius={14} pathOptions={{ color: "#fff", weight: 3, fillColor: C.primaryBlue, fillOpacity: 1 }} />
                </MapContainer>
              </div>
            </div>
          )}
          {tab === "Sensores" && (
            <div style={{ ...cardStyle, padding: "18px 22px" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.mainText, margin: "0 0 16px" }}>Componentes e leituras</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Sensor ultrassônico · nível da água", value: device.level, unit: "%", color: device.level > 70 ? C.red : device.level > 50 ? C.amber : C.green },
                  { label: "Relé · comando da bomba", value: device.level > 70 ? "Ativado" : "Em espera", unit: "", color: device.level > 70 ? C.red : C.green },
                  { label: "Bomba de drenagem", value: device.level > 70 ? "Acionada" : "Disponível", unit: "", color: device.level > 70 ? C.red : C.green },
                  { label: "Controlador", value: "ESP32", unit: "", color: C.primaryBlue },
                ].map(s => (
                  <div key={s.label} style={{ padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: C.secondaryText }}>{s.label}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}{s.unit}</span>
                    </div>
                    {s.unit === "%" && (
                      <div style={{ height: 6, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${s.value}%`, height: "100%", background: s.color, borderRadius: 4 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.secondaryText, margin: "16px 0 0" }}>Última atualização: {device.lastReadDate}</p>
            </div>
          )}
          {tab === "Conectividade" && (
            <div style={{ ...cardStyle, padding: "18px 22px" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.mainText, margin: "0 0 16px" }}>Conectividade</p>
              {[
                ["Tecnologia", device.technology], ["Gateway Vinculado", device.gateway],
                ["Endereço MAC", device.mac], ["IP Atual", "10.0.0.15"],
                ["Intensidade do Sinal", `${device.signal} dBm`], ["Frequência de Envio", device.frequency],
                ["Firmware", device.firmware],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, color: C.secondaryText }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.mainText, fontFamily: k === "Endereço MAC" || k === "Firmware" ? "monospace" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Bateria" && (
            <div style={{ ...cardStyle, padding: "18px 22px" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.mainText, margin: "0 0 16px" }}>Alimentação</p>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.secondaryText }}>Fonte de Energia</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.mainText }}>{device.energySource}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.secondaryText }}>Nível de Bateria</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.mainText }}>{device.battery}%</span>
                  <div style={{ width: 60, height: 8, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${device.battery}%`, height: "100%", background: device.battery > 50 ? C.green : device.battery > 20 ? C.amber : C.red, borderRadius: 4 }} />
                  </div>
                </div>
              </div>
              {[
                ["Tensão Atual", device.voltage],
                ["Painel Solar", device.solarPanel ? "Ativo" : "Inativo"],
                ["Última Carga Total", device.lastCharge],
                ["Última Troca de Bateria", device.lastBatterySwap],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, color: C.secondaryText }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: v === "Ativo" ? C.green : C.mainText }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Manutenção" && (
            <div>
              <div style={{ ...cardStyle, padding: "18px 22px", marginBottom: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: C.mainText, margin: "0 0 16px" }}>Manutenção</p>
                {[
                  ["Última Inspeção", device.lastInspection],
                  ["Próxima Inspeção", device.nextInspection],
                  ["Técnico Responsável", device.technician],
                  ["Chamados Abertos", String(device.openCalls)],
                  ["Observações", "Dispositivo funcionando normalmente."],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.secondaryText }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: k === "Chamados Abertos" && parseInt(v) > 0 ? C.red : C.mainText }}>{v}</span>
                  </div>
                ))}
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: C.green, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
                Solicitar Manutenção
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DispositivosPage() {
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterCity, setFilterCity] = useState("Todas");
  const [filterType, setFilterType] = useState("Todos");
  const [search, setSearch] = useState("");
  const [detailDevice, setDetailDevice] = useState<Device | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [devices, setDevices] = useState(visibleDevices);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const statuses = ["Todos", "Ativo", "Atenção", "Inativo", "Manutenção"];
  const cities = ["Todas", "Juazeiro do Norte", "Crato", "Barbalha"];
  const types = ["Todos", ...Array.from(new Set(visibleDevices.map(d => d.type)))];

  const filtered = devices.filter(d =>
    (filterStatus === "Todos" || d.status === filterStatus) &&
    (filterCity === "Todas" || d.city === filterCity) &&
    (filterType === "Todos" || d.type === filterType) &&
    (search === "" || d.name.toLowerCase().includes(search.toLowerCase()) || d.neighborhood.toLowerCase().includes(search.toLowerCase()))
  );

  const confirmDelete = () => {
    if (deleteId) { setDevices(prev => prev.filter(d => d.id !== deleteId)); setDeleteId(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary row */}
      <div style={{ display: "flex", gap: 16 }}>
        {[
          { label: "Total", value: devices.length, color: C.primaryBlue, bg: "#EBF3FF" },
          { label: "Ativos", value: devices.filter(d => d.status === "Ativo").length, color: C.green, bg: C.lightGreen },
          { label: "Atenção", value: devices.filter(d => d.status === "Atenção").length, color: C.amber, bg: C.lightAmber },
          { label: "Inativos", value: devices.filter(d => d.status === "Inativo").length, color: C.red, bg: C.lightRed },
          { label: "Manutenção", value: devices.filter(d => d.status === "Manutenção").length, color: C.purple, bg: "#F3EEFF" },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, flex: 1, padding: "14px 18px", textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: C.secondaryText, margin: "4px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={cardStyle}>
        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.mainText, marginRight: 8 }}>Dispositivos</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou bairro..." style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", fontFamily: "inherit", outline: "none", width: 200 }} />
          {[
            { label: "Status", value: filterStatus, set: setFilterStatus, opts: statuses },
            { label: "Cidade", value: filterCity, set: setFilterCity, opts: cities },
            { label: "Tipo", value: filterType, set: setFilterType, opts: types },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 12, color: C.secondaryText }}>{f.label}:</label>
              <select value={f.value} onChange={e => f.set(e.target.value)} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontFamily: "inherit", outline: "none" }}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <span style={{ fontSize: 12, color: C.secondaryText, marginLeft: "auto" }}>{filtered.length} dispositivo{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["NOME","TIPO","STATUS","CIDADE / BAIRRO","ÚLTIMA LEITURA","NÍVEL","IDENTIFICADOR","AÇÕES"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: C.secondaryText, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: `1px solid #F8FAFC` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F8FAFC"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#EBF3FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primaryBlue} strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill={C.primaryBlue}/></svg>
                      </div>
                      <span style={{ fontWeight: 600, color: C.mainText }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: C.secondaryText, fontSize: 12 }}>{d.type}</td>
                  <td style={{ padding: "14px 16px" }}><Badge label={d.status} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: C.mainText, margin: 0 }}>{d.city}</p>
                    <p style={{ fontSize: 11, color: C.secondaryText, margin: "2px 0 0" }}>{d.neighborhood}</p>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: 12, color: C.mainText, margin: 0 }}>{d.lastRead}</p>
                    <p style={{ fontSize: 11, color: C.secondaryText, margin: "2px 0 0" }}>{d.lastReadDate}</p>
                  </td>
                  <td style={{ padding: "14px 16px" }}><LevelBar pct={d.level} /></td>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: C.secondaryText }}>{d.identifier}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ position: "relative" }}>
                      <button onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>{ic.dots()}</button>
                      {openMenu === d.id && (
                        <div style={{ position: "absolute", right: 0, top: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(15,39,71,0.12)", zIndex: 10, minWidth: 160, overflow: "hidden" }}>
                          <button onClick={() => { setDetailDevice(d); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: C.mainText, fontFamily: "inherit" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          ><span style={{ color: C.primaryBlue }}>{ic.eye()}</span>Ver detalhes</button>
                          <button onClick={() => { setDeleteId(d.id); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: C.red, fontFamily: "inherit" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#FFF4F4")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          ><span>{ic.trash()}</span>Excluir</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: C.secondaryText, fontSize: 13 }}>Nenhum dispositivo encontrado.</div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.secondaryText }}>Mostrando {filtered.length} de {devices.length} dispositivos</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 7, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic.chevL()}</button>
            <button style={{ width: 30, height: 30, border: "none", borderRadius: 7, background: C.primaryBlue, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>1</button>
            <button style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 7, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic.chevR()}</button>
          </div>
        </div>
      </div>

      {/* Device detail modal */}
      {detailDevice && <DeviceDetailModal device={detailDevice} onClose={() => setDetailDevice(null)} />}

      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,39,71,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: "28px 32px", width: 380, boxShadow: "0 20px 60px rgba(15,39,71,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.lightRed, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.red }}>{ic.trash()}</div>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.mainText, textAlign: "center", margin: "0 0 8px" }}>Excluir dispositivo?</p>
            <p style={{ fontSize: 13, color: C.secondaryText, textAlign: "center", margin: "0 0 24px", lineHeight: 1.5 }}>Esta ação não pode ser desfeita. O dispositivo será removido permanentemente do sistema.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.card, cursor: "pointer", fontSize: 14, fontWeight: 500, color: C.mainText, fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: C.red, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "inherit" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC CITIZEN PAGE
// ══════════════════════════════════════════════════════════════════════════════
