"use strict";

(function () {
  const storageKey = "dashboard-admins";
  const tableWrap = document.getElementById("adminsTableWrap");
  const totalAdmins = document.getElementById("totalAdmins");
  if (!tableWrap || !totalAdmins) return;

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

  function renderStats(admins) {
    totalAdmins.textContent = String(admins.length);
  }

  function renderTable(admins) {
    if (!admins.length) {
      tableWrap.innerHTML = '<div class="table-empty">No admins found.</div>';
      return;
    }

    const rows = admins
      .map(
        (admin, index) => `
      <tr>
        <td><img class="admin-photo" src="${admin.photo}" alt="${escapeHtml(admin.user)}" /></td>
        <td>${escapeHtml(admin.user)}</td>
        <td>${escapeHtml(admin.email)}</td>
        <td>${maskPassword(admin.password)}</td>
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
  render();
})();
