"use strict";

/* Hero slider */
const sliderPrev = document.getElementById("sliderPrev");
if (sliderPrev) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dot");
  let current = 0;
  let sliderTimer;

  function goToSlide(n) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function startAutoplay() {
    sliderTimer = setInterval(() => goToSlide(current + 1), 5000);
  }
  function resetAutoplay() {
    clearInterval(sliderTimer);
    startAutoplay();
  }

  document.getElementById("sliderPrev").addEventListener("click", () => {
    goToSlide(current - 1);
    resetAutoplay();
  });
  document.getElementById("sliderNext").addEventListener("click", () => {
    goToSlide(current + 1);
    resetAutoplay();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      goToSlide(i);
      resetAutoplay();
    }),
  );

  startAutoplay();
}
