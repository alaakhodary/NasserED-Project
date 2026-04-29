"use strict";

(function () {
  const STORAGE_KEY = "dashboard-theme";
  const SITE_SETTINGS_KEY = "dashboard-site-settings-v1";
  const SIDEBAR_SCROLL_KEY = "dashboard-sidebar-scroll-top";
  const root = document.documentElement;

  function logoPath(theme) {
    var customLogo = "";
    try {
      var raw = localStorage.getItem(SITE_SETTINGS_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      customLogo = parsed && typeof parsed === "object" ? String(parsed.departmentLogo || "").trim() : "";
    } catch {
      customLogo = "";
    }
    if (customLogo) return customLogo;
    return "../../img/logo-dark.webp";
  }

  function applyDashboardFavicon() {
    var browserLogo = "";
    try {
      var raw = localStorage.getItem(SITE_SETTINGS_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      browserLogo = parsed && typeof parsed === "object" ? String(parsed.browserLogo || "").trim() : "";
    } catch {
      browserLogo = "";
    }
    if (!browserLogo) browserLogo = "../../img/logo.webp";
    if (browserLogo.indexOf("img/") === 0) {
      browserLogo = "../../" + browserLogo;
    }
    var icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = browserLogo;
  }

  function apply(theme) {
    if (theme !== "light" && theme !== "dark") theme = "dark";
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }

    var logoImgs = document.querySelectorAll(".sidebar .brand img[data-dashboard-logo]");
    if (!logoImgs.length) {
      logoImgs = document.querySelectorAll(".sidebar .brand img");
    }
    logoImgs.forEach(function (img) {
      img.src = logoPath(theme);
    });

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var icon = btn.querySelector("i");
      if (icon) {
        icon.className = theme === "light" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
      }
      btn.title = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
      btn.setAttribute("aria-label", btn.title);
      var label = btn.querySelector(".theme-toggle-label");
      if (label) label.textContent = theme === "light" ? "Light" : "Dark";
    });
  }

  function readStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "light" || v === "dark") return v;
    } catch {
      /* ignore */
    }
    return "dark";
  }

  function initSidebarScrollPersistence() {
    var scrollBody = document.querySelector(".dashboard-shell .sidebar-scroll-body");
    if (!scrollBody) return;

    try {
      var storedTop = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
      if (storedTop !== null) {
        scrollBody.scrollTop = Number(storedTop) || 0;
      }
    } catch {
      /* ignore */
    }

    var saveScrollTop = function () {
      try {
        sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(scrollBody.scrollTop));
      } catch {
        /* ignore */
      }
    };

    scrollBody.addEventListener("scroll", saveScrollTop, { passive: true });

    document.addEventListener("click", function (event) {
      var link = event.target.closest(".dashboard-shell .sidebar a");
      if (!link) return;
      saveScrollTop();
    });
  }

  function initSidebarScrollBody() {
    var sidebar = document.querySelector(".dashboard-shell .sidebar");
    if (!sidebar) return;
    if (sidebar.querySelector(":scope > .sidebar-scroll-body")) return;

    var brand = sidebar.querySelector(":scope > .brand");
    var scrollBody = document.createElement("div");
    scrollBody.className = "sidebar-scroll-body";

    var children = Array.from(sidebar.children);
    children.forEach(function (node) {
      if (brand && node === brand) return;
      scrollBody.appendChild(node);
    });
    sidebar.appendChild(scrollBody);
  }

  function refreshBrandAssetsFromSettings() {
    var current = root.getAttribute("data-theme") || "dark";
    apply(current);
    applyDashboardFavicon();
  }

  apply(readStored());
  initSidebarScrollBody();
  applyDashboardFavicon();
  initSidebarScrollPersistence();
  window.addEventListener("storage", function (event) {
    if (event.key !== SITE_SETTINGS_KEY) return;
    refreshBrandAssetsFromSettings();
  });
  window.addEventListener("dashboard-site-settings-updated", function () {
    refreshBrandAssetsFromSettings();
  });

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-theme-toggle]");
    if (!btn) return;
    event.preventDefault();
    var current = root.getAttribute("data-theme") || "dark";
    apply(current === "dark" ? "light" : "dark");
  });
})();
