/**
 * Loads shared chrome (header + footer) from partials, then runs app scripts.
 * Requires a local HTTP server (fetch() does not work from file://).
 *
 * Per page:
 * - <meta name="app-base" content="">  same folder as index, or "../" from /pages
 * - <html data-app="home">  loads app-home.js after app-core.js; omit for inner pages
 */
function getAppBase() {
  const m = document.querySelector('meta[name="app-base"]');
  const v = m && m.getAttribute("content");
  return v == null ? "" : v;
}

function applyBaseTokens(html) {
  const base = getAppBase();
  return html.replace(/\{\{BASE\}\}/g, base);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load script: " + src));
    document.body.appendChild(s);
  });
}

function setActiveNavLink() {
  const currentPath = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".dept-navbar .dept-link.active").forEach((el) => el.classList.remove("active"));
  const activeLink = document.querySelector(`.dept-navbar a.dept-link[href$="${currentPath}"]`);
  if (activeLink) activeLink.classList.add("active");
}

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

async function injectLayout() {
  const base = getAppBase();
  const headerRoot = document.getElementById("layout-header-root");
  const footerRoot = document.getElementById("layout-footer-root");
  if (!headerRoot || !footerRoot) {
    console.warn("layout-loader: missing #layout-header-root or #layout-footer-root");
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

async function start() {
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

  const base = getAppBase();
  await loadScript(base + "scripts/app-core.js");
  const app = document.documentElement.getAttribute("data-app");
  if (app === "home") await loadScript(base + "scripts/app-home.js");
  if (app === "knowledge") await loadScript(base + "scripts/app-knowledge.js");
}

start();
