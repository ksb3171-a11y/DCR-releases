/* ============================================================================
   STRIX site — comments in the video window (videos.html)
   One page for both windows: the app's video window loads this same file.

   Reading is public; posting and reporting need an account. The database decides
   what a client may do (supabase/migrations/20261102_video_comments.sql) — the
   checks here are only for the screen.

   Security: DOM is built with createElement/textContent only; comment text never
   reaches innerHTML. Times in a comment become buttons, nothing else is parsed.
   Devplan: video_comments_devplan.md
   ============================================================================ */
(function () {
  'use strict';

  var ADMIN_EMAIL = 'ksb3171@gmail.com';   // screen only — RLS and triggers hold the real right
  var MAX_LEN = 2000;
  var TIME_RE = /(^|[^\d:])(\d{1,2}):([0-5]\d)(?![\d:])/g;
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var TOKEN_RE = /^[0-9a-f]{20,128}$/i;
  var AUTH_WAIT_MS = 8000;

  var V, t, el, sb;
  var refs = {};
  var S = {
    side: 'list', video: null, items: [], reports: [], loading: false, failed: false,
    user: null, authBusy: false, sort: 'top', onlyReported: false,
    replyTo: null, editId: null, draft: '', asOfficial: false, asPinned: false, busy: false, dialog: null
  };
  var loadSeq = 0;
  var authTimer = null;
  var toastTimer = null;

  function isAdmin() { return !!(S.user && S.user.email === ADMIN_EMAIL); }
  function fmt(sec) {
    var s = Math.max(0, Math.floor(sec)), m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }
  function fill(key, vars) {
    var s = t(key);
    Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function btn(cls, text, fn) {
    var b = el('button', cls, text);
    b.type = 'button';
    if (fn) b.addEventListener('click', fn);
    return b;
  }
  function when(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(V.lang, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function toast(msg) {
    if (refs.toast) refs.toast.remove();
    refs.toast = el('div', 'vc-toast', msg);
    refs.toast.setAttribute('role', 'status');
    document.body.appendChild(refs.toast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { if (refs.toast) { refs.toast.remove(); refs.toast = null; } }, 2600);
  }

  /* ── What the list shows ── */
  function live() {
    return S.items.filter(function (c) { return !c.is_deleted && (!c.is_hidden || isAdmin()); });
  }
  function repliesOf(id) {
    return S.items.filter(function (c) { return c.parent_id === id && !c.is_deleted && (!c.is_hidden || isAdmin()); });
  }
  function reportsOn(id) { return S.reports.filter(function (r) { return r.comment_id === id; }).length; }
  function iReported(id) {
    return !!S.user && S.reports.some(function (r) { return r.comment_id === id && r.reporter_id === S.user.id; });
  }
  function firstTime(c) {
    TIME_RE.lastIndex = 0;
    var m = TIME_RE.exec(c.body || '');
    return m ? Number(m[2]) * 60 + Number(m[3]) : Infinity;
  }
  function roots() {
    var list = S.items.filter(function (c) {
      if (c.parent_id) return false;
      if (c.is_hidden && !isAdmin()) return false;
      return !c.is_deleted || repliesOf(c.id).length > 0;   // a deleted comment stays only to hold its replies
    });
    if (S.onlyReported && isAdmin()) {
      list = S.items.filter(function (c) { return !c.is_deleted && reportsOn(c.id) > 0; });
    }
    return list.slice().sort(function (a, b) {
      if (S.sort === 'time') return firstTime(a) - firstTime(b);
      if (S.sort === 'new') return b.created_at < a.created_at ? -1 : 1;
      return (Number(b.is_pinned) - Number(a.is_pinned)) || (a.created_at < b.created_at ? -1 : 1);
    });
  }

  /* ── Comment text: times become buttons, the rest stays plain text ── */
  function bodyNode(c) {
    if (c.is_deleted) return el('p', 'vc-b vc-gone', t('vc.deleted'));
    var p = el('p', 'vc-b');
    var s = c.body || '', i = 0, m;
    var dur = S.video ? S.video.durationSec : 0;
    TIME_RE.lastIndex = 0;
    while ((m = TIME_RE.exec(s))) {
      var sec = Number(m[2]) * 60 + Number(m[3]);
      if (dur && sec > dur) continue;
      var at = m.index + m[1].length;
      p.appendChild(document.createTextNode(s.slice(i, at)));
      p.appendChild(btn('vc-ts', s.slice(at, TIME_RE.lastIndex), seekFn(sec)));
      i = TIME_RE.lastIndex;
    }
    p.appendChild(document.createTextNode(s.slice(i)));
    return p;
  }
  function seekFn(sec) { return function () { V.seek(sec); toast(fill('vc.seek', { t: fmt(sec) })); }; }

  function commentNode(c, isReply) {
    var mine = !!S.user && c.author_id === S.user.id;
    var admin = isAdmin();
    var box = el('article', 'vc' + (isReply ? ' vc-reply' : '') + (c.is_official && !c.is_deleted ? ' vc-off' : '') + (c.is_hidden ? ' vc-hid' : ''));
    var h = el('div', 'vc-h');
    var name = c.author_name || t('vc.member');
    h.appendChild(el('span', 'vc-av' + (c.is_official ? ' vc-av-st' : ''), name.charAt(0).toUpperCase()));
    if (!c.is_deleted) {
      h.appendChild(el('span', 'vc-name', name));
      if (c.is_official) h.appendChild(el('span', 'vc-pill vc-p-off', t('vc.official')));
      if (c.is_pinned) h.appendChild(el('span', 'vc-pill vc-p-pin', t('vc.pinned')));
      if (mine) h.appendChild(el('span', 'vc-pill vc-p-me', t('vc.mine')));
      if (admin && reportsOn(c.id)) h.appendChild(el('span', 'vc-pill vc-p-rep', fill('vc.reports', { n: reportsOn(c.id) })));
      if (c.is_hidden) h.appendChild(el('span', 'vc-pill vc-p-hid', t('vc.hidden')));
      h.appendChild(el('span', 'vc-date', when(c.created_at)));
    }
    box.appendChild(h);
    box.appendChild(bodyNode(c));
    if (c.is_deleted) return box;

    var a = el('div', 'vc-a');
    if (S.user && !c.parent_id) {
      a.appendChild(btn('vc-lnk', t('vc.reply'), function () {
        S.replyTo = c.id; S.editId = null; S.draft = ''; render(true);
      }));
    }
    if (mine) {
      a.appendChild(btn('vc-lnk', t('vc.edit'), function () {
        S.editId = c.id; S.replyTo = null; S.draft = c.body;
        S.asOfficial = c.is_official; S.asPinned = c.is_pinned; render(true);
      }));
    }
    if (mine || admin) a.appendChild(btn('vc-lnk vc-dng', t('vc.delete'), function () { S.dialog = { kind: 'delete', id: c.id }; renderDialog(); }));
    if (S.user && !mine && !c.is_official) {
      var done = iReported(c.id);
      var r = btn('vc-lnk', done ? t('vc.reported') : t('vc.report'), function () { S.dialog = { kind: 'report', id: c.id, reason: 'spam' }; renderDialog(); });
      r.disabled = done;
      a.appendChild(r);
    }
    if (admin) {
      if (!c.parent_id) a.appendChild(btn('vc-lnk', c.is_pinned ? t('vc.unpin') : t('vc.pin'), function () { patch(c, { is_pinned: !c.is_pinned }); }));
      a.appendChild(btn('vc-lnk', c.is_official ? t('vc.unofficial') : t('vc.markOfficial'), function () { patch(c, { is_official: !c.is_official }); }));
      a.appendChild(btn('vc-lnk', c.is_hidden ? t('vc.unhide') : t('vc.hide'), function () {
        patch(c, { is_hidden: !c.is_hidden }, !c.is_hidden);
      }));
      if (reportsOn(c.id)) a.appendChild(btn('vc-lnk', t('vc.clearReports'), function () { clearReports(c.id); }));
    }
    if (a.childNodes.length) box.appendChild(a);
    return box;
  }

  /* ── Panel ── */
  function render(focus) {
    renderSide();
    renderButton();
    if (S.side !== 'comm' || !S.video) return;
    var keep = refs.list ? refs.list.scrollTop : 0;
    var pane = refs.pane;
    pane.textContent = '';

    var tool = el('div', 'vc-tool');
    tool.appendChild(el('span', '', fill('vc.count', { n: live().length })));
    var flagged = S.items.filter(function (c) { return !c.is_deleted && reportsOn(c.id) > 0; }).length;
    if (isAdmin() && flagged) {
      tool.appendChild(btn('vc-flag' + (S.onlyReported ? ' on' : ''), fill('vc.onlyReported', { n: flagged }), function () {
        S.onlyReported = !S.onlyReported; render();
      }));
    }
    tool.appendChild(el('span', 'vc-sp'));
    var sel = el('select', 'vc-sort');
    sel.setAttribute('aria-label', t('vc.sort'));
    [['top', 'vc.sortTop'], ['time', 'vc.sortTime'], ['new', 'vc.sortNew']].forEach(function (o) {
      var op = el('option', '', t(o[1]));
      op.value = o[0];
      op.selected = S.sort === o[0];
      sel.appendChild(op);
    });
    sel.addEventListener('change', function () { S.sort = sel.value; render(); });
    tool.appendChild(sel);
    pane.appendChild(tool);

    var list = el('div', 'vc-list');
    refs.list = list;
    var rows = roots();
    if (S.loading && !S.items.length) {
      list.appendChild(emptyBox(t('vc.loading'), ''));
    } else if (S.failed) {
      list.appendChild(emptyBox(t('vc.loadFail'), ''));
    } else if (!rows.length) {
      list.appendChild(emptyBox(t('vc.emptyTitle'), t('vc.emptyBody')));
    }
    rows.forEach(function (c) {
      list.appendChild(commentNode(c, false));
      if (S.onlyReported) return;
      repliesOf(c.id).sort(function (a, b) { return a.created_at < b.created_at ? -1 : 1; })
        .forEach(function (r) { list.appendChild(commentNode(r, true)); });
    });
    pane.appendChild(list);
    list.scrollTop = keep;
    pane.appendChild(composer());
    if (focus) {
      var ta = pane.querySelector('textarea');
      if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    }
  }
  function emptyBox(title, body) {
    var e = el('div', 'vc-empty');
    e.appendChild(el('strong', '', title));
    if (body) e.appendChild(el('span', '', body));
    return e;
  }

  function composer() {
    var cp = el('div', 'vc-cp');
    if (S.authBusy) {
      cp.appendChild(el('p', 'vc-note', t('vc.checkingLogin')));
      return cp;
    }
    if (!S.user) {
      cp.appendChild(el('p', 'vc-note', t('vc.guest')));
      var row = el('div', 'vc-row');
      row.appendChild(btn('vc-btn vc-pri', t('vc.login'), function () { S.dialog = { kind: 'login' }; renderDialog(); }));
      var join = el('a', 'vc-btn', t('vc.signup'));
      join.href = 'index.html'; join.target = '_blank'; join.rel = 'noopener';
      row.appendChild(join);
      cp.appendChild(row);
      return cp;
    }
    var admin = isAdmin();
    var target = S.items.filter(function (c) { return c.id === S.replyTo; })[0];
    if (target || S.editId) {
      var ctx = el('div', 'vc-ctx');
      ctx.appendChild(el('span', '', target ? fill('vc.replyTo', { n: target.author_name || t('vc.member') }) : t('vc.editing')));
      ctx.appendChild(el('span', 'vc-sp'));
      ctx.appendChild(btn('vc-lnk', t('vc.cancel'), resetDraft));
      cp.appendChild(ctx);
    }
    var ta = el('textarea');
    ta.maxLength = MAX_LEN;
    ta.value = S.draft;
    ta.placeholder = t(admin ? 'vc.phAdmin' : 'vc.ph');
    ta.setAttribute('aria-label', t('vc.tab'));
    cp.appendChild(ta);
    if (admin) {
      var ad = el('div', 'vc-adm');
      ad.appendChild(check(t('vc.asOfficial'), S.asOfficial, function (v) { S.asOfficial = v; }));
      if (!target) ad.appendChild(check(t('vc.asPinned'), S.asPinned, function (v) { S.asPinned = v; }));
      cp.appendChild(ad);
    }
    var f = el('div', 'vc-row');
    var tm = btn('vc-btn vc-tm', '⏱', function () {
      var at = ta.selectionStart;
      var ins = fmt(V.time() || 0) + ' ';
      ta.value = ta.value.slice(0, at) + ins + ta.value.slice(at);
      S.draft = ta.value; sync();
      ta.focus(); ta.setSelectionRange(at + ins.length, at + ins.length);
    });
    tm.title = t('vc.insertTime');
    tm.setAttribute('aria-label', t('vc.insertTime'));
    f.appendChild(tm);
    f.appendChild(el('span', 'vc-sp'));
    var cnt = el('span', 'vc-cnt');
    f.appendChild(cnt);
    var post = btn('vc-btn vc-pri', S.editId ? t('vc.save') : t('vc.post'), submit);
    f.appendChild(post);
    cp.appendChild(f);
    function sync() {
      cnt.textContent = ta.value.length + '/' + MAX_LEN;
      post.disabled = S.busy || !ta.value.trim();
    }
    ta.addEventListener('input', function () { S.draft = ta.value; sync(); });
    sync();
    return cp;
  }
  function check(label, on, fn) {
    var l = el('label'), c = el('input');
    c.type = 'checkbox'; c.checked = on;
    c.addEventListener('change', function () { fn(c.checked); });
    l.appendChild(c);
    l.appendChild(document.createTextNode(label));
    return l;
  }
  function resetDraft() {
    S.replyTo = null; S.editId = null; S.draft = ''; S.asOfficial = false; S.asPinned = false;
    render();
  }

  function renderSide() {
    refs.tabList.classList.toggle('on', S.side === 'list');
    refs.tabComm.classList.toggle('on', S.side === 'comm');
    refs.tabList.setAttribute('aria-selected', S.side === 'list' ? 'true' : 'false');
    refs.tabComm.setAttribute('aria-selected', S.side === 'comm' ? 'true' : 'false');
    refs.tabComm.textContent = t('vc.tab') + (S.video && !S.loading ? ' (' + live().length + ')' : '');
    refs.vidList.hidden = S.side !== 'list';
    refs.pane.hidden = S.side !== 'comm';
  }
  function renderButton() {
    var b = refs.barBtn;
    b.hidden = !S.video;
    if (!S.video) return;
    var n = live().length;
    var off = live().filter(function (c) { return c.is_official; }).length;
    b.textContent = S.failed ? t('vc.tab') : off ? fill('vc.btnOfficial', { n: n, o: off }) : fill('vc.btn', { n: n });
    b.classList.toggle('on', S.side === 'comm');
  }
  function openComments() {
    if (!S.video) return;     // a playlist-only tab has no single video to comment on
    S.side = 'comm'; render(); loadVideo();
  }

  /* ── Dialogs ── */
  function closeDialog() { S.dialog = null; renderDialog(); }
  function renderDialog() {
    if (refs.back) { refs.back.remove(); refs.back = null; }
    var dl = S.dialog;
    if (!dl) return;
    var back = el('div', 'vc-back'), d = el('div', 'vc-dlg');
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'true');
    var foot = el('div', 'vc-foot');
    var first = null;

    if (dl.kind === 'report') {
      var c = S.items.filter(function (x) { return x.id === dl.id; })[0];
      d.appendChild(el('h3', '', t('vc.reportTitle')));
      d.appendChild(el('p', '', t('vc.reportBody')));
      d.appendChild(el('blockquote', '', c ? c.body : ''));
      ['spam', 'abuse', 'wrong', 'other'].forEach(function (r) {
        var l = el('label', 'vc-radio'), i = el('input');
        i.type = 'radio'; i.name = 'vcReason'; i.checked = dl.reason === r;
        i.addEventListener('change', function () { dl.reason = r; });
        l.appendChild(i);
        l.appendChild(document.createTextNode(t('vc.r.' + r)));
        d.appendChild(l);
      });
      foot.appendChild(btn('vc-btn', t('vc.cancel'), closeDialog));
      foot.appendChild(btn('vc-btn vc-pri', t('vc.report'), function () { sendReport(dl); }));
    } else if (dl.kind === 'delete') {
      d.appendChild(el('h3', '', t('vc.deleteTitle')));
      d.appendChild(el('p', '', t('vc.deleteBody')));
      foot.appendChild(btn('vc-btn', t('vc.cancel'), closeDialog));
      foot.appendChild(btn('vc-btn vc-dngb', t('vc.delete'), function () { removeComment(dl.id); }));
    } else {
      var form = el('form');
      form.appendChild(el('h3', '', t('vc.loginTitle')));
      form.appendChild(el('p', '', t('vc.loginBody')));
      var mk = function (label, type, ac) {
        var l = el('label', 'vc-field', label), i = el('input');
        i.type = type; i.required = true; i.autocomplete = ac;
        l.appendChild(i); form.appendChild(l);
        return i;
      };
      var em = mk(t('vc.email'), 'email', 'username');
      var pw = mk(t('vc.password'), 'password', 'current-password');
      first = em;
      var err = el('p', 'vc-err');
      form.appendChild(err);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        signIn(em.value.trim(), pw.value, err);
      });
      foot.appendChild(btn('vc-btn', t('vc.cancel'), closeDialog));
      var go = el('button', 'vc-btn vc-pri', t('vc.login'));
      go.type = 'submit';
      foot.appendChild(go);
      form.appendChild(foot);
      d.appendChild(form);
    }
    if (dl.kind !== 'login') d.appendChild(foot);
    back.appendChild(d);
    document.body.appendChild(back);
    refs.back = back;
    if (first) first.focus();
  }

  /* ── Data ── */
  function report(error) {
    var msg = (error && error.message) || '';
    toast(msg.indexOf('vc_rate_limited') >= 0 ? t('vc.rateLimited') : t('vc.saveFail'));
  }
  async function loadVideo() {
    var video = S.video;
    if (!video || !sb) return;
    var seq = ++loadSeq;
    S.loading = true; S.failed = false;
    render();
    var res = await sb.from('video_comments')
      .select('id,video_id,parent_id,author_id,author_name,body,is_official,is_pinned,is_hidden,is_deleted,created_at')
      .eq('video_id', video.id).order('created_at', { ascending: true }).limit(500);
    var reps = S.user
      ? await sb.from('video_comment_reports').select('comment_id,reporter_id').eq('video_id', video.id)
      : { data: [] };
    if (seq !== loadSeq) return;      // the viewer moved on while this was loading
    S.loading = false;
    S.failed = !!res.error;
    S.items = res.data || [];
    S.reports = reps.data || [];
    render();
    markReportedVideos();
  }
  /* Staff only: a report on another video must not stay unseen. */
  async function markReportedVideos() {
    if (!isAdmin()) return;
    var res = await sb.from('video_comment_reports').select('video_id').limit(1000);
    var counts = {};
    (res.data || []).forEach(function (r) { counts[r.video_id] = (counts[r.video_id] || 0) + 1; });
    Array.prototype.forEach.call(refs.vidList.querySelectorAll('.vid-item'), function (n) {
      var old = n.querySelector('.vc-p-rep');
      if (old) old.remove();
      var c = counts[n.getAttribute('data-video-id')];
      if (c) n.appendChild(el('span', 'vc-pill vc-p-rep', fill('vc.reports', { n: c })));
    });
  }
  async function submit() {
    var text = S.draft.trim();
    if (!text || S.busy || !S.video || !S.user) return;
    var admin = isAdmin(), res;
    S.busy = true;
    if (S.editId) {
      var edit = { body: text };
      if (admin) { edit.is_official = S.asOfficial; edit.is_pinned = S.asPinned; }
      res = await sb.from('video_comments').update(edit).eq('id', S.editId).select('id');
    } else {
      res = await sb.from('video_comments').insert({
        video_id: S.video.id, parent_id: S.replyTo, author_id: S.user.id, body: text,
        is_official: admin && S.asOfficial, is_pinned: admin && S.asPinned && !S.replyTo
      }).select('id');
    }
    S.busy = false;
    if (res.error || !res.data || !res.data.length) { report(res.error); render(); return; }
    var msg = S.editId ? 'vc.saved' : 'vc.posted';
    S.replyTo = null; S.editId = null; S.draft = ''; S.asOfficial = false; S.asPinned = false;
    toast(t(msg));
    loadVideo();
  }
  async function patch(c, change, clearAfter) {
    var res = await sb.from('video_comments').update(change).eq('id', c.id).select('id');
    if (res.error || !res.data || !res.data.length) { report(res.error); return; }
    if (clearAfter && reportsOn(c.id)) await sb.from('video_comment_reports').delete().eq('comment_id', c.id);
    loadVideo();
  }
  async function clearReports(id) {
    var res = await sb.from('video_comment_reports').delete().eq('comment_id', id);
    if (res.error) { report(res.error); return; }
    loadVideo();
  }
  async function removeComment(id) {
    var res = await sb.from('video_comments').update({ is_deleted: true }).eq('id', id).select('id');
    closeDialog();
    if (res.error || !res.data || !res.data.length) { report(res.error); return; }
    if (isAdmin()) await sb.from('video_comment_reports').delete().eq('comment_id', id);
    toast(t('vc.deletedToast'));
    loadVideo();
  }
  async function sendReport(dl) {
    var res = await sb.from('video_comment_reports').insert({ comment_id: dl.id, reporter_id: S.user.id, reason: dl.reason });
    closeDialog();
    if (res.error) { report(res.error); return; }
    toast(t('vc.reportedToast'));
    loadVideo();
  }

  /* ── Sign-in ── */
  async function signIn(email, password, errEl) {
    errEl.textContent = '';
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) { errEl.textContent = t('vc.loginFail'); return; }
    closeDialog();
    toast(t('vc.loggedIn'));
  }
  function setUser(user) {
    var before = S.user ? S.user.id : null;
    S.user = user || null;
    if ((S.user ? S.user.id : null) === before) return;
    S.replyTo = null; S.editId = null; S.onlyReported = false;
    loadVideo();
  }

  /* The app hands its sign-in over through the main process after the page loads
     (help-video-window.ts). A fresh one-time code gives this window its own session.
     Without a code the window must not stay signed in as somebody other than the app user. */
  function endAppLogin() {
    clearTimeout(authTimer);
    S.authBusy = false;
    render();
  }
  async function appLogin() {
    var p = window.__strixVcLogin;
    window.__strixVcLogin = null;
    if (!p || !UUID_RE.test(String(p.userId || ''))) return;
    if (S.user && S.user.id === p.userId) return;
    S.authBusy = true;
    render();
    clearTimeout(authTimer);
    authTimer = setTimeout(endAppLogin, AUTH_WAIT_MS);
    try {
      if (TOKEN_RE.test(String(p.tokenHash || ''))) {
        await sb.auth.verifyOtp({ token_hash: p.tokenHash, type: 'magiclink' });
      } else if (S.user) {
        await sb.auth.signOut({ scope: 'local' });
      }
    } catch (e) { /* stays signed out: comments can still be read */ }
    endAppLogin();
  }

  function init() {
    V = window.STRIX_VIDEO_WINDOW;
    if (!V || !window.supabase) return;     // no comment library: the video window works as before
    t = V.t; el = V.el;
    sb = window.supabase.createClient(
      'https://vkptgohyktnkrludpwej.supabase.co',
      'sb_publishable_g9dLaqgEqjyjEo8FlRdsKA_h131qxJM'
    );

    refs.vidList = document.getElementById('vidList');
    refs.pane = document.getElementById('vidComments');
    refs.barBtn = document.getElementById('vidCommentsBtn');
    refs.tabList = document.getElementById('vidSideList');
    refs.tabComm = document.getElementById('vidSideComments');
    refs.tabList.textContent = t('vc.tabList');
    document.getElementById('vidSideTabs').hidden = false;
    refs.tabList.addEventListener('click', function () { S.side = 'list'; render(); });
    refs.tabComm.addEventListener('click', openComments);
    refs.barBtn.addEventListener('click', openComments);

    /* Esc closes the window (videos.js): a dialog or a half-written comment goes first. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (S.dialog) { e.stopPropagation(); closeDialog(); return; }
      if (e.target && e.target.tagName === 'TEXTAREA' && S.draft) e.stopPropagation();
    }, true);

    V.onChange(function (video) {
      S.video = video; S.items = []; S.reports = []; S.replyTo = null; S.editId = null; S.onlyReported = false;
      if (!video) S.side = 'list';
      loadVideo();
      render();
    });
    S.video = V.current();

    sb.auth.onAuthStateChange(function (_event, session) {
      // supabase-js holds its auth lock during this callback — do not await a query here
      setTimeout(function () { setUser(session && session.user); }, 0);
    });
    window.addEventListener('strix-vc-login', appLogin);
    sb.auth.getSession().then(function (r) {
      S.user = (r.data.session && r.data.session.user) || null;
      loadVideo();
      if (window.__strixVcLogin) appLogin();
    });
    render();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
