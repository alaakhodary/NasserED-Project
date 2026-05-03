"use strict";

(function () {
  const storageKey = "dashboard-slider-items";

  const openAddSlideBtn = document.getElementById("openAddSlideBtn");
  const sliderForm = document.getElementById("sliderForm");
  const slidesTableWrap = document.getElementById("slidesTableWrap");
  const clearSlidesBtn = document.getElementById("clearSlidesBtn");
  const totalSlides = document.getElementById("totalSlides");
  const submitSlideBtn = document.getElementById("submitSlideBtn");
  const imageInput = document.getElementById("image");
  const slideModalLabel = document.getElementById("slideModalLabel");
  const slideModalEl = document.getElementById("slideModal");
  const deleteSlideModalEl = document.getElementById("deleteSlideModal");
  const clearAllSlidesModalEl = document.getElementById("clearAllSlidesModal");
  const confirmDeleteSlideBtn = document.getElementById("confirmDeleteSlideBtn");
  const confirmClearAllSlidesBtn = document.getElementById("confirmClearAllSlidesBtn");
  const slideModal = slideModalEl && window.bootstrap ? new window.bootstrap.Modal(slideModalEl) : null;
  const deleteSlideModal = deleteSlideModalEl && window.bootstrap ? new window.bootstrap.Modal(deleteSlideModalEl) : null;
  const clearAllSlidesModal = clearAllSlidesModalEl && window.bootstrap ? new window.bootstrap.Modal(clearAllSlidesModalEl) : null;
  let editingIndex = null;
  let pendingDeleteIndex = null;

  if (
    !openAddSlideBtn ||
    !sliderForm ||
    !slidesTableWrap ||
    !clearSlidesBtn ||
    !totalSlides ||
    !submitSlideBtn ||
    !imageInput ||
    !slideModalLabel ||
    !slideModal ||
    !deleteSlideModal ||
    !clearAllSlidesModal ||
    !confirmDeleteSlideBtn ||
    !confirmClearAllSlidesBtn
  )
    return;

  function readSlides() {
    try {
      const data = localStorage.getItem(storageKey);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeSlides(slides) {
    localStorage.setItem(storageKey, JSON.stringify(slides));
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
    slideModalLabel.textContent = isEditMode ? "Edit Slide" : "Add Slide";
    submitSlideBtn.innerHTML = isEditMode ? '<i class="bi bi-floppy"></i> Save Changes' : '<i class="bi bi-plus-circle"></i> Add Slide';
  }

  function resetFormState() {
    editingIndex = null;
    sliderForm.reset();
    sliderForm.classList.remove("was-validated");
    updateSubmitButton();
  }

  function renderStats(slides) {
    totalSlides.textContent = String(slides.length);
  }

  function renderTable(slides) {
    if (!slides.length) {
      slidesTableWrap.innerHTML = '<div class="table-empty">No slides yet. Add your first slide.</div>';
      return;
    }

    const rows = slides
      .map(
        (slide, index) => `
      <tr>
        <td><img class="slide-thumb" src="${slide.image}" alt="${escapeHtml(slide.title)}" /></td>
        <td>${escapeHtml(slide.title)}</td>
        <td>${escapeHtml(slide.subtitle)}</td>
        <td>${escapeHtml(slide.description)}</td>
        <td><code>${escapeHtml(slide.descriptionIcon)}</code></td>
        <td>${escapeHtml(slide.buttonLabel)}</td>
        <td><a href="${escapeHtml(slide.buttonRoute)}" target="_blank" rel="noopener noreferrer" class="link-info">${escapeHtml(slide.buttonRoute)}</a></td>
        <td>
          <div class="actions-cell">
            <button type="button" class="btn btn-sm btn-outline-primary" data-edit="${index}" title="Edit slide"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${index}" title="Delete slide"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    slidesTableWrap.innerHTML = `
      <table class="slides-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Description</th>
            <th>Description Icon</th>
            <th>Button Label</th>
            <th>Button Route</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function render() {
    const slides = readSlides();
    renderStats(slides);
    renderTable(slides);
  }

  function isFormValid() {
    const title = sliderForm.elements.title;
    const subtitle = sliderForm.elements.subtitle;
    const description = sliderForm.elements.description;
    const descriptionIcon = sliderForm.elements.descriptionIcon;
    const buttonLabel = sliderForm.elements.buttonLabel;
    const buttonRoute = sliderForm.elements.buttonRoute;
    const imageSelected = imageInput.files && imageInput.files.length > 0;
    const imageValid = editingIndex === null ? imageSelected : true;

    const valid =
      !!title.value.trim() &&
      !!subtitle.value.trim() &&
      !!description.value.trim() &&
      !!descriptionIcon.value.trim() &&
      !!buttonLabel.value.trim() &&
      !!buttonRoute.value.trim() &&
      imageValid;

    sliderForm.classList.toggle("was-validated", !valid);
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

  sliderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isFormValid()) return;

    const slides = readSlides();
    const imageFile = imageInput.files[0];
    let imageDataUrl = null;

    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) return;
      imageDataUrl = await readFileAsDataUrl(imageFile);
    }

    const nextSlide = {
      image: "",
      title: sliderForm.elements.title.value.trim(),
      subtitle: sliderForm.elements.subtitle.value.trim(),
      description: sliderForm.elements.description.value.trim(),
      descriptionIcon: sliderForm.elements.descriptionIcon.value.trim(),
      buttonLabel: sliderForm.elements.buttonLabel.value.trim(),
      buttonRoute: sliderForm.elements.buttonRoute.value.trim(),
    };

    if (editingIndex === null) {
      if (!imageDataUrl) return;
      nextSlide.image = imageDataUrl;
      slides.unshift(nextSlide);
    } else {
      if (editingIndex < 0 || editingIndex >= slides.length) return;
      nextSlide.image = imageDataUrl || slides[editingIndex].image;
      slides[editingIndex] = nextSlide;
    }

    writeSlides(slides);
    slideModal.hide();
    resetFormState();
    render();
  });

  openAddSlideBtn.addEventListener("click", () => {
    resetFormState();
    slideModal.show();
  });

  slidesTableWrap.addEventListener("click", (event) => {
    const slides = readSlides();
    const deleteBtn = event.target.closest("button[data-delete]");
    if (deleteBtn) {
      const index = Number(deleteBtn.getAttribute("data-delete"));
      if (Number.isNaN(index) || index < 0 || index >= slides.length) return;
      pendingDeleteIndex = index;
      deleteSlideModal.show();
      return;
    }

    const editBtn = event.target.closest("button[data-edit]");
    if (editBtn) {
      const index = Number(editBtn.getAttribute("data-edit"));
      if (Number.isNaN(index) || index < 0 || index >= slides.length) return;
      const slide = slides[index];
      sliderForm.elements.title.value = slide.title;
      sliderForm.elements.subtitle.value = slide.subtitle;
      sliderForm.elements.description.value = slide.description;
      sliderForm.elements.descriptionIcon.value = slide.descriptionIcon;
      sliderForm.elements.buttonLabel.value = slide.buttonLabel;
      sliderForm.elements.buttonRoute.value = slide.buttonRoute;
      imageInput.value = "";
      editingIndex = index;
      updateSubmitButton();
      sliderForm.classList.remove("was-validated");
      slideModal.show();
    }
  });

  clearSlidesBtn.addEventListener("click", () => {
    clearAllSlidesModal.show();
  });

  confirmDeleteSlideBtn.addEventListener("click", () => {
    const slides = readSlides();
    const index = pendingDeleteIndex;
    if (typeof index !== "number" || index < 0 || index >= slides.length) {
      deleteSlideModal.hide();
      pendingDeleteIndex = null;
      return;
    }
    slides.splice(index, 1);
    writeSlides(slides);
    if (editingIndex === index) resetFormState();
    if (editingIndex !== null && editingIndex > index) editingIndex -= 1;
    deleteSlideModal.hide();
    pendingDeleteIndex = null;
    render();
  });

  confirmClearAllSlidesBtn.addEventListener("click", () => {
    writeSlides([]);
    resetFormState();
    slideModal.hide();
    clearAllSlidesModal.hide();
    render();
  });

  deleteSlideModalEl.addEventListener("hidden.bs.modal", () => {
    pendingDeleteIndex = null;
  });

  slideModalEl.addEventListener("hidden.bs.modal", () => {
    resetFormState();
  });

  updateSubmitButton();
  render();
})();
