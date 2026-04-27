"use strict";

/* Hero slider */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildDynamicDepartmentNews() {
  const newsRow = document.querySelector('div.row.g-4.mb-5[aria-label="Department news articles"]');
  if (!newsRow) return;

  let storedNews = [];
  try {
    const raw = localStorage.getItem("dashboard-department-news");
    const parsed = raw ? JSON.parse(raw) : [];
    storedNews = Array.isArray(parsed) ? parsed : [];
  } catch {
    storedNews = [];
  }

  if (!storedNews.length) return;

  const normalizedNews = storedNews.filter(
    (item) => item && item.status === "published" && item.image && item.title && item.content && item.referenceUrl && item.createdBy && item.createdAt && item.category,
  );
  if (!normalizedNews.length) return;

  const newsCards = normalizedNews
    .map((item) => {
      const dateObj = new Date(item.createdAt);
      const formattedDate = Number.isNaN(dateObj.getTime())
        ? escapeHtml(item.createdAt)
        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const content = escapeHtml(item.content);
      return `
      <div class="col-lg-6">
        <a href="${escapeHtml(item.referenceUrl)}" role="article" class="card h-100 overflow-hidden shadow-sm border rounded-3 news-card news-card--accent-sky text-decoration-none text-reset d-block">
          <div class="row g-0 flex-column flex-md-row h-100">
            <div class="col-12 col-md-auto news-card-img flex-shrink-0 overflow-hidden position-relative p-0">
              <img src="${item.image}" class="w-100 h-100 d-block object-fit-cover news-card-img-el" alt="${escapeHtml(item.title)}" width="400" height="280" loading="lazy" decoding="async" />
            </div>
            <div class="col min-w-0 d-flex flex-column">
              <div class="card-body d-flex flex-column h-100 p-3 p-sm-4 gap-2">
                <span class="badge rounded-pill text-uppercase fw-semibold border bg-primary-subtle text-primary-emphasis border-primary-subtle news-card-category">${escapeHtml(item.category)}</span>
                <h3 class="h6 fw-semibold mb-0 news-card-title">${escapeHtml(item.title)}</h3>
                <p class="small mb-0 flex-grow-1 lh-base news-card-excerpt">${content}</p>
                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between flex-wrap gap-2 pt-2 mt-auto small border-top news-card-meta">
                  <div class="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
                    <div class="news-author-avatar rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0" aria-hidden="true">${escapeHtml(
                      item.createdBy
                        .split(" ")
                        .map((part) => part[0] || "")
                        .join("")
                        .slice(0, 2)
                        .toUpperCase(),
                    )}</div>
                    <span class="text-truncate news-card-author">${escapeHtml(item.createdBy)}</span>
                  </div>
                  <div class="d-flex align-items-center gap-1 flex-shrink-0 align-self-sm-end ms-sm-auto">
                    <i class="bi bi-calendar3" aria-hidden="true"></i>
                    <time datetime="${escapeHtml(item.createdAt)}">${formattedDate}</time>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    `;
    })
    .join("");

  newsRow.innerHTML = newsCards;
}

buildDynamicDepartmentNews();

function buildDynamicHeroSlides() {
  const sliderRoot = document.querySelector(".hero-slider");
  if (!sliderRoot) return;

  let storedSlides = [];
  try {
    const raw = localStorage.getItem("dashboard-slider-items");
    const parsed = raw ? JSON.parse(raw) : [];
    storedSlides = Array.isArray(parsed) ? parsed : [];
  } catch {
    storedSlides = [];
  }

  if (!storedSlides.length) return;

  const controls = sliderRoot.querySelector("#sliderPrev")?.outerHTML || "";
  const nextControl = sliderRoot.querySelector("#sliderNext")?.outerHTML || "";
  const normalizedSlides = storedSlides.filter(
    (slide) => slide && slide.image && slide.title && slide.subtitle && slide.description && slide.descriptionIcon && slide.buttonLabel && slide.buttonRoute,
  );
  if (!normalizedSlides.length) return;

  const slidesMarkup = normalizedSlides
    .map(
      (slide, index) => `
      <div class="slide ${index === 0 ? "active" : ""} d-flex align-items-center">
        <img class="slide-bg slide-bg-img" src="${slide.image}" alt="${escapeHtml(slide.title)}" width="1600" height="900" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" />
        <div class="slide-overlay"></div>
        <div class="slide-content container px-4 px-lg-5">
          <div class="slide-eyebrow d-inline-flex align-items-center gap-2 text-uppercase fw-bold rounded-pill mb-3"><i class="${escapeHtml(slide.descriptionIcon)}"></i> ${escapeHtml(slide.subtitle)}</div>
          <h1 class="slide-title text-white mb-3">${escapeHtml(slide.title).replaceAll("\n", "<br />")}</h1>
          <p class="slide-desc mb-4">${escapeHtml(slide.description)}</p>
          <a href="${escapeHtml(slide.buttonRoute)}" class="slide-cta"><i class="${escapeHtml(slide.descriptionIcon)}"></i> ${escapeHtml(slide.buttonLabel)}</a>
        </div>
      </div>
    `,
    )
    .join("");

  const dotsMarkup = normalizedSlides.map((_, index) => `<div class="slider-dot ${index === 0 ? "active" : ""}"></div>`).join("");

  sliderRoot.innerHTML = `
    ${slidesMarkup}
    ${controls}
    ${nextControl}
    <div class="slider-dots d-flex gap-2">${dotsMarkup}</div>
  `;
}

buildDynamicHeroSlides();

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
