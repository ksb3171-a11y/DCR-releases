/* ============================================================================
   STRIX site — shared UI interactions (single source)
   Requires i18n.js (window.STRIX_I18N). Handles: language selector, scroll reveal,
   nav scroll state, mobile nav toggle, tabs, accordion.
   Auth (Supabase) is wired separately on pages that need it.
   ============================================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* ── Language selector ── */
    const langBtn = document.getElementById('langBtn');
    const langDrop = document.getElementById('langDropdown');
    if (langBtn && langDrop) {
      langBtn.addEventListener('click', e => {
        e.stopPropagation();
        const open = langDrop.classList.toggle('open');
        langBtn.classList.toggle('open', open);
      });
      document.addEventListener('click', () => {
        langDrop.classList.remove('open');
        langBtn.classList.remove('open');
      });
      document.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
          window.STRIX_I18N && window.STRIX_I18N.apply(opt.dataset.lang);
          langDrop.classList.remove('open');
          langBtn.classList.remove('open');
        });
      });
    }

    /* ── Initial language (saved or default English) ──
       Uses a versioned key ('dcr-lang-v2') so any pre-existing 'dcr-lang' from an
       earlier visit is ignored once — English becomes the default for everyone now,
       while an explicit pick is still remembered under the new key. */
    if (window.STRIX_I18N) {
      let saved = null;
      try { saved = localStorage.getItem('dcr-lang-v2'); } catch (e) {}
      window.STRIX_I18N.apply(saved && window.STRIX_I18N.T[saved] ? saved : 'en');
    }

    /* ── Nav: scroll shadow ── */
    const nav = document.querySelector('.nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ── Mobile nav toggle ── */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
      navLinks.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => navLinks.classList.remove('open'))
      );
    }

    /* ── Scroll reveal ── */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }

    /* ── Tabs (data-tab-group / data-tab / data-panel) ── */
    document.querySelectorAll('[data-tab-group]').forEach(group => {
      const btns = group.querySelectorAll('[data-tab]');
      const root = document.querySelector(group.getAttribute('data-tab-group'));
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (root) {
            root.querySelectorAll('[data-panel]').forEach(p => {
              p.style.display = p.getAttribute('data-panel') === btn.getAttribute('data-tab') ? '' : 'none';
            });
          }
        });
      });
    });

    /* ── Accordion ── */
    document.querySelectorAll('.acc-q').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.acc-item');
        const body = item.querySelector('.acc-a');
        const open = item.classList.toggle('open');
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
      });
    });
  });
})();
