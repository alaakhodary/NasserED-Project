"use strict";

(function () {
  const STORAGE_KEY = "dashboard-knowledge-v1";

  const openAddProtocolBtn = document.getElementById("openAddProtocolBtn");
  const protocolModalEl = document.getElementById("protocolModal");
  const protocolModalForm = document.getElementById("protocolModalForm");
  const protocolModalLabel = document.getElementById("protocolModalLabel");
  const protocolModalTopicId = document.getElementById("protocolModalTopicId");
  const protocolTitleInput = document.getElementById("protocolTitleInput");
  const protocolCategoryInput = document.getElementById("protocolCategoryInput");
  const protocolSubcategoryInput = document.getElementById("protocolSubcategoryInput");
  const protocolSummaryInput = document.getElementById("protocolSummaryInput");
  const protocolExternalResourceInput = document.getElementById("protocolExternalResourceInput");
  const protocolActionConfirmModalEl = document.getElementById("protocolActionConfirmModal");
  const protocolActionConfirmModalBody = document.getElementById("protocolActionConfirmModalBody");
  const confirmProtocolActionBtn = document.getElementById("confirmProtocolActionBtn");
  const protocolModal = protocolModalEl && window.bootstrap ? new window.bootstrap.Modal(protocolModalEl) : null;
  const protocolActionConfirmModal =
    protocolActionConfirmModalEl && window.bootstrap ? new window.bootstrap.Modal(protocolActionConfirmModalEl) : null;
  const topicListWrap = document.getElementById("topicListWrap");

  const protocolTotalLabel = document.getElementById("protocolTotalLabel");
  const protocolCategoryFilter = document.getElementById("protocolCategoryFilter");
  const protocolSubcategoryFilter = document.getElementById("protocolSubcategoryFilter");
  const protocolLimit = document.getElementById("protocolLimit");
  const protocolPagination = document.getElementById("protocolPagination");

  if (
    !openAddProtocolBtn ||
    !protocolModalEl ||
    !protocolModalForm ||
    !protocolModalLabel ||
    !protocolModalTopicId ||
    !protocolTitleInput ||
    !protocolCategoryInput ||
    !protocolSubcategoryInput ||
    !protocolSummaryInput ||
    !protocolExternalResourceInput ||
    !protocolModal ||
    !protocolActionConfirmModalEl ||
    !protocolActionConfirmModalBody ||
    !confirmProtocolActionBtn ||
    !protocolActionConfirmModal ||
    !topicListWrap ||
    !protocolTotalLabel ||
    !protocolCategoryFilter ||
    !protocolSubcategoryFilter ||
    !protocolLimit ||
    !protocolPagination
  ) {
    return;
  }

  let currentProtocolPage = 1;
  let pendingProtocolAction = null;

  function navigateToContentView(topicId) {
    if (!topicId) return;
    const target = new URL("content-view.html", location.href);
    target.searchParams.set("topicId", topicId);
    window.location.href = target.toString();
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

  function stripHtml(value) {
    return String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatDisplayDate(value) {
    const raw = String(value || "").trim();
    if (!raw) return "-";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function openProtocolActionConfirm(message, confirmVariant, callback) {
    protocolActionConfirmModalBody.textContent = message;
    confirmProtocolActionBtn.classList.remove("btn-primary", "btn-danger", "btn-warning");
    confirmProtocolActionBtn.classList.add(confirmVariant || "btn-primary");
    pendingProtocolAction = typeof callback === "function" ? callback : null;
    protocolActionConfirmModal.show();
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
              ? cat.topics
                  .filter((topic) => topic && typeof topic === "object")
                  .map((topic) => ({
                    id: String(topic.id || uid("topic")),
                    title: String(topic.title || "").trim(),
                    slug: String(topic.slug || slugify(topic.title)).trim(),
                    status: topic.status === "draft" ? "draft" : "published",
                    content: String(topic.content || "<p>Coming soon.</p>"),
                    subcategory: String(topic.subcategory || "").trim(),
                    summary: String(topic.summary || "").trim(),
                    publishDate: String(topic.publishDate || "").trim(),
                    externalResource: String(topic.externalResource || "").trim(),
                  }))
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

  function flattenProtocols(store) {
    return store.categories.flatMap((cat) =>
      cat.topics.map((topic) => ({
        categoryId: cat.id,
        categoryName: cat.name || "General",
        topicId: topic.id,
        topicTitle: topic.title || "Untitled",
        topicStatus: topic.status || "published",
        topicPreview: stripHtml(topic.content).slice(0, 120),
        topicSubcategory: topic.subcategory || "",
        topicSummary: topic.summary || "",
        topicPublishDate: formatDisplayDate(topic.publishDate || ""),
        topicExternalResource: topic.externalResource || "",
      })),
    );
  }

  function getDefaultKnowledgeTaxonomy() {
    return [
      { category: "Resus Protocols", subcategories: ["NLS/APLS/ALS Drowning choking sepsis", "Video guides in resus"] },
      {
        category: "Medicine",
        subcategories: ["Neurology", "Respiratory", "Cardiovascular", "Gastrointestinal", "Rheumatological", "Endocrine", "Oncology", "Dermatological", "Hematology"],
      },
      {
        category: "Surgery",
        subcategories: ["Neurosurgery", "Ophthalmology", "ENT", "Cardiothoracic", "General surgery", "Orthopaedics and MSK", "Obstetric and Gynaecology"],
      },
      {
        category: "Paediatrics",
        subcategories: ["Neurology", "Respiratory", "Cardiovascular", "Gastrointestinal", "Rheumatological", "Endocrine", "Oncology", "Dermatological", "Hematology"],
      },
      {
        category: "Paediatric Surgery",
        subcategories: ["Neurosurgery", "Ophthalmology", "ENT", "Cardiothoracic", "General surgery", "Orthopaedics and MSK"],
      },
      {
        category: "Major Trauma Quick Guides",
        subcategories: ["Catastrophic Bleeding", "Spine injuries", "Airway", "Chest", "Abdo", "Pelvis", "Brain injuries", "Burns"],
      },
    ];
  }

  function buildKnowledgeTaxonomyMap(store) {
    const categoriesMap = new Map();

    for (const item of getDefaultKnowledgeTaxonomy()) {
      const categoryName = String(item.category || "").trim();
      if (!categoryName) continue;
      if (!categoriesMap.has(categoryName)) categoriesMap.set(categoryName, new Set());
      for (const sub of item.subcategories || []) {
        const subcategoryName = String(sub || "").trim();
        if (!subcategoryName) continue;
        categoriesMap.get(categoryName).add(subcategoryName);
      }
    }

    const rows = flattenProtocols(store);
    for (const row of rows) {
      const categoryName = String(row.categoryName || "General").trim() || "General";
      const subcategoryName = String(row.topicSubcategory || "").trim();
      if (!categoriesMap.has(categoryName)) categoriesMap.set(categoryName, new Set());
      if (subcategoryName) categoriesMap.get(categoryName).add(subcategoryName);
    }

    return categoriesMap;
  }

  function renderProtocolSubcategoryOptions(categoriesMap, categoryName, selectedSubcategory) {
    const fallbackOption = '<option value="">Select subcategory</option>';
    if (!categoryName || !categoriesMap.has(categoryName)) {
      protocolSubcategoryInput.innerHTML = fallbackOption;
      protocolSubcategoryInput.value = "";
      return;
    }

    const subcategories = Array.from(categoriesMap.get(categoryName)).sort((a, b) => a.localeCompare(b));
    const options = [fallbackOption];
    for (const sub of subcategories) {
      options.push(`<option value="${escapeHtml(sub)}">${escapeHtml(sub)}</option>`);
    }
    protocolSubcategoryInput.innerHTML = options.join("");
    const normalizedSelected = String(selectedSubcategory || "").trim();
    protocolSubcategoryInput.value = subcategories.includes(normalizedSelected) ? normalizedSelected : "";
  }

  function renderProtocolCategoryInputs(store, selectedCategory, selectedSubcategory) {
    const categoriesMap = buildKnowledgeTaxonomyMap(store);
    const categories = Array.from(categoriesMap.keys()).sort((a, b) => a.localeCompare(b));
    const options = ['<option value="" selected disabled>Select category</option>'];
    for (const categoryName of categories) {
      options.push(`<option value="${escapeHtml(categoryName)}">${escapeHtml(categoryName)}</option>`);
    }
    protocolCategoryInput.innerHTML = options.join("");
    const normalizedSelected = String(selectedCategory || "").trim();
    protocolCategoryInput.value = categories.includes(normalizedSelected) ? normalizedSelected : "";
    renderProtocolSubcategoryOptions(categoriesMap, protocolCategoryInput.value, selectedSubcategory);
  }

  function renderProtocolCategoryFilter(store) {
    const categoriesMap = buildKnowledgeTaxonomyMap(store);
    const currentCategory = protocolCategoryFilter.value || "all";
    const categoryNames = Array.from(categoriesMap.keys()).sort((a, b) => a.localeCompare(b));
    const options = ['<option value="all">All</option>'].concat(
      categoryNames.map((categoryName) => `<option value="${escapeHtml(categoryName)}">${escapeHtml(categoryName)}</option>`),
    );
    protocolCategoryFilter.innerHTML = options.join("");
    protocolCategoryFilter.value = currentCategory === "all" || categoryNames.includes(currentCategory) ? currentCategory : "all";
  }

  function renderProtocolSubcategoryFilter(store) {
    const categoriesMap = buildKnowledgeTaxonomyMap(store);
    const selectedCategory = protocolCategoryFilter.value || "all";
    const currentSubcategory = protocolSubcategoryFilter.value || "all";
    const subcategoriesSet = new Set();

    if (selectedCategory === "all") {
      categoriesMap.forEach((set) => {
        set.forEach((sub) => subcategoriesSet.add(sub));
      });
    } else if (categoriesMap.has(selectedCategory)) {
      categoriesMap.get(selectedCategory).forEach((sub) => subcategoriesSet.add(sub));
    }

    const subcategories = Array.from(subcategoriesSet).sort((a, b) => a.localeCompare(b));
    const options = ['<option value="all">All</option>'].concat(
      subcategories.map((sub) => `<option value="${escapeHtml(sub)}">${escapeHtml(sub)}</option>`),
    );
    protocolSubcategoryFilter.innerHTML = options.join("");
    protocolSubcategoryFilter.value = currentSubcategory === "all" || subcategories.includes(currentSubcategory) ? currentSubcategory : "all";
  }

  function buildProtocolPagination(totalItems, limit) {
    const pages = Math.max(1, Math.ceil(totalItems / limit));
    if (currentProtocolPage > pages) currentProtocolPage = pages;
    const items = [];
    const prevDisabled = currentProtocolPage <= 1;
    items.push(`<li class="page-item${prevDisabled ? " disabled" : ""}"><button class="page-link" data-page="${currentProtocolPage - 1}" ${prevDisabled ? "disabled" : ""}>Previous</button></li>`);
    for (let i = 1; i <= pages; i += 1) {
      items.push(`<li class="page-item${i === currentProtocolPage ? " active" : ""}"><button class="page-link" data-page="${i}">${i}</button></li>`);
    }
    const nextDisabled = currentProtocolPage >= pages;
    items.push(`<li class="page-item${nextDisabled ? " disabled" : ""}"><button class="page-link" data-page="${currentProtocolPage + 1}" ${nextDisabled ? "disabled" : ""}>Next</button></li>`);
    protocolPagination.innerHTML = items.join("");
  }

  function renderProtocols(store) {
    const allRows = flattenProtocols(store);
    const selectedCategory = protocolCategoryFilter.value || "all";
    const selectedSubcategory = protocolSubcategoryFilter.value || "all";
    const rows = allRows.filter((row) => {
      const categoryPass = selectedCategory === "all" || row.categoryName === selectedCategory;
      const subcategoryPass =
        selectedSubcategory === "all" || String(row.topicSubcategory || "").trim() === String(selectedSubcategory).trim();
      return categoryPass && subcategoryPass;
    });
    protocolTotalLabel.textContent = String(rows.length);
    const limit = Number(protocolLimit.value) || 10;
    buildProtocolPagination(rows.length, limit);
    const start = (currentProtocolPage - 1) * limit;
    const pageRows = rows.slice(start, start + limit);

    const body = pageRows.length
      ? pageRows
          .map(
            (row) => `
        <tr>
          <td>${escapeHtml(row.categoryName)}</td>
          <td>${escapeHtml(row.topicSubcategory || "-")}</td>
          <td class="protocol-title-cell">${escapeHtml(row.topicTitle)}</td>
          <td>${escapeHtml(row.topicPublishDate || "-")}</td>
          <td>${
            row.topicExternalResource
              ? `<a href="${escapeHtml(row.topicExternalResource)}" target="_blank" rel="noopener noreferrer" class="link-info protocol-link">${escapeHtml(row.topicExternalResource)}</a>`
              : "-"
          }</td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-sm btn-outline-info protocol-action-btn" data-topic-view="${escapeHtml(row.topicId)}" title="View content"><i class="bi bi-eye"></i> View</button>
              <button class="btn btn-sm btn-outline-primary protocol-action-btn" data-topic-edit="${escapeHtml(row.topicId)}" title="Edit protocol"><i class="bi bi-pencil-square"></i> Edit</button>
              <button class="btn btn-sm btn-outline-danger protocol-action-btn" data-topic-delete="${escapeHtml(row.topicId)}" title="Delete protocol"><i class="bi bi-trash3"></i> Delete</button>
            </div>
          </td>
        </tr>`,
          )
          .join("")
      : '<tr><td colspan="6" class="protocol-empty-row">No protocols found for this filter.</td></tr>';

    topicListWrap.innerHTML = `
      <table class="knowledge-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Title</th>
            <th>Publish Date</th>
            <th>External Resource</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>`;
  }

  function resetProtocolModalForm() {
    protocolModalTopicId.value = "";
    protocolTitleInput.value = "";
    renderProtocolCategoryInputs(readStore(), "", "");
    protocolSummaryInput.value = "";
    protocolExternalResourceInput.value = "";
    protocolModalForm.classList.remove("was-validated");
    protocolModalLabel.textContent = "Add Protocol";
  }

  function render() {
    const store = readStore();
    renderProtocolCategoryInputs(store, protocolCategoryInput.value, protocolSubcategoryInput.value);
    renderProtocolCategoryFilter(store);
    renderProtocolSubcategoryFilter(store);
    renderProtocols(store);
  }

  openAddProtocolBtn.addEventListener("click", () => {
    resetProtocolModalForm();
    protocolModal.show();
  });

  protocolModalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = protocolTitleInput.value.trim();
    const categoryName = protocolCategoryInput.value.trim();
    if (!title || !categoryName) {
      protocolModalForm.classList.add("was-validated");
      return;
    }
    const store = readStore();
    let category = store.categories.find((item) => item.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) {
      category = { id: uid("cat"), name: categoryName, slug: slugify(categoryName), topics: [] };
      store.categories.push(category);
    }
    const topicId = protocolModalTopicId.value.trim();
    let targetTopicId = "";
    if (topicId) {
      for (const cat of store.categories) {
        const index = cat.topics.findIndex((topic) => topic.id === topicId);
        if (index === -1) continue;
        const existing = cat.topics[index];
        cat.topics.splice(index, 1);
        const updated = {
          ...existing,
          title,
          slug: slugify(title),
          status: "published",
          subcategory: protocolSubcategoryInput.value.trim(),
          summary: protocolSummaryInput.value.trim(),
          publishDate: existing.publishDate || new Date().toISOString().slice(0, 10),
          externalResource: protocolExternalResourceInput.value.trim(),
        };
        category.topics.push(updated);
        targetTopicId = updated.id;
        break;
      }
    } else {
      const newTopic = {
        id: uid("topic"),
        title,
        slug: slugify(title),
        status: "published",
        content: "<p>Coming soon.</p>",
        subcategory: protocolSubcategoryInput.value.trim(),
        summary: protocolSummaryInput.value.trim(),
        publishDate: new Date().toISOString().slice(0, 10),
        externalResource: protocolExternalResourceInput.value.trim(),
      };
      category.topics.push(newTopic);
      targetTopicId = newTopic.id;
    }
    writeStore(store);
    navigateToContentView(targetTopicId);
  });

  topicListWrap.addEventListener("click", (event) => {
    const store = readStore();
    const viewBtn = event.target.closest("[data-topic-view]");
    if (viewBtn) {
      const id = viewBtn.getAttribute("data-topic-view");
      navigateToContentView(id);
      return;
    }
    const editBtn = event.target.closest("[data-topic-edit]");
    if (editBtn) {
      const id = editBtn.getAttribute("data-topic-edit");
      for (const cat of store.categories) {
        const topic = cat.topics.find((item) => item.id === id);
        if (!topic) continue;
        protocolModalTopicId.value = topic.id;
        protocolTitleInput.value = topic.title;
        renderProtocolCategoryInputs(store, cat.name, topic.subcategory || "");
        protocolSummaryInput.value = topic.summary || "";
        protocolExternalResourceInput.value = topic.externalResource || "";
        protocolModalForm.classList.remove("was-validated");
        protocolModalLabel.textContent = "Edit Protocol";
        protocolModal.show();
        return;
      }
      return;
    }
    const deleteBtn = event.target.closest("[data-topic-delete]");
    if (!deleteBtn) return;
    const id = deleteBtn.getAttribute("data-topic-delete");
    openProtocolActionConfirm("Are you sure you want to delete this protocol?", "btn-danger", () => {
      const nextStore = readStore();
      for (const cat of nextStore.categories) {
        cat.topics = cat.topics.filter((item) => item.id !== id);
      }
      writeStore(nextStore);
      render();
    });
  });

  protocolCategoryFilter.addEventListener("change", () => {
    currentProtocolPage = 1;
    renderProtocolSubcategoryFilter(readStore());
    protocolSubcategoryFilter.value = "all";
    render();
  });

  protocolSubcategoryFilter.addEventListener("change", () => {
    currentProtocolPage = 1;
    render();
  });

  protocolLimit.addEventListener("change", () => {
    currentProtocolPage = 1;
    render();
  });

  protocolPagination.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button) return;
    const page = Number(button.getAttribute("data-page"));
    if (Number.isNaN(page) || page < 1) return;
    currentProtocolPage = page;
    render();
  });

  protocolCategoryInput.addEventListener("change", () => {
    renderProtocolSubcategoryOptions(buildKnowledgeTaxonomyMap(readStore()), protocolCategoryInput.value, "");
  });

  confirmProtocolActionBtn.addEventListener("click", () => {
    const action = pendingProtocolAction;
    pendingProtocolAction = null;
    protocolActionConfirmModal.hide();
    window.setTimeout(() => {
      if (typeof action === "function") action();
    }, 0);
  });

  protocolActionConfirmModalEl.addEventListener("hidden.bs.modal", () => {
    pendingProtocolAction = null;
  });

  protocolModalEl.addEventListener("hidden.bs.modal", () => {
    resetProtocolModalForm();
  });

  render();
})();
