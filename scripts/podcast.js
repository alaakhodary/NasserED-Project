"use strict";

(function () {
  const storageKey = "dashboard-pages-podcast-items";

  const breadcrumbTitle = document.getElementById("podcastBreadcrumbTitle");
  const pageTitle = document.getElementById("podcastPageTitle");
  const tilesRow = document.getElementById("podcastTilesRow");

  if (!tilesRow || !pageTitle) return;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function toYouTubeEmbed(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";

    // Already an embed URL
    if (raw.includes("youtube.com/embed/")) return raw;
    if (raw.includes("youtu.be/")) {
      const id = raw.split("youtu.be/")[1]?.split(/[?&#]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : raw;
    }

    // watch?v=VIDEO_ID
    const m = raw.match(/[?&]v=([^?&#]+)/);
    if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;

    return raw;
  }

  function readItems() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  const items = readItems()
    .filter((it) => it && typeof it.pageTitle === "string" && typeof it.videoLabel === "string" && typeof it.videoUrl === "string")
    .map((it) => ({
      pageTitle: it.pageTitle.trim(),
      videoLabel: it.videoLabel.trim(),
      videoUrl: it.videoUrl.trim(),
    }));

  if (!items.length) return;

  const effectiveTitle = items[0].pageTitle || "Podcast";
  pageTitle.textContent = effectiveTitle;
  if (breadcrumbTitle) breadcrumbTitle.textContent = effectiveTitle;

  const tilesMarkup = items
    .map((item) => {
      const embedUrl = toYouTubeEmbed(item.videoUrl);
      const safeLabel = escapeHtml(item.videoLabel);
      const safeEmbed = escapeHtml(embedUrl);
      const titleAttr = escapeHtml(item.videoLabel);
      return `
        <div class="col-12 col-md-6 col-lg-4">
          <article class="video-tile h-100 d-flex flex-column">
            <h2 class="h5 fw-semibold text-center mb-3 video-title">${safeLabel}</h2>
            <div class="ratio ratio-16x9 rounded overflow-hidden shadow-sm bg-black">
              <iframe class="border-0" src="${safeEmbed}" title="${titleAttr}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
            </div>
          </article>
        </div>
      `;
    })
    .join("");

  tilesRow.innerHTML = tilesMarkup;
})();

