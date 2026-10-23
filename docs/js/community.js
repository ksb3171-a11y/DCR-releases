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
  var _editingCommentId = null;                  // detail screen: comment being edited in place

  // ── helpers ──────────────────────────────────────────────────────────────────
  function ct(key, fallback) {
    var dict = (window.T && window.T[window.currentLang]) || {};
    var en = (window.T && window.T.en) || {};
    return dict[key] || en[key] || fallback || key;
  }
  // 이스케이프의 단일 원천은 layout.js 의 window.escHtml 이다. 여기서 다시 구현하지 말 것 —
  // 사이트에 이스케이퍼가 세 벌 있었고(여기·billing.js·없는 곳) 그중 auth.js 에는 아예 없어서
  // 관리자 회원목록이 뚫렸다(security_hardening_devplan.md §5 SEC-04a).
  // escHtml 이 없으면 조용히 원문을 통과시키는 대신 **크게 죽는다** — 그래야 배선 실수가 보인다.
  function esc(s) { return window.escHtml(s); }

  // status 는 DB 컬럼이고 `class="cm-badge st-<값>"` 속성 안으로 들어간다. SQL CHECK 를 걸었지만
  // 그 이전에 들어온 값이 남아 있을 수 있으므로, 화면에서도 **아는 값일 때만** 클래스를 붙인다.
  // 🚨 esc() 로 감싸는 것으로 갈음하지 말 것 — 그러면 st-&quot;… 같은 쓰레기 클래스가 붙는다.
  var STATUS_ALL = Object.keys(STATUS).reduce(function (acc, k) { return acc.concat(STATUS[k]); }, []);
  function stClass(s) { return STATUS_ALL.indexOf(s) >= 0 ? ' st-' + s : ''; }
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
  // image size / alignment chosen in the app editor: `![alt|50](…)` · `![alt|50|center](…)` — both values are enums
  var FMT_IMG_OPTS = '(?:\\|(25|50|75|100)(?:\\|(left|center|right))?)?'
  // a picture kept in the PRIVATE report storage (app bug report): `![alt|w|a](report:<attachment number>)`.
  // It becomes a placeholder; loadReport() swaps in a short-lived signed URL for the author and staff only.
  var FMT_RIMG_RE = new RegExp('!\\[([^\\]\\n]{0,120}?)' + FMT_IMG_OPTS + '\\]\\(report:(\\d{1,3})\\)', 'g')
  function imgOptClass(w, a) { return (w ? ' cm-w' + w : '') + (a === 'center' || a === 'right' ? ' cm-ia-' + a : '') }
  function imgTokenRe() {
    var p = imgPrefix()
    if (!p) return null
    if (!_imgRe || _imgRePfx !== p) {
      // optional `|width|align` after the alt text (app editor — rich_editor_devplan.md §6); the alt is lazy so a
      // plain `|` inside an older alt text still matches as before
      _imgRe = new RegExp('!\\[([^\\]\\n]{0,120}?)' + FMT_IMG_OPTS + '\\]\\(' + reEsc(p) + '([A-Za-z0-9_\\-./]{1,200})\\)', 'g')
      _imgRePfx = p
    }
    _imgRe.lastIndex = 0
    return _imgRe
  }

  // ── body formatting (community_editor_devplan.md) ─────────────────────────
  //  A small markdown subset. The body is escaped FIRST and every rule below
  //  runs on the escaped text, so a rule can only rearrange characters the user
  //  already typed — it cannot produce a raw < " ' of its own. Each rule writes
  //  its tag through a replacement *literal* ('<b>$1</b>'), never by joining
  //  strings (the one exception is the image rule, whose path its regex limits
  //  to [A-Za-z0-9_-./]), so the only raw markup in the output is listed here.
  //  Regression: frontend/verification/internal/community_format_selfcheck.mjs
  //  🚨 Do not add a rule that builds a tag from a function result, and do not
  //     run a rule on the unescaped source.
  //
  //  Blocks (line start)  # ## ###  ·  - * list  ·  1. list  ·  > quote  ·  ---  ·  ``` fence
  //                       {center} {right} line alignment  ·  | a | b | table (needs the |---| line)
  //  Inline               **bold** · *italic* · ~~strike~~ · `code` · [text](https://…) · bare https://…
  //                       {i}…{/i} · {u}…{/u} · {small|big|huge}…{/same} · {c:name}…{/c} · {hl:name}…{/hl}
  //  The brace marks come from the STRIX app editor (rich_editor_devplan.md §6 — single source of the mark list is
  //  frontend/src/components/common/richEditor/richMarkup.ts). Colour/size names are fixed alternations, so the
  //  captured name that lands in a class attribute can only be one of the listed words.
  //
  //  Finished pieces (code, images, links) are parked behind a NUL placeholder
  //  (keep) so no later rule can reach into them — e.g. a URL typed in an image's
  //  alt text must not become a link inside the alt attribute. NUL never survives
  //  from the input (stripped right after esc()).
  var FMT_TAG_SPLIT = /(<[^>]*>)/;
  var FMT_HOLD_RE = /\u0000(\d+)\u0000/g;
  // URL characters on ESCAPED text: stop at whitespace and at the entities esc()
  // writes for < > " ' so a URL can never run into a neighbouring tag or quote.
  var FMT_URL = '(?:(?!&(?:lt|gt|quot|#39);)[^\\s<>"\'])*(?:(?!&(?:lt|gt|quot|#39);)[^\\s<>"\'.,;:!?)])';
  var FMT_LINK_RE = new RegExp('\\[([^\\]\\n]{1,200})\\]\\((https?:\\/\\/' + FMT_URL + ')\\)', 'g');
  var FMT_AUTO_RE = new RegExp('(^|\\s)(https?:\\/\\/' + FMT_URL + ')', 'g');

  function fmtInline(s) {
    // emphasis only on text runs — never inside a tag's attributes
    return s.split(FMT_TAG_SPLIT).map(function (t, i) {
      if (i % 2) return t;
      return t
        .replace(/\*\*(?=\S)([^\n]*?\S)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^\w*])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![\w*])/g, '$1<em>$2</em>')
        .replace(/~~(?=\S)([^\n]*?\S)~~/g, '<del>$1</del>')
        .replace(/\{i\}([^\n]*?)\{\/i\}/g, '<em>$1</em>')
        .replace(/\{u\}([^\n]*?)\{\/u\}/g, '<u>$1</u>')
        .replace(/\{(small|big|huge)\}([^\n]*?)\{\/\1\}/g, '<span class="cm-sz-$1">$2</span>')
        .replace(/\{c:(red|orange|yellow|green|blue|indigo|purple|gray)\}([^\n]*?)\{\/c\}/g, '<span class="cm-c-$1">$2</span>')
        .replace(/\{hl:(yellow|green|blue|pink|orange)\}([^\n]*?)\{\/hl\}/g, '<mark class="cm-hl-$1">$2</mark>');
    }).join('');
  }

  // GFM-style table: a header row, a |---| line, then rows. The block is ESCAPED text already, and every tag
  // below is written by a replacement *literal* like the other rules — the input's characters are only cut at
  // unescaped `|` and wrapped. `\|` is a literal pipe inside a cell (\u0001 holds it while cutting).
  var FMT_TABLE_RE = /(?:^\|[^\n]*\|[ \t]*(?:\n|$))+/gm;
  var FMT_TABLE_SEP = /^\|(?:[ \t]*:?-{3,}:?[ \t]*\|)+[ \t]*$/;
  function fmtRowCut(l) {
    return l.replace(/\u0001/g, '').replace(/\\\|/g, '\u0001').replace(/[ \t]+$/, '').replace(/^\|(.*)\|$/, '$1');
  }
  function fmtRowTh(l) {
    return fmtRowCut(l).replace(/\|/g, '</th><th>').replace(/^([\s\S]*)$/, '<tr><th>$1</th></tr>')
      .replace(/<th>[ \t]+/g, '<th>').replace(/[ \t]+<\/th>/g, '</th>').replace(/\u0001/g, '|');
  }
  function fmtRowTd(l) {
    return fmtRowCut(l).replace(/\|/g, '</td><td>').replace(/^([\s\S]*)$/, '<tr><td>$1</td></tr>')
      .replace(/<td>[ \t]+/g, '<td>').replace(/[ \t]+<\/td>/g, '</td>').replace(/\u0001/g, '|');
  }
  function fmtTable(block) {
    var lines = block.replace(/\n$/, '').split('\n');
    if (lines.length < 2 || !FMT_TABLE_SEP.test(lines[1])) return block;
    var out = [fmtRowTh(lines[0])].concat(lines.slice(2).map(fmtRowTd)).join('')
      .replace(/^([\s\S]*)$/, '<table class="cm-tbl">$1</table>');
    return /\n$/.test(block) ? out.replace(/$/, '\n') : out;
  }

  function fmtText(s) {
    s = s
      .replace(FMT_TABLE_RE, fmtTable)
      .replace(/^\{(center|right)\}(.*)$/gm, '<div class="cm-al-$1">$2</div>')
      .replace(/^### (.+)$/gm, '<h5 class="cm-h">$1</h5>')
      .replace(/^## (.+)$/gm, '<h4 class="cm-h">$1</h4>')
      .replace(/^# (.+)$/gm, '<h3 class="cm-h">$1</h3>')
      .replace(/^-{3,}[ \t]*$/gm, '<hr class="cm-hr">')
      .replace(/^[-*] (.+)$/gm, '<ul class="cm-ul"><li>$1</li></ul>')
      .replace(/^(\d{1,3})[.)] (.+)$/gm, '<ol class="cm-ol" start="$1"><li>$2</li></ol>')
      .replace(/^&gt; ?(.*)$/gm, '<blockquote class="cm-quote">$1</blockquote>')
      // consecutive list items / quote lines become one block
      .replace(/<\/ul>\n<ul class="cm-ul">/g, '')
      .replace(/<\/ol>\n<ol class="cm-ol" start="\d{1,3}">/g, '')
      .replace(/<\/blockquote>\n<blockquote class="cm-quote">/g, '<br>');
    s = fmtInline(s);
    // a block carries its own spacing — drop the line break next to it
    return s
      .replace(/(<\/h[345]>|<\/ul>|<\/ol>|<\/blockquote>|<hr class="cm-hr">|<\/div>|<\/table>)\n/g, '$1')
      .replace(/\n(?=<(?:h[345]|ul|ol|blockquote|hr|div|table) )/g, '')
      .replace(/\n/g, '<br>');
  }

  function renderBody(src) {
    var held = []
    function keep(m) { held.push(m); return '\u0000' + (held.length - 1) + '\u0000' }
    function restore(s) { return s.replace(FMT_HOLD_RE, function (m, n) { return restore(held[+n] || '') }) }

    var h = esc(src)                       // ← never skipped, never relaxed
    h = h.replace(/\u0000/g, '').replace(/\r\n?/g, '\n')
    // fenced code first — nothing inside it is formatted, not even image tokens
    h = h.replace(/^```[^\n`]*\n([\s\S]*?)\n```[ \t]*$/gm, '<pre class="cm-code">$1</pre>')
      .replace(/<pre class="cm-code">[\s\S]*?<\/pre>/g, keep)
    // images next, so an alt text is parked before any inline rule can reach it
    var re = imgTokenRe()
    if (re) {
      h = h.replace(re, function (m, alt, w, a, path) {
        if (path.indexOf('..') >= 0) return m
        return '<img class="cm-img' + esc(imgOptClass(w, a)) + '" src="' + imgPrefix() + path + '" alt="' + alt +
               '" loading="lazy" decoding="async" referrerpolicy="no-referrer">'
      })
      h = h.replace(/<img class="cm-img[^"]*"[^>]*>/g, keep)
    }
    // private report pictures → placeholder (class = enum words · number = \d{1,3}). The alt text is not shown —
    // it would be escaped twice here, and the picture itself replaces the placeholder for those who may see it
    h = h.replace(FMT_RIMG_RE, function (m, alt, w, a, n) {
      return '<span class="cm-rimg' + esc(imgOptClass(w, a)) + '" data-rf="' + esc(n) + '">🔒 ' +
             esc(ct('comm.rep.img', 'Attached picture — only the author and STRIX staff can see it')) + '</span>'
    }).replace(/<span class="cm-rimg[^"]*" data-rf="\d{1,3}">[^<]*<\/span>/g, keep)
    // inline code never spans a parked piece (\u0000) — `![x](…)` stays a picture
    h = h.replace(/`([^`\n\u0000]+)`/g, '<code class="cm-icode">$1</code>')
      .replace(/<code class="cm-icode">[^<]*<\/code>/g, keep)
      .replace(FMT_LINK_RE, '<a class="cm-a" href="$2" target="_blank" rel="noopener noreferrer nofollow ugc">$1</a>')
      .replace(/<a class="cm-a"[^>]*>[^<]*<\/a>/g, keep)
      .replace(FMT_AUTO_RE, '$1<a class="cm-a" href="$2" target="_blank" rel="noopener noreferrer nofollow ugc">$2</a>')
      .replace(/<a class="cm-a"[^>]*>[^<]*<\/a>/g, keep)
    return restore(fmtText(h))
      .replace(/<br>(?=<pre class="cm-code">)/g, '')
      .replace(/(<\/pre>)<br>/g, '$1')
  }

  function fmtBytes(n) { var u = cmup(); return u ? u.formatBytes(n) : String(n || 0) }

  // rows come from cmUpload.fetchFiles(), whose url is rebuilt from bucket+path.
  // `?download=` makes Supabase send Content-Disposition: attachment — the plain
  // `download` attribute is ignored cross-origin, so without it a .pdf would
  // open on the storage origin instead of being saved.
  // A picture sent through "Attach file" is shown as a picture too (cm-fimg —
  // CSS puts every one on its own row ahead of the chips); its chip keeps the
  // download link. url is rebuilt by cmUpload, isImage is its mime + extension
  // whitelist (community_editor_devplan.md).
  function fileListHtml(rows) {
    if (!rows || !rows.length) return ''
    return '<div class="cm-files">' + rows.map(function (f) {
      var href = f.url + '?download=' + encodeURIComponent(f.name)
      return (f.isImage
          ? '<img class="cm-img cm-fimg" src="' + esc(f.url) + '" alt="' + esc(f.name) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">'
          : '') +
        '<a class="cm-file" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" download="' + esc(f.name) + '">' +
          '<span class="cm-file-ico">📎</span>' +
          '<span class="cm-file-n">' + esc(f.name) + '</span>' +
          '<span class="cm-file-s">' + esc(fmtBytes(f.bytes)) + '</span>' +
        '</a>'
    }).join('') + '</div>'
  }

  // 「이미지 추가」·「파일 첨부」 버튼은 서식 도구줄(🖼 📎)로 옮겼다 — 여기는 붙여넣기·끌어다 놓기 안내만
  function attachBarHtml() {
    return '<div class="cm-attbar">' +
        '<span class="cm-atthint">' + esc(ct('comm.attHint', 'Paste a screenshot (Ctrl+V) or drop files here.')) + '</span>' +
      '</div>'
  }
  // ── formatting toolbar (community_editor_devplan.md) ──────────────────────
  //  Buttons only insert the markdown marks renderBody() understands — the
  //  saved body stays plain text, so nothing here widens what can be stored.
  //  Clicks and Ctrl+B / Ctrl+I are delegated from the app root (bindFormatBar).
  var FMT_BTNS = [
    { id: 'bold', label: 'B', en: 'Bold (Ctrl+B)' },
    { id: 'italic', label: 'I', en: 'Italic (Ctrl+I)' },
    { id: 'strike', label: 'S', en: 'Strikethrough' },
    { id: 'heading', label: 'H', en: 'Heading' },
    { id: 'ul', label: '•', en: 'Bulleted list' },
    { id: 'ol', label: '1.', en: 'Numbered list' },
    { id: 'quote', label: '❝', en: 'Quote' },
    { id: 'code', label: '</>', en: 'Code' },
    { id: 'link', label: '🔗', en: 'Link' },
    { id: 'hr', label: '―', en: 'Divider' }
  ];
  var FMT_TARGETS = { cmNewBody: 1, cmCommentBody: 1, cmEditCommentBody: 1, cmReply: 1 };
  // 업로드 세션(cmUpload)이 붙은 칸만 🖼·📎 를 단다 — 댓글 수정·공식 답변 칸은 업로드가 없다.
  // 이미지 표식은 cmUpload 가 기억한 커서 자리에 들어간다.
  var FMT_UPLOAD_SCOPE = { cmNewBody: 'post', cmCommentBody: 'comment' };
  var FMT_UPLOAD_BTNS = [
    { id: 'image', label: '🖼', key: 'comm.attAddImage', en: 'Add image' },
    { id: 'file', label: '📎', key: 'comm.attAddFile', en: 'Attach file' }
  ];

  // Built with the DOM (textContent / setAttribute), not an HTML string — call
  // after the screen's innerHTML is set. Idempotent per textarea.
  function mountFormatBars() {
    Object.keys(FMT_TARGETS).forEach(function (id) {
      var ta = document.getElementById(id);
      if (!ta || ta.disabled || ta.__cmFmtBar) return;
      ta.__cmFmtBar = true;
      var bar = document.createElement('div');
      bar.className = 'cm-fmtbar';
      bar.setAttribute('role', 'toolbar');
      bar.setAttribute('data-target', id);
      var btns = FMT_BTNS.concat(FMT_UPLOAD_SCOPE[id] && cmup() ? FMT_UPLOAD_BTNS : []);
      btns.concat([{ id: 'preview', label: ct('comm.fmt.preview', 'Preview') }]).forEach(function (b) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cm-fmt cm-fmt-' + b.id;
        btn.setAttribute('data-fmt', b.id);
        btn.textContent = b.label;
        if (b.id === 'preview') btn.setAttribute('aria-pressed', 'false');
        else { var tip = ct(b.key || 'comm.fmt.' + b.id, b.en); btn.title = tip; btn.setAttribute('aria-label', tip); }
        bar.appendChild(btn);
      });
      var box = document.createElement('div');
      box.className = 'cm-preview';
      box.setAttribute('data-preview-for', id);
      box.hidden = true;
      ta.parentNode.insertBefore(bar, ta);
      ta.parentNode.insertBefore(box, ta.nextSibling);
    });
  }

  // insert `text` over [a,b) keeping the browser's undo stack where it can
  function fmtReplace(ta, a, b, text, selA, selB) {
    ta.focus();
    ta.setSelectionRange(a, b);
    var ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok || ta.value.slice(a, a + text.length) !== text) {
      ta.setRangeText(text, a, b, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    ta.setSelectionRange(a + selA, a + selB);
  }

  function fmtWrap(ta, mark, fallbackKey, fallbackEn) {
    var a = ta.selectionStart, b = ta.selectionEnd, v = ta.value;
    var sel = v.slice(a, b);
    // already wrapped → unwrap
    if (v.slice(a - mark.length, a) === mark && v.slice(b, b + mark.length) === mark) {
      fmtReplace(ta, a - mark.length, b + mark.length, sel, 0, sel.length);
      return;
    }
    var inner = sel || ct(fallbackKey, fallbackEn);
    fmtReplace(ta, a, b, mark + inner + mark, mark.length, mark.length + inner.length);
  }

  function fmtLines(ta, kind) {
    var v = ta.value, a = ta.selectionStart, b = ta.selectionEnd;
    var ls = v.lastIndexOf('\n', a - 1) + 1;
    var le = v.indexOf('\n', b > a && v.charAt(b - 1) === '\n' ? b - 1 : b);
    if (le < 0) le = v.length;
    var lines = v.slice(ls, le).split('\n');
    var pre = { heading: /^#{1,3} /, ul: /^[-*] /, ol: /^\d{1,3}[.)] /, quote: /^> ?/ }[kind];
    var all = lines.every(function (l) { return pre.test(l); });
    var out = lines.map(function (l, i) {
      if (all) return l.replace(pre, '');
      var bare = l.replace(/^(#{1,3} |[-*] |\d{1,3}[.)] |> ?)/, '');
      if (kind === 'heading') return '## ' + bare;
      if (kind === 'ul') return '- ' + bare;
      if (kind === 'ol') return (i + 1) + '. ' + bare;
      return '> ' + bare;
    }).join('\n');
    fmtReplace(ta, ls, le, out, out.length, out.length);
  }

  function fmtCode(ta) {
    var a = ta.selectionStart, b = ta.selectionEnd, v = ta.value;
    var sel = v.slice(a, b);
    if (sel.indexOf('\n') < 0) { fmtWrap(ta, '`', 'comm.fmt.text', 'text'); return; }
    var lead = a > 0 && v.charAt(a - 1) !== '\n' ? '\n' : '';
    var body = sel.replace(/\n$/, '');
    var text = lead + '```\n' + body + '\n```\n';
    fmtReplace(ta, a, b, text, lead.length + 4, lead.length + 4 + body.length);
  }

  function fmtLink(ta) {
    var a = ta.selectionStart, b = ta.selectionEnd;
    var sel = ta.value.slice(a, b);
    if (/^https?:\/\/\S+$/.test(sel)) {
      var label = ct('comm.fmt.linkText', 'link text');
      fmtReplace(ta, a, b, '[' + label + '](' + sel + ')', 1, 1 + label.length);
      return;
    }
    var txt = sel || ct('comm.fmt.linkText', 'link text');
    fmtReplace(ta, a, b, '[' + txt + '](https://)', txt.length + 3, txt.length + 11);
  }

  function fmtHr(ta) {
    var a = ta.selectionStart, b = ta.selectionEnd, v = ta.value;
    var lead = a > 0 && v.charAt(a - 1) !== '\n' ? '\n' : '';
    var text = lead + '---\n';
    fmtReplace(ta, a, b, text, text.length, text.length);
  }

  function fmtApply(ta, id) {
    if (!ta || ta.disabled || ta.readOnly) return;
    if (id === 'bold') fmtWrap(ta, '**', 'comm.fmt.text', 'text');
    else if (id === 'italic') fmtWrap(ta, '*', 'comm.fmt.text', 'text');
    else if (id === 'strike') fmtWrap(ta, '~~', 'comm.fmt.text', 'text');
    else if (id === 'heading' || id === 'ul' || id === 'ol' || id === 'quote') fmtLines(ta, id);
    else if (id === 'code') fmtCode(ta);
    else if (id === 'link') fmtLink(ta);
    else if (id === 'hr') fmtHr(ta);
  }

  function fmtTogglePreview(bar, ta) {
    var box = bar.parentNode && bar.parentNode.querySelector('.cm-preview[data-preview-for="' + ta.id + '"]');
    var btn = bar.querySelector('[data-fmt="preview"]');
    if (!box || !btn) return;
    var on = box.hidden;
    if (on) {
      if (ta.value.trim()) {
        box.innerHTML = renderBody(ta.value);
      } else {
        box.textContent = '';
        var em = document.createElement('span');
        em.className = 'cm-preview-empty';
        em.textContent = ct('comm.fmt.previewEmpty', 'Nothing to preview.');
        box.appendChild(em);
      }
      box.style.minHeight = ta.offsetHeight + 'px';
    }
    box.hidden = !on;
    ta.hidden = on;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? ct('comm.fmt.write', 'Edit') : ct('comm.fmt.preview', 'Preview');
    Array.prototype.forEach.call(bar.querySelectorAll('.cm-fmt'), function (x) { if (x !== btn) x.disabled = on; });
    if (!on) ta.focus();
  }

  function bindFormatBar() {
    var el = app();
    if (!el || el.__cmFmt) return;
    el.__cmFmt = true;
    el.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('.cm-fmt') : null;
      if (!btn || btn.disabled) return;
      var bar = btn.closest('.cm-fmtbar');
      var id = bar && bar.getAttribute('data-target');
      if (!id || !FMT_TARGETS[id]) return;
      var ta = document.getElementById(id);
      if (!ta) return;
      e.preventDefault();
      var f = btn.getAttribute('data-fmt');
      if (f === 'preview') fmtTogglePreview(bar, ta);
      else if (f === 'image' || f === 'file') { if (FMT_UPLOAD_SCOPE[id] && cmup()) cmup().pick(FMT_UPLOAD_SCOPE[id], f); }
      else fmtApply(ta, f);
    });
    el.addEventListener('keydown', function (e) {
      var ta = e.target;
      if (!ta || ta.tagName !== 'TEXTAREA' || !FMT_TARGETS[ta.id]) return;
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      var k = String(e.key || '').toLowerCase();
      if (k !== 'b' && k !== 'i') return;
      e.preventDefault();
      fmtApply(ta, k === 'b' ? 'bold' : 'italic');
    });
  }

  function fdate(d) {
    if (!d) return '';
    var loc = window.currentLang === 'ko' ? 'ko-KR' : window.currentLang === 'ja' ? 'ja-JP'
            : window.currentLang === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(d).toLocaleDateString(loc);
  }
  function isAdmin() { return window._user && window._user.email === window.ADMIN_EMAIL; }
  // 공개 범위 배지 글자 — 값은 DB CHECK(public/secret/private) 이지만 화면에서도 아는 값만(status 와 같은 규칙).
  //   HTML 은 호출부에서 리터럴 + esc() 로 짠다(사이트 이스케이프 게이트가 조립 함수를 판정하지 못한다)
  function visLabel(v) {
    if (v === 'secret') return ct('comm.vis.secret', 'Private');
    if (v === 'private') return ct('comm.vis.private', 'Hidden · automatic report');
    return '';
  }
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

  /**
   * Fire-and-forget RPC — the ONLY correct way to call one whose result we ignore.
   *
   * 🚨 supabase-js v2 `.rpc()` returns a LAZY thenable: the `fetch` lives inside
   *    `then()`, so `_sb.rpc(name, args)` on its own **sends nothing at all**.
   *    `cp_bump_view` and `cp_mark_read` were both written that way and neither
   *    ever reached the server (every post sat at view_count = 0, and the desktop
   *    app's unread badge could never go down). Attaching `.then()` is what makes
   *    the request happen — the empty handlers also swallow rejections, which the
   *    surrounding `try/catch` never could for an async failure.
   */
  function fireRpc(name, args) {
    if (!window._sb) return;
    try { window._sb.rpc(name, args).then(function () {}, function () {}); } catch (e) {}
  }

  // Read writes need acknowledgement; view-count writes can remain fire-and-forget.
  var _readJob = null;
  var _readNotice = '';
  function cancelRead() {
    if (_readJob) window.clearTimeout(_readJob.timer);
    _readJob = null;
    _readNotice = '';
  }
  function showReadNotice(message) {
    _readNotice = message;
    var el = document.getElementById('cmReadStatus');
    if (el) { el.textContent = message; el.hidden = !message; }
  }
  function markPostRead(id) {
    if (_readJob && _readJob.id === id) return;
    cancelRead();
    var job = { id: id, user: undefined, attempts: 0, timer: null };
    _readJob = job;
    function current() { return _readJob === job && location.hash === '#p/' + id; }
    function failed(status) {
      if (!current()) return;
      var transient = !status || status === 408 || status === 429 || status >= 500;
      if (transient && job.attempts < 3) {
        showReadNotice('Saving read status. Retrying…');
        job.timer = window.setTimeout(attempt, job.attempts * 1000);
      } else {
        showReadNotice('Read status could not be saved. Reopen this post to try again.');
      }
    }
    function attempt() {
      if (!current()) return;
      job.attempts++;
      Promise.resolve().then(function () { return window._sb.auth.getSession(); }).then(function (res) {
        if (!current()) return;
        if (res.error) { failed(res.error.status); return; }
        var user = res.data && res.data.session && res.data.session.user;
        if (!user) {
          showReadNotice('Sign in on this website with the same account as the app to update its unread badge.');
          return;
        }
        if (job.user !== undefined && job.user !== user.id) return;
        job.user = user.id;
        return window._sb.rpc('cp_mark_read', { pid: id }).then(function (result) {
          if (!current()) return;
          if (result.error) { failed(result.status); return; }
          showReadNotice('');
        });
      }).catch(function (error) { failed(error && error.status); });
    }
    attempt();
  }

  // ── router ─────────────────────────────────────────────────────────────────
  function route() {
    cancelRead();
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

  function paintCounts(tally) {
    BOARDS.forEach(function (b) {
      var n = document.getElementById('cnt-' + b.id);
      if (n) n.textContent = tally[b.id] || 0;
    });
  }
  // 게시판별 개수 — 비밀글은 세고 남의 숨긴 보고는 세지 않는 서버 함수(error_report_devplan.md §4-9).
  //   함수가 아직 없는 DB(SQL 적용 전)에서는 종전 조회로 — 홈페이지가 SQL 보다 먼저 배포돼도 깨지지 않게.
  function loadCounts() {
    if (!window._sb) return;
    window._sb.rpc('community_board_counts').then(function (res) {
      if (res && !res.error && Array.isArray(res.data)) {
        var t = {};
        res.data.forEach(function (r) { t[r.board] = r.n; });
        paintCounts(t);
        return;
      }
      window._sb.from('community_posts').select('board').then(function (r2) {
        var tally = {};
        ((r2 && r2.data) || []).forEach(function (r) { tally[r.board] = (tally[r.board] || 0) + 1; });
        paintCounts(tally);
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

  // 목록 — 남의 비밀글은 🔒 한 줄(제목·작성자를 서버가 가린다), 남의 숨긴 보고는 행이 없다(error_report_devplan.md §4-9).
  //   함수가 아직 없는 DB 에서는 종전 조회로(원본 행 권한이 비밀글을 이미 막으므로 새지 않는다).
  function legacyPostQuery(boardId) {
    var b = BOARD_MAP[boardId];
    return window._sb.from('community_posts')
      .select('id,board,title,body,author_name,status,vote_count,comment_count,view_count,is_pinned,is_hidden,is_answered,admin_reply,created_at')
      .eq('board', boardId)
      .order('is_pinned', { ascending: false })
      .order(b.vote ? 'vote_count' : 'created_at', { ascending: false });
  }
  function loadPosts(boardId) {
    if (!window._sb) return;
    var b = BOARD_MAP[boardId];
    var args = { p_board: boardId, p_by_votes: !!b.vote };
    var q = window._sb.rpc('community_post_list', args).then(function (res) {
      return (res && res.error) ? legacyPostQuery(boardId) : res;
    });
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
      // 남의 비밀글 — 서버가 제목·작성자·수치를 비워 보낸다. 열 수 없으므로 클릭을 걸지 않는다
      if (p.is_locked) {
        return '<div class="cm-row cm-locked" title="' + esc(ct('comm.lockedNote', 'Only the author and STRIX staff can open this post.')) + '">' +
          '<div class="cm-rmain"><div class="cm-rtitle">🔒 ' + esc(ct('comm.locked', 'Private post')) + '</div>' +
          '<div class="cm-rmeta"><span>' + esc(fdate(p.created_at)) + '</span></div></div></div>';
      }
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
            (visLabel(p.visibility) ? ' <span class="cm-badge cm-vis">🔒 ' + esc(visLabel(p.visibility)) + '</span>' : '') +
            (p.comment_count ? ' <span class="cm-cc">[' + p.comment_count + ']</span>' : '') +
            (b.answer && p.is_answered ? ' <span class="cm-badge st-done">✓ ' + esc(ct('comm.answered', 'Answered')) + '</span>' : '') +
          '</div>' +
          '<div class="cm-rmeta">' +
            (p.status ? '<span class="cm-badge' + stClass(p.status) + '">' + esc(stLabel(p.status)) + '</span>' : '') +
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
    cancelRead();
    if (!_curPost || _curPost.id !== id) _editingCommentId = null;   // 다른 글로 가면 댓글 수정 상태를 버린다
    var el = app(); if (!el) return;
    el.innerHTML = '<div class="cm-empty">' + esc(ct('comm.loading', 'Loading…')) + '</div>';
    if (!window._sb) return;
    window._sb.from('community_posts').select('*').eq('id', id).single().then(function (res) {
      if (!res || res.error || !res.data) { el.innerHTML = '<div class="cm-empty">' + esc(ct('comm.notFound', 'Post not found.')) + '</div>'; return; }
      _curPost = res.data;
      _curBoard = _curPost.board;
      fireRpc('cp_bump_view', { pid: id });
      // Read state is saved after the post and comments have been painted.
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
        '<p id="cmReadStatus" role="status" style="font-size:12px;color:#c8c8c8" hidden></p>' +
        '<h1 class="cm-ptitle">' + (p.is_pinned ? '📌 ' : '') + esc(p.title) + '</h1>' +
        '<div class="cm-pmeta">' +
          (p.status ? '<span class="cm-badge' + stClass(p.status) + '">' + esc(stLabel(p.status)) + '</span>' : '') +
          (visLabel(p.visibility) ? '<span class="cm-badge cm-vis">🔒 ' + esc(visLabel(p.visibility)) + '</span>' : '') +
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
            // 관리자도 글을 고칠 수 있다(DB: cp_update 정책 · cp_guard_update 가 관리자를 허용 — community_response_devplan.md §6)
            '<button class="cm-link" onclick="STRIX_CM.edit(\'' + p.id + '\')">' + esc(ct('comm.edit', 'Edit')) + '</button>' +
            '<button class="cm-link danger" onclick="STRIX_CM.del(\'' + p.id + '\')">' + esc(ct('comm.delete', 'Delete')) + '</button>' +
          '</div>' : '') +
      '</article>' +
      // 앱 오류 보고의 상세(오류·환경·비공개 첨부) — 작성자·운영자만. loadReport 가 채운다
      ((p.board === 'bug' && (mine || admin)) ? '<div id="cmReport"></div>' : '');

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
        // 댓글 수정 — 작성자 본인(본문만)과 관리자. 실제 판정은 DB(cc_update 정책 · cc_guard_update 트리거)가 한다.
        var editing = _editingCommentId === c.id && (cmine || admin);
        return '<div class="cm-comment' + (c.is_answer ? ' answer' : '') + '">' +
          '<div class="cm-cmeta">' +
            (c.is_answer ? '<span class="cm-badge st-done">✓ ' + esc(ct('comm.acceptedAnswer', 'Accepted answer')) + '</span> ' : '') +
            '<strong>' + esc(c.author_name) + '</strong><span>· ' + fdate(c.created_at) + '</span>' +
            (c.is_hidden ? '<span class="cm-hidden">· ' + esc(ct('comm.hidden', 'hidden')) + '</span>' : '') +
          '</div>' +
          (editing
          ? '<div class="cm-cedit">' +
              '<textarea id="cmEditCommentBody" data-cid="' + esc(c.id) + '" maxlength="8000">' + esc(c.body) + '</textarea>' +
              '<div class="cm-cact">' +
                '<button class="cm-btn ghost" onclick="STRIX_CM.cancelEditComment()">' + esc(ct('comm.cancel', 'Cancel')) + '</button>' +
                '<button class="cm-btn" onclick="STRIX_CM.saveComment(\'' + esc(c.id) + '\')">' + esc(ct('comm.save', 'Save')) + '</button>' +
              '</div>' +
              '<div class="cm-msg" id="cmEditCommentMsg"></div>' +
            '</div>'
          : '<div class="cm-cbody">' + renderBody(c.body) + '</div>') +
          fileListHtml(_curFiles.byComment[c.id]) +
          (editing ? '' :
          '<div class="cm-cact">' +
            (canAccept ? '<button class="cm-link" onclick="STRIX_CM.accept(\'' + c.id + '\',' + (c.is_answer ? 'false' : 'true') + ')">' + esc(c.is_answer ? ct('comm.unaccept', 'Unaccept') : ct('comm.accept', 'Accept answer')) + '</button>' : '') +
            ((cmine || admin) ? '<button class="cm-link" onclick="STRIX_CM.editComment(\'' + esc(c.id) + '\')">' + esc(ct('comm.edit', 'Edit')) + '</button>' : '') +
            ((cmine || admin) ? '<button class="cm-link danger" onclick="STRIX_CM.delComment(\'' + c.id + '\')">' + esc(ct('comm.delete', 'Delete')) + '</button>' : '') +
          '</div>') +
        '</div>';
      }).join('');
    }
    // comment composer
    html += '<div class="cm-cnew">' +
      '<textarea id="cmCommentBody" maxlength="8000" placeholder="' + esc(window._user ? ct('comm.commentPh', 'Write a comment…') : ct('comm.loginToComment', 'Log in to comment.')) + '"' + (window._user ? '' : ' disabled') + '></textarea>' +
      (window._user ? attachBarHtml() : '') +
      '<div class="cm-chips" id="cmCommentChips"></div>' +
      '<button class="cm-btn" onclick="STRIX_CM.comment(\'' + p.id + '\')">' + esc(ct('comm.postComment', 'Post comment')) + '</button>' +
      '<div class="cm-msg" id="cmCommentMsg"></div>' +
    '</div></section>';

    // paintDetail() also runs on vote/accept/delete, which would otherwise wipe
    // a comment in progress — including the image tokens of uploads already
    // paid for. Carry the draft across the re-render.
    var prev = document.getElementById('cmCommentBody');
    var draft = prev ? prev.value : '';
    // 같은 이유로 수정 중인 댓글의 입력값도 다시 그리기를 건너 옮긴다
    //   (다른 댓글로 수정 대상을 바꿨으면 옮기지 않는다 — data-cid 로 주인을 가린다)
    var prevEdit = document.getElementById('cmEditCommentBody');
    var editDraft = prevEdit && prevEdit.getAttribute('data-cid') === _editingCommentId ? prevEdit.value : null;

    el.innerHTML = html;
    mountFormatBars();
    if (document.getElementById('cmReport')) loadReport(p);
    var editBox = document.getElementById('cmEditCommentBody');
    if (editBox) {
      if (editDraft !== null) editBox.value = editDraft;
      editBox.focus();
    }

    showReadNotice(_readNotice);
    if (location.hash === '#p/' + p.id) markPostRead(p.id);
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
        attachBarHtml() +
        '<div class="cm-chips" id="cmNewChips"></div>' +
        '<div id="cmNewExisting"></div>' +
        '<div class="cm-form-act">' +
          '<button class="cm-btn" id="cmNewSubmit" onclick="STRIX_CM.submit(\'' + boardId + '\'' + (editPost ? ",'" + editPost.id + "'" : '') + ')">' + esc(editPost ? ct('comm.update', 'Update') : ct('comm.submit', 'Submit')) + '</button>' +
          '<button type="button" class="cm-btn ghost" onclick="STRIX_CM.cancelNew(\'' + boardId + '\')">' + esc(ct('comm.cancel', 'Cancel')) + '</button>' +
        '</div>' +
      '</div>';

    mountFormatBars();
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

  function editComment(commentId) {
    if (!requireLogin() || !isUuid(commentId)) return;
    // 권한이 없으면 상태를 남기지 않는다 — 남기면 나중에 권한이 생긴 화면에서 수정 칸이 저절로 열린다
    var c = _curComments.find(function (x) { return x.id === commentId; });
    if (!c || !(isAdmin() || (window._user && window._user.id === c.author_id))) return;
    _editingCommentId = commentId;
    paintDetail();
  }

  function cancelEditComment() {
    _editingCommentId = null;         // 미확정 입력은 버린다(주인이 없어져 다시 그릴 때 옮기지 않는다)
    paintDetail();
  }

  async function saveComment(commentId) {
    if (!requireLogin() || !isUuid(commentId)) return;
    var box = document.getElementById('cmEditCommentBody');
    var msg = document.getElementById('cmEditCommentMsg');
    if (!box) return;
    var body = (box.value || '').trim();
    if (body.length < 1) { return showMsg(msg, ct('comm.errComment', 'Please write a comment.')); }
    var cur = _curComments.find(function (c) { return c.id === commentId; });
    if (cur && cur.body === body) { _editingCommentId = null; paintDetail(); return; }   // 바뀐 것이 없다
    // select 로 되읽는다 — RLS 가 막으면 오류 없이 0행이 오므로 그것을 실패로 본다
    var res = await window._sb.from('community_comments').update({ body: body }).eq('id', commentId).select('id, body');
    if (res && res.error) return showMsg(msg, ct('comm.saveFail', 'Save failed.') + ' ' + res.error.message);
    if (!res || !res.data || !res.data.length || res.data[0].body !== body) return showMsg(msg, ct('comm.saveFail', 'Save failed.'));
    // 본문에서 지운 이미지 토큰의 첨부를 정리한다(글 수정과 같은 규칙)
    if (cmup() && cmup().prune) { try { await cmup().prune('comment', commentId, body); } catch (e) {} }
    _editingCommentId = null;
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
    img.src = src;                    // already whitelisted by renderBody() / cmUpload.fetchFiles()
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
  // ── 앱 오류 보고 상세 (error_report_devplan.md §4-9) ─────────────────────────
  //  community_post_reports · community_report_files 는 RLS 가 작성자·운영자에게만 돌려준다.
  //  첨부는 비공개 저장소(report-files) — 누를 때마다 짧은 서명 URL 을 만든다(링크를 미리 박아 두지 않는다).
  var _reportFiles = [];
  var REP_CATEGORY = { app: 'comm.rep.cat.app', result: 'comm.rep.cat.result', other: 'comm.rep.cat.other' };
  function loadReport(p) {
    var box = document.getElementById('cmReport');
    if (!box || !window._sb) return;
    Promise.all([
      window._sb.from('community_post_reports').select('*').eq('post_id', p.id).maybeSingle(),
      window._sb.from('community_report_files').select('role,path,name,bytes,purged_at').eq('post_id', p.id).order('created_at', { ascending: true })
    ]).then(function (r) {
      var rep = r[0] && !r[0].error ? r[0].data : null;
      if (!rep || !document.getElementById('cmReport')) { if (box) box.innerHTML = ''; return; }   // 앱 보고가 아니다(또는 SQL 적용 전)
      _reportFiles = (r[1] && !r[1].error && r[1].data) || [];
      showReportImages(_reportFiles);
      var mine = window._user && window._user.id === p.author_id;
      var kindLabel = rep.kind === 'auto' ? ct('comm.rep.auto', 'Automatic (app error)') : ct('comm.rep.manual', 'Reported by the user');
      var catKey = REP_CATEGORY[rep.category];
      var kv = [
        [ct('comm.rep.kind', 'Type'), kindLabel + (catKey ? ' · ' + ct(catKey, rep.category) : '')],
        [ct('comm.rep.version', 'STRIX version'), rep.app_version],
        [ct('comm.rep.where', 'Where'), rep.where_ || '—'],
        [ct('comm.rep.error', 'Error'), rep.error_name ? rep.error_name + ': ' + (rep.error_message || '') : '—']
      ];
      // 🚨 innerHTML 로 조립하지 않는다 — 오류 메시지·스택·파일 이름은 사용자 PC 에서 온 값이다. DOM + textContent 만 쓴다
      var mk = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
      var sec = mk('section', 'cm-report');
      sec.appendChild(mk('div', 'cm-report-h', '🧾 ' + ct('comm.rep.title', 'Error report from the app')));
      var grid = mk('div', 'cm-report-kv');
      kv.forEach(function (x) { grid.appendChild(mk('span', null, x[0])); grid.appendChild(mk('span', null, x[1])); });
      sec.appendChild(grid);
      var fold = function (label, body) {
        var d = mk('details'); d.appendChild(mk('summary', null, label)); d.appendChild(mk('pre', 'cm-report-pre', body)); sec.appendChild(d);
      };
      if (rep.error_stack) fold(ct('comm.rep.stack', 'Stack trace'), rep.error_stack);
      fold(ct('comm.rep.env', 'Environment'), JSON.stringify(rep.env || {}, null, 2));
      if (_reportFiles.length) {
        var list = mk('div', 'cm-files');
        _reportFiles.forEach(function (f, i) {
          var item = mk(f.purged_at ? 'span' : 'button', f.purged_at ? 'cm-file cm-file-gone' : 'cm-file');
          if (!f.purged_at) { item.type = 'button'; item.addEventListener('click', function () { dlReport(i); }); }
          item.appendChild(mk('span', 'cm-file-ico', '📎'));
          item.appendChild(mk('span', 'cm-file-n', f.name));
          item.appendChild(mk('span', 'cm-file-s', f.purged_at ? ct('comm.rep.purged', 'Deleted after the retention period') : fmtBytes(f.bytes)));
          list.appendChild(item);
        });
        sec.appendChild(list);
      }
      if (mine && rep.kind === 'manual' && (p.visibility === 'secret' || p.visibility === 'public')) {
        var next = p.visibility === 'secret' ? 'public' : 'secret';
        var vis = mk('div', 'cm-report-vis');
        vis.appendChild(mk('span', null, p.visibility === 'secret'
          ? ct('comm.visNote.secret', 'Only you and STRIX staff can open this post.')
          : ct('comm.visNote.public', 'Any community member can read the title and description. Attached files are never public.')));
        var btn = mk('button', 'cm-btn ghost sm', next === 'public' ? ct('comm.makePublic', 'Make public') : ct('comm.makeSecret', 'Make private'));
        btn.type = 'button';
        btn.addEventListener('click', function () { setVisibility(p.id, next); });
        vis.appendChild(btn);
        sec.appendChild(vis);
      } else if (mine && p.visibility === 'private') {
        var note = mk('div', 'cm-report-vis');
        note.appendChild(mk('span', null, ct('comm.visNote.private', 'Automatic reports are not listed on the board. Only you and STRIX staff can see them.')));
        sec.appendChild(note);
      }
      box.textContent = '';
      box.appendChild(sec);
    });
  }

  // 본문 안 비공개 그림(app 편집기 — rich_editor_devplan.md §6). renderBody 가 남긴 자리(.cm-rimg[data-rf=N])를
  // 첨부 번호 N 의 screenshot 파일로 바꾼다. 파일 목록은 RLS 가 작성자·운영자에게만 주므로 다른 사람은 자리 표시만 본다.
  // 🚨 DOM 으로만 만든다(innerHTML 금지) — 서명 주소는 서버가 준 값이고 경로는 아래 정규식이 거른다.
  function showReportImages(files) {
    var spots = document.querySelectorAll('.cm-pbody .cm-rimg[data-rf]');
    if (!spots.length || !window._sb) return;
    var byNo = {};
    files.forEach(function (f) {
      var m = !f.purged_at && /\/(\d{1,3})-screenshot\.(?:png|jpg|jpeg)$/.exec(f.path || '');
      if (m) byNo[m[1]] = f.path;
    });
    Array.prototype.forEach.call(spots, function (spot) {
      var path = byNo[spot.getAttribute('data-rf')];
      if (!path) return;
      window._sb.storage.from('report-files').createSignedUrl(path, 3600).then(function (r) {
        var url = r && r.data && r.data.signedUrl;
        if (!url || !/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/sign\/report-files\//.test(url) || !spot.parentNode) return;
        var img = document.createElement('img');
        img.className = spot.className.replace('cm-rimg', 'cm-img').replace(/[^a-z0-9 -]/gi, '');
        img.src = url;
        img.alt = '';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        spot.parentNode.replaceChild(img, spot);
      });
    });
  }

  function dlReport(i) {
    var f = _reportFiles[i];
    if (!f || f.purged_at || !window._sb) return;
    window._sb.storage.from('report-files').createSignedUrl(f.path, 120, { download: f.name }).then(function (r) {
      if (r && r.data && r.data.signedUrl) window.open(r.data.signedUrl, '_blank', 'noopener');
      else alert(ct('comm.rep.dlFail', 'The file could not be downloaded.') + (r && r.error ? ' ' + r.error.message : ''));
    });
  }

  function setVisibility(id, v) {
    if (!window._sb || (v !== 'public' && v !== 'secret')) return;
    if (v === 'public' && !confirm(ct('comm.makePublicConfirm', 'Make this post public? Any community member will be able to read the title and description. Attached files stay private.'))) return;
    window._sb.from('community_posts').update({ visibility: v }).eq('id', id).then(function (r) {
      if (r && r.error) { alert(ct('comm.saveFail', 'Could not save.') + ' ' + r.error.message); return; }
      _curPost = null;
      renderDetail(id);
    });
  }

  window.STRIX_CM = {
    dlReport: dlReport, setVisibility: setVisibility,
    newPost: newPost, open: open, vote: vote, submit: submit, comment: comment,
    accept: accept, delComment: delComment, del: del, edit: edit,
    editComment: editComment, cancelEditComment: cancelEditComment, saveComment: saveComment,
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
    bindFormatBar();
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
      try { window._sb.auth.onAuthStateChange(function () {
        cancelRead();
        // Let auth.js publish the new user, and leave the auth callback lock.
        window.setTimeout(route, 0);
      }); } catch (e) {}
    }
    window.addEventListener('pagehide', cancelRead);
    route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
