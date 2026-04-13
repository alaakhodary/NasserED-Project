"use strict";

const PER_PAGE = 6;
const state = { cat: "all", page: 1 };

function initCategoryFromUrl() {
  const params = new URLSearchParams(location.search);
  const candidate = (
    params.get("cat") ||
    location.hash.slice(1) ||
    ""
  ).toLowerCase();
  if (candidate && SUBCATEGORY_MAP[candidate]) {
    state.cat = candidate;
  }
}

function filteredRefs() {
  return REFERENCES.filter((r) => {
    const matchCat = state.cat === "all" || r.category === state.cat;
    return matchCat;
  });
}

function formatDate(d) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function renderCards() {
  const grid = document.getElementById("cardsGrid");
  if (!grid) return;

  const refs = filteredRefs();
  const total = refs.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * PER_PAGE;
  const slice = refs.slice(start, start + PER_PAGE);

  if (slice.length === 0) {
    grid.innerHTML = `<div class="empty-state"><i class="bi bi-journal-x"></i><p>No references available for this category.</p></div>`;
    const pw = document.getElementById("paginationWrap");
    if (pw) pw.innerHTML = "";
    return;
  }

  grid.innerHTML = slice
    .map((r) => {
      const catMeta = CATEGORY_META[r.category] || { label: r.category };
      return `<div class="ref-card" data-id="${r.id}" role="button" tabindex="0" aria-label="Open ${esc(r.title)}">
      <div class="card-badges">
        <span class="badge-cat">${esc(catMeta.label)}</span>
        <span class="badge-sub">${esc(getSubLabel(r.category, r.sub))}</span>
      </div>
      <div class="card-title">${esc(r.title)}</div>
      ${r.notes ? `<div class="card-notes">${esc(r.notes)}</div>` : ""}
      <div class="card-footer">
        <span class="card-date"><i class="bi bi-calendar3"></i> ${formatDate(r.timestamp)}</span>
        <span class="card-open-btn"><i class="bi bi-eye"></i> View</span>
      </div>
    </div>`;
    })
    .join("");

  grid.querySelectorAll(".ref-card").forEach((card) => {
    const open = () => openDetail(card.dataset.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") open();
    });
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const wrap = document.getElementById("paginationWrap");
  if (!wrap) return;
  if (totalPages <= 1) {
    wrap.innerHTML = "";
    return;
  }
  let html = `<button class="pg-btn" id="pgPrev" ${state.page === 1 ? "disabled" : ""} aria-label="Previous page"><i class="bi bi-chevron-left"></i></button>`;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - state.page) <= 1)
      pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  pages.forEach((p) => {
    if (p === "...") html += `<span class="pg-ellipsis">…</span>`;
    else
      html += `<button class="pg-btn${p === state.page ? " active" : ""}" data-pg="${p}" aria-label="Page ${p}" ${p === state.page ? 'aria-current="page"' : ""}>${p}</button>`;
  });
  html += `<button class="pg-btn" id="pgNext" ${state.page === totalPages ? "disabled" : ""} aria-label="Next page"><i class="bi bi-chevron-right"></i></button>`;
  wrap.innerHTML = html;
  wrap.querySelector("#pgPrev")?.addEventListener("click", () => {
    state.page--;
    renderCards();
    scrollToGrid();
  });
  wrap.querySelector("#pgNext")?.addEventListener("click", () => {
    state.page++;
    renderCards();
    scrollToGrid();
  });
  wrap.querySelectorAll("[data-pg]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.page = +btn.dataset.pg;
      renderCards();
      scrollToGrid();
    });
  });
}

function scrollToGrid() {
  document
    .getElementById("cardsGrid")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openDetail(id) {
  const ref = REFERENCES.find((r) => r.id === id);
  if (!ref) return;
  const catMeta = CATEGORY_META[ref.category] || { label: ref.category };
  const subLabel = getSubLabel(ref.category, ref.sub);
  document.getElementById("dCat").textContent = catMeta.label;
  document.getElementById("dSub").textContent = subLabel;
  document.getElementById("dTitle").textContent = ref.title;
  document.getElementById("dCategory").textContent = catMeta.label;
  document.getElementById("dSubLabel").textContent = subLabel;
  document.getElementById("dDate").textContent = formatDate(ref.timestamp);
  document.getElementById("bcSection").textContent =
    ref.title.length > 40 ? ref.title.slice(0, 40) + "…" : ref.title;
  const notesWrap = document.getElementById("dNotesWrap");
  if (ref.notes) {
    document.getElementById("dNotes").textContent = ref.notes;
    notesWrap.style.display = "block";
  } else {
    notesWrap.style.display = "none";
  }
  const linkWrap = document.getElementById("dLinkWrap");
  if (ref.url) {
    document.getElementById("dUrl").innerHTML =
      `<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.url)}</a>`;
    document.getElementById("dOpenLink").href = ref.url;
    linkWrap.style.display = "block";
  } else {
    linkWrap.style.display = "none";
  }
  document.getElementById("page-list").classList.add("hidden");
  document.getElementById("page-detail").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.__openReferenceDetail = openDetail;

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    document.getElementById("page-detail").classList.remove("active");
    document.getElementById("page-list").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

initCategoryFromUrl();
renderCards();

const refParam = new URLSearchParams(location.search).get("ref");
if (refParam) openDetail(refParam);
