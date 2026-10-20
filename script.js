/* ================= SCROLL REVEAL ================= */
// Sections are NOT observed (very tall sections never reach the threshold); their children are.
const animatedElements = document.querySelectorAll(
  ".education-item, .service, .project, .business-card-project, .brand-identity-project, .skills-grid span, .section-title, .projects-category-title",
);

const animationObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        animationObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

animatedElements.forEach((el) => {
  el.classList.add("animate-on-scroll");
  animationObserver.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ================= DARK / LIGHT MODE ================= */
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector("i");

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  themeIcon.classList.toggle("fa-sun", isDark);
  themeIcon.classList.toggle("fa-moon", !isDark);
}

themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark-mode");
  applyTheme(isDark);
  try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (e) {}
});

try { if (localStorage.getItem("theme") === "dark") applyTheme(true); } catch (e) {}

/* ================= ACTIVE NAVIGATION ================= */
const navLinks = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("section[id]");

function updateActiveNav() {
  const pos = window.scrollY + 150;
  let current = "home";
  sections.forEach((s) => {
    if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) current = s.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}
window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

/* ================= LIGHTBOX ================= */
const lightbox = document.getElementById("image-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightbox = document.getElementById("lightbox-close");
const prevButton = document.getElementById("lightbox-prev");
const nextButton = document.getElementById("lightbox-next");
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");
const zoomResetButton = document.getElementById("zoom-reset");

const allProjectImages = Array.from(
  document.querySelectorAll(".project-image img, .business-card-image img, .brand-identity-image img"),
);

let currentImageGroup = [];
let currentImageIndex = 0;
let zoomLevel = 1, translateX = 0, translateY = 0;
let isDragging = false, startX = 0, startY = 0, lastTouchDistance = 0;

function updateImageTransform() {
  lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
}
function resetImageTransform() {
  zoomLevel = 1; translateX = 0; translateY = 0;
  updateImageTransform();
}
function openLightbox(src) {
  lightboxImage.src = src;
  resetImageTransform();
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeImageLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
  resetImageTransform();
}

allProjectImages.forEach((image) => {
  image.addEventListener("click", (event) => {
    event.stopPropagation();
    const brandProject = image.closest(".brand-identity-project");
    if (brandProject) {
      currentImageGroup = Array.from(brandProject.querySelectorAll(".brand-identity-image img"));
    } else {
      currentImageGroup = allProjectImages.filter(
        (img) => !img.closest(".brand-identity-project") && !img.closest(".project.hide"),
      );
    }
    currentImageIndex = currentImageGroup.indexOf(image);
    openLightbox(image.src);
  });
});

closeLightbox.addEventListener("click", closeImageLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeImageLightbox(); });

nextButton.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentImageGroup.length) return;
  currentImageIndex = (currentImageIndex + 1) % currentImageGroup.length;
  openLightbox(currentImageGroup[currentImageIndex].src);
});
prevButton.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentImageGroup.length) return;
  currentImageIndex = (currentImageIndex - 1 + currentImageGroup.length) % currentImageGroup.length;
  openLightbox(currentImageGroup[currentImageIndex].src);
});

function zoomImage(amount, cx = 0, cy = 0) {
  const oldZoom = zoomLevel;
  zoomLevel = Math.min(4, Math.max(1, zoomLevel + amount));
  if (zoomLevel === 1) { translateX = 0; translateY = 0; updateImageTransform(); return; }
  const ratio = zoomLevel / oldZoom;
  translateX = cx - (cx - translateX) * ratio;
  translateY = cy - (cy - translateY) * ratio;
  updateImageTransform();
}

zoomInButton.addEventListener("click", (e) => { e.stopPropagation(); zoomImage(0.25); });
zoomOutButton.addEventListener("click", (e) => { e.stopPropagation(); zoomImage(-0.25); });
zoomResetButton.addEventListener("click", (e) => { e.stopPropagation(); resetImageTransform(); });

lightboxImage.addEventListener("wheel", (e) => {
  e.preventDefault();
  const r = lightboxImage.getBoundingClientRect();
  zoomImage(e.deltaY < 0 ? 0.2 : -0.2, e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
});

lightboxImage.addEventListener("mousedown", (e) => {
  if (zoomLevel <= 1) return;
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - translateX;
  startY = e.clientY - translateY;
  lightboxImage.style.cursor = "grabbing";
});
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  translateX = e.clientX - startX;
  translateY = e.clientY - startY;
  updateImageTransform();
});
document.addEventListener("mouseup", () => {
  isDragging = false;
  lightboxImage.style.cursor = "grab";
});

const touchDistance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

lightboxImage.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (e.touches.length === 2) { lastTouchDistance = touchDistance(e.touches[0], e.touches[1]); return; }
  if (e.touches.length === 1 && zoomLevel > 1) {
    startX = e.touches[0].clientX - translateX;
    startY = e.touches[0].clientY - translateY;
  }
}, { passive: false });

lightboxImage.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (e.touches.length === 2) {
    const d = touchDistance(e.touches[0], e.touches[1]);
    if (lastTouchDistance > 0) {
      zoomLevel = Math.min(4, Math.max(1, zoomLevel + (d - lastTouchDistance) * 0.005));
      if (zoomLevel === 1) { translateX = 0; translateY = 0; }
      updateImageTransform();
    }
    lastTouchDistance = d;
    return;
  }
  if (e.touches.length === 1 && zoomLevel > 1) {
    translateX = e.touches[0].clientX - startX;
    translateY = e.touches[0].clientY - startY;
    updateImageTransform();
  }
}, { passive: false });

lightboxImage.addEventListener("touchend", () => {
  if (zoomLevel === 1) { translateX = 0; translateY = 0; updateImageTransform(); }
  lastTouchDistance = 0;
}, { passive: false });

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;
  if (e.key === "Escape") closeImageLightbox();
  if (e.key === "ArrowRight") nextButton.click();
  if (e.key === "ArrowLeft") prevButton.click();
  if (e.key === "+" || e.key === "=") zoomInButton.click();
  if (e.key === "-") zoomOutButton.click();
  if (e.key === "0") zoomResetButton.click();
});

/* ================= MOBILE MENU ================= */
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
const menuIcon = menuToggle.querySelector("i");

function setMenu(open) {
  mainNav.classList.toggle("active", open);
  menuIcon.classList.toggle("fa-xmark", open);
  menuIcon.classList.toggle("fa-bars", !open);
}
menuToggle.addEventListener("click", () => setMenu(!mainNav.classList.contains("active")));
mainNav.querySelectorAll("a").forEach((l) => l.addEventListener("click", () => setMenu(false)));

/* ================= POSTER FILTERS ================= */
const chips = document.querySelectorAll(".chip");
const posts = document.querySelectorAll(".project");

chips.forEach((chip) =>
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    posts.forEach((p) => {
      const show = chip.dataset.f === "all" || p.dataset.cat === chip.dataset.f;
      p.classList.toggle("hide", !show);
      if (show) {
        p.classList.add("show");
        p.classList.remove("pop");
        void p.offsetWidth;
        p.classList.add("pop");
      }
    });
  }),
);

/* ================= LAZY IMAGES ================= */
// Brand slider images are NOT lazy: their width depends on the loaded image.
document
  .querySelectorAll(".project img, .business-card-image img")
  .forEach((img) => { img.loading = "lazy"; img.decoding = "async"; });

/* ================= CREATIVE EFFECTS ================= */
const root = document.documentElement;
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;
const fx = document.querySelector(".bg-fx");
const bar = document.querySelector(".progress");

function onScrollFx() {
  const max = root.scrollHeight - innerHeight;
  fx.style.setProperty("--sy", scrollY);
  bar.style.setProperty("--p", max > 0 ? scrollY / max : 0);
}
addEventListener("scroll", onScrollFx, { passive: true });
onScrollFx();

if (fine && !reduceMotion) {
  /* background parallax */
  addEventListener("mousemove", (e) => {
    fx.style.setProperty("--mx", (e.clientX / innerWidth - 0.5) * 2);
    fx.style.setProperty("--my", (e.clientY / innerHeight - 0.5) * 2);
  });

  /* custom cursor */
  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  let cx = 0, cy = 0, tx = 0, ty = 0;

  addEventListener("mousemove", (e) => {
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = `translate(${tx}px, ${ty}px)`;
    cursor.classList.add("on");
    dot.classList.add("on");
  });
  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("on", "big");
    dot.classList.remove("on");
  });
  (function loop() {
    cx += (tx - cx) * 0.5;
    cy += (ty - cy) * 0.5;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener("mouseover", (e) => {
    const t = e.target;
    const big = !!t.closest(
      "a, button, .chip, .project, .brand-identity-image, .business-card-project, .tool-card, .education-item, .service, .skills-grid span, .photo, .avail",
    );
    cursor.classList.toggle("big", big);
  });

  /* magnetic buttons */
  document.querySelectorAll(".btn, .btn-outline, .contact-links a, .theme-toggle").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    });
    el.addEventListener("mouseleave", () => (el.style.translate = ""));
  });

  /* 3D tilt on tool cards + posters */
  document.querySelectorAll(".tool-card, .project-image").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
}

/* ================= BRAND SLIDER ================= */
const brandTrack = document.getElementById("brand-track");
const brandPrev = document.getElementById("brand-prev");
const brandNext = document.getElementById("brand-next");

function brandStep() {
  const items = [...brandTrack.querySelectorAll(".brand-identity-image")];
  const left = brandTrack.getBoundingClientRect().left;
  const first = items.find((i) => i.getBoundingClientRect().right > left + 10);
  return first ? first.offsetWidth + 14 : brandTrack.clientWidth / 2;
}
function updateBrandArrows() {
  brandPrev.disabled = brandTrack.scrollLeft <= 2;
  brandNext.disabled =
    brandTrack.scrollLeft + brandTrack.clientWidth >= brandTrack.scrollWidth - 2;
}
brandPrev.addEventListener("click", () => brandTrack.scrollBy({ left: -brandStep() }));
brandNext.addEventListener("click", () => brandTrack.scrollBy({ left: brandStep() }));
brandTrack.addEventListener("scroll", updateBrandArrows, { passive: true });
addEventListener("resize", updateBrandArrows);
brandTrack.querySelectorAll("img").forEach((img) => img.addEventListener("load", updateBrandArrows));
updateBrandArrows();