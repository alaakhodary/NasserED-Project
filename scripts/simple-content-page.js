"use strict";

(function () {
  const shell = document.querySelector("[data-simple-content-page]");
  if (!shell) return;

  const key = shell.getAttribute("data-storage-key");
  const contentNode = document.getElementById("simpleContentPageContent");
  if (!key || !contentNode) return;

  let html = "";
  try {
    const raw = localStorage.getItem(key);
    html = raw && raw.trim() ? raw : "";
  } catch {
    html = "";
  }
  if (!html) return;
  contentNode.innerHTML = html;
  shell.classList.add("has-content");
})();
