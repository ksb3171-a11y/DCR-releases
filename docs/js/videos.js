/* ============================================================================
   STRIX site — video window (videos.html)
   Opened as its own browser window from the home hero button (site.js
   `[data-video-window]`), so it can be dragged to another monitor.

   Privacy: nothing is fetched from YouTube until the visitor presses play
   (click-to-load facade, youtube-nocookie.com). No thumbnails are loaded.
   Security: DOM is built with createElement/textContent only; IDs from the config
   are validated before they reach a URL (security_hardening_devplan.md §10).
   Devplan: help_video_renewal_devplan.md §10.9
   ============================================================================ */
(function () {
  'use strict';

  var CFG = window.STRIX_VIDEOS || { channelUrl: '', tabs: [] };
  var I18N = window.STRIX_I18N;
  var VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;
  var PLAYLIST_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;
  var EMBED = 'https://www.youtube-nocookie.com/embed/';
  var CHANNEL = /^https:\/\/www\.youtube\.com\/@[A-Za-z0-9._-]+$/.test(CFG.channelUrl || '')
    ? CFG.channelUrl : 'https://www.youtube.com/@strix-st';

  /* ── Language: ?lang= from the opener, else the remembered pick, else English ── */
  function pickLang() {
    var q = null;
    try { q = new URLSearchParams(window.location.search).get('lang'); } catch (e) {}
    if (q && I18N && I18N.T[q]) return q;
    var saved = null;
    try { saved = localStorage.getItem('dcr-lang-v2'); } catch (e) {}
    return saved && I18N && I18N.T[saved] ? saved : 'en';
  }
  var lang = pickLang();
  var videoLang = lang === 'ko' ? 'ko' : 'en';   // videos exist in ko and en only
  function t(key) {
    var d = (I18N && (I18N.T[lang] || I18N.T.en)) || {};
    return d[key] !== undefined ? d[key] : ((I18N && I18N.T.en[key]) || key);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function tabData(tab) {
    var vids = ((tab.videos && tab.videos[videoLang]) || []).filter(function (v) {
      return v && typeof v.id === 'string' && VIDEO_ID_RE.test(v.id);
    });
    var pl = tab.playlistId && tab.playlistId[videoLang];
    return { videos: vids, playlistId: typeof pl === 'string' && PLAYLIST_ID_RE.test(pl) ? pl : '' };
  }

  function embedUrl(videoId, playlistId) {
    var params = 'autoplay=1&rel=0&modestbranding=1&playsinline=1&hl=' + encodeURIComponent(lang);
    if (videoId) return EMBED + encodeURIComponent(videoId) + '?' + params + (playlistId ? '&list=' + encodeURIComponent(playlistId) : '');
    return EMBED + 'videoseries?' + params + '&list=' + encodeURIComponent(playlistId);
  }
  function watchUrl(videoId, playlistId) {
    if (videoId) return 'https://www.youtube.com/watch?v=' + encodeURIComponent(videoId) + (playlistId ? '&list=' + encodeURIComponent(playlistId) : '');
    if (playlistId) return 'https://www.youtube.com/playlist?list=' + encodeURIComponent(playlistId);
    return CHANNEL;
  }

  /* ── refs ── */
  var tabsEl, frameEl, titleEl, descEl, listEl, fsBtn, ytLink;
  var state = { tab: 0, video: 0 };

  function renderStatic() {
    if (I18N) I18N.apply(lang, { persist: false });
    document.title = t('vid.pageTitle') + ' — STRIX';
    var ch = document.getElementById('vidChannel');
    ch.href = CHANNEL;
  }

  function renderTabs() {
    tabsEl.textContent = '';
    CFG.tabs.forEach(function (tab, i) {
      var d = tabData(tab);
      var b = el('button', 'vid-tab' + (i === state.tab ? ' on' : ''),
        t(tab.labelKey) + (d.videos.length ? ' (' + d.videos.length + ')' : ''));
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === state.tab ? 'true' : 'false');
      b.addEventListener('click', function () {
        if (state.tab === i) return;
        state.tab = i; state.video = 0;
        renderTabs(); renderBody();
      });
      tabsEl.appendChild(b);
    });
  }

  /* Poster shown until play is pressed — no request to YouTube yet. */
  function renderPoster(videoId, playlistId, label) {
    frameEl.textContent = '';
    var btn = el('button', 'vid-poster');
    btn.type = 'button';
    btn.setAttribute('aria-label', t('vid.play') + ' — ' + label);
    btn.appendChild(el('span', 'vid-poster-title', label));
    btn.appendChild(el('span', 'vid-play'));
    btn.appendChild(el('span', 'vid-consent', t('vid.consent')));
    btn.addEventListener('click', function () { loadPlayer(videoId, playlistId, label); });
    frameEl.appendChild(btn);
  }

  function loadPlayer(videoId, playlistId, label) {
    frameEl.textContent = '';
    var f = document.createElement('iframe');
    f.src = embedUrl(videoId, playlistId);
    f.title = label;
    f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frameEl.appendChild(f);
    return f;
  }

  function renderEmpty() {
    frameEl.textContent = '';
    var box = el('div', 'vid-empty');
    box.appendChild(el('span', 'vid-empty-ico'));
    box.appendChild(el('strong', '', t('vid.emptyTitle')));
    box.appendChild(el('span', 'vid-empty-body', t('vid.emptyBody')));
    var a = el('a', 'vid-yt', t('vid.openChannel'));
    a.href = CHANNEL; a.target = '_blank'; a.rel = 'noopener';
    box.appendChild(a);
    frameEl.appendChild(box);
  }

  function renderBody() {
    var tab = CFG.tabs[state.tab];
    var d = tab ? tabData(tab) : { videos: [], playlistId: '' };
    var v = d.videos[state.video];
    listEl.textContent = '';

    if (v) {
      var label = String(v.title || '');
      renderPoster(v.id, d.playlistId, label);
      titleEl.textContent = label;
      descEl.textContent = lang === 'ja' || lang === 'zh' ? t('vid.enOnly') : '';
      ytLink.href = watchUrl(v.id, d.playlistId);
      fsBtn.disabled = false;
      d.videos.forEach(function (item, i) {
        var li = el('button', 'vid-item' + (i === state.video ? ' on' : ''));
        li.type = 'button';
        li.appendChild(el('span', 'vid-item-no', String(i + 1)));
        var tx = el('span', 'vid-item-tx');
        tx.appendChild(el('span', 'vid-item-title', String(item.title || '')));
        if (item.duration) tx.appendChild(el('span', 'vid-item-dur', String(item.duration)));
        li.appendChild(tx);
        li.addEventListener('click', function () { state.video = i; renderBody(); });
        listEl.appendChild(li);
      });
      var on = listEl.querySelector('.vid-item.on');
      if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
    } else if (d.playlistId) {
      var plLabel = t(tab.labelKey);
      renderPoster('', d.playlistId, plLabel);
      titleEl.textContent = plLabel;
      descEl.textContent = lang === 'ja' || lang === 'zh' ? t('vid.enOnly') : '';
      ytLink.href = watchUrl('', d.playlistId);
      fsBtn.disabled = false;
      listEl.appendChild(el('p', 'vid-list-note', t('vid.inPlayer')));
    } else {
      renderEmpty();
      titleEl.textContent = t(tab ? tab.labelKey : 'vid.pageTitle');
      descEl.textContent = '';
      ytLink.href = CHANNEL;
      fsBtn.disabled = true;
      listEl.appendChild(el('p', 'vid-list-note', t('vid.soon')));
    }
  }

  /* Full screen on the player box. If the video is not loaded yet, load it first —
     requestFullscreen must run inside the same click, so it is called right away. */
  function goFullscreen() {
    if (fsBtn.disabled) return;
    var poster = frameEl.querySelector('.vid-poster');
    if (poster) poster.click();
    var req = frameEl.requestFullscreen || frameEl.webkitRequestFullscreen;
    var p = null;
    if (req) { try { p = req.call(frameEl); } catch (e) { fillWindow(true); return; } }
    if (!req) { fillWindow(true); return; }
    if (p && typeof p.catch === 'function') p.catch(function () { fillWindow(true); });
    // Some embedded viewers leave the request pending forever — fall back after a beat.
    setTimeout(function () {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) fillWindow(true);
    }, 1200);
  }
  /* Fallback when the browser refuses full screen (policy / embedded viewer): the
     player fills the whole window instead, so the button never does nothing. Esc
     or the "Exit full screen" button (.vid-max-exit) restores it. */
  function fillWindow(on) {
    document.body.classList.toggle('vid-max', on);
  }

  function init() {
    tabsEl = document.getElementById('vidTabs');
    frameEl = document.getElementById('vidFrame');
    titleEl = document.getElementById('vidTitle');
    descEl = document.getElementById('vidDesc');
    listEl = document.getElementById('vidList');
    fsBtn = document.getElementById('vidFullscreen');
    ytLink = document.getElementById('vidOnYoutube');

    renderStatic();
    renderTabs();
    renderBody();

    fsBtn.addEventListener('click', goFullscreen);
    var restore = el('button', 'vid-max-exit', t('vid.exitFullscreen'));
    restore.type = 'button';
    restore.addEventListener('click', function () { fillWindow(false); });
    frameEl.parentNode.insertBefore(restore, frameEl);
    document.addEventListener('fullscreenchange', function () {
      if (document.fullscreenElement) fillWindow(false);   // real full screen won the race
    });
    frameEl.addEventListener('dblclick', goFullscreen);

    /* Esc closes the window (the browser itself takes Esc while in full screen).
       window.close() only works for a window a script opened — the hero button
       does that; a directly visited URL simply stays open. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (document.fullscreenElement || document.webkitFullscreenElement) return;
      if (document.body.classList.contains('vid-max')) { fillWindow(false); return; }
      window.close();
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
