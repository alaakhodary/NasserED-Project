"use strict";

(function () {
  const storageKey = "dashboard-admins";

  const tableWrap = document.getElementById("adminsTableWrap");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const totalAdmins = document.getElementById("totalAdmins");
  const openAddAdminBtn = document.getElementById("openAddAdminBtn");
  const editAdminForm = document.getElementById("editAdminForm");
  const editUserInput = document.getElementById("editUser");
  const editPasswordInput = document.getElementById("editPassword");
  const editEmailInput = document.getElementById("editEmail");
  const editPhotoInput = document.getElementById("editPhoto");
  const toggleEditPasswordBtn = document.getElementById("toggleEditPasswordBtn");
  const saveAdminModalBtn = document.getElementById("saveAdminModalBtn");
  const editAdminModalLabel = document.getElementById("editAdminModalLabel");
  const deleteAdminModalEl = document.getElementById("deleteAdminModal");
  const confirmDeleteAdminBtn = document.getElementById("confirmDeleteAdminBtn");
  const clearAllAdminsModalEl = document.getElementById("clearAllAdminsModal");
  const confirmClearAllAdminsBtn = document.getElementById("confirmClearAllAdminsBtn");
  const editModalEl = document.getElementById("editAdminModal");
  const editModal = editModalEl && window.bootstrap ? new window.bootstrap.Modal(editModalEl) : null;
  const deleteModal = deleteAdminModalEl && window.bootstrap ? new window.bootstrap.Modal(deleteAdminModalEl) : null;
  const clearAllModal = clearAllAdminsModalEl && window.bootstrap ? new window.bootstrap.Modal(clearAllAdminsModalEl) : null;
  let editingIndex = null;
  let pendingDeleteIndex = null;

  if (
    !tableWrap ||
    !clearAllBtn ||
    !totalAdmins ||
    !openAddAdminBtn ||
    !editAdminForm ||
    !editUserInput ||
    !editPasswordInput ||
    !editEmailInput ||
    !editPhotoInput ||
    !toggleEditPasswordBtn ||
    !saveAdminModalBtn ||
    !editAdminModalLabel ||
    !editModal ||
    !deleteModal ||
    !confirmDeleteAdminBtn ||
    !clearAllModal ||
    !confirmClearAllAdminsBtn
  )
    return;

  function readAdmins() {
    try {
      const data = localStorage.getItem(storageKey);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeAdmins(admins) {
    localStorage.setItem(storageKey, JSON.stringify(admins));
  }

  function maskPassword(password) {
    return "*".repeat(Math.max(String(password).length, 8));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function resetEditState() {
    editingIndex = null;
    editAdminForm.reset();
    editAdminForm.classList.remove("was-validated");
    editPasswordInput.type = "password";
    toggleEditPasswordBtn.setAttribute("aria-label", "Show password");
    const icon = toggleEditPasswordBtn.querySelector("i");
    if (icon) icon.className = "bi bi-eye";
    editAdminModalLabel.textContent = "Edit Admin";
    saveAdminModalBtn.innerHTML = '<i class="bi bi-floppy"></i> Save Changes';
  }

  function renderStats(admins) {
    totalAdmins.textContent = String(admins.length);
  }

  function renderTable(admins) {
    if (!admins.length) {
      tableWrap.innerHTML = '<div class="table-empty">No admins yet. Add your first admin.</div>';
      return;
    }

    const rows = admins
      .map(
        (admin, index) => `
      <tr>
        <td><img class="admin-photo" src="${admin.photo}" alt="${escapeHtml(admin.user)}" /></td>
        <td>${escapeHtml(admin.user)}</td>
        <td>${escapeHtml(admin.email)}</td>
        <td>
          <div class="password-cell">
            <span data-pass-text="${index}" data-visible="false">${maskPassword(admin.password)}</span>
            <button type="button" class="btn btn-sm btn-outline-info" data-toggle-pass="${index}" title="Show password">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
        <td>
          <div class="actions-cell">
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit="${index}" title="Edit admin"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${index}" title="Delete admin"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    tableWrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>User</th>
            <th>Email</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function render() {
    const admins = readAdmins();
    renderStats(admins);
    renderTable(admins);
  }

  function isEditFormValid() {
    const photoSelected = editPhotoInput.files && editPhotoInput.files.length > 0;
    const photoValid = editingIndex === null ? photoSelected : true;
    const valid = !!editUserInput.value.trim() && editPasswordInput.value.trim().length >= 8 && editEmailInput.validity.valid && photoValid;
    editAdminForm.classList.toggle("was-validated", !valid);
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

  editAdminForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isEditFormValid()) return;

    const admins = readAdmins();
    const photoFile = editPhotoInput.files[0];
    let photoDataUrl = null;

    if (photoFile) {
      if (!photoFile.type.startsWith("image/")) return;
      photoDataUrl = await readFileAsDataUrl(photoFile);
    }

    const nextAdmin = {
      user: editUserInput.value.trim(),
      password: editPasswordInput.value.trim(),
      email: editEmailInput.value.trim(),
      photo: "",
    };

    if (editingIndex === null) {
      if (!photoDataUrl) return;
      nextAdmin.photo = photoDataUrl;
      admins.unshift(nextAdmin);
    } else {
      if (editingIndex < 0 || editingIndex >= admins.length) return;
      nextAdmin.photo = photoDataUrl || admins[editingIndex].photo;
      admins[editingIndex] = nextAdmin;
    }

    writeAdmins(admins);
    editModal.hide();
    resetEditState();
    render();
  });

  tableWrap.addEventListener("click", (event) => {
    const admins = readAdmins();
    const deleteBtn = event.target.closest("button[data-delete]");
    if (deleteBtn) {
      const index = Number(deleteBtn.getAttribute("data-delete"));
      if (Number.isNaN(index) || index < 0 || index >= admins.length) return;
      pendingDeleteIndex = index;
      deleteModal.show();
      return;
    }

    const editBtn = event.target.closest("button[data-edit]");
    if (editBtn) {
      const index = Number(editBtn.getAttribute("data-edit"));
      if (Number.isNaN(index) || index < 0 || index >= admins.length) return;
      const admin = admins[index];
      editUserInput.value = admin.user;
      editPasswordInput.value = admin.password;
      editEmailInput.value = admin.email;
      editPhotoInput.value = "";
      editingIndex = index;
      editAdminModalLabel.textContent = "Edit Admin";
      saveAdminModalBtn.innerHTML = '<i class="bi bi-floppy"></i> Save Changes';
      editAdminForm.classList.remove("was-validated");
      editModal.show();
      return;
    }

    const togglePassBtn = event.target.closest("button[data-toggle-pass]");
    if (togglePassBtn) {
      const index = Number(togglePassBtn.getAttribute("data-toggle-pass"));
      if (Number.isNaN(index) || index < 0 || index >= admins.length) return;
      const passLabel = tableWrap.querySelector(`span[data-pass-text="${index}"]`);
      if (!passLabel) return;
      const visible = passLabel.getAttribute("data-visible") === "true";
      passLabel.setAttribute("data-visible", String(!visible));
      passLabel.textContent = visible ? maskPassword(admins[index].password) : admins[index].password;
      const icon = togglePassBtn.querySelector("i");
      if (icon) icon.className = visible ? "bi bi-eye" : "bi bi-eye-slash";
    }
  });

  clearAllBtn.addEventListener("click", () => {
    clearAllModal.show();
  });

  confirmDeleteAdminBtn.addEventListener("click", () => {
    const admins = readAdmins();
    const index = pendingDeleteIndex;
    if (index === null || Number.isNaN(index) || index < 0 || index >= admins.length) {
      deleteModal.hide();
      pendingDeleteIndex = null;
      return;
    }
    admins.splice(index, 1);
    writeAdmins(admins);
    if (editingIndex === index) {
      editModal.hide();
      resetEditState();
    }
    if (editingIndex !== null && editingIndex > index) editingIndex -= 1;
    pendingDeleteIndex = null;
    deleteModal.hide();
    render();
  });

  confirmClearAllAdminsBtn.addEventListener("click", () => {
    writeAdmins([]);
    editModal.hide();
    resetEditState();
    clearAllModal.hide();
    render();
  });

  openAddAdminBtn.addEventListener("click", () => {
    resetEditState();
    editAdminModalLabel.textContent = "Add Admin";
    saveAdminModalBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Add Admin';
    editModal.show();
  });

  toggleEditPasswordBtn.addEventListener("click", () => {
    const isHidden = editPasswordInput.type === "password";
    editPasswordInput.type = isHidden ? "text" : "password";
    toggleEditPasswordBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    const icon = toggleEditPasswordBtn.querySelector("i");
    if (icon) icon.className = isHidden ? "bi bi-eye-slash" : "bi bi-eye";
  });

  editModalEl.addEventListener("hidden.bs.modal", resetEditState);
  deleteAdminModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDeleteIndex = null;
  });
  render();
})();
