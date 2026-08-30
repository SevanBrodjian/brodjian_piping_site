/* Gallery grid + lightbox. Photos come from photos/photos.js (window.GALLERY_PHOTOS). */
(() => {
  "use strict";
  const photos = Array.isArray(window.GALLERY_PHOTOS) ? window.GALLERY_PHOTOS : [];
  const grid = document.getElementById("shots");
  const lb = document.getElementById("lightbox");
  if (!grid || !photos.length || !lb) return;

  const lbImg = document.getElementById("lb-img");
  const lbCount = document.getElementById("lb-count");
  let idx = 0;

  grid.hidden = false;
  photos.forEach((src, i) => {
    const btn = document.createElement("button");
    btn.className = "shot";
    btn.type = "button";
    btn.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + photos.length);
    const img = new Image();
    img.loading = "lazy";
    img.decoding = "async";
    img.src = src;
    img.alt = "";
    btn.appendChild(img);
    btn.addEventListener("click", () => open(i));
    grid.appendChild(btn);
  });

  function show(i) {
    idx = (i + photos.length) % photos.length;
    lbImg.src = photos[idx];
    lbImg.alt = "Work photo " + (idx + 1) + " of " + photos.length;
    lbCount.textContent = (idx + 1) + " / " + photos.length;
  }
  function open(i) {
    show(i);
    lb.showModal();
  }

  document.getElementById("lb-prev").addEventListener("click", () => show(idx - 1));
  document.getElementById("lb-next").addEventListener("click", () => show(idx + 1));
  document.getElementById("lb-close").addEventListener("click", () => lb.close());

  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) { lb.close(); return; }
    if (e.detail === 0) return; /* keyboard activation, not a pointer click */
    const r = lbImg.getBoundingClientRect();
    const outsideImg = e.clientY < r.top || e.clientY > r.bottom;
    if (outsideImg && !e.target.closest("button")) lb.close();
  });
})();
