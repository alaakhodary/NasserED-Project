"use strict";

(function () {
  const storageKey = "dashboard-senior-staff";

  const headerForm = document.getElementById("headerForm");
  const cardForm = document.getElementById("cardForm");
  const cardsTableWrap = document.getElementById("cardsTableWrap");
  const totalCards = document.getElementById("totalCards");
  const editHeaderBtn = document.getElementById("editHeaderBtn");
  const openAddCardBtn = document.getElementById("openAddCardBtn");
  const submitCardBtn = document.getElementById("submitCardBtn");
  const clearCardsBtn = document.getElementById("clearCardsBtn");
  const imageInput = document.getElementById("staffImage");
  const cardModalLabel = document.getElementById("cardModalLabel");
  const headerModalEl = document.getElementById("headerModal");
  const cardModalEl = document.getElementById("cardModal");
  const deleteCardModalEl = document.getElementById("deleteCardModal");
  const clearAllCardsModalEl = document.getElementById("clearAllCardsModal");
  const confirmDeleteCardBtn = document.getElementById("confirmDeleteCardBtn");
  const confirmClearAllCardsBtn = document.getElementById("confirmClearAllCardsBtn");
  const headerModal = headerModalEl && window.bootstrap ? new window.bootstrap.Modal(headerModalEl) : null;
  const cardModal = cardModalEl && window.bootstrap ? new window.bootstrap.Modal(cardModalEl) : null;
  const deleteCardModal = deleteCardModalEl && window.bootstrap ? new window.bootstrap.Modal(deleteCardModalEl) : null;
  const clearAllCardsModal = clearAllCardsModalEl && window.bootstrap ? new window.bootstrap.Modal(clearAllCardsModalEl) : null;
  let editingIndex = null;
  let pendingDeleteIndex = null;
  if (
    !headerForm ||
    !cardForm ||
    !cardsTableWrap ||
    !totalCards ||
    !editHeaderBtn ||
    !openAddCardBtn ||
    !submitCardBtn ||
    !clearCardsBtn ||
    !imageInput ||
    !cardModalLabel ||
    !headerModal ||
    !cardModal ||
    !deleteCardModal ||
    !clearAllCardsModal ||
    !confirmDeleteCardBtn ||
    !confirmClearAllCardsBtn
  )
    return;

  function defaults() {
    return {
      title: "Leadership Team",
      subtitle: "Meet our experienced senior staff dedicated to providing exceptional emergency care and leading our department with expertise and compassion.",
      cards: [],
    };
  }

  function readState() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : defaults();
      const base = defaults();
      return {
        title: parsed.title || base.title,
        subtitle: parsed.subtitle || base.subtitle,
        cards: Array.isArray(parsed.cards) ? parsed.cards : base.cards,
      };
    } catch {
      return defaults();
    }
  }

  function writeState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }

  function updateSubmitButton() {
    const isEditMode = editingIndex !== null;
    cardModalLabel.textContent = isEditMode ? "Edit Card" : "Add Card";
    submitCardBtn.innerHTML = isEditMode ? '<i class="bi bi-floppy"></i> Save Card' : '<i class="bi bi-plus-circle"></i> Add Card';
  }

  function resetCardFormState() {
    editingIndex = null;
    cardForm.reset();
    updateSubmitButton();
  }

  function renderHeaderFields(state) {
    headerForm.elements.pageTitle.value = state.title;
    headerForm.elements.pageSubtitle.value = state.subtitle;
  }

  function renderCards(state) {
    totalCards.textContent = String(state.cards.length);
    if (!state.cards.length) {
      cardsTableWrap.innerHTML = '<div class="table-empty">No cards yet. Add your first senior staff card.</div>';
      return;
    }

    const rows = state.cards
      .map(
        (card, index) => `
      <tr>
        <td><img class="staff-thumb" src="${card.image}" alt="${escapeHtml(card.name)}" /></td>
        <td>${escapeHtml(card.name)}</td>
        <td>${escapeHtml(card.role)}</td>
        <td class="staff-bio-cell">${escapeHtml(card.bio || "")}</td>
        <td>
          <div class="actions-cell">
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit="${index}"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${index}"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    cardsTableWrap.innerHTML = `
      <table class="staff-table">
        <thead>
          <tr><th>Image</th><th>Name</th><th>Role</th><th>Bio</th><th>Action</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function render() {
    const state = readState();
    renderHeaderFields(state);
    renderCards(state);
    updateSubmitButton();
  }

  headerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = readState();
    state.title = headerForm.elements.pageTitle.value.trim() || state.title;
    state.subtitle = headerForm.elements.pageSubtitle.value.trim() || state.subtitle;
    writeState(state);
    headerModal.hide();
    render();
  });

  cardForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = cardForm.elements.staffName.value.trim();
    const role = cardForm.elements.staffRole.value.trim();
    const bio = cardForm.elements.staffBio.value.trim();
    if (!name || !role || !bio) return;

    const state = readState();
    const imageFile = imageInput.files[0];
    let imageData = null;
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) return;
      imageData = await readFileAsDataUrl(imageFile);
    }

    if (editingIndex === null) {
      if (!imageData) return;
      state.cards.unshift({ image: imageData, name, role, bio });
    } else {
      if (editingIndex < 0 || editingIndex >= state.cards.length) return;
      state.cards[editingIndex] = {
        image: imageData || state.cards[editingIndex].image,
        name,
        role,
        bio,
      };
    }

    writeState(state);
    cardModal.hide();
    resetCardFormState();
    render();
  });

  cardsTableWrap.addEventListener("click", (event) => {
    const state = readState();
    const editBtn = event.target.closest("button[data-edit]");
    if (editBtn) {
      const index = Number(editBtn.getAttribute("data-edit"));
      if (Number.isNaN(index) || index < 0 || index >= state.cards.length) return;
      const card = state.cards[index];
      cardForm.elements.staffName.value = card.name;
      cardForm.elements.staffRole.value = card.role;
      cardForm.elements.staffBio.value = card.bio;
      imageInput.value = "";
      editingIndex = index;
      updateSubmitButton();
      cardModal.show();
      return;
    }

    const deleteBtn = event.target.closest("button[data-delete]");
    if (deleteBtn) {
      const index = Number(deleteBtn.getAttribute("data-delete"));
      if (Number.isNaN(index) || index < 0 || index >= state.cards.length) return;
      pendingDeleteIndex = index;
      deleteCardModal.show();
    }
  });

  clearCardsBtn.addEventListener("click", () => {
    clearAllCardsModal.show();
  });

  confirmDeleteCardBtn.addEventListener("click", () => {
    const state = readState();
    const index = pendingDeleteIndex;
    if (typeof index !== "number" || index < 0 || index >= state.cards.length) {
      deleteCardModal.hide();
      pendingDeleteIndex = null;
      return;
    }
    state.cards.splice(index, 1);
    if (editingIndex === index) {
      cardModal.hide();
      resetCardFormState();
    } else if (editingIndex !== null && editingIndex > index) {
      editingIndex -= 1;
    }
    writeState(state);
    deleteCardModal.hide();
    pendingDeleteIndex = null;
    render();
  });

  confirmClearAllCardsBtn.addEventListener("click", () => {
    const state = readState();
    state.cards = [];
    writeState(state);
    cardModal.hide();
    resetCardFormState();
    clearAllCardsModal.hide();
    render();
  });

  editHeaderBtn.addEventListener("click", () => {
    const state = readState();
    renderHeaderFields(state);
    headerModal.show();
  });

  openAddCardBtn.addEventListener("click", () => {
    resetCardFormState();
    cardModal.show();
  });

  cardModalEl.addEventListener("hidden.bs.modal", resetCardFormState);
  deleteCardModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDeleteIndex = null;
  });

  render();
})();
