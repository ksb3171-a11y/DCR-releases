/* ============================================================================
   STRIX site — billing client (pricing + account pages)
   Classic script (NOT a module). Requires: i18n.js (window.T/currentLang),
   auth.js (global _sb Supabase client, openModal). Loaded AFTER auth.js.

   Single source for plans/model = pricing_payment_devplan.md.
   Backend = Supabase Edge Functions (supabase/functions/*). When those are not
   deployed yet, every call degrades gracefully (no crash, friendly message).
   ============================================================================ */
(function () {
  'use strict';

  // Two gateways (pricing_payment_devplan.md §17.7a · §17.7b): Korea → Toss Payments (KRW) · elsewhere → Paddle (USD).
  // The buyer picks the billing country right before checkout; the SERVER (create-checkout) decides
  // gateway, currency and amount and locks the company to its first gateway.
  var TOSS_SDK_URL = 'https://js.tosspayments.com/v2/standard';
  var PADDLE_JS_URL = 'https://cdn.paddle.com/paddle/v2/paddle.js';
  // "Other country" is sent as ZZ (ISO user-assigned "unknown") — it only means "not Korea";
  // Paddle collects the real billing address itself.
  var COUNTRY_KR = 'KR', COUNTRY_OTHER = 'ZZ';
  var SEAT_TIMEOUT_MS = 3 * 60 * 1000; // heartbeat window → "in use"
  // Display catalog. Kept empty while prices are unpublished (PRICES_PUBLIC = false) so the amounts
  // do not ship in this public script. To publish, copy the figures from _shared/plans.ts here.
  // Checkout always trusts the server values.
  var PRICE_CATALOG = {};
  // Mirrors PIONEER_CUTOFF_ISO in _shared/plans.ts — the server decides; this only guides the buttons.
  var PIONEER_CUTOFF_MS = Date.parse('2028-01-01T00:00:00+09:00');
  function planOpen(plan) {
    var pioneerPeriod = Date.now() < PIONEER_CUTOFF_MS;
    return plan === 'pioneer_annual' ? pioneerPeriod : !pioneerPeriod;
  }
  // Display only: Korean pages show KRW, every other language shows USD (JPY/CNY dropped 2026-11-10).
  var LANG_CURRENCY = { ko: 'KRW', en: 'USD', ja: 'USD', zh: 'USD' };
  var CURRENCY_LOCALE = { KRW: 'ko-KR', USD: 'en-US' };

  // ── small DOM utils ─────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }
  function show(node) { if (node) node.style.display = ''; }
  function hide(node) { if (node) node.style.display = 'none'; }
  function setText(id, txt) { var n = el(id); if (n) n.textContent = txt; }
  function tr() { return (window.T && window.T[window.currentLang]) || (window.T && window.T.en) || {}; }
  function t(key, fallback) { var d = tr(); return (d && d[key]) || fallback || key; }
  function currentCurrency() { return LANG_CURRENCY[window.currentLang] || 'USD'; }
  function money(n, currency) {
    var c = currency || currentCurrency();
    try {
      return new Intl.NumberFormat(CURRENCY_LOCALE[c] || 'en-US', {
        style: 'currency', currency: c, maximumFractionDigits: 0
      }).format(Math.round(Number(n) || 0));
    } catch (e) { return c + ' ' + Math.round(Number(n) || 0).toLocaleString('en-US'); }
  }
  function unitPrice(plan, currency) {
    var row = PRICE_CATALOG[plan];
    return row ? row[currency || currentCurrency()] : 0;
  }
  function fmtDate(s) {
    if (!s) return '—';
    var d = new Date(s); if (isNaN(d)) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ── styled notice modal (replaces the native alert) ─────────────
  function notify(message, opts) {
    opts = opts || {};
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(6,8,12,.6);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:0;transition:opacity .16s ease;';
    var card = document.createElement('div');
    card.style.cssText = 'max-width:440px;width:100%;background:var(--surface-2,#14161d);border:1px solid var(--border,rgba(255,255,255,.1));border-radius:16px;padding:26px 26px 20px;box-shadow:0 24px 64px rgba(0,0,0,.55);transform:translateY(10px) scale(.98);transition:transform .18s cubic-bezier(.2,.8,.2,1);';
    var ui = 'font-family:var(--font-ui,system-ui,-apple-system,sans-serif)';
    var icon  = opts.icon  ? '<div style="font-size:30px;line-height:1;margin-bottom:12px">' + opts.icon + '</div>' : '';
    var title = opts.title ? '<div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;' + ui + '">' + escapeHtml(opts.title) + '</div>' : '';
    card.innerHTML = icon + title +
      '<div style="font-size:14px;line-height:1.6;color:var(--text-soft,#c7ccd6);' + ui + '">' + escapeHtml(message) + '</div>' +
      '<div style="display:flex;justify-content:flex-end;margin-top:22px">' +
        '<button type="button" style="background:var(--accent,#5fd0a8);color:var(--accent-ink,#06281c);border:none;border-radius:10px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;' + ui + '">' +
          (opts.okText || 'Got it') + '</button></div>';
    ov.appendChild(card);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.style.opacity = '1'; card.style.transform = 'translateY(0) scale(1)'; });
    function close() {
      ov.style.opacity = '0';
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 170);
      document.removeEventListener('keydown', onKey);
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter') close(); }
    card.querySelector('button').addEventListener('click', close);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    return ov;
  }

  // ── Edge Function call (graceful) ───────────────────────────────
  // returns { ok, data, error, notReady }
  async function callFn(name, body) {
    if (!window._sb || !_sb.functions) return { ok: false, notReady: true, error: 'no client' };
    try {
      var res = await _sb.functions.invoke(name, { body: body || {} });
      if (res.error) {
        // FunctionsFetchError (not deployed / network) vs HTTP error. An HTTP error carries our
        // JSON body ({ error: "<code>" }) on error.context — read the code so the page can say why.
        var code = null;
        try {
          var ctx = res.error.context;
          if (ctx && typeof ctx.json === 'function') { var j = await ctx.json(); code = (j && j.error) || null; }
        } catch (e) { /* not JSON */ }
        return { ok: false, notReady: !code, code: code, error: res.error.message || String(res.error) };
      }
      return { ok: true, data: res.data };
    } catch (e) {
      return { ok: false, notReady: true, error: (e && e.message) || String(e) };
    }
  }

  // ── app_config (commercial_mode / billing_enabled) ──────────────
  var _cfg = { commercial_mode: false, billing_enabled: false, loaded: false };
  async function loadConfig() {
    try {
      var r = await _sb.from('app_config').select('key,value');
      if (r && r.data) {
        r.data.forEach(function (row) {
          var v = row.value;
          if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) {} }
          _cfg[row.key] = v === true || v === 'true';
        });
      }
    } catch (e) { /* tables not migrated yet — keep defaults */ }
    _cfg.loaded = true;
    return _cfg;
  }

  // ── payment SDK loader (Toss v2 · Paddle.js v2) ─────────────────
  var _sdkPromises = {};
  function loadSdk(url, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);
    if (_sdkPromises[url]) return _sdkPromises[url];
    _sdkPromises[url] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = function () { window[globalName] ? resolve(window[globalName]) : reject(new Error(globalName + ' missing')); };
      s.onerror = function () { delete _sdkPromises[url]; reject(new Error(globalName + ' SDK failed to load')); };
      document.head.appendChild(s);
    });
    return _sdkPromises[url];
  }

  // ── billing-country chooser (right before checkout · user decision 2026-11-10) ──
  // Resolves { country:'KR'|'ZZ', bizNo, consents } or null (cancelled). Korean pages pre-select Korea.
  // Korea also asks the buyer type (§17.7d): optional business number (verified at NTS by the server)
  // + the consents that apply. The server re-checks everything — this only collects and explains.
  // No amounts are shown here (prices stay unpublished in this public script).
  function chooseCountry(plan) {
    return new Promise(function (resolve) {
      var preKR = window.currentLang === 'ko';
      var annualLike = plan !== 'monthly';
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(6,8,12,.6);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);';
      var ui = 'font-family:var(--font-ui,system-ui,-apple-system,sans-serif)';
      // Options are built with DOM nodes (textContent), not HTML strings.
      function opt(val, label, checked) {
        var lab = document.createElement('label');
        lab.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;margin-top:8px;border:1px solid var(--border,rgba(255,255,255,.1));border-radius:10px;cursor:pointer;color:#fff;font-size:14px;' + ui;
        var inp = document.createElement('input');
        inp.type = 'radio'; inp.name = 'billCountry'; inp.value = val; inp.checked = !!checked;
        lab.appendChild(inp);
        lab.appendChild(document.createTextNode(' ' + label));
        return lab;
      }
      ov.innerHTML =
        '<div role="dialog" aria-modal="true" style="max-width:460px;width:100%;background:var(--surface-2,#14161d);border:1px solid var(--border,rgba(255,255,255,.1));border-radius:16px;padding:24px;box-shadow:0 24px 64px rgba(0,0,0,.55)">' +
          '<div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;' + ui + '">' + escapeHtml(t('prc.countryTitle', 'Billing country')) + '</div>' +
          '<div style="font-size:13px;line-height:1.6;color:var(--text-soft,#c7ccd6);' + ui + '">' + escapeHtml(t('prc.countryBody', '')) + '</div>' +
          '<div data-slot="countries"></div>' +
          '<div data-slot="kr" style="margin-top:14px"></div>' +
          '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">' +
            '<button type="button" data-act="cancel" class="btn btn-ghost">' + escapeHtml(t('prc.countryCancel', 'Cancel')) + '</button>' +
            '<button type="button" data-act="ok" class="btn btn-primary">' + escapeHtml(t('prc.countryContinue', 'Continue to payment')) + '</button>' +
          '</div>' +
        '</div>';
      var slot = ov.querySelector('[data-slot="countries"]');
      slot.appendChild(opt(COUNTRY_KR, t('prc.countryKR', 'Korea (KRW)'), preKR));
      slot.appendChild(opt(COUNTRY_OTHER, t('prc.countryOther', 'Other country (USD)'), !preKR));

      // Korea-only block — built with DOM nodes (textContent), no HTML strings.
      var kr = ov.querySelector('[data-slot="kr"]');
      var txt = 'font-size:13px;line-height:1.6;color:var(--text-soft,#c7ccd6);' + ui;
      function para(text) { var d = document.createElement('div'); d.style.cssText = txt; d.textContent = text; return d; }
      function check(key, label) {
        var lab = document.createElement('label');
        lab.style.cssText = 'display:flex;align-items:flex-start;gap:8px;margin-top:8px;cursor:pointer;color:#fff;font-size:13px;line-height:1.5;' + ui;
        var c = document.createElement('input'); c.type = 'checkbox'; c.setAttribute('data-consent', key); c.style.marginTop = '3px';
        lab.appendChild(c); lab.appendChild(document.createTextNode(label));
        return lab;
      }
      var bizLabel = para(t('prc.bizNoLabel', 'Business registration number (optional)'));
      var biz = document.createElement('input');
      biz.type = 'text'; biz.inputMode = 'numeric'; biz.maxLength = 12; biz.placeholder = '000-00-00000'; biz.setAttribute('autocomplete', 'off');
      biz.style.cssText = 'width:100%;margin-top:6px;padding:8px 10px;border-radius:8px;border:1px solid var(--border-strong,rgba(255,255,255,.2));background:var(--surface-1,#0e1015);color:#fff;font-size:14px;font-family:var(--font-mono,monospace)';
      var bizHint = para(t('prc.bizNoHint', 'Enter it to buy as a business (checked with the National Tax Service). Leave it empty to buy as an individual.'));
      var consentBox = document.createElement('div');
      kr.appendChild(bizLabel); kr.appendChild(biz); kr.appendChild(bizHint); kr.appendChild(consentBox);

      var okBtn = null;
      function isKR() { var s = ov.querySelector('input[name="billCountry"]:checked'); return !!s && s.value === COUNTRY_KR; }
      function hasBiz() { return biz.value.replace(/[\s-]/g, '') !== ''; }
      function renderConsents() {
        consentBox.textContent = '';
        if (hasBiz()) {
          consentBox.appendChild(check('businessUse', t('prc.agreeBusinessUse', 'This is a purchase for business use.')));
          consentBox.appendChild(check('refundTerms', t('prc.agreeBizRefund', 'I agree that business purchases are not refunded for change of mind or early cancellation.')));
        } else if (annualLike) {
          consentBox.appendChild(para(t('prc.indivRefundFormula', 'Early cancellation refund = amount paid × remaining days ÷ contract days − 10% of the amount paid (0 if negative). The day you cancel counts as used.')));
          consentBox.appendChild(check('refundTerms', t('prc.agreeIndivProrated', 'I agree to this refund calculation.')));
        } else {
          consentBox.appendChild(check('refundTerms', t('prc.agreeIndivMonthly', 'I agree that cancelling a monthly plan stops it from the next month, and the current month is not refunded.')));
        }
        sync();
      }
      function sync() {
        kr.style.display = isKR() ? '' : 'none';
        if (!okBtn) return;
        var ok = true;
        if (isKR()) consentBox.querySelectorAll('input[data-consent]').forEach(function (c) { if (!c.checked) ok = false; });
        okBtn.disabled = !ok;
      }
      var lastHasBiz = false;
      biz.addEventListener('input', function () { if (hasBiz() !== lastHasBiz) { lastHasBiz = hasBiz(); renderConsents(); } });
      consentBox.addEventListener('change', sync);
      ov.querySelectorAll('input[name="billCountry"]').forEach(function (r) { r.addEventListener('change', sync); });
      document.body.appendChild(ov);
      okBtn = ov.querySelector('[data-act="ok"]');
      renderConsents();
      function finish(v) {
        document.removeEventListener('keydown', onKey);
        if (ov.parentNode) ov.parentNode.removeChild(ov);
        resolve(v);
      }
      function onKey(e) { if (e.key === 'Escape') finish(null); }
      document.addEventListener('keydown', onKey);
      ov.addEventListener('mousedown', function (e) { if (e.target === ov) finish(null); });
      ov.querySelector('[data-act="cancel"]').addEventListener('click', function () { finish(null); });
      okBtn.addEventListener('click', function () {
        var sel = ov.querySelector('input[name="billCountry"]:checked');
        if (!sel) return finish(null);
        if (sel.value !== COUNTRY_KR) return finish({ country: sel.value, bizNo: '', consents: {} });
        var consents = {};
        consentBox.querySelectorAll('input[data-consent]').forEach(function (c) { consents[c.getAttribute('data-consent')] = c.checked; });
        finish({ country: COUNTRY_KR, bizNo: biz.value.trim(), consents: consents });
      });
    });
  }

  function checkoutError(code) {
    if (code === 'bad_biz_no') return t('prc.bizBad', 'Check the business registration number (10 digits).');
    if (code === 'biz_not_verified') return t('prc.bizNotVerified', 'This number is not an active business at the National Tax Service. Check it, or leave it empty to buy as an individual.');
    if (code === 'biz_check_unavailable') return t('prc.bizCheckDown', 'The business number check is not available right now. Please try again shortly.');
    if (code === 'consent_required') return t('prc.consentRequired', 'Please confirm the required agreements.');
    if (code === 'country_locked') return t('prc.countryLocked', 'Your company is already billed in another currency. Contact support.');
    if (code === 'paddle_not_configured' || code === 'paddle_price_mismatch') return t('prc.paddleNotReady', 'International checkout is not available yet.');
    if (code === 'plan_closed') return t('prc.planClosed', 'Not available now');
    return t('prc.backendPending', 'Checkout is not connected yet.');
  }

  // =================================================================
  //  PRICING PAGE
  // =================================================================
  // Amounts stay hidden until the owner decides to publish them (independent of commercial_mode,
  // which gates licensing and the trial clock). Flip to true to show the catalog.
  var PRICES_PUBLIC = false;
  function renderPlanPrices() {
    document.querySelectorAll('[data-plan-price]').forEach(function (node) {
      node.textContent = PRICES_PUBLIC ? money(unitPrice(node.getAttribute('data-plan-price'))) : t('prc.tba', 'To be announced');
    });
  }

  function initPricing() {
    var input = el('seatInput');
    if (!input) {
      // Home pricing section: same cards, no seat stepper or checkout.
      renderPlanPrices();
      var prevHomeLang = window.onLangApplied;
      window.onLangApplied = function (lang) { if (prevHomeLang) prevHomeLang(lang); renderPlanPrices(); };
      return;
    }

    function seats() {
      var n = parseInt(input.value, 10);
      if (isNaN(n) || n < 1) n = 1;
      if (n > 999) n = 999;
      return n;
    }
    function recompute() {
      var n = seats();
      renderPlanPrices();
      document.querySelectorAll('[data-total-plan]').forEach(function (node) {
        var seatText = n + ' ' + (n === 1 ? t('prc.seatOne', 'seat') : t('prc.seatMany', 'seats'));
        var plan = node.getAttribute('data-total-plan');
        var perKey = plan === 'monthly' ? 'prc.totalMonth' : 'prc.totalYear';
        node.textContent = PRICES_PUBLIC ? seatText + ' · ' + money(unitPrice(plan) * n) + ' ' + t(perKey, '') : seatText;
      });
      var renew = document.querySelector('[data-i18n="prc.pioneerRenew"]');
      if (renew) renew.textContent = t('prc.pioneerRenew', 'Renewal price announced at launch');
    }
    el('seatMinus') && el('seatMinus').addEventListener('click', function () { input.value = Math.max(1, seats() - 1); recompute(); });
    el('seatPlus') && el('seatPlus').addEventListener('click', function () { input.value = Math.min(999, seats() + 1); recompute(); });
    input.addEventListener('input', recompute);
    recompute();

    document.querySelectorAll('[data-subscribe]').forEach(function (btn) {
      if (!planOpen(btn.getAttribute('data-subscribe'))) {
        btn.disabled = true;
        // i18n re-applies data-i18n on load and language change, so the key must change too.
        btn.setAttribute('data-i18n', 'prc.planClosed');
        btn.textContent = t('prc.planClosed', 'Not available now');
        return;
      }
      btn.addEventListener('click', function () {
        var plan = btn.getAttribute('data-subscribe');
        startCheckout(plan, seats(), btn);
      });
    });
    // Returning from the Toss card page (successUrl / failUrl). Wait for the first language apply so
    // the notice is in the page language (i18n applies after this script runs); `load` is the fallback.
    var resumed = false;
    function resumeOnce() { if (resumed) return; resumed = true; resumeTossReturn(); }
    var prevLangResume = window.onLangApplied;
    window.onLangApplied = function (lang) { if (prevLangResume) prevLangResume(lang); resumeOnce(); };
    window.addEventListener('load', function () { setTimeout(resumeOnce, 0); });

    // billing-mode note
    loadConfig().then(function () {
      recompute();
      var note = el('billingModeNote');
      if (!note) return;
      if (!_cfg.commercial_mode) {
        note.textContent = t('prc.noteBeta', 'Subscriptions open at commercial launch. Checkout currently runs in test mode (no real charge).');
        note.style.display = 'block';
      } else if (!_cfg.billing_enabled) {
        note.textContent = t('prc.noteTest', 'Test mode — checkout runs in the payment provider\'s sandbox; no real charge is made.');
        note.style.display = 'block';
      }
    });
    // re-localize totals on language change
    var prevLang = window.onLangApplied;
    window.onLangApplied = function (lang) { if (prevLang) prevLang(lang); recompute(); };
  }

  async function startCheckout(plan, seatCount, btn) {
    if (!window._user) { if (window.openModal) openModal('login'); return; }

    // Beta: billing is not enabled yet → STRIX is free, do NOT open a real checkout.
    await loadConfig();
    if (!_cfg.billing_enabled) {
      notify(
        t('prc.betaFree', 'STRIX is currently in beta and 100% free to use — no payment needed. Paid subscriptions open at the official launch.'),
        { icon: '🎉', title: t('prc.betaTitle', 'Free during the beta'), okText: t('prc.betaOk', 'Got it') }
      );
      return;
    }

    // 0) billing country, chosen right before checkout (the server still decides the gateway)
    var choice = await chooseCountry(plan);
    if (!choice) return;

    var orig = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = t('prc.processing', 'Processing…'); }
    function done() { if (btn) { btn.disabled = false; btn.textContent = orig; } }

    // 1) server picks gateway + price and returns what the payment page needs
    var start = await callFn('create-checkout', {
      action: 'start', plan: plan, seats: seatCount, country: choice.country,
      bizNo: choice.bizNo || undefined, consents: choice.consents
    });
    if (!start.ok) { done(); notify(checkoutError(start.code)); return; }
    var p = start.data || {};

    if (p.provider === 'toss') return startToss(p, plan, seatCount, done);
    if (p.provider === 'paddle') return startPaddle(p, done);
    done();
    notify(t('prc.backendPending', 'Checkout is not connected yet.'));
  }

  // ── Toss Payments: card registration (billing auth) → redirect back here with authKey ──
  // The billing key is issued SERVER-side from that one-time authKey (confirm); it never reaches the browser.
  async function startToss(p, plan, seatCount, done) {
    var TossPayments;
    try { TossPayments = await loadSdk(TOSS_SDK_URL, 'TossPayments'); }
    catch (e) { done(); notify(t('prc.sdkFail', 'Could not load the payment module. Check your connection and retry.')); return; }
    var back = window.location.origin + window.location.pathname;
    var q = '?pg=toss&issue=' + encodeURIComponent(p.issueId) + '&plan=' + encodeURIComponent(plan) + '&seats=' + encodeURIComponent(seatCount);
    try {
      var payment = TossPayments(p.clientKey).payment({ customerKey: p.customerKey });
      await payment.requestBillingAuth({
        method: 'CARD',
        successUrl: back + q,
        failUrl: back + q + '&fail=1',
        customerEmail: (p.customer && p.customer.email) || undefined,
        customerName: (p.customer && p.customer.name) || undefined
      });
      // the page navigates away on success; reaching here means it did not
    } catch (e) {
      done();
      notify(t('prc.payCancelled', 'Payment was cancelled.'));
    }
  }

  // Back from the Toss page: confirm on the server (issue billing key + first charge + activate).
  async function resumeTossReturn() {
    var qs = new URLSearchParams(window.location.search);
    if (qs.get('pg') !== 'toss') return;
    // authKey is single-use — take it out of the address bar and history right away.
    var authKey = qs.get('authKey'), customerKey = qs.get('customerKey');
    var issueId = qs.get('issue'), plan = qs.get('plan'), seats = parseInt(qs.get('seats'), 10);
    var failed = qs.get('fail') === '1';
    try { window.history.replaceState(null, '', window.location.pathname + window.location.hash); } catch (e) {}
    if (failed || !authKey || !customerKey || !issueId) {
      notify(failed ? t('prc.payCancelled', 'Payment was cancelled.') : t('prc.payFailed', 'Payment did not go through. No charge was made.'));
      return;
    }
    var r = await callFn('create-checkout', {
      action: 'confirm', plan: plan, seats: seats, country: COUNTRY_KR,
      issueId: issueId, authKey: authKey, customerKey: customerKey
    });
    if (r.ok) { window.location.href = 'account.html'; return; }
    notify(r.code === 'charge_failed' || r.code === 'billing_key_issue_failed'
      ? t('prc.payFailed', 'Payment did not go through. No charge was made.')
      : (r.code === 'country_locked' ? checkoutError(r.code) : t('prc.confirmFail', 'Your card was authorized but activation failed. Please contact support.')));
  }

  // ── Paddle: the server created the transaction; Paddle.js only opens it ──
  var _paddleReady = false;
  async function startPaddle(p, done) {
    var Paddle;
    try { Paddle = await loadSdk(PADDLE_JS_URL, 'Paddle'); }
    catch (e) { done(); notify(t('prc.sdkFail', 'Could not load the payment module. Check your connection and retry.')); return; }
    try {
      if (!_paddleReady) {
        if (p.environment === 'sandbox' && Paddle.Environment && Paddle.Environment.set) Paddle.Environment.set('sandbox');
        Paddle.Initialize({
          token: p.clientToken,
          eventCallback: function (ev) {
            // Activation is done by paddle-webhook; the account page shows it when it lands.
            if (ev && ev.name === 'checkout.completed') window.location.href = 'account.html?pending=1';
            if (ev && ev.name === 'checkout.closed') done();
          }
        });
        _paddleReady = true;
      }
      Paddle.Checkout.open({
        transactionId: p.transactionId,
        customer: (p.customer && p.customer.email) ? { email: p.customer.email } : undefined
      });
    } catch (e) {
      done();
      notify(t('prc.sdkFail', 'Could not load the payment module. Check your connection and retry.'));
    }
  }

  // =================================================================
  //  ACCOUNT PAGE
  // =================================================================
  var _org = null, _role = 'member';

  async function initAccount() {
    var gate = el('acctLoginGate'), dash = el('acctDash');
    if (!window._user) { show(gate); hide(dash); return; }
    hide(gate); show(dash);

    await loadConfig();
    await renderProfile();
    await loadOrgAndRender();
    wireProfileSave();
    wireInvite();
    wireJoinBox();     // member: join a company by code (works even with no org)
    wireCodeShare();   // owner/admin: copy / regenerate the company join code
    wireOrgAiKey();    // owner/admin: company-paid AI keys
  }

  async function renderProfile() {
    var prof = window._profile;
    if (!prof) {
      try { var r = await _sb.from('profiles').select('*').eq('id', _user.id).single(); prof = r.data; } catch (e) {}
    }
    if (el('pf_name')) el('pf_name').value = (prof && prof.name) || '';
    if (el('pf_affiliation')) el('pf_affiliation').value = (prof && prof.affiliation) || '';
    if (el('pf_phone')) el('pf_phone').value = (prof && prof.phone) || '';
    if (el('pf_email')) el('pf_email').value = _user.email || '';
  }

  function wireProfileSave() {
    var btn = el('profileSaveBtn'); if (!btn) return;
    btn.addEventListener('click', async function () {
      var msg = el('profileMsg'); msg.className = 'msg'; msg.textContent = '';
      btn.disabled = true;
      var patch = {
        name: el('pf_name').value.trim(),
        affiliation: el('pf_affiliation').value.trim(),
        phone: el('pf_phone').value.trim()
      };
      var r = await _sb.from('profiles').update(patch).eq('id', _user.id);
      btn.disabled = false;
      if (r.error) { msg.className = 'msg err'; msg.textContent = r.error.message; }
      else { msg.className = 'msg ok'; msg.textContent = t('acct.profSaved', 'Saved.'); }
    });
  }

  async function loadOrgAndRender() {
    // organizations visible via RLS = my orgs. Prefer the one I own.
    var orgs = [];
    // Explicit columns: ai_api_key/ai_stt_key are column-revoked for members (migration §8b).
    try { var r = await _sb.from('organizations').select('id,name,owner_user_id,seats,join_code,created_at'); orgs = (r && r.data) || []; }
    catch (e) { return billingUnavailable(); }
    if (!orgs.length) return billingUnavailable();

    _org = orgs.filter(function (o) { return o.owner_user_id === _user.id; })[0] || orgs[0];

    // my role
    try {
      var rm = await _sb.from('org_members').select('role').eq('org_id', _org.id).eq('user_id', _user.id).single();
      _role = (rm && rm.data && rm.data.role) || 'member';
    } catch (e) { _role = 'member'; }

    // Owners manage their company; hide the "join a company" box for them.
    if (_role === 'owner' || _role === 'admin') hide(el('joinPanel')); else show(el('joinPanel'));

    setText('acctOrgName', _org.name || t('acct.titleOrg', 'company'));
    setText('coName', _org.name || '—');
    setText('coOwner', _org.owner_user_id === _user.id ? (t('acct.you', 'You')) : '—');

    await Promise.all([renderSubscription(), renderSeats(), renderMembers(), renderPayments()]);
  }

  function billingUnavailable() {
    var sb = el('subBody');
    if (sb) sb.innerHTML = '<div class="empty-line">' + t('acct.unavailable', 'Billing is not enabled yet. Subscriptions go live at commercial launch.') + '</div>';
    setText('coName', '—'); setText('coSeats', '—'); setText('coInUse', '—');
    var ml = el('orgMembersList'); if (ml) ml.innerHTML = '<div class="empty-line">' + t('acct.unavailable', 'Billing is not enabled yet.') + '</div>';
    var pb = el('paymentsBody'); if (pb) pb.innerHTML = '<tr><td colspan="5" class="empty-line">' + t('acct.noPayments', 'No payments yet.') + '</td></tr>';
  }

  async function renderSubscription() {
    var body = el('subBody'); if (!body) return;
    var subs = [];
    // 🚨 select('*') 금지 — subscriptions 에는 컬럼 revoke 가 걸려 있다.
    //    pg_subscription_id 는 토스 **빌링키**(Paddle 이면 구독 ID)이고, pg_customer_key 와 함께면 카드가 긁힌다.
    //    `*` 로 읽으면 권한이 없는 컬럼 때문에 질의 자체가 실패해 결제 화면이 빈다.
    //    단일 원천: security_hardening_devplan.md §5 SEC-07 · 검사 = npm run check:supabase-column-guard
    var SUB_COLS = 'id, status, plan, seats, currency, unit_amount, renewal_unit_amount,' +
                   ' current_period_end, cancel_at_period_end, is_pioneer, created_at';
    try { var r = await _sb.from('subscriptions').select(SUB_COLS).eq('org_id', _org.id); subs = (r && r.data) || []; }
    catch (e) { return; }

    var live = subs.filter(function (s) { return s.status === 'active' || s.status === 'trialing' || s.status === 'past_due'; });
    var badge = el('subBadge'), badgeText = el('subBadgeText');

    if (!live.length) {
      if (badge) hide(badge);
      // Back from a Paddle checkout: paddle-webhook activates the subscription a moment later.
      var pending = parseInt(new URLSearchParams(window.location.search).get('pending'), 10);
      if (pending >= 1 && pending <= 5) {
        body.innerHTML = '<p class="dim">' + escapeHtml(t('acct.pendingActivation', 'Payment received. Your subscription appears here in a moment.')) + '</p>';
        setTimeout(function () {
          try { window.history.replaceState(null, '', window.location.pathname + '?pending=' + (pending + 1)); } catch (e) {}
          renderSubscription();
        }, 5000);
        return;
      }
      body.innerHTML =
        '<p class="dim" style="margin-bottom:var(--sp-4)">' + t('acct.noSub', 'No active subscription. Start a plan to unlock commercial use beyond the trial.') + '</p>' +
        '<a href="pricing.html" class="btn btn-primary">' + t('acct.choosePlan', 'Choose a plan') + '</a>';
      return;
    }

    // primary = the one with furthest period end
    live.sort(function (a, b) { return new Date(b.current_period_end || 0) - new Date(a.current_period_end || 0); });
    var s = live[0];
    var totalSeats = live.reduce(function (sum, x) { return sum + (x.seats || 0); }, 0);
    var planLabel = { annual: t('prc.annualName', 'Annual'), monthly: t('prc.monthlyName', 'Monthly'), pioneer_annual: t('prc.pioneerName', 'Pioneer') }[s.plan] || s.plan;
    var statusKey = 'acct.st_' + s.status;
    var statusTxt = t(statusKey, s.status);
    var statusClass = (s.status === 'active' || s.status === 'trialing') ? 'badge-verified' : (s.status === 'past_due' ? 'badge-beta' : 'badge-standard');

    if (badge) { badge.className = 'badge ' + statusClass; badge.style.display = ''; if (badgeText) badgeText.textContent = statusTxt; }

    var renewLine = s.cancel_at_period_end
      ? '<div class="kv"><span class="k">' + t('acct.renewal', 'Renewal') + '</span><span class="v" style="color:var(--warn)">' + t('acct.willCancel', 'Cancels at period end') + '</span></div>'
      : '<div class="kv"><span class="k">' + t('acct.renewal', 'Renewal') + '</span><span class="v">' + (s.plan === 'monthly' ? t('acct.autoMonthly', 'Auto-renews monthly') : t('acct.autoAnnual', 'Auto-renews annually')) + '</span></div>';

    body.innerHTML =
      '<div class="kv"><span class="k">' + t('acct.plan', 'Plan') + '</span><span class="v strong">' + planLabel + (s.is_pioneer ? ' · ' + t('acct.pioneer1yr', '1st-year price') : '') + '</span></div>' +
      '<div class="kv"><span class="k">' + t('acct.seatsBought', 'Seats') + '</span><span class="v">' + totalSeats + '</span></div>' +
      '<div class="kv"><span class="k">' + t('acct.periodEnd', 'Current period ends') + '</span><span class="v">' + fmtDate(s.current_period_end) + '</span></div>' +
      renewLine +
      '<div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-4);flex-wrap:wrap">' +
        '<a href="pricing.html" class="btn btn-secondary">' + t('acct.addSeats', 'Add / change seats') + '</a>' +
        (s.cancel_at_period_end ? '' : '<button class="btn btn-ghost" id="cancelBtn">' + t('acct.cancel', 'Cancel subscription') + '</button>') +
      '</div>' +
      '<div class="msg" id="cancelMsg"></div>';

    var cb = el('cancelBtn');
    if (cb) cb.addEventListener('click', function () { cancelSub(s.id); });
  }

  async function cancelSub(subId) {
    if (!window.confirm(t('acct.cancelConfirm', 'Cancel renewal? You keep access until the current period ends.'))) return;
    var msg = el('cancelMsg'); if (msg) { msg.className = 'msg'; msg.textContent = t('acct.cancelling', 'Cancelling…'); }
    var r = await callFn('cancel-subscription', { subscriptionId: subId });
    if (!r.ok) { if (msg) { msg.className = 'msg err'; msg.textContent = t('prc.backendPending', 'Backend not connected yet.'); } return; }
    if (msg) { msg.className = 'msg ok'; msg.textContent = t('acct.cancelled', 'Renewal cancelled.'); }
    renderSubscription();
  }

  async function renderSeats() {
    var totalSeats = _org.seats || 0;
    var inUse = 0;
    try {
      var r = await _sb.from('app_sessions').select('user_id,last_heartbeat,released_at').eq('org_id', _org.id);
      var now = Date.now();
      ((r && r.data) || []).forEach(function (s) {
        if (!s.released_at && (now - new Date(s.last_heartbeat).getTime()) < SEAT_TIMEOUT_MS) inUse++;
      });
    } catch (e) {}
    setText('coSeats', String(totalSeats));
    setText('coInUse', inUse + ' / ' + totalSeats);
    var meter = el('seatMeter');
    if (meter) meter.style.width = (totalSeats > 0 ? Math.min(100, Math.round(inUse / totalSeats * 100)) : 0) + '%';
  }

  async function renderMembers() {
    var list = el('orgMembersList'); if (!list) return;
    // Prefer enriched list (names/emails) from Edge Function (service-role).
    var members = null;
    var invites = [];
    var joinCode = null;
    var fn = await callFn('org-member', { action: 'list', orgId: _org.id });
    if (fn.ok && fn.data && fn.data.members) { members = fn.data.members; invites = fn.data.invites || []; joinCode = fn.data.join_code || null; }

    if (!members) {
      // Fallback: RLS-visible org_members (user_id + role only)
      try {
        var r = await _sb.from('org_members').select('user_id,role').eq('org_id', _org.id);
        members = ((r && r.data) || []).map(function (m) {
          return { user_id: m.user_id, role: m.role, name: (m.user_id === _user.id ? t('acct.you', 'You') : m.user_id.slice(0, 8)), email: '' };
        });
      } catch (e) { members = []; }
    }

    setText('memCount', members.length + ' ' + (members.length === 1 ? t('acct.member', 'member') : t('acct.members', 'members')));

    var canManage = (_role === 'owner' || _role === 'admin');
    list.innerHTML = members.map(function (m) {
      var nm = m.name || m.email || m.user_id;
      var initial = (nm || '?').charAt(0).toUpperCase();
      var roleCls = m.role === 'owner' ? 'mrole owner' : 'mrole';
      var rm = (canManage && m.role !== 'owner' && m.user_id !== _user.id)
        ? '<button class="mrm" data-rm="' + m.user_id + '">' + t('acct.remove', 'Remove') + '</button>' : '';
      return '<div class="mrow">' +
        '<div class="mavatar">' + initial + '</div>' +
        '<div><div class="mname">' + escapeHtml(nm) + (m.user_id === _user.id ? ' <span class="memail">(' + t('acct.you', 'You') + ')</span>' : '') + '</div>' +
        (m.email ? '<div class="memail">' + escapeHtml(m.email) + '</div>' : '') + '</div>' +
        '<span class="' + roleCls + '">' + m.role + '</span>' + rm +
      '</div>';
    }).join('');

    // Pending invites (not-yet-registered emails) — shown below members with a badge.
    if (invites.length) {
      list.innerHTML += invites.map(function (iv) {
        var rv = canManage ? '<button class="mrm" data-rv="' + iv.id + '">' + t('acct.revoke', 'Revoke') + '</button>' : '';
        return '<div class="mrow">' +
          '<div class="mavatar" style="opacity:.5">@</div>' +
          '<div><div class="mname">' + escapeHtml(iv.email) + '</div>' +
          '<div class="memail">' + t('acct.invitePending', 'Pending — joins when they sign up') + '</div></div>' +
          '<span class="mrole">' + t('acct.pending', 'Pending') + '</span>' + rv +
        '</div>';
      }).join('');
    }

    list.querySelectorAll('[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () { removeMember(b.getAttribute('data-rm')); });
    });
    list.querySelectorAll('[data-rv]').forEach(function (b) {
      b.addEventListener('click', function () { revokeInvite(b.getAttribute('data-rv')); });
    });

    if (canManage) show(el('inviteRow')); else hide(el('inviteRow'));

    // Owner/admin: company join code + company AI keys.
    if (canManage) {
      show(el('joinCodeRow'));
      setText('joinCodeValue', joinCode || '—');
      show(el('aiKeyPanel'));
      loadOrgAiStatus();
    } else {
      hide(el('joinCodeRow'));
      hide(el('aiKeyPanel'));
    }
  }

  // ── member: join a company by code (works even when the user has no org) ──
  function wireJoinBox() {
    var btn = el('joinBtn'); if (!btn) return;
    btn.addEventListener('click', async function () {
      var code = (el('joinCodeInput').value || '').trim().toUpperCase();
      var msg = el('joinMsg'); msg.className = 'msg'; msg.textContent = '';
      if (!code) { msg.className = 'msg err'; msg.textContent = t('acct.joinNeedCode', 'Enter a code.'); return; }
      btn.disabled = true; msg.textContent = t('acct.joining', 'Joining…');
      var r = await callFn('join-org', { code: code });
      btn.disabled = false;
      if (!r.ok) { msg.className = 'msg err'; msg.textContent = t('prc.backendPending', 'Backend not connected yet.'); return; }
      if (r.data && r.data.error) {
        msg.className = 'msg err';
        msg.textContent = r.data.error === 'invalid_code'
          ? t('acct.joinInvalid', 'That code is not valid. Check it with your administrator.')
          : r.data.error;
        return;
      }
      msg.className = 'msg ok';
      msg.textContent = (r.data && r.data.already)
        ? t('acct.joinAlready', 'You are already in this company.')
        : t('acct.joined', 'Joined! Reloading…');
      setTimeout(function () { window.location.reload(); }, 800);
    });
  }

  // ── owner/admin: copy / regenerate the company join code ──
  function wireCodeShare() {
    var copy = el('copyCodeBtn'), regen = el('regenCodeBtn');
    if (copy) copy.addEventListener('click', function () {
      var code = (el('joinCodeValue').textContent || '').trim();
      if (!code || code === '—') return;
      try { if (navigator.clipboard) navigator.clipboard.writeText(code); } catch (e) {}
      var msg = el('codeMsg'); if (msg) { msg.className = 'msg ok'; msg.textContent = t('acct.copied', 'Copied.'); }
    });
    if (regen) regen.addEventListener('click', async function () {
      if (!_org) return;
      if (!window.confirm(t('acct.regenConfirm', 'Generate a new code? The current code will stop working immediately.'))) return;
      var msg = el('codeMsg'); if (msg) { msg.className = 'msg'; msg.textContent = t('acct.regenerating', 'Regenerating…'); }
      var r = await callFn('org-member', { action: 'regenerate-code', orgId: _org.id });
      if (!r.ok || (r.data && r.data.error)) {
        if (msg) { msg.className = 'msg err'; msg.textContent = (r.data && r.data.error) || t('prc.backendPending', 'Backend not connected yet.'); }
        return;
      }
      setText('joinCodeValue', r.data.join_code || '—');
      if (msg) { msg.className = 'msg ok'; msg.textContent = t('acct.regenerated', 'New code generated.'); }
    });
  }

  // ── owner/admin: company-paid AI keys ──
  async function loadOrgAiStatus() {
    if (!_org) return;
    var r = await callFn('org-ai-key', { action: 'status', orgId: _org.id });
    if (!r.ok || !r.data) return;
    setText('orgAiKeyState', r.data.ai_api_key_set ? t('acct.aiSet', '✓ Configured') : t('acct.aiUnset', 'Not set'));
    setText('orgSttKeyState', r.data.ai_stt_key_set ? t('acct.aiSet', '✓ Configured') : t('acct.aiUnset', 'Not set'));
  }
  function wireOrgAiKey() {
    var btn = el('orgAiSaveBtn'); if (!btn) return;
    btn.addEventListener('click', async function () {
      if (!_org) return;
      var msg = el('orgAiMsg'); msg.className = 'msg'; msg.textContent = '';
      var k1 = (el('orgAiKey').value || '').trim();
      var k2 = (el('orgSttKey').value || '').trim();
      var payload = { action: 'set', orgId: _org.id };
      if (k1) payload.ai_api_key = k1;
      if (k2) payload.ai_stt_key = k2;
      if (!('ai_api_key' in payload) && !('ai_stt_key' in payload)) {
        msg.className = 'msg err'; msg.textContent = t('acct.aiNothing', 'Enter a key to save.'); return;
      }
      btn.disabled = true; msg.textContent = t('acct.saving', 'Saving…');
      var r = await callFn('org-ai-key', payload);
      btn.disabled = false;
      if (!r.ok || (r.data && r.data.error)) {
        msg.className = 'msg err'; msg.textContent = (r.data && r.data.error) || t('prc.backendPending', 'Backend not connected yet.'); return;
      }
      el('orgAiKey').value = ''; el('orgSttKey').value = '';
      msg.className = 'msg ok'; msg.textContent = t('acct.aiSaved', 'Saved. Members will use the company key.');
      loadOrgAiStatus();
    });
  }

  function wireInvite() {
    var btn = el('inviteBtn'); if (!btn) return;
    btn.addEventListener('click', async function () {
      var email = (el('inviteEmail').value || '').trim();
      var msg = el('inviteMsg'); msg.className = 'msg'; msg.textContent = '';
      if (!email) { msg.className = 'msg err'; msg.textContent = t('acct.inviteNeedEmail', 'Enter an email.'); return; }
      btn.disabled = true; msg.textContent = t('acct.inviting', 'Adding…');
      var r = await callFn('org-member', { action: 'invite', orgId: _org.id, email: email });
      btn.disabled = false;
      if (!r.ok) { msg.className = 'msg err'; msg.textContent = t('prc.backendPending', 'Backend not connected yet.'); return; }
      if (r.data && r.data.error) { msg.className = 'msg err'; msg.textContent = r.data.error; return; }
      msg.className = 'msg ok';
      msg.textContent = (r.data && r.data.pending)
        ? t('acct.invitePendingMsg', 'Invitation recorded. They join when they sign up.')
        : t('acct.invited', 'Member added.');
      el('inviteEmail').value = '';
      renderMembers();
    });
  }

  async function removeMember(userId) {
    if (!window.confirm(t('acct.removeConfirm', 'Remove this member from the company?'))) return;
    var r = await callFn('org-member', { action: 'remove', orgId: _org.id, userId: userId });
    if (r.ok) renderMembers();
    else notify(t('prc.backendPending', 'Backend not connected yet.'));
  }

  async function revokeInvite(inviteId) {
    if (!window.confirm(t('acct.revokeConfirm', 'Revoke this pending invitation?'))) return;
    var r = await callFn('org-member', { action: 'revoke', orgId: _org.id, inviteId: inviteId });
    if (r.ok) renderMembers();
    else notify(t('prc.backendPending', 'Backend not connected yet.'));
  }

  var PROVIDER_LABEL = { toss: 'Toss Payments', paddle: 'Paddle' };
  async function renderPayments() {
    var body = el('paymentsBody'); if (!body) return;
    var rows = [];
    try { var r = await _sb.from('payments').select('*').eq('org_id', _org.id).order('created_at', { ascending: false }); rows = (r && r.data) || []; }
    catch (e) { body.innerHTML = '<tr><td colspan="5" class="empty-line">' + t('acct.noPayments', 'No payments yet.') + '</td></tr>'; return; }

    if (!rows.length) { body.innerHTML = '<tr><td colspan="5" class="empty-line">' + t('acct.noPayments', 'No payments yet.') + '</td></tr>'; return; }
    body.innerHTML = rows.map(function (p) {
      var st = { paid: 'badge-verified', refunded: 'badge-standard', failed: 'badge-beta' }[p.status] || 'badge-standard';
      // Expense evidence (no tax invoice — DEC-TAXINV): Toss = 카드 매출전표 (receipt.url stored by our
      // server at approval) · Paddle = invoice PDF (short-lived link, fetched on click via payment-receipt).
      // receiptUrl is still only https and escaped.
      var rurl = p.raw_event && typeof p.raw_event.receiptUrl === 'string' && /^https:\/\//.test(p.raw_event.receiptUrl) ? p.raw_event.receiptUrl : '';
      var hasDoc = p.status === 'paid' || p.status === 'refunded';
      var receipt = '—';
      if (hasDoc && p.pg_provider === 'toss' && rurl) {
        receipt = '<a href="' + escapeHtml(rurl) + '" target="_blank" rel="noopener" style="color:var(--accent)">' + escapeHtml(t('acct.cardSlip', 'Card receipt')) + '</a>';
      } else if (hasDoc && p.pg_provider === 'paddle' && /^txn_/.test(String(p.pg_payment_id || ''))) {
        receipt = '<button type="button" class="btn btn-ghost" style="padding:2px 8px" data-invoice="' + escapeHtml(p.id) + '">' + escapeHtml(t('acct.invoice', 'Invoice')) + '</button>';
      }
      return '<tr>' +
        '<td>' + fmtDate(p.paid_at || p.created_at) + '</td>' +
        '<td>' + escapeHtml(PROVIDER_LABEL[p.pg_provider] || p.pg_provider || '—') + '</td>' +
        '<td class="num">' + money(p.amount, p.currency || 'KRW') + '</td>' +
        '<td><span class="badge ' + st + '"><span class="dot"></span>' + t('acct.st_' + p.status, p.status) + '</span></td>' +
        '<td>' + receipt + '</td>' +
      '</tr>';
    }).join('');
    body.querySelectorAll('[data-invoice]').forEach(function (b) {
      b.addEventListener('click', async function () {
        // Open the tab synchronously (popup blockers), then point it at the pre-signed URL.
        var w = window.open('', '_blank');
        if (w) { try { w.opener = null; } catch (e) {} }
        var r = await callFn('payment-receipt', { paymentId: b.getAttribute('data-invoice') });
        var url = r.ok && r.data && typeof r.data.url === 'string' && /^https:\/\//.test(r.data.url) ? r.data.url : '';
        if (url && w) { w.location.href = url; return; }
        if (w) w.close();
        notify(t('acct.invoiceFail', 'The invoice is not available right now. Please try again later.'));
      });
    });
  }

  // 이스케이프의 단일 원천은 layout.js 의 window.escHtml 이다 (security_hardening_devplan.md §5 SEC-04a).
  // 여기서 다시 구현하지 말 것 — 사이트에 같은 함수가 세 벌 있었고, 없는 파일에서 뚫렸다.
  function escapeHtml(s) { return window.escHtml(s); }

  // =================================================================
  //  BOOT — wire to auth state
  // =================================================================
  var page = (document.body && document.body.dataset.page) || '';

  if (page === 'pricing' || document.querySelector('[data-plan-price]')) {
    initPricing();
  } else if (page === 'account') {
    var booted = false;
    function boot() { if (booted) return; booted = true; initAccount(); }
    // auth.js sets window._user/_profile asynchronously after loadProfile().
    // Poll briefly; if the session exists but auth.js hasn't filled the globals
    // yet, seed them from the session so we never flash the login gate.
    function waitThenBoot(session, tries) {
      if (window._user) return boot();
      if (tries <= 0) { window._user = session.user; return boot(); }
      setTimeout(function () { waitThenBoot(session, tries - 1); }, 100);
    }
    if (window._sb) {
      _sb.auth.getSession().then(function (res) {
        var session = res && res.data && res.data.session;
        if (session) waitThenBoot(session, 20); // up to ~2s for profile
        else { show(el('acctLoginGate')); hide(el('acctDash')); }
      });
      _sb.auth.onAuthStateChange(function (_evt, session) {
        if (!session) { window._user = null; booted = false; show(el('acctLoginGate')); hide(el('acctDash')); }
        else if (!booted) { waitThenBoot(session, 20); }
      });
    }
  }
})();
