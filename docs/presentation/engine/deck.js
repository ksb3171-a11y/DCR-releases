/* ══════════════════════════════════════════════════════════════════════════
   발표덱 엔진 — 렌더러 + 발표 조작 (재사용 자산)

   이 파일은 "덱을 화면에 그리고 넘기는 일"만 합니다.
   발표 내용은 data/deck.js, 검증 수치는 data/verification.js 에 있습니다.

   ★ 데이터 모델 (data/deck.js)
     window.__DECK__ = {
       meta:   { title, canvas:{w,h}, footer, printTheme:'light'|'screen', appendixA:true },
       slides: [ { id, name, apx?, els:[ 요소… ] }, … ]
     }
     요소 공통:  { id, type, x, y, w, h, k?, z?, rot?, st?{CSS}, v?:'top|mid|bot' }
       type='text'   { html }                      ← 자유 서식 텍스트/카드/표
       type='image'  { slot, src, kind, caption, fit, bare, frame? }
             그림 경로는 assets/user/<slot>.png → .jpg → src → assets/auto/<slot>.png 순.
             ★ user 가 항상 이긴다 — 직접 찍은 그림을 슬롯 이름으로 넣기만 하면 교체된다.
             x/y/w/h 는 "쓸 수 있는 최대 영역"이고, 실제 상자는 그림 비율로 줄어 가운데 놓인다
             (frame:'fixed' 또는 fit:'cover'/'fill' 이면 상자를 그대로 쓴다).
       type='vtable' { kind:'static'|'dynamic'|'one', vid? }   ← 검증 수치(내용 편집 잠금)

   ★ 검증 수치는 여기서 만들지 않습니다. data/verification.js 를 그대로 읽어 씁니다.
     (frontend/scripts/build-deck.mjs 가 records/*.json 에서 생성)
   ════════════════════════════════════════════════════════════════════════ */
(function (global) {
'use strict';

/* ── 기본값 ───────────────────────────────────────────────────────────── */
var DEF_CANVAS = { w: 1600, h: 900 };

/* 부록 A(검증 상세) 자동 생성 슬라이드의 판면 — 캔버스 1600×900 기준 */
var APX = { x: 112, w: 1376, kickerY: 74, titleY: 102, bodyY: 182, bodyBottom: 802, footY: 812 };

var Deck = {
  data: null,          /* 덱 데이터(사용자 편집 대상) */
  vdata: null,         /* 검증 수치(자동 생성) */
  slides: [],          /* [{ def, node }] — 화면에 붙은 순서 */
  cur: 0,
  scale: 1,
  hooks: { afterRender: [], afterGo: [] },
};
global.Deck = Deck;

/* ── 유틸 ─────────────────────────────────────────────────────────────── */
function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function el(tag, cls) { var d = document.createElement(tag); if (cls) d.className = cls; return d; }
function $(sel) { return document.querySelector(sel); }

/** 오차 표기 — 유효숫자를 살리되 표 폭을 넘기지 않는다 */
function pct(v) {
  if (v === undefined || v === null || isNaN(v)) return '—';
  var a = Math.abs(v);
  if (a === 0)   return '0 %';
  if (a < 0.001) return '< 0.001 %';
  if (a < 0.01)  return v.toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + ' %';
  if (a < 1)     return v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + ' %';
  return v.toFixed(2) + ' %';
}
Deck.pct = pct;

function noData(msg) {
  return '<div class="ph">'
       + '<div class="ph-id">검증 데이터 미주입</div>'
       + '<div class="ph-k">' + esc(msg) + '</div>'
       + '<div class="ph-how">frontend 에서 <code>npm run deck:build</code> 실행 시 자동 생성됩니다</div>'
       + '</div>';
}

/* ══════════════════════════════════════════════════════════════════════
   1. 검증 표 — 숫자는 전부 vdata 에서 온다 (손으로 쓰지 않는다)
   ════════════════════════════════════════════════════════════════════ */
function verdictTag(v) {
  var ok = (v === 'PASS');
  return '<span class="tag ' + (ok ? 'pass' : 'fail') + '">' + esc(v || '—') + '</span>';
}
function diffCell(v, ok) {
  return '<td class="' + (ok === false ? 'num-bad' : 'num-ok') + '">' + pct(v) + '</td>';
}

function summaryTable(ids) {
  var D = Deck.vdata;
  var rows = ids.map(function (id) { return D.records[id]; }).filter(Boolean);
  if (!rows.length) return noData('해당 구간 기록 없음');
  var h = '<table><thead><tr>'
        + '<th style="width:7%">ID</th>'
        + '<th style="width:37%">검증 내용</th>'
        + '<th style="width:26%">참조해 출처</th>'
        + '<th style="width:10%">대조 항목</th>'
        + '<th style="width:10%">최대 오차</th>'
        + '<th style="width:10%">판정</th>'
        + '</tr></thead><tbody>';
  rows.forEach(function (r) {
    var ok = (r.verdict === 'PASS');
    h += '<tr>'
      +  '<td><span class="id">' + esc(r.id) + '</span></td>'
      +  '<td class="l">' + esc(r.title) + '</td>'
      +  '<td class="l"><span class="src">' + esc(r.sourceShort || '') + '</span></td>'
      +  '<td>' + (r.count || 0) + '</td>'
      +  diffCell(r.errorPct, ok)
      +  '<td>' + verdictTag(r.verdict) + '</td>'
      +  '</tr>';
  });
  return h + '</tbody></table>';
}

function detailTable(id) {
  var r = Deck.vdata.records[id];
  if (!r || !r.computed) return noData(id + ' 기록 없음');
  var h = '<table><thead><tr>'
        + '<th style="width:40%">대조 항목</th>'
        + '<th style="width:18%">STRIX</th>'
        + '<th style="width:18%">참조해</th>'
        + '<th style="width:12%">오차</th>'
        + '<th style="width:12%">판정</th>'
        + '</tr></thead><tbody>';
  r.computed.forEach(function (c) {
    h += '<tr>'
      +  '<td class="l">' + esc(c.quantity) + (c.unit ? ' <span class="src">[' + esc(c.unit) + ']</span>' : '') + '</td>'
      +  '<td>' + esc(c.strix) + '</td>'
      +  '<td>' + esc(c.ref) + '</td>'
      +  diffCell(c.diffPct, c.verdict === 'PASS')
      +  '<td>' + verdictTag(c.verdict) + '</td>'
      +  '</tr>';
  });
  return h + '</tbody></table>';
}

/** 부록 A 한 묶음(=record 1건 상세). 행이 많으면 from~to 로 잘라 이어서 싣는다. */
function groupHtml(r, from, to, cont) {
  from = from || 0;
  to   = (to === undefined) ? r.computed.length : to;
  var h = '<div class="vgrp"><div class="vhead">'
        + '<span class="id">' + esc(r.id) + '</span>'
        + '<span class="nm">' + esc(r.title) + (cont ? ' <span class="src">(계속)</span>' : '') + '</span>'
        + '<span class="src">' + esc(r.sourceShort || '') + '</span>'
        + '</div><table><thead><tr>'
        + '<th style="width:40%">대조 항목</th><th style="width:18%">STRIX</th>'
        + '<th style="width:18%">참조해</th><th style="width:12%">오차</th><th style="width:12%">판정</th>'
        + '</tr></thead><tbody>';
  r.computed.slice(from, to).forEach(function (c) {
    h += '<tr><td class="l">' + esc(c.quantity)
      +  (c.unit ? ' <span class="src">[' + esc(c.unit) + ']</span>' : '') + '</td>'
      +  '<td>' + esc(c.strix) + '</td><td>' + esc(c.ref) + '</td>'
      +  diffCell(c.diffPct, c.verdict === 'PASS')
      +  '<td>' + verdictTag(c.verdict) + '</td></tr>';
  });
  return h + '</tbody></table></div>';
}
function partHtml(p) {
  var r = Deck.vdata.records[p.id];
  return r ? groupHtml(r, p.from, p.to, p.cont) : '';
}

function vtableHtml(e) {
  if (!Deck.vdata) return noData('검증 기록 파일이 아직 생성되지 않았습니다');
  var ord = Deck.vdata.order || { static: [], dynamic: [] };
  if (e.kind === 'static')  return summaryTable(ord.static);
  if (e.kind === 'dynamic') return summaryTable(ord.dynamic);
  if (e.kind === 'one')     return detailTable(e.vid);
  if (e.kind === 'group')   return (e.parts || []).map(partHtml).join('');
  return noData('알 수 없는 표 종류: ' + e.kind);
}

/* ══════════════════════════════════════════════════════════════════════
   2. 요소 렌더
   ════════════════════════════════════════════════════════════════════ */
/** 한 슬롯이 시도할 이미지 경로 — 앞에 있는 것이 이긴다.
 *  ★ assets/user/ 가 항상 최우선이다. 사용자가 직접 찍은 그림을 슬롯 이름으로 떨궈두면
 *    데이터를 고치지 않아도 자동 캡처를 덮어쓴다(= 교체 절차가 "파일 복사" 하나로 끝난다).
 *    반대로 하면 교체할 때마다 data/deck.js 의 src 를 손으로 고쳐야 하고, 그러다 빠뜨린다. */
function imgSources(e) {
  var out = [];
  /* 편집기에서 방금 고른 파일은 디스크 쓰기·브라우저 캐시와 무관하게 즉시 보여 준다.
     _ 로 시작하는 필드는 저장 시 제거되므로 deck.js 에 blob URL 이 남지 않는다. */
  if (e._previewSrc) out.push(e._previewSrc);
  if (e.slot) { out.push('assets/user/' + e.slot + '.png');
                out.push('assets/user/' + e.slot + '.jpg'); }
  if (e.src)    out.push(e.src);
  if (e.slot)   out.push('assets/auto/' + e.slot + '.png');
  return out.filter(function (v, i) { return v && out.indexOf(v) === i; });
}

function imageHtml(e) {
  var fit  = e.fit || 'contain';
  var attrs = ' data-fit="' + esc(fit) + '"'
            + (e.bare ? ' data-bare="1"' : '')
            + (e.slot ? ' data-slot="' + esc(e.slot) + '"' : '');
  var srcs = imgSources(e);
  var inner = srcs.length ? '<img src="' + esc(srcs[0]) + '" alt="">' : placeholderHtml(e);
  return '<figure class="slot"' + attrs + '>' + inner
       + '<figcaption>' + (e.caption || '') + '</figcaption></figure>';
}
function placeholderHtml(e) {
  var nm = (e.slot || 'image') + '.png';
  return '<div class="ph">'
       + '<div class="ph-id">' + esc(nm) + '</div>'
       + '<div class="ph-k">직접 넣는 이미지'
       + (e.recW ? ' · 권장 ' + esc(e.recW) + '×' + esc(e.recH) : '') + '</div>'
       + '<div class="ph-how">assets/user/ 폴더에 위 이름으로 저장하세요 (png · jpg)</div>'
       + '</div>';
}

/* ── 프레임 자동 맞춤 ───────────────────────────────────────────────────
   데이터의 x/y/w/h 는 "이 그림이 쓸 수 있는 최대 영역"이고,
   실제 상자는 그 안에 들어가는 **그림 크기 그대로**다(가운데 고정).

   ★ 왜 필요한가 — object-fit:contain 은 그림만 비율대로 줄이고
     테두리·배경은 상자 전체에 그린다. 그래서 가로로 긴 캡처를 세로로 긴 상자에
     넣으면 위아래에 검은 띠가 남았다(실측). 상자 자체를 그림 비율로 줄이면
     띠가 생길 자리가 아예 없어지고, 가로로 길든 세로로 길든 그대로 들어간다.
   ⚠ 캡션 높이를 빼고 계산한다. 안 빼면 상자를 줄인 만큼 캡션이 아래로 삐져나가
     넘침 검사(A)에 걸린다. 캡션은 폭이 좁아지면 줄이 늘 수 있어 두 번 잰다. */
function fitImageFrame(d, e) {
  if (e.frame === 'fixed') return;
  var fit = e.fit || 'contain';
  if (fit === 'cover' || fit === 'fill') return;          /* 상자를 꽉 채우라는 지시 */
  var img = d.querySelector('figure.slot img');
  if (!img || !img.naturalWidth || !img.naturalHeight) return;

  /* ⚠ 현재 장이 아닌 슬라이드는 display:none 이라 캡션 높이가 0 으로 나온다.
     그대로 계산하면 캡션 몫을 못 빼서 상자 아래로 삐져나가고, 넘침 검사(A)에 걸린다.
     넘침 검사·부록 자동축소가 쓰는 것과 같은 수법으로 잠깐만 켜서 잰다. */
  var cvs   = d.closest('.canvas');
  if (!cvs) return;                                       /* 아직 안 붙었다 — fitImages 가 다시 부른다 */
  var wasOn = cvs.classList.contains('on');
  if (!wasOn) cvs.classList.add('on');
  try {
    var cap = d.querySelector('figure.slot figcaption');
    var bw = e.w, bh = e.h, capH = 0;
    for (var pass = 0; pass < 3; pass++) {
      var availH = bh - capH;
      if (availH <= 0 || bw <= 0) return;
      var s  = Math.min(bw / img.naturalWidth, availH / img.naturalHeight);
      var iw = Math.ceil(img.naturalWidth  * s);
      var ih = Math.ceil(img.naturalHeight * s);
      var w  = iw, h = ih + capH;
      d.style.left   = Math.round(e.x + (e.w - w) / 2) + 'px';
      d.style.top    = Math.round(e.y + (e.h - h) / 2) + 'px';
      d.style.width  = w + 'px';
      d.style.height = h + 'px';
      if (!cap || !cap.offsetHeight) break;
      var nh2 = cap.offsetHeight + (parseFloat(getComputedStyle(cap).marginTop) || 0);
      if (Math.abs(nh2 - capH) < 1) break;
      capH = Math.ceil(nh2);
    }
  } finally {
    if (!wasOn) cvs.classList.remove('on');
  }
}

Deck.fitImageFrame = fitImageFrame;      /* 편집기가 리사이즈 후 다시 맞출 때 쓴다 */

/** 이미 로드가 끝난 그림(캐시·재렌더)까지 한 번에 맞춘다.
 *  renderEl 시점에는 노드가 아직 캔버스에 붙기 전이라 잴 수 없어서, 렌더 끝에 한 번 더 돈다. */
Deck.fitImages = function () {
  Deck.slides.forEach(function (s) {
    s.node.querySelectorAll('.el[data-type="image"]').forEach(function (n) {
      if (n._def) fitImageFrame(n, n._def);
    });
  });
};

/** 어떤 그림이 실제로 쓰였는가 — user / auto / 자리표시.
 *  ★ "일단 자동 캡처로 두고 나중에 교체"가 그대로 배포되는 것을 막는 장치다(검수 G). */
Deck.imageReport = function () {
  var out = [];
  Deck.slides.forEach(function (s, i) {
    s.node.querySelectorAll('.el[data-type="image"]').forEach(function (n) {
      var fig = n.querySelector('figure.slot');
      var img = n.querySelector('img');
      var src = img ? (img.currentSrc || img.src || '') : '';
      var use = !img ? 'placeholder'
              : /\/assets\/user\//.test(src) ? 'user'
              : /\/assets\/auto\//.test(src) ? 'auto' : 'other';
      out.push({ slide: i + 1, id: s.def.id, el: n.dataset.id,
                 slot: (fig && fig.dataset.slot) || '', use: use,
                 src: src.replace(/^.*\/assets\//, 'assets/') });
    });
  });
  return out;
};

/* 본문 안에 박힌 검증 숫자 — <span data-bind="_.total"> / <b data-bind="SB2.errorPct">
   ★ 이 숫자들도 records 파생이다. 덱 데이터에는 자리만 있고 값은 여기서 채운다.
     (편집기는 data-bind 요소를 편집 잠금으로 다룬다) */
function fillBinds(root) {
  root.querySelectorAll('[data-bind]').forEach(function (n) {
    var D = Deck.vdata;
    if (!D) { n.textContent = '—'; return; }
    var p = n.getAttribute('data-bind').split('.');
    var v;
    if (p[0] === '_') v = D.summary ? D.summary[p[1]] : undefined;
    else {
      var r = D.records[p[0]];
      v = r ? r[p[1]] : undefined;
      if (p[1] === 'errorPct' || p[1] === 'tolerancePct') v = pct(v);
    }
    n.textContent = (v === undefined || v === null) ? '—' : v;
  });
}
Deck.fillBinds = fillBinds;

function renderEl(e) {
  var d = el('div', 'el' + (e.cls ? ' ' + e.cls : ''));
  d._def         = e;              /* 편집기·프레임 재맞춤이 원본 정의를 되찾는 통로 */
  d.dataset.id   = e.id;
  d.dataset.type = e.type;
  d.style.left   = e.x + 'px';
  d.style.top    = e.y + 'px';
  d.style.width  = e.w + 'px';
  d.style.height = e.h + 'px';
  if (e.k && e.k !== 1)  d.style.setProperty('--k', e.k);
  if (e.z)               d.style.zIndex = e.z;
  if (e.rot)             d.style.transform = 'rotate(' + e.rot + 'deg)';
  if (e.v)               d.dataset.v = e.v;
  if (e.st) for (var p in e.st) { if (e.st[p] !== '' && e.st[p] != null) d.style[p] = e.st[p]; }

  if (e.type === 'image')       d.innerHTML = imageHtml(e);
  else if (e.type === 'vtable') { d.innerHTML = '<div class="vt">' + vtableHtml(e) + '</div>'; d.dataset.locked = '1'; }
  else                        { d.innerHTML = e.html || ''; fillBinds(d); }

  /* 이미지 — 후보 경로를 순서대로 시도하고, 전부 없으면 자리표시로 교체한다.
     (경로가 틀려도, 사용자가 아직 안 찍었어도 덱은 계속 동작한다) */
  var img = d.querySelector('figure.slot img');
  if (img) {
    var srcs = imgSources(e), si = 0;
    img.addEventListener('error', function () {
      if (++si < srcs.length) { img.src = srcs[si]; return; }
      var ph = el('div'); ph.innerHTML = placeholderHtml(e);
      img.replaceWith(ph.firstChild);
    });
    img.addEventListener('load', function () { fitImageFrame(d, e); });
    if (img.complete) {
      if (img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
      else fitImageFrame(d, e);
    }
  }
  return d;
}

function renderSlide(def, index, total) {
  var meta = Deck.data.meta || {};
  var cv   = meta.canvas || DEF_CANVAS;
  var c    = el('div', 'canvas');
  c.dataset.id = def.id;
  c.style.width  = cv.w + 'px';
  c.style.height = cv.h + 'px';
  c.style.setProperty('--uu', (cv.w / 100) + 'px');
  if (def.apx) c.dataset.apx = '1';
  if (def.bg)  c.style.background = def.bg;

  (def.els || []).forEach(function (e) { c.appendChild(renderEl(e)); });

  /* ★ 눈썹(kicker)의 챕터 번호·이름도 엔진이 채운다.
     데이터에는 그 장 고유의 꼬리표(예: "Features ①")만 있고, 앞의 "4.1.1 모델링 생산성"은
     meta.chapters 에서 파생된다 — 장을 옮기거나 끼워 넣어도 번호가 저절로 맞는다.
     (손으로 적어두면 순서를 바꾼 순간 조용히 틀린 번호가 인쇄된다) */
  if (def._no) {
    var kk = c.querySelector('.kicker');
    if (kk) {
      var tail = kk.innerHTML.trim();
      kk.innerHTML = '<span class="kno">' + esc(def._no) + '</span>'
                   + '<span class="kch">' + esc(def._grpT || def._chT || '') + '</span>'
                   + (tail ? '<span class="ksep">·</span><span class="kold">' + tail + '</span>' : '');
    }
  }

  /* 각주·쪽번호는 엔진이 그린다(장 번호가 바뀌어도 항상 맞는다) */
  if (def.foot !== false) {
    var pad = Math.round(cv.w * 0.07);
    var f = el('div', 'el foot-el');
    f.style.left = pad + 'px';
    f.style.top  = Math.round(cv.h * 0.902) + 'px';
    f.style.width  = (cv.w - pad * 2) + 'px';
    f.style.height = Math.round(cv.h * 0.045) + 'px';
    f.dataset.role = 'foot';
    f.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-end">'
                + '<span class="fnote">' + (def.note || '') + '</span>'
                + '<span class="pgnum">' + (index + 1) + ' / ' + total + '</span></div>';
    c.appendChild(f);
  }
  return c;
}

/* ══════════════════════════════════════════════════════════════════════
   3. 부록 A — 검증 상세 자동 생성 (실제 높이를 재서 페이지를 나눈다)
      ⚠ 이 슬라이드들은 records 에서 파생되므로 편집 대상이 아니다.
        (내용을 손으로 고칠 수 있게 하면 원천 단일성이 깨진다)
   ════════════════════════════════════════════════════════════════════ */
function buildAppendixA() {
  var meta = Deck.data.meta || {};
  if (meta.appendixA === false) return [];
  if (!Deck.vdata) return [];

  var cv   = meta.canvas || DEF_CANVAS;
  var sx   = Math.round(cv.w * 0.07);
  var sw   = cv.w - sx * 2;
  var by   = Math.round(cv.h * 0.208);
  var bh   = Math.round(cv.h * 0.893) - by;
  var K    = meta.appendixK || 0.85;                /* 부록 표는 조금 조밀하게 (실측: 2단 0.85 → 11장) */
  var COLS = meta.appendixCols || 2;                /* 2단 — 1단으로 하면 장수가 배로 는다 */
  var gap  = Math.round(cv.w * 0.024);
  var colW = Math.round((sw - gap * (COLS - 1)) / COLS);

  var ord = Deck.vdata.order || { static: [], dynamic: [] };
  var ids = ord.static.concat(ord.dynamic).filter(function (id) {
    var r = Deck.vdata.records[id]; return r && r.computed && r.computed.length;
  });

  /* ★ 실제 렌더 높이를 재서 나눈다 — "한 쪽에 22행" 같은 어림짐작을 쓰지 않는다.
     (어림값은 데이터가 늘면 조용히 틀리고, 그대로 잘린 채 인쇄된다) */
  var probe = el('div', 'canvas');
  probe.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden';
  probe.style.width  = cv.w + 'px';
  probe.style.height = cv.h + 'px';
  probe.style.setProperty('--uu', (cv.w / 100) + 'px');
  var box = el('div', 'el');
  box.style.cssText = 'position:absolute;left:0;top:0;height:auto;width:' + colW + 'px';
  box.style.setProperty('--k', K);
  probe.appendChild(box);
  document.body.appendChild(probe);

  function colHeight(list) {
    box.innerHTML = list.map(partHtml).join('');
    return box.scrollHeight;
  }

  /* ★ 한 record 가 한 칸보다 길 수 있다(SR2b = 20행). 그때는 축소가 아니라
     행 단위로 잘라 다음 칸에 "(계속)"으로 이어야 한다.
     축소로 밀어붙이면 하한에 걸려 결국 잘린 채 인쇄된다(실측). */
  var LIMIT = bh - 8;
  var pages = [], page = [], col = [];
  function flushCol() { page.push(col); col = []; if (page.length >= COLS) { pages.push(page); page = []; } }

  ids.forEach(function (id) {
    var r = Deck.vdata.records[id];
    var i = 0;
    while (i < r.computed.length) {
      var take = 0;
      for (var t = 1; i + t <= r.computed.length; t++) {
        if (colHeight(col.concat([{ id: id, from: i, to: i + t, cont: i > 0 }])) > LIMIT) break;
        take = t;
      }
      if (take === 0) {
        if (col.length) { flushCol(); continue; }   /* 이 칸은 꽉 찼다 — 다음 칸에서 다시 */
        take = 1;                                   /* 빈 칸인데 1행도 안 들어가면 그냥 싣는다 */
      }
      col.push({ id: id, from: i, to: i + take, cont: i > 0 });
      i += take;
      if (i < r.computed.length) flushCol();        /* 남았다는 건 칸이 찼다는 뜻 */
    }
  });
  if (col.length) flushCol();
  if (page.length) pages.push(page);
  probe.remove();

  return pages.map(function (cols, i) {
    var els = [
      { id: 'k', type: 'text', x: sx, y: Math.round(cv.h * 0.082), w: sw, h: Math.round(cv.h * 0.038),
        html: '<div class="kicker">Appendix A · ' + (i + 1) + ' / ' + pages.length + '</div>' },
      { id: 't', type: 'text', x: sx, y: Math.round(cv.h * 0.118), w: sw, h: Math.round(cv.h * 0.078),
        html: '<h2 class="title">검증 결과 전체 상세</h2>' },
    ];
    cols.forEach(function (parts, c) {
      if (!parts.length) return;
      els.push({ id: 'v' + (c + 1), type: 'vtable', kind: 'group', parts: parts,
                 x: sx + c * (colW + gap), y: by, w: colW, h: bh, k: K });
    });
    return {
      id: 'apxA' + (i + 1), name: '부록 A — 검증 상세 (' + (i + 1) + '/' + pages.length + ')',
      apx: true, generated: true, els: els,
      note: i === 0 ? '※ 오차 = (STRIX − 참조해) / 참조해. 판정 기준은 벤치마크별로 사전에 정한 허용치입니다.' : '',
    };
  });
}

/* ══════════════════════════════════════════════════════════════════════
   3.5 챕터 · 목차 — 번호와 목차는 "슬라이드 목록에서 파생"된다
       ⚠ 목차를 data/deck.js 에 손으로 써두면, 장을 추가·이동·삭제한 순간
         조용히 낡는다(부록 A 를 records 에서 매번 다시 만드는 것과 같은 이유).
   ════════════════════════════════════════════════════════════════════ */

/** 슬라이드 목록을 훑어 각 장에 번호(_no)·챕터명(_chT)·그룹명(_grpT)을 매기고
 *  목차 줄 목록(Deck.toc)을 만든다. 데이터에는 소속(ch/grp)만 적으면 된다. */
function indexChapters() {
  var meta = Deck.data.meta || {};
  var chs  = meta.chapters || [];
  var all  = Deck.data.slides || [];
  all.forEach(function (s) { s._no = null; s._chT = null; s._grpT = null; });
  Deck.toc = null;
  if (!chs.length) return;

  var map = {};
  chs.forEach(function (c, i) {
    c._n = (c.no !== undefined ? c.no : i + 1); c._i = 0;
    map[c.id] = c;
    (c.groups || []).forEach(function (g, j) {
      g._n = (g.no !== undefined ? g.no : j + 1); g._i = 0; g._ch = c;
      map[c.id + '/' + g.id] = g;
    });
  });

  var lines = [], seenC = {}, seenG = {};
  all.forEach(function (s) {
    if (!s.ch) return;                       /* 표지·목차·맺음·부록은 번호 없음 */
    var c = map[s.ch]; if (!c) return;
    if (!seenC[c.id]) {
      seenC[c.id] = 1;
      lines.push({ lvl: 0, no: String(c._n), t: c.title, id: null, brk: true });
    }
    var g = s.grp ? map[c.id + '/' + s.grp] : null;

    if (g && !seenG[c.id + '/' + g.id]) {
      seenG[c.id + '/' + g.id] = 1;
      var gno = c._n + '.' + g._n;
      /* 그룹 첫 장이 "그룹 개요"면 그 장이 곧 목차의 그룹 줄이 된다 */
      lines.push({ lvl: 1, no: gno, t: g.title, id: s.grpOpen ? s.id : null, brk: true });
      if (s.grpOpen) { s._no = gno; s._chT = c.title; s._grpT = g.title; return; }
    }

    var no = g ? (c._n + '.' + g._n + '.' + (++g._i)) : (c._n + '.' + (++c._i));
    s._no   = no;
    s._chT  = c.title;
    s._grpT = g ? g.title : null;
    lines.push({ lvl: g ? 2 : 1, no: no, t: (s.toc || s.name || s.id), id: s.id });
  });
  Deck.toc = lines;
}

/** 목차 슬라이드 생성. 여러 단(段)에 나눠 담되 챕터·그룹 묶음은 쪼개지 않는다.
 *  한 장에 안 들어가면 --k 를 낮춰가며 맞추고, 그래도 안 되면 소리 내어 알린다. */
function buildToc() {
  var meta = Deck.data.meta || {};
  if (!meta.toc || !Deck.toc || !Deck.toc.length) return null;
  var cfg  = (typeof meta.toc === 'object') ? meta.toc : {};
  var cv   = meta.canvas || DEF_CANVAS;
  var sx   = Math.round(cv.w * 0.07), sw = cv.w - sx * 2;
  var by   = Math.round(cv.h * 0.235);
  var bh   = Math.round(cv.h * 0.884) - by;
  var COLS = cfg.cols || 3;
  var gap  = Math.round(cv.w * 0.026);
  var colW = Math.round((sw - gap * (COLS - 1)) / COLS);

  function lineHtml(L) {
    return '<div class="tc tc-l' + L.lvl + '"' + (L.id ? ' data-go="' + esc(L.id) + '"' : '') + '>'
         + '<span class="tc-no">' + esc(L.no) + '</span>'
         + '<span class="tc-t">'  + esc(L.t)  + '</span></div>';
  }
  function listHtml(list) { return '<div class="toclist">' + list.map(lineHtml).join('') + '</div>'; }

  /* 묶음 나누기 — 챕터 머리줄과 그룹 머리줄에서만 끊는다.
     (줄 단위로 끊으면 "3. 정확도 검증" 만 한 단 바닥에 홀로 남는다) */
  var blocks = [], cur = null;
  Deck.toc.forEach(function (L) {
    if (L.brk) { if (cur && cur.length) blocks.push(cur); cur = []; }
    if (!cur) cur = [];
    cur.push(L);
  });
  if (cur && cur.length) blocks.push(cur);
  /* 챕터 머리줄만 있는 묶음은 뒤 묶음에 붙인다 */
  for (var b = blocks.length - 2; b >= 0; b--) {
    if (blocks[b].length === 1 && blocks[b][0].lvl === 0) {
      blocks[b + 1] = blocks[b].concat(blocks[b + 1]);
      blocks.splice(b, 1);
    }
  }

  var probe = el('div', 'canvas');
  probe.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden';
  probe.style.width  = cv.w + 'px';
  probe.style.height = cv.h + 'px';
  probe.style.setProperty('--uu', (cv.w / 100) + 'px');
  var box = el('div', 'el');
  box.style.cssText = 'position:absolute;left:0;top:0;height:auto;width:' + colW + 'px';
  probe.appendChild(box);
  document.body.appendChild(probe);
  function H(list, K) {
    box.style.setProperty('--k', K);
    box.innerHTML = listHtml(list);
    return box.scrollHeight;
  }

  function fill(K, loose) {
    var cols = [[]];
    for (var i = 0; i < blocks.length; i++) {
      var units = loose ? blocks[i].map(function (L) { return [L]; }) : [blocks[i]];
      for (var u = 0; u < units.length; u++) {
        var last = cols[cols.length - 1];
        var trial = last.concat(units[u]);
        if (H(trial, K) <= bh) { cols[cols.length - 1] = trial; continue; }
        if (!last.length) { cols[cols.length - 1] = trial; continue; }  /* 빈 단인데도 넘치면 일단 싣는다 */
        if (cols.length >= COLS) return null;
        cols.push(units[u].slice());
      }
    }
    return cols;
  }

  var K = cfg.k || 1, cols = null, tight = false;
  for (var t = 0; t < 12; t++) {
    cols = fill(K, false);
    if (cols) break;
    K = Math.round((K - 0.05) * 100) / 100;
    if (K < 0.55) break;
  }
  if (!cols) {                       /* 묶음 유지로는 안 된다 — 줄 단위로 쪼갠다 */
    tight = true;
    K = cfg.k || 1;
    for (var t2 = 0; t2 < 12; t2++) {
      cols = fill(K, true);
      if (cols) break;
      K = Math.round((K - 0.05) * 100) / 100;
      if (K < 0.55) break;
    }
  }
  probe.remove();
  if (!cols) { console.warn('[deck] 목차가 한 장에 들어가지 않습니다 — cols/k 를 조정하세요'); return null; }
  if (tight)  console.warn('[deck] 목차: 챕터 묶음이 단 경계에서 나뉘었습니다 (k=' + K + ')');
  Deck.tocFit = { k: K, cols: cols.length, lines: Deck.toc.length, split: tight };

  var els = [
    { id: 'k', type: 'text', x: sx, y: Math.round(cv.h * 0.082), w: sw, h: Math.round(cv.h * 0.038),
      html: '<div class="kicker">' + esc(cfg.kicker || 'Contents') + '</div>' },
    { id: 't', type: 'text', x: sx, y: Math.round(cv.h * 0.118), w: sw, h: Math.round(cv.h * 0.078),
      html: '<h2 class="title">' + esc(cfg.title || '목차') + '</h2>' },
  ];
  cols.forEach(function (list, i) {
    if (!list.length) return;
    els.push({ id: 'c' + (i + 1), type: 'text', x: sx + i * (colW + gap), y: by, w: colW, h: bh,
               k: K, html: listHtml(list) });
  });
  return { id: cfg.id || 'toc', name: cfg.title || '목차', generated: true, els: els,
           note: cfg.note || '' };
}

/* ══════════════════════════════════════════════════════════════════════
   4. 전체 렌더 · 화면 맞춤
   ════════════════════════════════════════════════════════════════════ */
function allSlideDefs() {
  indexChapters();
  var defs = (Deck.data.slides || []).slice();

  var toc = buildToc();
  if (toc) {
    var after = (typeof (Deck.data.meta || {}).toc === 'object') ? (Deck.data.meta.toc.after || '') : '';
    var ti = after ? defs.findIndex(function (s) { return s.id === after; }) : 0;
    if (ti < 0) ti = 0;
    defs = defs.slice(0, ti + 1).concat([toc], defs.slice(ti + 1));
  }

  var apxA = buildAppendixA();
  if (!apxA.length) return defs;
  /* 부록 A 는 "부록 표지" 바로 뒤에 들어간다(없으면 맨 뒤) */
  var at = defs.findIndex(function (s) { return s.apxCover; });
  if (at < 0) at = defs.length - 1;
  return defs.slice(0, at + 1).concat(apxA, defs.slice(at + 1));
}

Deck.render = function () {
  var stage = $('#stage');
  stage.innerHTML = '';
  var defs = allSlideDefs();
  Deck.slides = defs.map(function (def, i) {
    var node = renderSlide(def, i, defs.length);
    stage.appendChild(node);
    return { def: def, node: node };
  });
  markAppendix();
  Deck.ovBuilt = false;
  Deck.autofitGenerated();
  Deck.fitImages();
  Deck.fit();
  Deck.hooks.afterRender.forEach(function (f) { f(); });
};

Deck.fit = function () {
  var meta = Deck.data.meta || {};
  var cv = meta.canvas || DEF_CANVAS;
  /* 화면이 아니라 "무대(#stage)" 크기에 맞춘다 — 편집 모드에서 툴바·인스펙터가
     무대를 줄이면 캔버스도 따라 줄어 겹치지 않는다(발표 때는 무대 = 화면 전체). */
  var st = $('#stage');
  var vw = st ? st.clientWidth  : window.innerWidth;
  var vh = st ? st.clientHeight : window.innerHeight;
  var k = Math.min(vw / cv.w, vh / cv.h);
  Deck.scale = k;
  Deck.slides.forEach(function (s) { s.node.style.transform = 'scale(' + k + ')'; });
};

/* ══════════════════════════════════════════════════════════════════════
   5. 넘김 · 개요 · 암전
   ════════════════════════════════════════════════════════════════════ */
Deck.go = function (i, push) {
  if (!Deck.slides.length) return;
  i = Math.max(0, Math.min(Deck.slides.length - 1, i));
  Deck.slides.forEach(function (s, n) { s.node.classList.toggle('on', n === i); });
  Deck.cur = i;

  var frac = Deck.slides.length > 1 ? (i / (Deck.slides.length - 1)) : 1;
  var fill = $('#bar .fill'); if (fill) fill.style.width = (frac * 100) + '%';
  var pgEl = $('#pg'); if (pgEl) pgEl.textContent = (i + 1) + ' / ' + Deck.slides.length;
  if (push !== false) history.replaceState(null, '', '#' + Deck.slides[i].def.id);
  updateOverviewCurrent();
  Deck.hooks.afterGo.forEach(function (f) { f(i); });
};
Deck.next = function () { Deck.go(Deck.cur + 1); };
Deck.prev = function () { Deck.go(Deck.cur - 1); };

function markAppendix() {
  var bar = $('#bar'); if (!bar) return;
  var old = bar.querySelector('.apxmark'); if (old) old.remove();
  var first = Deck.slides.findIndex(function (s) { return s.def.apx; });
  if (first < 0 || Deck.slides.length < 2) return;
  var m = el('div', 'apxmark');
  m.style.left = ((first / (Deck.slides.length - 1)) * 100) + '%';
  bar.appendChild(m);
}

/* 개요 — 실제 슬라이드 축소판(썸네일). 처음 열 때 한 번만 만든다. */
function buildOverview() {
  var g = $('#ov .ovgrid'); if (!g) return;
  g.innerHTML = '';
  var meta = Deck.data.meta || {}, cv = meta.canvas || DEF_CANVAS;
  var sepDone = false;

  Deck.slides.forEach(function (s, i) {
    if (s.def.apx && !sepDone) {
      sepDone = true;
      var sep = el('div', 'ovsep'); sep.textContent = '부록 — 참고자료'; g.appendChild(sep);
    }
    var c = el('div', 'ovc' + (s.def.apx ? ' apx' : '') + (s.def.generated ? ' gen' : ''));
    c.dataset.i = i;
    c.dataset.sid = s.def.id;        /* 편집기가 이 카드로 슬라이드를 다룬다 */

    var th = el('div', 'ovthumb');
    th.style.aspectRatio = cv.w + '/' + cv.h;
    var clone = s.node.cloneNode(true);
    clone.classList.remove('on');
    clone.style.transform = '';         /* 폭이 정해진 뒤 계산한다 */
    th.appendChild(clone);

    var mt = el('div', 'ovmeta');
    mt.innerHTML = '<span class="n">' + (i + 1) + '</span>'
                 + '<span class="t">' + esc(s.def.name || s.def.id) + '</span>';
    c.appendChild(th); c.appendChild(mt);
    c.addEventListener('click', function () { Deck.go(i); toggleOverview(false); });
    g.appendChild(c);
  });

  /* 썸네일 스케일 — 실제 폭이 정해진 뒤에 한 번에 */
  requestAnimationFrame(function () {
    g.querySelectorAll('.ovthumb').forEach(function (th) {
      var k = th.clientWidth / cv.w;
      var cn = th.querySelector('.canvas');
      if (cn) cn.style.transform = 'scale(' + k + ')';
    });
  });
  Deck.ovBuilt = true;
}
function updateOverviewCurrent() {
  document.querySelectorAll('#ov .ovc').forEach(function (c) {
    c.classList.toggle('cur', parseInt(c.dataset.i, 10) === Deck.cur);
  });
}
function toggleOverview(on) {
  var ov = $('#ov'); if (!ov) return;
  if (on === undefined) on = !ov.classList.contains('on');
  if (on && !Deck.ovBuilt) buildOverview();
  ov.classList.toggle('on', on);
  if (on) updateOverviewCurrent();
}
Deck.toggleOverview = toggleOverview;

function toggleBlack(on) {
  var b = $('#black'); if (!b) return;
  if (on === undefined) on = !b.classList.contains('on');
  b.classList.toggle('on', on);
}

/* ── 키 · 클릭 · 터치 ─────────────────────────────────────────────────── */
function initNav() {
  document.addEventListener('keydown', function (e) {
    if (Deck.editing && Deck.editing()) return;      /* 편집 중이면 편집기가 가져간다 */
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    var k = e.key;
    if ($('#black').classList.contains('on')) { toggleBlack(false); e.preventDefault(); return; }

    if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'Enter' ||
        k === 'PageDown'   || k === 'Spacebar') { Deck.next(); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' ||
             k === 'Backspace') { Deck.prev(); e.preventDefault(); }
    else if (k === 'Home') { Deck.go(0); e.preventDefault(); }
    else if (k === 'End')  { Deck.go(Deck.slides.length - 1); e.preventDefault(); }
    else if (k === 'o' || k === 'O' || k === 'ㅐ' || k === 'Escape') { toggleOverview(); e.preventDefault(); }
    else if (k === 'b' || k === 'B' || k === 'ㅠ') { toggleBlack(); e.preventDefault(); }
    else if (k === 'f' || k === 'F' || k === 'ㄹ') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
      e.preventDefault();
    }
    else if (k === 'p' || k === 'P' || k === 'ㅔ') { window.print(); e.preventDefault(); }
  });

  $('#stage').addEventListener('click', function (e) {
    if (Deck.editing && Deck.editing()) return;
    if ($('#ov').classList.contains('on')) return;
    /* 목차 항목을 누르면 그 장으로 (53장짜리 덱에서 실제로 쓸모가 있다) */
    var go = e.target.closest('[data-go]');
    if (go) {
      var gi = Deck.slides.findIndex(function (s) { return s.def.id === go.getAttribute('data-go'); });
      if (gi >= 0) { Deck.go(gi); return; }
    }
    if (e.target.closest('a,button,input,select,textarea')) return;
    /* 일반 화면 클릭은 장을 넘기지 않는다. 목차[data-go]와 명시적 UI만 클릭 이동을 허용한다. */
  });

  var tx = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 60) { dx < 0 ? Deck.next() : Deck.prev(); }
  }, { passive: true });

  window.addEventListener('resize', function () { Deck.fit(); });

  setTimeout(function () { var h = $('#hint'); if (h) h.style.opacity = '0'; }, 8000);
}

/* ══════════════════════════════════════════════════════════════════════
   5.5 요소 자동맞춤 — 내용이 상자를 넘으면 그 요소의 --k 만 줄여 맞춘다.
       ★ 옛 덱은 장 전체를 zoom 으로 줄이고 남는 넘침은 overflow:hidden 으로
         "가렸다"(S16 의 SR2 상세표가 실제로 아래 행이 잘린 채 나가고 있었다).
         여기서는 가리지 않고 줄이며, 바닥(MIN_K)에 닿으면 소리 내어 알린다.
   ════════════════════════════════════════════════════════════════════ */
var MIN_K = 0.6;

Deck.fitNode = function (n) {
  var inner = n.firstElementChild; if (!inner) return null;
  var k0 = parseFloat(n.style.getPropertyValue('--k')) || 1;
  var box = n.clientHeight; if (!box) return null;

  function over(k) {
    n.style.setProperty('--k', k);
    var fs = parseFloat(getComputedStyle(inner).fontSize) || 16;
    return inner.scrollHeight - box - Math.max(2, fs * 0.15);
  }
  if (over(k0) <= 0) { n.style.setProperty('--k', k0); return null; }

  /* ⚠ 축소는 선형이 아니다 — 글자가 작아지면 줄바꿈이 달라져 높이가 계단식으로 준다.
     한 번만 계산하면 잔여 넘침이 남는다(실측). 수렴할 때까지 반복한다. */
  var k = k0;
  for (var i = 0; i < 6; i++) {
    var need = inner.scrollHeight;
    var next = Math.max(MIN_K, k * (box - 1) / need);
    if (next >= k - 1e-4) { k = Math.max(MIN_K, k - 0.02); } else { k = next; }
    if (k <= MIN_K + 1e-9) { k = MIN_K; break; }
    if (over(k) <= 0) break;
  }
  var rest = over(k);
  return { id: n.dataset.id, from: k0, to: Math.round(k * 1e4) / 1e4,
           floored: k <= MIN_K + 1e-9, left: Math.max(0, Math.round(rest)) };
};

/** 자동 생성 슬라이드(부록 A)만 매번 맞춘다. 사용자 슬라이드는 data/deck.js 의 k 를 존중한다. */
Deck.autofitGenerated = function () {
  var hit = [];
  Deck.slides.forEach(function (s) {
    if (!s.def.generated) return;
    var wasOn = s.node.classList.contains('on');
    if (!wasOn) s.node.classList.add('on');
    s.node.querySelectorAll('.el').forEach(function (n) {
      var r = Deck.fitNode(n); if (r) { r.slide = s.def.id; hit.push(r); }
    });
    if (!wasOn) s.node.classList.remove('on');
  });
  var floored = hit.filter(function (r) { return r.floored; });
  if (floored.length) console.warn('[deck] 부록 자동축소 하한 도달 — 내용을 줄여야 합니다:', floored);
  return hit;
};

/* ══════════════════════════════════════════════════════════════════════
   6. 넘침 검사 — 요소 내용이 자기 상자를 넘는지
      편집기(빨간 표시)와 검수 스크립트가 같은 함수를 쓴다.
   ════════════════════════════════════════════════════════════════════ */
Deck.checkOverflow = function (tol, only) {
  var base = (tol === undefined) ? 2 : tol;
  var meta = Deck.data.meta || {}, cv = meta.canvas || DEF_CANVAS;
  var out = [];
  Deck.slides.forEach(function (s, i) {
    if (only !== undefined && only !== null && i !== only) return;   /* 편집기는 보고 있는 장만 본다 */
    var wasOn = s.node.classList.contains('on');
    if (!wasOn) s.node.classList.add('on');
    s.node.querySelectorAll('.el').forEach(function (n) {
      var inner = n.firstElementChild;
      var oh = inner ? inner.scrollHeight : n.scrollHeight;
      var ow = inner ? inner.scrollWidth  : n.scrollWidth;
      /* ⚠ 큰 글자는 line-height 를 1 로 잡으면 글자상자가 라인박스를 정상적으로 넘는다
         (원본 덱에서도 그랬다). 그래서 허용오차를 글자 크기에 비례시킨다 —
         고정 2px 로 두면 표지 제목 같은 정상 상태가 매번 "넘침"으로 잡힌다. */
      var fs  = parseFloat(getComputedStyle(inner || n).fontSize) || 16;
      var tol = Math.max(base, fs * 0.15);
      var dy = oh - n.clientHeight, dx = ow - n.clientWidth;
      var x = parseFloat(n.style.left) || 0, y = parseFloat(n.style.top) || 0;
      var w = parseFloat(n.style.width) || 0, h = parseFloat(n.style.height) || 0;
      var reasons = [];
      if (dy > tol) reasons.push('내용이 상자보다 ' + Math.round(dy) + 'px 높음');
      if (dx > tol) reasons.push('내용이 상자보다 ' + Math.round(dx) + 'px 넓음');
      if (y < -tol || x < -tol) reasons.push('캔버스 위/왼쪽으로 벗어남');
      if (y + h > cv.h + tol || x + w > cv.w + tol) reasons.push('캔버스 아래/오른쪽으로 벗어남');
      if (reasons.length) out.push({ slide: i + 1, id: s.def.id, name: s.def.name, el: n.dataset.id, why: reasons });
    });
    if (!wasOn) s.node.classList.remove('on');
  });
  return out;
};

/* ══════════════════════════════════════════════════════════════════════
   7. 시작
   ════════════════════════════════════════════════════════════════════ */
function fatal(msg, how) {
  var f = $('#fatal');
  f.querySelector('.box').innerHTML = '<h1>덱을 열 수 없습니다</h1><p>' + msg + '</p>'
    + (how ? '<p style="margin-top:12px;color:#949aa4">' + how + '</p>' : '');
  f.classList.add('on');
}

Deck.boot = function () {
  Deck.data  = global.__DECK__ || null;
  Deck.vdata = global.__DECK_DATA__ || null;

  if (!Deck.data || !Deck.data.slides || !Deck.data.slides.length) {
    fatal('발표 내용 파일(<code>data/deck.js</code>)을 읽지 못했습니다.',
          'frontend 폴더에서 <code>npm run deck:convert</code> 를 실행하면 생성됩니다.');
    return;
  }
  var meta = Deck.data.meta || {};
  if (meta.title) document.title = meta.title;
  if (meta.printTheme === 'screen') document.body.classList.add('print-screen');

  Deck.render();
  initNav();

  var start = 0;
  if (location.hash) {
    var idx = Deck.slides.findIndex(function (s) { return '#' + s.def.id === location.hash; });
    if (idx >= 0) start = idx;
  }
  Deck.go(start, false);

  /* 인쇄 직전에 모든 장이 보이도록 (CSS 가 처리하지만 개요·암전은 닫아둔다) */
  window.addEventListener('beforeprint', function () { toggleOverview(false); toggleBlack(false); });
};

})(window);
