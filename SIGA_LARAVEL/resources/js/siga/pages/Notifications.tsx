import { useState } from "react";
import { C, cardStyle, ic, visibleAlerts, visibleDevices, type Alert } from "../data/sigaData";

export function NotificacoesPage() {
  const [filterSeverity, setFilterSeverity] = useState("Todos");
  const [filterCity, setFilterCity] = useState("Todas");
  const [selected, setSelected] = useState<Alert | null>(null);

  const severities = ["Todos", "Crítico", "Atenção", "Resolvido", "Informativo"];
  const cities = ["Todas", "Juazeiro do Norte", "Crato", "Barbalha"];

  const filtered = visibleAlerts.filter(a =>
    (filterSeverity === "Todos" || a.severity === filterSeverity) &&
    (filterCity === "Todas" || a.city === filterCity)
  );

  const critCount = visibleAlerts.filter(a => a.severity === "Crítico" && !a.resolvedAt).length;
  const resolvedCount = visibleAlerts.filter(a => a.resolvedAt).length;
  const cities3 = Array.from(new Set(visibleAlerts.map(a => a.city)));

  const sevColor: Record<string, { bg: string; text: string }> = {
    "Crítico": { bg: C.lightRed, text: C.red },
    "Atenção": { bg: C.lightAmber, text: C.amber },
    "Resolvido": { bg: C.lightGreen, text: C.green },
    "Informativo": { bg: "#EBF3FF", text: C.primaryBlue },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary KPIs */}
      <div style={{ display: "flex", gap: 18 }}>
        {[
          { label: "Alertas Ativos", value: critCount + 2, color: C.red, bg: C.lightRed, icon: ic.siren() },
          { label: "Críticos Abertos", value: critCount, color: C.red, bg: "#FFE8E8", icon: ic.warning() },
          { label: "Resolvidos (total)", value: resolvedCount, color: C.green, bg: C.lightGreen, icon: ic.check() },
          { label: "Cidades Afetadas", value: cities3.length, color: C.primaryBlue, bg: "#EBF3FF", icon: ic.city() },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, flex: 1, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 12, color: C.secondaryText, margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: "2px 0 0", lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Regiões mais afetadas */}
      <div style={{ ...cardStyle, padding: "18px 22px" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: C.mainText, margin: "0 0 14px" }}>Regiões Mais Afetadas</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { city: "Crato", neighborhood: "Centro", count: 3, color: C.red },
            { city: "Juazeiro do Norte", neighborhood: "Lagoa Seca", count: 2, color: C.amber },
            { city: "Juazeiro do Norte", neighborhood: "Pirajá", count: 1, color: C.amber },
            { city: "Barbalha", neighborhood: "Alto da Penha", count: 1, color: C.primaryBlue },
            { city: "Barbalha", neighborhood: "Triângulo", count: 1, color: C.green },
          ].map(r => (
            <div key={r.neighborhood} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, display: "inline-block" }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.mainText, margin: 0 }}>{r.neighborhood}</p>
                <p style={{ fontSize: 11, color: C.secondaryText, margin: 0 }}>{r.city} · {r.count} ocorrência{r.count > 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + list */}
      <div style={{ ...cardStyle }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.mainText }}>Histórico de Alertas</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {[
              { label: "Severidade", value: filterSeverity, set: setFilterSeverity, opts: severities },
              { label: "Cidade", value: filterCity, set: setFilterCity, opts: cities },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 12, color: C.secondaryText }}>{f.label}:</label>
                <select value={f.value} onChange={e => f.set(e.target.value)} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", fontFamily: "inherit", outline: "none" }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["DATA / HORA","OCORRÊNCIA","SEVERIDADE","SENSOR","BAIRRO","CIDADE","EQUIPE","STATUS","AÇÕES"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: C.secondaryText, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ borderBottom: `1px solid #F8FAFC` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F8FAFC"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.mainText, margin: 0 }}>{a.date}</p>
                    <p style={{ fontSize: 11, color: C.secondaryText, margin: "2px 0 0" }}>{a.time}</p>
                  </td>
                  <td style={{ padding: "13px 16px", maxWidth: 220 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.mainText, margin: 0 }}>{a.title}</p>
                    <p style={{ fontSize: 11, color: C.secondaryText, margin: "2px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{a.description}</p>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: sevColor[a.severity]?.bg, color: sevColor[a.severity]?.text, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{a.severity}</span>
                  </td>
                  <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 12, color: C.mainText, fontWeight: 600 }}>{a.sensor}</td>
                  <td style={{ padding: "13px 16px", color: C.secondaryText, fontSize: 12 }}>{a.neighborhood}</td>
                  <td style={{ padding: "13px 16px", color: C.secondaryText, fontSize: 12, whiteSpace: "nowrap" }}>{a.city}</td>
                  <td style={{ padding: "13px 16px", color: C.secondaryText, fontSize: 12, maxWidth: 160 }}>{a.team}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {a.resolvedAt
                      ? <span style={{ background: C.lightGreen, color: C.green, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Resolvido</span>
                      : <span style={{ background: C.lightRed, color: C.red, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Aberto</span>
                    }
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => setSelected(a)} style={{ fontSize: 12, color: C.primaryBlue, background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: C.secondaryText, fontSize: 13 }}>Nenhum alerta encontrado com os filtros selecionados.</div>
        )}
      </div>

      {/* Alert detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,39,71,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: C.card, borderRadius: 20, width: 580, maxWidth: "90vw", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(15,39,71,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.mainText, margin: 0 }}>{selected.title}</p>
                <p style={{ fontSize: 12, color: C.secondaryText, margin: "4px 0 0" }}>{selected.date} às {selected.time}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.secondaryText, padding: 4 }}>{ic.x()}</button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                <span style={{ background: sevColor[selected.severity]?.bg, color: sevColor[selected.severity]?.text, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{selected.severity}</span>
                {selected.resolvedAt
                  ? <span style={{ background: C.lightGreen, color: C.green, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Resolvido</span>
                  : <span style={{ background: C.lightRed, color: C.red, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Em aberto</span>
                }
              </div>
              {[
                ["Sensor", selected.sensor], ["Nível no momento", `${selected.level}%`],
                ["Bairro", selected.neighborhood], ["Cidade", selected.city],
                ["Região", selected.region], ["Equipe Designada", selected.team],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, color: C.secondaryText }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.mainText }}>{v}</span>
                </div>
              ))}
              <div style={{ padding: "14px 0 0" }}>
                <p style={{ fontSize: 12, color: C.secondaryText, margin: "0 0 6px" }}>Descrição</p>
                <p style={{ fontSize: 13, color: C.mainText, lineHeight: 1.6, margin: 0 }}>{selected.description}</p>
              </div>
              {selected.resolution && (
                <div style={{ marginTop: 16, padding: "14px 16px", background: C.lightGreen, borderRadius: 12, border: `1px solid #B2F0D0` }}>
                  <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.green, margin: "0 0 6px" }}>{ic.check()}<span>Resolução — {selected.resolvedAt}</span></p>
                  <p style={{ fontSize: 13, color: C.mainText, margin: 0, lineHeight: 1.5 }}>{selected.resolution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DISPOSITIVOS PAGE
// ══════════════════════════════════════════════════════════════════════════════
