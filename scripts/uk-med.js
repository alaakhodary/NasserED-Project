(function () {
  const ukMedTitleImage = document.getElementById("ukMedTitleImage");
  if (!ukMedTitleImage) return;

  const syncUkMedImage = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    ukMedTitleImage.src = isDark ? ukMedTitleImage.dataset.darkSrc : ukMedTitleImage.dataset.lightSrc;
  };

  syncUkMedImage();
  new MutationObserver(syncUkMedImage).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
