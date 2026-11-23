(() => {
    const dashboard = document.getElementById("dashboard");
    const layout = document.querySelector(".siga-layout");

    if (!dashboard || !layout) return;

    const endpoints = {
        summary: dashboard.dataset.summaryUrl,
        chart: dashboard.dataset.chartUrl,
        alerts: dashboard.dataset.alertsUrl,
        readings: dashboard.dataset.readingsUrl,
    };
    const refreshInterval = Number(dashboard.dataset.refreshMs) || 8000;
    const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
    const chartCanvas = document.getElementById("water-chart");
    const chartEmpty = document.getElementById("chart-empty");
    const chartPeriod = document.getElementById("chart-period");
    const eventList = document.getElementById("event-list");
    const readingsBody = document.getElementById("readings-body");
    const pagination = document.getElementById("readings-pagination");
    const refreshStatus = document.getElementById("refresh-status");
    let chart = null;
    let map = null;
    let currentPage = 1;
    let perPage = 10;
    let requestInFlight = false;

    const safeText = (value, fallback = "--") => value === null || value === undefined || value === ""
        ? fallback
        : String(value);

    const formatDate = (value) => {
        if (!value) return "--";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? "--"
            : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(date);
    };

    const setStatus = (message, failed = false) => {
        refreshStatus.textContent = message;
        dashboard.querySelector(".dashboard-status").classList.toggle("is-error", failed);
    };

    const fetchJson = async (url) => {
        const response = await fetch(url, {
            headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
            credentials: "same-origin",
        });
        if (!response.ok) throw new Error(`Falha na consulta (${response.status}).`);
        return response.json();
    };

    const updateSummary = ({ data }) => {
        document.getElementById("metric-total").textContent = numberFormat.format(data.total_readings);
        document.getElementById("metric-today").textContent = numberFormat.format(data.readings_today);
        const latest = data.latest_reading;
        document.getElementById("metric-water-level").textContent = latest?.water_level_cm == null
            ? "--"
            : `${numberFormat.format(latest.water_level_cm)} cm`;
        document.getElementById("metric-pump").textContent = latest?.pump_on == null
            ? "Sem leitura"
            : latest.pump_on ? "Ligada" : "Desligada";
    };

    const renderChart = (points) => {
        const hasData = Array.isArray(points) && points.length > 0;
        chartCanvas.hidden = !hasData;
        chartEmpty.hidden = hasData;

        if (chart) {
            chart.destroy();
            chart = null;
        }
        if (!hasData || typeof window.Chart !== "function") return;

        chart = new window.Chart(chartCanvas, {
            type: "bar",
            data: {
                labels: points.map((point) => point.label),
                datasets: [{
                    label: "Nível médio da água (cm)",
                    data: points.map((point) => point.value),
                    backgroundColor: "#0860d7",
                    borderRadius: 2,
                    maxBarThickness: 18,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: "index" },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (context) => ` ${context.parsed.y} cm` } },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: "#718096", maxTicksLimit: 12, font: { size: 9 } } },
                    y: { beginAtZero: true, grid: { color: "#edf1f6" }, ticks: { color: "#718096", font: { size: 9 } }, title: { display: true, text: "cm", color: "#718096" } },
                },
            },
        });
    };

    const renderEvents = ({ data }) => {
        eventList.replaceChildren();
        if (!data.length) {
            const empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent = "Nenhum evento de bomba ligada nas últimas 24 horas.";
            eventList.append(empty);
            return;
        }

        data.forEach((event) => {
            const item = document.createElement("article");
            item.className = "event-item";
            const icon = document.createElement("span");
            icon.className = "event-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "◉";

            const copy = document.createElement("div");
            copy.className = "event-copy";
            const title = document.createElement("strong");
            title.textContent = safeText(event.message);
            const description = document.createElement("p");
            description.textContent = safeText(event.water_status, "Estado informado pelo sensor; sem classificação de risco.");
            const time = document.createElement("time");
            time.dateTime = event.created_at || "";
            time.textContent = formatDate(event.created_at);
            copy.append(title, description, time);

            const badge = document.createElement("span");
            badge.className = "status-tag status-info";
            badge.textContent = "Informativo";
            item.append(icon, copy, badge);
            eventList.append(item);
        });
    };

    const createCell = (value) => {
        const cell = document.createElement("td");
        cell.textContent = safeText(value);
        return cell;
    };

    const renderReadings = ({ data, meta }) => {
        readingsBody.replaceChildren();
        if (!data.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.className = "table-empty";
            cell.colSpan = 6;
            cell.textContent = "Nenhuma leitura encontrada no banco de dados.";
            row.append(cell);
            readingsBody.append(row);
        } else {
            data.forEach((reading) => {
                const row = document.createElement("tr");
                row.append(
                    createCell(formatDate(reading.created_at)),
                    createCell(reading.water_level_cm == null ? "--" : `${numberFormat.format(reading.water_level_cm)} cm`),
                    createCell(reading.rain_sensor_raw),
                    createCell(reading.water_status),
                );

                const pumpCell = document.createElement("td");
                if (reading.pump_on == null) {
                    pumpCell.textContent = "--";
                } else {
                    const badge = document.createElement("span");
                    badge.className = `status-tag ${reading.pump_on ? "status-warning" : "status-neutral"}`;
                    badge.textContent = reading.pump_on ? "Ligada" : "Desligada";
                    pumpCell.append(badge);
                }
                row.append(pumpCell, createCell(reading.simulation ? "Simulação" : "Real"));
                readingsBody.append(row);
            });
        }

        const start = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
        const end = Math.min(meta.current_page * meta.per_page, meta.total);
        document.getElementById("readings-count").textContent = meta.total === 0
            ? "Nenhuma leitura"
            : `Exibindo ${start}–${end} de ${meta.total} leituras`;
        document.getElementById("current-page").textContent = meta.current_page;
        const [previous, , next] = pagination.children;
        previous.dataset.page = Math.max(1, meta.current_page - 1);
        previous.disabled = meta.current_page <= 1;
        next.dataset.page = Math.min(meta.last_page, meta.current_page + 1);
        next.disabled = meta.current_page >= meta.last_page;
        currentPage = meta.current_page;
    };

    const readingsUrl = (page) => {
        const url = new URL(endpoints.readings, window.location.origin);
        url.searchParams.set("page", page);
        url.searchParams.set("per_page", perPage);
        return url;
    };

    const refreshDashboard = async () => {
        if (requestInFlight) return;
        requestInFlight = true;
        setStatus("Atualizando dados…");

        const requests = await Promise.allSettled([
            fetchJson(endpoints.summary).then(updateSummary),
            fetchJson(`${endpoints.chart}?period=${encodeURIComponent(chartPeriod.value)}`).then(({ data }) => renderChart(data)),
            fetchJson(endpoints.alerts).then(renderEvents),
            fetchJson(readingsUrl(currentPage)).then(renderReadings),
        ]);
        requestInFlight = false;

        const failed = requests.some((result) => result.status === "rejected");
        setStatus(
            failed
                ? "Não foi possível atualizar todos os dados. Tentaremos novamente."
                : `Atualizado às ${new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date())} · atualização automática a cada ${Math.round(refreshInterval / 1000)} s`,
            failed,
        );
    };

    const initializeMap = () => {
        const mapElement = document.getElementById("monitoring-map-canvas");
        if (!mapElement || typeof window.L === "undefined") return;

        map = window.L.map(mapElement, { scrollWheelZoom: false }).setView([0, 0], 2);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const status = document.getElementById("dashboard-map-status");
        const markers = new Map();
        let hasAutoFitted = false;
        let userMovedMap = false;
        let updatingMap = false;
        map.on("dragstart zoomstart", () => {
            userMovedMap = true;
        });

        const refreshMap = async () => {
            if (updatingMap) return;
            updatingMap = true;

            try {
                const data = await fetchJson(mapElement.dataset.devicesUrl);
                const devices = data.devices || [];
                const activeIds = new Set();
                const bounds = [];

                devices.forEach((device) => {
                    activeIds.add(device.id);
                    const position = [device.latitude, device.longitude];
                    bounds.push(position);
                    let marker = markers.get(device.id);
                    const pumpState = device.latest_reading?.pump_on ? "is-pump-on" : "is-pump-off";

                    if (!marker) {
                        const icon = window.L.divIcon({
                            className: "device-marker-wrapper",
                            html: `<span class="device-marker-pulse ${pumpState}"><span></span></span>`,
                            iconSize: [28, 28],
                            iconAnchor: [14, 14],
                        });
                        marker = window.L.marker(position, { icon }).addTo(map);
                        markers.set(device.id, marker);
                    } else {
                        marker.setLatLng(position);
                        marker.setIcon(window.L.divIcon({
                            className: "device-marker-wrapper",
                            html: `<span class="device-marker-pulse ${pumpState}"><span></span></span>`,
                            iconSize: [28, 28],
                            iconAnchor: [14, 14],
                        }));
                    }

                    const tooltip = document.createElement("span");
                    tooltip.textContent = device.name;
                    marker.bindTooltip(tooltip);
                });

                markers.forEach((marker, id) => {
                    if (!activeIds.has(id)) {
                        map.removeLayer(marker);
                        markers.delete(id);
                    }
                });

                if (!hasAutoFitted && bounds.length && !userMovedMap) {
                    hasAutoFitted = true;
                    map.fitBounds(bounds, { padding: [18, 18], maxZoom: 15 });
                }

                status.textContent = devices.length
                    ? `${devices.length} dispositivo${devices.length === 1 ? "" : "s"} localizado${devices.length === 1 ? "" : "s"} por Wi-Fi`
                    : data.message;
                status.classList.remove("is-error");
            } catch {
                status.textContent = "Não foi possível atualizar as posições Wi-Fi.";
                status.classList.add("is-error");
            } finally {
                updatingMap = false;
            }
        };

        refreshMap();
        window.setInterval(refreshMap, refreshInterval);
    };

    const initializeTheme = () => {
        const themeKey = "siga-dashboard-theme";
        const applyTheme = (theme) => {
            layout.classList.toggle("theme-dark", theme === "dark");
            document.getElementById("theme-icon").textContent = theme === "dark" ? "☼" : "◐";
            document.getElementById("theme-toggle").setAttribute(
                "aria-label",
                theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro",
            );
        };
        applyTheme(localStorage.getItem(themeKey) || "light");
        document.getElementById("theme-toggle").addEventListener("click", () => {
            const nextTheme = layout.classList.contains("theme-dark") ? "light" : "dark";
            localStorage.setItem(themeKey, nextTheme);
            applyTheme(nextTheme);
        });
    };

    const initialDataElement = document.getElementById("initial-chart-data");
    if (initialDataElement) {
        try {
            renderChart(JSON.parse(initialDataElement.textContent));
        } catch {
            renderChart([]);
        }
    }

    initializeMap();
    initializeTheme();

    document.getElementById("sidebar-toggle").addEventListener("click", (event) => {
        const mobile = window.matchMedia("(max-width: 680px)").matches;
        if (mobile) {
            layout.classList.toggle("mobile-menu-open");
            event.currentTarget.setAttribute("aria-expanded", String(layout.classList.contains("mobile-menu-open")));
        } else {
            layout.classList.toggle("sidebar-collapsed");
            event.currentTarget.setAttribute("aria-expanded", String(!layout.classList.contains("sidebar-collapsed")));
        }
    });

    document.querySelectorAll(".sidebar-nav a").forEach((link) => {
        link.addEventListener("click", () => layout.classList.remove("mobile-menu-open"));
    });

    chartPeriod.addEventListener("change", () => {
        fetchJson(`${endpoints.chart}?period=${encodeURIComponent(chartPeriod.value)}`)
            .then(({ data }) => renderChart(data))
            .catch(() => setStatus("Não foi possível carregar o gráfico.", true));
    });

    pagination.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;
        fetchJson(readingsUrl(Number(button.dataset.page)))
            .then(renderReadings)
            .catch(() => setStatus("Não foi possível carregar as leituras.", true));
    });

    document.getElementById("readings-per-page").addEventListener("change", (event) => {
        perPage = Number(event.target.value);
        currentPage = 1;
        fetchJson(readingsUrl(currentPage))
            .then(renderReadings)
            .catch(() => setStatus("Não foi possível carregar as leituras.", true));
    });

    window.addEventListener("resize", () => map?.invalidateSize());
    window.setInterval(refreshDashboard, refreshInterval);
    refreshDashboard();
})();