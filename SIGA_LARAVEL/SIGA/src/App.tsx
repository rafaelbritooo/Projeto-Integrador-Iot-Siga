import { useEffect, useRef, useState } from "react";
import sigaLogo from "@/assets/siga-logo-1.png";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  primaryBlue: "var(--siga-primary)",
  darkNavy: "var(--siga-dark-navy)",
  green: "var(--siga-green)",
  lightGreen: "var(--siga-light-green)",
  red: "var(--siga-red)",
  lightRed: "var(--siga-light-red)",
  amber: "var(--siga-amber)",
  lightAmber: "var(--siga-light-amber)",
  purple: "var(--siga-purple)",
  bg: "var(--siga-bg)",
  card: "var(--siga-card)",
  border: "var(--siga-border)",
  secondaryText: "var(--siga-secondary-text)",
  mainText: "var(--siga-main-text)",
};

const cardStyle = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(15,39,71,0.05)",
};

// ── Shared data ───────────────────────────────────────────────────────────────
type DeviceStatus = "Ativo" | "Atenção" | "Inativo" | "Manutenção";

interface Device {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  city: string;
  neighborhood: string;
  address: string;
  lastRead: string;
  lastReadDate: string;
  level: number;
  battery: number;
  identifier: string;
  technology: string;
  gateway: string;
  mac: string;
  signal: number;
  firmware: string;
  frequency: string;
  energySource: string;
  voltage: string;
  solarPanel: boolean;
  lastCharge: string;
  lastBatterySwap: string;
  lastInspection: string;
  nextInspection: string;
  technician: string;
  openCalls: number;
  registered: string;
  lat: number;
  lng: number;
  region: string;
  responsible: string;
  model: string;
  manufacturer: string;
  description: string;
}

const allDevices: Device[] = [
  {
    id: "D001", name: "DELTA", type: "Sensor de Alagamento", status: "Ativo",
    city: "Juazeiro do Norte", neighborhood: "Lagoa Seca", address: "Av. Leão Sampaio",
    lastRead: "há 12 segundos", lastReadDate: "31/05/2026 14:32", level: 72, battery: 89,
    identifier: "SIGA-ESP32-01", technology: "ESP32", gateway: "GW-JN-001", mac: "4C:11:AE:01:00:01",
    signal: -74, firmware: "v2.3.1", frequency: "5 min", energySource: "Solar + Bateria",
    voltage: "3.8 V", solarPanel: true, lastCharge: "01/06/2026 11:30", lastBatterySwap: "10/03/2026",
    lastInspection: "21/03/2026", nextInspection: "30/05/2026", technician: "João Silva",
    openCalls: 2, registered: "20/12/2025", lat: -7.2255, lng: -39.3180,
    region: "Setor Sul", responsible: "Equipe Drenagem Urbana",
    model: "SmartDrain SD-200", manufacturer: "SmartDrain Technologies",
    description: "Monitoramento de nível e fluxo em galerias pluviais",
  },
  {
    id: "D002", name: "ALPHA", type: "Sensor de Alagamento", status: "Ativo",
    city: "Crato", neighborhood: "Centro", address: "Av. Padre Cícero",
    lastRead: "há 3 minutos", lastReadDate: "31/05/2026 14:29", level: 45, battery: 92,
    identifier: "SIGA-ESP32-02", technology: "ESP32", gateway: "GW-CR-001", mac: "4C:11:AE:01:00:02",
    signal: -68, firmware: "v2.3.1", frequency: "5 min", energySource: "Solar + Bateria",
    voltage: "3.9 V", solarPanel: true, lastCharge: "02/06/2026 09:00", lastBatterySwap: "15/04/2026",
    lastInspection: "10/04/2026", nextInspection: "10/07/2026", technician: "Maria Costa",
    openCalls: 0, registered: "05/01/2026", lat: -7.2340, lng: -39.4090,
    region: "Setor Norte", responsible: "Equipe Drenagem Urbana",
    model: "SmartDrain SD-200", manufacturer: "SmartDrain Technologies",
    description: "Monitoramento de nível e fluxo em galerias pluviais",
  },
  {
    id: "D003", name: "BETA", type: "Sensor de Alagamento", status: "Atenção",
    city: "Barbalha", neighborhood: "Alto da Penha", address: "R. São Francisco",
    lastRead: "há 8 minutos", lastReadDate: "31/05/2026 14:24", level: 88, battery: 55,
    identifier: "SIGA-ESP32-03", technology: "ESP32", gateway: "GW-BA-001", mac: "4C:11:AE:01:00:03",
    signal: -80, firmware: "v2.2.4", frequency: "3 min", energySource: "Solar + Bateria",
    voltage: "3.5 V", solarPanel: true, lastCharge: "30/05/2026 14:00", lastBatterySwap: "01/02/2026",
    lastInspection: "15/02/2026", nextInspection: "15/05/2026", technician: "Carlos Souza",
    openCalls: 3, registered: "12/02/2026", lat: -7.3090, lng: -39.2990,
    region: "Setor Leste", responsible: "Equipe Saneamento",
    model: "SmartDrain SD-300", manufacturer: "SmartDrain Technologies",
    description: "Detecção de obstruções e entupimentos em bueiros",
  },
  {
    id: "D004", name: "GAMMA", type: "Sensor de Nível", status: "Ativo",
    city: "Juazeiro do Norte", neighborhood: "São Miguel", address: "R. São João",
    lastRead: "há 1 minuto", lastReadDate: "31/05/2026 14:31", level: 31, battery: 78,
    identifier: "2026IOT4", technology: "LoRaWAN", gateway: "GW-JN-001", mac: "4C:11:AE:01:00:04",
    signal: -71, firmware: "v2.3.1", frequency: "5 min", energySource: "Solar + Bateria",
    voltage: "3.7 V", solarPanel: true, lastCharge: "01/06/2026 08:00", lastBatterySwap: "20/03/2026",
    lastInspection: "25/03/2026", nextInspection: "25/06/2026", technician: "João Silva",
    openCalls: 0, registered: "18/01/2026", lat: -7.2080, lng: -39.3120,
    region: "Setor Norte", responsible: "Equipe Drenagem Urbana",
    model: "SmartLevel NV-100", manufacturer: "AquaTech",
    description: "Monitoramento contínuo de nível d’água em reservatórios",
  },
  {
    id: "D005", name: "DELTA", type: "Sensor de Alagamento", status: "Inativo",
    city: "Crato", neighborhood: "Muriti", address: "R. das Flores",
    lastRead: "há 2 horas", lastReadDate: "31/05/2026 12:18", level: 0, battery: 8,
    identifier: "2026IOT5", technology: "LoRaWAN", gateway: "GW-CR-001", mac: "4C:11:AE:01:00:05",
    signal: -92, firmware: "v2.2.0", frequency: "10 min", energySource: "Bateria",
    voltage: "3.1 V", solarPanel: false, lastCharge: "20/05/2026 10:00", lastBatterySwap: "05/01/2026",
    lastInspection: "05/01/2026", nextInspection: "05/04/2026", technician: "Pedro Alves",
    openCalls: 5, registered: "10/01/2026", lat: -7.2420, lng: -39.4150,
    region: "Setor Sul", responsible: "Equipe Manutenção",
    model: "SmartDrain SD-200", manufacturer: "SmartDrain Technologies",
    description: "Monitoramento de nível e fluxo em galerias pluviais",
  },
  {
    id: "D006", name: "EPSILON", type: "Sensor de Enchente", status: "Ativo",
    city: "Barbalha", neighborhood: "Triângulo", address: "Av. Principal",
    lastRead: "há 4 minutos", lastReadDate: "31/05/2026 14:28", level: 22, battery: 67,
    identifier: "2026IOT6", technology: "LoRaWAN", gateway: "GW-BA-001", mac: "4C:11:AE:01:00:06",
    signal: -76, firmware: "v2.3.0", frequency: "5 min", energySource: "Solar + Bateria",
    voltage: "3.6 V", solarPanel: true, lastCharge: "31/05/2026 07:30", lastBatterySwap: "10/04/2026",
    lastInspection: "10/04/2026", nextInspection: "10/07/2026", technician: "Carlos Souza",
    openCalls: 1, registered: "22/02/2026", lat: -7.3150, lng: -39.3040,
    region: "Setor Oeste", responsible: "Equipe Saneamento",
    model: "FloodSense FS-500", manufacturer: "AquaTech",
    description: "Detecção precoce de enchentes em áreas de risco",
  },
  {
    id: "D007", name: "ZETA", type: "Sensor de Alagamento", status: "Manutenção",
    city: "Juazeiro do Norte", neighborhood: "Pirajá", address: "R. Dom Maurício",
    lastRead: "há 1 dia", lastReadDate: "30/05/2026 09:00", level: 0, battery: 33,
    identifier: "2026IOT7", technology: "LoRaWAN", gateway: "GW-JN-002", mac: "4C:11:AE:01:00:07",
    signal: -85, firmware: "v2.1.0", frequency: "5 min", energySource: "Solar + Bateria",
    voltage: "3.4 V", solarPanel: true, lastCharge: "28/05/2026 12:00", lastBatterySwap: "28/01/2026",
    lastInspection: "28/01/2026", nextInspection: "01/06/2026", technician: "Maria Costa",
    openCalls: 4, registered: "28/01/2026", lat: -7.2200, lng: -39.3250,
    region: "Setor Oeste", responsible: "Equipe Manutenção",
    model: "SmartDrain SD-200", manufacturer: "SmartDrain Technologies",
    description: "Monitoramento de nível e fluxo em galerias pluviais",
  },
];

type AlertSeverity = "Crítico" | "Atenção" | "Informativo" | "Resolvido";

interface Alert {
  id: number;
  date: string;
  time: string;
  title: string;
  severity: AlertSeverity;
  sensor: string;
  neighborhood: string;
  city: string;
  region: string;
  team: string;
  description: string;
  resolution: string | null;
  resolvedAt: string | null;
  level: number;
}

const allAlerts: Alert[] = [
  {
    id: 1, date: "31/05/2026", time: "14:27", title: "Alteração no Nível de Água",
    severity: "Crítico", sensor: "DELTA", neighborhood: "Lagoa Seca",
    city: "Juazeiro do Norte", region: "Setor Sul", team: "Equipe Drenagem Urbana",
    description: "Detecção de variações relacionadas ao aumento no fluxo da água. Nível acima do limiar crítico de 70%.",
    resolution: null, resolvedAt: null, level: 72,
  },
  {
    id: 2, date: "31/05/2026", time: "14:05", title: "Nível Elevado Detectado",
    severity: "Atenção", sensor: "DELTA", neighborhood: "Lagoa Seca",
    city: "Juazeiro do Norte", region: "Setor Sul", team: "Equipe Drenagem Urbana",
    description: "Nível de água acima do limiar de atenção (60%). Monitoramento intensificado.",
    resolution: null, resolvedAt: null, level: 65,
  },
  {
    id: 3, date: "31/05/2026", time: "11:30", title: "Nível de Água Elevado",
    severity: "Atenção", sensor: "BETA", neighborhood: "Alto da Penha",
    city: "Barbalha", region: "Setor Leste", team: "Equipe Saneamento",
    description: "Sensor de alagamento detectou elevação do nível de água na via. Nível registrado: 88%.",
    resolution: null, resolvedAt: null, level: 88,
  },
  {
    id: 4, date: "30/05/2026", time: "22:15", title: "Risco de Alagamento",
    severity: "Crítico", sensor: "ALPHA", neighborhood: "Centro",
    city: "Crato", region: "Setor Norte", team: "Equipe Drenagem Urbana",
    description: "Chuva intensa causou elevação rápida do nível nos bueiros da Av. Padre Cícero.",
    resolution: "Equipe acionada. Bombeamento realizado e vias liberadas.", resolvedAt: "30/05/2026 23:50", level: 91,
  },
  {
    id: 5, date: "30/05/2026", time: "18:42", title: "Bateria Crítica",
    severity: "Atenção", sensor: "DELTA", neighborhood: "Muriti",
    city: "Crato", region: "Setor Sul", team: "Equipe Manutenção",
    description: "Nível de bateria abaixo de 10%. Sensor pode parar de transmitir em breve.",
    resolution: "Técnico agendado para substituição da bateria.", resolvedAt: null, level: 8,
  },
  {
    id: 6, date: "30/05/2026", time: "08:00", title: "Dispositivo Offline",
    severity: "Crítico", sensor: "ZETA", neighborhood: "Pirajá",
    city: "Juazeiro do Norte", region: "Setor Oeste", team: "Equipe Manutenção",
    description: "Sensor sem comunicação há mais de 12 horas. Necessária intervenção técnica.",
    resolution: null, resolvedAt: null, level: 0,
  },
  {
    id: 7, date: "29/05/2026", time: "16:20", title: "Alagamento Preventivo Evitado",
    severity: "Resolvido", sensor: "EPSILON", neighborhood: "Triângulo",
    city: "Barbalha", region: "Setor Oeste", team: "Equipe Saneamento",
    description: "Alerta preventivo emitido. Equipe realizou desobstrução antes do alagamento.",
    resolution: "Bueiro desobstruído. Área liberada sem registros de danos.", resolvedAt: "29/05/2026 18:05", level: 79,
  },
  {
    id: 8, date: "28/05/2026", time: "03:10", title: "Enchente - Alerta Máximo",
    severity: "Crítico", sensor: "ALPHA", neighborhood: "Centro",
    city: "Crato", region: "Setor Norte", team: "Defesa Civil + Equipe Drenagem",
    description: "Nível crítico atingido. Risco de inundação na área central de Crato. Defesa Civil acionada.",
    resolution: "Área evacuada. Bombeamento de emergência. Situação normalizada em 4h.", resolvedAt: "28/05/2026 07:30", level: 98,
  },
];

const visibleDevices = allDevices.filter(device => ["D001", "D002", "D003"].includes(device.id));
const visibleAlerts = allAlerts.filter(alert => ["DELTA", "ALPHA", "BETA"].includes(alert.sensor));

const rainfallData = [
  { month: "Jan", mm: 170 }, { month: "Fev", mm: 260 }, { month: "Mar", mm: 210 },
  { month: "Abr", mm: 135 }, { month: "Mai", mm: 0 }, { month: "Jun", mm: 0 },
  { month: "Jul", mm: 0 }, { month: "Ago", mm: 0 }, { month: "Set", mm: 50 },
  { month: "Out", mm: 15 }, { month: "Nov", mm: 280 }, { month: "Dez", mm: 360 },
];

// Dashboard sensors (Lagoa Seca area)
const dashboardSensors = [
  { id: 5, lat: -7.2255, lng: -39.3180, status: "risk" as const, label: "DELTA" },
];

const markerColors: Record<string, string> = {
  normal: C.green, attention: C.amber, risk: C.red,
};

// ── Shared UI helpers ─────────────────────────────────────────────────────────
function SensorCircle({ lat, lng, status, label }: {
  lat: number; lng: number; status: "normal" | "attention" | "risk"; label: string;
}) {
  const color = markerColors[status];
  const isRisk = status === "risk";
  return (
    <>
      {isRisk && (
        <CircleMarker center={[lat, lng]} radius={18}
          pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.15 }} />
      )}
      <CircleMarker center={[lat, lng]} radius={isRisk ? 10 : 7}
        pathOptions={{ color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 }}>
        <Popup><strong>{label}</strong><br />
          {status === "normal" ? "Normal" : status === "attention" ? "Atenção" : "Risco"}
        </Popup>
      </CircleMarker>
    </>
  );
}

function statusColor(s: DeviceStatus | AlertSeverity) {
  if (s === "Ativo" || s === "Resolvido") return { bg: C.lightGreen, text: C.green };
  if (s === "Atenção") return { bg: C.lightAmber, text: C.amber };
  if (s === "Inativo" || s === "Crítico") return { bg: C.lightRed, text: C.red };
  return { bg: "#F3EEFF", text: C.purple };
}

function Badge({ label }: { label: string }) {
  const { bg, text } = statusColor(label as DeviceStatus);
  return (
    <span style={{
      background: bg, color: text, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const,
    }}>{label}</span>
  );
}

function BatteryBar({ pct }: { pct: number }) {
  const color = pct > 50 ? C.green : pct > 20 ? C.amber : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 8, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, color: C.secondaryText, fontWeight: 500 }}>{pct}%</span>
    </div>
  );
}

function LevelBar({ pct }: { pct: number }) {
  const color = pct > 70 ? C.red : pct > 50 ? C.amber : C.green;
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.mainText }}>{pct}%</span>
      <div style={{ width: 90, height: 6, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const ic = {
  home: (a: boolean) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "#fff" : C.primaryBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  map: (a: boolean) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "#fff" : C.primaryBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  bell: (a: boolean) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "#fff" : C.primaryBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  device: (a: boolean) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? "#fff" : C.primaryBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.secondaryText} strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.primaryBlue} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  chevD: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.secondaryText} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  chevL: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.secondaryText} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevR: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.secondaryText} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevLL: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.secondaryText} strokeWidth="2" strokeLinecap="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>,
  moon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.darkNavy} strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.darkNavy} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  info: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.secondaryText} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8" strokeWidth="3"/><line x1="12" y1="12" x2="12" y2="16"/></svg>,
  dots: () => <svg width="16" height="16" viewBox="0 0 24 24" fill={C.secondaryText}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.secondaryText} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  eye: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  filter: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/></svg>,
  water: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"/><path d="M3 20c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"/><path d="M12 4c1.8 2.1 3 3.6 3 5.2a3 3 0 0 1-6 0C9 7.6 10.2 6.1 12 4Z"/></svg>,
  siren: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14h12"/><path d="M7 14V9a5 5 0 0 1 10 0v5"/><path d="M4 18h16"/><path d="M12 3V1"/><path d="m5 5-1-1"/><path d="m19 5 1-1"/></svg>,
  warning: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.3 3.9-8.5 14a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3l-8.5-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  check: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg>,
  city: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.primaryBlue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4v18"/><path d="M12 21V10l7-3v14"/><path d="M8 9h1M8 13h1M8 17h1M15 12h1M15 16h1"/></svg>,
  x: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ── SIGA Logo (sidebar) ───────────────────────────────────────────────────────
function SigaLogo() {
  return (
    <img
      src={sigaLogo}
      alt="SIGA — Sistema Inteligente de Gestão de Alagamentos"
      style={{ width: 224, height: "auto", display: "block" }}
    />
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const navItems = [
  { key: "home", label: "Início", icon: ic.home },
  { key: "map", label: "Mapa", icon: ic.map },
  { key: "notifications", label: "Notificações", icon: ic.bell },
  { key: "devices", label: "Dispositivos", icon: ic.device },
];

function Sidebar({ active, onNav }: { active: string; onNav: (k: string) => void }) {
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

function Header({ active, selectedNeighborhood, selectedCity, onNeighborhoodChange, onCityChange, darkMode, onToggleTheme }: {
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
function KpiCard({ label1, label2, value, sub, subColor, iconBg, icon }: {
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

function DashboardHome({ selectedCity, selectedNeighborhood }: { selectedCity: string; selectedNeighborhood: string }) {
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
const CRAJUBAR_CENTER: [number, number] = [-7.26, -39.36];

function deviceToMarkerStatus(d: Device): "normal" | "attention" | "risk" | "offline" | "maintenance" {
  if (d.status === "Inativo") return "offline";
  if (d.status === "Manutenção") return "maintenance";
  if (d.status === "Atenção") return "attention";
  if (d.level > 70) return "risk";
  return "normal";
}

function MapViewportController({
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

function MapPage() {
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
function NotificacoesPage() {
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
type DeviceTab = "Geral" | "Localização" | "Sensores" | "Conectividade" | "Bateria" | "Manutenção";

function DeviceDetailModal({ device, onClose }: { device: Device; onClose: () => void }) {
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

function DispositivosPage() {
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

function CitizenMap({ userPosition }: { userPosition: [number, number] }) {
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

function CitizenPage() {
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
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [activeNav, setActiveNav] = useState("home");
  const [selectedCity, setSelectedCity] = useState("Juazeiro do Norte");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Lagoa Seca");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("siga-theme") === "dark");
  const [publicRoute, setPublicRoute] = useState(() => window.location.hash === "#cidadao");

  useEffect(() => {
    const handleHashChange = () => setPublicRoute(window.location.hash === "#cidadao");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (publicRoute) return <CitizenPage />;

  const handleCityChange = (city: string) => {
    const firstNeighborhood = visibleDevices.find(device => device.city === city)?.neighborhood ?? "";
    setSelectedCity(city);
    setSelectedNeighborhood(firstNeighborhood);
  };

  const toggleTheme = () => {
    setDarkMode(current => {
      const nextMode = !current;
      localStorage.setItem("siga-theme", nextMode ? "dark" : "light");
      return nextMode;
    });
  };

  return (
    <div data-theme={darkMode ? "dark" : "light"} style={{ display: "flex", height: "100%", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active={activeNav} onNav={setActiveNav} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Header active={activeNav} selectedCity={selectedCity} selectedNeighborhood={selectedNeighborhood} onCityChange={handleCityChange} onNeighborhoodChange={setSelectedNeighborhood} darkMode={darkMode} onToggleTheme={toggleTheme} />
        <main style={{ flex: 1, overflowY: "auto", padding: activeNav === "map" ? 0 : 28, display: "flex", flexDirection: "column" }}>
          {activeNav === "map"
            ? <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column" }}><MapPage /></div>
            : activeNav === "home" ? <DashboardHome selectedCity={selectedCity} selectedNeighborhood={selectedNeighborhood} />
            : activeNav === "notifications" ? <NotificacoesPage />
            : <DispositivosPage />
          }
        </main>
      </div>
    </div>
  );
}
