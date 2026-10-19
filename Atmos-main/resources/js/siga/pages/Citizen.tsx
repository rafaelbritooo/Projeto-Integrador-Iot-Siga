import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from "react-leaflet";
import { C, cardStyle, ic, visibleDevices, visibleAlerts } from "../data/sigaData";

const CITIZEN_FLOOD_POINT: [number, number] = [-7.2255, -39.3180];
const CITIZEN_SAFE_POSITION: [number, number] = [-7.2225, -39.3150];
const CITIZEN_NEAR_POSITION: [number, number] = [-7.2250, -39.3178];
const CITIZEN_ALERT_RADIUS = 180;

function distanceInMeters(from: [number, number], to: [number, number]) {
  const earthRadius = 6371000;
  const latitudeDelta = (to[0] - from[0]) * Math.PI / 180;
  const longitudeDelta = (to[1] - from[1]) * Math.PI / 180;
  const latitude = from[0] * Math.PI / 180;
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitude) * Math.cos(to[0] * Math.PI / 180) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

export function CitizenMap({ userPosition }: { userPosition: [number, number] }) {
  function CitizenViewportController() {
    const map = useMap();
    useEffect(() => {
      map.flyTo(userPosition, 16, { duration: 0.7 });
    }, [map, userPosition]);
    return null;
  }

  return (
    <MapContainer center={userPosition} zoom={16} style={{ height: "100%", width: "100%" }} zoomControl={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CitizenViewportController />
      <Circle center={CITIZEN_FLOOD_POINT} radius={CITIZEN_ALERT_RADIUS} pathOptions={{ color: C.red, weight: 2, fillColor: C.red, fillOpacity: 0.12, dashArray: "8 6" }} />
      <CircleMarker center={CITIZEN_FLOOD_POINT} radius={14} pathOptions={{ color: "#fff", weight: 3, fillColor: C.red, fillOpacity: 1 }}>
        <Popup><strong>Via alagada</strong><br />Av. Leão Sampaio bloqueada</Popup>
      </CircleMarker>
      <CircleMarker center={userPosition} radius={10} pathOptions={{ color: "#fff", weight: 3, fillColor: C.primaryBlue, fillOpacity: 1 }}>
        <Popup><strong>Você está aqui</strong><br />Localização simulada</Popup>
      </CircleMarker>
    </MapContainer>
  );
}

export function CitizenPage() {
  const [userPosition, setUserPosition] = useState(CITIZEN_NEAR_POSITION);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const alertWasSent = useRef(false);
  const displayedPosition = locationEnabled ? userPosition : CITIZEN_SAFE_POSITION;
  const distance = distanceInMeters(displayedPosition, CITIZEN_FLOOD_POINT);
  const isNearRisk = distance <= CITIZEN_ALERT_RADIUS;

  useEffect(() => {
    document.title = "SIGA | Alertas para cidadãos";
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
    } else {
      setNotificationPermission(Notification.permission);
      setNotificationEnabled(Notification.permission === "granted");
    }
    return () => { document.title = "SIGA"; };
  }, []);

  useEffect(() => {
    if (!isNearRisk) {
      alertWasSent.current = false;
      return;
    }
    if (notificationEnabled && !alertWasSent.current && typeof Notification !== "undefined") {
      new Notification("SIGA: alagamento próximo", {
        body: `A Av. Leão Sampaio está bloqueada a aproximadamente ${distance} m de você.`,
        tag: "siga-alagamento-lagoa-seca",
      });
      alertWasSent.current = true;
    }
  }, [distance, isNearRisk, notificationEnabled]);

  const toggleDemoLocation = () => {
    setUserPosition(current => current === CITIZEN_NEAR_POSITION ? CITIZEN_SAFE_POSITION : CITIZEN_NEAR_POSITION);
  };

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    setNotificationEnabled(permission === "granted");
  };

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.mainText, fontFamily: "'Inter', sans-serif" }}>
      <header style={{ height: 68, background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px, 4vw, 48px)", position: "relative", zIndex: 10 }}>
        <a href="#admin" style={{ display: "flex", alignItems: "center", gap: 10, color: C.mainText, textDecoration: "none", fontWeight: 700 }}>
          <img src={sigaLogo} alt="SIGA" style={{ width: 112, height: "auto" }} />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.green, fontWeight: 600 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />Monitoramento ativo</span>
          <button onClick={() => setLocationEnabled(value => !value)} aria-label="Alternar localização" style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.border}`, background: locationEnabled ? "#EBF3FF" : C.card, color: C.primaryBlue, cursor: "pointer", fontSize: 18 }}>⌖</button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(18px, 4vw, 36px) clamp(16px, 4vw, 48px) 48px" }}>
        <div style={{ marginBottom: 18 }}>
          <p style={{ color: C.primaryBlue, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Proteção no caminho</p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", lineHeight: 1.15, margin: 0, color: C.mainText }}>Evite áreas alagadas perto de você.</h1>
          <p style={{ fontSize: 14, color: C.secondaryText, margin: "8px 0 0", maxWidth: 620, lineHeight: 1.5 }}>O SIGA acompanha os pontos de risco e avisa quando você se aproxima de uma via obstruída.</p>
        </div>

        {isNearRisk && (
          <section style={{ ...cardStyle, border: `1px solid ${C.red}`, background: C.lightRed, padding: "16px 18px", marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }} role="alert">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.red, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 800 }}>!</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: C.red, fontWeight: 800, fontSize: 15 }}>Atenção: alagamento próximo</p>
              <p style={{ margin: "4px 0 0", color: C.mainText, fontSize: 13, lineHeight: 1.45 }}>Você está a aproximadamente {distance} m da Av. Leão Sampaio. A via está bloqueada.</p>
            </div>
          </section>
        )}

        <div className="citizen-content-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) minmax(280px, 0.8fr)", gap: 16, alignItems: "stretch" }}>
          <section style={{ ...cardStyle, overflow: "hidden", minHeight: 470, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div><p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Mapa de ocorrências</p><p style={{ margin: "3px 0 0", fontSize: 12, color: C.secondaryText }}>{isNearRisk ? "Trecho bloqueado destacado em vermelho" : "Nenhum risco imediato próximo"}</p></div>
              <button onClick={toggleDemoLocation} style={{ border: `1px solid ${C.border}`, background: C.card, color: C.primaryBlue, borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600 }}>Simular localização</button>
            </div>
            <div style={{ flex: 1, minHeight: 390 }}><CitizenMap userPosition={displayedPosition} /></div>
          </section>

          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section style={{ ...cardStyle, padding: 18 }}>
              <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 15 }}>Status do trajeto</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: isNearRisk ? C.red : C.green }} /><div><p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{isNearRisk ? "Risco detectado" : "Trajeto livre"}</p><p style={{ margin: "3px 0 0", fontSize: 12, color: C.secondaryText }}>{isNearRisk ? `${distance} m do ponto de risco` : "Sem ocorrências próximas"}</p></div></div>
              {isNearRisk && <div style={{ paddingTop: 14 }}><p style={{ margin: "0 0 6px", fontSize: 12, color: C.secondaryText }}>Interdição</p><p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Av. Leão Sampaio</p><p style={{ margin: "3px 0 0", fontSize: 12, color: C.secondaryText }}>Lagoa Seca · Juazeiro do Norte</p></div>}
            </section>
            <section style={{ ...cardStyle, padding: 18 }}><p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 15 }}>Orientação</p><p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: C.secondaryText }}>{isNearRisk ? "Evite o trecho marcado em vermelho. Não atravesse uma via com correnteza ou água acumulada." : "Mantenha a localização ativada para receber avisos quando se aproximar de um ponto de risco."}</p></section>
            <section style={{ ...cardStyle, padding: 18, border: notificationEnabled ? `1px solid ${C.green}` : `1px solid ${C.amber}`, background: notificationEnabled ? C.lightGreen : C.lightAmber }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 15 }}>Notificações de proximidade</p>
              <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: C.mainText }}>{notificationPermission === "unsupported" ? "Este navegador não oferece notificações nativas." : notificationEnabled ? "Ativadas. Você receberá um aviso ao entrar próximo de uma área de alagamento." : "Ative as notificações para receber alertas mesmo quando não estiver olhando para esta página."}</p>
              {notificationPermission !== "unsupported" && !notificationEnabled && <button onClick={enableNotifications} style={{ border: "none", background: C.amber, color: "#fff", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>{notificationPermission === "denied" ? "Permissão bloqueada no navegador" : "Ativar notificações"}</button>}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
