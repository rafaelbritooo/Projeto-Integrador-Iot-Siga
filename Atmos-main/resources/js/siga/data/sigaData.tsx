import { useEffect, useRef, useState } from "react";
import sigaLogo from "../assets/siga-logo-1.png";
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
export const C = {
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

export const cardStyle = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(15,39,71,0.05)",
};

// ── Shared data ───────────────────────────────────────────────────────────────
export type DeviceStatus = "Ativo" | "Atenção" | "Inativo" | "Manutenção";

export interface Device {
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

export const allDevices: Device[] = [
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

export type AlertSeverity = "Crítico" | "Atenção" | "Informativo" | "Resolvido";

export interface Alert {
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

export const allAlerts: Alert[] = [
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

export const visibleDevices = allDevices.filter(device => ["D001", "D002", "D003"].includes(device.id));
export const visibleAlerts = allAlerts.filter(alert => ["DELTA", "ALPHA", "BETA"].includes(alert.sensor));

export const rainfallData = [
  { month: "Jan", mm: 170 }, { month: "Fev", mm: 260 }, { month: "Mar", mm: 210 },
  { month: "Abr", mm: 135 }, { month: "Mai", mm: 0 }, { month: "Jun", mm: 0 },
  { month: "Jul", mm: 0 }, { month: "Ago", mm: 0 }, { month: "Set", mm: 50 },
  { month: "Out", mm: 15 }, { month: "Nov", mm: 280 }, { month: "Dez", mm: 360 },
];

// Dashboard sensors (Lagoa Seca area)
export const dashboardSensors = [
  { id: 5, lat: -7.2255, lng: -39.3180, status: "risk" as const, label: "DELTA" },
];

export const markerColors: Record<string, string> = {
  normal: C.green, attention: C.amber, risk: C.red,
};

// ── Shared UI helpers ─────────────────────────────────────────────────────────
export function SensorCircle({ lat, lng, status, label }: {
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

export function statusColor(s: DeviceStatus | AlertSeverity) {
  if (s === "Ativo" || s === "Resolvido") return { bg: C.lightGreen, text: C.green };
  if (s === "Atenção") return { bg: C.lightAmber, text: C.amber };
  if (s === "Inativo" || s === "Crítico") return { bg: C.lightRed, text: C.red };
  return { bg: "#F3EEFF", text: C.purple };
}

export function Badge({ label }: { label: string }) {
  const { bg, text } = statusColor(label as DeviceStatus);
  return (
    <span style={{
      background: bg, color: text, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const,
    }}>{label}</span>
  );
}

export function BatteryBar({ pct }: { pct: number }) {
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

export function LevelBar({ pct }: { pct: number }) {
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
export const ic = {
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
export function SigaLogo() {
  return (
    <img
      src={sigaLogo}
      alt="SIGA — Sistema Inteligente de Gestão de Alagamentos"
      style={{ width: 224, height: "auto", display: "block" }}
    />
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export const navItems = [
  { key: "home", label: "Início", icon: ic.home },
  { key: "map", label: "Mapa", icon: ic.map },
  { key: "notifications", label: "Notificações", icon: ic.bell },
  { key: "devices", label: "Dispositivos", icon: ic.device },
];
