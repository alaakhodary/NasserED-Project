"use strict";

/* Shared data for global search (all pages) */
const SUBCATEGORY_MAP = {
  cardiology: [
    { value: "heart-failure", label: "Heart Failure" },
    { value: "arrhythmia", label: "Arrhythmia" },
    { value: "hypertension", label: "Hypertension" },
  ],
  neurology: [
    { value: "stroke", label: "Stroke" },
    { value: "epilepsy", label: "Epilepsy" },
    { value: "migraine", label: "Migraine" },
  ],
  oncology: [
    { value: "chemotherapy", label: "Chemotherapy" },
    { value: "immunotherapy", label: "Immunotherapy" },
  ],
  diagnostics: [
    { value: "lab-tests", label: "Lab Tests" },
    { value: "imaging", label: "Imaging" },
    { value: "ecg", label: "ECG Interpretation" },
  ],
  pharmacology: [
    { value: "antibiotics", label: "Antibiotics" },
    { value: "analgesics", label: "Analgesics" },
  ],
  pediatrics: [
    { value: "neonatal", label: "Neonatal Care" },
    { value: "vaccinations", label: "Vaccinations" },
  ],
};

const CATEGORY_META = {
  cardiology: { label: "Cardiology", icon: "bi-heart-pulse" },
  neurology: { label: "Neurology", icon: "bi-brain" },
  oncology: { label: "Oncology", icon: "bi-radioactive" },
  diagnostics: { label: "Diagnostics", icon: "bi-clipboard2-pulse" },
  pharmacology: { label: "Pharmacology", icon: "bi-capsule" },
  pediatrics: { label: "Pediatrics", icon: "bi-person-hearts" },
};

const REFERENCES = [
  {
    id: "s1",
    category: "cardiology",
    sub: "heart-failure",
    title: "ACC/AHA Heart Failure Guidelines 2022",
    url: "https://www.acc.org",
    notes: "Comprehensive management of HFrEF and HFpEF.",
    timestamp: new Date("2024-01-10"),
  },
  {
    id: "s2",
    category: "cardiology",
    sub: "arrhythmia",
    title: "ESC Guidelines on Cardiac Arrhythmias",
    url: "https://www.escardio.org",
    notes: "Diagnosis and management of atrial fibrillation.",
    timestamp: new Date("2024-01-12"),
  },
  {
    id: "s3",
    category: "cardiology",
    sub: "hypertension",
    title: "JNC 8 Hypertension Guidelines",
    url: "https://jamanetwork.com",
    notes: "Evidence-based blood pressure management targets.",
    timestamp: new Date("2024-02-01"),
  },
  {
    id: "s4",
    category: "neurology",
    sub: "stroke",
    title: "AHA/ASA Acute Ischemic Stroke Guidelines",
    url: "https://www.stroke.org",
    notes: "tPA thrombolysis and thrombectomy protocols.",
    timestamp: new Date("2024-02-10"),
  },
  {
    id: "s5",
    category: "neurology",
    sub: "epilepsy",
    title: "ILAE Epilepsy Classification 2017",
    url: "https://www.ilae.org",
    notes: "Updated operational classification of seizures.",
    timestamp: new Date("2024-02-15"),
  },
  {
    id: "s6",
    category: "oncology",
    sub: "chemotherapy",
    title: "NCCN Clinical Practice Guidelines – Oncology",
    url: "https://www.nccn.org",
    notes: "Chemotherapy regimens for solid tumors.",
    timestamp: new Date("2024-03-01"),
  },
  {
    id: "s7",
    category: "diagnostics",
    sub: "lab-tests",
    title: "Harrison's Principles – Laboratory Reference Values",
    url: "",
    notes: "Normal ranges for common laboratory tests.",
    timestamp: new Date("2024-03-05"),
  },
  {
    id: "s8",
    category: "diagnostics",
    sub: "imaging",
    title: "ACR Appropriateness Criteria",
    url: "https://www.acr.org",
    notes: "Evidence-based imaging guidelines per clinical condition.",
    timestamp: new Date("2024-03-10"),
  },
  {
    id: "s9",
    category: "pharmacology",
    sub: "antibiotics",
    title: "IDSA Antibiotic Stewardship Guidelines",
    url: "https://www.idsociety.org",
    notes: "Empiric and definitive antibiotic selection strategies.",
    timestamp: new Date("2024-03-15"),
  },
  {
    id: "s10",
    category: "pharmacology",
    sub: "analgesics",
    title: "WHO Pain Ladder – Analgesic Reference",
    url: "https://www.who.int",
    notes: "3-step pain management approach by WHO.",
    timestamp: new Date("2024-03-20"),
  },
  {
    id: "s11",
    category: "pediatrics",
    sub: "neonatal",
    title: "AAP Neonatal Resuscitation Program (NRP)",
    url: "https://www.aap.org",
    notes: "Resuscitation protocols for newborns in delivery room.",
    timestamp: new Date("2024-04-01"),
  },
  {
    id: "s12",
    category: "pediatrics",
    sub: "vaccinations",
    title: "CDC Immunization Schedule 2024",
    url: "https://www.cdc.gov",
    notes: "Recommended childhood immunization schedule.",
    timestamp: new Date("2024-04-05"),
  },
];

function getAppBase() {
  const m = document.querySelector('meta[name="app-base"]');
  const v = m && m.getAttribute("content");
  return v == null ? "" : v;
}

function getSubLabel(cat, val) {
  const f = (SUBCATEGORY_MAP[cat] || []).find((s) => s.value === val);
  return f ? f.label : val;
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

/* ---- Theme (persisted in localStorage) ---- */
const THEME_STORAGE_KEY = "emnasser-theme";

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

const themeBtn = document.getElementById("themeToggleBtn");
initThemeFromStorage();
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = dark ? "light" : "dark";
    applyTheme(next);
    setStoredTheme(next);
  });
}

/* ---- Departments nav (mobile) ---- */
(function initDeptNav() {
  const nav = document.querySelector(".dept-navbar");
  const toggle = document.getElementById("deptNavToggle");
  const panel = document.getElementById("deptNavPanel");
  if (!nav || !toggle || !panel) return;

  const mqMobile = window.matchMedia("(max-width: 575.98px)");
  const toggleIcon = toggle.querySelector("i");

  function closeAllDeptSubmenus() {
    nav
      .querySelectorAll(".dept-item.is-submenu-open")
      .forEach((el) => el.classList.remove("is-submenu-open"));
    nav
      .querySelectorAll(".dd-item.is-submenu-open")
      .forEach((el) => el.classList.remove("is-submenu-open"));
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
    const subTrigger = item.querySelector(
      ":scope > a.dd-sub-link-has-children",
    );
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
  panel
    .querySelectorAll("a.dd-link:not(.dd-sub-link-has-children), a.dd-sub-link")
    .forEach((a) => {
      a.addEventListener("click", () => {
        if (!mqMobile.matches) return;
        if (a.getAttribute("href") === "#") return;
        setNavOpen(false);
        closeAllDeptSubmenus();
      });
    });
})();

const PAGE_LOADER_DELAY_MS = 220;
const pageLoader = document.getElementById("pageLoader");

function hidePageLoader() {
  if (!pageLoader) return;
  pageLoader.classList.add("page-loader-hidden");
  pageLoader.classList.remove("page-loader-fade");
  document.body.classList.remove("page-loading");
}

function showPageLoader() {
  if (!pageLoader) return;
  pageLoader.classList.remove("page-loader-hidden");
  document.body.classList.add("page-loading");
}

function isInternalPageLink(anchor) {
  if (!anchor || anchor.target === "_blank") return false;
  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("javascript:") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  )
    return false;
  if (anchor.hasAttribute("download")) return false;
  try {
    const url = new URL(href, location.href);
    return url.origin === location.origin;
  } catch {
    return false;
  }
}

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a");
  if (!anchor || !isInternalPageLink(anchor)) return;
  showPageLoader();
});

function initPageLoader() {
  if (!pageLoader) return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      window.setTimeout(hidePageLoader, PAGE_LOADER_DELAY_MS),
    );
  } else {
    window.setTimeout(hidePageLoader, PAGE_LOADER_DELAY_MS);
  }
  window.addEventListener("load", () =>
    window.setTimeout(hidePageLoader, PAGE_LOADER_DELAY_MS),
  );
}
initPageLoader();

const fy = document.getElementById("footerYear");
if (fy) fy.textContent = String(new Date().getFullYear());

/* ---- Search Input Toggle ---- */
(function initSearchToggle() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  function toggleSearch() {
    const isActive = searchInput.classList.contains("active");

    if (isActive) {
      // Hide search input
      searchInput.classList.remove("active");
      searchInput.value = "";
      searchInput.blur();
    } else {
      // Show search input
      searchInput.classList.add("active");
      searchInput.focus();
    }
  }

  function closeSearchOnClickOutside(event) {
    if (
      !searchBtn.contains(event.target) &&
      !searchInput.contains(event.target)
    ) {
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

  // Toggle search on button click
  searchBtn.addEventListener("click", toggleSearch);

  // Close search when clicking outside
  document.addEventListener("click", closeSearchOnClickOutside);

  // Close search on Escape key
  document.addEventListener("keydown", closeSearchOnEscape);

  // Prevent closing when clicking inside search input
  searchInput.addEventListener("click", (event) => {
    event.stopPropagation();
  });
})();
