(() => {
    const mapElement = document.getElementById("full-map-canvas");
    const readingsPage = document.getElementById("reading-page");
    const refreshMs = Number(readingsPage?.dataset.refreshMs || mapElement?.dataset.refreshMs) || 10000;

    if (mapElement && typeof window.L !== "undefined") {
        const map = window.L.map(mapElement).setView([0, 0], 2);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const status = document.getElementById("map-refresh-status");
        const deviceCount = document.getElementById("map-device-count");
        const deviceStatusList = document.getElementById("map-device-status-list");
        const markers = new Map();
        let hasAutoFitted = false;
        let userMovedMap = false;
        let updating = false;

        map.on("dragstart zoomstart", () => {
            userMovedMap = true;
        });

        const safePopup = (device) => {
            const popup = document.createElement("div");
            popup.className = "device-popup";
            const heading = document.createElement("strong");
            heading.textContent = device.name;
            popup.append(heading);
            const rows = [
                ["Código", device.code],
                ["Coordenadas estimadas", `${Number(device.latitude).toFixed(6)}, ${Number(device.longitude).toFixed(6)}`],
                ["Origem da posição", device.coordinates_source === "area" ? "Área cadastrada" : "Localização Wi-Fi"],
                ["Área", device.area_address || "Não associada"],
                ["Precisão estimada", device.location_accuracy == null ? "Indisponível" : `raio de ${number(device.location_accuracy)} m`],
                ["Estado da localização", device.location_status === "located"
                    ? (device.location_is_approximate ? "Estimativa aproximada" : "Estimativa Wi-Fi")
                    : `Última posição válida; atualização: ${locationStatus(device.location_status)}`],
                ["Conexão", device.connection_status === "connected" ? "Conectado" : "Sem comunicação recente"],
                ["Nível da água", device.latest_reading?.water_level_cm == null ? "--" : `${number(device.latest_reading.water_level_cm)} cm`],
                ["Estado da água", device.latest_reading?.water_status || "--"],
                ["Bomba", device.latest_reading?.pump_on == null ? "--" : device.latest_reading.pump_on ? "Ligada" : "Desligada"],
                ["Última leitura/comunicação", date(device.last_communication_at)],
                ["Localização atualizada", date(device.location_updated_at)],
            ];
            const list = document.createElement("dl");
            rows.forEach(([label, value]) => {
                const wrapper = document.createElement("div");
                const term = document.createElement("dt");
                const description = document.createElement("dd");
                term.textContent = label;
                description.textContent = value;
                wrapper.append(term, description);
                list.append(wrapper);
            });
            popup.append(list);
            return popup;
        };

        const number = (value) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
        const date = (value) => value
            ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value))
            : "Sem comunicação";
        const locationStatus = (value) => ({
            located: "Localização encontrada",
            pending: "Aguardando localização",
            unavailable: "Localização não encontrada",
            insufficient_wifi: "Pontos Wi-Fi insuficientes",
            error: "Falha na geolocalização",
        }[value] || "Estado de localização desconhecido");

        const updateMap = (devices, unlocatedDevices) => {
            const activeIds = new Set();
            const bounds = [];

            devices.forEach((device) => {
                activeIds.add(device.id);
                const position = [device.latitude, device.longitude];
                bounds.push(position);
                let entry = markers.get(device.id);
                const pumpState = device.latest_reading?.pump_on ? "is-pump-on" : "is-pump-off";
                const pumpIcon = () => window.L.divIcon({
                    className: "device-marker-wrapper",
                    html: `<span class="device-marker-pulse ${pumpState}"><span></span></span>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                });

                if (!entry) {
                    const marker = window.L.marker(position, { icon: pumpIcon() }).addTo(map);
                    const accuracyCircle = window.L.circle(position, {
                        radius: Math.max(0, Number(device.location_accuracy) || 0),
                        className: `device-accuracy-circle ${pumpState}`,
                        weight: 1,
                    }).addTo(map);
                    entry = { marker, accuracyCircle };
                    markers.set(device.id, entry);
                } else {
                    entry.marker.setLatLng(position);
                    entry.marker.setIcon(pumpIcon());
                    entry.accuracyCircle.setLatLng(position);
                    entry.accuracyCircle.setRadius(Math.max(0, Number(device.location_accuracy) || 0));
                    entry.accuracyCircle.setStyle({
                        fillColor: pumpState === "is-pump-on" ? "#dc2626" : "#16a34a",
                        color: pumpState === "is-pump-on" ? "#dc2626" : "#16a34a",
                    });
                }

                const tooltip = document.createElement("span");
                tooltip.textContent = device.name;
                entry.marker.bindTooltip(tooltip);
                entry.marker.bindPopup(safePopup(device));
            });

            markers.forEach((entry, id) => {
                if (!activeIds.has(id)) {
                    map.removeLayer(entry.marker);
                    map.removeLayer(entry.accuracyCircle);
                    markers.delete(id);
                }
            });

            if (!hasAutoFitted && bounds.length > 0) {
                hasAutoFitted = true;
                if (!userMovedMap) {
                    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
                }
            }

            deviceCount.textContent = `${devices.length} localizado${devices.length === 1 ? "" : "s"}`;
            deviceStatusList.replaceChildren();
            if (unlocatedDevices.length === 0) {
                const empty = document.createElement("p");
                empty.className = "empty-state";
                empty.textContent = devices.length
                    ? "Todos os dispositivos ativos possuem uma posição estimada."
                    : "Nenhum dispositivo registrado ou aguardando uma varredura Wi-Fi.";
                deviceStatusList.append(empty);
                return;
            }

            unlocatedDevices.forEach((device) => {
                const item = document.createElement("article");
                item.className = "map-device-status";
                const heading = document.createElement("strong");
                heading.textContent = device.name;
                const code = document.createElement("span");
                code.textContent = device.code;
                const locationState = document.createElement("span");
                locationState.textContent = locationStatus(device.location_status);
                const connection = document.createElement("span");
                connection.textContent = device.connection_status === "connected" ? "Conectado" : "Sem comunicação recente";
                item.append(heading, code, locationState, connection);
                deviceStatusList.append(item);
            });
        };

        const refreshMapStatus = async () => {
            if (updating) return;
            updating = true;
            try {
                const response = await fetch(mapElement.dataset.dataUrl, {
                    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
                    credentials: "same-origin",
                });
                if (!response.ok) throw new Error(`Falha na consulta (${response.status}).`);
                const data = await response.json();
                const reading = data.latest_reading;
                const devices = data.devices || [];
                const unlocatedDevices = data.unlocated_devices || [];
                updateMap(devices, unlocatedDevices);
                status.textContent = devices.length
                    ? `${devices.length} dispositivo${devices.length === 1 ? "" : "s"} localizado${devices.length === 1 ? "" : "s"}; ${unlocatedDevices.length} sem posição. Dados consultados em ${date(data.checked_at)}.`
                    : `${data.message} Dados consultados em ${date(data.checked_at)}.`;
                if (reading?.created_at) {
                    status.textContent += ` Última leitura: ${date(reading.created_at)}.`;
                }
                status.classList.remove("is-error");
            } catch {
                status.textContent = "Não foi possível atualizar os dispositivos. A última posição visível pode estar desatualizada.";
                status.classList.add("is-error");
            } finally {
                updating = false;
            }
        };

        window.addEventListener("resize", () => map.invalidateSize());
        refreshMapStatus();
        window.setInterval(refreshMapStatus, refreshMs);
    }

    if (!readingsPage) return;

    const tbody = document.getElementById("reading-table-body");
    const countLabel = document.getElementById("reading-results-count");
    const pagination = document.getElementById("reading-pagination");
    const refreshStatus = document.getElementById("reading-refresh-status");
    const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
    const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" });
    let updating = false;

    const textCell = (value) => {
        const cell = document.createElement("td");
        cell.textContent = value === null || value === undefined || value === "" ? "--" : String(value);
        return cell;
    };

    const detailsCell = (reading) => {
        const cell = document.createElement("td");
        const details = document.createElement("details");
        details.className = "reading-details";
        const summary = document.createElement("summary");
        summary.textContent = "Detalhes";
        const list = document.createElement("dl");
        list.className = "detail-grid";

        [
            ["ID", reading.id],
            ["Timestamp", reading.created_at ? new Date(reading.created_at).toISOString() : "--"],
            ["Estado da bomba", reading.pump_on === null ? "--" : reading.pump_on ? "Ligada" : "Desligada"],
            ["Simulação", reading.simulation ? "Sim" : "Não"],
        ].forEach(([label, value]) => {
            const wrapper = document.createElement("div");
            const term = document.createElement("dt");
            term.textContent = label;
            const description = document.createElement("dd");
            description.textContent = value;
            wrapper.append(term, description);
            list.append(wrapper);
        });

        details.append(summary, list);
        cell.append(details);
        return cell;
    };

    const updatePaginationLink = (label, page, disabled, currentUrl) => {
        const element = pagination.querySelector(`[data-page-link="${label}"]`);
        element.replaceChildren();
        if (disabled) {
            element.className = "pagination-disabled";
            element.textContent = label === "previous" ? "Anterior" : "Próxima";
            return;
        }

        element.className = "";
        const url = new URL(currentUrl, window.location.origin);
        url.searchParams.set("page", page);
        const link = document.createElement("a");
        link.href = url.toString();
        link.textContent = label === "previous" ? "Anterior" : "Próxima";
        element.append(link);
    };

    const updateTable = ({ data, meta }) => {
        tbody.replaceChildren();

        if (data.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.className = "table-empty";
            cell.colSpan = 7;
            cell.textContent = "Nenhuma leitura encontrada para os filtros selecionados.";
            row.append(cell);
            tbody.append(row);
        } else {
            data.forEach((reading) => {
                const row = document.createElement("tr");
                const readingDate = reading.created_at ? dateFormat.format(new Date(reading.created_at)) : "--";
                row.append(
                    textCell(readingDate),
                    textCell(reading.water_level_cm == null ? "--" : `${numberFormat.format(reading.water_level_cm)} cm`),
                    textCell(reading.rain_sensor_raw),
                    textCell(reading.water_status),
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
                const sourceCell = document.createElement("td");
                const sourceBadge = document.createElement("span");
                sourceBadge.className = `status-tag ${reading.simulation ? "status-info" : "status-neutral"}`;
                sourceBadge.textContent = reading.simulation ? "Simulação" : "Real";
                sourceCell.append(sourceBadge);

                row.append(pumpCell, sourceCell, detailsCell(reading));
                tbody.append(row);
            });
        }

        countLabel.textContent = meta.total === 0
            ? "Nenhuma leitura"
            : `Exibindo ${meta.from}–${meta.to} de ${meta.total} leituras`;
        pagination.querySelector("[data-page-number]").textContent = `Página ${meta.current_page} de ${Math.max(1, meta.last_page)}`;
        updatePaginationLink("previous", Math.max(1, meta.current_page - 1), meta.current_page <= 1, window.location.href);
        updatePaginationLink("next", Math.min(meta.last_page, meta.current_page + 1), meta.current_page >= meta.last_page, window.location.href);
    };

    const refreshReadings = async () => {
        if (updating) return;
        updating = true;
        try {
            const url = new URL(readingsPage.dataset.refreshUrl, window.location.origin);
            const response = await fetch(url, {
                headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
                credentials: "same-origin",
            });
            if (!response.ok) throw new Error(`Falha na consulta (${response.status}).`);
            updateTable(await response.json());
            refreshStatus.textContent = `Atualizado às ${new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date())}.`;
            refreshStatus.classList.remove("is-error");
        } catch {
            refreshStatus.textContent = "Não foi possível atualizar as leituras.";
            refreshStatus.classList.add("is-error");
        } finally {
            updating = false;
        }
    };

    refreshReadings();
    window.setInterval(refreshReadings, refreshMs);
})();
