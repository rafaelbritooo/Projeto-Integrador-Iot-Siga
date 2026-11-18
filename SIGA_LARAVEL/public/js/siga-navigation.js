(() => {
    const layout = document.querySelector(".siga-layout");

    if (!layout || document.getElementById("dashboard")) return;

    const themeKey = "siga-dashboard-theme";
    const themeToggle = document.getElementById("theme-toggle");
    const applyTheme = (theme) => {
        layout.classList.toggle("theme-dark", theme === "dark");
        document.getElementById("theme-icon").textContent = theme === "dark" ? "☼" : "◐";
        themeToggle.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
    };

    applyTheme(localStorage.getItem(themeKey) || "light");
    themeToggle.addEventListener("click", () => {
        const nextTheme = layout.classList.contains("theme-dark") ? "light" : "dark";
        localStorage.setItem(themeKey, nextTheme);
        applyTheme(nextTheme);
    });

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
})();
