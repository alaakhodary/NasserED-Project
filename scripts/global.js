"use strict";

/**Site-wide behaviour: layout injection, theme, loader, header search, dept nav.*/

const NasserED = (window.NasserED = window.NasserED || {});

/* =============================================================================
   1) BASE PATH & DYNAMIC SCRIPT LOADING
============================================================================= */

function getAppBase() {
  const m = document.querySelector('meta[name="app-base"]');
  const v = m && m.getAttribute("content");
  return v == null ? "" : v;
}

/* =============================================================================
   2) HEADER & FOOTER INJECTION (partials)
============================================================================= */

function applyBaseTokens(html) {
  const base = getAppBase();
  return html.replace(/\{\{BASE\}\}/g, base);
}

function setActiveNavLink() {
  const currentPath = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".dept-navbar .dept-link.active").forEach((el) => el.classList.remove("active"));
  const activeLink = document.querySelector(`.dept-navbar a.dept-link[href$="${currentPath}"]`);
  if (activeLink) activeLink.classList.add("active");
}

async function injectLayout() {
  const base = getAppBase();
  const headerRoot = document.getElementById("layout-header-root");
  const footerRoot = document.getElementById("layout-footer-root");
  if (!headerRoot || !footerRoot) {
    console.warn("global: missing #layout-header-root or #layout-footer-root");
    return;
  }

  const [headerHtml, footerHtml] = await Promise.all([
    fetch(base + "partials/header.html").then((r) => {
      if (!r.ok) throw new Error("partials/header.html");
      return r.text();
    }),
    fetch(base + "partials/footer.html").then((r) => {
      if (!r.ok) throw new Error("partials/footer.html");
      return r.text();
    }),
  ]);

  headerRoot.innerHTML = applyBaseTokens(headerHtml);
  footerRoot.innerHTML = applyBaseTokens(footerHtml);
  setActiveNavLink();
}

/* =============================================================================
   3) FULL-SCREEN PAGE LOADER (DOM NODE — created before fetch)
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
const LOGO_LIGHT_SRC = "img/logo.png";
const LOGO_DARK_SRC = "img/logo-dark.png";

function updateBrandLogo(isDark) {
  const logo = document.getElementById("brandLogo");
  if (!logo) return;
  const base = getAppBase();
  logo.src = (base || "") + (isDark ? LOGO_DARK_SRC : LOGO_LIGHT_SRC);
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
   5) HEADER SEARCH — INPUT TOGGLE + EXTERNAL TRIGGERS
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
   6) DEPARTMENTS NAV — MOBILE MENU & SUBMENUS
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
   7) PAGE LOADER — HIDE AFTER LOAD & SHOW ON INTERNAL NAVIGATION
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

function initPageLoader() {
  const pageLoader = document.getElementById("pageLoader");
  if (!pageLoader) return;

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
    if (!anchor || !isInternalPageLink(anchor)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    showPageLoader();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hidePageLoader);
  } else {
    hidePageLoader();
  }
  window.addEventListener("load", hidePageLoader);
}

/* =============================================================================
   8) AFTER LAYOUT: WIRE ALL CHROME (order matters)
============================================================================= */

function initChromeAfterLayout() {
  initThemeFromStorage();
  bindThemeToggle();
  initDeptNav();
  initPageLoader();
  initSearchToggle();
  bindOpenHeaderSearchTriggers();
}

/* =============================================================================
   9) ENTRY — callable manually if needed
============================================================================= */

NasserED.startLayout = async function startLayout() {
  if (NasserED.__layoutStarted) return;
  NasserED.__layoutStarted = true;
  ensureGlobalPageLoader();
  try {
    await injectLayout();
  } catch (e) {
    console.error(e);
    const root = document.getElementById("layout-header-root");
    if (root) {
      const p = document.createElement("p");
      p.style.cssText = "padding:12px 16px;background:#7f1d1d;color:#fff;font-size:14px;margin:0;";
      p.textContent = "تعذّر تحميل الهيدر/الفوتر. شغّل الموقع عبر خادم محلي (مثل Live Server) وليس بفتح الملف مباشرة من القرص.";
      root.appendChild(p);
    }
    return;
  }

  initChromeAfterLayout();

  // Global script stops here; page-specific scripts load from each page HTML.
};

// Allow direct usage via <script src="scripts/global.js"></script>
// when loaded directly from HTML pages.
NasserED.startLayout();
