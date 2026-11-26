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
      chDaily: '일별 사용자', chDailyNote: '색 = 현재 플랜 · 막대를 누르면 그날 사용자만', chHeat: '요일 · 시간대 사용량', heatNote: '최근 30일 · 한국 시간',
      lgPaid: '유료', lgTrial: '체험', lgBeta: '베타', lgExpired: '만료', dayTotal: '합계',
      dPlan: '플랜 분포', dVer: '앱 버전 (7일 활성 기준)', dOld: '최신이 아닌 버전 사용자 {n}명 — 업데이트 안내 필요',
      noUsage: '아직 사용 기록이 없습니다', noVer: '버전 기록 없음',
      search: '이름 · 소속 · 이메일 검색', searchJ: '이름 · 소속 · 이메일 · 휴대폰 검색',
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
      devs: '{n}대', min: '{n}분', hr: '{n}시간', csvDone: 'CSV 를 내려받았습니다',
      // ── 가입 보기 · 날짜 선택 · 사용 순위 (2026-11-27) ──
      vUse: '사용', vJoin: '가입',
      jk_total: '전체 회원', jk_today: '오늘 가입', jk_7: '7일 가입', jk_30: '30일 가입', jk_unv: '메일 미인증',
      jk_noapp: '가입 후 앱 미사용', jk_conv: '첫 사용 전환율',
      js_total: '누적 가입', js_yd: '어제 {n}명', js_wk: '지난 7일 {n}명', js_avg: '하루 평균 {n}명', js_unv: '인증 메일을 열지 않음',
      js_noapp: '{d} 이후 가입 · 앱을 한 번도 안 켬', js_conv: '{d} 이후 30일 가입자 중', js_noTrack: '앱 사용 기록이 아직 없음',
      jch_daily: '일별 가입자', jch_note: '최근 {n}일 · 막대를 누르면 그날 가입자만', lgV: '메일 인증', lgU: '미인증',
      jch_first: '가입 → 첫 앱 사용', jch_firstNote: '최근 {n}일 가입자 · {d} 이후', jch_org: '소속 상위', jch_orgNote: '최근 {n}일 가입자',
      g0: '가입 당일', g1: '1~3일', g4: '4~7일', g8: '8일 이후', gN: '아직 안 씀', orgNone: '(소속 미기재)', noJoin: '이 기간 가입자가 없습니다',
      jf_today: '오늘', jf_7: '7일', jf_30: '30일', jf_unv: '미인증', jf_noapp: '앱 미사용',
      hj_join: '가입 일시', hj_name: '이름 · 소속', hj_mail: '이메일', hj_phone: '휴대폰', hj_ver: '메일 인증', hj_login: '마지막 로그인',
      hj_first: '첫 앱 사용', hj_plan: '플랜', hj_trial: '체험 종료',
      vOk: '인증', vNo: '미인증', notYet: '아직 안 씀', preTrack: '기록 전 가입', sameDay: '가입 당일', afterN: '가입 {n}일 뒤',
      newb: 'NEW', noPlan: '–', jfoot: '전체 {a}명 · 표시 {b}명 · 메일 미인증 {c}명',
      pick_use: '{d} 사용자 {n}명', pick_join: '{d} 가입자 {n}명', pickClear: '날짜 선택 해제',
      pickNoData: '그날 사용자 목록은 DB 보강 SQL 을 적용한 뒤에 볼 수 있습니다',
      errNoExtra: '가입 정보 · 사용 순위를 보려면 DB 설정이 하나 더 필요합니다. Supabase SQL Editor 에서 {f} 를 실행하세요.',
      dr_join: '가입 정보', i_joinAt: '가입 일시', i_verAt: '메일 인증', i_phone: '휴대폰', i_login: '마지막 로그인',
      i_firstUse: '첫 앱 사용', i_gap: '가입 → 첫 사용', copyPhone: '휴대폰 복사', phoneCopied: '휴대폰 번호를 복사했습니다',
      noProfileActs: '프로필이 없는 가입자라 체험 연장 · 차단을 할 수 없습니다',
      tu_title: '사용 상위', tu_note: '최근 30일 · 사용 시간', tu_all: '상위 30위 전체 보기 […]', tu_none: '아직 사용 기록이 없습니다',
      rk_title: '사용 상위 30위', rk_note: '한국 시간 · 기간 안에 시작한 세션 기준', rk_byMins: '사용 시간', rk_byDays: '사용 일수',
      rk_rank: '순위', rk_name: '이름 · 소속', rk_mins: '사용 시간', rk_share: '점유율', rk_days: '사용 일수', rk_avg: '하루 평균',
      rk_sess: '세션 수', rk_last: '최근 사용', rk_ver: '버전', rk_trend: '지난 기간 대비',
      rk_k_tot: '상위 30명 사용 시간', rk_k_totSub: '전체의 {p}%', rk_k_1: '1위', rk_k_days: '상위 평균 사용 일수',
      rk_k_live: '지금 사용 중', rk_k_liveSub: '상위 {n}명 중', rk_newUser: '신규', rk_empty: '이 기간 사용 기록이 없습니다',
      rk_foot: '줄을 누르면 그 회원 상세 창이 열립니다 · 창 머리를 끌어 옮길 수 있습니다', usingNow: '● 사용 중'
    },
    en: {
      title: 'Members Dashboard', live: 'Live', updAgo: 'updated {n}s ago', loading: 'Loading…',
      r7: '7 days', r30: '30 days', r90: '90 days', refresh: 'Refresh',
      k_total: 'Total members', k_live: 'Using now', k_dau: 'Used today', k_wau: 'Active 7 days', k_mau: 'Active 30 days',
      k_seat: 'Paid seats', k_exp: 'Expiring soon', k_dorm: 'Dormant 30d+',
      s_new: '{n} new (7 days)', s_liveSub: 'Members with the app open', s_vsY: 'vs yesterday', s_ofAll: '{p}% of all',
      s_seat: '{a} of {b} seats in use', s_noSeat: 'No paid seats', s_exp: 'Expire within 14 days', s_dorm: 'No use for 30 days',
      chDaily: 'Daily users', chDailyNote: 'color = current plan · click a bar to list that day', chHeat: 'Usage by weekday · hour', heatNote: 'Last 30 days · KST',
      lgPaid: 'Paid', lgTrial: 'Trial', lgBeta: 'Beta', lgExpired: 'Expired', dayTotal: 'Total',
      dPlan: 'Plans', dVer: 'App version (active 7 days)', dOld: '{n} users not on the latest version — send an update notice',
      noUsage: 'No usage recorded yet', noVer: 'No version data',
      search: 'Search name · company · email', searchJ: 'Search name · company · email · phone',
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
      devs: '{n}', min: '{n} min', hr: '{n} h', csvDone: 'CSV downloaded',
      // ── sign-ups view · day pick · usage ranking (2026-11-27) ──
      vUse: 'Usage', vJoin: 'Sign-ups',
      jk_total: 'Total members', jk_today: 'Joined today', jk_7: 'Joined 7 days', jk_30: 'Joined 30 days', jk_unv: 'Email not verified',
      jk_noapp: 'Never opened app', jk_conv: 'First-use rate',
      js_total: 'All sign-ups', js_yd: '{n} yesterday', js_wk: '{n} in the 7 days before', js_avg: '{n} per day avg', js_unv: 'Verification email not opened',
      js_noapp: 'Joined since {d} · never opened the app', js_conv: 'Of 30-day sign-ups since {d}', js_noTrack: 'No app usage recorded yet',
      jch_daily: 'Daily sign-ups', jch_note: 'Last {n} days · click a bar to list that day', lgV: 'Verified', lgU: 'Not verified',
      jch_first: 'Sign-up → first app use', jch_firstNote: 'Joined in last {n} days · since {d}', jch_org: 'Top companies', jch_orgNote: 'Joined in last {n} days',
      g0: 'Same day', g1: '1–3 days', g4: '4–7 days', g8: '8+ days', gN: 'Not yet', orgNone: '(no company)', noJoin: 'No sign-ups in this period',
      jf_today: 'Today', jf_7: '7 days', jf_30: '30 days', jf_unv: 'Not verified', jf_noapp: 'No app use',
      hj_join: 'Joined', hj_name: 'Name · Company', hj_mail: 'Email', hj_phone: 'Phone', hj_ver: 'Email verified', hj_login: 'Last sign-in',
      hj_first: 'First app use', hj_plan: 'Plan', hj_trial: 'Trial ends',
      vOk: 'Verified', vNo: 'Not verified', notYet: 'Not yet', preTrack: 'Joined before tracking', sameDay: 'Same day', afterN: '{n} d after joining',
      newb: 'NEW', noPlan: '–', jfoot: '{a} members · {b} shown · {c} not verified',
      pick_use: '{d} · {n} users', pick_join: '{d} · {n} sign-ups', pickClear: 'Clear day',
      pickNoData: 'The user list for that day appears after the database update SQL is applied',
      errNoExtra: 'Sign-up details and the usage ranking need one more database step. Run {f} in the Supabase SQL Editor.',
      dr_join: 'Sign-up', i_joinAt: 'Joined', i_verAt: 'Email verified', i_phone: 'Phone', i_login: 'Last sign-in',
      i_firstUse: 'First app use', i_gap: 'Sign-up → first use', copyPhone: 'Copy phone', phoneCopied: 'Phone number copied',
      noProfileActs: 'This sign-up has no profile, so trial extension and block are unavailable',
      tu_title: 'Top users', tu_note: 'Last 30 days · use time', tu_all: 'Show top 30 […]', tu_none: 'No usage recorded yet',
      rk_title: 'Top 30 users', rk_note: 'KST · sessions started in the period', rk_byMins: 'Use time', rk_byDays: 'Days used',
      rk_rank: 'Rank', rk_name: 'Name · Company', rk_mins: 'Use time', rk_share: 'Share', rk_days: 'Days used', rk_avg: 'Avg per day',
      rk_sess: 'Sessions', rk_last: 'Last used', rk_ver: 'Version', rk_trend: 'vs previous',
      rk_k_tot: 'Top 30 use time', rk_k_totSub: '{p}% of all', rk_k_1: '#1', rk_k_days: 'Avg days used (top)',
      rk_k_live: 'Using now', rk_k_liveSub: 'of top {n}', rk_newUser: 'new', rk_empty: 'No usage in this period',
      rk_foot: 'Click a row to open that member · drag the window header to move it', usingNow: '● Using now'
    }
  };

  var MIGRATION_FILE = 'supabase/migrations/20261106_member_usage.sql';
  var MIGRATION_FILE2 = 'supabase/migrations/20261127_member_signup_rank.sql';   // 가입 정보 · 날짜별 사용자 · 순위
  var VIEW_KEY = 'strix.membersDash.view';
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

  // 가입 보기 (2026-11-27). 보기마다 필터·정렬을 따로 둔다 — 전환해도 상대 보기 상태가 섞이지 않게
  var view = readView();
  var jFilter = 'all', jSortK = 'join', jSortDir = -1;
  var extra = null, extraError = null, joinCache = null, joinCacheKey = null;
  var dayPick = null;   // { view: 'use'|'join', ago: n } — 막대를 누르면 그날 회원만 표에 남긴다
  // 사용 순위 창. seq = 늦게 온 옛 응답을 버리는 표식
  var rank = { open: false, days: 30, by: 'mins', data: null, err: null, seq: 0, loading: false, pos: null };

  function readView() {
    try { var v = window.localStorage.getItem(VIEW_KEY); return v === 'use' ? 'use' : 'join'; } catch (e) { return 'join'; }
  }
  function saveView() { try { window.localStorage.setItem(VIEW_KEY, view); } catch (e) { /* 저장 못 해도 동작에는 무관 */ } }

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
  // 합친 목록(가입 정보 포함)에서 먼저 찾는다 — 어느 보기에서 열어도 상세 창의 가입 정보가 찬다.
  // 프로필이 없는 가입자도 여기에만 있다
  function byId(id) {
    var j = joinMembers();
    for (var k = 0; k < j.length; k++) if (j[k].id === id) return j[k];
    var a = members();
    for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
    return null;
  }

  function planBadge(m) {
    if (!m.plan) return '<span class="af">' + esc(t('noPlan')) + '</span>';
    return '<span class="badge b-' + esc(m.plan) + '">' + esc(t('p_' + m.plan)) + '</span>' +
      (m.is_blocked ? '<span class="badge b-block">' + esc(t('blocked')) + '</span>' : '');
  }

  // ── 가입 보기 자료 ──
  // 회원 목록(profiles 기준) + admin_members_extra(auth.users 기준)를 id 로 합친다.
  // extra 가 없으면(DB 보강 전) 회원 목록 그대로 — 가입 일시 · 이름 · 플랜은 나오고 새 칸만 비어 보인다.
  function joinMembers() {
    var key = [data, extra];
    if (joinCache && joinCacheKey && joinCacheKey[0] === key[0] && joinCacheKey[1] === key[1]) return joinCache;
    var base = members(), out = [], seen = {};
    var ex = {};
    ((extra && extra.members) || []).forEach(function (e) { if (e && e.id) ex[e.id] = e; });
    base.forEach(function (m) {
      var e = ex[m.id];
      seen[m.id] = true;
      out.push(e ? Object.assign({}, m, {
        phone: e.phone, email_confirmed_at: e.email_confirmed_at, last_sign_in_at: e.last_sign_in_at,
        first_seen: e.first_seen, created_at: m.created_at || e.created_at, email: m.email || e.email, hasExtra: true
      }) : m);
    });
    Object.keys(ex).forEach(function (id) {
      if (seen[id]) return;
      var e = ex[id];
      out.push({ id: id, name: e.name, affiliation: e.affiliation, email: e.email, created_at: e.created_at,
        phone: e.phone, email_confirmed_at: e.email_confirmed_at, last_sign_in_at: e.last_sign_in_at, first_seen: e.first_seen,
        plan: null, is_blocked: false, noProfile: true, hasExtra: true, days7: 0, days30: 0, mins30: 0, devices: 0 });
    });
    joinCache = out; joinCacheKey = key;
    return out;
  }
  function hasExtra() { return !!(extra && extra.members); }
  function trackSince() { return extra ? ms(extra.tracking_since) : null; }
  function dayStart(v) { var d = new Date(v); d.setHours(0, 0, 0, 0); return d.getTime(); }
  // 며칠 전인가(브라우저 날짜 기준 — 운영자 PC 가 한국 시간이면 서버 KST 와 같다)
  function agoOf(v) { return v == null ? null : Math.round((dayStart(Date.now()) - dayStart(v)) / DAY); }
  function joinedAgo(m) { return agoOf(ms(m.created_at)); }
  // 사용 기록이 시작된 날 이후 가입했는가 — 그 전 가입자의 「첫 사용」 은 알 수 없다
  function trackable(m) { var s = trackSince(); return s != null && ms(m.created_at) >= dayStart(s); }
  function neverUsed(m) { return hasExtra() && trackable(m) && !m.first_seen; }
  function gapDays(m) { return m.first_seen ? Math.max(0, Math.floor((ms(m.first_seen) - ms(m.created_at)) / DAY)) : null; }
  function within(m, n) { var a = joinedAgo(m); return a != null && a < n; }

  var JFILTERS = [
    ['all', function () { return true; }],
    ['today', function (m) { return joinedAgo(m) === 0; }],
    ['7', function (m) { return within(m, 7); }],
    ['30', function (m) { return within(m, 30); }],
    ['unv', function (m) { return hasExtra() && !m.email_confirmed_at; }],
    ['noapp', neverUsed],
    ['block', function (m) { return m.is_blocked; }]
  ];
  function jFilterFn(k) { for (var i = 0; i < JFILTERS.length; i++) if (JFILTERS[i][0] === k) return JFILTERS[i][1]; return JFILTERS[0][1]; }

  // 날짜 선택 — 그날의 회원 id 집합. 사용 보기는 서버의 날짜별 id(없으면 최근 14일은 act14), 가입 보기는 가입일
  function pickedIds() {
    if (!dayPick || dayPick.view !== view) return null;
    var set = {};
    if (view === 'join') {
      joinMembers().forEach(function (m) { if (joinedAgo(m) === dayPick.ago) set[m.id] = true; });
      return set;
    }
    var du = extra && extra.day_users && extra.day_users[String(dayPick.ago)];
    if (du) { du.forEach(function (id) { set[id] = true; }); return set; }
    if (dayPick.ago < 14) { members().forEach(function (m) { if (act(m, dayPick.ago) > 0) set[m.id] = true; }); return set; }
    return set;
  }
  function togglePick(ago) {
    if (dayPick && dayPick.view === view && dayPick.ago === ago) dayPick = null;
    else {
      if (view === 'use' && !(extra && extra.day_users) && ago >= 14) { toast(t('pickNoData'), true); return; }
      dayPick = { view: view, ago: ago };
      if (view === 'use') filter = 'all'; else jFilter = 'all';
    }
    renderDailyAny(); renderChips(); renderKpis(); renderTable();
  }
  function dotHtml(st) { return '<span class="dot ' + esc(st === 'live' ? 'pulse' : st) + '"></span>'; }

  // ── shell ──
  function shell() {
    root.innerHTML =
      '<div class="mdash" role="dialog" aria-modal="true">' +
        '<div class="hdr">' +
          '<h1>👥 <span data-t="title"></span></h1>' +
          '<span class="live"><span class="dot pulse"></span><span data-t="live"></span> · <span class="upd"></span></span>' +
          '<div class="seg view"><button data-v="use">📈 <span data-t="vUse"></span></button><button data-v="join">📝 <span data-t="vJoin"></span></button></div>' +
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
          '<div class="charts use-only">' +
            '<div class="card"><h3><span data-t="chDaily"></span><span class="note" data-t="chDailyNote"></span><span class="sp"></span>' +
              '<span class="legend">' +
                '<span><i style="background:var(--accent)"></i><span data-t="lgPaid"></span></span>' +
                '<span><i style="background:var(--blue)"></i><span data-t="lgTrial"></span></span>' +
                '<span><i style="background:var(--violet)"></i><span data-t="lgBeta"></span></span>' +
                '<span><i style="background:var(--danger)"></i><span data-t="lgExpired"></span></span>' +
              '</span></h3><svg class="daily"></svg></div>' +
            '<div class="card"><h3><span data-t="chHeat"></span><span class="sp"></span><span class="note" data-t="heatNote"></span></h3><div class="heat"></div></div>' +
            '<div class="card dist"></div>' +
            '<div class="card bars topu"></div>' +
          '</div>' +
          '<div class="charts join-only">' +
            '<div class="card"><h3><span data-t="jch_daily"></span><span class="note jdailyNote"></span><span class="sp"></span>' +
              '<span class="legend">' +
                '<span><i style="background:var(--accent)"></i><span data-t="lgV"></span></span>' +
                '<span><i style="background:var(--warn)"></i><span data-t="lgU"></span></span>' +
              '</span></h3><svg class="jdaily"></svg></div>' +
            '<div class="card bars jfirst"></div>' +
            '<div class="card bars jorg"></div>' +
          '</div>' +
          '<div class="tbl">' +
            '<div class="tools"><div class="search"><input class="q" type="search"></div><div class="chips"></div><div class="pick"></div></div>' +
            '<div class="bulk"><b class="bulkN"></b><button class="btn bMail">✉ <span data-t="copyMail"></span></button>' +
              '<button class="btn bCsv">⇩ <span data-t="selCsv"></span></button><button class="btn bClr" data-t="clearSel"></button></div>' +
            '<div class="scroll"><table><thead><tr class="thead"></tr></thead><tbody class="tbody"></tbody></table></div>' +
            '<div class="foot"></div>' +
          '</div>' +
        '</div>' +
        '<aside class="drawer"></aside>' +
        '<div class="rankwin" role="dialog" aria-modal="false"></div>' +
        '<div class="toast"></div>' +
      '</div>';

    $('.close').onclick = function () { if (confirmDiscard()) window.closeMembersModal(); };
    $('.refresh').onclick = function () { load(); };
    $('.csv').onclick = function () { downloadCsv(visibleRows()); };
    $('.q').oninput = function (e) { q = e.target.value; renderTable(); };
    $$('.range button').forEach(function (b) {
      b.onclick = function () {
        range = +b.dataset.r;
        if (dayPick && dayPick.ago >= range) dayPick = null;   // 그래프 밖으로 나간 날짜 선택은 푼다
        renderRange(); renderDailyAny(); renderJoinCards(); renderChips(); renderTable();
      };
    });
    $$('.lang button').forEach(function (b) {
      b.onclick = function () { L = b.dataset.l; renderAll(); if (rank.open) renderRank(); };
    });
    $$('.view button').forEach(function (b) {
      b.onclick = function () {
        if (view === b.dataset.v) return;
        view = b.dataset.v; saveView();
        renderView(); renderData();
      };
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
    $('.q').placeholder = view === 'join' ? t('searchJ') : t('search');
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.l === L)); });
  }
  // 보기 전환 — 보이는 블록은 CSS(data-view)가, 숫자·표는 renderData 가 맡는다
  function renderView() {
    root.querySelector('.mdash').setAttribute('data-view', view);
    $$('.view button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.v === view)); });
    $('.q').placeholder = view === 'join' ? t('searchJ') : t('search');
  }
  function curList() { return view === 'join' ? joinMembers() : members(); }
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
    if (!loadError && extraError) h += '<div class="banner">' + esc(extraError) + '</div>';
    $('.banners').innerHTML = h;
  }

  // ── KPI ──
  function renderKpis() { if (view === 'join') renderJoinKpis(); else renderUseKpis(); }

  function renderJoinKpis() {
    var M = joinMembers(), ex = hasExtra(), ts = trackSince();
    var cnt = function (f) { return M.filter(f).length; };
    var today = cnt(function (m) { return joinedAgo(m) === 0; });
    var yd = cnt(function (m) { return joinedAgo(m) === 1; });
    var w = cnt(function (m) { return within(m, 7); });
    var wPrev = cnt(function (m) { var a = joinedAgo(m); return a != null && a >= 7 && a < 14; });
    var m30 = cnt(function (m) { return within(m, 30); });
    var conv30 = M.filter(function (m) { return within(m, 30) && trackable(m); });
    var convUsed = conv30.filter(function (m) { return m.first_seen; }).length;
    var tsTxt = ts != null ? fmtD(ts) : '';
    var K = [
      { k: 'total', v: M.length, s: t('js_total'), f: 'all' },
      { k: 'today', c: 'klive', v: today, s: t('js_yd', { n: yd }), f: 'today' },
      { k: '7', v: w, s: t('js_wk', { n: wPrev }), f: '7',
        trend: { cls: w >= wPrev ? 'up' : 'down', txt: (w >= wPrev ? '▲ ' : '▼ ') + Math.abs(w - wPrev) } },
      { k: '30', v: m30, s: t('js_avg', { n: (m30 / 30).toFixed(1) }), f: '30' },
      { k: 'unv', c: 'kwarn', v: ex ? cnt(function (m) { return !m.email_confirmed_at; }) : '–', s: t('js_unv'), f: ex ? 'unv' : '' },
      { k: 'noapp', c: 'kmute', v: ex && ts != null ? cnt(neverUsed) : '–', s: ts != null ? t('js_noapp', { d: tsTxt }) : t('js_noTrack'), f: ex && ts != null ? 'noapp' : '' },
      { k: 'conv', v: conv30.length ? Math.round(convUsed / conv30.length * 100) + '%' : '–',
        s: ts != null ? t('js_conv', { d: tsTxt }) : t('js_noTrack'), bar: conv30.length ? convUsed / conv30.length : null }
    ];
    var h = '';
    K.forEach(function (x) {
      h += '<div class="kpi ' + esc(x.c || '') + (x.f && x.f !== 'all' && x.f === jFilter ? ' on' : '') + '" data-f="' + esc(x.f || '') + '">' +
        '<div class="lb">' + esc(t('jk_' + x.k)) + '</div>' +
        '<div class="v">' + esc(x.v) + '</div>' +
        '<div class="sub">' + (x.trend ? '<b class="' + esc(x.trend.cls) + '">' + esc(x.trend.txt) + '</b> ' : '') + esc(x.s) + '</div>' +
        (x.bar != null ? '<div class="bar"><i style="width:' + esc(Math.round(Math.min(1, x.bar) * 100)) + '%"></i></div>' : '') +
      '</div>';
    });
    $('.kpis').innerHTML = h;
    $('.kpis').classList.add('k7');
    $$('.kpi').forEach(function (e) {
      if (e.dataset.f) e.onclick = function () { jFilter = e.dataset.f; dayPick = null; renderDailyAny(); renderChips(); renderKpis(); renderTable(); };
    });
  }

  function renderUseKpis() {
    $('.kpis').classList.remove('k7');
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
      if (e.dataset.f) e.onclick = function () { filter = e.dataset.f; dayPick = null; renderDailyAny(); renderChips(); renderKpis(); renderTable(); };
    });
  }

  // ── daily charts ── 일별 사용자(사용 보기) · 일별 가입자(가입 보기)가 같은 막대 함수를 쓴다.
  //    막대(열 전체)를 누르면 그날 회원만 표에 남는다(togglePick). 선택한 날은 밝게 표시한다
  function renderDailyAny() { if (view === 'join') renderJoinDaily(); else renderDaily(); }

  function renderDaily() {
    var byD = {};
    ((data && data.daily) || []).forEach(function (o) { byD[o.d] = o; });
    var rows = [];
    for (var d = range - 1; d >= 0; d--) {
      var o = byD[d] || {};
      rows.push({ d: d, paid: o.paid || 0, trial: o.trial || 0, beta: o.beta || 0, expired: o.expired || 0 });
    }
    stackChart($('.daily'), rows, [['paid', '#4ec9b0', 'lgPaid'], ['trial', '#569cd6', 'lgTrial'], ['beta', '#c586c0', 'lgBeta'], ['expired', '#e06c6c', 'lgExpired']]);
  }

  function renderJoinDaily() {
    var cnt = {}, ex = hasExtra();
    joinMembers().forEach(function (m) {
      var a = joinedAgo(m);
      if (a == null || a < 0 || a >= range) return;
      var c = cnt[a] || (cnt[a] = { v: 0, u: 0 });
      if (!ex || m.email_confirmed_at) c.v++; else c.u++;
    });
    var rows = [];
    for (var d = range - 1; d >= 0; d--) rows.push({ d: d, v: (cnt[d] || {}).v || 0, u: (cnt[d] || {}).u || 0 });
    $('.jdailyNote').textContent = t('jch_note', { n: range });
    stackChart($('.jdaily'), rows, [['v', '#4ec9b0', 'lgV'], ['u', '#e0b341', 'lgU']]);
  }

  function stackChart(svg, rows, COLORS) {
    var W = svg.clientWidth || 700, H = 170, pl = 28, pb = 20, n = rows.length;
    var sum = function (o) { var s = 0; COLORS.forEach(function (kc) { s += o[kc[0]]; }); return s; };
    var picked = dayPick && dayPick.view === view ? dayPick.ago : null;
    var max = 5;
    rows.forEach(function (o) { max = Math.max(max, sum(o)); });
    var bw = (W - pl) / n, g = '';
    for (var y = 0; y <= 4; y++) {
      var v = Math.round(max * y / 4), yy = H - pb - (H - pb - 8) * y / 4;
      g += '<line x1="' + esc(pl) + '" x2="' + esc(W) + '" y1="' + esc(yy) + '" y2="' + esc(yy) + '" stroke="rgba(255,255,255,.06)"/>' +
           '<text x="' + esc(pl - 5) + '" y="' + esc(yy + 4) + '" fill="#6a6a82" font-size="11" text-anchor="end" font-family="Consolas">' + esc(v) + '</text>';
    }
    rows.forEach(function (o, i) {
      var yb = H - pb, x = pl + i * bw + bw * 0.15, w = bw * 0.7;
      var on = picked === o.d, dim = picked != null && !on;
      if (on) g += '<rect x="' + esc(pl + i * bw) + '" y="0" width="' + esc(bw) + '" height="' + esc(H - pb) + '" fill="rgba(220,220,170,.14)" rx="2"/>';
      COLORS.forEach(function (kc) {
        var h = (H - pb - 8) * o[kc[0]] / max;
        yb -= h;
        if (h > 0) g += '<rect x="' + esc(x) + '" y="' + esc(yb) + '" width="' + esc(w) + '" height="' + esc(h) + '" fill="' + esc(kc[1]) + '" rx="1.5"' + (dim ? ' opacity=".35"' : '') + '/>';
      });
      g += '<rect class="hit" data-i="' + esc(i) + '" x="' + esc(pl + i * bw) + '" y="0" width="' + esc(bw) + '" height="' + esc(H - pb) + '" fill="transparent" style="cursor:pointer"/>';
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
          tip += (ci ? ' · ' : '') + '<span style="color:' + esc(kc[1]) + '">■</span> ' + esc(t(kc[2]) + ' ' + o[kc[0]]);
        });
        tip += '<br>' + esc(t('dayTotal')) + ': <b>' + esc(sum(o)) + '</b>';
        tipEl.innerHTML = tip;
        r.setAttribute('fill', 'rgba(255,255,255,.05)');
      };
      r.onmouseleave = function () { tipEl.style.display = 'none'; r.setAttribute('fill', 'transparent'); };
      r.onclick = function () { tipEl.style.display = 'none'; togglePick(rows[+r.dataset.i].d); };
    });
  }

  // ── 가입 보기 카드: 첫 사용까지 · 소속 상위 ──
  function renderJoinCards() {
    var ex = hasExtra(), ts = trackSince();
    var inRange = joinMembers().filter(function (m) { return within(m, range); });
    // 첫 사용까지 — 사용 기록 시작 뒤 가입자만(그 전 가입자는 첫 사용을 알 수 없다)
    var B = [['g0', 0, 'var(--accent)'], ['g1', 0, 'var(--accent)'], ['g4', 0, 'var(--blue)'], ['g8', 0, 'var(--blue)'], ['gN', 0, 'var(--text-mute)']];
    var tr = ex ? inRange.filter(trackable) : [];
    tr.forEach(function (m) {
      var g = gapDays(m);
      B[g == null ? 4 : g === 0 ? 0 : g <= 3 ? 1 : g <= 7 ? 2 : 3][1]++;
    });
    var mx = 1;
    B.forEach(function (b) { mx = Math.max(mx, b[1]); });
    var h = '<h3>' + esc(t('jch_first')) + '<span class="note">' + esc(t('jch_firstNote', { n: range, d: ts != null ? fmtD(ts) : '–' })) + '</span></h3>';
    if (!tr.length) h += '<div class="empty">' + esc(ex && ts != null ? t('noJoin') : t('js_noTrack')) + '</div>';
    else B.forEach(function (b) {
      h += '<div class="row"><span>' + esc(t(b[0])) + '</span><div class="track"><i style="width:' + esc(b[1] / mx * 100) +
        '%;background:' + esc(b[2]) + '"></i></div><span class="n">' + esc(b[1]) + '</span></div>';
    });
    $('.jfirst').innerHTML = h;

    // 소속 상위 — 같은 소속 표기(앞뒤 공백 · 대소문자 무시)를 묶는다
    var org = {}, none = 0;
    inRange.forEach(function (m) {
      var a = String(m.affiliation || '').trim();
      if (!a) { none++; return; }
      var k = a.toLowerCase();
      (org[k] || (org[k] = { name: a, n: 0 })).n++;
    });
    var top = Object.keys(org).map(function (k) { return org[k]; }).sort(function (a, b) { return b.n - a.n || (a.name > b.name ? 1 : -1); }).slice(0, 8);
    if (none) top.push({ name: t('orgNone'), n: none, none: true });
    var om = 1;
    top.forEach(function (o) { om = Math.max(om, o.n); });
    var oh = '<h3>' + esc(t('jch_org')) + '<span class="note">' + esc(t('jch_orgNote', { n: range })) + '</span></h3>';
    if (!top.length) oh += '<div class="empty">' + esc(t('noJoin')) + '</div>';
    top.forEach(function (o) {
      oh += '<div class="row"><span class="' + (o.none ? 'af' : 'org') + '" title="' + esc(o.name) + '">' + esc(o.name) + '</span><div class="track"><i style="width:' + esc(o.n / om * 100) +
        '%;background:var(--violet)"></i></div><span class="n">' + esc(o.n) + '</span></div>';
    });
    $('.jorg').innerHTML = oh;
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

  // ── 사용 상위 카드 (사용 보기) — 이미 받은 30일 사용 시간(mins30)으로 그린다. DB 보강 전에도 나온다
  function renderTopUsers() {
    var top = members().filter(function (m) { return (m.mins30 || 0) > 0; })
      .sort(function (a, b) { return (b.mins30 || 0) - (a.mins30 || 0); }).slice(0, 5);
    var mx = top.length ? top[0].mins30 : 1;
    var h = '<h3>' + esc(t('tu_title')) + '<span class="note">' + esc(t('tu_note')) + '</span></h3>';
    if (!top.length) h += '<div class="empty">' + esc(t('tu_none')) + '</div>';
    top.forEach(function (m, i) {
      h += '<div class="row tu" data-id="' + esc(m.id) + '"><span><b class="rk">' + esc(i + 1) + '</b> ' + esc(m.name || m.email || '–') + '</span>' +
        '<div class="track"><i style="width:' + esc(m.mins30 / mx * 100) + '%;background:var(--accent)"></i></div>' +
        '<span class="n w">' + esc(fmtMin(m.mins30)) + '</span></div>';
    });
    h += '<div class="tuFoot"><button class="btn rkOpen">🏆 ' + esc(t('tu_all')) + '</button></div>';
    var el = $('.topu');
    el.innerHTML = h;
    el.querySelector('.rkOpen').onclick = function () { openRank(); };
    Array.prototype.forEach.call(el.querySelectorAll('.row.tu'), function (r) { r.onclick = function () { openDrawer(r.dataset.id); }; });
  }

  // ── table ──
  var COLS = ['st', 'name', 'mail', 'plan', 'expd', 'last', '14', 'hrs', 'ver', 'join'];
  var JCOLS = ['join', 'name', 'mail', 'phone', 'ver', 'login', 'first', 'plan', 'trial'];
  var JSORT = {
    join: function (m) { return ms(m.created_at) || 0; },
    name: function (m) { return (m.name || '').toLowerCase(); },
    mail: function (m) { return (m.email || '').toLowerCase(); },
    phone: function (m) { return m.phone || ''; },
    ver: function (m) { return ms(m.email_confirmed_at) || -1; },
    login: function (m) { return ms(m.last_sign_in_at) || -1; },
    first: function (m) { return ms(m.first_seen) || -1; },
    plan: function (m) { return m.plan || ''; },
    trial: function (m) { return m.plan === 'trial' ? (ms(m.plan_end) || 0) : -1; }
  };
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
    var J = view === 'join';
    var r = curList().filter(J ? jFilterFn(jFilter) : filterFn(filter));
    var pick = pickedIds();
    if (pick) r = r.filter(function (m) { return pick[m.id]; });
    if (q) {
      var s = q.toLowerCase();
      r = r.filter(function (m) {
        return ((m.name || '') + ' ' + (m.affiliation || '') + ' ' + (m.email || '') + ' ' + (J ? (m.phone || '') : '')).toLowerCase().indexOf(s) >= 0;
      });
    }
    var sk = J ? jSortK : sortK, sd = J ? jSortDir : sortDir;
    var key = (J ? JSORT : SORT)[sk];
    return r.slice().sort(function (a, b) {
      var x = key(a), y = key(b);
      if (!J && sk === 'ver') return cmpVer(x, y) * sd;
      return (x > y ? 1 : x < y ? -1 : 0) * sd;
    });
  }

  function renderChips() {
    var J = view === 'join', h = '';
    var list = curList(), F = J ? JFILTERS : FILTERS, cur = J ? jFilter : filter;
    F.forEach(function (f) {
      var lab = J && f[0] !== 'all' && f[0] !== 'block' ? t('jf_' + f[0]) : t('f_' + f[0]);
      h += '<button class="chip' + (cur === f[0] ? ' on' : '') + '" data-f="' + esc(f[0]) + '">' +
        (f[0] === 'live' ? '<span class="dot pulse" style="width:6px;height:6px"></span>' : '') +
        esc(lab) + ' <b>' + esc(list.filter(f[1]).length) + '</b></button>';
    });
    $('.chips').innerHTML = h;
    $$('.chip').forEach(function (c) {
      c.onclick = function () {
        if (J) jFilter = c.dataset.f; else filter = c.dataset.f;
        dayPick = null;
        renderDailyAny(); renderChips(); renderKpis(); renderTable();
      };
    });
    // 날짜 선택 표시 — 누르면 풀린다
    var pick = pickedIds(), ph = '';
    if (pick) {
      var dtxt = fmtD(dayStart(Date.now()) - dayPick.ago * DAY);
      ph = '<button class="chip on pickChip" title="' + esc(t('pickClear')) + '">📅 ' +
        esc(t(J ? 'pick_join' : 'pick_use', { d: dtxt, n: Object.keys(pick).length })) + ' <b>×</b></button>';
    }
    $('.pick').innerHTML = ph;
    var pc = $('.pickChip');
    if (pc) pc.onclick = function () { dayPick = null; renderDailyAny(); renderChips(); renderTable(); };
  }

  function joinRow(m) {
    var ex = !!m.hasExtra;
    var g = gapDays(m);
    var b = '<tr data-id="' + esc(m.id) + '" class="' + (sel[m.id] ? 'sel ' : '') + (openId === m.id ? 'open' : '') + '">' +
      '<td><input type="checkbox" class="ck"' + (sel[m.id] ? ' checked' : '') + '></td>' +
      '<td class="num">' + esc(m.created_at ? fmtDT(m.created_at) : '–') + (isNew(m) ? '<span class="badge b-new">' + esc(t('newb')) + '</span>' : '') + '</td>' +
      '<td><div class="nm">' + esc(m.name || '–') + (m.has_note ? '<span class="memo-mark" title="memo">✎</span>' : '') + '</div><div class="org">' + esc(m.affiliation || '–') + '</div></td>' +
      '<td>' + esc(m.email || '–') + '</td>' +
      '<td class="num">' + esc(m.phone || '–') + '</td><td>';
    if (!ex) b += '<span class="af">–</span>';
    else if (m.email_confirmed_at) b += '<span class="badge b-ok" title="' + esc(fmtDT(m.email_confirmed_at)) + '">' + esc(t('vOk')) + '</span>';
    else b += '<span class="badge b-no">' + esc(t('vNo')) + '</span>';
    b += '</td><td class="num">' + esc(m.last_sign_in_at ? fmtDT(m.last_sign_in_at) : '–') + '</td><td>';
    if (!ex) b += '<span class="af">–</span>';
    else if (g != null) b += '<span title="' + esc(fmtDT(m.first_seen)) + '">' + esc(g === 0 ? t('sameDay') : t('afterN', { n: g })) + '</span>';
    else if (trackable(m)) b += '<span class="af">' + esc(t('notYet')) + '</span>';
    else b += '<span class="af">' + esc(t('preTrack')) + '</span>';
    b += '</td><td>';
    b += planBadge(m);
    b += '</td><td class="num">' + esc(m.plan === 'trial' && m.plan_end ? fmtD(m.plan_end) : '–') + '</td></tr>';
    return b;
  }

  function renderTable() {
    var J = view === 'join';
    var newest = newestVersion();
    var cols = J ? JCOLS : COLS, sk = J ? jSortK : sortK, sd = J ? jSortDir : sortDir, pre = J ? 'hj_' : 'h_';
    var head = '<th class="nosort" style="width:28px"><input type="checkbox" class="all"></th>';
    cols.forEach(function (c) {
      head += '<th data-k="' + esc(c) + '">' + esc(t(pre + c)) + (sk === c ? '<span class="ar">' + (sd > 0 ? '▲' : '▼') + '</span>' : '') + '</th>';
    });
    $('.thead').innerHTML = head;
    $$('thead th[data-k]').forEach(function (th) {
      th.onclick = function () {
        var k = th.dataset.k;
        var asc = (k === 'name' || k === 'mail' || k === 'plan' || k === 'phone') ? 1 : -1;
        if (J) { if (jSortK === k) jSortDir *= -1; else { jSortK = k; jSortDir = asc; } }
        else { if (sortK === k) sortDir *= -1; else { sortK = k; sortDir = asc; } }
        renderTable();
      };
    });

    // 행마다 조립한다. 조립하는 식 하나하나의 끝 값이 esc() 를 거친다(check:site-html-escape)
    var R = visibleRows();
    var body = '';
    if (J) R.forEach(function (m) { body += joinRow(m); });
    else R.forEach(function (m) {
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
        '<td><div class="nm">' + esc(m.name || '–') + (m.has_note ? '<span class="memo-mark" title="memo">✎</span>' : '') + '</div><div class="org">' + esc(m.affiliation || '–') + '</div></td>' +
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
    if (J) {
      var JM = joinMembers();
      $('.foot').textContent = t('jfoot', {
        a: JM.length, b: R.length, c: hasExtra() ? JM.filter(function (m) { return !m.email_confirmed_at; }).length : '–'
      });
    } else {
      $('.foot').textContent = t('foot', {
        a: members().length, b: R.length, c: members().filter(function (m) { return m.live; }).length
      });
    }
  }

  function selectedMembers() { return curList().filter(function (m) { return sel[m.id]; }); }
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

  // 상세 창 맨 위 「가입 정보」 — 값은 admin_members_extra(없으면 받은 값만)
  function joinSection(m, dt) {
    var ex = !!m.hasExtra;
    var first = m.first_seen || (dt && dt.first_seen) || null;
    var g = first ? Math.max(0, Math.floor((ms(first) - ms(m.created_at)) / DAY)) : null;
    var h = '<div class="sec"><h4>' + esc(t('dr_join')) + '</h4><div class="kv">' +
      '<span>' + esc(t('i_joinAt')) + '</span><b class="num">' + esc(m.created_at ? fmtDT(m.created_at) : '–') + '</b>' +
      '<span>' + esc(t('i_verAt')) + '</span><b>';
    if (!ex) h += '–';
    else if (m.email_confirmed_at) h += '<span class="badge b-ok">' + esc(t('vOk')) + '</span> <span class="num af">' + esc(fmtDT(m.email_confirmed_at)) + '</span>';
    else h += '<span class="badge b-no">' + esc(t('vNo')) + '</span>';
    h += '</b>' +
      '<span>' + esc(t('i_phone')) + '</span><b class="num">' + esc(m.phone || '–') + '</b>' +
      '<span>' + esc(t('i_login')) + '</span><b class="num">' + esc(m.last_sign_in_at ? fmtDT(m.last_sign_in_at) : '–') + '</b>' +
      '<span>' + esc(t('i_firstUse')) + '</span><b class="num">' + esc(first ? fmtDT(first) : (ex && !trackable(m) ? t('preTrack') : t('notYet'))) + '</b>' +
      '<span>' + esc(t('i_gap')) + '</span><b>' + esc(g == null ? '–' : g === 0 ? t('sameDay') : t('afterN', { n: g })) + '</b>' +
      '</div>' +
      (m.phone ? '<div class="acts" style="margin-top:8px"><button class="btn phoneBtn">📋 ' + esc(t('copyPhone')) + '</button></div>' : '') +
      '</div>';
    return h;
  }
  function copyText(text, msg) {
    var done = function () { toast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt('', text); });
    else window.prompt('', text);
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
      '<div class="db">';
    html += joinSection(m, dt);
    html += '<div class="mini">' +
          '<div><span>' + esc(t('dr_days')) + '</span><b>' + esc(d30) + '<span style="display:inline;font-size:12px;color:var(--text-dim)"> /30</span></b></div>' +
          '<div><span>' + esc(t('dr_avg')) + '</span><b>' + (d30 ? esc(fmtMin(t30 / d30)) : '–') + '</b></div>' +
          '<div><span>' + esc(t('dr_tot')) + '</span><b>' + esc(fmtMin(t30)) + '</b></div>' +
        '</div>' +
        '<div class="sec"><h4>' + esc(t('dr_grass')) + '</h4><div class="grass">';
    html += grass;
    html += '</div></div>' +
        '<div class="sec"><h4>' + esc(t('dr_info')) + '</h4><div class="kv">' +
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
      // 상세 창의 m 은 합친 사본일 수 있다 — 원래 회원 행에도 반영해 「사용」 표의 메모 표시를 맞춘다
      members().forEach(function (x) { if (x.id === m.id) x.has_note = m.has_note; });
      renderTable();
      toast(t('saved'));
    };
    var pb = dr.querySelector('.phoneBtn');
    if (pb) pb.onclick = function () { copyText(m.phone, t('phoneCopied')); };
    if (m.noProfile) {
      // 프로필 행이 없는 가입자 — 차단(profiles.is_blocked)이 먹지 않으므로 관리 조작을 막고 이유를 보인다
      ['.extSel', '.extBtn', '.blkBtn'].forEach(function (s) { var e = dr.querySelector(s); if (e) e.disabled = true; });
      var hintEl = document.createElement('div');
      hintEl.className = 'hint';
      hintEl.textContent = t('noProfileActs');
      var blk = dr.querySelector('.blkBtn');
      if (blk && blk.parentNode) blk.parentNode.appendChild(hintEl);
    }
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
    if (view === 'join') return downloadCsvRows('strix-signups-',
      ['joined_at', 'name', 'affiliation', 'email', 'phone', 'email_verified_at', 'last_sign_in', 'first_app_use', 'plan', 'trial_end', 'blocked'],
      rows.map(function (m) {
        return [m.created_at ? fmtDT(m.created_at) : '', m.name, m.affiliation, m.email, m.phone || '',
          m.email_confirmed_at ? fmtDT(m.email_confirmed_at) : '', m.last_sign_in_at ? fmtDT(m.last_sign_in_at) : '',
          m.first_seen ? fmtDT(m.first_seen) : '', m.plan || '', m.plan === 'trial' && m.plan_end ? fmtD(m.plan_end) : '', m.is_blocked ? 'yes' : ''];
      }));
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
  function downloadCsvRows(prefix, head, rows) {
    var lines = [head.map(csvCell).join(',')].concat(rows.map(function (r) { return r.map(csvCell).join(','); }));
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = prefix + fmtD(Date.now()) + '.csv';
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

  function isNoFn(err) { var msg = (err && err.message) || ''; return !!err && (err.code === 'PGRST202' || /could not find the function/i.test(msg)); }

  async function load(quiet) {
    if (!sb) return;
    var res, ex;
    // 두 RPC 를 함께 부른다. 보강 함수(admin_members_extra)가 없거나 실패해도 「사용」 보기는 그대로 돈다
    var pa = sb.rpc('admin_members_overview').then(function (r) { return r; }, function (e) { return { error: e }; });
    var pb = sb.rpc('admin_members_extra').then(function (r) { return r; }, function (e) { return { error: e }; });
    res = await pa; ex = await pb;
    if (!root) return;
    if (ex && !ex.error) { extra = ex.data || null; extraError = null; }
    else { extraError = isNoFn(ex && ex.error) ? t('errNoExtra', { f: MIGRATION_FILE2 }) : describeError(ex && ex.error); }
    joinCache = null;
    if (res.error) {
      loadError = describeError(res.error);
      if (!quiet) data = data || null;
    } else {
      loadError = null;
      data = res.data || { members: [] };
      loadedAt = Date.now();
      var ids = {};
      members().forEach(function (m) { ids[m.id] = true; });
      joinMembers().forEach(function (m) { ids[m.id] = true; });
      Object.keys(sel).forEach(function (id) { if (!ids[id]) delete sel[id]; });
      if (openId && !ids[openId]) { openId = null; memoDirty = false; }
    }
    renderData();
  }

  function renderData() {
    renderUpd();
    renderBanners();
    renderKpis();
    // 보이는 보기의 그래프만 그린다(숨은 svg 는 폭이 0 이다)
    if (view === 'join') { renderJoinDaily(); renderJoinCards(); }
    else { renderDaily(); renderHeat(); renderDist(); renderTopUsers(); }
    renderChips();
    renderTable();
    renderBulk();
    // 메모를 쓰는 중이면 서랍을 다시 그리지 않는다(입력이 사라진다)
    if (openId && !memoDirty) renderDrawer();
  }

  function renderAll() { applyLang(); renderView(); renderRange(); renderData(); }

  // ── 사용 상위 30위 창 ──
  // 대시보드 위에 뜨는 떠 있는 창. 머리를 끌어 옮긴다. 기간 · 정렬을 바꾸면 순위를 서버에서 다시 센다
  function openRank() {
    rank.open = true;
    renderRank();
    loadRank();
  }
  function closeRank() {
    rank.open = false;
    var w = $('.rankwin');
    w.classList.remove('show');
    w.innerHTML = '';
  }
  async function loadRank() {
    var my = ++rank.seq;
    rank.loading = true; rank.err = null;
    renderRank();
    var r;
    try { r = await sb.rpc('admin_members_rank', { p_days: rank.days, p_order: rank.by }); }
    catch (e) { r = { error: e }; }
    if (!root || my !== rank.seq || !rank.open) return;   // 늦게 온 옛 응답은 버린다
    rank.loading = false;
    if (r.error) { rank.data = null; rank.err = isNoFn(r.error) ? t('errNoExtra', { f: MIGRATION_FILE2 }) : describeError(r.error); }
    else rank.data = r.data || null;
    renderRank();
  }
  function trendHtml(row) {
    if (!row.prev_mins) return '<span class="af">' + esc(t('rk_newUser')) + '</span>';
    var p = Math.round((row.mins - row.prev_mins) / row.prev_mins * 100);
    if (p > 0) return '<span class="up">' + esc('▲ ' + p + '%') + '</span>';
    if (p < 0) return '<span class="down">' + esc('▼ ' + (-p) + '%') + '</span>';
    return '<span class="af">–</span>';
  }
  function renderRank() {
    var w = $('.rankwin');
    if (!rank.open) { w.classList.remove('show'); return; }
    var d = rank.data, rows = (d && d.rows) || [];
    var total = (d && d.total_mins) || 0, topSum = 0, daysSum = 0, live = 0, mx = 1;
    rows.forEach(function (r) { topSum += r.mins; daysSum += r.days; if (r.live) live++; mx = Math.max(mx, r.mins); });
    var first = rows[0] ? byId(rows[0].id) : null;
    var cols = ['rank', 'name', 'mins', 'share', 'days', 'avg', 'sess', 'last', 'ver', 'trend'];
    var h = '<div class="rkh"><h1>🏆 ' + esc(t('rk_title')) + '</h1><span class="af">' + esc(t('rk_note')) + '</span><div class="sp"></div>' +
      '<div class="seg rkDays"><button data-d="7">' + esc(t('r7')) + '</button><button data-d="30">' + esc(t('r30')) + '</button><button data-d="90">' + esc(t('r90')) + '</button></div>' +
      '<div class="seg rkBy"><button data-b="mins">' + esc(t('rk_byMins')) + '</button><button data-b="days">' + esc(t('rk_byDays')) + '</button></div>' +
      '<button class="btn rkCsv">⇩ CSV</button><button class="x rkX" title="Close">×</button></div>' +
      '<div class="rkb">';
    if (rank.err) h += '<div class="banner err">' + esc(rank.err) + '</div>';
    h += '<div class="kpis rkk">' +
      '<div class="kpi"><div class="lb">' + esc(t('rk_k_tot')) + '</div><div class="v">' + esc(d ? fmtMin(topSum) : '–') + '</div><div class="sub">' +
        esc(total ? t('rk_k_totSub', { p: Math.round(topSum / total * 100) }) : '–') + '</div></div>' +
      '<div class="kpi"><div class="lb">' + esc(t('rk_k_1')) + '</div><div class="v sm">' + esc(first ? (first.name || first.email || '–') : '–') + '</div><div class="sub">' +
        esc(rows[0] ? fmtMin(rows[0].mins) : '–') + '</div></div>' +
      '<div class="kpi"><div class="lb">' + esc(t('rk_k_days')) + '</div><div class="v">' + esc(rows.length ? (daysSum / rows.length).toFixed(1) : '–') + '</div><div class="sub">' +
        esc('/' + rank.days) + '</div></div>' +
      '<div class="kpi klive"><div class="lb">' + esc(t('rk_k_live')) + '</div><div class="v">' + esc(d ? live : '–') + '</div><div class="sub">' +
        esc(t('rk_k_liveSub', { n: rows.length })) + '</div></div>' +
      '</div><div class="scroll rks"><table><thead><tr>';
    cols.forEach(function (c) { h += '<th class="nosort">' + esc(t('rk_' + c)) + '</th>'; });
    h += '</tr></thead><tbody>';
    if (rank.loading && !d) h += '<tr><td colspan="10" class="empty">' + esc(t('loading')) + '</td></tr>';
    else if (!rows.length) h += '<tr><td colspan="10" class="empty">' + esc(rank.err ? '–' : t('rk_empty')) + '</td></tr>';
    rows.forEach(function (r) {
      var m = byId(r.id) || {};
      var medal = r.rank === 1 ? '🥇 ' : r.rank === 2 ? '🥈 ' : r.rank === 3 ? '🥉 ' : '';
      h += '<tr data-id="' + esc(r.id) + '"><td class="num rkn">' + esc(medal + r.rank) + '</td>' +
        '<td><div class="nm">' + esc(m.name || m.email || '–') + '</div><div class="org">' + esc(m.affiliation || '–') + '</div></td>' +
        '<td><span class="rbar"><i style="width:' + esc(r.mins / mx * 100) + '%"></i></span> <span class="num">' + esc(fmtMin(r.mins)) + '</span></td>' +
        '<td class="num">' + esc(total ? (r.mins / total * 100).toFixed(1) + '%' : '–') + '</td>' +
        '<td class="num">' + esc(r.days + '/' + rank.days) + '</td>' +
        '<td class="num">' + esc(r.days ? fmtMin(r.mins / r.days) : '–') + '</td>' +
        '<td class="num">' + esc(r.sessions) + '</td>' +
        '<td' + (r.live ? ' style="color:var(--ok)"' : '') + '>' + esc(r.live ? t('usingNow') : rel(r.last_at)) + '</td>' +
        '<td class="num">' + esc(r.app_version || '–') + '</td><td>';
      h += trendHtml(r);
      h += '</td></tr>';
    });
    h += '</tbody></table></div><div class="foot">' + esc(t('rk_foot')) + '</div></div>';
    w.innerHTML = h;
    w.classList.add('show');
    if (rank.pos) { w.style.left = rank.pos.x + 'px'; w.style.top = rank.pos.y + 'px'; w.style.transform = 'none'; }

    Array.prototype.forEach.call(w.querySelectorAll('.rkDays button'), function (b) {
      b.setAttribute('aria-selected', String(+b.dataset.d === rank.days));
      b.onclick = function () { if (rank.days !== +b.dataset.d) { rank.days = +b.dataset.d; loadRank(); } };
    });
    Array.prototype.forEach.call(w.querySelectorAll('.rkBy button'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.b === rank.by));
      b.onclick = function () { if (rank.by !== b.dataset.b) { rank.by = b.dataset.b; loadRank(); } };
    });
    w.querySelector('.rkX').onclick = closeRank;
    w.querySelector('.rkCsv').onclick = function () {
      downloadCsvRows('strix-top-users-' + rank.days + 'd-',
        ['rank', 'name', 'affiliation', 'email', 'minutes', 'share_pct', 'days', 'sessions', 'last_used', 'app_version', 'prev_minutes'],
        rows.map(function (r) {
          var m = byId(r.id) || {};
          return [r.rank, m.name || '', m.affiliation || '', m.email || '', r.mins, total ? (r.mins / total * 100).toFixed(1) : '',
            r.days, r.sessions, r.last_at ? fmtDT(r.last_at) : '', r.app_version || '', r.prev_mins];
        }));
    };
    Array.prototype.forEach.call(w.querySelectorAll('tbody tr[data-id]'), function (tr) {
      tr.onclick = function () { openDrawer(tr.dataset.id); };
    });
    // 머리를 끌어 옮긴다(버튼 위에서는 끌지 않는다)
    var hd = w.querySelector('.rkh');
    hd.onmousedown = function (e) {
      if (e.button !== 0 || e.target.closest('button')) return;
      var box = root.querySelector('.mdash').getBoundingClientRect(), r0 = w.getBoundingClientRect();
      var ox = e.clientX - r0.left, oy = e.clientY - r0.top;
      var mv = function (ev) {
        var x = Math.max(0, Math.min(box.width - 120, ev.clientX - box.left - ox));
        var y = Math.max(0, Math.min(box.height - 40, ev.clientY - box.top - oy));
        rank.pos = { x: x, y: y };
        w.style.left = x + 'px'; w.style.top = y + 'px'; w.style.transform = 'none';
      };
      var up = function () { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
      e.preventDefault();
    };
  }

  function onKey(e) {
    if (e.key !== 'Escape' || !root) return;
    if (openId) closeDrawer();
    else if (rank.open) closeRank();
    else if (confirmDiscard()) window.closeMembersModal();
  }
  function onResize() { if (root) renderDailyAny(); }

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
      extra = null; extraError = null; joinCache = null; joinCacheKey = null; dayPick = null;
      rank = { open: false, days: 30, by: 'mins', data: null, err: null, seq: 0, loading: false, pos: null };
    }
  };
})();
