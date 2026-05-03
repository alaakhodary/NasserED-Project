"use strict";

/**Site-wide behaviour: theme, loader, header search, dept nav.*/

const NasserED = (window.NasserED = window.NasserED || {});

/* =============================================================================
   1) NAV ACTIVE STATE
============================================================================= */

function setActiveNavLink() {
  const currentPath = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".dept-navbar .dept-link.active").forEach((el) => el.classList.remove("active"));
  const activeLink = Array.from(document.querySelectorAll('.dept-navbar .dept-item > a.dept-link[href]:not([href="#"])')).find((link) => (link.getAttribute("href") || "").split("/").pop().toLowerCase() === currentPath);
  if (activeLink) activeLink.classList.add("active");
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
const LOGO_LIGHT_SRC = "img/logo.webp";
const LOGO_DARK_SRC = "img/logo-dark.webp";

function updateBrandLogo(isDark) {
  const logo = document.getElementById("brandLogo");
  if (!logo) return;
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
