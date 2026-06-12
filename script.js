const elements = {
  loader: document.getElementById("loader"),
  popup: document.getElementById("popup"),
  backsound: document.getElementById("backsound"),
  musicBtn: document.getElementById("musicBtn"),
  musicIcon: document.getElementById("musicIcon"),
  guestName: document.getElementById("guestName"),
  rsvpForm: document.getElementById("rsvpForm"),
  formNote: document.getElementById("formNote"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxClose: document.getElementById("lightboxClose"),
  detailToggle: document.querySelector("[data-toggle-details]"),
  countdown: {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  }
};

const eventDate = new Date("2026-06-20T08:00:00+07:00");
const whatsappNumber = "6281234567890";
const galleryImages = [
  "assets/foto-level.jpg",
  "assets/foto-level-6-1.jpg",
  "assets/foto-level-6-2.jpg"
];
const galleryInterval = 4200;

document.body.classList.add("no-scroll");

window.addEventListener("load", hideLoader);
document.querySelector("[data-open-invitation]").addEventListener("click", openInvitation);
elements.detailToggle.addEventListener("click", showDetails);
elements.musicBtn.addEventListener("click", toggleMusic);
if (elements.rsvpForm) {
  elements.rsvpForm.addEventListener("submit", sendRSVP);
}
elements.lightboxClose.addEventListener("click", closeLightbox);
elements.lightbox.addEventListener("click", handleLightboxBackdrop);
document.addEventListener("keydown", handleKeyboard);

document.querySelectorAll("[data-gallery]").forEach((button) => {
  button.addEventListener("click", () => openLightbox(button.dataset.gallery));
});

setGuestNameFromUrl();
initCountdown();
initGallerySlideshow();
initRevealAnimation();
initActiveNavigation();

function hideLoader() {
  setTimeout(() => {
    elements.loader.classList.add("is-hidden");

    setTimeout(() => {
      elements.loader.style.display = "none";
    }, 700);
  }, 800);
}

function setGuestNameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const recipient = params.get("to");

  if (!recipient) return;

  elements.guestName.textContent = recipient.replace(/\+/g, " ").trim();
}

function openInvitation() {
  elements.popup.classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
  playMusic();

  setTimeout(() => {
    elements.popup.style.display = "none";
    document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  }, 500);
}

function showDetails(event) {
  event.preventDefault();

  document.querySelectorAll(".detail-content").forEach((section) => {
    section.classList.remove("is-collapsed");
  });

  elements.detailToggle.textContent = "Detail Terbuka";
  elements.detailToggle.setAttribute("aria-expanded", "true");
  document.getElementById("undangan").scrollIntoView({ behavior: "smooth" });
}

function playMusic() {
  elements.backsound.play()
    .then(() => updateMusicButton(true))
    .catch(() => updateMusicButton(false));
}

function toggleMusic() {
  if (elements.backsound.paused) {
    playMusic();
    return;
  }

  elements.backsound.pause();
  updateMusicButton(false);
}

function updateMusicButton(isPlaying) {
  elements.musicBtn.classList.toggle("is-playing", isPlaying);
  elements.musicBtn.setAttribute("aria-pressed", String(isPlaying));
  elements.musicBtn.setAttribute("aria-label", isPlaying ? "Matikan musik" : "Putar musik");
  elements.musicIcon.textContent = isPlaying ? "Pause" : "Music";
}

function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function initGallerySlideshow() {
  const slideshow = document.querySelector(".gallery-slideshow");
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll(".gallery-slide");
  let activeSlide = 0;
  let activeImage = 0;

  slideshow.dataset.gallery = galleryImages[activeImage];

  if (galleryImages.length < 2) return;

  setInterval(() => {
    activeImage = (activeImage + 1) % galleryImages.length;
    activeSlide = 1 - activeSlide;

    slides[activeSlide].src = galleryImages[activeImage];
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeSlide);
    });
    slideshow.dataset.gallery = galleryImages[activeImage];
  }, galleryInterval);
}

function updateCountdown() {
  const distance = eventDate.getTime() - Date.now();
  const time = distance <= 0
    ? { days: 0, hours: 0, minutes: 0, seconds: 0 }
    : getTimeParts(distance);

  Object.entries(time).forEach(([key, value]) => {
    elements.countdown[key].textContent = String(value).padStart(2, "0");
  });
}

function getTimeParts(distance) {
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60)
  };
}

function initRevealAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
}

function initActiveNavigation() {
  const links = [...document.querySelectorAll(".nav-dots a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.55 });

  sections.forEach((section) => observer.observe(section));
}

function openLightbox(src) {
  elements.lightboxImage.src = src;
  elements.lightbox.classList.add("is-open");
  elements.lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  elements.lightbox.classList.remove("is-open");
  elements.lightbox.setAttribute("aria-hidden", "true");
  elements.lightboxImage.src = "";
}

function handleLightboxBackdrop(event) {
  if (event.target === elements.lightbox) {
    closeLightbox();
  }
}

function handleKeyboard(event) {
  if (event.key === "Escape" && elements.lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
}

function sendRSVP(event) {
  event.preventDefault();

  const formData = {
    nama: document.getElementById("nama").value.trim(),
    hadir: document.getElementById("hadir").value,
    ucapan: document.getElementById("ucapan").value.trim()
  };

  const message = [
    "Halo, saya ingin konfirmasi kehadiran:",
    "",
    `Nama: ${formData.nama}`,
    `Kehadiran: ${formData.hadir}`,
    `Ucapan: ${formData.ucapan || "-"}`
  ].join("\n");

  elements.formNote.textContent = "Membuka WhatsApp untuk mengirim konfirmasi...";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}
