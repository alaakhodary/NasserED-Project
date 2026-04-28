"use strict";

(function () {
  const heroKey = "dashboard-pages-ukmed-hero";
  const storyKey = "dashboard-pages-ukmed-story-html";
  const activitiesKey = "dashboard-pages-ukmed-activities-html";
  const featuresKey = "dashboard-pages-ukmed-features";
  const urlKey = "dashboard-pages-ukmed-url";

  const saveBtn = document.getElementById("ukMedSaveBtn");
  const resetBtn = document.getElementById("ukMedResetBtn");

  const heroIconInput = document.getElementById("ukMedHeroIcon");
  const heroTitleInput = document.getElementById("ukMedHeroTitle");
  const heroSubtitleInput = document.getElementById("ukMedHeroSubtitle");
  const urlInput = document.getElementById("ukMedUrl");

  const heroPreview = document.getElementById("ukMedHeroPreview");
  const urlPreview = document.getElementById("ukMedUrlPreview");
  const richTarget = document.getElementById("ukMedRichTarget");

  const addFeatureBtn = document.getElementById("ukMedAddFeatureBtn");
  const clearFeaturesBtn = document.getElementById("ukMedClearFeaturesBtn");
  const featuresTableWrap = document.getElementById("ukMedFeaturesTableWrap");
  const featuresPreview = document.getElementById("ukMedFeaturesPreview");
  const featureModalEl = document.getElementById("ukMedFeatureModal");
  const featureModalLabel = document.getElementById("ukMedFeatureModalLabel");
  const featureForm = document.getElementById("ukMedFeatureForm");
  const featureIconInput = document.getElementById("ukMedFeatureIcon");
  const featureTitleInput = document.getElementById("ukMedFeatureTitle");
  const featureSubtitleInput = document.getElementById("ukMedFeatureSubtitle");
  const featureSubmitBtn = document.getElementById("ukMedFeatureSubmitBtn");
  const featureModal = featureModalEl && window.bootstrap ? new window.bootstrap.Modal(featureModalEl) : null;

  if (
    !saveBtn ||
    !resetBtn ||
    !heroIconInput ||
    !heroTitleInput ||
    !heroSubtitleInput ||
    !urlInput ||
    !heroPreview ||
    !urlPreview ||
    !addFeatureBtn ||
    !clearFeaturesBtn ||
    !featuresTableWrap ||
    !featuresPreview ||
    !featureModalLabel ||
    !featureForm ||
    !featureIconInput ||
    !featureTitleInput ||
    !featureSubtitleInput ||
    !featureSubmitBtn ||
    !featureModal ||
    !richTarget ||
    !window.tinymce
  )
    return;

  const defaultHtml = [
    "<h2>UK-MED at Nasser Medical Complex</h2>",
    "<p>Edit this section to control the main UK-MED page story.</p>",
  ].join("");

  const defaultHero = {
    icon: "bi bi-shield-check",
    title: "UK-MED",
    subtitle: "Medical Excellence Partner",
  };

  const defaultFeatures = [
    { icon: "bi bi-book-half", title: "Medical Education", subtitle: "Comprehensive training programs for healthcare professionals." },
    { icon: "bi bi-heart-pulse", title: "Patient Care", subtitle: "Advanced solutions for improved patient outcomes." },
    { icon: "bi bi-graph-up", title: "Innovation", subtitle: "Cutting-edge technology and research in healthcare." },
  ];

  const defaultUrl = "https://www.uk-med.org/";

  function readString(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      const v = raw && raw.trim() ? raw : "";
      return v || fallback;
    } catch {
      return fallback;
    }
  }

  function readHero() {
    try {
      const raw = localStorage.getItem(heroKey);
      if (!raw) return defaultHero;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaultHero;
      return {
        icon: typeof parsed.icon === "string" && parsed.icon.trim() ? parsed.icon.trim() : defaultHero.icon,
        title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : defaultHero.title,
        subtitle: typeof parsed.subtitle === "string" && parsed.subtitle.trim() ? parsed.subtitle.trim() : defaultHero.subtitle,
      };
    } catch {
      return defaultHero;
    }
  }

  function writeHero(hero) {
    localStorage.setItem(heroKey, JSON.stringify(hero));
  }

  function writeString(key, value) {
    localStorage.setItem(key, value);
  }

  function readFeatures() {
    try {
      const raw = localStorage.getItem(featuresKey);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(parsed)) return defaultFeatures;
      const normalized = parsed
        .filter((c) => c && typeof c.icon === "string" && typeof c.title === "string" && typeof c.subtitle === "string")
        .map((c) => ({ icon: c.icon.trim(), title: c.title.trim(), subtitle: c.subtitle.trim() }))
        .filter((c) => c.icon && c.title && c.subtitle);
      return normalized.length ? normalized : defaultFeatures;
    } catch {
      return defaultFeatures;
    }
  }

  function writeFeatures(cards) {
    localStorage.setItem(featuresKey, JSON.stringify(cards));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderHeroPreview() {
    const icon = heroIconInput.value.trim() || defaultHero.icon;
    const title = heroTitleInput.value.trim() || defaultHero.title;
    const subtitle = heroSubtitleInput.value.trim() || defaultHero.subtitle;
    heroPreview.innerHTML = `
      <div class="hero-icon"><i class="${escapeHtml(icon)} fs-3" aria-hidden="true"></i></div>
      <p class="hero-title">${escapeHtml(title)}</p>
      <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
    `;
  }

  function renderUrlPreview() {
    const url = urlInput.value.trim() || defaultUrl;
    urlPreview.href = url;
  }

  function renderFeaturesPreview(cards) {
    if (!cards.length) {
      featuresPreview.innerHTML = '<div class="text-secondary small">No cards yet.</div>';
      return;
    }
    featuresPreview.innerHTML = cards
      .map(
        (c) => `
      <div class="col">
        <div class="feature-card-preview">
          <div class="feature-icon-preview fs-1"><i class="${escapeHtml(c.icon)}" aria-hidden="true"></i></div>
          <h3 class="feature-title-preview">${escapeHtml(c.title)}</h3>
          <p class="feature-subtitle-preview">${escapeHtml(c.subtitle)}</p>
        </div>
      </div>
    `,
      )
      .join("");
  }

  function renderFeaturesTable(cards) {
    if (!cards.length) {
      featuresTableWrap.innerHTML = '<div class="table-empty">No feature cards yet. Add your first card.</div>';
      return;
    }
    const rows = cards
      .map(
        (c, idx) => `
      <tr>
        <td><code>${escapeHtml(c.icon)}</code></td>
        <td>${escapeHtml(c.title)}</td>
        <td>${escapeHtml(c.subtitle)}</td>
        <td>
          <div class="actions-cell">
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit="${idx}" title="Edit"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${idx}" title="Delete"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
    featuresTableWrap.innerHTML = `
      <table class="podcast-table" style="min-width: 860px">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  let editingFeatureIndex = null;

  function openFeatureModal(mode, card) {
    editingFeatureIndex = mode === "edit" ? card.index : null;
    featureModalLabel.textContent = mode === "edit" ? "Edit Feature Card" : "Add Feature Card";
    featureSubmitBtn.innerHTML = mode === "edit" ? '<i class="bi bi-floppy"></i> Save Changes' : '<i class="bi bi-plus-circle"></i> Add Card';
    featureForm.classList.remove("was-validated");
    featureIconInput.value = card?.icon || "";
    featureTitleInput.value = card?.title || "";
    featureSubtitleInput.value = card?.subtitle || "";
    featureModal.show();
  }

  function isFeatureFormValid() {
    const valid = !!featureIconInput.value.trim() && !!featureTitleInput.value.trim() && !!featureSubtitleInput.value.trim();
    featureForm.classList.toggle("was-validated", !valid);
    return valid;
  }

  function setSavedState() {
    saveBtn.classList.add("btn-success");
    saveBtn.classList.remove("btn-primary");
    saveBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Saved';
    setTimeout(() => {
      saveBtn.classList.remove("btn-success");
      saveBtn.classList.add("btn-primary");
      saveBtn.innerHTML = '<i class="bi bi-floppy"></i> Save';
    }, 1200);
  }

  heroIconInput.addEventListener("input", renderHeroPreview);
  heroTitleInput.addEventListener("input", renderHeroPreview);
  heroSubtitleInput.addEventListener("input", renderHeroPreview);
  urlInput.addEventListener("input", renderUrlPreview);

  window.tinymce
    .init({
      selector: "#ukMedRichEditor",
      height: 520,
      menubar: "file edit view insert format tools table help",
      plugins: "lists link image table code autoresize",
      toolbar:
        "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image table | removeformat code",
      content_style:
        "body{font-family:DM Sans,system-ui,sans-serif;font-size:14px;line-height:1.6;background:#08203c;color:#e9f1ff;padding:14px;}",
      setup(ed) {
        ed.on("init", () => {
          const key = richTarget.value === "activities" ? activitiesKey : storyKey;
          ed.setContent(readString(key, defaultHtml));
        });
      },
    })
    .then(() => {
      const hero = readHero();
      heroIconInput.value = hero.icon;
      heroTitleInput.value = hero.title;
      heroSubtitleInput.value = hero.subtitle;
      urlInput.value = readString(urlKey, defaultUrl);
      renderHeroPreview();
      renderUrlPreview();

      let features = readFeatures();
      renderFeaturesTable(features);
      renderFeaturesPreview(features);

      const editorInstance = window.tinymce.get("ukMedRichEditor");
      richTarget.addEventListener("change", () => {
        if (!editorInstance) return;
        const key = richTarget.value === "activities" ? activitiesKey : storyKey;
        editorInstance.setContent(readString(key, defaultHtml));
      });

      addFeatureBtn.addEventListener("click", () => {
        openFeatureModal("add");
      });

      clearFeaturesBtn.addEventListener("click", () => {
        features = [];
        writeFeatures(features);
        renderFeaturesTable(features);
        renderFeaturesPreview(features);
      });

      featuresTableWrap.addEventListener("click", (event) => {
        const editBtn = event.target.closest("button[data-edit]");
        if (editBtn) {
          const index = Number(editBtn.getAttribute("data-edit"));
          if (Number.isNaN(index) || index < 0 || index >= features.length) return;
          const card = features[index];
          openFeatureModal("edit", { ...card, index });
          return;
        }
        const delBtn = event.target.closest("button[data-delete]");
        if (delBtn) {
          const index = Number(delBtn.getAttribute("data-delete"));
          if (Number.isNaN(index) || index < 0 || index >= features.length) return;
          features.splice(index, 1);
          writeFeatures(features);
          renderFeaturesTable(features);
          renderFeaturesPreview(features);
        }
      });

      featureForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!isFeatureFormValid()) return;
        const next = {
          icon: featureIconInput.value.trim(),
          title: featureTitleInput.value.trim(),
          subtitle: featureSubtitleInput.value.trim(),
        };
        if (editingFeatureIndex === null) {
          features.unshift(next);
        } else if (editingFeatureIndex >= 0 && editingFeatureIndex < features.length) {
          features[editingFeatureIndex] = next;
        }
        writeFeatures(features);
        renderFeaturesTable(features);
        renderFeaturesPreview(features);
        featureModal.hide();
      });

      saveBtn.addEventListener("click", () => {
        const instance = window.tinymce.get("ukMedRichEditor");
        if (!instance) return;
        const html = instance.getContent().trim() || defaultHtml;
        const key = richTarget.value === "activities" ? activitiesKey : storyKey;
        writeString(key, html);
        writeString(urlKey, urlInput.value.trim() || defaultUrl);
        writeHero({
          icon: heroIconInput.value.trim() || defaultHero.icon,
          title: heroTitleInput.value.trim() || defaultHero.title,
          subtitle: heroSubtitleInput.value.trim() || defaultHero.subtitle,
        });
        writeFeatures(features);
        setSavedState();
      });

      resetBtn.addEventListener("click", () => {
        const instance = window.tinymce.get("ukMedRichEditor");
        if (!instance) return;
        const key = richTarget.value === "activities" ? activitiesKey : storyKey;
        instance.setContent(defaultHtml);
        heroIconInput.value = defaultHero.icon;
        heroTitleInput.value = defaultHero.title;
        heroSubtitleInput.value = defaultHero.subtitle;
        urlInput.value = defaultUrl;
        features = defaultFeatures.slice();
        renderFeaturesTable(features);
        renderFeaturesPreview(features);
        renderHeroPreview();
        renderUrlPreview();
        writeString(key, defaultHtml);
        writeString(urlKey, defaultUrl);
        writeHero(defaultHero);
        writeFeatures(features);
      });
    })
    .catch(() => {
      // Keep the page usable even if TinyMCE fails to load.
      heroIconInput.value = defaultHero.icon;
      heroTitleInput.value = defaultHero.title;
      heroSubtitleInput.value = defaultHero.subtitle;
      urlInput.value = defaultUrl;
      renderHeroPreview();
      renderUrlPreview();
    });
})();

