"use strict";

(function () {
  const storageKey = "dashboard-impact";
  const legacyKey = "dashboard-senior-staff";

  const impactHeaderForm = document.getElementById("impactHeaderForm");
  const impactCardForm = document.getElementById("impactCardForm");
  const impactTableWrap = document.getElementById("impactTableWrap");
  const totalImpactCards = document.getElementById("totalImpactCards");
  const editImpactHeaderBtn = document.getElementById("editImpactHeaderBtn");
  const openAddImpactBtn = document.getElementById("openAddImpactBtn");
  const submitImpactBtn = document.getElementById("submitImpactBtn");
  const clearImpactBtn = document.getElementById("clearImpactBtn");
  const impactCardModalLabel = document.getElementById("impactCardModalLabel");
  const impactHeaderModalEl = document.getElementById("impactHeaderModal");
  const impactCardModalEl = document.getElementById("impactCardModal");
  const deleteImpactModalEl = document.getElementById("deleteImpactModal");
  const clearAllImpactModalEl = document.getElementById("clearAllImpactModal");
  const confirmDeleteImpactBtn = document.getElementById("confirmDeleteImpactBtn");
  const confirmClearAllImpactBtn = document.getElementById("confirmClearAllImpactBtn");
  const impactHeaderModal = impactHeaderModalEl && window.bootstrap ? new window.bootstrap.Modal(impactHeaderModalEl) : null;
  const impactCardModal = impactCardModalEl && window.bootstrap ? new window.bootstrap.Modal(impactCardModalEl) : null;
  const deleteImpactModal = deleteImpactModalEl && window.bootstrap ? new window.bootstrap.Modal(deleteImpactModalEl) : null;
  const clearAllImpactModal = clearAllImpactModalEl && window.bootstrap ? new window.bootstrap.Modal(clearAllImpactModalEl) : null;
  let editingIndex = null;
  let pendingDeleteIndex = null;

  if (
    !impactHeaderForm ||
    !impactCardForm ||
    !impactTableWrap ||
    !totalImpactCards ||
    !editImpactHeaderBtn ||
    !openAddImpactBtn ||
    !submitImpactBtn ||
    !clearImpactBtn ||
    !impactCardModalLabel ||
    !impactHeaderModal ||
    !impactCardModal ||
    !deleteImpactModal ||
    !clearAllImpactModal ||
    !confirmDeleteImpactBtn ||
    !confirmClearAllImpactBtn
  )
    return;

  function defaults() {
    return {
      impactTitle: "Our Impact",
      impactSubtitle: "Key metrics showcasing our department's commitment to excellence",
      impactCards: [
        { label: "Years Experience", number: 15 },
        { label: "Patients Served", number: 50 },
        { label: "Patient Satisfaction", number: 98 },
        { label: "Emergency Care", number: 24 },
      ],
    };
  }

  function readState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const base = defaults();
        return {
          impactTitle: parsed.impactTitle || base.impactTitle,
          impactSubtitle: parsed.impactSubtitle || base.impactSubtitle,
          impactCards: Array.isArray(parsed.impactCards) ? parsed.impactCards : base.impactCards,
        };
      }

      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        const migrated = {
          impactTitle: legacy.impactTitle || defaults().impactTitle,
          impactSubtitle: legacy.impactSubtitle || defaults().impactSubtitle,
          impactCards: Array.isArray(legacy.impactCards) ? legacy.impactCards : defaults().impactCards,
        };
        localStorage.setItem(storageKey, JSON.stringify(migrated));
        return migrated;
      }
    } catch {}
    return defaults();
  }

  function writeState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function updateSubmitButton() {
    const isEditMode = editingIndex !== null;
    impactCardModalLabel.textContent = isEditMode ? "Edit Impact Card" : "Add Impact Card";
    submitImpactBtn.innerHTML = isEditMode ? '<i class="bi bi-floppy"></i> Save Impact Card' : '<i class="bi bi-plus-circle"></i> Add Impact Card';
  }

  function resetCardFormState() {
    editingIndex = null;
    impactCardForm.reset();
    updateSubmitButton();
  }

  function render() {
    const state = readState();
    impactHeaderForm.elements.impactTitle.value = state.impactTitle;
    impactHeaderForm.elements.impactSubtitle.value = state.impactSubtitle;
    totalImpactCards.textContent = String(state.impactCards.length);

    if (!state.impactCards.length) {
      impactTableWrap.innerHTML = '<div class="table-empty">No impact cards yet.</div>';
    } else {
      const rows = state.impactCards
        .map(
          (card, index) => `
        <tr>
          <td>${card.label}</td>
          <td>${card.number}</td>
          <td><div class="actions-cell">
            <button class="btn btn-sm btn-outline-primary" data-edit="${index}" type="button"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-delete="${index}" type="button"><i class="bi bi-trash3"></i></button>
          </div></td>
        </tr>
      `,
        )
        .join("");
      impactTableWrap.innerHTML = `<table class="impact-table"><thead><tr><th>Label</th><th>Number</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
    updateSubmitButton();
  }

  impactHeaderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = readState();
    state.impactTitle = impactHeaderForm.elements.impactTitle.value.trim() || state.impactTitle;
    state.impactSubtitle = impactHeaderForm.elements.impactSubtitle.value.trim() || state.impactSubtitle;
    writeState(state);
    impactHeaderModal.hide();
    render();
  });

  impactCardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const label = impactCardForm.elements.impactLabel.value.trim();
    const number = Number.parseInt(impactCardForm.elements.impactNumber.value, 10);
    if (!label || !Number.isFinite(number) || number < 0) return;
    const state = readState();
    if (editingIndex === null) state.impactCards.unshift({ label, number });
    else if (editingIndex >= 0 && editingIndex < state.impactCards.length) state.impactCards[editingIndex] = { label, number };
    writeState(state);
    impactCardModal.hide();
    resetCardFormState();
    render();
  });

  impactTableWrap.addEventListener("click", (event) => {
    const state = readState();
    const edit = event.target.closest("button[data-edit]");
    if (edit) {
      const idx = Number(edit.getAttribute("data-edit"));
      if (Number.isNaN(idx) || idx < 0 || idx >= state.impactCards.length) return;
      impactCardForm.elements.impactLabel.value = state.impactCards[idx].label;
      impactCardForm.elements.impactNumber.value = String(state.impactCards[idx].number);
      editingIndex = idx;
      updateSubmitButton();
      impactCardModal.show();
      return;
    }
    const del = event.target.closest("button[data-delete]");
    if (del) {
      const idx = Number(del.getAttribute("data-delete"));
      if (Number.isNaN(idx) || idx < 0 || idx >= state.impactCards.length) return;
      pendingDeleteIndex = idx;
      deleteImpactModal.show();
    }
  });

  clearImpactBtn.addEventListener("click", () => {
    clearAllImpactModal.show();
  });

  confirmDeleteImpactBtn.addEventListener("click", () => {
    const state = readState();
    const idx = pendingDeleteIndex;
    if (typeof idx !== "number" || idx < 0 || idx >= state.impactCards.length) {
      deleteImpactModal.hide();
      pendingDeleteIndex = null;
      return;
    }
    state.impactCards.splice(idx, 1);
    if (editingIndex === idx) {
      impactCardModal.hide();
      resetCardFormState();
    } else if (editingIndex !== null && editingIndex > idx) {
      editingIndex -= 1;
    }
    writeState(state);
    deleteImpactModal.hide();
    pendingDeleteIndex = null;
    render();
  });

  confirmClearAllImpactBtn.addEventListener("click", () => {
    const state = readState();
    state.impactCards = [];
    writeState(state);
    impactCardModal.hide();
    resetCardFormState();
    clearAllImpactModal.hide();
    render();
  });

  editImpactHeaderBtn.addEventListener("click", () => {
    const state = readState();
    impactHeaderForm.elements.impactTitle.value = state.impactTitle;
    impactHeaderForm.elements.impactSubtitle.value = state.impactSubtitle;
    impactHeaderModal.show();
  });

  openAddImpactBtn.addEventListener("click", () => {
    resetCardFormState();
    impactCardModal.show();
  });

  impactCardModalEl.addEventListener("hidden.bs.modal", resetCardFormState);
  deleteImpactModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDeleteIndex = null;
  });

  render();
})();
