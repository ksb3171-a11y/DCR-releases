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

  /* ── Where this page sits (set by scripts/site/, never guessed) ──
     Every built page declares its own language and its path relative to the site
     root, so nothing here has to parse location.pathname — that would break on
     file://, on a sub-directory deployment and on any future domain change.
     See site_seo_discoverability_devplan.md §3.3. */
  const ROOT = document.documentElement;
  const STATIC_LANG = ROOT.getAttribute('data-static-lang');   // 'en' | 'ko' | 'ja' | 'zh'
  const LANG_BASE = ROOT.getAttribute('data-lang-base') || './';
  const PAGE_PATH = ROOT.getAttribute('data-page-path') || '';
  /* Set on pages that exist in English only (the per-benchmark verification pages:
     their content is a technical reference with no translation source, so there is
     no /ko/ copy). Switching language on such a page goes to the nearest page that
     DOES exist in that language — without this it would link to a 404. */
  const LANG_FALLBACK = ROOT.getAttribute('data-lang-fallback');
  const SOURCE_LANG = 'en';   // English lives at the site root

  /** URL of this same page in another language (or its nearest translated parent). */
  function urlForLang(lang) {
    if (lang === SOURCE_LANG) return LANG_BASE + PAGE_PATH;
    return LANG_BASE + lang + '/' + (LANG_FALLBACK || PAGE_PATH);
  }

  ready(function () {
    /* ── Language selector ──
       Picking a language NAVIGATES; it does not swap text in place. Each language
       is its own URL now, so swapping text would leave the URL and the screen
       disagreeing — and sharing that URL would show the reader a different
       language than the one on screen. */
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
          const lang = opt.dataset.lang;
          langDrop.classList.remove('open');
          langBtn.classList.remove('open');
          if (STATIC_LANG && PAGE_PATH) {
            if (lang !== STATIC_LANG) window.location.href = urlForLang(lang);
          } else {
            // Page not produced by the site build (stand-alone preview) — fall
            // back to the old in-place swap so it still works.
            window.STRIX_I18N && window.STRIX_I18N.apply(lang);
          }
        });
      });
    }

    /* ── Initial language ──
       On a built page the URL decides, and the choice is NOT persisted (a visit to
       /ko/ must not turn a later English URL Korean). apply() still runs so the
       nav/footer/modals that layout.js injects at runtime — and the strings
       auth.js/board.js read from window.T — are in this page's language.

       On any other page the old behaviour stands: the remembered pick, else
       English. The versioned key ('dcr-lang-v2') keeps an older 'dcr-lang' from
       overriding that default. */
    if (window.STRIX_I18N) {
      if (STATIC_LANG && window.STRIX_I18N.T[STATIC_LANG]) {
        window.STRIX_I18N.apply(STATIC_LANG, { persist: false });
      } else {
        let saved = null;
        try { saved = localStorage.getItem('dcr-lang-v2'); } catch (e) {}
        window.STRIX_I18N.apply(saved && window.STRIX_I18N.T[saved] ? saved : 'en');
      }
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
