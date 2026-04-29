"use strict";

(function () {
  const shell = document.querySelector("[data-legal-page]");
  const contentNode = document.getElementById("legalPageContent");
  if (!shell || !contentNode) return;
  const key = shell.getAttribute("data-storage-key");
  let html = "";
  if (key) {
    try {
      const raw = localStorage.getItem(key);
      html = raw && raw.trim() ? raw : "";
    } catch {
      html = "";
    }
  }
  if (html) {
    contentNode.innerHTML = html;
    return;
  }
  const title = shell.getAttribute("data-page-title") || "Page";
  contentNode.innerHTML = `<h2>${title}</h2><p>Coming soon.</p>`;
})();
