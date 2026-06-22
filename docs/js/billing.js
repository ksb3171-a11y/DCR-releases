/* ============================================================================
   DCR site — billing client (pricing + account pages)
   Classic script (NOT a module). Requires: i18n.js (window.T/currentLang),
   auth.js (global _sb Supabase client, openModal). Loaded AFTER auth.js.

   Single source for plans/model = pricing_payment_devplan.md.
   Backend = Supabase Edge Functions (supabase/functions/*). When those are not
   deployed yet, every call degrades gracefully (no crash, friendly message).
   ============================================================================ */
(function () {
  'use strict';

  var PORTONE_SDK_URL = 'https://cdn.portone.io/v2/browser-sdk.js';
  var SEAT_TIMEOUT_MS = 3 * 60 * 1000; // heartbeat window → "in use"
  // Display fallback mirrors the server-authoritative catalog in _shared/plans.ts.
  // Validation checks keep the two catalogs identical; checkout always trusts server values.
  var PRICE_CATALOG = {
    pioneer_annual: { KRW: 1200000, USD: 900,  JPY: 135000, CNY: 6500 },
    annual:         { KRW: 2500000, USD: 1800, JPY: 270000, CNY: 13000 },
    monthly:        { KRW: 250000,  USD: 180,  JPY: 27000,  CNY: 1300 }
  };
  var LANG_CURRENCY = { ko: 'KRW', en: 'USD', ja: 'JPY', zh: 'CNY' };
  var CURRENCY_LOCALE = { KRW: 'ko-KR', USD: 'en-US', JPY: 'ja-JP', CNY: 'zh-CN' };

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
        // FunctionsFetchError (not deployed / network) vs HTTP error
        return { ok: false, notReady: true, error: res.error.message || String(res.error) };
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

  // ── PortOne browser SDK loader ──────────────────────────────────
  var _poPromise = null;
  function loadPortOne() {
    if (window.PortOne) return Promise.resolve(window.PortOne);
    if (_poPromise) return _poPromise;
    _poPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = PORTONE_SDK_URL;
      s.onload = function () { resolve(window.PortOne); };
      s.onerror = function () { reject(new Error('PortOne SDK failed to load')); };
      document.head.appendChild(s);
    });
    return _poPromise;
  }

  // =================================================================
  //  PRICING PAGE
  // =================================================================
  function initPricing() {
    var input = el('seatInput');
    if (!input) return;

    function seats() {
      var n = parseInt(input.value, 10);
      if (isNaN(n) || n < 1) n = 1;
      if (n > 999) n = 999;
      return n;
    }
    function recompute() {
      var n = seats();
      var currency = currentCurrency();
      document.querySelectorAll('[data-plan-price]').forEach(function (node) {
        node.textContent = money(unitPrice(node.getAttribute('data-plan-price'), currency), currency);
      });
      document.querySelectorAll('[data-total-plan]').forEach(function (node) {
        var plan = node.getAttribute('data-total-plan');
        var unit = unitPrice(plan, currency);
        var per = plan === 'monthly' ? t('prc.totalMonth', '/mo total') : t('prc.totalYear', '/yr total');
        node.textContent = money(unit * n, currency) + ' ' + per + ' · ' + n + ' ' + (n === 1 ? t('prc.seatOne', 'seat') : t('prc.seatMany', 'seats'));
      });
      var renew = document.querySelector('[data-i18n="prc.pioneerRenew"]');
      if (renew) renew.textContent = t('prc.pioneerRenew', 'Renews at {amount} / seat / year')
        .replace('{amount}', money(unitPrice('annual', currency), currency));
    }
    el('seatMinus') && el('seatMinus').addEventListener('click', function () { input.value = Math.max(1, seats() - 1); recompute(); });
    el('seatPlus') && el('seatPlus').addEventListener('click', function () { input.value = Math.min(999, seats() + 1); recompute(); });
    input.addEventListener('input', recompute);
    recompute();

    document.querySelectorAll('[data-subscribe]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var plan = btn.getAttribute('data-subscribe');
        startCheckout(plan, seats(), currentCurrency(), btn);
      });
    });

    // billing-mode note
    loadConfig().then(function () {
      var note = el('billingModeNote');
      if (!note) return;
      if (!_cfg.commercial_mode) {
        note.textContent = t('prc.noteBeta', 'Subscriptions open at commercial launch. Checkout currently runs in PortOne test mode (no real charge).');
        note.style.display = 'block';
      } else if (!_cfg.billing_enabled) {
        note.textContent = t('prc.noteTest', 'Test mode — checkout runs against PortOne sandbox; no real charge is made.');
        note.style.display = 'block';
      }
    });
    // re-localize totals on language change
    var prevLang = window.onLangApplied;
    window.onLangApplied = function (lang) { if (prevLang) prevLang(lang); recompute(); };
  }

  async function startCheckout(plan, seatCount, currency, btn) {
    if (!window._user) { if (window.openModal) openModal('login'); return; }

    // Beta: billing is not enabled yet → DCR is free, do NOT open a real checkout.
    // (Without PortOne configured the SDK would fail with "storeId required".)
    await loadConfig();
    if (!_cfg.billing_enabled) {
      notify(
        t('prc.betaFree', 'DCR is currently in beta and 100% free to use — no payment needed. Paid subscriptions open at the official launch.'),
        { icon: '🎉', title: t('prc.betaTitle', 'Free during the beta'), okText: t('prc.betaOk', 'Got it') }
      );
      return;
    }

    var orig = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = t('prc.processing', 'Processing…'); }
    function done() { if (btn) { btn.disabled = false; btn.textContent = orig; } }

    // 1) ask server to start a checkout (records pending sub, returns issue params)
    var start = await callFn('create-checkout', { action: 'start', plan: plan, seats: seatCount, currency: currency });
    if (!start.ok) {
      done();
      notify(t('prc.backendPending', 'Checkout backend is not connected yet. This will be live in PortOne test mode once Edge Functions are deployed.'));
      return;
    }
    var p = start.data || {};
    // 2) browser billing-key issuance via PortOne
    var PortOne;
    try { PortOne = await loadPortOne(); }
    catch (e) { done(); notify(t('prc.sdkFail', 'Could not load the payment module. Check your connection and retry.')); return; }

    var issue;
    try {
      issue = await PortOne.requestIssueBillingKey({
        storeId: p.storeId,
        channelKey: p.channelKey,
        billingKeyMethod: p.billingKeyMethod || 'CARD',
        issueId: p.issueId,
        issueName: p.issueName || ('DCR ' + plan),
        customer: p.customer || {}
      });
    } catch (e) { done(); notify((e && e.message) || 'Payment cancelled.'); return; }

    if (!issue || issue.code !== undefined) {
      done();
      notify((issue && issue.message) || t('prc.payCancelled', 'Payment was cancelled.'));
      return;
    }

    // 3) confirm on server: charge first period + activate subscription + sync seats
    var confirm = await callFn('create-checkout', {
      action: 'confirm', plan: plan, seats: seatCount,
      currency: p.currency || currency,
      issueId: p.issueId, billingKey: issue.billingKey
    });
    done();
    if (!confirm.ok) {
      notify(t('prc.confirmFail', 'The billing key was issued but activation failed. Please contact support — you have not been charged twice.'));
      return;
    }
    // success → go to account
    window.location.href = 'account.html';
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
    try { var r = await _sb.from('subscriptions').select('*').eq('org_id', _org.id); subs = (r && r.data) || []; }
    catch (e) { return; }

    var live = subs.filter(function (s) { return s.status === 'active' || s.status === 'trialing' || s.status === 'past_due'; });
    var badge = el('subBadge'), badgeText = el('subBadgeText');

    if (!live.length) {
      if (badge) hide(badge);
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

  async function renderPayments() {
    var body = el('paymentsBody'); if (!body) return;
    var rows = [];
    try { var r = await _sb.from('payments').select('*').eq('org_id', _org.id).order('created_at', { ascending: false }); rows = (r && r.data) || []; }
    catch (e) { body.innerHTML = '<tr><td colspan="5" class="empty-line">' + t('acct.noPayments', 'No payments yet.') + '</td></tr>'; return; }

    if (!rows.length) { body.innerHTML = '<tr><td colspan="5" class="empty-line">' + t('acct.noPayments', 'No payments yet.') + '</td></tr>'; return; }
    body.innerHTML = rows.map(function (p) {
      var st = { paid: 'badge-verified', refunded: 'badge-standard', failed: 'badge-beta' }[p.status] || 'badge-standard';
      var receipt = (p.raw_event && p.raw_event.receiptUrl)
        ? '<a href="' + p.raw_event.receiptUrl + '" target="_blank" rel="noopener" style="color:var(--accent)">' + t('acct.view', 'View') + '</a>' : '—';
      return '<tr>' +
        '<td>' + fmtDate(p.paid_at || p.created_at) + '</td>' +
        '<td>' + escapeHtml(p.pg_provider || 'PortOne') + '</td>' +
        '<td class="num">' + money(p.amount, p.currency || 'KRW') + '</td>' +
        '<td><span class="badge ' + st + '"><span class="dot"></span>' + t('acct.st_' + p.status, p.status) + '</span></td>' +
        '<td>' + receipt + '</td>' +
      '</tr>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // =================================================================
  //  BOOT — wire to auth state
  // =================================================================
  var page = (document.body && document.body.dataset.page) || '';

  if (page === 'pricing') {
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
