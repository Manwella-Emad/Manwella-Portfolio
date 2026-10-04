/* ================= SCROLL ANIMATIONS ================= */

const animatedElements = document.querySelectorAll(
  "section:not(.hero), .education-item, .software-card, .service, .project, .business-card-project, .skills-grid span",
);

const animatedTitles = document.querySelectorAll(
  ".section-title, .projects-category-title",
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
  {
    threshold: 0.12,
  },
);

animatedElements.forEach((element) => {
  element.classList.add("animate-on-scroll");
  animationObserver.observe(element);
});

/* ================= TITLE LINE ANIMATIONS ================= */

const titleLineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("line-animate");
        titleLineObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.5,
  },
);

animatedTitles.forEach((title) => {
  titleLineObserver.observe(title);
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ================= DARK / LIGHT MODE ================= */

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector("i");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const isDark = document.body.classList.contains("dark-mode");

  if (isDark) {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }

  localStorage.setItem("theme", isDark ? "dark" : "light");
});

/* Keep the selected theme after refreshing */

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");

  themeIcon.classList.remove("fa-moon");
  themeIcon.classList.add("fa-sun");
}

/* ================= ACTIVE NAVIGATION ================= */

const navLinks = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("section[id]");

function updateActiveNav() {
  const scrollPosition = window.scrollY + 150;

  let currentSection = "home";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateActiveNav);

updateActiveNav();
/* ================= PROJECT IMAGE LIGHTBOX ================= */

const lightbox = document.getElementById("image-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightbox = document.getElementById("lightbox-close");

const prevButton = document.getElementById("lightbox-prev");
const nextButton = document.getElementById("lightbox-next");

const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");
const zoomResetButton = document.getElementById("zoom-reset");

/* ================= ALL PROJECT IMAGES ================= */

const zoomableImages = Array.from(
  document.querySelectorAll(".project-image img, .business-card-image img"),
);

let currentImageIndex = 0;

let zoomLevel = 1;

let translateX = 0;
let translateY = 0;

let isDragging = false;

let startX = 0;
let startY = 0;

let lastTouchDistance = 0;

/* ================= UPDATE IMAGE ================= */

function updateImageTransform() {
  lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
}

/* ================= RESET IMAGE ================= */

function resetImageTransform() {
  zoomLevel = 1;

  translateX = 0;
  translateY = 0;

  updateImageTransform();
}

/* ================= OPEN IMAGE ================= */

zoomableImages.forEach((image, index) => {
  image.addEventListener("click", function (event) {
    event.stopPropagation();

    currentImageIndex = index;

    openLightbox(image.src);
  });
});

/* ================= OPEN LIGHTBOX ================= */

function openLightbox(imageSource) {
  lightboxImage.src = imageSource;

  resetImageTransform();

  lightbox.classList.add("active");

  document.body.style.overflow = "hidden";
}

/* ================= CLOSE LIGHTBOX ================= */

function closeImageLightbox() {
  lightbox.classList.remove("active");

  document.body.style.overflow = "";

  resetImageTransform();
}

closeLightbox.addEventListener("click", closeImageLightbox);

/* ================= CLOSE ON BACKGROUND ================= */

lightbox.addEventListener("click", function (event) {
  if (event.target === lightbox) {
    closeImageLightbox();
  }
});

/* ================= NEXT IMAGE ================= */

nextButton.addEventListener("click", function (event) {
  event.stopPropagation();

  currentImageIndex++;

  if (currentImageIndex >= zoomableImages.length) {
    currentImageIndex = 0;
  }

  openLightbox(zoomableImages[currentImageIndex].src);
});

/* ================= PREVIOUS IMAGE ================= */

prevButton.addEventListener("click", function (event) {
  event.stopPropagation();

  currentImageIndex--;

  if (currentImageIndex < 0) {
    currentImageIndex = zoomableImages.length - 1;
  }

  openLightbox(zoomableImages[currentImageIndex].src);
});

/* ================= ZOOM FUNCTION ================= */

function zoomImage(amount, centerX = 0, centerY = 0) {
  const oldZoom = zoomLevel;

  zoomLevel += amount;

  if (zoomLevel < 1) {
    zoomLevel = 1;
  }

  if (zoomLevel > 4) {
    zoomLevel = 4;
  }

  if (zoomLevel === 1) {
    translateX = 0;
    translateY = 0;

    updateImageTransform();

    return;
  }

  const zoomRatio = zoomLevel / oldZoom;

  translateX = centerX - (centerX - translateX) * zoomRatio;

  translateY = centerY - (centerY - translateY) * zoomRatio;

  updateImageTransform();
}

/* ================= BUTTON ZOOM IN ================= */

zoomInButton.addEventListener("click", function (event) {
  event.stopPropagation();

  zoomImage(0.25);
});

/* ================= BUTTON ZOOM OUT ================= */

zoomOutButton.addEventListener("click", function (event) {
  event.stopPropagation();

  zoomImage(-0.25);
});

/* ================= RESET ZOOM ================= */

zoomResetButton.addEventListener("click", function (event) {
  event.stopPropagation();

  resetImageTransform();
});

/* ================= MOUSE WHEEL ZOOM ================= */

lightboxImage.addEventListener("wheel", function (event) {
  event.preventDefault();

  const rect = lightboxImage.getBoundingClientRect();

  const mouseX = event.clientX - (rect.left + rect.width / 2);

  const mouseY = event.clientY - (rect.top + rect.height / 2);

  const zoomAmount = event.deltaY < 0 ? 0.2 : -0.2;

  zoomImage(zoomAmount, mouseX, mouseY);
});

/* ================= MOUSE DRAG ================= */

lightboxImage.addEventListener("mousedown", function (event) {
  if (zoomLevel <= 1) {
    return;
  }

  event.preventDefault();

  isDragging = true;

  startX = event.clientX - translateX;
  startY = event.clientY - translateY;

  lightboxImage.style.cursor = "grabbing";
});

document.addEventListener("mousemove", function (event) {
  if (!isDragging) {
    return;
  }

  translateX = event.clientX - startX;
  translateY = event.clientY - startY;

  updateImageTransform();
});

document.addEventListener("mouseup", function () {
  isDragging = false;

  lightboxImage.style.cursor = "grab";
});

/* ================= TOUCH HELPERS ================= */

function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;

  const dy = touch1.clientY - touch2.clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

/* ================= TOUCH START ================= */

lightboxImage.addEventListener(
  "touchstart",
  function (event) {
    event.preventDefault();

    if (event.touches.length === 2) {
      lastTouchDistance = getTouchDistance(event.touches[0], event.touches[1]);

      return;
    }

    if (event.touches.length === 1 && zoomLevel > 1) {
      startX = event.touches[0].clientX - translateX;

      startY = event.touches[0].clientY - translateY;
    }
  },
  { passive: false },
);

/* ================= TOUCH MOVE ================= */

lightboxImage.addEventListener(
  "touchmove",
  function (event) {
    event.preventDefault();

    if (event.touches.length === 2) {
      const currentDistance = getTouchDistance(
        event.touches[0],
        event.touches[1],
      );

      if (lastTouchDistance > 0) {
        const difference = currentDistance - lastTouchDistance;

        const zoomAmount = difference * 0.005;

        zoomLevel += zoomAmount;

        if (zoomLevel < 1) {
          zoomLevel = 1;
        }

        if (zoomLevel > 4) {
          zoomLevel = 4;
        }

        if (zoomLevel === 1) {
          translateX = 0;
          translateY = 0;
        }

        updateImageTransform();
      }

      lastTouchDistance = currentDistance;

      return;
    }

    if (event.touches.length === 1 && zoomLevel > 1) {
      translateX = event.touches[0].clientX - startX;

      translateY = event.touches[0].clientY - startY;

      updateImageTransform();
    }
  },
  { passive: false },
);

/* ================= TOUCH END ================= */

lightboxImage.addEventListener(
  "touchend",
  function () {
    if (zoomLevel === 1) {
      translateX = 0;
      translateY = 0;

      updateImageTransform();
    }

    lastTouchDistance = 0;
  },
  { passive: false },
);

/* ================= KEYBOARD CONTROLS ================= */

document.addEventListener("keydown", function (event) {
  if (!lightbox.classList.contains("active")) {
    return;
  }

  if (event.key === "Escape") {
    closeImageLightbox();
  }

  if (event.key === "ArrowRight") {
    nextButton.click();
  }

  if (event.key === "ArrowLeft") {
    prevButton.click();
  }

  if (event.key === "+" || event.key === "=") {
    zoomInButton.click();
  }

  if (event.key === "-") {
    zoomOutButton.click();
  }

  if (event.key === "0") {
    zoomResetButton.click();
  }
});
/* ================= MOBILE MENU ================= */

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
const menuIcon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("active");

  const isOpen = mainNav.classList.contains("active");

  if (isOpen) {
    menuIcon.classList.remove("fa-bars");
    menuIcon.classList.add("fa-xmark");
  } else {
    menuIcon.classList.remove("fa-xmark");
    menuIcon.classList.add("fa-bars");
  }
});

/* Close menu after clicking a link */

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("active");

    menuIcon.classList.remove("fa-xmark");
    menuIcon.classList.add("fa-bars");
  });
});
