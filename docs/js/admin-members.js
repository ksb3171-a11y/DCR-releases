/* =============================================================
   STRIX site — 운영자 회원 대시보드 (members_dashboard_devplan.md)
   auth.js 의 openMembersModal() 이 처음 열 때 불러온다.

   데이터 = Supabase RPC 만 (supabase/migrations/20261106_member_usage.sql)
     admin_members_overview()          목록 · 일별 · 요일×시간 · 좌석
     admin_member_detail(p_user)       최근 91일 · 세션 · 메모
     admin_member_note_save / admin_member_set_blocked / admin_member_extend_trial
   운영자 판정은 DB 함수 안에서 한다 — 이 화면은 편의층일 뿐이다.

   🚨 이름·소속·이메일·메모·버전·기기값은 회원이 정하는 값이다. HTML 에 넣을 때는 전부 esc() 를 거친다(SEC-04a).
   ============================================================= */
(function () {
  'use strict';

  var esc = window.escHtml || function (s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var I18N = {
    ko: {
      title: '회원 대시보드', live: '실시간', updAgo: '{n}초 전 갱신', loading: '불러오는 중…',
      r7: '7일', r30: '30일', r90: '90일', refresh: '새로고침',
      k_total: '전체 회원', k_live: '지금 사용 중', k_dau: '오늘 사용', k_wau: '7일 활성', k_mau: '30일 활성',
      k_seat: '유료 좌석', k_exp: '만료 임박', k_dorm: '휴면 30일+',
      s_new: '신규 {n}명 (7일)', s_liveSub: '앱을 켜 둔 회원', s_vsY: '어제 대비', s_ofAll: '전체의 {p}%',
      s_seat: '좌석 {b}개 중 {a}개 사용', s_noSeat: '유료 좌석 없음', s_exp: '14일 안에 만료', s_dorm: '30일간 사용 없음',
      chDaily: '일별 사용자', chDailyNote: '색 = 현재 플랜', chHeat: '요일 · 시간대 사용량', heatNote: '최근 30일 · 한국 시간',
      lgPaid: '유료', lgTrial: '체험', lgBeta: '베타', lgExpired: '만료', dayTotal: '합계',
      dPlan: '플랜 분포', dVer: '앱 버전 (7일 활성 기준)', dOld: '최신이 아닌 버전 사용자 {n}명 — 업데이트 안내 필요',
      noUsage: '아직 사용 기록이 없습니다', noVer: '버전 기록 없음',
      search: '이름 · 소속 · 이메일 검색',
      f_all: '전체', f_live: '사용 중', f_paid: '유료', f_trial: '체험', f_beta: '베타', f_exp: '만료 임박',
      f_expired: '만료', f_dorm: '휴면', f_new: '신규', f_block: '차단',
      h_st: '상태', h_name: '이름 · 소속', h_mail: '이메일', h_plan: '플랜', h_expd: '만료', h_last: '마지막 사용',
      h_14: '최근 14일', h_hrs: '30일 사용', h_ver: '버전', h_join: '가입일',
      p_paid: '유료', p_trial: '체험', p_beta: '베타', p_expired: '만료', blocked: '차단', noExpiry: '–',
      st_live: '사용 중', st_today: '오늘', st_idle: '최근', st_dorm: '휴면', st_never: '미사용',
      now: '지금', minAgo: '{n}분 전', hrAgo: '{n}시간 전', dayAgo: '{n}일 전', never: '사용 기록 없음',
      foot: '전체 {a}명 · 표시 {b}명 · 지금 사용 중 {c}명', noRows: '조건에 맞는 회원이 없습니다',
      sel: '{n}명 선택', copyMail: '이메일 복사', selCsv: '선택 CSV', clearSel: '선택 해제',
      dr_days: '30일 사용일', dr_avg: '평균 사용', dr_tot: '30일 사용 시간', dr_grass: '최근 13주 활동',
      dr_info: '계정 정보', dr_sess: '최근 세션', dr_memo: '운영자 메모', dr_act: '관리',
      i_join: '가입일', i_org: '회사', i_dev: '기기 (91일)', i_first: '첫 사용', i_ver: '앱 버전', i_exp: '만료', i_trial: '체험 종료',
      se_start: '시작', se_dur: '시간', se_dev: '기기', se_ver: '버전', se_live: '사용 중',
      ext: '체험 기간', extApply: 'Apply', extPaid: '유료 구독 중 — 구독 기간은 결제 시스템이 관리합니다',
      extBeta: '베타 기간에는 체험 없이도 사용할 수 있습니다. 상용 전환 뒤 효력이 생깁니다',
      block: '차단', unblock: '차단 해제', save: 'Save', close: 'Close', copy: '이메일 복사',
      memoPh: '예: 2026-11 전화 상담 — 연간 결제 검토 중',
      unsaved: '● 저장 안 된 메모', discard: '저장 안 된 메모가 있습니다. 버리고 계속할까요?',
      saved: '메모를 저장했습니다', extended: '체험을 {n}일 연장했습니다 ({d}까지)', copied: '이메일 {n}개를 복사했습니다',
      blockedOk: '차단했습니다', unblockedOk: '차단을 해제했습니다',
      confirmBlock: '{name} 회원을 차단할까요? 다음 로그인 확인부터 앱을 쓸 수 없습니다.',
      confirmUnblock: '{name} 회원의 차단을 해제할까요?',
      errLoad: '불러오지 못했습니다: {m}', errAction: '실패했습니다: {m}',
      errNoFn: 'DB 설정이 아직 적용되지 않았습니다. Supabase SQL Editor 에서 {f} 를 실행하세요.',
      errForbidden: '운영자 계정만 볼 수 있습니다.',
      noData: '앱 사용 기록은 사용 기록 기능이 들어간 앱 버전부터 쌓입니다.',
      devs: '{n}대', min: '{n}분', hr: '{n}시간', csvDone: 'CSV 를 내려받았습니다'
    },
    en: {
      title: 'Members Dashboard', live: 'Live', updAgo: 'updated {n}s ago', loading: 'Loading…',
      r7: '7 days', r30: '30 days', r90: '90 days', refresh: 'Refresh',
      k_total: 'Total members', k_live: 'Using now', k_dau: 'Used today', k_wau: 'Active 7 days', k_mau: 'Active 30 days',
      k_seat: 'Paid seats', k_exp: 'Expiring soon', k_dorm: 'Dormant 30d+',
      s_new: '{n} new (7 days)', s_liveSub: 'Members with the app open', s_vsY: 'vs yesterday', s_ofAll: '{p}% of all',
      s_seat: '{a} of {b} seats in use', s_noSeat: 'No paid seats', s_exp: 'Expire within 14 days', s_dorm: 'No use for 30 days',
      chDaily: 'Daily users', chDailyNote: 'color = current plan', chHeat: 'Usage by weekday · hour', heatNote: 'Last 30 days · KST',
      lgPaid: 'Paid', lgTrial: 'Trial', lgBeta: 'Beta', lgExpired: 'Expired', dayTotal: 'Total',
      dPlan: 'Plans', dVer: 'App version (active 7 days)', dOld: '{n} users not on the latest version — send an update notice',
      noUsage: 'No usage recorded yet', noVer: 'No version data',
      search: 'Search name · company · email',
      f_all: 'All', f_live: 'Using now', f_paid: 'Paid', f_trial: 'Trial', f_beta: 'Beta', f_exp: 'Expiring',
      f_expired: 'Expired', f_dorm: 'Dormant', f_new: 'New', f_block: 'Blocked',
      h_st: 'Status', h_name: 'Name · Company', h_mail: 'Email', h_plan: 'Plan', h_expd: 'Expires', h_last: 'Last used',
      h_14: 'Last 14 days', h_hrs: '30-day use', h_ver: 'Version', h_join: 'Joined',
      p_paid: 'Paid', p_trial: 'Trial', p_beta: 'Beta', p_expired: 'Expired', blocked: 'Blocked', noExpiry: '–',
      st_live: 'Using now', st_today: 'Today', st_idle: 'Recent', st_dorm: 'Dormant', st_never: 'Never used',
      now: 'now', minAgo: '{n} min ago', hrAgo: '{n} h ago', dayAgo: '{n} d ago', never: 'No usage yet',
      foot: '{a} members · {b} shown · {c} using now', noRows: 'No members match',
      sel: '{n} selected', copyMail: 'Copy emails', selCsv: 'Selected CSV', clearSel: 'Clear selection',
      dr_days: 'Days used (30d)', dr_avg: 'Avg per day', dr_tot: 'Use time (30d)', dr_grass: 'Activity, last 13 weeks',
      dr_info: 'Account', dr_sess: 'Recent sessions', dr_memo: 'Admin note', dr_act: 'Manage',
      i_join: 'Joined', i_org: 'Company', i_dev: 'Devices (91d)', i_first: 'First use', i_ver: 'App version', i_exp: 'Expires', i_trial: 'Trial ends',
      se_start: 'Start', se_dur: 'Duration', se_dev: 'Device', se_ver: 'Version', se_live: 'live',
      ext: 'Trial', extApply: 'Apply', extPaid: 'Paid subscription — its period is managed by billing',
      extBeta: 'During beta the app is free without a trial. Takes effect after commercial launch',
      block: 'Block', unblock: 'Unblock', save: 'Save', close: 'Close', copy: 'Copy email',
      memoPh: 'e.g. Phone call 2026-11 — considering annual plan',
      unsaved: '● Unsaved note', discard: 'You have an unsaved note. Discard it and continue?',
      saved: 'Note saved', extended: 'Trial extended by {n} days (until {d})', copied: 'Copied {n} emails',
      blockedOk: 'Blocked', unblockedOk: 'Unblocked',
      confirmBlock: 'Block {name}? They lose app access at the next sign-in check.',
      confirmUnblock: 'Unblock {name}?',
      errLoad: 'Could not load: {m}', errAction: 'Failed: {m}',
      errNoFn: 'The database setup is not applied yet. Run {f} in the Supabase SQL Editor.',
      errForbidden: 'Only the admin account can view this.',
      noData: 'Usage is recorded from the app version that includes usage tracking.',
      devs: '{n}', min: '{n} min', hr: '{n} h', csvDone: 'CSV downloaded'
    }
  };

  var MIGRATION_FILE = 'supabase/migrations/20261106_member_usage.sql';
  var DAY = 864e5;
  var REFRESH_MS = 60000;

  // ── state ──
  var L = (document.documentElement.lang || '').toLowerCase().indexOf('ko') === 0 ? 'ko' : 'en';
  var root = null, sb = null, data = null, loadedAt = 0, loadError = null;
  var range = 30, filter = 'all', q = '', sortK = 'last', sortDir = -1;
  var openId = null, detail = null, detailFor = null, memoDirty = false;
  var sel = {};
  var timers = [];
  var tipEl = null;

  function t(k, v) {
    var s = I18N[L][k];
    if (s === undefined) s = I18N.en[k] !== undefined ? I18N.en[k] : k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function $(sel) { return root.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function ms(v) { return v ? new Date(v).getTime() : null; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtD(v) { if (v == null) return '–'; var d = new Date(v); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fmtDT(v) { var d = new Date(v); return fmtD(v) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtMin(m) { m = Math.max(0, Math.round(m || 0)); return m < 60 ? t('min', { n: m }) : t('hr', { n: (m / 60).toFixed(m < 600 ? 1 : 0) }); }
  function rel(v) {
    if (v == null) return t('never');
    var s = (Date.now() - ms(v)) / 1e3;
    if (s < 120) return t('now');
    if (s < 3600) return t('minAgo', { n: Math.round(s / 60) });
    if (s < 86400) return t('hrAgo', { n: Math.round(s / 3600) });
    return t('dayAgo', { n: Math.round(s / 86400) });
  }
  function cmpVer(a, b) {
    var x = String(a).split('.'), y = String(b).split('.');
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var p = parseInt(x[i] || '0', 10) || 0, r = parseInt(y[i] || '0', 10) || 0;
      if (p !== r) return p < r ? -1 : 1;
    }
    return 0;
  }

  // ── derived per member ──
  function act(m, ago) { return (m.act14 && m.act14[String(ago)]) || 0; }
  function status(m) {
    if (m.live) return 'live';
    if (m.last_seen == null) return 'never';
    var d = (Date.now() - ms(m.last_seen)) / DAY;
    if (d < 1) return 'today';
    if (d < 30) return 'idle';
    return 'dorm';
  }
  function isExpSoon(m) { return (m.plan === 'paid' || m.plan === 'trial') && m.plan_end && ms(m.plan_end) - Date.now() < 14 * DAY; }
  function isNew(m) { return Date.now() - ms(m.created_at) < 7 * DAY; }
  function isDormant(m) { var s = status(m); return s === 'dorm' || s === 'never'; }
  function newestVersion() {
    var best = null;
    members().forEach(function (m) { if (m.app_version && (!best || cmpVer(m.app_version, best) > 0)) best = m.app_version; });
    return best;
  }

  var FILTERS = [
    ['all', function () { return true; }],
    ['live', function (m) { return m.live; }],
    ['paid', function (m) { return m.plan === 'paid'; }],
    ['trial', function (m) { return m.plan === 'trial'; }],
    ['beta', function (m) { return m.plan === 'beta'; }],
    ['exp', isExpSoon],
    ['expired', function (m) { return m.plan === 'expired'; }],
    ['dorm', isDormant],
    ['new', isNew],
    ['block', function (m) { return m.is_blocked; }]
  ];
  function filterFn(k) { for (var i = 0; i < FILTERS.length; i++) if (FILTERS[i][0] === k) return FILTERS[i][1]; return FILTERS[0][1]; }
  function members() { return (data && data.members) || []; }
  function byId(id) { var a = members(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }

  function planBadge(m) {
    return '<span class="badge b-' + esc(m.plan) + '">' + esc(t('p_' + m.plan)) + '</span>' +
      (m.is_blocked ? '<span class="badge b-block">' + esc(t('blocked')) + '</span>' : '');
  }
  function dotHtml(st) { return '<span class="dot ' + esc(st === 'live' ? 'pulse' : st) + '"></span>'; }

  // ── shell ──
  function shell() {
    root.innerHTML =
      '<div class="mdash" role="dialog" aria-modal="true">' +
        '<div class="hdr">' +
          '<h1>👥 <span data-t="title"></span></h1>' +
          '<span class="live"><span class="dot pulse"></span><span data-t="live"></span> · <span class="upd"></span></span>' +
          '<div class="sp"></div>' +
          '<div class="seg range"><button data-r="7" data-t="r7"></button><button data-r="30" data-t="r30"></button><button data-r="90" data-t="r90"></button></div>' +
          '<button class="btn refresh">⟳ <span data-t="refresh"></span></button>' +
          '<button class="btn csv">⇩ CSV</button>' +
          '<div class="seg lang"><button data-l="ko">KO</button><button data-l="en">EN</button></div>' +
          '<button class="x close" title="Close">×</button>' +
        '</div>' +
        '<div class="body">' +
          '<div class="banners"></div>' +
          '<div class="kpis"></div>' +
          '<div class="charts">' +
            '<div class="card"><h3><span data-t="chDaily"></span><span class="note" data-t="chDailyNote"></span><span class="sp"></span>' +
              '<span class="legend">' +
                '<span><i style="background:var(--accent)"></i><span data-t="lgPaid"></span></span>' +
                '<span><i style="background:var(--blue)"></i><span data-t="lgTrial"></span></span>' +
                '<span><i style="background:var(--violet)"></i><span data-t="lgBeta"></span></span>' +
                '<span><i style="background:var(--danger)"></i><span data-t="lgExpired"></span></span>' +
              '</span></h3><svg class="daily"></svg></div>' +
            '<div class="card"><h3><span data-t="chHeat"></span><span class="sp"></span><span class="note" data-t="heatNote"></span></h3><div class="heat"></div></div>' +
            '<div class="card dist"></div>' +
          '</div>' +
          '<div class="tbl">' +
            '<div class="tools"><div class="search"><input class="q" type="search"></div><div class="chips"></div></div>' +
            '<div class="bulk"><b class="bulkN"></b><button class="btn bMail">✉ <span data-t="copyMail"></span></button>' +
              '<button class="btn bCsv">⇩ <span data-t="selCsv"></span></button><button class="btn bClr" data-t="clearSel"></button></div>' +
            '<div class="scroll"><table><thead><tr class="thead"></tr></thead><tbody class="tbody"></tbody></table></div>' +
            '<div class="foot"></div>' +
          '</div>' +
        '</div>' +
        '<aside class="drawer"></aside>' +
        '<div class="toast"></div>' +
      '</div>';

    $('.close').onclick = function () { if (confirmDiscard()) window.closeMembersModal(); };
    $('.refresh').onclick = function () { load(); };
    $('.csv').onclick = function () { downloadCsv(visibleRows()); };
    $('.q').oninput = function (e) { q = e.target.value; renderTable(); };
    $$('.range button').forEach(function (b) {
      b.onclick = function () { range = +b.dataset.r; renderRange(); renderDaily(); };
    });
    $$('.lang button').forEach(function (b) {
      b.onclick = function () { L = b.dataset.l; renderAll(); };
    });
    $('.bMail').onclick = function () { copyEmails(selectedMembers()); };
    $('.bCsv').onclick = function () { downloadCsv(selectedMembers()); };
    $('.bClr').onclick = function () { sel = {}; renderTable(); renderBulk(); };

    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'mdash-tip';
      document.body.appendChild(tipEl);
    }
  }

  function applyLang() {
    $$('[data-t]').forEach(function (e) { e.textContent = t(e.dataset.t); });
    $('.q').placeholder = t('search');
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.l === L)); });
  }
  function renderRange() { $$('.range button').forEach(function (b) { b.setAttribute('aria-selected', String(+b.dataset.r === range)); }); }
  function renderUpd() {
    var el = root && root.querySelector('.upd');
    if (!el) return;
    el.textContent = loadedAt ? t('updAgo', { n: Math.max(0, Math.round((Date.now() - loadedAt) / 1000)) }) : t('loading');
  }

  function renderBanners() {
    var h = '';
    if (loadError) h += '<div class="banner err">' + esc(loadError) + '</div>';
    else if (data && !members().some(function (m) { return m.last_seen; })) h += '<div class="banner">' + esc(t('noData')) + '</div>';
    $('.banners').innerHTML = h;
  }

  // ── KPI ──
  function renderKpis() {
    var M = members(), n = M.length || 1;
    var live = M.filter(function (m) { return m.live; }).length;
    var dau = M.filter(function (m) { return act(m, 0) > 0; }).length;
    var yd = M.filter(function (m) { return act(m, 1) > 0; }).length;
    var wau = M.filter(function (m) { return m.days7 > 0; }).length;
    var mau = M.filter(function (m) { return m.days30 > 0; }).length;
    var seats = (data && data.seats) || { total: 0, used: 0 };
    var K = [
      { k: 'total', v: M.length, s: t('s_new', { n: M.filter(isNew).length }), f: 'all' },
      { k: 'live', c: 'klive', v: live, s: t('s_liveSub'), f: 'live', dot: true },
      { k: 'dau', v: dau, s: t('s_vsY'), trend: { cls: dau >= yd ? 'up' : 'down', txt: (dau >= yd ? '▲ ' : '▼ ') + Math.abs(dau - yd) } },
      { k: 'wau', v: wau, s: t('s_ofAll', { p: Math.round(wau / n * 100) }), bar: wau / n },
      { k: 'mau', v: mau, s: t('s_ofAll', { p: Math.round(mau / n * 100) }), bar: mau / n },
      { k: 'seat', v: seats.total ? seats.used + '/' + seats.total : '–',
        s: seats.total ? t('s_seat', { a: seats.used, b: seats.total }) : t('s_noSeat'), f: 'paid',
        bar: seats.total ? seats.used / seats.total : null },
      { k: 'exp', c: 'kwarn', v: M.filter(isExpSoon).length, s: t('s_exp'), f: 'exp' },
      { k: 'dorm', c: 'kmute', v: M.filter(isDormant).length, s: t('s_dorm'), f: 'dorm' }
    ];
    var h = '';
    K.forEach(function (x) {
      h += '<div class="kpi ' + esc(x.c || '') + (x.f && x.f !== 'all' && x.f === filter ? ' on' : '') + '" data-f="' + esc(x.f || '') + '">' +
        '<div class="lb">' + (x.dot ? '<span class="dot pulse"></span>' : '') + esc(t('k_' + x.k)) + '</div>' +
        '<div class="v">' + esc(x.v) + '</div>' +
        '<div class="sub">' + (x.trend ? '<b class="' + esc(x.trend.cls) + '">' + esc(x.trend.txt) + '</b> ' : '') + esc(x.s) + '</div>' +
        (x.bar != null ? '<div class="bar"><i style="width:' + esc(Math.round(Math.min(1, x.bar) * 100)) + '%"></i></div>' : '') +
      '</div>';
    });
    $('.kpis').innerHTML = h;
    $$('.kpi').forEach(function (e) {
      if (e.dataset.f) e.onclick = function () { filter = e.dataset.f; renderChips(); renderKpis(); renderTable(); };
    });
  }

  // ── daily chart ──
  function renderDaily() {
    var svg = $('.daily');
    var W = svg.clientWidth || 700, H = 170, pl = 28, pb = 20, n = range;
    var byD = {};
    ((data && data.daily) || []).forEach(function (o) { byD[o.d] = o; });
    var rows = [];
    for (var d = n - 1; d >= 0; d--) {
      var o = byD[d] || {};
      rows.push({ d: d, paid: o.paid || 0, trial: o.trial || 0, beta: o.beta || 0, expired: o.expired || 0 });
    }
    var max = 5;
    rows.forEach(function (o) { max = Math.max(max, o.paid + o.trial + o.beta + o.expired); });
    var bw = (W - pl) / n, g = '';
    for (var y = 0; y <= 4; y++) {
      var v = Math.round(max * y / 4), yy = H - pb - (H - pb - 8) * y / 4;
      g += '<line x1="' + esc(pl) + '" x2="' + esc(W) + '" y1="' + esc(yy) + '" y2="' + esc(yy) + '" stroke="rgba(255,255,255,.06)"/>' +
           '<text x="' + esc(pl - 5) + '" y="' + esc(yy + 4) + '" fill="#6a6a82" font-size="11" text-anchor="end" font-family="Consolas">' + esc(v) + '</text>';
    }
    var COLORS = [['paid', '#4ec9b0'], ['trial', '#569cd6'], ['beta', '#c586c0'], ['expired', '#e06c6c']];
    rows.forEach(function (o, i) {
      var yb = H - pb, x = pl + i * bw + bw * 0.15, w = bw * 0.7;
      COLORS.forEach(function (kc) {
        var h = (H - pb - 8) * o[kc[0]] / max;
        yb -= h;
        if (h > 0) g += '<rect x="' + esc(x) + '" y="' + esc(yb) + '" width="' + esc(w) + '" height="' + esc(h) + '" fill="' + esc(kc[1]) + '" rx="1.5"/>';
      });
      g += '<rect class="hit" data-i="' + esc(i) + '" x="' + esc(pl + i * bw) + '" y="0" width="' + esc(bw) + '" height="' + esc(H - pb) + '" fill="transparent"/>';
      if (i % Math.ceil(n / 8) === 0 || i === n - 1) {
        var dt = new Date(Date.now() - o.d * DAY);
        g += '<text x="' + esc(x + w / 2) + '" y="' + esc(H - 5) + '" fill="#6a6a82" font-size="11" text-anchor="middle">' + esc((dt.getMonth() + 1) + '/' + dt.getDate()) + '</text>';
      }
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = g;
    Array.prototype.forEach.call(svg.querySelectorAll('.hit'), function (r) {
      r.onmousemove = function (e) {
        var o = rows[+r.dataset.i];
        tipEl.style.display = 'block';
        tipEl.style.left = e.clientX + 12 + 'px';
        tipEl.style.top = e.clientY - 10 + 'px';
        var tip = '<b>' + esc(fmtD(Date.now() - o.d * DAY)) + '</b><br>';
        COLORS.forEach(function (kc, ci) {
          tip += (ci ? ' · ' : '') + '<span style="color:' + esc(kc[1]) + '">■</span> ' +
            esc(t('lg' + kc[0].charAt(0).toUpperCase() + kc[0].slice(1)) + ' ' + o[kc[0]]);
        });
        tip += '<br>' + esc(t('dayTotal')) + ': <b>' + esc(o.paid + o.trial + o.beta + o.expired) + '</b>';
        tipEl.innerHTML = tip;
        r.setAttribute('fill', 'rgba(255,255,255,.05)');
      };
      r.onmouseleave = function () { tipEl.style.display = 'none'; r.setAttribute('fill', 'transparent'); };
    });
  }

  // ── weekday × hour heat ──
  function renderHeat() {
    var WD = L === 'ko' ? ['월', '화', '수', '목', '금', '토', '일'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var cells = {}, max = 0;
    ((data && data.heat) || []).forEach(function (c) { cells[c.w + ':' + c.h] = c.n; if (c.n > max) max = c.n; });
    var h = '<div></div>';
    for (var x = 0; x < 24; x++) h += '<div class="hl">' + (x % 3 === 0 ? x : '') + '</div>';
    WD.forEach(function (d, wi) {
      h += '<div class="wl">' + esc(L === 'ko' ? d : d.charAt(0)) + '</div>';
      for (var hr = 0; hr < 24; hr++) {
        var n = cells[(wi + 1) + ':' + hr] || 0;
        var a = max ? 0.12 + 0.83 * n / max : 0;
        h += '<div class="c" title="' + esc(d + ' ' + hr + ':00 — ' + n) + '"' + (n ? ' style="background:rgba(78,201,176,' + esc(a.toFixed(2)) + ')"' : '') + '></div>';
      }
    });
    $('.heat').innerHTML = h;
  }

  // ── plan / version distribution ──
  function renderDist() {
    var M = members();
    var P = [['paid', 'var(--accent)'], ['trial', 'var(--blue)'], ['beta', 'var(--violet)'], ['expired', 'var(--danger)']];
    var cnt = {}, mx = 1;
    P.forEach(function (p) { cnt[p[0]] = M.filter(function (m) { return m.plan === p[0]; }).length; mx = Math.max(mx, cnt[p[0]]); });
    var h = '<h3>' + esc(t('dPlan')) + '</h3>';
    P.forEach(function (p) {
      h += '<div class="row"><span>' + esc(t('p_' + p[0])) + '</span><div class="track"><i style="width:' + esc(cnt[p[0]] / mx * 100) +
        '%;background:' + esc(p[1]) + '"></i></div><span class="n">' + esc(cnt[p[0]]) + '</span></div>';
    });

    var active = M.filter(function (m) { return m.days7 > 0 && m.app_version; });
    var vs = {};
    active.forEach(function (m) { vs[m.app_version] = (vs[m.app_version] || 0) + 1; });
    var keys = Object.keys(vs).sort(function (a, b) { return cmpVer(b, a); }).slice(0, 6);
    var vm = 1;
    keys.forEach(function (k) { vm = Math.max(vm, vs[k]); });
    var newest = keys[0];
    h += '<h4>' + esc(t('dVer')) + '</h4>';
    if (!keys.length) h += '<div class="empty">' + esc(t('noVer')) + '</div>';
    keys.forEach(function (v) {
      h += '<div class="row"><span class="num">' + esc(v) + '</span><div class="track"><i style="width:' + esc(vs[v] / vm * 100) +
        '%;background:' + (v === newest ? 'var(--ok)' : 'var(--warn)') + '"></i></div><span class="n">' + esc(vs[v]) + '</span></div>';
    });
    var old = active.filter(function (m) { return newest && m.app_version !== newest; }).length;
    if (old) h += '<div style="margin-top:8px;font-size:12px;color:var(--warn)">⚠ ' + esc(t('dOld', { n: old })) + '</div>';
    $('.dist').innerHTML = h;
  }

  // ── table ──
  var COLS = ['st', 'name', 'mail', 'plan', 'expd', 'last', '14', 'hrs', 'ver', 'join'];
  var SORT = {
    st: function (m) { return { live: 5, today: 4, idle: 3, dorm: 2, never: 1 }[status(m)]; },
    name: function (m) { return (m.name || '').toLowerCase(); },
    mail: function (m) { return (m.email || '').toLowerCase(); },
    plan: function (m) { return m.plan; },
    expd: function (m) { return ms(m.plan_end) || 0; },
    last: function (m) { return m.live ? Infinity : (ms(m.last_seen) || -1); },
    '14': function (m) { var c = 0; for (var i = 0; i < 14; i++) if (act(m, i) > 0) c++; return c; },
    hrs: function (m) { return m.mins30 || 0; },
    ver: function (m) { return m.app_version || ''; },
    join: function (m) { return ms(m.created_at) || 0; }
  };

  function visibleRows() {
    var r = members().filter(filterFn(filter));
    if (q) {
      var s = q.toLowerCase();
      r = r.filter(function (m) { return ((m.name || '') + ' ' + (m.affiliation || '') + ' ' + (m.email || '')).toLowerCase().indexOf(s) >= 0; });
    }
    var key = SORT[sortK];
    return r.slice().sort(function (a, b) {
      var x = key(a), y = key(b);
      if (sortK === 'ver') return cmpVer(x, y) * sortDir;
      return (x > y ? 1 : x < y ? -1 : 0) * sortDir;
    });
  }

  function renderChips() {
    var h = '';
    FILTERS.forEach(function (f) {
      h += '<button class="chip' + (filter === f[0] ? ' on' : '') + '" data-f="' + esc(f[0]) + '">' +
        (f[0] === 'live' ? '<span class="dot pulse" style="width:6px;height:6px"></span>' : '') +
        esc(t('f_' + f[0])) + ' <b>' + esc(members().filter(f[1]).length) + '</b></button>';
    });
    $('.chips').innerHTML = h;
    $$('.chip').forEach(function (c) {
      c.onclick = function () { filter = c.dataset.f; renderChips(); renderKpis(); renderTable(); };
    });
  }

  function renderTable() {
    var newest = newestVersion();
    var head = '<th class="nosort" style="width:28px"><input type="checkbox" class="all"></th>';
    COLS.forEach(function (c) {
      head += '<th data-k="' + esc(c) + '">' + esc(t('h_' + c)) + (sortK === c ? '<span class="ar">' + (sortDir > 0 ? '▲' : '▼') + '</span>' : '') + '</th>';
    });
    $('.thead').innerHTML = head;
    $$('thead th[data-k]').forEach(function (th) {
      th.onclick = function () {
        var k = th.dataset.k;
        if (sortK === k) sortDir *= -1; else { sortK = k; sortDir = (k === 'name' || k === 'mail' || k === 'plan') ? 1 : -1; }
        renderTable();
      };
    });

    // 행마다 조립한다. 조립하는 식 하나하나의 끝 값이 esc() 를 거친다(check:site-html-escape)
    var R = visibleRows();
    var body = '';
    R.forEach(function (m) {
      var st = status(m);
      var end = ms(m.plan_end);
      var dd = end != null ? Math.round((end - Date.now()) / DAY) : null;
      var days14 = 0;
      for (var i = 0; i < 14; i++) if (act(m, i) > 0) days14++;
      var old = m.app_version && newest && m.app_version !== newest;

      body += '<tr data-id="' + esc(m.id) + '" class="' + (sel[m.id] ? 'sel ' : '') + (openId === m.id ? 'open' : '') + '">' +
        '<td><input type="checkbox" class="ck"' + (sel[m.id] ? ' checked' : '') + '></td>' +
        '<td><span class="st">';
      body += dotHtml(st);
      body += esc(t('st_' + st)) + '</span></td>' +
        '<td><div class="nm">' + esc(m.name || '–') + (m.has_note ? '<span class="memo-mark" title="memo">✎</span>' : '') + '</div><div class="af">' + esc(m.affiliation || '–') + '</div></td>' +
        '<td>' + esc(m.email || '–') + '</td><td>';
      body += planBadge(m);
      body += '</td><td>';
      if (end == null) body += '<span class="af">' + esc(t('noExpiry')) + '</span>';
      else body += '<span class="num dd ' + (dd < 0 ? 'd' : dd < 14 ? 'w' : '') + '">' + esc(fmtD(end)) + '</span> <span class="af">' + esc(dd < 0 ? 'D+' + (-dd) : 'D-' + dd) + '</span>';
      body += '</td>' +
        '<td' + (st === 'live' ? ' style="color:var(--ok)"' : '') + '>' + esc(rel(m.last_seen)) + '</td>' +
        '<td><span class="spark">';
      for (var j = 13; j >= 0; j--) {
        var v = act(m, j);
        body += '<i class="' + (v === 0 ? '' : v < 90 ? 'l1' : v < 240 ? 'l2' : 'l3') + '" title="' + esc(fmtD(Date.now() - j * DAY) + ' · ' + fmtMin(v)) + '"></i>';
      }
      body += '</span> <span class="af num">' + esc(days14 + '/14') + '</span></td>' +
        '<td class="num">' + esc(fmtMin(m.mins30)) + '</td>' +
        '<td class="num' + (old ? ' old' : '') + '">' + esc(m.app_version || '–') + '</td>' +
        '<td class="num af">' + esc(fmtD(m.created_at)) + '</td>' +
      '</tr>';
    });
    $('.tbody').innerHTML = body || '<tr><td colspan="11" class="empty">' + esc(data ? t('noRows') : loadError ? '–' : t('loading')) + '</td></tr>';

    $$('.tbody tr[data-id]').forEach(function (tr) {
      var id = tr.dataset.id;
      tr.onclick = function (e) { if (e.target.classList.contains('ck')) return; openDrawer(id); };
      tr.querySelector('.ck').onchange = function (e) {
        if (e.target.checked) sel[id] = true; else delete sel[id];
        tr.classList.toggle('sel', e.target.checked);
        renderBulk();
      };
    });
    var all = $('.all');
    all.checked = R.length > 0 && R.every(function (m) { return sel[m.id]; });
    all.onchange = function () {
      R.forEach(function (m) { if (all.checked) sel[m.id] = true; else delete sel[m.id]; });
      renderTable(); renderBulk();
    };
    $('.foot').textContent = t('foot', {
      a: members().length, b: R.length, c: members().filter(function (m) { return m.live; }).length
    });
  }

  function selectedMembers() { return members().filter(function (m) { return sel[m.id]; }); }
  function renderBulk() {
    var n = selectedMembers().length;
    $('.bulk').classList.toggle('show', n > 0);
    $('.bulkN').textContent = t('sel', { n: n });
  }

  // ── drawer ──
  function confirmDiscard() { return !memoDirty || window.confirm(t('discard')); }

  function openDrawer(id) {
    if (openId !== id && !confirmDiscard()) return;
    if (openId !== id) { detail = null; detailFor = null; }
    openId = id;
    memoDirty = false;
    renderDrawer();
    renderTable();
    if (detailFor !== id) loadDetail(id);
  }

  function closeDrawer() {
    if (!confirmDiscard()) return false;
    memoDirty = false; openId = null; detail = null; detailFor = null;
    $('.drawer').classList.remove('show');
    renderTable();
    return true;
  }

  async function loadDetail(id) {
    var res = await sb.rpc('admin_member_detail', { p_user: id });
    if (openId !== id) return;
    if (res.error) { toast(t('errAction', { m: res.error.message }), true); return; }
    detail = res.data || {};
    detailFor = id;
    renderDrawer();
  }

  function renderDrawer() {
    var dr = $('.drawer');
    var m = openId && byId(openId);
    if (!m) { dr.classList.remove('show'); return; }
    var st = status(m), dt = detailFor === m.id ? detail : null;
    var d30 = m.days30 || 0, t30 = m.mins30 || 0;

    var grass = '';
    for (var ago = 90; ago >= 0; ago--) {
      var v = dt && dt.act91 ? (dt.act91[String(ago)] || 0) : 0;
      grass += '<i title="' + esc(fmtD(Date.now() - ago * DAY) + ' · ' + fmtMin(v)) + '"' +
        (v ? ' style="background:rgba(78,201,176,' + esc((0.25 + Math.min(v, 360) / 360 * 0.75).toFixed(2)) + ')"' : '') + '></i>';
    }

    var sess = '';
    if (dt) {
      (dt.sessions || []).forEach(function (s) {
        var mins = (ms(s.end_at) - ms(s.started_at)) / 6e4;
        sess += '<tr><td class="num">' + esc(fmtDT(s.started_at)) + '</td>' +
          '<td class="num"' + (s.live ? ' style="color:var(--ok)"' : '') + '>' + (s.live ? '● ' + esc(t('se_live')) : esc(fmtMin(mins))) + '</td>' +
          '<td class="af num">' + esc(s.device || '–') + '</td><td class="num af">' + esc(s.app_version || '–') + '</td></tr>';
      });
      if (!sess) sess = '<tr><td colspan="4" class="af">' + esc(t('never')) + '</td></tr>';
    } else {
      sess = '<tr><td colspan="4" class="af">' + esc(t('loading')) + '</td></tr>';
    }

    var commercial = !!(data && data.commercial_mode);
    var extHint = m.plan === 'paid' ? t('extPaid') : (!commercial ? t('extBeta') : '');
    var orgs = dt && dt.orgs && dt.orgs.length ? dt.orgs.join(', ') : (m.affiliation || '–');

    var html = '<div class="dh"><div class="av">' + esc((m.name || '?').charAt(0)) + '</div>' +
        '<div class="t"><div class="nm">' + esc(m.name || '–') + ' ';
    html += planBadge(m);
    html += '</div><div class="af">' + esc((m.affiliation || '–') + ' · ' + (m.email || '–')) + '</div><div><span class="st">';
    html += dotHtml(st);
    html += esc(t('st_' + st) + ' · ' + rel(m.last_seen)) + '</span></div></div>' +
        '<button class="x dx" title="Close">×</button></div>' +
      '<div class="db">' +
        '<div class="mini">' +
          '<div><span>' + esc(t('dr_days')) + '</span><b>' + esc(d30) + '<span style="display:inline;font-size:12px;color:var(--text-dim)"> /30</span></b></div>' +
          '<div><span>' + esc(t('dr_avg')) + '</span><b>' + (d30 ? esc(fmtMin(t30 / d30)) : '–') + '</b></div>' +
          '<div><span>' + esc(t('dr_tot')) + '</span><b>' + esc(fmtMin(t30)) + '</b></div>' +
        '</div>' +
        '<div class="sec"><h4>' + esc(t('dr_grass')) + '</h4><div class="grass">';
    html += grass;
    html += '</div></div>' +
        '<div class="sec"><h4>' + esc(t('dr_info')) + '</h4><div class="kv">' +
          '<span>' + esc(t('i_join')) + '</span><b class="num">' + esc(fmtD(m.created_at)) + '</b>' +
          '<span>' + esc(t('i_first')) + '</span><b class="num">' + esc(dt && dt.first_seen ? fmtD(dt.first_seen) : '–') + '</b>' +
          '<span>' + esc(t('i_exp')) + '</span><b class="num">' + esc(m.plan_end ? fmtD(m.plan_end) : t('noExpiry')) + '</b>' +
          '<span>' + esc(t('i_trial')) + '</span><b class="num">' + esc(dt && dt.trial_end ? fmtD(dt.trial_end) : '–') + '</b>' +
          '<span>' + esc(t('i_org')) + '</span><b>' + esc(orgs) + '</b>' +
          '<span>' + esc(t('i_dev')) + '</span><b>' + esc(dt ? t('devs', { n: dt.devices || 0 }) : '–') + '</b>' +
          '<span>' + esc(t('i_ver')) + '</span><b class="num">' + esc(m.app_version || '–') + '</b>' +
        '</div></div>' +
        '<div class="sec"><h4>' + esc(t('dr_sess')) + '</h4><table class="sess"><tr class="af"><td>' + esc(t('se_start')) + '</td><td>' + esc(t('se_dur')) +
          '</td><td>' + esc(t('se_dev')) + '</td><td>' + esc(t('se_ver')) + '</td></tr>';
    html += sess;
    html += '</table></div>' +
        '<div class="sec"><h4>' + esc(t('dr_act')) + '</h4><div class="acts">' +
          '<span style="color:var(--text-dim);font-size:12px">' + esc(t('ext')) + '</span>' +
          '<select class="extSel"' + (m.plan === 'paid' ? ' disabled' : '') + '><option value="7">+7</option><option value="14">+14</option><option value="30" selected>+30</option><option value="90">+90</option></select>' +
          '<button class="btn extBtn"' + (m.plan === 'paid' ? ' disabled' : '') + '>' + esc(t('extApply')) + '</button>' +
          '<span class="sp"></span>' +
          '<button class="btn mailBtn">✉ ' + esc(t('copy')) + '</button>' +
          '<button class="btn danger blkBtn">' + esc(m.is_blocked ? t('unblock') : t('block')) + '</button>' +
          (extHint ? '<div class="hint">' + esc(extHint) + '</div>' : '') +
        '</div></div>' +
        '<div class="sec"><h4>' + esc(t('dr_memo')) + '</h4><textarea class="memo" maxlength="4000"' + (dt ? '' : ' disabled') + '></textarea></div>' +
      '</div>' +
      '<div class="df"><span class="hint memoHint"></span><button class="btn dclose">' + esc(t('close')) + '</button>' +
        '<button class="btn pri msave" disabled>' + esc(t('save')) + '</button></div>';
    dr.innerHTML = html;
    dr.classList.add('show');

    var memo = dr.querySelector('.memo'), save = dr.querySelector('.msave'), hint = dr.querySelector('.memoHint');
    var original = dt ? (dt.note || '') : '';
    memo.value = original;   // textContent/value — HTML 로 해석하지 않는다
    memo.placeholder = t('memoPh');
    memo.oninput = function () {
      memoDirty = memo.value !== original;
      save.disabled = !memoDirty;
      hint.textContent = memoDirty ? t('unsaved') : '';
    };
    save.onclick = async function () {
      save.disabled = true;
      var r = await sb.rpc('admin_member_note_save', { p_user: m.id, p_note: memo.value });
      if (r.error) { save.disabled = false; toast(t('errAction', { m: r.error.message }), true); return; }
      original = memo.value; memoDirty = false; hint.textContent = '';
      if (detail && detailFor === m.id) detail.note = original;
      m.has_note = original !== '';
      renderTable();
      toast(t('saved'));
    };
    dr.querySelector('.dx').onclick = closeDrawer;
    dr.querySelector('.dclose').onclick = closeDrawer;
    dr.querySelector('.mailBtn').onclick = function () { copyEmails([m]); };
    dr.querySelector('.extBtn').onclick = async function () {
      var n = +dr.querySelector('.extSel').value;
      var r = await sb.rpc('admin_member_extend_trial', { p_user: m.id, p_days: n });
      if (r.error) { toast(t('errAction', { m: r.error.message }), true); return; }
      toast(t('extended', { n: n, d: fmtD(r.data) }));
      await reloadKeepDrawer(m.id);
    };
    dr.querySelector('.blkBtn').onclick = async function () {
      var next = !m.is_blocked;
      if (!window.confirm(t(next ? 'confirmBlock' : 'confirmUnblock', { name: m.name || m.email || '' }))) return;
      var r = await sb.rpc('admin_member_set_blocked', { p_user: m.id, p_blocked: next });
      if (r.error) { toast(t('errAction', { m: r.error.message }), true); return; }
      toast(t(next ? 'blockedOk' : 'unblockedOk'));
      await reloadKeepDrawer(m.id);
    };
  }

  async function reloadKeepDrawer(id) {
    // 메모 편집 중이면 그 값을 지키기 위해 목록만 다시 읽고 서랍은 다시 그리지 않는다
    var keepMemo = memoDirty;
    await load(true);
    if (openId === id && !keepMemo) { detailFor = null; loadDetail(id); }
  }

  // ── export / copy ──
  function csvCell(v) {
    var s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // 스프레드시트 수식 주입 방지
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function downloadCsv(rows) {
    var head = ['name', 'affiliation', 'email', 'plan', 'blocked', 'plan_end', 'status', 'last_seen', 'days7', 'days30', 'minutes30', 'app_version', 'devices', 'joined'];
    var lines = [head.join(',')].concat(rows.map(function (m) {
      return [m.name, m.affiliation, m.email, m.plan, m.is_blocked ? 'yes' : '', m.plan_end ? fmtD(m.plan_end) : '',
        status(m), m.last_seen ? fmtDT(m.last_seen) : '', m.days7, m.days30, m.mins30, m.app_version || '', m.devices,
        fmtD(m.created_at)].map(csvCell).join(',');
    }));
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'strix-members-' + fmtD(Date.now()) + '.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast(t('csvDone'));
  }
  function copyEmails(rows) {
    var list = rows.map(function (m) { return m.email; }).filter(Boolean);
    var text = list.join(', ');
    var done = function () { toast(t('copied', { n: list.length })); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { window.prompt('', text); });
    } else {
      window.prompt('', text);
    }
  }

  function toast(s, err) {
    var e = root && root.querySelector('.toast');
    if (!e) return;
    e.textContent = s;
    e.classList.toggle('err', !!err);
    e.classList.add('show');
    clearTimeout(toast.h);
    toast.h = setTimeout(function () { e.classList.remove('show'); }, err ? 4000 : 1800);
  }

  // ── load ──
  function describeError(err) {
    var msg = (err && err.message) || 'unknown';
    if (err && (err.code === 'PGRST202' || /could not find the function/i.test(msg))) return t('errNoFn', { f: MIGRATION_FILE });
    if (err && (err.code === '42501' || /forbidden/i.test(msg))) return t('errForbidden');
    return t('errLoad', { m: msg });
  }

  async function load(quiet) {
    if (!sb) return;
    var res;
    try { res = await sb.rpc('admin_members_overview'); }
    catch (e) { res = { error: e }; }
    if (!root) return;
    if (res.error) {
      loadError = describeError(res.error);
      if (!quiet) data = data || null;
    } else {
      loadError = null;
      data = res.data || { members: [] };
      loadedAt = Date.now();
      var ids = {};
      members().forEach(function (m) { ids[m.id] = true; });
      Object.keys(sel).forEach(function (id) { if (!ids[id]) delete sel[id]; });
      if (openId && !ids[openId]) { openId = null; memoDirty = false; }
    }
    renderData();
  }

  function renderData() {
    renderUpd();
    renderBanners();
    renderKpis();
    renderDaily();
    renderHeat();
    renderDist();
    renderChips();
    renderTable();
    renderBulk();
    // 메모를 쓰는 중이면 서랍을 다시 그리지 않는다(입력이 사라진다)
    if (openId && !memoDirty) renderDrawer();
  }

  function renderAll() { applyLang(); renderRange(); renderData(); }

  function onKey(e) {
    if (e.key !== 'Escape' || !root) return;
    if (openId) closeDrawer();
    else if (confirmDiscard()) window.closeMembersModal();
  }
  function onResize() { if (root) renderDaily(); }

  window.StrixMembersDashboard = {
    open: function (box, client) {
      root = box; sb = client;
      shell();
      renderAll();
      load();
      timers.push(setInterval(renderUpd, 1000));
      timers.push(setInterval(function () { if (!document.hidden) load(true); }, REFRESH_MS));
      document.addEventListener('keydown', onKey);
      window.addEventListener('resize', onResize);
    },
    close: function () {
      timers.forEach(clearInterval);
      timers = [];
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      if (tipEl) tipEl.style.display = 'none';
      if (root) root.innerHTML = '';
      root = null; sb = null; data = null; loadedAt = 0; loadError = null;
      openId = null; detail = null; detailFor = null; memoDirty = false; sel = {};
    }
  };
})();
