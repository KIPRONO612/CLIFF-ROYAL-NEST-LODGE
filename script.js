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
