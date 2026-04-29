"use strict";

(function () {
  const shell = document.querySelector("[data-nursing-page]");
  const titleNode = document.getElementById("nursingPageTitle");
  const breadcrumbNode = document.getElementById("nursingPageBreadcrumb");
  const contentNode = document.getElementById("nursingPageContent");
  if (!shell || !titleNode || !breadcrumbNode || !contentNode) return;

  const storageKey = shell.getAttribute("data-storage-key");
  const pageTitle = shell.getAttribute("data-page-title") || "Page";
  titleNode.textContent = pageTitle;
  breadcrumbNode.textContent = "Coming Soon";

  let html = "";
  if (storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      html = raw && raw.trim() ? raw : "";
    } catch {
      html = "";
    }
  }

  if (html) {
    contentNode.innerHTML = html;
    shell.classList.add("has-content");
  } else {
    contentNode.innerHTML = `
      <p>This page is coming soon.</p>
      <p>Use the dashboard editor to publish content for this section.</p>
    `;
  }
})();
