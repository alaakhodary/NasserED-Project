"use strict";

(function () {
  const STORAGE_KEY = "dashboard-knowledge-v1";

  const categoryForm = document.getElementById("categoryForm");
  const categoryIdInput = document.getElementById("categoryIdInput");
  const categoryNameInput = document.getElementById("categoryNameInput");
  const categoryResetBtn = document.getElementById("categoryResetBtn");
  const openCategoryModalBtn = document.getElementById("openCategoryModalBtn");
  const categoryModalEl = document.getElementById("categoryModal");
  const categoryModalLabel = document.getElementById("categoryModalLabel");
  const categoryActionConfirmModalEl = document.getElementById("categoryActionConfirmModal");
  const categoryActionConfirmModalLabel = document.getElementById("categoryActionConfirmModalLabel");
  const categoryActionConfirmModalBody = document.getElementById("categoryActionConfirmModalBody");
  const confirmCategoryActionBtn = document.getElementById("confirmCategoryActionBtn");
  const categoryTotalLabel = document.getElementById("categoryTotalLabel");
  const categoryListWrap = document.getElementById("categoryListWrap");
  const subcategoryTotalLabel = document.getElementById("subcategoryTotalLabel");
  const subcategoryCategoryFilter = document.getElementById("subcategoryCategoryFilter");
  const openSubcategoryModalBtn = document.getElementById("openSubcategoryModalBtn");
  const subcategoryListWrap = document.getElementById("subcategoryListWrap");
  const subcategoryModalEl = document.getElementById("subcategoryModal");
  const subcategoryModalLabel = document.getElementById("subcategoryModalLabel");
  const subcategoryForm = document.getElementById("subcategoryForm");
  const subcategoryIdInput = document.getElementById("subcategoryIdInput");
  const subcategoryParentCategoryInput = document.getElementById("subcategoryParentCategoryInput");
  const subcategoryNameInput = document.getElementById("subcategoryNameInput");
  const subcategoryResetBtn = document.getElementById("subcategoryResetBtn");
  const categoryModal = categoryModalEl && window.bootstrap ? new window.bootstrap.Modal(categoryModalEl) : null;
  const categoryActionConfirmModal =
    categoryActionConfirmModalEl && window.bootstrap ? new window.bootstrap.Modal(categoryActionConfirmModalEl) : null;
  const subcategoryModal = subcategoryModalEl && window.bootstrap ? new window.bootstrap.Modal(subcategoryModalEl) : null;
  let pendingCategoryAction = null;

  if (
    !categoryForm ||
    !categoryIdInput ||
    !categoryNameInput ||
    !categoryResetBtn ||
    !openCategoryModalBtn ||
    !categoryModalEl ||
    !categoryModalLabel ||
    !categoryActionConfirmModalEl ||
    !categoryActionConfirmModalLabel ||
    !categoryActionConfirmModalBody ||
    !confirmCategoryActionBtn ||
    !categoryTotalLabel ||
    !categoryListWrap ||
    !subcategoryTotalLabel ||
    !subcategoryCategoryFilter ||
    !openSubcategoryModalBtn ||
    !subcategoryListWrap ||
    !subcategoryModalEl ||
    !subcategoryModalLabel ||
    !subcategoryForm ||
    !subcategoryIdInput ||
    !subcategoryParentCategoryInput ||
    !subcategoryNameInput ||
    !subcategoryResetBtn ||
    !categoryModal ||
    !categoryActionConfirmModal ||
    !subcategoryModal
  ) {
    return;
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.categories)) return { categories: [] };
      return {
        categories: parsed.categories
          .filter((cat) => cat && typeof cat === "object")
          .map((cat) => ({
            id: String(cat.id || uid("cat")),
            name: String(cat.name || "").trim(),
            slug: String(cat.slug || slugify(cat.name)).trim(),
            topics: Array.isArray(cat.topics)
              ? cat.topics.map((topic) => ({
                  ...topic,
                  subcategory: String(topic && topic.subcategory ? topic.subcategory : "").trim(),
                }))
              : [],
            subcategories: Array.isArray(cat.subcategories)
              ? cat.subcategories.map((sub) => String(sub || "").trim()).filter(Boolean)
              : [],
          })),
      };
    } catch {
      return { categories: [] };
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, updatedAt: Date.now() }));
  }

  function initKnowledgeTabs() {
    const tabButtons = Array.from(document.querySelectorAll("[data-knowledge-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-knowledge-panel]"));
    if (!tabButtons.length || !panels.length) return;

    function activateTab(tab) {
      tabButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-knowledge-tab") === tab);
      });
      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.getAttribute("data-knowledge-panel") === tab);
      });
    }

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activateTab(button.getAttribute("data-knowledge-tab"));
      });
    });

    activateTab("categories");
  }

  function resetCategoryForm() {
    categoryIdInput.value = "";
    categoryNameInput.value = "";
    categoryForm.classList.remove("was-validated");
    categoryModalLabel.textContent = "Add Category";
  }

  function resetSubcategoryForm() {
    subcategoryIdInput.value = "";
    subcategoryParentCategoryInput.value = "";
    subcategoryParentCategoryInput.disabled = false;
    subcategoryNameInput.value = "";
    subcategoryForm.classList.remove("was-validated");
    subcategoryModalLabel.textContent = "Add Subcategory";
  }

  function resetCategoryConfirmModalUi() {
    categoryActionConfirmModalLabel.textContent = "Confirm Action";
    confirmCategoryActionBtn.classList.remove("btn-primary", "btn-warning");
    confirmCategoryActionBtn.classList.add("btn-danger");
    confirmCategoryActionBtn.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i> Delete';
  }

  /**
   * @param {string} message
   * @param {() => void} callback
   * @param {{ title?: string; variant?: "primary" | "danger" | "warning"; confirmLabel?: string; icon?: string }} [options]
   */
  function openCategoryActionConfirm(message, callback, options) {
    const opts = options || {};
    const variant = opts.variant || "danger";
    const confirmLabel = opts.confirmLabel || (variant === "danger" ? "Delete" : "Confirm");
    const icon = opts.icon || (variant === "danger" ? "bi-trash3" : "bi-check2-circle");
    categoryActionConfirmModalLabel.textContent = opts.title || "Confirm Action";
    categoryActionConfirmModalBody.textContent = message;
    confirmCategoryActionBtn.classList.remove("btn-primary", "btn-danger", "btn-warning");
    confirmCategoryActionBtn.classList.add(variant === "warning" ? "btn-warning" : variant === "primary" ? "btn-primary" : "btn-danger");
    confirmCategoryActionBtn.innerHTML =
      '<i class="bi ' + escapeHtml(icon) + '" aria-hidden="true"></i> ' + escapeHtml(confirmLabel);
    pendingCategoryAction = typeof callback === "function" ? callback : null;
    categoryActionConfirmModal.show();
  }

  function getSubcategoryCount(category) {
    const subcategories = new Set();
    (category.subcategories || []).forEach((sub) => {
      const value = String(sub || "").trim().toLowerCase();
      if (value) subcategories.add(value);
    });
    if (!Array.isArray(category.topics)) return 0;
    category.topics.forEach((topic) => {
      const sub = String(topic && topic.subcategory ? topic.subcategory : "").trim().toLowerCase();
      if (sub) subcategories.add(sub);
    });
    return subcategories.size;
  }

  function ensureSubcategoryInCategory(category, subcategoryName) {
    if (!Array.isArray(category.subcategories)) category.subcategories = [];
    const exists = category.subcategories.some((sub) => String(sub || "").trim().toLowerCase() === subcategoryName.toLowerCase());
    if (!exists) category.subcategories.push(subcategoryName);
  }

  function removeSubcategoryFromCategory(category, subcategoryName) {
    category.subcategories = (category.subcategories || []).filter(
      (sub) => String(sub || "").trim().toLowerCase() !== subcategoryName.toLowerCase(),
    );
  }

  function getSubcategoryRows(store) {
    const rows = [];
    store.categories.forEach((category) => {
      const names = new Set();
      (category.subcategories || []).forEach((sub) => {
        const value = String(sub || "").trim();
        if (value) names.add(value);
      });
      (category.topics || []).forEach((topic) => {
        const value = String(topic && topic.subcategory ? topic.subcategory : "").trim();
        if (value) names.add(value);
      });

      names.forEach((subcategoryName) => {
        const protocolCount = (category.topics || []).filter(
          (topic) => String(topic && topic.subcategory ? topic.subcategory : "").trim().toLowerCase() === subcategoryName.toLowerCase(),
        ).length;
        rows.push({
          id: category.id + "|||" + subcategoryName,
          categoryId: category.id,
          categoryName: category.name || "Untitled",
          subcategoryName,
          protocolCount,
        });
      });
    });

    return rows.sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.subcategoryName.localeCompare(b.subcategoryName));
  }

  function renderSubcategoryCategoryOptions(store) {
    const categories = [...store.categories].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    const currentFilter = subcategoryCategoryFilter.value || "all";
    const filterOptions = ['<option value="all">All</option>'];
    const modalOptions = ['<option value="" selected disabled>Select category</option>'];
    categories.forEach((category) => {
      filterOptions.push(`<option value="${escapeHtml(category.id)}">${escapeHtml(category.name || "Untitled")}</option>`);
      modalOptions.push(`<option value="${escapeHtml(category.id)}">${escapeHtml(category.name || "Untitled")}</option>`);
    });
    subcategoryCategoryFilter.innerHTML = filterOptions.join("");
    subcategoryCategoryFilter.value =
      currentFilter === "all" || categories.some((category) => category.id === currentFilter) ? currentFilter : "all";
    subcategoryParentCategoryInput.innerHTML = modalOptions.join("");
  }

  function renderSubcategories(store) {
    renderSubcategoryCategoryOptions(store);
    const selectedCategoryId = subcategoryCategoryFilter.value || "all";
    const allRows = getSubcategoryRows(store);
    const rows = selectedCategoryId === "all" ? allRows : allRows.filter((row) => row.categoryId === selectedCategoryId);
    subcategoryTotalLabel.textContent = String(rows.length);

    if (!rows.length) {
      subcategoryListWrap.innerHTML = '<div class="p-3 text-muted">No subcategories found for this filter.</div>';
      return;
    }

    subcategoryListWrap.innerHTML = `
      <table class="knowledge-table subcategory-table">
        <thead>
          <tr>
            <th>Subcategory Name</th>
            <th>Protocols</th>
            <th>Parent Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr>
              <td class="subcategory-name-cell">${escapeHtml(row.subcategoryName)}</td>
              <td class="category-count-cell">${row.protocolCount}</td>
              <td class="subcategory-parent-cell">${escapeHtml(row.categoryName)}</td>
              <td>
                <div class="actions-cell">
                  <button class="btn btn-sm btn-outline-primary" data-sub-action="edit" data-sub-id="${escapeHtml(row.id)}"><i class="bi bi-pencil-square"></i> Edit</button>
                  <button class="btn btn-sm btn-outline-danger" data-sub-action="delete" data-sub-id="${escapeHtml(row.id)}"><i class="bi bi-trash3"></i> Delete</button>
                </div>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`;
  }

  function render() {
    const store = readStore();
    categoryTotalLabel.textContent = String(store.categories.length);

    if (!store.categories.length) {
      categoryListWrap.innerHTML = '<div class="p-3 text-muted">No categories found.</div>';
      return;
    }

    const rows = store.categories
      .map(
        (cat) => `
      <tr>
        <td class="category-name-cell">${escapeHtml(cat.name || "Untitled")}</td>
        <td class="category-count-cell">${getSubcategoryCount(cat)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-sm btn-outline-primary" data-action="edit" data-category-id="${escapeHtml(cat.id)}"><i class="bi bi-pencil-square"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-category-id="${escapeHtml(cat.id)}"><i class="bi bi-trash3"></i> Delete</button>
          </div>
        </td>
      </tr>`,
      )
      .join("");

    categoryListWrap.innerHTML = `
      <table class="knowledge-table category-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Subcategories</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    renderSubcategories(store);
  }

  openCategoryModalBtn.addEventListener("click", () => {
    openCategoryActionConfirm(
      "Are you sure you want to add a new category?",
      () => {
        resetCategoryForm();
        categoryModal.show();
        window.setTimeout(() => categoryNameInput.focus(), 80);
      },
      {
        title: "Add category",
        variant: "primary",
        confirmLabel: "Yes",
        icon: "bi-check2-circle",
      },
    );
  });

  openSubcategoryModalBtn.addEventListener("click", () => {
    resetSubcategoryForm();
    renderSubcategoryCategoryOptions(readStore());
    subcategoryModal.show();
  });

  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const categoryName = categoryNameInput.value.trim();
    if (!categoryName) {
      categoryForm.classList.add("was-validated");
      return;
    }

    const store = readStore();
    const targetId = categoryIdInput.value.trim();
    if (targetId) {
      const category = store.categories.find((item) => item.id === targetId);
      if (!category) return;
      category.name = categoryName;
      category.slug = slugify(categoryName);
    } else {
      store.categories.push({
        id: uid("cat"),
        name: categoryName,
        slug: slugify(categoryName),
        topics: [],
      });
    }

    writeStore(store);
    resetCategoryForm();
    categoryModal.hide();
    render();
  });

  categoryResetBtn.addEventListener("click", resetCategoryForm);
  categoryModalEl.addEventListener("hidden.bs.modal", resetCategoryForm);
  subcategoryResetBtn.addEventListener("click", resetSubcategoryForm);
  subcategoryModalEl.addEventListener("hidden.bs.modal", resetSubcategoryForm);

  categoryListWrap.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action][data-category-id]");
    if (!button) return;
    const action = button.getAttribute("data-action");
    const categoryId = button.getAttribute("data-category-id");
    if (!action || !categoryId) return;

    const store = readStore();
    const category = store.categories.find((item) => item.id === categoryId);
    if (!category) return;

    if (action === "edit") {
      categoryIdInput.value = category.id;
      categoryNameInput.value = category.name;
      categoryModalLabel.textContent = "Edit Category";
      categoryModal.show();
      window.setTimeout(() => categoryNameInput.focus(), 80);
      return;
    }

    if (action === "delete") {
      openCategoryActionConfirm(
        "Delete this category and all its protocols?",
        () => {
          const nextStore = readStore();
          nextStore.categories = nextStore.categories.filter((item) => item.id !== categoryId);
          writeStore(nextStore);
          resetCategoryForm();
          render();
        },
        { title: "Confirm delete", variant: "danger", confirmLabel: "Delete", icon: "bi-trash3" },
      );
    }
  });

  subcategoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const parentCategoryId = subcategoryParentCategoryInput.value.trim();
    const subcategoryName = subcategoryNameInput.value.trim();
    if (!parentCategoryId || !subcategoryName) {
      subcategoryForm.classList.add("was-validated");
      return;
    }

    const store = readStore();
    const parentCategory = store.categories.find((category) => category.id === parentCategoryId);
    if (!parentCategory) return;

    const editRef = subcategoryIdInput.value.trim();
    if (editRef) {
      const [oldCategoryId, oldSubcategoryName] = editRef.split("|||");
      const oldCategory = store.categories.find((category) => category.id === oldCategoryId);
      if (!oldCategory || !oldSubcategoryName) return;

      const duplicate = (oldCategory.subcategories || []).some(
        (sub) =>
          String(sub || "").trim().toLowerCase() === subcategoryName.toLowerCase() &&
          String(sub || "").trim().toLowerCase() !== oldSubcategoryName.toLowerCase(),
      );
      if (duplicate) {
        subcategoryForm.classList.add("was-validated");
        return;
      }

      removeSubcategoryFromCategory(oldCategory, oldSubcategoryName);
      ensureSubcategoryInCategory(oldCategory, subcategoryName);
      (oldCategory.topics || []).forEach((topic) => {
        if (String(topic.subcategory || "").trim().toLowerCase() === oldSubcategoryName.toLowerCase()) {
          topic.subcategory = subcategoryName;
        }
      });
      writeStore(store);
      resetSubcategoryForm();
      subcategoryModal.hide();
      render();
      return;
    }

    const duplicateNew = (parentCategory.subcategories || []).some(
      (sub) => String(sub || "").trim().toLowerCase() === subcategoryName.toLowerCase(),
    );
    if (duplicateNew) {
      subcategoryForm.classList.add("was-validated");
      return;
    }

    ensureSubcategoryInCategory(parentCategory, subcategoryName);
    writeStore(store);
    resetSubcategoryForm();
    subcategoryModal.hide();
    render();
  });

  subcategoryListWrap.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-sub-action][data-sub-id]");
    if (!button) return;
    const action = button.getAttribute("data-sub-action");
    const subId = button.getAttribute("data-sub-id");
    if (!action || !subId) return;
    const [categoryId, subcategoryName] = subId.split("|||");
    if (!categoryId || !subcategoryName) return;

    const store = readStore();
    const category = store.categories.find((item) => item.id === categoryId);
    if (!category) return;

    if (action === "edit") {
      renderSubcategoryCategoryOptions(store);
      subcategoryIdInput.value = subId;
      subcategoryParentCategoryInput.value = categoryId;
      subcategoryParentCategoryInput.disabled = true;
      subcategoryNameInput.value = subcategoryName;
      subcategoryModalLabel.textContent = "Edit Subcategory";
      subcategoryModal.show();
      window.setTimeout(() => subcategoryNameInput.focus(), 80);
      return;
    }

    if (action === "delete") {
      openCategoryActionConfirm(
        "Delete this subcategory from its parent category?",
        () => {
          const nextStore = readStore();
          const targetCategory = nextStore.categories.find((item) => item.id === categoryId);
          if (!targetCategory) return;
          removeSubcategoryFromCategory(targetCategory, subcategoryName);
          (targetCategory.topics || []).forEach((topic) => {
            if (String(topic.subcategory || "").trim().toLowerCase() === subcategoryName.toLowerCase()) {
              topic.subcategory = "";
            }
          });
          writeStore(nextStore);
          render();
        },
        { title: "Confirm delete", variant: "danger", confirmLabel: "Delete", icon: "bi-trash3" },
      );
    }
  });

  subcategoryCategoryFilter.addEventListener("change", render);

  confirmCategoryActionBtn.addEventListener("click", () => {
    const action = pendingCategoryAction;
    pendingCategoryAction = null;
    categoryActionConfirmModal.hide();
    window.setTimeout(() => {
      if (typeof action === "function") action();
    }, 0);
  });

  categoryActionConfirmModalEl.addEventListener("hidden.bs.modal", () => {
    pendingCategoryAction = null;
    resetCategoryConfirmModalUi();
  });

  initKnowledgeTabs();
  render();
})();
