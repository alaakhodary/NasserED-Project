"use strict";

(function () {
  const storageKey = "dashboard-pages-ed-research-items";

  const openAddResearchBtn = document.getElementById("openAddResearchBtn");
  const researchForm = document.getElementById("researchForm");
  const researchTableWrap = document.getElementById("researchTableWrap");
  const clearResearchBtn = document.getElementById("clearResearchBtn");
  const totalResearchItems = document.getElementById("totalResearchItems");
  const submitResearchBtn = document.getElementById("submitResearchBtn");
  const researchModalLabel = document.getElementById("researchModalLabel");
  const researchModalEl = document.getElementById("researchModal");
  const deleteResearchModalEl = document.getElementById("deleteResearchModal");
  const clearAllResearchModalEl = document.getElementById("clearAllResearchModal");
  const confirmDeleteResearchBtn = document.getElementById("confirmDeleteResearchBtn");
  const confirmClearAllResearchBtn = document.getElementById("confirmClearAllResearchBtn");
  const researchModal = researchModalEl && window.bootstrap ? new window.bootstrap.Modal(researchModalEl) : null;
  const deleteResearchModal = deleteResearchModalEl && window.bootstrap ? new window.bootstrap.Modal(deleteResearchModalEl) : null;
  const clearAllResearchModal = clearAllResearchModalEl && window.bootstrap ? new window.bootstrap.Modal(clearAllResearchModalEl) : null;
  let editingIndex = null;
  let pendingDeleteIndex = null;

  if (
    !openAddResearchBtn ||
    !researchForm ||
    !researchTableWrap ||
    !clearResearchBtn ||
    !totalResearchItems ||
    !submitResearchBtn ||
    !researchModalLabel ||
    !researchModal ||
    !deleteResearchModal ||
    !clearAllResearchModal ||
    !confirmDeleteResearchBtn ||
    !confirmClearAllResearchBtn
  )
    return;

  function readItems() {
    try {
      const data = localStorage.getItem(storageKey);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeItems(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function updateSubmitButton() {
    const isEditMode = editingIndex !== null;
    researchModalLabel.textContent = isEditMode ? "Edit Research" : "Add Research";
    submitResearchBtn.innerHTML = isEditMode ? '<i class="bi bi-floppy"></i> Save Changes' : '<i class="bi bi-plus-circle"></i> Add Research';
  }

  function resetFormState() {
    editingIndex = null;
    researchForm.reset();
    researchForm.classList.remove("was-validated");
    updateSubmitButton();
  }

  function renderStats(items) {
    totalResearchItems.textContent = String(items.length);
  }

  function renderTable(items) {
    if (!items.length) {
      researchTableWrap.innerHTML = '<div class="table-empty">No research entries yet. Add your first one.</div>';
      return;
    }

    const rows = items
      .map(
        (item, index) => `
      <tr>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(formatDate(item.publishedAt))}</td>
        <td class="research-title">${escapeHtml(item.title)}</td>
        <td class="research-abstract">${escapeHtml(item.abstract)}</td>
        <td>${escapeHtml(item.publisherName)}</td>
        <td>${escapeHtml(item.role)}</td>
        <td><a href="${escapeHtml(item.externalLink)}" target="_blank" rel="noopener noreferrer" class="link-info">${escapeHtml(item.externalLink)}</a></td>
        <td>
          <div class="actions-cell">
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit="${index}" title="Edit research"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${index}" title="Delete research"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    researchTableWrap.innerHTML = `
      <table class="research-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Published At</th>
            <th>Title</th>
            <th>Abstract</th>
            <th>Publisher Name</th>
            <th>Role</th>
            <th>External Link</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function render() {
    const items = readItems();
    renderStats(items);
    renderTable(items);
  }

  function isFormValid() {
    const category = researchForm.elements.category.value.trim();
    const publishedAt = researchForm.elements.publishedAt.value.trim();
    const title = researchForm.elements.title.value.trim();
    const abstract = researchForm.elements.abstract.value.trim();
    const publisherName = researchForm.elements.publisherName.value.trim();
    const role = researchForm.elements.role.value.trim();
    const externalLink = researchForm.elements.externalLink.value.trim();

    let valid = !!category && !!publishedAt && !!title && !!abstract && !!publisherName && !!role && !!externalLink;
    try {
      new URL(externalLink);
    } catch {
      valid = false;
    }

    researchForm.classList.toggle("was-validated", !valid);
    return valid;
  }

  researchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isFormValid()) return;

    const items = readItems();
    const nextItem = {
      category: researchForm.elements.category.value.trim(),
      publishedAt: researchForm.elements.publishedAt.value.trim(),
      title: researchForm.elements.title.value.trim(),
      abstract: researchForm.elements.abstract.value.trim(),
      publisherName: researchForm.elements.publisherName.value.trim(),
      role: researchForm.elements.role.value.trim(),
      externalLink: researchForm.elements.externalLink.value.trim(),
    };

    if (editingIndex === null) {
      items.unshift(nextItem);
    } else {
      if (editingIndex < 0 || editingIndex >= items.length) return;
      items[editingIndex] = nextItem;
    }

    writeItems(items);
    researchModal.hide();
    resetFormState();
    render();
  });

  openAddResearchBtn.addEventListener("click", () => {
    resetFormState();
    researchModal.show();
  });

  researchTableWrap.addEventListener("click", (event) => {
    const items = readItems();
    const deleteBtn = event.target.closest("button[data-delete]");
    if (deleteBtn) {
      const index = Number(deleteBtn.getAttribute("data-delete"));
      if (Number.isNaN(index) || index < 0 || index >= items.length) return;
      pendingDeleteIndex = index;
      deleteResearchModal.show();
      return;
    }

    const editBtn = event.target.closest("button[data-edit]");
    if (!editBtn) return;
    const index = Number(editBtn.getAttribute("data-edit"));
    if (Number.isNaN(index) || index < 0 || index >= items.length) return;
    const item = items[index];
    researchForm.elements.category.value = item.category;
    researchForm.elements.publishedAt.value = item.publishedAt;
    researchForm.elements.title.value = item.title;
    researchForm.elements.abstract.value = item.abstract;
    researchForm.elements.publisherName.value = item.publisherName;
    researchForm.elements.role.value = item.role;
    researchForm.elements.externalLink.value = item.externalLink;
    editingIndex = index;
    updateSubmitButton();
    researchForm.classList.remove("was-validated");
    researchModal.show();
  });

  clearResearchBtn.addEventListener("click", () => {
    clearAllResearchModal.show();
  });

  confirmDeleteResearchBtn.addEventListener("click", () => {
    const items = readItems();
    const index = pendingDeleteIndex;
    if (typeof index !== "number" || index < 0 || index >= items.length) {
      deleteResearchModal.hide();
      pendingDeleteIndex = null;
      return;
    }
    items.splice(index, 1);
    writeItems(items);
    if (editingIndex === index) resetFormState();
    if (editingIndex !== null && editingIndex > index) editingIndex -= 1;
    deleteResearchModal.hide();
    pendingDeleteIndex = null;
    render();
  });

  confirmClearAllResearchBtn.addEventListener("click", () => {
    writeItems([]);
    resetFormState();
    researchModal.hide();
    clearAllResearchModal.hide();
    render();
  });

  deleteResearchModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDeleteIndex = null;
  });

  researchModalEl.addEventListener("hidden.bs.modal", () => {
    resetFormState();
  });

  updateSubmitButton();
  render();
})();
