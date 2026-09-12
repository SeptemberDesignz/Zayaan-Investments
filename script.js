/* =========================================================
   ZAYAAN INVESTMENTS — SHARED SCRIPT
   Handles: mobile menu, sticky navbar, scroll reveal,
   back-to-top, image placeholder auto-hide, contact form
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  const navbar      = document.getElementById('navbar');
  const backToTop   = document.getElementById('backToTop');
  const yearSpan    = document.getElementById('year');
  const contactForm = document.getElementById('contactForm');
  const formStatus  = document.getElementById('formStatus');

  /* ---------- AUTO YEAR ---------- */
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* =========================================================
     IMAGE PLACEHOLDER AUTO-HIDE
     For every image with class "img-slot" (content images),
     and every logo image inside ".logo-box":
       - when the image loads → hide the placeholder text / hint
       - when the image fails → leave the hint visible
     ========================================================= */

  // ---- LOGO IMAGES ----
  document.querySelectorAll('.logo-box img').forEach(img => {
    const box = img.parentElement;
    const hint = box.querySelector('.logo-hint');

    function onLogoLoad() {
      if (hint) hint.style.display = 'none';
      box.classList.add('has-logo');
    }

    if (img.complete && img.naturalWidth > 0) {
      onLogoLoad();
    } else {
      img.addEventListener('load', onLogoLoad);
      img.addEventListener('error', () => {
        if (hint) hint.style.display = 'flex';
        box.classList.remove('has-logo');
      });
    }
  });

  // ---- CONTENT IMAGES (hero, sections, strips) ----
  document.querySelectorAll('img.img-slot').forEach(img => {
    const parent = img.parentElement;

    function onImageLoad() {
      parent.classList.add('img-container-loaded');
      // Also hide any legacy ::before text if still present
      parent.setAttribute('data-loaded', 'true');
    }

    if (img.complete && img.naturalWidth > 0) {
      onImageLoad();
    } else {
      img.addEventListener('load', onImageLoad);
      img.addEventListener('error', () => {
        img.style.opacity = '0';
        parent.classList.remove('img-container-loaded');
      });
    }
  });

  /* ---------- STICKY NAVBAR ---------- */
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }

  /* ---------- BACK TO TOP ---------- */
  function handleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 400) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  }
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* ---------- COMBINED SCROLL ---------- */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleNavbarScroll();
        handleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  handleNavbarScroll();
  handleBackToTop();

  /* ---------- CONTACT FORM ---------- */
  if (contactForm) {
    const fields = {
      name:    { el: document.getElementById('name'),
                 validate: v => v.trim().length >= 2,
                 message: 'Please enter your full name (min 2 characters).' },
      email:   { el: document.getElementById('email'),
                 validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
                 message: 'Please enter a valid email address.' },
      phone:   { el: document.getElementById('phone'),
                 validate: v => v.trim() === '' || /^[0-9+\-\s()]{7,}$/.test(v.trim()),
                 message: 'Please enter a valid phone number.' },
      message: { el: document.getElementById('message'),
                 validate: v => v.trim().length >= 10,
                 message: 'Please describe the part you need (min 10 characters).' }
    };

    function showError(field, msg) {
      const small = document.querySelector(`.error-msg[data-for="${field}"]`);
      if (small) small.textContent = msg || '';
      if (fields[field] && fields[field].el) {
        fields[field].el.classList.toggle('invalid', !!msg);
      }
    }

    function validateField(field) {
      const f = fields[field];
      if (!f || !f.el) return true;
      const ok = f.validate(f.el.value);
      showError(field, ok ? '' : f.message);
      return ok;
    }

    Object.keys(fields).forEach(key => {
      const f = fields[key];
      if (!f.el) return;
      f.el.addEventListener('blur', () => validateField(key));
      f.el.addEventListener('input', () => {
        if (f.el.classList.contains('invalid')) validateField(key);
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let allValid = true;
      Object.keys(fields).forEach(key => { if (!validateField(key)) allValid = false; });

      if (!allValid) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = '⚠️ Please fix the errors above and try again.';
        }
        return;
      }

      const submitBtn = contactForm.querySelector('.form-submit');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      const data = {
        name:    fields.name.el.value.trim(),
        email:   fields.email.el.value.trim(),
        phone:   fields.phone.el.value.trim(),
        message: fields.message.el.value.trim()
      };

      const subject = encodeURIComponent(`Parts Enquiry from ${data.name}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\n\nMessage:\n${data.message}`
      );
      const mailtoLink = `mailto:zayaaninvestments2019@gmail.com?subject=${subject}&body=${body}`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.innerHTML = '✅ Thank you! Your email app will now open — please press <strong>Send</strong>.';
        }
        window.location.href = mailtoLink;
        setTimeout(() => {
          contactForm.reset();
          if (formStatus) { formStatus.className = 'form-status'; formStatus.textContent = ''; }
        }, 4000);
      }, 700);
    });
  }

});