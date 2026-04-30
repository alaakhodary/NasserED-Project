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

  function initSidebarNavigation() {
    var nav = document.querySelector(".dashboard-shell .sidebar-nav");
    if (!nav) return;

    var pagePath = String(location.pathname || "").replace(/\\/g, "/").toLowerCase();
    var prefix = "../";
    if (pagePath.endsWith("/dashboard/index.html") || pagePath.endsWith("/dashboard/")) {
      prefix = "./";
    }

    var items = [
      {
        type: "dropdown",
        title: "Home",
        icon: "bi-house-door",
        links: [
          { href: prefix + "slider/index.html", label: "Slider", icon: "bi-sliders" },
          { href: prefix + "department-news/index.html", label: "Department", icon: "bi-newspaper" },
        ],
      },
      { type: "link", href: prefix + "pages/overview.html", title: "Overview", icon: "bi-grid-1x2" },
      {
        type: "dropdown",
        title: "Senior Staff",
        icon: "bi-person-badge",
        links: [
          { href: prefix + "senior-staff/index.html", label: "Senior Staff", icon: "bi-person-badge" },
          { href: prefix + "impact/index.html", label: "Impact", icon: "bi-bar-chart-line" },
        ],
      },
      {
        type: "dropdown",
        title: "TheEd",
        icon: "bi-hospital",
        links: [
          { href: prefix + "pages/mci-plan.html", label: "MCI Plan", icon: "bi-journal-text" },
          { href: prefix + "pages/registration.html", label: "Registration", icon: "bi-person-plus" },
          { href: prefix + "pages/triage.html", label: "Triage", icon: "bi-clipboard2-pulse" },
        ],
      },
      {
        type: "dropdown",
        title: "Nursing",
        icon: "bi-heart-pulse",
        links: [
          { href: prefix + "pages/ipc.html", label: "IPC", icon: "bi-shield" },
          { href: prefix + "pages/monitoring.html", label: "Monitoring", icon: "bi-activity" },
          { href: prefix + "pages/checking-stocking.html", label: "Checking and Stocking", icon: "bi-box-seam" },
          { href: prefix + "pages/training.html", label: "Training", icon: "bi-mortarboard" },
        ],
      },
      {
        type: "dropdown",
        title: "Safeguarding",
        icon: "bi-person-hearts",
        links: [
          { href: prefix + "pages/gbv.html", label: "GBV", icon: "bi-shield-exclamation" },
          { href: prefix + "pages/child-protection.html", label: "Child Protection", icon: "bi-people" },
        ],
      },
      {
        type: "dropdown",
        title: "Legal",
        icon: "bi-file-earmark-text",
        links: [
          { href: prefix + "pages/privacy-policy.html", label: "Privacy Policy", icon: "bi-file-lock2" },
          { href: prefix + "pages/terms-of-use.html", label: "Terms of Use", icon: "bi-file-text" },
          { href: prefix + "pages/disclaimer.html", label: "Disclaimer", icon: "bi-exclamation-triangle" },
        ],
      },
      { type: "link", href: prefix + "pages/uk-med.html", title: "UK-MED", icon: "bi-shield-check" },
      { type: "link", href: prefix + "pages/ed-research.html", title: "ED Research", icon: "bi-graph-up-arrow" },
      { type: "link", href: "#", title: "Knowledge", icon: "bi-journal-medical" },
      { type: "link", href: prefix + "pages/telemedicine.html", title: "Telemedicine", icon: "bi-camera-video" },
      { type: "link", href: prefix + "pages/index.html", title: "Podcast", icon: "bi-mic" },
      { type: "link", href: prefix + "pages/hand-over.html", title: "Hand Over", icon: "bi-box-arrow-right" },
      { type: "link", href: prefix + "settings/index.html", title: "Settings", icon: "bi-gear" },
    ];

    function esc(text) {
      return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function normalizePath(pathname) {
      return String(pathname || "").replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
    }

    function isHrefActive(href) {
      if (!href || href === "#") return false;
      try {
        var target = new URL(href, location.href);
        return normalizePath(target.pathname) === normalizePath(location.pathname);
      } catch {
        return false;
      }
    }

    function shouldSmoothNavigate(link) {
      if (!link) return false;
      if (link.target === "_blank" || link.hasAttribute("download")) return false;
      var hrefAttr = link.getAttribute("href") || "";
      if (!hrefAttr || hrefAttr === "#" || hrefAttr.startsWith("javascript:")) return false;
      try {
        var target = new URL(hrefAttr, location.href);
        if (target.origin !== location.origin) return false;
        return normalizePath(target.pathname) !== normalizePath(location.pathname);
      } catch {
        return false;
      }
    }

    var html = ['<p class="nav-title">Content Management</p>'];

    items.forEach(function (item) {
      if (item.type === "dropdown") {
        var hasActiveChild = item.links.some(function (child) {
          return isHrefActive(child.href);
        });
        var shouldOpenDropdown = hasActiveChild && item.title !== "Home";
        html.push(
          '<details class="nav-dropdown"' +
            (shouldOpenDropdown ? " open" : "") +
            ">" +
            '<summary class="nav-link-item' +
            (hasActiveChild ? " active" : "") +
            '">' +
            '<i class="bi ' +
            esc(item.icon) +
            '"></i> ' +
            esc(item.title) +
            ' <i class="bi bi-chevron-down nav-caret"></i></summary>' +
            '<div class="nav-dropdown-menu">'
        );
        item.links.forEach(function (child) {
          var isActive = isHrefActive(child.href);
          html.push(
            '<a class="nav-link-item nav-link-sub' +
              (isActive ? " active" : "") +
              '" href="' +
              esc(child.href) +
              '"><i class="bi ' +
              esc(child.icon) +
              '"></i> ' +
              esc(child.label) +
              "</a>"
          );
        });
        html.push("</div></details>");
      } else {
        var isActive = isHrefActive(item.href);
        html.push(
          '<a class="nav-link-item' +
            (isActive ? " active" : "") +
            '" href="' +
            esc(item.href) +
            '"><i class="bi ' +
            esc(item.icon) +
            '"></i> ' +
            esc(item.title) +
            "</a>"
        );
      }
    });

    nav.innerHTML = html.join("");

    function clearActiveState() {
      nav.querySelectorAll(".nav-link-item.active").forEach(function (el) {
        el.classList.remove("active");
      });
    }

    nav.addEventListener("click", function (event) {
      var link = event.target.closest("a.nav-link-item");
      if (link) {
        if (shouldSmoothNavigate(link)) {
          event.preventDefault();
          showDashboardPageLoader();
          window.setTimeout(function () {
            window.location.href = link.href;
          }, 150);
          return;
        }
        clearActiveState();
        link.classList.add("active");
        return;
      }
      var summary = event.target.closest("summary.nav-link-item");
      if (summary) {
        clearActiveState();
        summary.classList.add("active");
      }
    });
  }

  var pageLoaderEl = null;
  function ensureDashboardPageLoader() {
    if (pageLoaderEl) return pageLoaderEl;
    pageLoaderEl = document.createElement("div");
    pageLoaderEl.className = "dashboard-page-loader";
    pageLoaderEl.setAttribute("aria-hidden", "true");
    pageLoaderEl.innerHTML =
      '<div class="dashboard-page-loader-inner">' +
      '<div class="dashboard-page-loader-comets" aria-hidden="true">' +
      '<span class="dashboard-page-loader-comet dashboard-page-loader-comet-1"></span>' +
      '<span class="dashboard-page-loader-comet dashboard-page-loader-comet-2"></span>' +
      '<span class="dashboard-page-loader-comet dashboard-page-loader-comet-3"></span>' +
      "</div></div>";
    document.body.appendChild(pageLoaderEl);
    return pageLoaderEl;
  }

  function showDashboardPageLoader() {
    var loader = ensureDashboardPageLoader();
    loader.classList.add("is-visible");
    loader.setAttribute("aria-hidden", "false");
    document.body.classList.add("dashboard-page-loading");
  }

  function refreshBrandAssetsFromSettings() {
    var current = root.getAttribute("data-theme") || "dark";
    apply(current);
    applyDashboardFavicon();
  }

  function syncTopbarBreadcrumb() {
    var breadcrumb = document.querySelector(".dashboard-shell .topbar-left p");
    if (!breadcrumb) return;
    var nav = document.querySelector(".dashboard-shell .sidebar-nav");
    if (!nav) return;

    function cleanText(node) {
      return String((node && node.textContent) || "")
        .replace(/\s+/g, " ")
        .replace(/▼|▾|▸/g, "")
        .trim();
    }

    var activeChild = nav.querySelector(".nav-link-item.nav-link-sub.active");
    if (activeChild) {
      var dropdown = activeChild.closest(".nav-dropdown");
      var parentSummary = dropdown ? dropdown.querySelector(":scope > summary.nav-link-item") : null;
      var parentTitle = cleanText(parentSummary);
      var childTitle = cleanText(activeChild);
      if (parentTitle && childTitle) {
        breadcrumb.textContent = "Dashboard / " + parentTitle + " / " + childTitle;
        return;
      }
    }

    var activeTop = nav.querySelector(".nav-link-item.active:not(.nav-link-sub)");
    if (activeTop) {
      breadcrumb.textContent = "Dashboard / " + cleanText(activeTop);
      return;
    }

    var pageTitle = document.querySelector(".dashboard-shell .topbar-left h1");
    if (pageTitle) breadcrumb.textContent = "Dashboard / " + cleanText(pageTitle);
  }

  apply(readStored());
  initSidebarNavigation();
  initSidebarScrollBody();
  applyDashboardFavicon();
  syncTopbarBreadcrumb();
  initSidebarScrollPersistence();
  ensureDashboardPageLoader();
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
