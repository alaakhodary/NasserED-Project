"use strict";

/**Site-wide behaviour: theme, loader, header search, dept nav.*/

const NasserED = (window.NasserED = window.NasserED || {});

/* =============================================================================
   1) NAV ACTIVE STATE
============================================================================= */

function setActiveNavLink() {
  const currentPath = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".dept-navbar .dept-link.active").forEach((el) => el.classList.remove("active"));
  const activeLink = Array.from(document.querySelectorAll('.dept-navbar .dept-item > a.dept-link[href]:not([href="#"])')).find(
    (link) => (link.getAttribute("href") || "").split("/").pop().toLowerCase() === currentPath
  );
  if (activeLink) activeLink.classList.add("active");
}

function normalizeNursingLinks() {
  const panel = document.getElementById("deptNavPanel");
  if (!panel) return;
  const NAV_CACHE_KEY = "emnasser-dept-nav-html";

  if (panel.querySelector(".dept-item")) {
    try {
      sessionStorage.setItem(NAV_CACHE_KEY, panel.innerHTML);
    } catch {
      /* ignore sessionStorage errors */
    }
  } else {
    let cached = "";
    try {
      cached = sessionStorage.getItem(NAV_CACHE_KEY) || "";
    } catch {
      cached = "";
    }
    if (cached.trim()) panel.innerHTML = cached;
  }

  if (!panel.querySelector(".dept-item")) {
    panel.innerHTML = `
      <div class="dept-item"><a class="dept-link d-flex flex-wrap align-items-center gap-2 justify-content-start justify-content-sm-center text-start text-sm-center" href="index.html"><i class="bi bi-house-door-fill"></i> Home</a></div>
      <div class="dept-item"><a class="dept-link d-flex flex-wrap align-items-center gap-2 justify-content-start justify-content-sm-center text-start text-sm-center" href="overview.html"><i class="bi bi-grid-1x2-fill"></i> Overview</a></div>
      <div class="dept-item"><a class="dept-link d-flex flex-wrap align-items-center gap-2 justify-content-start justify-content-sm-center text-start text-sm-center" href="Senior-Staff.html"><i class="bi bi-person-badge-fill"></i> Senior Staff</a></div>
      <div class="dept-item">
        <a class="dept-link d-flex flex-wrap align-items-center gap-2 justify-content-start justify-content-sm-center text-start text-sm-center" href="#"><i class="bi bi-hospital"></i> Nursing <i class="bi bi-chevron-down dept-arrow"></i></a>
        <div class="dept-dropdown">
          <div class="dd-item"><a class="dd-link d-flex align-items-center justify-content-between gap-2" href="IPC.html">IPC</a></div>
          <div class="dd-item"><a class="dd-link d-flex align-items-center justify-content-between gap-2" href="Monitoring.html">Monitoring</a></div>
          <div class="dd-item"><a class="dd-link d-flex align-items-center justify-content-between gap-2" href="Checking-and-Stocking.html">Checking and Stocking</a></div>
          <div class="dd-item"><a class="dd-link d-flex align-items-center justify-content-between gap-2" href="Training.html">Training</a></div>
        </div>
      </div>
    `;
  }

  const map = {
    ipc: "IPC.html",
    monitoring: "Monitoring.html",
    "checking and stocking": "Checking-and-Stocking.html",
    training: "Training.html",
  };

  panel.querySelectorAll(".dd-link").forEach((link) => {
    const label = (link.textContent || "").trim().toLowerCase();
    if (map[label]) link.setAttribute("href", map[label]);
  });
}

/* =============================================================================
   2) FULL-SCREEN PAGE LOADER
============================================================================= */

function ensureGlobalPageLoader() {
  if (document.getElementById("pageLoader")) return;
  const loader = document.createElement("div");
  loader.id = "pageLoader";
  loader.className = "page-loader page-loader-hidden";
  loader.setAttribute("aria-hidden", "true");
  loader.innerHTML = `
    <div class="page-loader-inner">
      <div class="page-loader-comets" aria-hidden="true">
        <span class="page-loader-comet page-loader-comet-1"></span>
        <span class="page-loader-comet page-loader-comet-2"></span>
        <span class="page-loader-comet page-loader-comet-3"></span>
      </div>
    </div>
  `;
  document.body.appendChild(loader);
}

/* =============================================================================
   4) DARK / LIGHT THEME + BRAND LOGO
============================================================================= */

const THEME_STORAGE_KEY = "emnasser-theme";
const SITE_SETTINGS_KEY = "dashboard-site-settings-v1";
const LOGO_LIGHT_SRC = "img/logo.webp";
const LOGO_DARK_SRC = "img/logo-dark.webp";

function updateBrandLogo(isDark) {
  const logo = document.getElementById("brandLogo");
  if (!logo) return;
  const settings = readSiteSettings();
  const customLogo = (settings?.departmentLogo || "").trim();
  if (customLogo) {
    logo.src = customLogo;
    return;
  }
  logo.src = isDark ? LOGO_DARK_SRC : LOGO_LIGHT_SRC;
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* private mode / blocked storage */
  }
}

/** @param {"dark" | "light"} mode */
function applyTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "");
  const themeBtn = document.getElementById("themeToggleBtn");
  const icon = themeBtn?.querySelector("i");
  if (icon) icon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-stars";
  updateBrandLogo(isDark);
}

function initThemeFromStorage() {
  const stored = getStoredTheme();
  if (stored === "dark" || stored === "light") {
    applyTheme(stored);
    return;
  }
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  applyTheme(dark ? "dark" : "light");
}

function bindThemeToggle() {
  const themeBtn = document.getElementById("themeToggleBtn");
  if (!themeBtn) return;
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = dark ? "light" : "dark";
    applyTheme(next);
    setStoredTheme(next);
  });
}

function readSiteSettings() {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function applySiteSettings() {
  const escHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  const settings = readSiteSettings() || {};
  const siteName = (settings.webSiteName || "").trim();
  const brandDesc = (settings.descriptionBrand || "").trim();
  const logo = (settings.departmentLogo || "").trim();
  const browserLogo = (settings.browserLogo || "").trim();
  const email = (settings.contactEmail || "").trim();
  const phone = (settings.contactPhone || "").trim();
  const address = (settings.contactAddress || "").trim();
  const sponsorLabel = (settings.sponsoredLabel || "").trim();
  const sponsorUrl = (settings.sponsoredUrl || "").trim();
  const fallbackResources = [
    {
      label: (settings.resourceClinicalGuidelinesLabel || "Clinical Guidelines").trim(),
      url: (settings.resourceClinicalGuidelinesUrl || "").trim(),
    },
    {
      label: (settings.resourceDrugDatabaseLabel || "Drug Database").trim(),
      url: (settings.resourceDrugDatabaseUrl || "").trim(),
    },
    {
      label: (settings.resourceResearchLibraryLabel || "Research Library").trim(),
      url: (settings.resourceResearchLibraryUrl || "").trim(),
    },
    {
      label: (settings.resourceCaseStudiesLabel || "Case Studies").trim(),
      url: (settings.resourceCaseStudiesUrl || "").trim(),
    },
  ];
  const resources = Array.isArray(settings.resources) && settings.resources.length
    ? settings.resources
        .map((item) => ({
          label: String(item?.label || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.label || item.url)
    : fallbackResources.filter((item) => item.label || item.url);
  const fallbackSpecialties = [
    { label: "Emergency Medicine", url: "" },
    { label: "Cardiology", url: "" },
    { label: "Neurology", url: "" },
    { label: "Diagnostics", url: "" },
  ];
  const specialties = Array.isArray(settings.specialties) && settings.specialties.length
    ? settings.specialties
        .map((item) => ({
          label: String(item?.label || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.label || item.url)
    : fallbackSpecialties;

  if (siteName) {
    document.querySelectorAll(".brand-name, .footer-brand-name").forEach((el) => (el.textContent = siteName));
  }
  if (brandDesc) {
    document.querySelectorAll(".brand-sub, .footer-tagline").forEach((el) => (el.textContent = brandDesc));
  }
  if (logo) {
    document.querySelectorAll("#brandLogo").forEach((img) => (img.src = logo));
    document.querySelectorAll(".footer-brand img").forEach((img) => (img.src = logo));
  }
  let normalizedBrowserLogo = browserLogo || LOGO_LIGHT_SRC;
  if (normalizedBrowserLogo.indexOf("../../img/") === 0) {
    normalizedBrowserLogo = normalizedBrowserLogo.replace("../../", "");
  }
  if (normalizedBrowserLogo) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = normalizedBrowserLogo;
  }
  if (email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      a.href = "mailto:" + email;
      a.textContent = email;
    });
  }
  if (phone) {
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      a.href = "tel:" + phone.replace(/\s+/g, "");
      a.textContent = phone;
    });
  }
  if (address) {
    const addressIcon = document.querySelector(".footer-contact .bi-geo-alt-fill");
    if (addressIcon && addressIcon.parentElement) {
      const li = addressIcon.parentElement;
      li.innerHTML = `<i class="bi bi-geo-alt-fill flex-shrink-0" aria-hidden="true"></i> ${address}`;
    }
  }
  if (sponsorLabel) {
    const sponsor = document.querySelector(".footer-sponsor a");
    if (sponsor) sponsor.textContent = sponsorLabel;
  }
  if (sponsorUrl) {
    const sponsor = document.querySelector(".footer-sponsor a");
    if (sponsor) sponsor.href = sponsorUrl;
  }
  if (Array.isArray(settings.socials)) {
    const wrap = document.querySelector(".footer-social");
    if (wrap && settings.socials.length) {
      wrap.innerHTML = settings.socials
        .map((s) => `<a href="${s.url}" aria-label="${s.name}" target="_blank" rel="noopener noreferrer" class="social-btn d-inline-flex align-items-center justify-content-center rounded-3"><i class="${s.icon}"></i></a>`)
        .join("");
    }
  }

  const resourcesHeading = Array.from(document.querySelectorAll(".footer-links .footer-heading")).find(
    (el) => (el.textContent || "").trim().toLowerCase() === "resources",
  );
  const resourcesList = resourcesHeading ? resourcesHeading.parentElement?.querySelector("ul") : null;
  if (resourcesList && resources.length) {
    resourcesList.innerHTML = resources
      .map((item) => {
        const label = escHtml(item.label || item.url || "Resource");
        const href = escHtml(item.url || "#");
        const openInNewTab = item.url ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<li><a href="${href}"${openInNewTab}>${label}</a></li>`;
      })
      .join("");
  }

  const specialtiesHeading = Array.from(document.querySelectorAll(".footer-links .footer-heading")).find(
    (el) => (el.textContent || "").trim().toLowerCase() === "specialties",
  );
  const specialtiesList = specialtiesHeading ? specialtiesHeading.parentElement?.querySelector("ul") : null;
  if (specialtiesList && specialties.length) {
    specialtiesList.innerHTML = specialties
      .map((item) => {
        const label = escHtml(item.label || item.url || "Specialty");
        const href = escHtml(item.url || "#");
        return `<li><a href="${href}">${label}</a></li>`;
      })
      .join("");
  }

  document.querySelectorAll(".footer-bottom-links a").forEach((a) => {
    const text = (a.textContent || "").trim().toLowerCase();
    if (text === "privacy policy") a.setAttribute("href", "Privacy-Policy.html");
    if (text === "terms of use") a.setAttribute("href", "Terms-of-Use.html");
    if (text === "disclaimer") a.setAttribute("href", "Disclaimer.html");
  });
}

function bindSiteSettingsSync() {
  window.addEventListener("storage", (event) => {
    if (event.key !== SITE_SETTINGS_KEY) return;
    applySiteSettings();
  });
  window.addEventListener("dashboard-site-settings-updated", () => {
    applySiteSettings();
  });
}

/* =============================================================================
   4) HEADER SEARCH — INPUT TOGGLE + EXTERNAL TRIGGERS
============================================================================= */

function initSearchToggle() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  if (!searchBtn || !searchInput) return;

  function toggleSearch() {
    const isActive = searchInput.classList.contains("active");
    if (isActive) {
      searchInput.classList.remove("active");
      searchInput.value = "";
      searchInput.blur();
    } else {
      searchInput.classList.add("active");
      searchInput.focus();
    }
  }

  function closeSearchOnClickOutside(event) {
    if (!searchBtn.contains(event.target) && !searchInput.contains(event.target)) {
      searchInput.classList.remove("active");
      searchInput.value = "";
    }
  }

  function closeSearchOnEscape(event) {
    if (event.key === "Escape") {
      searchInput.classList.remove("active");
      searchInput.value = "";
      searchInput.blur();
    }
  }

  searchBtn.addEventListener("click", toggleSearch);
  document.addEventListener("click", closeSearchOnClickOutside);
  document.addEventListener("keydown", closeSearchOnEscape);
  searchInput.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

function bindOpenHeaderSearchTriggers() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".js-open-header-search");
    if (!trigger) return;
    event.preventDefault();
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) searchBtn.click();
  });
}

/* =============================================================================
   5) DEPARTMENTS NAV — MOBILE MENU & SUBMENUS
============================================================================= */

function initDeptNav() {
  const nav = document.querySelector(".dept-navbar");
  const toggle = document.getElementById("deptNavToggle");
  const panel = document.getElementById("deptNavPanel");
  if (!nav || !toggle || !panel) return;

  const mqMobile = window.matchMedia("(max-width: 575.98px)");
  const toggleIcon = toggle.querySelector("i");

  function closeAllDeptSubmenus() {
    nav.querySelectorAll(".dept-item.is-submenu-open").forEach((el) => el.classList.remove("is-submenu-open"));
    nav.querySelectorAll(".dd-item.is-submenu-open").forEach((el) => el.classList.remove("is-submenu-open"));
  }

  function setNavOpen(open) {
    nav.classList.toggle("dept-nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (toggleIcon) toggleIcon.className = open ? "bi bi-x-lg" : "bi bi-list";
  }

  toggle.addEventListener("click", () => {
    if (!mqMobile.matches) return;
    setNavOpen(!nav.classList.contains("dept-nav-open"));
  });

  nav.querySelectorAll(".dept-item").forEach((item) => {
    const link = item.querySelector(":scope > a.dept-link");
    const dropdown = item.querySelector(":scope > .dept-dropdown");
    if (!link || !dropdown) return;
    link.addEventListener("click", (e) => {
      if (!mqMobile.matches) return;
      e.preventDefault();
      const opening = !item.classList.contains("is-submenu-open");
      closeAllDeptSubmenus();
      if (opening) item.classList.add("is-submenu-open");
    });
  });

  nav.querySelectorAll(".dd-item").forEach((item) => {
    const sub = item.querySelector(":scope > .dept-subdropdown");
    const subTrigger = item.querySelector(":scope > a.dd-sub-link-has-children");
    if (!sub || !subTrigger) return;
    subTrigger.addEventListener("click", (e) => {
      if (!mqMobile.matches) return;
      e.preventDefault();
      item.classList.toggle("is-submenu-open");
    });
  });

  mqMobile.addEventListener("change", () => {
    if (!mqMobile.matches) {
      setNavOpen(false);
      closeAllDeptSubmenus();
    }
  });

  panel.querySelectorAll("a.dept-link").forEach((a) => {
    a.addEventListener("click", () => {
      if (!mqMobile.matches) return;
      const item = a.closest(".dept-item");
      if (item && item.querySelector(":scope > .dept-dropdown")) return;
      setNavOpen(false);
      closeAllDeptSubmenus();
    });
  });
  panel.querySelectorAll("a.dd-link:not(.dd-sub-link-has-children), a.dd-sub-link").forEach((a) => {
    a.addEventListener("click", () => {
      if (!mqMobile.matches) return;
      if (a.getAttribute("href") === "#") return;
      setNavOpen(false);
      closeAllDeptSubmenus();
    });
  });
}

/* =============================================================================
   6) PAGE LOADER — HIDE AFTER LOAD & SHOW ON INTERNAL NAVIGATION
============================================================================= */

function isInternalPageLink(anchor) {
  if (!anchor || anchor.target === "_blank") return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (anchor.hasAttribute("download")) return false;
  try {
    const url = new URL(href, location.href);
    return url.origin === location.origin;
  } catch {
    return false;
  }
}

function showPageLoader() {
  const pageLoader = document.getElementById("pageLoader");
  if (!pageLoader) return;
  pageLoader.classList.remove("page-loader-hidden");
  pageLoader.setAttribute("aria-hidden", "false");
  document.body.classList.add("page-loading");
}

function hidePageLoader() {
  const pageLoader = document.getElementById("pageLoader");
  if (!pageLoader) return;
  pageLoader.classList.add("page-loader-hidden");
  pageLoader.classList.remove("page-loader-fade");
  pageLoader.setAttribute("aria-hidden", "true");
  document.body.classList.remove("page-loading");
}

// Smoothly scrolls to top before navigating to the next internal page.
function smoothScrollTopThenNavigate(anchor) {
  const href = anchor.getAttribute("href");
  if (!href) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startY = window.scrollY || window.pageYOffset || 0;
  const alreadyNearTop = startY < 24;

  // Skip animation when motion should be reduced or page is already near top.
  if (prefersReducedMotion || alreadyNearTop) {
    window.location.href = anchor.href;
    return;
  }

  const durationMs = Math.min(650, Math.max(250, Math.round(startY * 0.35)));
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => {
    window.location.href = anchor.href;
  }, durationMs);
}

function initPageLoader() {
  const pageLoader = document.getElementById("pageLoader");
  if (!pageLoader) return;

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
    if (!anchor || !isInternalPageLink(anchor)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showPageLoader();
    smoothScrollTopThenNavigate(anchor);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hidePageLoader);
  } else {
    hidePageLoader();
  }
  window.addEventListener("load", hidePageLoader);
}

/* =============================================================================
   7) INIT SHARED UI BEHAVIOUR
============================================================================= */

function initChromeAfterLayout() {
  normalizeNursingLinks();
  applySiteSettings();
  bindSiteSettingsSync();
  setActiveNavLink();
  initThemeFromStorage();
  bindThemeToggle();
  initDeptNav();
  initPageLoader();
  initSearchToggle();
  bindOpenHeaderSearchTriggers();
}

/* =============================================================================
   8) ENTRY — callable manually if needed
============================================================================= */

NasserED.startLayout = function startLayout() {
  if (NasserED.__layoutStarted) return;
  NasserED.__layoutStarted = true;
  ensureGlobalPageLoader();
  initChromeAfterLayout();
};

// Allow direct usage via <script src="scripts/global.js"></script>
// when loaded directly from HTML pages.
NasserED.startLayout();
