/* ==========================================================================
   SAFVEX — main.js
   Loader → Lenis smooth scroll → GSAP/ScrollTrigger reveals → micro-
   interactions (cursor glow, magnetic buttons, 3D tilt) → nav, FAQ,
   counters, WhatsApp deep-link, multi-step form + EmailJS.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 0. Config                                                               */
/* ---------------------------------------------------------------------- */
const SAFVEX = {
  whatsapp: '917776900037',
  email: 'safvexsolutions@gmail.com',
  emailjs: {
    publicKey: 'jjpjglujpSG0LDXex',
    serviceId: 'service_zkqa3cq',
    templateId: 'template_glm4qh8',
  },
};

/* ---------------------------------------------------------------------- */
/* 1. Loader                                                               */
/* ---------------------------------------------------------------------- */
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  const bar = document.querySelector('.loader-bar i');
  if (bar && window.gsap) {
    gsap.to(bar, { width: '100%', duration: 0.9, ease: 'power2.inOut' });
  }
  setTimeout(() => {
    if (loader) loader.classList.add('is-done');
    document.body.classList.add('is-loaded');
    initPageAnimations();
  }, 750);
});

/* ---------------------------------------------------------------------- */
/* 2. Lenis smooth scroll (bridged into ScrollTrigger)                     */
/* ---------------------------------------------------------------------- */
let lenis;
if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis = new Lenis({ lerp: 0.12, duration: 1.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5 });
  lenis.on('scroll', window.ScrollTrigger ? ScrollTrigger.update : () => {});
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if (window.gsap && window.ScrollTrigger) {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}
window._lenis = lenis;

/* ---------------------------------------------------------------------- */
/* 3. Nav: scrolled state + mobile toggle                                  */
/* ---------------------------------------------------------------------- */
const nav = document.querySelector('.nav');
const navLinks = document.querySelector('.nav-links');
const navToggle = document.querySelector('.nav-toggle');

window.addEventListener('scroll', () => {
  if (!nav) return;
  nav.classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('is-open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('is-open')));
}

/* ---------------------------------------------------------------------- */
/* 4. Cursor glow                                                          */
/* ---------------------------------------------------------------------- */
const glow = document.querySelector('.cursor-glow');
if (glow && window.matchMedia('(pointer:fine)').matches) {
  let gx = -400, gy = -400;
  window.addEventListener('pointermove', (e) => { gx = e.clientX; gy = e.clientY; }, { passive: true });
  (function loop() {
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(loop);
  })();
}

/* ---------------------------------------------------------------------- */
/* 5. Magnetic buttons (rAF-throttled so pointermove never floods layout)  */
/* ---------------------------------------------------------------------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.magnetic').forEach((el) => {
  let raf = null, pendingX = 0, pendingY = 0;
  if (reduceMotion) return;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    pendingX = (e.clientX - r.left - r.width / 2) * 0.28;
    pendingY = (e.clientY - r.top - r.height / 2) * 0.35;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      el.style.transform = `translate(${pendingX}px, ${pendingY}px)`;
      raf = null;
    });
  }, { passive: true });
  el.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    el.style.transform = 'translate(0,0)';
  });
});

/* ---------------------------------------------------------------------- */
/* 6. 3D card tilt (service cards) — rAF-throttled                         */
/* ---------------------------------------------------------------------- */
document.querySelectorAll('.tilt').forEach((el) => {
  let raf = null, px = 0.5, py = 0.5;
  if (reduceMotion) return;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width;
    py = (e.clientY - r.top) / r.height;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${(px - 0.5) * 14}deg`);
      el.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      raf = null;
    });
  }, { passive: true });
  el.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });
});

/* ---------------------------------------------------------------------- */
/* 7. Text split + stagger for hero headline                              */
/* ---------------------------------------------------------------------- */
document.querySelectorAll('[data-split]').forEach((el) => {
  // Word-split into staggered spans while preserving any inline highlight
  // spans (e.g. <span class="hl-a">) so gradient-text words survive the split.
  const wordHtmls = [];
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.trim().split(/\s+/).filter(Boolean).forEach((w) => {
        wordHtmls.push(`<span class="line"><span>${w}</span></span>`);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const cls = node.getAttribute('class') || '';
      node.textContent.trim().split(/\s+/).filter(Boolean).forEach((w) => {
        wordHtmls.push(`<span class="line"><span class="${cls}">${w}</span></span>`);
      });
    }
  });
  el.innerHTML = wordHtmls.join(' ');
});

/* ---------------------------------------------------------------------- */
/* 8. FAQ accordion                                                        */
/* ---------------------------------------------------------------------- */
document.querySelectorAll('.faq-item').forEach((item) => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item.is-open').forEach((o) => {
      o.classList.remove('is-open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('is-open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* ---------------------------------------------------------------------- */
/* 9. Animated counters                                                    */
/* ---------------------------------------------------------------------- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.6,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = obj.val.toFixed(decimals) + suffix; },
  });
}

/* ---------------------------------------------------------------------- */
/* 10. GSAP ScrollTrigger reveals — called once loader finishes            */
/* ---------------------------------------------------------------------- */
function initPageAnimations() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero headline stagger
  gsap.to('.hero h1 .line span', {
    y: 0, duration: 1, stagger: 0.06, ease: 'power4.out', delay: 0.1,
  });
  gsap.set('.hero h1 .line span', { y: '110%' });
  gsap.to('.hero h1 .line span', { y: '0%', duration: 1, stagger: 0.06, ease: 'power4.out', delay: 0.15 });

  gsap.from('.hero-tag, .hero-sub, .hero-actions, .hero-stats', {
    opacity: 0, y: 24, duration: 0.9, stagger: 0.12, delay: 0.5, ease: 'power3.out',
  });

  // Generic reveal-on-scroll
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 34 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Staggered groups
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = group.children;
    gsap.fromTo(items, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 85%' },
    });
  });

  // Counters
  document.querySelectorAll('[data-count]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => animateCounter(el),
    });
  });

  // Parallax blobs
  document.querySelectorAll('.blob').forEach((b, i) => {
    gsap.to(b, {
      y: i % 2 === 0 ? -60 : 60,
      scrollTrigger: { trigger: b.closest('.section'), scrub: 1 },
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 11. WhatsApp deep link builder                                         */
/* ---------------------------------------------------------------------- */
function buildWhatsAppLink(details = {}) {
  const lines = [
    'Hi SAFVEX, I\u2019d like to discuss a project.',
    `Name: ${details.name || ''}`,
    `Phone: ${details.phone || ''}`,
    `Email: ${details.email || ''}`,
    `Let\u2019s Build: ${details.need || ''}`,
    `Best Time to Call: ${details.time || ''}`,
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${SAFVEX.whatsapp}?text=${text}`;
}

document.querySelectorAll('[data-whatsapp]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(buildWhatsAppLink(), '_blank', 'noopener');
  });
});

/* ---------------------------------------------------------------------- */
/* 12. Form sending — layered fallback so a message is never just lost     */
/*     1) EmailJS (if configured & reachable)                              */
/*     2) FormSubmit.co AJAX relay (zero-config email relay to inbox)      */
/*     3) mailto: pre-filled compose window (guaranteed last resort)       */
/* ---------------------------------------------------------------------- */
let _emailjsReady = false;
function ensureEmailJs() {
  if (!_emailjsReady && window.emailjs && SAFVEX.emailjs.publicKey) {
    try {
      window.emailjs.init({ publicKey: SAFVEX.emailjs.publicKey });
      _emailjsReady = true;
    } catch (err) { console.warn('SAFVEX: EmailJS init failed', err); }
  }
  return !!(window.emailjs && _emailjsReady);
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

function openMailtoFallback(data, subject) {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const mailto = `mailto:${SAFVEX.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
  window.location.href = mailto;
}

/**
 * Attempts every available channel in order and resolves as soon as one
 * succeeds. Only rejects if every channel fails (network fully offline,
 * pop-up blocked, etc.) — in that case the caller should still show the
 * mailto fallback so the enquiry is never silently dropped.
 */
async function sendEnquiry(data, { subject = 'New enquiry from Safvex website' } = {}) {
  // Merge the subject (and a safe fallback for every field the EmailJS
  // template expects) into ONE payload so every channel — EmailJS,
  // FormSubmit, and the mailto fallback — actually receives it.
  // Missing optional fields become '' instead of undefined so the template
  // never prints the literal word "undefined".
  const payload = {
    form_name: 'Website',
    name: '', email: '', phone: '', company: '', city: '',
    industry: '', service: '', maps: '', message: '',
    ...data,
    subject,
  };
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined || payload[k] === null) payload[k] = ''; });

  // 1) EmailJS
  if (ensureEmailJs() && SAFVEX.emailjs.serviceId && SAFVEX.emailjs.templateId) {
    try {
      await withTimeout(emailjs.send(SAFVEX.emailjs.serviceId, SAFVEX.emailjs.templateId, payload), 8000);
      return { ok: true, via: 'emailjs' };
    } catch (err) { console.warn('SAFVEX: EmailJS send failed, trying fallback relay', err); }
  }

  // 2) FormSubmit.co — no API keys required, relays straight to the inbox
  try {
    const res = await withTimeout(fetch(`https://formsubmit.co/ajax/${SAFVEX.email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ ...payload, _subject: subject, _template: 'table', _captcha: 'false' }),
    }), 8000);
    if (res && res.ok) return { ok: true, via: 'formsubmit' };
  } catch (err) { console.warn('SAFVEX: fallback relay failed, using mailto', err); }

  // 3) Guaranteed last resort — open the visitor's own mail client, pre-filled
  openMailtoFallback(payload, subject);
  return { ok: true, via: 'mailto' };
}

(function setupLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  let current = 0;
  const progressBar = document.querySelector('.form-progress i');
  const stepLabel = document.querySelector('.form-step-label');

  function showStep(i) {
    steps.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    if (progressBar) progressBar.style.width = `${((i + 1) / steps.length) * 100}%`;
    if (stepLabel) stepLabel.textContent = `Step ${i + 1} of ${steps.length}`;
  }
  showStep(0);

  form.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const activeStep = steps[current];
      const required = activeStep.querySelectorAll('[required]');
      for (const field of required) {
        if (!field.value.trim()) { field.focus(); field.reportValidity?.(); return; }
      }
      if (current < steps.length - 1) { current++; showStep(current); }
    });
  });
  form.querySelectorAll('[data-prev]').forEach((btn) => {
    btn.addEventListener('click', () => { if (current > 0) { current--; showStep(current); } });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.querySelector('.form-msg');
    const submitBtn = form.querySelector('[data-submit]');
    const formData = new FormData(form);

const selectedServices = formData.getAll("services").join(", ");

const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),

    company: formData.get("company") || formData.get("business"),
    city: formData.get("city"),

    industry: formData.get("industry"),
    business_type: formData.get("business_type"),

    maps: formData.get("maps"),
    budget: formData.get("budget"),
    time: formData.get("time"),

    service: selectedServices,

    message: formData.get("details") || formData.get("message")
};

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'form-msg'; }

    try {
      const result = await sendEnquiry(data, { subject: `New project enquiry — ${data.name || 'Website'}` });
      form.hidden = true;
      const successEl = document.querySelector('.form-success');
      if (successEl) { successEl.hidden = false; successEl.classList.add('pop-in'); }
      if (result.via === 'mailto' && msgEl) {
        msgEl.textContent = 'Your email app should have opened with the details filled in — just hit send.';
      }
    } catch (err) {
      if (msgEl) { msgEl.textContent = 'Something went wrong sending your details — please WhatsApp us instead so nothing gets lost.'; msgEl.className = 'form-msg err'; }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Project'; }
    }
  });
})();

/* Generic contact mini-form (index.html + contact.html) uses the same layered send */
(function setupMiniForm() {
  document.querySelectorAll('#contact-form, .waitlist-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msgEl = form.querySelector('.form-msg');
      const btn = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);

const selectedServices = formData.getAll("services").join(", ");

const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),

    company: formData.get("company") || formData.get("business"),
    city: formData.get("city"),

    industry: formData.get("industry"),
    business_type: formData.get("business_type"),

    maps: formData.get("maps"),
    budget: formData.get("budget"),
    time: formData.get("time"),

    service: selectedServices,

    message: formData.get("details") || formData.get("message")
};
      if (btn) { btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.textContent; btn.textContent = 'Sending...'; }
      if (msgEl) { msgEl.textContent = ''; msgEl.className = 'form-msg'; }

      try {
        const result = await sendEnquiry(data, { subject: `New message from ${data.name || 'website visitor'} — Safvex` });
        if (msgEl) {
          msgEl.textContent = result.via === 'mailto'
            ? 'Your email app should have opened with the details filled in — just hit send.'
            : 'Message sent — we\u2019ll reply within one business day.';
          msgEl.className = 'form-msg ok';
        }
        form.reset();
      } catch (err) {
        if (msgEl) { msgEl.textContent = 'Could not send — please try WhatsApp instead.'; msgEl.className = 'form-msg err'; }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
      }
    });
  });
})();

/* ---------------------------------------------------------------------- */
/* 13. Smooth page transitions between pages (internal links only)         */
/* ---------------------------------------------------------------------- */
(function setupPageTransitions() {
  if (reduceMotion) return;

  const overlay = document.createElement('div');
  overlay.className = 'page-fade-overlay';
  document.body.appendChild(overlay);

  // Play the "entering" wipe on the page we just landed on.
  requestAnimationFrame(() => {
    overlay.classList.add('is-entering');
    setTimeout(() => overlay.classList.remove('is-entering'), 600);
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.target === '_blank' || link.hasAttribute('data-whatsapp') || link.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    let url;
    try { url = new URL(href, window.location.href); } catch { return; }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return; // same-page anchor

    e.preventDefault();
    document.body.classList.add('is-transitioning');
    overlay.classList.add('is-leaving');
    setTimeout(() => { window.location.href = url.href; }, 480);
  });
})();

window.SAFVEX = SAFVEX;
window.buildWhatsAppLink = buildWhatsAppLink;
window.sendEnquiry = sendEnquiry;
