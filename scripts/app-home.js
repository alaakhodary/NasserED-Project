"use strict";

const PER_PAGE = 6;
const state = { cat: "all", sub: "all", page: 1 };

function initCategoryFromUrl() {
  const params = new URLSearchParams(location.search);
  const candidate = (
    params.get("cat") ||
    location.hash.slice(1) ||
    ""
  ).toLowerCase();
  if (candidate && SUBCATEGORY_MAP[candidate]) {
    state.cat = candidate;
    state.sub = "all";
  }
}

function syncCategoryPills() {
  const catRow = document.getElementById("catRow");
  if (!catRow) return;
  catRow.querySelectorAll(".pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.cat === state.cat);
  });
}

const NEWS_ITEMS = [
  {
    id: "n1",
    category: "Emergency",
    title: "New Mass Casualty Protocol Implemented Across All Emergency Units",
    excerpt:
      "The Emergency Department has adopted an updated mass casualty protocol to improve response time and coordination during large-scale incidents.",
    author: "Dr. Ahmad Nassar",
    authorInitials: "AN",
    date: "Apr 8, 2026",
    image:
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80",
    color: "#ef4444",
  },
  {
    id: "n2",
    category: "Training",
    title: "Advanced Trauma Life Support (ATLS) Workshop – Registration Open",
    excerpt:
      "The department is hosting a 2-day ATLS certification workshop for all emergency physicians and nurses. Limited seats available.",
    author: "Nursing Education Dept.",
    authorInitials: "NE",
    date: "Apr 6, 2026",
    image:
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80",
    color: "#0ea5c9",
  },
  {
    id: "n3",
    category: "Guidelines",
    title: "Updated Sepsis Management Pathway – Effective Immediately",
    excerpt:
      "Following the latest international guidelines, the sepsis screening and management bundle has been revised with a new 1-hour treatment target.",
    author: "Dr. Sara Al-Khalil",
    authorInitials: "SK",
    date: "Apr 3, 2026",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    color: "#14b8a6",
  },
  {
    id: "n4",
    category: "Equipment",
    title:
      "New Point-of-Care Ultrasound Machines Now Available in Resuscitation Bay",
    excerpt:
      "Three new portable ultrasound units have been installed in the resus bay, providing real-time imaging capabilities for critical patients.",
    author: "Equipment Management",
    authorInitials: "EM",
    date: "Mar 28, 2026",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
    color: "#8b5cf6",
  },
];

function formatDate(d) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function filteredRefs() {
  return REFERENCES.filter((r) => {
    const matchCat = state.cat === "all" || r.category === state.cat;
    const matchSub = state.sub === "all" || r.sub === state.sub;
    return matchCat && matchSub;
  });
}

function renderNews() {
  const grid = document.getElementById("newsGrid");
  if (!grid) return;
  grid.innerHTML = NEWS_ITEMS.map(
    (n) => `
    <div class="news-card">
      <div class="news-card-img" style="background: linear-gradient(135deg, ${n.color}22, ${n.color}44);">
        <img src="${n.image}" alt="${n.category} news" loading="lazy" />
      </div>
      <div class="news-card-body">
        <span class="news-category-badge" style="background:${n.color}18; color:${n.color}; border-color:${n.color}33;">${esc(n.category)}</span>
        <div class="news-card-title">${esc(n.title)}</div>
        <div class="news-card-excerpt">${esc(n.excerpt)}</div>
        <div class="news-card-meta">
          <div class="news-author">
            <div class="news-author-avatar" style="background: linear-gradient(135deg, ${n.color}, #0ea5c9);">${esc(n.authorInitials)}</div>
            <span>${esc(n.author)}</span>
          </div>
          <div class="news-date"><i class="bi bi-calendar3"></i> ${esc(n.date)}</div>
        </div>
      </div>
    </div>
  `,
  ).join("");
}

function renderCards() {
  const grid = document.getElementById("cardsGrid");
  const resultsInfo = document.getElementById("resultsInfo");
  if (!grid || !resultsInfo) return;

  const refs = filteredRefs();
  const total = refs.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * PER_PAGE;
  const slice = refs.slice(start, start + PER_PAGE);

  resultsInfo.innerHTML = `<strong>${total}</strong> reference${total !== 1 ? "s" : ""}`;

  if (slice.length === 0) {
    grid.innerHTML = `<div class="empty-state"><i class="bi bi-journal-x"></i><p>No references found. Try a different search or filter.</p></div>`;
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

const catRow = document.getElementById("catRow");
if (catRow) {
  catRow.addEventListener("click", (e) => {
    const pill = e.target.closest("[data-cat]");
    if (!pill) return;
    document
      .querySelectorAll("#catRow .pill")
      .forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    state.cat = pill.dataset.cat;
    state.sub = "all";
    state.page = 1;
    renderSubPills();
    renderCards();
  });
}

function renderSubPills() {
  const subRow = document.getElementById("subRow");
  const subPills = document.getElementById("subPills");
  if (!subRow || !subPills) return;
  if (state.cat === "all" || !SUBCATEGORY_MAP[state.cat]) {
    subRow.style.display = "none";
    return;
  }
  const subs = SUBCATEGORY_MAP[state.cat];
  subPills.innerHTML =
    `<button class="pill sub active" data-sub="all">All</button>` +
    subs
      .map(
        (s) =>
          `<button class="pill sub" data-sub="${s.value}">${s.label}</button>`,
      )
      .join("");
  subRow.style.display = "flex";
  subPills.querySelectorAll("[data-sub]").forEach((btn) => {
    btn.addEventListener("click", () => {
      subPills
        .querySelectorAll("[data-sub]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.sub = btn.dataset.sub;
      state.page = 1;
      renderCards();
    });
  });
}

/* Hero slider */
const sliderPrev = document.getElementById("sliderPrev");
if (sliderPrev) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dot");
  let current = 0;
  let sliderTimer;

  function goToSlide(n) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function startAutoplay() {
    sliderTimer = setInterval(() => goToSlide(current + 1), 5000);
  }
  function resetAutoplay() {
    clearInterval(sliderTimer);
    startAutoplay();
  }

  document.getElementById("sliderPrev").addEventListener("click", () => {
    goToSlide(current - 1);
    resetAutoplay();
  });
  document.getElementById("sliderNext").addEventListener("click", () => {
    goToSlide(current + 1);
    resetAutoplay();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      goToSlide(i);
      resetAutoplay();
    }),
  );

  startAutoplay();
}

initCategoryFromUrl();
renderNews();
renderSubPills();
syncCategoryPills();
renderCards();

const refParam = new URLSearchParams(location.search).get("ref");
if (refParam) openDetail(refParam);
