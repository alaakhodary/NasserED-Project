/**
 * Senior Staff — stat numbers count-up when `.staff-stats` enters the viewport (once).
 */
(function () {
  "use strict";

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function runCounter(el, durationMs) {
    const raw = el.getAttribute("data-target");
    const suffix = el.getAttribute("data-suffix") ?? "";
    const target = raw == null ? NaN : Number.parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(target) || target < 0) return;

    const start = performance.now();
    const from = 0;

    function frame(now) {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(p);
      const value = Math.round(from + (target - from) * eased);
      el.textContent = String(value) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = String(target) + suffix;
    }

    requestAnimationFrame(frame);
  }

  function initStaffStatCounters() {
    const root = document.querySelector(".staff-stats");
    if (!root) return;

    const counters = root.querySelectorAll(".js-stat-counter");
    if (!counters.length) return;

    let started = false;
    const duration = 1200;
    const stagger = 110;

    function startAll() {
      if (started) return;
      started = true;
      counters.forEach((el, i) => {
        window.setTimeout(() => runCounter(el, duration), i * stagger);
      });
    }

    if (!("IntersectionObserver" in window)) {
      startAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            startAll();
            io.disconnect();
          }
        });
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    io.observe(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStaffStatCounters, { once: true });
  } else {
    initStaffStatCounters();
  }
})();
