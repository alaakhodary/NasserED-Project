"use strict";

(function () {
  const STORAGE_KEY = "dashboard-theme";
  const root = document.documentElement;

  function logoPath(theme) {
    return "../../img/logo-dark.webp";
  }

  function apply(theme) {
    if (theme !== "light" && theme !== "dark") theme = "dark";
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }

    var logoImgs = document.querySelectorAll(".sidebar .brand img[data-dashboard-logo]");
    if (!logoImgs.length) {
      logoImgs = document.querySelectorAll(".sidebar .brand img");
    }
    logoImgs.forEach(function (img) {
      img.src = logoPath(theme);
    });

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var icon = btn.querySelector("i");
      if (icon) {
        icon.className = theme === "light" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
      }
      btn.title = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
      btn.setAttribute("aria-label", btn.title);
      var label = btn.querySelector(".theme-toggle-label");
      if (label) label.textContent = theme === "light" ? "Light" : "Dark";
    });
  }

  function readStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "light" || v === "dark") return v;
    } catch {
      /* ignore */
    }
    return "dark";
  }

  apply(readStored());

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-theme-toggle]");
    if (!btn) return;
    event.preventDefault();
    var current = root.getAttribute("data-theme") || "dark";
    apply(current === "dark" ? "light" : "dark");
  });
})();
