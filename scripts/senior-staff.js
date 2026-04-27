"use strict";

(function () {
  const storageKey = "dashboard-senior-staff";
  const impactStorageKey = "dashboard-impact";
  const heroTitle = document.querySelector(".senior-staff-hero h1");
  const heroSubtitle = document.querySelector(".senior-staff-hero p");
  const staffGrid = document.querySelector(".staff-grid");
  const impactTitle = document.querySelector(".staff-stats h2");
  const impactSubtitle = document.querySelector(".staff-stats .text-muted-custom");
  const impactGrid = document.querySelector(".staff-stats .stats-grid");
  if (!heroTitle || !heroSubtitle || !staffGrid) return;

  let state = null;
  try {
    const raw = localStorage.getItem(storageKey);
    state = raw ? JSON.parse(raw) : null;
  } catch {
    state = null;
  }
  if (!state) return;

  if (typeof state.title === "string" && state.title.trim()) {
    heroTitle.textContent = state.title.trim();
  }
  if (typeof state.subtitle === "string" && state.subtitle.trim()) {
    heroSubtitle.textContent = state.subtitle.trim();
  }

  if (Array.isArray(state.cards) && state.cards.length) {
    const cardsMarkup = state.cards
      .filter((card) => card && card.image && card.name && card.role && card.bio)
      .map(
        (card) => `
      <div class="staff-card">
        <div class="staff-image-container">
          <img src="${card.image}" alt="${card.name}" class="staff-image" width="1200" height="800" loading="lazy" decoding="async" />
          <div class="staff-overlay"></div>
        </div>
        <div class="staff-content">
          <h2 class="staff-name">${card.name}</h2>
          <div class="staff-role">${card.role}</div>
          <p class="staff-bio">${card.bio}</p>
        </div>
      </div>
    `,
      )
      .join("");

    if (cardsMarkup) {
      staffGrid.innerHTML = cardsMarkup;
    }
  }

  let impactState = null;
  try {
    const rawImpact = localStorage.getItem(impactStorageKey);
    impactState = rawImpact ? JSON.parse(rawImpact) : null;
  } catch {
    impactState = null;
  }
  const effectiveImpactTitle = impactState?.impactTitle || state?.impactTitle;
  const effectiveImpactSubtitle = impactState?.impactSubtitle || state?.impactSubtitle;
  const effectiveImpactCards = Array.isArray(impactState?.impactCards) ? impactState.impactCards : state?.impactCards;

  if (impactTitle && typeof effectiveImpactTitle === "string" && effectiveImpactTitle.trim()) {
    impactTitle.textContent = effectiveImpactTitle.trim();
  }
  if (impactSubtitle && typeof effectiveImpactSubtitle === "string" && effectiveImpactSubtitle.trim()) {
    impactSubtitle.textContent = effectiveImpactSubtitle.trim();
  }
  if (impactGrid && Array.isArray(effectiveImpactCards) && effectiveImpactCards.length) {
    const impactMarkup = effectiveImpactCards
      .filter((card) => card && card.label && Number.isFinite(Number(card.number)))
      .map(
        (card) => `
      <div class="stat-item">
        <div class="stat-number"><span class="js-stat-counter" data-target="${Number(card.number)}" data-suffix="">0</span></div>
        <div class="stat-label">${card.label}</div>
      </div>
    `,
      )
      .join("");
    if (impactMarkup) {
      impactGrid.innerHTML = impactMarkup;
    }
  }
})();
