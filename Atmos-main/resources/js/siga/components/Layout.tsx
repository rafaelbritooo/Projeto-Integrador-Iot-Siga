import { useState } from "react";
import { C, cardStyle, ic, navItems, visibleAlerts, visibleDevices, SigaLogo } from "../data/sigaData";

export function Sidebar({ active, onNav }: { active: string; onNav: (k: string) => void }) {
  const logout = () => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

    if (!token) {
      console.error("Token CSRF não encontrado. Não foi possível sair do sistema.");
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/logout";

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "_token";
    csrfInput.value = token;
    form.appendChild(csrfInput);

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <aside style={{ width: 272, minWidth: 272, height: "100%", background: C.card, borderRight: "1px solid #E5EAF0", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 0" }}><SigaLogo /></div>
      <nav style={{ padding: "36px 20px 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(({ key, label, icon }) => {
          const a = active === key;
          return (
            <button key={key} onClick={() => onNav(key)} style={{
              display: "flex", alignItems: "center", gap: 14, width: "100%", height: 52, padding: "0 16px",
              borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 500,
              background: a ? C.primaryBlue : "transparent", color: a ? "#fff" : C.mainText,
              boxShadow: a ? "0 4px 12px rgba(11,99,216,0.25)" : "none",
              transition: "all 0.15s", fontFamily: "inherit",
            }}
              onMouseEnter={e => { if (!a) (e.currentTarget as HTMLElement).style.background = "#F1F5F9"; }}
              onMouseLeave={e => { if (!a) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {icon(a)}<span>{label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ height: 1, background: C.border, margin: "24px 20px" }} />
      <div style={{ flex: 1 }} />
      <div style={{ padding: "0 18px 12px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(15,39,71,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.primaryBlue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>JA</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.mainText, margin: 0, lineHeight: 1.3 }}>João Augusto</p>
              <p style={{ fontSize: 12, color: C.secondaryText, margin: "2px 0 4px" }}>Administrador</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>Online</span>
              </div>
              <button type="button" onClick={logout} style={{ marginTop: 14, width: "100%", height: 36, border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.secondaryText, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
      <button style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 44, borderTop: `1px solid ${C.border}`, background: "transparent", border: "none", cursor: "pointer", color: C.secondaryText, fontFamily: "inherit" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >{ic.chevLL()}</button>
    </aside>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
const pageMeta: Record<string, { title: string; sub: string }> = {
  home: { title: "Visão Geral", sub: "Monitoramento em tempo real das condições de alagamento." },
  map: { title: "Mapa", sub: "Visualização geográfica de sensores no Crajubar." },
  notifications: { title: "Notificações", sub: "Alertas, relatórios e histórico de eventos por região." },
  devices: { title: "Dispositivos", sub: "Gestão completa dos sensores IoT registrados no sistema." },
};

export function Header({ active, selectedNeighborhood, selectedCity, onNeighborhoodChange, onCityChange, darkMode, onToggleTheme }: {
  active: string;
  selectedNeighborhood: string;
  selectedCity: string;
  onNeighborhoodChange: (value: string) => void;
  onCityChange: (value: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  const { title, sub } = pageMeta[active] ?? pageMeta.home;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const neighborhoods = Array.from(new Set(visibleDevices.filter(device => device.city === selectedCity).map(device => device.neighborhood)));
  const regionalAlert = visibleAlerts.find(alert => alert.city === selectedCity && alert.neighborhood === selectedNeighborhood);
  return (
    <header style={{ height: 92, background: C.card, borderBottom: "1px solid #E5EAF0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic.menu()}</button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.mainText, margin: 0, lineHeight: 1.2 }}>{title}</h1>
          <p style={{ fontSize: 13, color: C.secondaryText, margin: "3px 0 0" }}>{sub}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 7, height: 44, padding: "0 10px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", fontSize: 14, fontWeight: 500, color: C.mainText }}>
          {ic.pin()}<select value={selectedNeighborhood} onChange={e => onNeighborhoodChange(e.target.value)} aria-label="Filtrar por bairro" style={{ border: "none", outline: "none", background: "transparent", color: C.mainText, font: "inherit", cursor: "pointer" }}>
            {neighborhoods.map(neighborhood => <option key={neighborhood}>{neighborhood}</option>)}
          </select>{ic.chevD()}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 7, height: 44, padding: "0 10px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", fontSize: 14, fontWeight: 500, color: C.mainText }}>
          {ic.pin()}<select value={selectedCity} onChange={e => onCityChange(e.target.value)} aria-label="Filtrar por cidade" style={{ border: "none", outline: "none", background: "transparent", color: C.mainText, font: "inherit", cursor: "pointer" }}>
            {Array.from(new Set(visibleDevices.map(device => device.city))).map(city => <option key={city}>{city}</option>)}
          </select>{ic.chevD()}
        </label>
        <div style={{ position: "relative" }}>
          <button onClick={() => setNotificationsOpen(value => !value)} aria-label="Abrir notificações" style={{ width: 44, height: 44, borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.mainText} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <span style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: regionalAlert ? C.primaryBlue : C.secondaryText, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{regionalAlert ? 1 : 0}</span>
          {notificationsOpen && (
            <div style={{ position: "absolute", top: 52, right: 0, width: 330, maxWidth: "calc(100vw - 32px)", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 12px 30px rgba(15,39,71,0.16)", zIndex: 20, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.mainText }}>Notificações</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: regionalAlert ? C.red : C.secondaryText, background: regionalAlert ? C.lightRed : "#F1F5F9", padding: "3px 8px", borderRadius: 20 }}>{regionalAlert ? "1 nova" : "Nenhuma"}</span>
              </div>
              {regionalAlert ? <button onClick={() => setNotificationsOpen(false)} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: 14, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: C.lightRed, display: "grid", placeItems: "center", flexShrink: 0 }}>{ic.water()}</span>
                <span>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.mainText }}>{regionalAlert.title}</span>
                  <span style={{ display: "block", marginTop: 4, fontSize: 11, lineHeight: 1.4, color: C.secondaryText }}>{regionalAlert.sensor} detectou uma ocorrência em {regionalAlert.neighborhood}, {regionalAlert.city}.</span>
                  <span style={{ display: "block", marginTop: 6, fontSize: 10, color: C.secondaryText }}>há 5 minutos</span>
                </span>
              </button> : <div style={{ padding: 16, fontSize: 12, color: C.secondaryText }}>Nenhuma ocorrência registrada em {selectedNeighborhood}, {selectedCity}.</div>}
            </div>
          )}
        </div>
        <button onClick={onToggleTheme} aria-label={darkMode ? "Ativar tema claro" : "Ativar tema escuro"} title={darkMode ? "Ativar tema claro" : "Ativar tema escuro"} style={{ width: 44, height: 44, borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{darkMode ? ic.sun() : ic.moon()}</button>
        <button style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 14px 0 6px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", fontFamily: "inherit" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.primaryBlue, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>JA</div>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.mainText }}>João Augusto</span>
          {ic.chevD()}
        </button>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD (HOME)
// ══════════════════════════════════════════════════════════════════════════════
