"use strict";

(function () {
  const storageKey = "dashboard-department-news";

  const openAddNewsBtn = document.getElementById("openAddNewsBtn");
  const newsForm = document.getElementById("newsForm");
  const publishedNewsTableWrap = document.getElementById("publishedNewsTableWrap");
  const draftNewsTableWrap = document.getElementById("draftNewsTableWrap");
  const clearNewsBtn = document.getElementById("clearNewsBtn");
  const totalNews = document.getElementById("totalNews");
  const publishedNews = document.getElementById("publishedNews");
  const draftNews = document.getElementById("draftNews");
  const submitNewsBtn = document.getElementById("submitNewsBtn");
  const imageInput = document.getElementById("image");
  const newsModalLabel = document.getElementById("newsModalLabel");
  const newsModalEl = document.getElementById("newsModal");
  const clearAllNewsModalEl = document.getElementById("clearAllNewsModal");
  const deleteNewsModalEl = document.getElementById("deleteNewsModal");
  const confirmClearAllNewsBtn = document.getElementById("confirmClearAllNewsBtn");
  const confirmDeleteNewsBtn = document.getElementById("confirmDeleteNewsBtn");
  const newsModal = newsModalEl && window.bootstrap ? new window.bootstrap.Modal(newsModalEl) : null;
  const clearAllNewsModal = clearAllNewsModalEl && window.bootstrap ? new window.bootstrap.Modal(clearAllNewsModalEl) : null;
  const deleteNewsModal = deleteNewsModalEl && window.bootstrap ? new window.bootstrap.Modal(deleteNewsModalEl) : null;
  let editingIndex = null;
  let pendingDeleteIndex = null;

  if (
    !openAddNewsBtn ||
    !newsForm ||
    !publishedNewsTableWrap ||
    !draftNewsTableWrap ||
    !clearNewsBtn ||
    !totalNews ||
    !publishedNews ||
    !draftNews ||
    !submitNewsBtn ||
    !imageInput ||
    !newsModalLabel ||
    !newsModal ||
    !clearAllNewsModal ||
    !deleteNewsModal ||
    !confirmClearAllNewsBtn ||
    !confirmDeleteNewsBtn
  )
    return;

  function readNews() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeNews(items) {
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

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function updateSubmitButton() {
    const isEditMode = editingIndex !== null;
    newsModalLabel.textContent = isEditMode ? "Edit News" : "Add News";
    submitNewsBtn.innerHTML = isEditMode ? '<i class="bi bi-floppy"></i> Save Changes' : '<i class="bi bi-plus-circle"></i> Add News';
  }

  function resetFormState() {
    editingIndex = null;
    newsForm.reset();
    newsForm.classList.remove("was-validated");
    updateSubmitButton();
  }

  function renderStats(items) {
    totalNews.textContent = String(items.length);
    publishedNews.textContent = String(items.filter((item) => item.status === "published").length);
    draftNews.textContent = String(items.filter((item) => item.status !== "published").length);
  }

  function renderSingleTable(target, items, emptyMessage, isPublishedSection) {
    if (!items.length) {
      target.innerHTML = `<div class="table-empty">${emptyMessage}</div>`;
      return;
    }

    const rows = items
      .map(
        (item) => `
      <tr>
        <td><img class="news-thumb" src="${item.image}" alt="${escapeHtml(item.title)}" /></td>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.content)}</td>
        <td><a href="${escapeHtml(item.referenceUrl)}" target="_blank" rel="noopener noreferrer" class="link-info">${escapeHtml(item.referenceUrl)}</a></td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.createdBy)}</td>
        <td>${escapeHtml(formatDate(item.createdAt))}</td>
        <td>${isPublishedSection ? "Published" : "Draft"}</td>
        <td>
          <div class="actions-cell">
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit="${item.index}" title="Edit item"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm ${isPublishedSection ? "btn-outline-warning" : "btn-outline-success"}" data-toggle-status="${item.index}" title="${isPublishedSection ? "Move to draft" : "Publish now"}">
              <i class="bi ${isPublishedSection ? "bi-eye-slash" : "bi-upload"}"></i>
              ${isPublishedSection ? "Unpublish" : "Publish"}
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${item.index}" title="Delete item"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    target.innerHTML = `
      <table class="news-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Content</th>
            <th>Reference URL</th>
            <th>Category</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderTables(items) {
    const renderablePublished = [];
    const renderableDraft = [];
    items.forEach((item, index) => {
      const entry = { ...item, index };
      if (item.status === "published") {
        renderablePublished.push(entry);
      } else {
        renderableDraft.push(entry);
      }
    });

    renderSingleTable(
      publishedNewsTableWrap,
      renderablePublished,
      "No published news yet.",
      true,
    );
    renderSingleTable(
      draftNewsTableWrap,
      renderableDraft,
      "No draft news yet.",
      false,
    );
  }

  function render() {
    const items = readNews();
    renderStats(items);
    renderTables(items);
  }

  function isFormValid() {
    const imageSelected = imageInput.files && imageInput.files.length > 0;
    const imageValid = editingIndex === null ? imageSelected : true;
    const valid =
      !!newsForm.elements.title.value.trim() &&
      !!newsForm.elements.content.value.trim() &&
      !!newsForm.elements.referenceUrl.value.trim() &&
      !!newsForm.elements.createdBy.value.trim() &&
      !!newsForm.elements.createdAt.value &&
      !!newsForm.elements.category.value.trim() &&
      imageValid;

    newsForm.classList.toggle("was-validated", !valid);
    return valid;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }

  newsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isFormValid()) return;

    const items = readNews();
    const imageFile = imageInput.files[0];
    let imageDataUrl = null;

    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) return;
      imageDataUrl = await readFileAsDataUrl(imageFile);
    }

    const nextItem = {
      image: "",
      title: newsForm.elements.title.value.trim(),
      content: newsForm.elements.content.value.trim(),
      referenceUrl: newsForm.elements.referenceUrl.value.trim(),
      createdBy: newsForm.elements.createdBy.value.trim(),
      createdAt: newsForm.elements.createdAt.value,
      category: newsForm.elements.category.value.trim(),
      status: "draft",
    };

    if (editingIndex === null) {
      if (!imageDataUrl) return;
      nextItem.image = imageDataUrl;
      items.unshift(nextItem);
    } else {
      if (editingIndex < 0 || editingIndex >= items.length) return;
      nextItem.image = imageDataUrl || items[editingIndex].image;
      nextItem.status = items[editingIndex].status || "draft";
      items[editingIndex] = nextItem;
    }

    writeNews(items);
    newsModal.hide();
    resetFormState();
    render();
  });

  function handleTableActions(event) {
    const items = readNews();
    const editBtn = event.target.closest("button[data-edit]");
    if (editBtn) {
      const index = Number(editBtn.getAttribute("data-edit"));
      if (Number.isNaN(index) || index < 0 || index >= items.length) return;
      const item = items[index];
      newsForm.elements.title.value = item.title;
      newsForm.elements.content.value = item.content;
      newsForm.elements.referenceUrl.value = item.referenceUrl;
      newsForm.elements.createdBy.value = item.createdBy;
      newsForm.elements.createdAt.value = item.createdAt;
      newsForm.elements.category.value = item.category;
      imageInput.value = "";
      editingIndex = index;
      updateSubmitButton();
      newsForm.classList.remove("was-validated");
      newsModal.show();
      return;
    }

    const toggleStatusBtn = event.target.closest("button[data-toggle-status]");
    if (toggleStatusBtn) {
      const index = Number(toggleStatusBtn.getAttribute("data-toggle-status"));
      if (Number.isNaN(index) || index < 0 || index >= items.length) return;
      items[index].status = items[index].status === "published" ? "draft" : "published";
      writeNews(items);
      render();
      return;
    }

    const deleteBtn = event.target.closest("button[data-delete]");
    if (deleteBtn) {
      const index = Number(deleteBtn.getAttribute("data-delete"));
      if (Number.isNaN(index) || index < 0 || index >= items.length) return;
      pendingDeleteIndex = index;
      deleteNewsModal.show();
    }
  }

  publishedNewsTableWrap.addEventListener("click", handleTableActions);
  draftNewsTableWrap.addEventListener("click", handleTableActions);

  clearNewsBtn.addEventListener("click", () => {
    clearAllNewsModal.show();
  });

  confirmClearAllNewsBtn.addEventListener("click", () => {
    writeNews([]);
    newsModal.hide();
    resetFormState();
    clearAllNewsModal.hide();
    render();
  });

  confirmDeleteNewsBtn.addEventListener("click", () => {
    const items = readNews();
    const index = pendingDeleteIndex;
    if (typeof index !== "number" || index < 0 || index >= items.length) {
      deleteNewsModal.hide();
      pendingDeleteIndex = null;
      return;
    }
    items.splice(index, 1);
    writeNews(items);
    if (editingIndex === index) {
      newsModal.hide();
      resetFormState();
    }
    if (editingIndex !== null && editingIndex > index) editingIndex -= 1;
    deleteNewsModal.hide();
    pendingDeleteIndex = null;
    render();
  });

  openAddNewsBtn.addEventListener("click", () => {
    resetFormState();
    newsModal.show();
  });

  newsModalEl.addEventListener("hidden.bs.modal", resetFormState);
  deleteNewsModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDeleteIndex = null;
  });

  updateSubmitButton();
  render();
})();
