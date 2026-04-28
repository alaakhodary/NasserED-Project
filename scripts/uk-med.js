(function () {
  const ukMedTitleImage = document.getElementById("ukMedTitleImage");
  if (!ukMedTitleImage) return;

  const syncUkMedImage = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    ukMedTitleImage.src = isDark ? ukMedTitleImage.dataset.darkSrc : ukMedTitleImage.dataset.lightSrc;
  };

  syncUkMedImage();
  new MutationObserver(syncUkMedImage).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Dynamic content from dashboard (localStorage)
  const heroKey = "dashboard-pages-ukmed-hero";
  const storyKey = "dashboard-pages-ukmed-story-html";
  const activitiesKey = "dashboard-pages-ukmed-activities-html";
  const featuresKey = "dashboard-pages-ukmed-features";
  const urlKey = "dashboard-pages-ukmed-url";

  const richContainer = document.getElementById("ukMedRichContent");
  const activitiesBody = document.getElementById("ukMedActivitiesBody");
  const heroIcon = document.getElementById("ukMedHeroIcon");
  const heroSubtitle = document.getElementById("ukMedHeroSubtitle");
  const heroTitleText = document.getElementById("ukMedHeroTitleText");
  const titleImage = document.getElementById("ukMedTitleImage");
  const featuresContainer = document.getElementById("ukMedFeatures");
  const externalLink = document.getElementById("ukMedExternalLink");

  function readString(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw && raw.trim() ? raw : null;
    } catch {
      return null;
    }
  }

  function readJson(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const richHtml = readString(storyKey);
  if (richContainer && richHtml) {
    richContainer.innerHTML = richHtml;
  }

  const activitiesHtml = readString(activitiesKey);
  if (activitiesBody && activitiesHtml) {
    activitiesBody.innerHTML = activitiesHtml;
  }

  const hero = readJson(heroKey);
  if (hero && typeof hero === "object") {
    const icon = typeof hero.icon === "string" && hero.icon.trim() ? hero.icon.trim() : null;
    const title = typeof hero.title === "string" && hero.title.trim() ? hero.title.trim() : null;
    const subtitle = typeof hero.subtitle === "string" && hero.subtitle.trim() ? hero.subtitle.trim() : null;
    if (heroIcon && icon) heroIcon.className = icon;
    if (heroSubtitle && subtitle) heroSubtitle.textContent = subtitle;
    if (heroTitleText && titleImage && title) {
      heroTitleText.textContent = title;
      heroTitleText.classList.remove("d-none");
      titleImage.classList.add("d-none");
    }
  }

  const features = readJson(featuresKey);
  if (featuresContainer && Array.isArray(features) && features.length) {
    const normalized = features
      .filter((c) => c && typeof c.icon === "string" && typeof c.title === "string" && typeof c.subtitle === "string")
      .map((c) => ({ icon: c.icon.trim(), title: c.title.trim(), subtitle: c.subtitle.trim() }))
      .filter((c) => c.icon && c.title && c.subtitle);
    if (normalized.length) {
      featuresContainer.innerHTML = normalized
        .map(
          (c) => `
          <div class="col">
            <div class="feature-card h-100 border rounded-4 p-4 p-md-3">
              <div class="feature-icon mb-3">
                <i class="${c.icon} fs-1"></i>
              </div>
              <h3 class="h5 mb-2">${c.title}</h3>
              <p class="mb-0">${c.subtitle}</p>
            </div>
          </div>
        `,
        )
        .join("");
    }
  }

  const url = readString(urlKey);
  if (externalLink && url) {
    externalLink.href = url;
  }
})();
