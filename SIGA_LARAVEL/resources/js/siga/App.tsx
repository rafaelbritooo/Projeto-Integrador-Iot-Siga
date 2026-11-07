import { useEffect, useState } from "react";
import { Sidebar, Header } from "./components/Layout";
import { DashboardHome } from "./pages/Dashboard";
import { MapPage } from "./pages/Map";
import { NotificacoesPage } from "./pages/Notifications";
import { DispositivosPage } from "./pages/Devices";
import { CitizenPage } from "./pages/Citizen";
import { C, visibleDevices } from "./data/sigaData";

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
