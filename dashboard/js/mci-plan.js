"use strict";

(function () {
  const storageKey = "dashboard-pages-mci-plan-tinymce-html";

  const editor = document.getElementById("mciEditor");
  const preview = document.getElementById("mciPreview");
  const saveBtn = document.getElementById("saveContentBtn");
  const resetBtn = document.getElementById("resetContentBtn");

  if (!editor || !preview || !saveBtn || !resetBtn || !window.tinymce) return;

  const defaultHtml = [
    "<h2>MCI Plan</h2>",
    "<p>Start editing this page with full formatting control.</p>",
    "<h3>Response Activation</h3>",
    "<ul><li>Define activation trigger.</li><li>Assign team leader and roles.</li></ul>",
  ].join("");

  function readContent() {
    try {
      const value = localStorage.getItem(storageKey);
      return value && value.trim() ? value : defaultHtml;
    } catch {
      return defaultHtml;
    }
  }

  function writeContent(html) {
    localStorage.setItem(storageKey, html);
  }

  function renderPreview(html) {
    const content = html && html.trim() ? html : defaultHtml;
    preview.innerHTML = content;
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

  window.tinymce
    .init({
      selector: "#mciEditor",
      height: 420,
      menubar: "file edit view insert format tools table help",
      plugins: "lists link image table code autoresize",
      toolbar:
        "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image table | removeformat code",
      content_style:
        "body{font-family:DM Sans,system-ui,sans-serif;font-size:14px;line-height:1.6;background:#08203c;color:#e9f1ff;padding:14px;}",
      setup(ed) {
        ed.on("init", () => {
          const initial = readContent();
          ed.setContent(initial);
          renderPreview(initial);
        });
        ed.on("change input undo redo", () => {
          renderPreview(ed.getContent());
        });
      },
    })
    .then(() => {
      saveBtn.addEventListener("click", () => {
        const instance = window.tinymce.get("mciEditor");
        if (!instance) return;
        const html = instance.getContent().trim() || defaultHtml;
        writeContent(html);
        renderPreview(html);
        setSavedState();
      });

      resetBtn.addEventListener("click", () => {
        const instance = window.tinymce.get("mciEditor");
        if (!instance) return;
        instance.setContent(defaultHtml);
        writeContent(defaultHtml);
        renderPreview(defaultHtml);
      });
    })
    .catch(() => {
      preview.innerHTML = "<p>Failed to load TinyMCE editor.</p>";
    });
})();
