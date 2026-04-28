"use strict";

(function () {
  const storageKeyTinyMceHtml = "dashboard-pages-mci-plan-tinymce-html";
  const storageKeyEditorJs = "dashboard-pages-mci-plan-editorjs";

  const row = document.getElementById("mciPlanContentRow");
  if (!row) return;

  function readString(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw || !String(raw).trim()) return null;
      return String(raw);
    } catch {
      return null;
    }
  }

  function normalizeEditorJsHtmlMaybe(parsed) {
    // If in the future we store Editor.js as HTML string, handle it.
    if (typeof parsed === "string") return parsed;
    // Otherwise ignore and rely on TinyMCE key.
    return null;
  }

  const tinyMceHtml = readString(storageKeyTinyMceHtml);
  let html = tinyMceHtml;

  if (!html) {
    const editorJsRaw = readString(storageKeyEditorJs);
    if (editorJsRaw) {
      try {
        const parsed = JSON.parse(editorJsRaw);
        html = normalizeEditorJsHtmlMaybe(parsed);
      } catch {
        html = null;
      }
    }
  }

  // If no dynamic content exists, keep the original static protocol.
  if (!html) return;

  // Keep the existing page chrome and replace the cards grid content only.
  row.innerHTML = `
    <div class="col-12">
      <section class="card border-0 mci-card">
        <div class="card-body p-4">
          ${html}
        </div>
      </section>
    </div>
  `;
})();

