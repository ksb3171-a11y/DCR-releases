/* ============================================================================
   STRIX site — Community boards (7 sub-boards in one page, hash-routed).
   Single source: website_redesign_devplan.md.
   Depends on globals from auth.js (_sb, _user, _profile, ADMIN_EMAIL, openModal)
   and i18n.js (currentLang, T, onLangApplied). Renders into #communityApp.

   Views (location.hash):
     #hub            → board directory (7 cards)         [default]
     #b/<board>      → post list for one board
     #p/<id>         → post detail + comments
     #new/<board>    → compose form
   ============================================================================ */
(function () {
  'use strict';

  // ── board catalogue ───────────────────────────────────────────────────────
  var BOARDS = [
    { id: 'notice',  icon: '📢', adminOnly: true },
    { id: 'bug',     icon: '🐞', statusSet: 'bug' },
    { id: 'feature', icon: '💡', statusSet: 'feature', vote: true },
    { id: 'qna',     icon: '❓', answer: true },
    { id: 'free',    icon: '💬' },
    { id: 'info',    icon: '📚' },
    { id: 'inhouse', icon: '🧰' }
  ];
  var BOARD_MAP = {}; BOARDS.forEach(function (b) { BOARD_MAP[b.id] = b; });

  var STATUS = {
    bug:     ['open', 'reviewing', 'fixed', 'wontfix'],
    feature: ['proposed', 'reviewing', 'planned', 'in_progress', 'done', 'declined']
  };
  var STATUS_DEFAULT = { bug: 'open', feature: 'proposed' };

  // ── state ───────────────────────────────────────────────────────────────────
  var _posts = [];          // posts for the active board
  var _myVotes = new Set(); // post ids the current user voted
  var _curBoard = null;
  var _curPost = null;
  var _curComments = [];
  var _curFiles = { post: [], byComment: {} };   // file attachments of the open post
  var _editingPostId = null;                     // compose screen: id when editing
  var _composeKey = null;                        // board|editId the 'post' session belongs to

  // ── helpers ──────────────────────────────────────────────────────────────────
  function ct(key, fallback) {
    var dict = (window.T && window.T[window.currentLang]) || {};
    var en = (window.T && window.T.en) || {};
    return dict[key] || en[key] || fallback || key;
  }
  function esc(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // nl2br() used to render every body. renderBody() below supersedes it and is
  // now the only body renderer — leaving a second one around invites a future
  // field to be rendered through the path that does not know about images.

  // ── attachments (cmUpload.js) ───────────────────────────────────────────────
  //  Bodies may embed markdown image tokens `![alt](url)`. The body is escaped
  //  first — exactly as before — and only URLs under OUR image-bucket prefix
  //  with a safe path are then turned into <img>. Everything else (javascript:,
  //  data:, a foreign host, an attribute-escape attempt) stays plain text,
  //  because the regex simply cannot match it.
  function cmup() { return window.STRIX_CMUP || null }
  function imgPrefix() { var u = cmup(); return u ? u.imagePrefix() : '' }
  function reEsc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

  var _imgRe = null, _imgRePfx = null
  function imgTokenRe() {
    var p = imgPrefix()
    if (!p) return null
    if (!_imgRe || _imgRePfx !== p) {
      _imgRe = new RegExp('!\\[([^\\]\\n]{0,120})\\]\\(' + reEsc(p) + '([A-Za-z0-9_\\-./]{1,200})\\)', 'g')
      _imgRePfx = p
    }
    _imgRe.lastIndex = 0
    return _imgRe
  }

  function renderBody(src) {
    var h = esc(src)                       // ← never skipped, never relaxed
    var re = imgTokenRe()
    if (re) {
      h = h.replace(re, function (m, alt, path) {
        if (path.indexOf('..') >= 0) return m
        return '<img class="cm-img" src="' + imgPrefix() + path + '" alt="' + alt +
               '" loading="lazy" decoding="async" referrerpolicy="no-referrer">'
      })
    }
    return h.replace(/\n/g, '<br>')
  }

  function fmtBytes(n) { var u = cmup(); return u ? u.formatBytes(n) : String(n || 0) }

  // rows come from cmUpload.fetchFiles(), whose url is rebuilt from bucket+path.
  // `?download=` makes Supabase send Content-Disposition: attachment — the plain
  // `download` attribute is ignored cross-origin, so without it a .pdf would
  // open on the storage origin instead of being saved.
  function fileListHtml(rows) {
    if (!rows || !rows.length) return ''
    return '<div class="cm-files">' + rows.map(function (f) {
      var href = f.url + '?download=' + encodeURIComponent(f.name)
      return '<a class="cm-file" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" download="' + esc(f.name) + '">' +
          '<span class="cm-file-ico">📎</span>' +
          '<span class="cm-file-n">' + esc(f.name) + '</span>' +
          '<span class="cm-file-s">' + esc(fmtBytes(f.bytes)) + '</span>' +
        '</a>'
    }).join('') + '</div>'
  }

  function attachBarHtml(scope) {
    return '<div class="cm-attbar">' +
        '<button type="button" class="cm-btn ghost sm" onclick="STRIX_CM.pickImage(\'' + scope + '\')">' +
          esc(ct('comm.attAddImage', 'Add image')) + '</button>' +
        '<button type="button" class="cm-btn ghost sm" onclick="STRIX_CM.pickFile(\'' + scope + '\')">' +
          esc(ct('comm.attAddFile', 'Attach file')) + '</button>' +
        '<span class="cm-atthint">' + esc(ct('comm.attHint', 'Paste a screenshot (Ctrl+V) or drop files here.')) + '</span>' +
      '</div>'
  }
  function fdate(d) {
    if (!d) return '';
    var loc = window.currentLang === 'ko' ? 'ko-KR' : window.currentLang === 'ja' ? 'ja-JP'
            : window.currentLang === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(d).toLocaleDateString(loc);
  }
  function isAdmin() { return window._user && window._user.email === window.ADMIN_EMAIL; }
  function bLabel(id) { return ct('comm.b.' + id + '.t', id); }
  function bDesc(id) { return ct('comm.b.' + id + '.d', ''); }
  function stLabel(s) { return ct('comm.st.' + s, s); }
  function authorName() {
    return (window._profile && window._profile.name) ||
      (window._user && window._user.email ? window._user.email.split('@')[0] : 'Member');
  }
  function app() { return document.getElementById('communityApp'); }
  function go(hash) { location.hash = hash; }
  function requireLogin() {
    if (!window._user) { if (window.openModal) window.openModal('login'); return false; }
    return true;
  }

  // ── router ─────────────────────────────────────────────────────────────────
  function route() {
    var h = (location.hash || '#hub').replace(/^#/, '');
    var parts = h.split('/');
    if (parts[0] === 'b' && BOARD_MAP[parts[1]]) return renderBoard(parts[1]);
    if (parts[0] === 'p' && parts[1]) return renderDetail(parts[1]);
    if (parts[0] === 'new' && BOARD_MAP[parts[1]]) return renderNew(parts[1]);
    return renderHub();
  }

  // ── HUB ──────────────────────────────────────────────────────────────────────
  function renderHub() {
    var el = app(); if (!el) return;
    el.innerHTML =
      '<div class="cm-head">' +
        '<h1 class="cm-title">' + esc(ct('comm.title', 'Community')) + '</h1>' +
        '<p class="cm-lead">' + esc(ct('comm.lead', 'Notices, bug reports, feature ideas, Q&A and knowledge sharing — all in one place.')) + '</p>' +
      '</div>' +
      '<div class="cm-grid" id="cmGrid">' +
        BOARDS.map(function (b) {
          return '<a class="cm-card" href="#b/' + b.id + '">' +
            '<div class="cm-card-ico">' + b.icon + '</div>' +
            '<div class="cm-card-body">' +
              '<div class="cm-card-t">' + esc(bLabel(b.id)) +
                (b.adminOnly ? ' <span class="cm-tag">' + esc(ct('comm.adminOnly', 'Staff')) + '</span>' : '') + '</div>' +
              '<div class="cm-card-d">' + esc(bDesc(b.id)) + '</div>' +
            '</div>' +
            '<div class="cm-card-n" id="cnt-' + b.id + '">–</div>' +
          '</a>';
        }).join('') +
      '</div>' +
      (isAdmin()
        ? '<div class="cm-adminbar"><button type="button" class="cm-btn ghost sm" onclick="STRIX_CM.sweep()">🧹 ' +
            esc(ct('comm.sweep', 'Clean up orphaned uploads')) + '</button></div>'
        : '');
    loadCounts();
  }

  function loadCounts() {
    if (!window._sb) return;
    window._sb.from('community_posts').select('board').then(function (res) {
      var data = (res && res.data) || [];
      var tally = {};
      data.forEach(function (r) { tally[r.board] = (tally[r.board] || 0) + 1; });
      BOARDS.forEach(function (b) {
        var n = document.getElementById('cnt-' + b.id);
        if (n) n.textContent = tally[b.id] || 0;
      });
    });
  }

  // ── BOARD LIST ────────────────────────────────────────────────────────────────
  function renderBoard(boardId) {
    _curBoard = boardId;
    var b = BOARD_MAP[boardId];
    var el = app(); if (!el) return;
    var canWrite = !b.adminOnly || isAdmin();
    el.innerHTML =
      '<div class="cm-bar">' +
        '<a class="cm-back" href="#hub">← ' + esc(ct('comm.allBoards', 'All boards')) + '</a>' +
        (canWrite ? '<button class="cm-btn" onclick="STRIX_CM.newPost(\'' + boardId + '\')">+ ' + esc(ct('comm.new', 'New post')) + '</button>' : '') +
      '</div>' +
      '<div class="cm-bhead"><span class="cm-bico">' + b.icon + '</span>' +
        '<h2 class="cm-btitle">' + esc(bLabel(boardId)) + '</h2></div>' +
      '<div class="cm-list" id="cmList"><div class="cm-empty">' + esc(ct('comm.loading', 'Loading…')) + '</div></div>';
    loadPosts(boardId);
  }

  function loadPosts(boardId) {
    if (!window._sb) return;
    var b = BOARD_MAP[boardId];
    var q = window._sb.from('community_posts')
      .select('id,board,title,body,author_name,status,vote_count,comment_count,view_count,is_pinned,is_hidden,is_answered,admin_reply,created_at')
      .eq('board', boardId)
      .order('is_pinned', { ascending: false })
      .order(b.vote ? 'vote_count' : 'created_at', { ascending: false });
    q.then(function (res) {
      if (res && res.error) { listMsg(esc(ct('comm.loadFail', 'Failed to load.')) + ' ' + esc(res.error.message)); return; }
      _posts = (res && res.data) || [];
      _myVotes = new Set();
      if (window._user && b.vote && _posts.length) {
        window._sb.from('community_votes').select('post_id').eq('user_id', window._user.id)
          .then(function (v) { if (v && v.data) v.data.forEach(function (x) { _myVotes.add(x.post_id); }); renderPostList(boardId); });
      } else {
        renderPostList(boardId);
      }
    });
  }

  function listMsg(html) { var l = document.getElementById('cmList'); if (l) l.innerHTML = '<div class="cm-empty">' + html + '</div>'; }

  function renderPostList(boardId) {
    var b = BOARD_MAP[boardId];
    var l = document.getElementById('cmList'); if (!l) return;
    if (!_posts.length) { l.innerHTML = '<div class="cm-empty">' + esc(ct('comm.emptyBoard', 'No posts yet. Be the first to write one.')) + '</div>'; return; }
    l.innerHTML = _posts.map(function (p) {
      var voted = _myVotes.has(p.id);
      return '<div class="cm-row" onclick="STRIX_CM.open(\'' + p.id + '\')">' +
        (b.vote
          ? '<div class="cm-vote" onclick="event.stopPropagation()">' +
              '<button class="' + (voted ? 'voted' : '') + '" onclick="STRIX_CM.vote(\'' + p.id + '\')" title="Upvote">▲</button>' +
              '<span>' + p.vote_count + '</span></div>'
          : '') +
        '<div class="cm-rmain">' +
          '<div class="cm-rtitle">' +
            (p.is_pinned ? '<span class="cm-pin">📌</span> ' : '') +
            esc(p.title) +
            (p.comment_count ? ' <span class="cm-cc">[' + p.comment_count + ']</span>' : '') +
            (b.answer && p.is_answered ? ' <span class="cm-badge st-done">✓ ' + esc(ct('comm.answered', 'Answered')) + '</span>' : '') +
          '</div>' +
          '<div class="cm-rmeta">' +
            (p.status ? '<span class="cm-badge st-' + p.status + '">' + esc(stLabel(p.status)) + '</span>' : '') +
            '<span>' + esc(p.author_name) + '</span><span>· ' + fdate(p.created_at) + '</span>' +
            (p.admin_reply ? '<span class="cm-replied">· 💬 ' + esc(ct('comm.staffReplied', 'Staff replied')) + '</span>' : '') +
            (p.is_hidden ? '<span class="cm-hidden">· ' + esc(ct('comm.hidden', 'hidden')) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="cm-rstat">👁 ' + p.view_count + '</div>' +
      '</div>';
    }).join('');
  }

  // ── DETAIL ────────────────────────────────────────────────────────────────────
  function renderDetail(id) {
    var el = app(); if (!el) return;
    el.innerHTML = '<div class="cm-empty">' + esc(ct('comm.loading', 'Loading…')) + '</div>';
    if (!window._sb) return;
    window._sb.from('community_posts').select('*').eq('id', id).single().then(function (res) {
      if (!res || res.error || !res.data) { el.innerHTML = '<div class="cm-empty">' + esc(ct('comm.notFound', 'Post not found.')) + '</div>'; return; }
      _curPost = res.data;
      _curBoard = _curPost.board;
      try { window._sb.rpc('cp_bump_view', { pid: id }); } catch (e) {}
      // Read state for the desktop app's unread badge (community_badge_devplan.md).
      // No-op for anonymous visitors (the function returns early on null auth.uid()).
      try { window._sb.rpc('cp_mark_read', { pid: id }); } catch (e) {}
      if (window._user && BOARD_MAP[_curBoard].vote) {
        window._sb.from('community_votes').select('post_id').eq('user_id', window._user.id).eq('post_id', id)
          .then(function (v) { _myVotes = new Set((v && v.data || []).map(function (x) { return x.post_id; })); loadComments(id); });
      } else { loadComments(id); }
    });
  }

  function loadComments(id) {
    window._sb.from('community_comments').select('*').eq('post_id', id).order('is_answer', { ascending: false }).order('created_at', { ascending: true })
      .then(function (res) {
        _curComments = (res && res.data) || []
        _curFiles = { post: [], byComment: {} }
        var u = cmup()
        if (!u || !u.fetchFiles) { paintDetail(); return }
        var cids = _curComments.map(function (c) { return c.id })
        u.fetchFiles(id, cids)
          .then(function (f) {
            _curFiles = { post: (f && f.post) || [], byComment: (f && f.byComment) || {} }
            paintDetail()
          })
          .catch(function () { paintDetail() })
      });
  }

  function paintDetail() {
    var el = app(); if (!el || !_curPost) return;
    var p = _curPost, b = BOARD_MAP[p.board];
    var admin = isAdmin();
    var mine = window._user && window._user.id === p.author_id;
    var voted = _myVotes.has(p.id);
    var canAccept = b.answer && (admin || mine);

    var html =
      '<div class="cm-bar">' +
        '<a class="cm-back" href="#b/' + p.board + '">← ' + esc(bLabel(p.board)) + '</a>' +
      '</div>' +
      '<article class="cm-post">' +
        '<h1 class="cm-ptitle">' + (p.is_pinned ? '📌 ' : '') + esc(p.title) + '</h1>' +
        '<div class="cm-pmeta">' +
          (p.status ? '<span class="cm-badge st-' + p.status + '">' + esc(stLabel(p.status)) + '</span>' : '') +
          '<span>' + esc(p.author_name) + '</span><span>· ' + fdate(p.created_at) + '</span>' +
          '<span>· 👁 ' + p.view_count + '</span>' +
          (b.vote
            ? '<button class="cm-votebtn ' + (voted ? 'voted' : '') + '" onclick="STRIX_CM.vote(\'' + p.id + '\',1)">▲ ' + p.vote_count + (voted ? ' ✓' : '') + '</button>'
            : '') +
        '</div>' +
        '<div class="cm-pbody">' + renderBody(p.body) + '</div>' +
        fileListHtml(_curFiles.post) +
        ((mine || admin) ?
          '<div class="cm-owner">' +
            (mine ? '<button class="cm-link" onclick="STRIX_CM.edit(\'' + p.id + '\')">' + esc(ct('comm.edit', 'Edit')) + '</button>' : '') +
            '<button class="cm-link danger" onclick="STRIX_CM.del(\'' + p.id + '\')">' + esc(ct('comm.delete', 'Delete')) + '</button>' +
          '</div>' : '') +
      '</article>';

    if (p.admin_reply) {
      html += '<div class="cm-reply"><div class="cm-reply-h">💬 ' + esc(ct('comm.staffReply', 'Staff reply')) + ' · ' + fdate(p.admin_reply_at) + '</div>' +
        '<div>' + renderBody(p.admin_reply) + '</div></div>';
    }

    if (admin) {
      var stOpts = STATUS[b.statusSet] || [];
      html += '<div class="cm-admin"><div class="cm-admin-h">🛠 ' + esc(ct('comm.adminControls', 'Staff controls')) + '</div>' +
        (stOpts.length ? '<label class="cm-fl">' + esc(ct('comm.status', 'Status')) + '<select id="cmStatus">' +
          stOpts.map(function (s) { return '<option value="' + s + '"' + (s === p.status ? ' selected' : '') + '>' + esc(stLabel(s)) + '</option>'; }).join('') +
          '</select></label>' : '') +
        '<label class="cm-fl">' + esc(ct('comm.staffReply', 'Staff reply')) + '<textarea id="cmReply" placeholder="' + esc(ct('comm.replyPh', 'Official reply…')) + '">' + esc(p.admin_reply || '') + '</textarea></label>' +
        '<div class="cm-admin-act">' +
          '<button class="cm-btn" onclick="STRIX_CM.adminSave(\'' + p.id + '\')">' + esc(ct('comm.save', 'Save')) + '</button>' +
          (b.id === 'notice' ? '<button class="cm-btn ghost" onclick="STRIX_CM.pin(\'' + p.id + '\')">' + esc(p.is_pinned ? ct('comm.unpin', 'Unpin') : ct('comm.pin', 'Pin')) + '</button>' : '') +
          '<button class="cm-btn ghost" onclick="STRIX_CM.hide(\'' + p.id + '\')">' + esc(p.is_hidden ? ct('comm.unhide', 'Unhide') : ct('comm.hideBtn', 'Hide')) + '</button>' +
        '</div></div>';
    }

    // comments
    html += '<section class="cm-comments"><h3 class="cm-csec">' + esc(ct('comm.comments', 'Comments')) + ' (' + _curComments.length + ')</h3>';
    if (!_curComments.length) {
      html += '<div class="cm-empty sm">' + esc(ct('comm.noComments', 'No comments yet.')) + '</div>';
    } else {
      html += _curComments.map(function (c) {
        var cmine = window._user && window._user.id === c.author_id;
        return '<div class="cm-comment' + (c.is_answer ? ' answer' : '') + '">' +
          '<div class="cm-cmeta">' +
            (c.is_answer ? '<span class="cm-badge st-done">✓ ' + esc(ct('comm.acceptedAnswer', 'Accepted answer')) + '</span> ' : '') +
            '<strong>' + esc(c.author_name) + '</strong><span>· ' + fdate(c.created_at) + '</span>' +
            (c.is_hidden ? '<span class="cm-hidden">· ' + esc(ct('comm.hidden', 'hidden')) + '</span>' : '') +
          '</div>' +
          '<div class="cm-cbody">' + renderBody(c.body) + '</div>' +
          fileListHtml(_curFiles.byComment[c.id]) +
          '<div class="cm-cact">' +
            (canAccept ? '<button class="cm-link" onclick="STRIX_CM.accept(\'' + c.id + '\',' + (c.is_answer ? 'false' : 'true') + ')">' + esc(c.is_answer ? ct('comm.unaccept', 'Unaccept') : ct('comm.accept', 'Accept answer')) + '</button>' : '') +
            ((cmine || admin) ? '<button class="cm-link danger" onclick="STRIX_CM.delComment(\'' + c.id + '\')">' + esc(ct('comm.delete', 'Delete')) + '</button>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    }
    // comment composer
    html += '<div class="cm-cnew">' +
      '<textarea id="cmCommentBody" maxlength="8000" placeholder="' + esc(window._user ? ct('comm.commentPh', 'Write a comment…') : ct('comm.loginToComment', 'Log in to comment.')) + '"' + (window._user ? '' : ' disabled') + '></textarea>' +
      (window._user ? attachBarHtml('comment') : '') +
      '<div class="cm-chips" id="cmCommentChips"></div>' +
      '<button class="cm-btn" onclick="STRIX_CM.comment(\'' + p.id + '\')">' + esc(ct('comm.postComment', 'Post comment')) + '</button>' +
      '<div class="cm-msg" id="cmCommentMsg"></div>' +
    '</div></section>';

    // paintDetail() also runs on vote/accept/delete, which would otherwise wipe
    // a comment in progress — including the image tokens of uploads already
    // paid for. Carry the draft across the re-render.
    var prev = document.getElementById('cmCommentBody');
    var draft = prev ? prev.value : '';

    el.innerHTML = html;

    var box = document.getElementById('cmCommentBody');
    if (box && draft) box.value = draft;
    if (box && window._user && cmup()) {
      cmup().attach(box, {
        scope: 'comment',
        chipsEl: document.getElementById('cmCommentChips'),
        msgEl: document.getElementById('cmCommentMsg')
      });
    }
  }

  // ── COMPOSE ──────────────────────────────────────────────────────────────────
  function renderNew(boardId, editPost) {
    var b = BOARD_MAP[boardId];
    if (b.adminOnly && !isAdmin()) { go('#b/' + boardId); return; }
    if (!requireLogin()) { go('#b/' + boardId); return; }
    var el = app(); if (!el) return;
    var p = editPost || {};

    // route() also re-runs on a language switch and on auth changes, with no
    // hash change. Without carrying the draft across, that wipes the body —
    // and with it the image tokens of uploads already paid for.
    var key = boardId + '|' + (editPost ? editPost.id : '');
    var sameTarget = (_composeKey === key);
    var prevTitleEl = sameTarget ? document.getElementById('cmNewTitle') : null;
    var prevBodyEl = sameTarget ? document.getElementById('cmNewBody') : null;
    var prevTitle = prevTitleEl ? prevTitleEl.value : null;
    var prevBody = prevBodyEl ? prevBodyEl.value : null;

    el.innerHTML =
      '<div class="cm-bar"><a class="cm-back" href="#b/' + boardId + '">← ' + esc(bLabel(boardId)) + '</a></div>' +
      '<div class="cm-bhead"><span class="cm-bico">' + b.icon + '</span>' +
        '<h2 class="cm-btitle">' + esc(editPost ? ct('comm.editPost', 'Edit post') : ct('comm.newIn', 'New post in') + ' ' + bLabel(boardId)) + '</h2></div>' +
      '<div class="cm-form">' +
        '<div class="cm-msg" id="cmNewMsg"></div>' +
        '<label class="cm-fl">' + esc(ct('comm.fTitle', 'Title')) + '<input id="cmNewTitle" maxlength="160" value="' + esc(p.title || '') + '" placeholder="' + esc(ct('comm.titlePh', 'A clear, short title')) + '"></label>' +
        '<label class="cm-fl">' + esc(ct('comm.fBody', 'Content')) + '<textarea id="cmNewBody" maxlength="20000" placeholder="' + esc(ct('comm.bodyPh', 'Write your post. Links are allowed.')) + '">' + esc(p.body || '') + '</textarea></label>' +
        attachBarHtml('post') +
        '<div class="cm-chips" id="cmNewChips"></div>' +
        '<div id="cmNewExisting"></div>' +
        '<div class="cm-form-act">' +
          '<button class="cm-btn" id="cmNewSubmit" onclick="STRIX_CM.submit(\'' + boardId + '\'' + (editPost ? ",'" + editPost.id + "'" : '') + ')">' + esc(editPost ? ct('comm.update', 'Update') : ct('comm.submit', 'Submit')) + '</button>' +
          '<button type="button" class="cm-btn ghost" onclick="STRIX_CM.cancelNew(\'' + boardId + '\')">' + esc(ct('comm.cancel', 'Cancel')) + '</button>' +
        '</div>' +
      '</div>';

    var titleEl = document.getElementById('cmNewTitle');
    var bodyEl = document.getElementById('cmNewBody');
    if (sameTarget) {
      if (prevTitle != null && titleEl) titleEl.value = prevTitle;
      if (prevBody != null && bodyEl) bodyEl.value = prevBody;
    } else if (cmup() && _composeKey !== null) {
      // Switching compose targets without leaving the compose route (#new/bug →
      // #new/qna, or detail → Edit) keeps the same 'post' session. Its uploads
      // belong to the previous target and its tokens are gone from this fresh
      // textarea, so drop them before binding.
      cmup().discard('post');
    }
    _composeKey = key;

    _editingPostId = editPost ? editPost.id : null;
    if (cmup()) {
      cmup().attach(bodyEl, {
        scope: 'post',
        chipsEl: document.getElementById('cmNewChips'),
        msgEl: document.getElementById('cmNewMsg')
      });
    }
    if (_editingPostId) refreshExisting(_editingPostId);
  }

  // keep both the visible file list and the per-post attachment caps in sync
  // with what the post already holds
  function refreshExisting(postId) {
    loadExistingFiles(postId);
    if (cmup() && cmup().loadBaseline) cmup().loadBaseline('post', 'post', postId);
  }

  // ── already-saved file attachments (edit screen only) ───────────────────────
  //  Images are removed by deleting their token from the body — prune() cleans
  //  up on save. Files are not in the body, so they need this explicit list.
  function isUuid(v) { return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(v || '')) }

  function existingFilesHtml(rows) {
    if (!rows || !rows.length) return ''
    return '<div class="cm-chips" style="display:flex">' + rows.map(function (f) {
      return '<div class="cm-chip file">' +
          '<span class="cm-chip-ico">📎</span>' +
          '<span class="cm-chip-n" title="' + esc(f.name) + '">' + esc(f.name) + '</span>' +
          '<span class="cm-chip-b">' + esc(fmtBytes(f.bytes)) + '</span>' +
          (isUuid(f.id)
            ? '<button type="button" class="cm-chip-x" title="' + esc(ct('comm.attRemove', 'Remove')) +
              '" onclick="STRIX_CM.dropFile(\'' + f.id + '\')">×</button>'
            : '') +
        '</div>'
    }).join('') + '</div>'
  }

  function loadExistingFiles(postId) {
    var box = document.getElementById('cmNewExisting')
    if (!box || !cmup() || !postId) return
    cmup().fetchFiles(postId, [])
      .then(function (f) { box.innerHTML = existingFilesHtml(f && f.post) })
      .catch(function () {})
  }

  function dropFile(id) {
    if (!cmup() || !isUuid(id)) return
    var pid = _editingPostId
    cmup().deleteAttachment(id).then(function (r) {
      if (r && r.error) { alert('Delete failed: ' + r.error.message); return }
      if (pid) refreshExisting(pid)
    })
  }

  // ── ACTIONS ──────────────────────────────────────────────────────────────────
  async function submit(boardId, editId) {
    if (!requireLogin()) return;
    var b = BOARD_MAP[boardId];
    var title = (document.getElementById('cmNewTitle').value || '').trim();
    var body = (document.getElementById('cmNewBody').value || '').trim();
    var msg = document.getElementById('cmNewMsg');
    if (title.length < 2) { return showMsg(msg, ct('comm.errTitle', 'Please enter a title (min 2 characters).')); }
    if (body.length < 1) { return showMsg(msg, ct('comm.errBody', 'Please enter some content.')); }
    if (cmup() && cmup().hasPending('post')) {
      return showMsg(msg, ct('comm.attWait', 'Please wait until the uploads finish.'));
    }
    var btn = document.getElementById('cmNewSubmit'); if (btn) btn.disabled = true;

    try {
      if (editId) {
        var up = await window._sb.from('community_posts').update({ title: title, body: body }).eq('id', editId);
        if (up && up.error) { if (btn) btn.disabled = false; return showMsg(msg, ct('comm.saveFail', 'Save failed.') + ' ' + up.error.message); }
        var le = await finishAttachments('post', 'post', editId, body);
        if (le) { if (btn) btn.disabled = false; return showMsg(msg, le); }
        // the hash is already #p/<id> here, so assigning it fires no hashchange
        // (and therefore no route()) — render the detail view directly
        _editingPostId = null;
        _composeKey = null;
        if (location.hash === '#p/' + editId) renderDetail(editId);
        else go('#p/' + editId);
        return;
      }

      var row = {
        board: boardId, title: title, body: body,
        author_id: window._user.id, author_name: authorName()
      };
      if (b.statusSet) row.status = STATUS_DEFAULT[b.statusSet];
      var res = await window._sb.from('community_posts').insert(row).select('id').single();
      if (res && res.error) { if (btn) btn.disabled = false; return showMsg(msg, ct('comm.submitFail', 'Submit failed.') + ' ' + res.error.message); }

      var newId = res.data && res.data.id;
      if (newId) {
        var lr = await finishAttachments('post', 'post', newId, body);
        if (lr) { if (btn) btn.disabled = false; return showMsg(msg, lr); }
      }
      if (btn) btn.disabled = false;
      go(newId ? '#p/' + newId : '#b/' + boardId);
    } catch (e) {
      if (btn) btn.disabled = false;
      showMsg(msg, ct('comm.submitFail', 'Submit failed.') + ' ' + ((e && e.message) || e));
    }
  }

  /**
   * Claim this session's uploads for the saved post/comment, then drop images
   * whose token the author deleted from the body. Returns an error string on
   * failure — the caller must NOT navigate away, or the post would be left
   * showing images that are still unclaimed drafts (swept after 24 h).
   */
  async function finishAttachments(scope, kind, parentId, body) {
    var u = cmup();
    if (!u) return null;
    var r = await u.linkTo(scope, kind, parentId);
    if (r && r.error) return ct('comm.attLinkFail', 'The post was saved but its attachments could not be linked.') + ' ' + r.error.message;
    try { await u.prune(kind, parentId, body); } catch (e) {}
    u.reset(scope);
    return null;
  }

  function vote(id, fromDetail) {
    if (!requireLogin()) return;
    var voted = _myVotes.has(id);
    if (voted) { _myVotes.delete(id); } else { _myVotes.add(id); }
    // optimistic UI
    if (fromDetail && _curPost && _curPost.id === id) {
      _curPost.vote_count = Math.max(0, _curPost.vote_count + (voted ? -1 : 1));
      paintDetail();
    } else {
      var pp = _posts.find(function (x) { return x.id === id; });
      if (pp) pp.vote_count = Math.max(0, pp.vote_count + (voted ? -1 : 1));
      if (_curBoard) renderPostList(_curBoard);
    }
    var op = voted
      ? window._sb.from('community_votes').delete().eq('post_id', id).eq('user_id', window._user.id)
      : window._sb.from('community_votes').insert({ post_id: id, user_id: window._user.id });
    op.then(function () {});
  }

  async function comment(id) {
    if (!requireLogin()) return;
    var ta = document.getElementById('cmCommentBody');
    var body = (ta.value || '').trim();
    var msg = document.getElementById('cmCommentMsg');
    if (body.length < 1) { return showMsg(msg, ct('comm.errComment', 'Please write a comment.')); }
    if (cmup() && cmup().hasPending('comment')) {
      return showMsg(msg, ct('comm.attWait', 'Please wait until the uploads finish.'));
    }
    var res = await window._sb.from('community_comments').insert({
      post_id: id, author_id: window._user.id, author_name: authorName(), body: body
    }).select('id').single();
    if (res && res.error) return showMsg(msg, ct('comm.commentFail', 'Comment failed.') + ' ' + res.error.message);

    var cid = res.data && res.data.id;
    if (cid) {
      var err = await finishAttachments('comment', 'comment', cid, body);
      if (err) return showMsg(msg, err);
    }
    ta.value = '';
    loadComments(id);
  }

  function accept(commentId, val) {
    window._sb.from('community_comments').update({ is_answer: val }).eq('id', commentId).then(function (res) {
      if (res && res.error) { alert('Failed: ' + res.error.message); return; }
      // clear other accepted answers when accepting a new one
      if (val) {
        _curComments.forEach(function (c) { if (c.id !== commentId && c.is_answer) window._sb.from('community_comments').update({ is_answer: false }).eq('id', c.id); });
      }
      if (_curPost) loadComments(_curPost.id);
    });
  }

  async function delComment(commentId) {
    if (!confirm(ct('comm.confirmDelComment', 'Delete this comment?'))) return;
    // Storage objects are NOT removed by the row cascade — clear them while the
    // rows that point at them still exist.
    if (cmup()) { try { await cmup().removeForComment(commentId); } catch (e) {} }
    var res = await window._sb.from('community_comments').delete().eq('id', commentId);
    if (res && res.error) { alert('Delete failed: ' + res.error.message); return; }
    if (_curPost) loadComments(_curPost.id);
  }

  async function del(id) {
    if (!confirm(ct('comm.confirmDel', 'Delete this post permanently?'))) return;
    // same reason as above — and this also covers the comments' attachments,
    // whose rows are about to cascade away with the post
    if (cmup()) { try { await cmup().removeForPost(id); } catch (e) {} }
    var res = await window._sb.from('community_posts').delete().eq('id', id);
    if (res && res.error) { alert('Delete failed: ' + res.error.message); return; }
    go('#b/' + (_curPost ? _curPost.board : _curBoard || 'hub'));
  }

  function edit(id) {
    if (!_curPost || _curPost.id !== id) return;
    renderNew(_curPost.board, _curPost);
  }

  function adminSave(id) {
    var patch = {};
    var sEl = document.getElementById('cmStatus');
    if (sEl) patch.status = sEl.value;
    var rEl = document.getElementById('cmReply');
    if (rEl) { var r = rEl.value.trim(); patch.admin_reply = r || null; patch.admin_reply_at = r ? new Date().toISOString() : null; }
    window._sb.from('community_posts').update(patch).eq('id', id).then(function (res) {
      if (res && res.error) { alert('Save failed: ' + res.error.message); return; }
      renderDetail(id);
    });
  }

  function pin(id) {
    if (!_curPost) return;
    window._sb.from('community_posts').update({ is_pinned: !_curPost.is_pinned }).eq('id', id).then(function (res) {
      if (res && res.error) { alert('Failed: ' + res.error.message); return; }
      renderDetail(id);
    });
  }
  function hide(id) {
    if (!_curPost) return;
    window._sb.from('community_posts').update({ is_hidden: !_curPost.is_hidden }).eq('id', id).then(function (res) {
      if (res && res.error) { alert('Failed: ' + res.error.message); return; }
      renderDetail(id);
    });
  }

  function showMsg(el, text) {
    if (!el) return;
    el.textContent = text;
    if (text) el.classList.add('show'); else el.classList.remove('show');
  }
  function newPost(boardId) { go('#new/' + boardId); }
  function open(id) { go('#p/' + id); }

  function cancelNew(boardId) {
    if (cmup()) cmup().discard('post');
    _editingPostId = null;
    _composeKey = null;
    go('#b/' + boardId);
  }
  function pickImage(scope) { if (cmup()) cmup().pick(scope, 'image'); }
  function pickFile(scope) { if (cmup()) cmup().pick(scope, 'file'); }

  async function sweep() {
    if (!isAdmin() || !cmup()) return;
    if (!confirm(ct('comm.sweepConfirm', 'Delete uploads older than 24 hours that no post or comment refers to?'))) return;
    var r = await cmup().sweepOrphans();
    if (r && r.error) { alert(ct('comm.sweepFail', 'Cleanup failed.') + ' ' + r.error); return; }
    alert(ct('comm.sweepDone', 'Cleanup complete.') + ' drafts: ' + (r.drafts || 0) + ', files: ' + (r.files || 0));
  }

  // ── lightbox ────────────────────────────────────────────────────────────────
  //  Delegated, never an inline onclick: interpolating a URL into an attribute
  //  would re-open the injection surface renderBody() closes.
  function bindLightbox() {
    var el = app();
    if (!el || el.__cmLightbox) return;
    el.__cmLightbox = true;
    el.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'IMG' || !t.classList || !t.classList.contains('cm-img')) return;
      openLightbox(t.getAttribute('src'));
    });
  }

  function openLightbox(src) {
    if (!src) return;
    var ov = document.createElement('div');
    ov.className = 'cm-lightbox';
    var img = document.createElement('img');
    img.src = src;                    // already whitelisted by renderBody()
    img.alt = '';
    ov.appendChild(img);
    function onKey(ev) { if (ev.key === 'Escape' || ev.key === 'Esc') close(); }
    function close() {
      document.removeEventListener('keydown', onKey);
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }
    ov.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
  }

  // ── expose for inline handlers ───────────────────────────────────────────────
  window.STRIX_CM = {
    newPost: newPost, open: open, vote: vote, submit: submit, comment: comment,
    accept: accept, delComment: delComment, del: del, edit: edit,
    adminSave: adminSave, pin: pin, hide: hide,
    cancelNew: cancelNew, pickImage: pickImage, pickFile: pickFile,
    dropFile: dropFile, sweep: sweep,
    // pure function — exported so the XSS regression harness can exercise the
    // real renderer instead of a copy that could drift from it
    renderBody: renderBody
  };

  // ── boot ─────────────────────────────────────────────────────────────────────
  function boot() {
    if (!document.getElementById('communityApp')) return;
    bindLightbox();
    // Leaving a screen throws away uploads it never saved. Without this an
    // abandoned compose (or a jump from one post to another) would leave paid-for
    // objects in Storage until the 24 h admin sweep.
    var prevHash = (location.hash || '#hub').replace(/^#/, '');
    window.addEventListener('hashchange', function () {
      var h = (location.hash || '#hub').replace(/^#/, '');
      var u = cmup();
      if (u) {
        if (h.indexOf('new/') !== 0) {                             // compose AND edit
          u.discard('post');
          _composeKey = null;
          _editingPostId = null;
        }
        if (h !== prevHash && prevHash.indexOf('p/') === 0) u.discard('comment');
      }
      prevHash = h;
      route();
    });
    // re-render dynamic content on language switch (chain any existing hook)
    var prev = window.onLangApplied;
    window.onLangApplied = function (lang) { if (typeof prev === 'function') { try { prev(lang); } catch (e) {} } route(); };
    // re-render when auth resolves/changes so admin & vote state reflect the user
    if (window._sb && window._sb.auth && window._sb.auth.onAuthStateChange) {
      try { window._sb.auth.onAuthStateChange(function () { route(); }); } catch (e) {}
    }
    route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
