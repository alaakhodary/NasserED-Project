"use strict";

(function () {
  const STORAGE_KEY = "dashboard-site-settings-v1";
  const DEFAULTS = {
    webSiteName: "NasserED",
    departmentLogo: "",
    browserLogo: "img/logo.webp",
    descriptionBrand: "NMC EMERGENCY DEPARTMENT",
    contactEmail: "Qandil@emnasser.com",
    contactPhone: "+1 800 555 1234",
    contactAddress: "Palestine, Gaza",
    sponsoredLabel: "UK-MED",
    sponsoredUrl: "https://www.uk-med.org/gaza-crisis-appeal/",
    resources: [
      { label: "Clinical Guidelines", url: "" },
      { label: "Drug Database", url: "" },
      { label: "Research Library", url: "" },
      { label: "Case Studies", url: "" },
    ],
    specialties: [
      { label: "Emergency Medicine", url: "" },
      { label: "Cardiology", url: "" },
      { label: "Neurology", url: "" },
      { label: "Diagnostics", url: "" },
    ],
    socials: [],
  };

  const form = document.getElementById("siteSettingsForm");
  const saveBtn = document.getElementById("saveSiteSettingsBtn");
  const resetBtn = document.getElementById("resetSiteSettingsBtn");
  const addSocialBtn = document.getElementById("addSocialBtn");
  const addResourceBtn = document.getElementById("addResourceBtn");
  const addSpecialtyBtn = document.getElementById("addSpecialtyBtn");
  const socialListWrap = document.getElementById("socialListWrap");
  const resourceListWrap = document.getElementById("resourceListWrap");
  const specialtyListWrap = document.getElementById("specialtyListWrap");
  const socialForm = document.getElementById("socialForm");
  const resourceForm = document.getElementById("resourceForm");
  const specialtyForm = document.getElementById("specialtyForm");
  const socialModalEl = document.getElementById("socialModal");
  const resourceModalEl = document.getElementById("resourceModal");
  const specialtyModalEl = document.getElementById("specialtyModal");
  const socialModalLabel = document.getElementById("socialModalLabel");
  const resourceModalLabel = document.getElementById("resourceModalLabel");
  const specialtyModalLabel = document.getElementById("specialtyModalLabel");
  const saveSocialBtn = document.getElementById("saveSocialBtn");
  const saveResourceBtn = document.getElementById("saveResourceBtn");
  const saveSpecialtyBtn = document.getElementById("saveSpecialtyBtn");
  const deleteSettingsItemModalEl = document.getElementById("deleteSettingsItemModal");
  const deleteSettingsItemMessage = document.getElementById("deleteSettingsItemMessage");
  const confirmDeleteSettingsItemBtn = document.getElementById("confirmDeleteSettingsItemBtn");
  const departmentLogoFileInput = document.getElementById("departmentLogoFile");
  const settingsTabButtons = Array.from(document.querySelectorAll("[data-settings-tab]"));
  const settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
  const socialModal = socialModalEl && window.bootstrap ? new window.bootstrap.Modal(socialModalEl) : null;
  const resourceModal = resourceModalEl && window.bootstrap ? new window.bootstrap.Modal(resourceModalEl) : null;
  const specialtyModal = specialtyModalEl && window.bootstrap ? new window.bootstrap.Modal(specialtyModalEl) : null;
  const deleteSettingsItemModal =
    deleteSettingsItemModalEl && window.bootstrap ? new window.bootstrap.Modal(deleteSettingsItemModalEl) : null;
  let editingSocialIndex = null;
  let editingResourceIndex = null;
  let editingSpecialtyIndex = null;
  let pendingDelete = null;

  if (
    !form ||
    !saveBtn ||
    !resetBtn ||
    !addSocialBtn ||
    !addResourceBtn ||
    !addSpecialtyBtn ||
    !socialListWrap ||
    !resourceListWrap ||
    !specialtyListWrap ||
    !socialForm ||
    !resourceForm ||
    !specialtyForm ||
    !socialModal ||
    !resourceModal ||
    !specialtyModal ||
    !socialModalLabel ||
    !resourceModalLabel ||
    !specialtyModalLabel ||
    !saveSocialBtn ||
    !saveResourceBtn ||
    !saveSpecialtyBtn ||
    !deleteSettingsItemModal ||
    !deleteSettingsItemMessage ||
    !confirmDeleteSettingsItemBtn
  )
    return;

  function initSettingsMenu() {
    if (!settingsTabButtons.length || !settingsPanels.length) return;
    const activate = (key) => {
      settingsTabButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-settings-tab") === key));
      settingsPanels.forEach((panel) => panel.classList.toggle("active", panel.getAttribute("data-settings-panel") === key));
    };
    settingsTabButtons.forEach((btn) => {
      btn.addEventListener("click", () => activate(btn.getAttribute("data-settings-tab")));
    });
    const first = settingsTabButtons[0]?.getAttribute("data-settings-tab");
    if (first) activate(first);
  }

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        ...DEFAULTS,
        ...parsed,
        resources: normalizeResources(parsed),
        specialties: normalizeSpecialties(parsed),
        socials: Array.isArray(parsed?.socials) ? parsed.socials : [],
      };
    } catch {
      return {
        ...DEFAULTS,
        resources: DEFAULTS.resources.map((item) => ({ ...item })),
        specialties: DEFAULTS.specialties.map((item) => ({ ...item })),
        socials: [],
      };
    }
  }

  function write(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("dashboard-site-settings-updated", {
        detail: { key: STORAGE_KEY },
      }),
    );
  }

  function esc(v) {
    return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function openDeleteConfirm(type, index) {
    pendingDelete = { type, index };
    deleteSettingsItemMessage.textContent = `Are you sure you want to delete this ${type}?`;
    deleteSettingsItemModal.show();
  }

  function normalizeResources(parsed) {
    if (Array.isArray(parsed?.resources)) {
      return parsed.resources
        .map((item) => ({
          label: String(item?.label || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.label || item.url);
    }
    const legacy = [
      {
        label: parsed?.resourceClinicalGuidelinesLabel || DEFAULTS.resources[0].label,
        url: parsed?.resourceClinicalGuidelinesUrl || "",
      },
      {
        label: parsed?.resourceDrugDatabaseLabel || DEFAULTS.resources[1].label,
        url: parsed?.resourceDrugDatabaseUrl || "",
      },
      {
        label: parsed?.resourceResearchLibraryLabel || DEFAULTS.resources[2].label,
        url: parsed?.resourceResearchLibraryUrl || "",
      },
      {
        label: parsed?.resourceCaseStudiesLabel || DEFAULTS.resources[3].label,
        url: parsed?.resourceCaseStudiesUrl || "",
      },
    ];
    return legacy.filter((item) => item.label || item.url);
  }

  function normalizeSpecialties(parsed) {
    if (Array.isArray(parsed?.specialties)) {
      return parsed.specialties
        .map((item) => ({
          label: String(item?.label || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.label || item.url);
    }
    return DEFAULTS.specialties.map((item) => ({ ...item }));
  }

  function setFormValues(settings) {
    form.elements.webSiteName.value = settings.webSiteName || "";
    form.elements.departmentLogo.value = settings.departmentLogo || "";
    form.elements.browserLogo.value = settings.browserLogo || "";
    form.elements.descriptionBrand.value = settings.descriptionBrand || "";
    form.elements.contactEmail.value = settings.contactEmail || "";
    form.elements.contactPhone.value = settings.contactPhone || "";
    form.elements.contactAddress.value = settings.contactAddress || "";
    form.elements.sponsoredLabel.value = settings.sponsoredLabel || "";
    form.elements.sponsoredUrl.value = settings.sponsoredUrl || "";
  }

  function getFormValues() {
    return {
      webSiteName: form.elements.webSiteName.value.trim(),
      departmentLogo: form.elements.departmentLogo.value.trim(),
      browserLogo: form.elements.browserLogo.value.trim(),
      descriptionBrand: form.elements.descriptionBrand.value.trim(),
      contactEmail: form.elements.contactEmail.value.trim(),
      contactPhone: form.elements.contactPhone.value.trim(),
      contactAddress: form.elements.contactAddress.value.trim(),
      sponsoredLabel: form.elements.sponsoredLabel.value.trim(),
      sponsoredUrl: form.elements.sponsoredUrl.value.trim(),
    };
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });
  }

  function renderSocials(settings) {
    if (!settings.socials.length) {
      socialListWrap.innerHTML = '<div class="table-empty">No social media items yet.</div>';
      return;
    }
    const rows = settings.socials
      .map(
        (item, index) => `
      <tr>
        <td>${esc(item.name)}</td>
        <td><code>${esc(item.icon)}</code></td>
        <td><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" class="link-info">${esc(item.url)}</a></td>
        <td class="text-end">
          <div class="actions-cell justify-content-end">
            <button class="btn btn-sm btn-outline-primary" data-edit-social="${index}" type="button"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-delete-social="${index}" type="button"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
    socialListWrap.innerHTML = `<table class="research-table"><thead><tr><th>Name</th><th>Icon</th><th>URL</th><th class="text-end">Action</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderResources(settings) {
    if (!settings.resources.length) {
      resourceListWrap.innerHTML = '<div class="table-empty">No resource items yet.</div>';
      return;
    }
    const rows = settings.resources
      .map(
        (item, index) => `
      <tr>
        <td>${esc(item.label)}</td>
        <td><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" class="link-info">${esc(item.url)}</a></td>
        <td class="text-end">
          <div class="actions-cell justify-content-end">
            <button class="btn btn-sm btn-outline-primary" data-edit-resource="${index}" type="button"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-delete-resource="${index}" type="button"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
    resourceListWrap.innerHTML = `<table class="research-table"><thead><tr><th>Label</th><th>URL</th><th class="text-end">Action</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderSpecialties(settings) {
    if (!settings.specialties.length) {
      specialtyListWrap.innerHTML = '<div class="table-empty">No specialty items yet.</div>';
      return;
    }
    const rows = settings.specialties
      .map(
        (item, index) => `
      <tr>
        <td>${esc(item.label)}</td>
        <td><a href="${esc(item.url)}" class="link-info">${esc(item.url)}</a></td>
        <td class="text-end">
          <div class="actions-cell justify-content-end">
            <button class="btn btn-sm btn-outline-primary" data-edit-specialty="${index}" type="button"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-delete-specialty="${index}" type="button"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
    specialtyListWrap.innerHTML = `<table class="research-table"><thead><tr><th>Label</th><th>URL</th><th class="text-end">Action</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function render() {
    const settings = read();
    setFormValues(settings);
    renderResources(settings);
    renderSpecialties(settings);
    renderSocials(settings);
  }

  function setSavedState() {
    saveBtn.classList.add("btn-success");
    saveBtn.classList.remove("btn-primary");
    saveBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Saved';
    setTimeout(() => {
      saveBtn.classList.remove("btn-success");
      saveBtn.classList.add("btn-primary");
      saveBtn.innerHTML = '<i class="bi bi-floppy"></i> Save';
    }, 1200);
  }

  saveBtn.addEventListener("click", async () => {
    const current = read();
    const next = { ...current, ...getFormValues(), resources: current.resources, specialties: current.specialties };
    const selectedLogoFile = departmentLogoFileInput && departmentLogoFileInput.files ? departmentLogoFileInput.files[0] : null;
    if (selectedLogoFile) {
      try {
        next.departmentLogo = await readFileAsDataUrl(selectedLogoFile);
      } catch {
        // Keep existing logo if file read fails.
      }
    }
    write(next);
    if (departmentLogoFileInput) departmentLogoFileInput.value = "";
    setSavedState();
    render();
  });

  resetBtn.addEventListener("click", () => {
    write({
      ...DEFAULTS,
      resources: DEFAULTS.resources.map((item) => ({ ...item })),
      specialties: DEFAULTS.specialties.map((item) => ({ ...item })),
      socials: [],
    });
    if (departmentLogoFileInput) departmentLogoFileInput.value = "";
    render();
  });

  addSocialBtn.addEventListener("click", () => {
    editingSocialIndex = null;
    socialForm.reset();
    socialForm.classList.remove("was-validated");
    socialModalLabel.textContent = "Add Social Media";
    saveSocialBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Save';
    socialModal.show();
  });

  addResourceBtn.addEventListener("click", () => {
    editingResourceIndex = null;
    resourceForm.reset();
    resourceForm.classList.remove("was-validated");
    resourceModalLabel.textContent = "Add Resource";
    saveResourceBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Save';
    resourceModal.show();
  });

  addSpecialtyBtn.addEventListener("click", () => {
    editingSpecialtyIndex = null;
    specialtyForm.reset();
    specialtyForm.classList.remove("was-validated");
    specialtyModalLabel.textContent = "Add Specialty";
    saveSpecialtyBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Save';
    specialtyModal.show();
  });

  socialListWrap.addEventListener("click", (event) => {
    const settings = read();
    const del = event.target.closest("[data-delete-social]");
    if (del) {
      const idx = Number(del.getAttribute("data-delete-social"));
      if (Number.isNaN(idx) || idx < 0 || idx >= settings.socials.length) return;
      openDeleteConfirm("social media item", idx);
      return;
    }
    const edit = event.target.closest("[data-edit-social]");
    if (!edit) return;
    const idx = Number(edit.getAttribute("data-edit-social"));
    if (Number.isNaN(idx) || idx < 0 || idx >= settings.socials.length) return;
    const item = settings.socials[idx];
    editingSocialIndex = idx;
    socialForm.elements.socialName.value = item.name;
    socialForm.elements.socialIcon.value = item.icon;
    socialForm.elements.socialUrl.value = item.url;
    socialForm.classList.remove("was-validated");
    socialModalLabel.textContent = "Edit Social Media";
    saveSocialBtn.innerHTML = '<i class="bi bi-floppy"></i> Save Changes';
    socialModal.show();
  });

  resourceListWrap.addEventListener("click", (event) => {
    const settings = read();
    const del = event.target.closest("[data-delete-resource]");
    if (del) {
      const idx = Number(del.getAttribute("data-delete-resource"));
      if (Number.isNaN(idx) || idx < 0 || idx >= settings.resources.length) return;
      openDeleteConfirm("resource", idx);
      return;
    }
    const edit = event.target.closest("[data-edit-resource]");
    if (!edit) return;
    const idx = Number(edit.getAttribute("data-edit-resource"));
    if (Number.isNaN(idx) || idx < 0 || idx >= settings.resources.length) return;
    const item = settings.resources[idx];
    editingResourceIndex = idx;
    resourceForm.elements.resourceLabel.value = item.label;
    resourceForm.elements.resourceUrl.value = item.url;
    resourceForm.classList.remove("was-validated");
    resourceModalLabel.textContent = "Edit Resource";
    saveResourceBtn.innerHTML = '<i class="bi bi-floppy"></i> Save Changes';
    resourceModal.show();
  });

  specialtyListWrap.addEventListener("click", (event) => {
    const settings = read();
    const del = event.target.closest("[data-delete-specialty]");
    if (del) {
      const idx = Number(del.getAttribute("data-delete-specialty"));
      if (Number.isNaN(idx) || idx < 0 || idx >= settings.specialties.length) return;
      openDeleteConfirm("specialty", idx);
      return;
    }
    const edit = event.target.closest("[data-edit-specialty]");
    if (!edit) return;
    const idx = Number(edit.getAttribute("data-edit-specialty"));
    if (Number.isNaN(idx) || idx < 0 || idx >= settings.specialties.length) return;
    const item = settings.specialties[idx];
    editingSpecialtyIndex = idx;
    specialtyForm.elements.specialtyLabel.value = item.label;
    specialtyForm.elements.specialtyUrl.value = item.url;
    specialtyForm.classList.remove("was-validated");
    specialtyModalLabel.textContent = "Edit Specialty";
    saveSpecialtyBtn.innerHTML = '<i class="bi bi-floppy"></i> Save Changes';
    specialtyModal.show();
  });

  socialForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = socialForm.elements.socialName.value.trim();
    const icon = socialForm.elements.socialIcon.value.trim();
    const url = socialForm.elements.socialUrl.value.trim();
    let valid = !!name && !!icon && !!url;
    try {
      new URL(url);
    } catch {
      valid = false;
    }
    socialForm.classList.toggle("was-validated", !valid);
    if (!valid) return;
    const settings = read();
    const entry = { name, icon, url };
    if (editingSocialIndex === null) settings.socials.push(entry);
    else settings.socials[editingSocialIndex] = entry;
    write(settings);
    socialModal.hide();
    render();
  });

  resourceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const label = resourceForm.elements.resourceLabel.value.trim();
    const url = resourceForm.elements.resourceUrl.value.trim();
    let valid = !!label && !!url;
    try {
      new URL(url);
    } catch {
      valid = false;
    }
    resourceForm.classList.toggle("was-validated", !valid);
    if (!valid) return;
    const settings = read();
    const entry = { label, url };
    if (editingResourceIndex === null) settings.resources.push(entry);
    else settings.resources[editingResourceIndex] = entry;
    write(settings);
    resourceModal.hide();
    render();
  });

  specialtyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const label = specialtyForm.elements.specialtyLabel.value.trim();
    const url = specialtyForm.elements.specialtyUrl.value.trim();
    const valid = !!label && !!url;
    specialtyForm.classList.toggle("was-validated", !valid);
    if (!valid) return;
    const settings = read();
    const entry = { label, url };
    if (editingSpecialtyIndex === null) settings.specialties.push(entry);
    else settings.specialties[editingSpecialtyIndex] = entry;
    write(settings);
    specialtyModal.hide();
    render();
  });

  confirmDeleteSettingsItemBtn.addEventListener("click", () => {
    if (!pendingDelete) {
      deleteSettingsItemModal.hide();
      return;
    }
    const settings = read();
    const index = Number(pendingDelete.index);
    if (Number.isNaN(index) || index < 0) {
      pendingDelete = null;
      deleteSettingsItemModal.hide();
      return;
    }
    if (pendingDelete.type === "social media item") {
      if (index >= settings.socials.length) return;
      settings.socials.splice(index, 1);
    } else if (pendingDelete.type === "resource") {
      if (index >= settings.resources.length) return;
      settings.resources.splice(index, 1);
    } else if (pendingDelete.type === "specialty") {
      if (index >= settings.specialties.length) return;
      settings.specialties.splice(index, 1);
    } else {
      return;
    }
    write(settings);
    pendingDelete = null;
    deleteSettingsItemModal.hide();
    render();
  });

  deleteSettingsItemModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDelete = null;
  });

  initSettingsMenu();
  render();
})();
