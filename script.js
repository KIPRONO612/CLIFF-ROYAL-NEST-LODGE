// Add basic animation when page loads
window.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector('.glass-card');
  if (!card) return;

  card.style.opacity = 0;
  card.style.transform = "translateY(-30px)";

  setTimeout(() => {
    card.style.transition = "all 0.6s ease-out";
    card.style.opacity = 1;
    card.style.transform = "translateY(0)";
  }, 100);
});

// init flatpickr for more stylish date inputs (if flatpickr loaded)
window.addEventListener('DOMContentLoaded', () => {
  if (window.flatpickr) {
    const checkin = document.querySelector('input[name="checkin"].date');
    const checkout = document.querySelector('input[name="checkout"].date');
    const opts = {
      altInput: true,
      altFormat: 'F j, Y',
      dateFormat: 'Y-m-d',
      minDate: 'today'
    };
    const ci = checkin ? flatpickr(checkin, {
      ...opts,
      onChange: function(selectedDates) {
        if (selectedDates.length) {
          const min = new Date(selectedDates[0].getTime());
          min.setDate(min.getDate() + 1);
          if (checkout && checkout._flatpickr) checkout._flatpickr.set('minDate', min);
        }
      }
    }) : null;
    const co = checkout ? flatpickr(checkout, opts) : null;
  }
});

// Booking modal logic
(() => {
  const bookBtn = document.getElementById('bookBtn');
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('modalClose');
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');

  if (!bookBtn || !modal) return;

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    // trap focus briefly by focusing the first input
    const firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    bookBtn.focus();
  }

  bookBtn.addEventListener('click', openModal);
  closeBtn && closeBtn.addEventListener('click', closeModal);

  // close on Esc
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  // handle submit (stub)
  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    // minimal client-side validation
    if (!payload.name || !payload.email) {
      alert('Please complete name and email.');
      return;
    }

    // Try to POST to backend; if it fails, fall back to stub behavior
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('server error');
      success.classList.remove('sr-only');
      success.textContent = 'Thank you — your booking request was received.';
    } catch (err) {
      console.warn('Backend unavailable, using local stub:', err);
      success.classList.remove('sr-only');
      success.textContent = 'Thank you — your booking request was received (local only).';
      console.log('Booking request (stub):', payload);
    }

    setTimeout(() => {
      closeModal();
      form.reset();
      success.classList.add('sr-only');
    }, 1800);
  });
})();

// Cookie consent handling
(function () {
  const consent = document.getElementById('cookieConsent');
  const accept = document.getElementById('acceptCookies');
  const dismiss = document.getElementById('dismissCookies');

  if (!consent) return;

  function hide() { consent.style.display = 'none'; localStorage.setItem('cookieConsent', '1'); }
  function showIfNeeded() { if (!localStorage.getItem('cookieConsent')) consent.style.display = 'flex'; }

  accept && accept.addEventListener('click', () => { hide(); /* analytics placeholder: enable tracking */ });
  dismiss && dismiss.addEventListener('click', hide);

  showIfNeeded();
})();

// Analytics placeholder — add actual analytics script here if desired
(function () {
  window.analytics = window.analytics || { enabled: false };
})();

// Slideshow (fade-cross)
(function () {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;
  const slides = Array.from(slideshow.querySelectorAll('.slide'));
  const prevBtn = slideshow.querySelector('.slideshow-prev');
  const nextBtn = slideshow.querySelector('.slideshow-next');
  const dotsWrap = slideshow.querySelector('.slideshow-dots');
  let current = 0;
  let interval = null;
  const INTERVAL_MS = 4000;

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsWrap.children[current] && dotsWrap.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current] && dotsWrap.children[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // create dots
  slides.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => { goTo(i); reset(); });
    dotsWrap.appendChild(btn);
  });

  prevBtn && prevBtn.addEventListener('click', () => { prev(); reset(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); reset(); });

  function start() { interval = setInterval(next, INTERVAL_MS); }
  function stop() { clearInterval(interval); interval = null; }
  function reset() { stop(); start(); }

  slideshow.addEventListener('mouseenter', stop);
  slideshow.addEventListener('mouseleave', start);

  // keyboard controls
  slideshow.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); reset(); }
    if (e.key === 'ArrowLeft') { prev(); reset(); }
  });

  // init
  slides.forEach(s => s.classList.remove('active'));
  slides[0] && slides[0].classList.add('active');
  dotsWrap.children[0] && dotsWrap.children[0].classList.add('active');
  start();
})();

// Background slideshow (behind content)
(function () {
  const bg = Array.from(document.querySelectorAll('.bg-slideshow .bg-slide'));
  if (!bg || bg.length === 0) return;
  let idx = 0;
  const BG_INTERVAL = 6000;

  // Preload background images to avoid flashes; then start cycling
  let loaded = 0;
  const total = bg.length;
  function show(i) {
    bg.forEach((el, j) => el.classList.toggle('active', j === i));
  }

  bg.forEach((el) => {
    const url = (el.style && el.style.backgroundImage || '').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    if (!url) { loaded++; return; }
    const img = new Image();
    img.onload = () => { loaded++; if (loaded === total) startBg(); };
    img.onerror = () => { loaded++; if (loaded === total) startBg(); };
    img.src = url;
  });

  function startBg() {
    show(0);
    setInterval(() => { idx = (idx + 1) % bg.length; show(idx); }, BG_INTERVAL);
  }
})();

// Welcome quote modal: show on page load, then proceed to booking modal
(function () {
  const welcome = document.getElementById('welcomeModal');
  if (!welcome) return;

  function openWelcome() {
    welcome.setAttribute('aria-hidden', 'false');
    // focus the modal for accessibility
    try { welcome.focus(); } catch (e) { /* ignore */ }
  }

  function closeWelcome() {
    welcome.setAttribute('aria-hidden', 'true');
  }

  // show welcome on load; auto-close after short delay
  window.addEventListener('DOMContentLoaded', () => {
    openWelcome();
    setTimeout(() => { closeWelcome(); }, 2000);
  });
})();
