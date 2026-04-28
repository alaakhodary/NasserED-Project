"use strict";

(function () {
  const storageKey = "dashboard-pages-podcast-items";

  const openAddPodcastBtn = document.getElementById("openAddPodcastBtn");
  const podcastForm = document.getElementById("podcastForm");
  const podcastTableWrap = document.getElementById("podcastTableWrap");
  const clearPodcastBtn = document.getElementById("clearPodcastBtn");
  const totalPodcastItems = document.getElementById("totalPodcastItems");
  const submitPodcastBtn = document.getElementById("submitPodcastBtn");
  const podcastModalLabel = document.getElementById("podcastModalLabel");
  const podcastModalEl = document.getElementById("podcastModal");
  const deletePodcastModalEl = document.getElementById("deletePodcastModal");
  const clearAllPodcastModalEl = document.getElementById("clearAllPodcastModal");
  const confirmDeletePodcastBtn = document.getElementById("confirmDeletePodcastBtn");
  const confirmClearAllPodcastBtn = document.getElementById("confirmClearAllPodcastBtn");
  const podcastModal = podcastModalEl && window.bootstrap ? new window.bootstrap.Modal(podcastModalEl) : null;
  const deletePodcastModal = deletePodcastModalEl && window.bootstrap ? new window.bootstrap.Modal(deletePodcastModalEl) : null;
  const clearAllPodcastModal = clearAllPodcastModalEl && window.bootstrap ? new window.bootstrap.Modal(clearAllPodcastModalEl) : null;
  let editingIndex = null;
  let pendingDeleteIndex = null;

  if (
    !openAddPodcastBtn ||
    !podcastForm ||
    !podcastTableWrap ||
    !clearPodcastBtn ||
    !totalPodcastItems ||
    !submitPodcastBtn ||
    !podcastModalLabel ||
    !podcastModal ||
    !deletePodcastModal ||
    !clearAllPodcastModal ||
    !confirmDeletePodcastBtn ||
    !confirmClearAllPodcastBtn
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

  function updateSubmitButton() {
    const isEditMode = editingIndex !== null;
    podcastModalLabel.textContent = isEditMode ? "Edit Podcast" : "Add Podcast";
    submitPodcastBtn.innerHTML = isEditMode ? '<i class="bi bi-floppy"></i> Save Changes' : '<i class="bi bi-plus-circle"></i> Add Podcast';
  }

  function resetFormState() {
    editingIndex = null;
    podcastForm.reset();
    podcastForm.classList.remove("was-validated");
    updateSubmitButton();
  }

  function renderStats(items) {
    totalPodcastItems.textContent = String(items.length);
  }

  function renderTable(items) {
    if (!items.length) {
      podcastTableWrap.innerHTML = '<div class="table-empty">No podcast entries yet. Add your first one.</div>';
      return;
    }

    const rows = items
      .map(
        (item, index) => `
      <tr>
        <td>${escapeHtml(item.pageTitle)}</td>
        <td>${escapeHtml(item.videoLabel)}</td>
        <td><a href="${escapeHtml(item.videoUrl)}" target="_blank" rel="noopener noreferrer" class="link-info">${escapeHtml(item.videoUrl)}</a></td>
        <td>
          <div class="actions-cell">
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit="${index}" title="Edit podcast"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${index}" title="Delete podcast"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    podcastTableWrap.innerHTML = `
      <table class="podcast-table">
        <thead>
          <tr>
            <th>Page Title</th>
            <th>Video Label</th>
            <th>Video URL</th>
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
    const pageTitle = podcastForm.elements.pageTitle.value.trim();
    const videoLabel = podcastForm.elements.videoLabel.value.trim();
    const videoUrl = podcastForm.elements.videoUrl.value.trim();

    let valid = !!pageTitle && !!videoLabel && !!videoUrl;
    try {
      new URL(videoUrl);
    } catch {
      valid = false;
    }

    podcastForm.classList.toggle("was-validated", !valid);
    return valid;
  }

  podcastForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isFormValid()) return;

    const items = readItems();
    const nextItem = {
      pageTitle: podcastForm.elements.pageTitle.value.trim(),
      videoLabel: podcastForm.elements.videoLabel.value.trim(),
      videoUrl: podcastForm.elements.videoUrl.value.trim(),
    };

    if (editingIndex === null) {
      items.unshift(nextItem);
    } else {
      if (editingIndex < 0 || editingIndex >= items.length) return;
      items[editingIndex] = nextItem;
    }

    writeItems(items);
    podcastModal.hide();
    resetFormState();
    render();
  });

  openAddPodcastBtn.addEventListener("click", () => {
    resetFormState();
    podcastModal.show();
  });

  podcastTableWrap.addEventListener("click", (event) => {
    const items = readItems();
    const deleteBtn = event.target.closest("button[data-delete]");
    if (deleteBtn) {
      const index = Number(deleteBtn.getAttribute("data-delete"));
      if (Number.isNaN(index) || index < 0 || index >= items.length) return;
      pendingDeleteIndex = index;
      deletePodcastModal.show();
      return;
    }

    const editBtn = event.target.closest("button[data-edit]");
    if (!editBtn) return;
    const index = Number(editBtn.getAttribute("data-edit"));
    if (Number.isNaN(index) || index < 0 || index >= items.length) return;
    const item = items[index];
    podcastForm.elements.pageTitle.value = item.pageTitle;
    podcastForm.elements.videoLabel.value = item.videoLabel;
    podcastForm.elements.videoUrl.value = item.videoUrl;
    editingIndex = index;
    updateSubmitButton();
    podcastForm.classList.remove("was-validated");
    podcastModal.show();
  });

  clearPodcastBtn.addEventListener("click", () => {
    clearAllPodcastModal.show();
  });

  confirmDeletePodcastBtn.addEventListener("click", () => {
    const items = readItems();
    const index = pendingDeleteIndex;
    if (typeof index !== "number" || index < 0 || index >= items.length) {
      deletePodcastModal.hide();
      pendingDeleteIndex = null;
      return;
    }
    items.splice(index, 1);
    writeItems(items);
    if (editingIndex === index) resetFormState();
    if (editingIndex !== null && editingIndex > index) editingIndex -= 1;
    deletePodcastModal.hide();
    pendingDeleteIndex = null;
    render();
  });

  confirmClearAllPodcastBtn.addEventListener("click", () => {
    writeItems([]);
    resetFormState();
    podcastModal.hide();
    clearAllPodcastModal.hide();
    render();
  });

  deletePodcastModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDeleteIndex = null;
  });

  podcastModalEl.addEventListener("hidden.bs.modal", () => {
    resetFormState();
  });

  updateSubmitButton();
  render();
})();
