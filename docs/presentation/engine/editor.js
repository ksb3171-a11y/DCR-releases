/* ══════════════════════════════════════════════════════════════════════════
   발표덱 편집기 — 화면에서 직접 고치는 도구 (재사용 자산)

   이 파일은 "덱을 고치는 일"만 합니다. 그리고 넘기는 일은 engine/deck.js 입니다.
   편집 결과는 data/deck.js 에 그대로 저장됩니다(= 다음에 열면 그 상태).

   ★ 켜지는 조건 — file:// 로 열었을 때, 또는 주소에 ?edit=1 이 있을 때.
     홈페이지(https)에 올린 배포본에서는 아예 켜지지 않습니다.

   ★ 편집 잠금 (이유가 있는 제약입니다. 풀지 마세요)
     · type:'vtable' 검증 표 · [data-bind] 숫자 → 내용 편집 금지
       숫자는 frontend/verification/records/*.json 에서만 옵니다. 여기서 고치면
       "원천에서 가져온다"는 원칙이 그 자리에서 무너집니다. (이동·크기는 됩니다)
     · 목차 · 부록 A → 통째로 편집 금지. 슬라이드 목록과 records 에서 매번 다시
       만들어지므로, 고쳐봐야 다음 렌더에 사라집니다.

   키
     E          편집 모드 켜기/끄기          Esc      선택 해제 / 텍스트 편집 끝
     클릭        선택       Shift+클릭 다중    빈 곳 드래그  범위 선택
     더블클릭     텍스트 편집                  Delete   삭제
     ←↑→↓       1px 이동 (Shift 10px)        Ctrl+D   복제
     Ctrl+Z / Ctrl+Shift+Z   되돌리기/다시     Ctrl+S   저장
     PageUp/PageDown         앞뒤 슬라이드
   ════════════════════════════════════════════════════════════════════════ */
(function (global) {
'use strict';

var Deck = global.Deck;
if (!Deck) return;

/* 내 PC 에서 열었을 때만 켠다 — 파일로 직접, 또는 로컬 서버, 또는 ?edit=1.
   홈페이지(strix-build.com)에 올린 배포본에서는 어느 조건에도 걸리지 않는다. */
var ENABLED = (location.protocol === 'file:')
           || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)
           || /[?&]edit=1/.test(location.search);

var ED = {
  on: false, sel: [], text: null,
  undo: [], redo: [], dirty: false,
  fileHandle: null, fileHandleLoaded: false, saving: false,
  dirHandle: null, dirHandleLoaded: false,
  drag: null,
};

/* deck.js 의 initNav 가 이 함수로 "편집 중인가"를 묻는다. 꺼져 있어도 있어야 한다. */
Deck.editing = function () { return ED.on; };
if (!ENABLED) return;

var UNDO_MAX  = 50;
var SNAP_TOL  = 6;      /* 캔버스 px */
var MIN_SIZE  = 24;
var DRAFT_KEY = 'strixdeck.draft.v1';

/* ══════════════════════════════════════════════════════════════════════
   0. 유틸
   ════════════════════════════════════════════════════════════════════ */
function el(tag, cls, txt) {
  var d = document.createElement(tag);
  if (cls) d.className = cls;
  if (txt !== undefined) d.textContent = txt;
  return d;
}
function $(s, r) { return (r || document).querySelector(s); }
function canvasSize() { var m = Deck.data.meta || {}; return m.canvas || { w: 1600, h: 900 }; }
function curSlide()   { return Deck.slides[Deck.cur] || null; }
function curDef()     { var s = curSlide(); return s ? s.def : null; }
function curNode()    { var s = curSlide(); return s ? s.node : null; }

/** 화면 좌표 → 캔버스 좌표 */
function toCanvas(ev) {
  var n = curNode(); if (!n) return { x: 0, y: 0 };
  var r = n.getBoundingClientRect(), k = Deck.scale || 1;
  return { x: (ev.clientX - r.left) / k, y: (ev.clientY - r.top) / k };
}
/** 캔버스 사각형 → 화면 사각형 */
function toScreen(x, y, w, h) {
  var n = curNode(); if (!n) return null;
  var r = n.getBoundingClientRect(), k = Deck.scale || 1;
  return { l: r.left + x * k, t: r.top + y * k, w: w * k, h: h * k };
}

function uid(prefix, taken) {
  var i = 1; while (taken.indexOf(prefix + i) >= 0) i++;
  return prefix + i;
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }

function toast(msg) {
  var t = $('#edtoast'); if (!t) return;
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { t.classList.remove('on'); }, 2200);
}
function toastOff() {
  var t = $('#edtoast'); if (!t) return;
  clearTimeout(toast._t); t.classList.remove('on');
}

/* ══════════════════════════════════════════════════════════════════════
   1. 편집 가능 여부 — 잠금은 전부 여기 한 곳에서 판정한다
   ════════════════════════════════════════════════════════════════════ */
/** 이 슬라이드를 손댈 수 있는가 (목차·부록 A 는 매번 다시 만들어진다) */
function slideEditable(def) { return !!def && !def.generated; }

/** 이 요소를 고를 수 있는가 (각주·쪽번호는 엔진이 그린다) */
function selectable(node) {
  return node && node.classList.contains('el') && node.dataset.role !== 'foot' && !!node._def;
}
/** 이 요소의 "내용"을 고칠 수 있는가 — 위치·크기와는 별개다.
 *  ★ 검증 숫자가 박힌 문장도 고칠 수 있다. 잠가야 할 것은 **숫자 자체**이지 그 숫자가
 *    들어간 문장이 아니다. 숫자는 [data-bind] 조각 단위로 따로 잠근다(enterText). */
function contentEditableEl(node) {
  var e = node && node._def; if (!e) return false;
  return e.type === 'text';                                  /* 검증 표·이미지는 내용 편집 대상이 아니다 */
}
function lockReason(node) {
  var e = node && node._def; if (!e) return '';
  if (e.type === 'vtable') return '검증 표 — 숫자는 records/*.json 에서만 옵니다 (이동·크기는 됩니다)';
  return '';
}
/** 잠금은 아니지만 알아야 하는 것 */
function bindNote(node) {
  var n = node ? node.querySelectorAll('[data-bind]').length : 0;
  return n ? ('문장 안에 검증 숫자 ' + n + '개 — 글은 고칠 수 있지만 숫자는 records 에서 옵니다') : '';
}

/** 편집 중에 붙인 표시를 뺀, "저장될 모습"의 HTML.
 *  ⚠ 이걸 안 거치고 innerHTML 을 그대로 비교하면, 검증 숫자에 붙여둔
 *    contenteditable="false" 때문에 **아무것도 안 고쳤는데 "바뀌었다"** 로 잡힌다.
 *  ★ 그리고 [data-bind] 안의 글자는 원천(def.html) 그대로 되돌린다 —
 *    화면에 보이는 값은 records 에서 채운 것이라, 그대로 저장하면 숫자를 파일에 굽는 셈이 된다. */
function editedHtml(node, orig) {
  var c = node.cloneNode(true);
  c.querySelectorAll('[contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });
  if (orig) c.querySelectorAll('[data-bind]').forEach(function (n) {
    var k = n.getAttribute('data-bind');
    if (orig[k] !== undefined) n.innerHTML = orig[k];
  });
  return c.innerHTML;
}

/* ══════════════════════════════════════════════════════════════════════
   2. 되돌리기 — 조작 직전에 통째로 찍는다
      데이터가 100KB 대라 깊은 복사 비용이 문제되지 않는다.
      부분 되돌리기(diff)는 버그가 조용히 숨는 쪽이라 택하지 않았다.
   ════════════════════════════════════════════════════════════════════ */
function dump() {
  /* 엔진이 렌더 중에 붙이는 파생 필드(_no·_chT…)는 저장하지 않는다 */
  return JSON.stringify(Deck.data, function (k, v) { return k.charAt(0) === '_' ? undefined : v; }, 1);
}
function snap() {
  ED.undo.push(dump());
  if (ED.undo.length > UNDO_MAX) ED.undo.shift();
  ED.redo.length = 0;
  setDirty(true);
}
function restore(json) {
  var sid = curDef() ? curDef().id : null;
  Deck.data = JSON.parse(json);
  Deck.render();
  var i = sid ? Deck.slides.findIndex(function (s) { return s.def.id === sid; }) : 0;
  Deck.go(i < 0 ? 0 : i, false);
  ED.sel = []; ED.text = null;
  refresh();
}
function undo() {
  if (!ED.undo.length) return;
  ED.redo.push(dump());
  restore(ED.undo.pop());
  setDirty(true);
}
function redo() {
  if (!ED.redo.length) return;
  ED.undo.push(dump());
  restore(ED.redo.pop());
  setDirty(true);
}

var draftTimer = null;
function setDirty(v) {
  ED.dirty = v;
  var s = $('#edstat');
  if (s) s.classList.toggle('dirty', v);
  renderBarState();
  if (v) {                                   /* 새로고침·사고를 견디도록 초안을 남긴다 */
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () {
      try { localStorage.setItem(DRAFT_KEY, dump()); } catch (err) { /* 용량 초과 — 무시 */ }
    }, 800);
  }
}

/* ══════════════════════════════════════════════════════════════════════
   3. 선택 · 오버레이(핸들 · 안내선)
   ════════════════════════════════════════════════════════════════════ */
var DIRS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function select(nodes, additive) {
  var next = additive ? ED.sel.slice() : [];
  (nodes || []).forEach(function (n) {
    if (!selectable(n)) return;
    var i = next.indexOf(n);
    if (i >= 0) { if (additive) next.splice(i, 1); }
    else next.push(n);
  });
  ED.sel = next;
  refresh();
}
function selDefs() { return ED.sel.map(function (n) { return n._def; }); }

function applyGeom(node, e) {
  node.style.left = e.x + 'px';
  node.style.top = e.y + 'px';
  node.style.width = e.w + 'px';
  node.style.height = e.h + 'px';
  if (e.type === 'image' && Deck.fitImageFrame) Deck.fitImageFrame(node, e);
}

/** 넘침 표시 — ⚠ 보고 있는 장만 본다.
 *  전체(67장)를 재면 슬라이드마다 .on 을 껐다 켜며 강제 레이아웃이 일어나
 *  드래그 한 프레임마다 그걸 하게 된다(실측 전에 이미 자명하다). 전체 검사는 버튼으로 따로. */
function recomputeOverflow() {
  ED.over = {};
  (Deck.checkOverflow(2, Deck.cur) || []).forEach(function (o) { ED.over[o.el] = 1; });
}

/** 오버레이(선택 테두리·핸들)를 현재 상태에 맞춰 다시 그린다 */
function drawOverlay() {
  var ov = $('#edov'); if (!ov) return;
  ov.innerHTML = '';
  if (!ED.on || !ED.sel.length) return;
  var over = ED.over || {};

  ED.sel.forEach(function (n, i) {
    var r = n.getBoundingClientRect();
    var box = el('div', 'edsel' + (ED.sel.length > 1 ? ' multi' : '')
                 + (over[n.dataset.id] ? ' over' : '')
                 + (lockReason(n) ? ' lock' : ''));
    box.style.left = r.left + 'px';  box.style.top = r.top + 'px';
    box.style.width = r.width + 'px'; box.style.height = r.height + 'px';
    ov.appendChild(box);
    if (ED.sel.length !== 1 || ED.text) return;
    DIRS.forEach(function (d) {
      var h = el('div', 'edh');
      h.dataset.d = d;
      var fx = (d.indexOf('w') >= 0) ? 0 : (d.indexOf('e') >= 0) ? 1 : 0.5;
      var fy = (d.indexOf('n') >= 0) ? 0 : (d.indexOf('s') >= 0) ? 1 : 0.5;
      h.style.left = (r.left + r.width * fx) + 'px';
      h.style.top = (r.top + r.height * fy) + 'px';
      ov.appendChild(h);
    });
  });
}
function drawGuides(gx, gy) {
  var ov = $('#edov'); if (!ov) return;
  ov.querySelectorAll('.edg').forEach(function (n) { n.remove(); });
  var node = curNode(); if (!node) return;
  var r = node.getBoundingClientRect(), k = Deck.scale || 1;
  (gx || []).forEach(function (x) {
    var g = el('div', 'edg v');
    g.style.left = (r.left + x * k) + 'px'; g.style.top = r.top + 'px'; g.style.height = r.height + 'px';
    ov.appendChild(g);
  });
  (gy || []).forEach(function (y) {
    var g = el('div', 'edg h');
    g.style.top = (r.top + y * k) + 'px'; g.style.left = r.left + 'px'; g.style.width = r.width + 'px';
    ov.appendChild(g);
  });
}

/* ══════════════════════════════════════════════════════════════════════
   4. 스냅 — 다른 요소의 변·중심, 판면 여백, 캔버스 중심
      ⚠ 없으면 몇 px 씩 어긋난 채로 쌓여 "발표자료 티"가 난다(§14.7).
   ════════════════════════════════════════════════════════════════════ */
function snapTargets(exclude) {
  var cv = canvasSize(), m = Math.round(cv.w * 0.07);
  var xs = [0, m, cv.w / 2, cv.w - m, cv.w];
  var ys = [0, cv.h / 2, cv.h];
  var node = curNode(); if (!node) return { xs: xs, ys: ys };
  node.querySelectorAll('.el').forEach(function (n) {
    if (!n._def || exclude.indexOf(n) >= 0 || n.dataset.role === 'foot') return;
    var e = n._def;
    xs.push(e.x, e.x + e.w / 2, e.x + e.w);
    ys.push(e.y, e.y + e.h / 2, e.y + e.h);
  });
  return { xs: xs, ys: ys };
}
/** 후보값들 중 목표선에 가장 가까운 보정량 하나를 고른다 */
function nearest(vals, targets) {
  var best = null;
  vals.forEach(function (v) {
    targets.forEach(function (t) {
      var d = t - v;
      if (Math.abs(d) <= SNAP_TOL && (!best || Math.abs(d) < Math.abs(best.d))) best = { d: d, line: t };
    });
  });
  return best;
}

/* ══════════════════════════════════════════════════════════════════════
   5. 이동 · 크기 조절
   ════════════════════════════════════════════════════════════════════ */
function beginMove(ev) {
  var start = toCanvas(ev);
  var items = ED.sel.map(function (n) { return { n: n, e: n._def, x0: n._def.x, y0: n._def.y }; });
  var tg = snapTargets(ED.sel);
  var moved = false;
  ED.drag = {
    move: function (e2) {
      var p = toCanvas(e2);
      var dx = p.x - start.x, dy = p.y - start.y;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 1.5) return;
      if (!moved) { snap(); moved = true; }
      var gx = [], gy = [];
      if (!e2.altKey) {                                    /* Alt = 스냅 일시 해제 */
        var b = bboxOf(items, dx, dy);
        var sx = nearest([b.x, b.x + b.w / 2, b.x + b.w], tg.xs);
        var sy = nearest([b.y, b.y + b.h / 2, b.y + b.h], tg.ys);
        if (sx) { dx += sx.d; gx.push(sx.line); }
        if (sy) { dy += sy.d; gy.push(sy.line); }
      }
      items.forEach(function (it) {
        it.e.x = Math.round(it.x0 + dx);
        it.e.y = Math.round(it.y0 + dy);
        applyGeom(it.n, it.e);
      });
      drawOverlay(); drawGuides(gx, gy);
    },
    end: function () { drawGuides([], []); if (moved) { refresh(); } }
  };
}
function bboxOf(items, dx, dy) {
  var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  items.forEach(function (it) {
    var x = it.x0 + dx, y = it.y0 + dy;
    x1 = Math.min(x1, x); y1 = Math.min(y1, y);
    x2 = Math.max(x2, x + it.e.w); y2 = Math.max(y2, y + it.e.h);
  });
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function beginResize(ev, dir) {
  var n = ED.sel[0]; if (!n) return;
  var e = n._def;
  var start = toCanvas(ev);
  /* contain 이미지는 선언 영역(e.x/y/w/h) 안에서 실제 프레임이 더 작게 보일 수 있다.
     사용자가 잡은 핸들과 계산 기준을 일치시키기 위해 화면에 보이는 프레임을 시작값으로 쓴다. */
  function styleNum(prop, fallback) {
    var v = parseFloat(n.style[prop]);
    return isNaN(v) ? fallback : v;                       /* 0도 유효한 캔버스 좌표다 */
  }
  var o = (e.type === 'image') ? {
    x: styleNum('left', e.x), y: styleNum('top', e.y),
    w: styleNum('width', e.w), h: styleNum('height', e.h),
  } : { x: e.x, y: e.y, w: e.w, h: e.h };
  var ratio = o.w / o.h;
  var tg = snapTargets([n]);
  var did = false;
  ED.drag = {
    move: function (e2) {
      var p = toCanvas(e2);
      var dx = p.x - start.x, dy = p.y - start.y;
      if (!did && Math.abs(dx) + Math.abs(dy) < 1.5) return;
      if (!did) {
        snap();
        if (e.type === 'image') {
          e.x = o.x; e.y = o.y; e.w = o.w; e.h = o.h;
          e.frame = 'fixed';                /* 이후 변 중앙 핸들의 자유 변형도 그대로 보존 */
        }
        did = true;
      }
      var x = o.x, y = o.y, w = o.w, h = o.h, gx = [], gy = [];

      if (dir.indexOf('e') >= 0) w = o.w + dx;
      if (dir.indexOf('s') >= 0) h = o.h + dy;
      if (dir.indexOf('w') >= 0) { x = o.x + dx; w = o.w - dx; }
      if (dir.indexOf('n') >= 0) { y = o.y + dy; h = o.h - dy; }

      if (!e2.altKey) {                                    /* 움직이는 변만 스냅한다 */
        if (dir.indexOf('e') >= 0) { var s1 = nearest([x + w], tg.xs); if (s1) { w += s1.d; gx.push(s1.line); } }
        if (dir.indexOf('w') >= 0) { var s2 = nearest([x], tg.xs);     if (s2) { x += s2.d; w -= s2.d; gx.push(s2.line); } }
        if (dir.indexOf('s') >= 0) { var s3 = nearest([y + h], tg.ys); if (s3) { h += s3.d; gy.push(s3.line); } }
        if (dir.indexOf('n') >= 0) { var s4 = nearest([y], tg.ys);     if (s4) { y += s4.d; h -= s4.d; gy.push(s4.line); } }
      }
      /* 이미지는 모서리만 항상 현재 프레임 비율을 유지한다.
         상하좌우 중앙 핸들은 폭·높이를 독립적으로 바꾸고,
         이미지가 아닌 요소는 기존처럼 Shift+모서리일 때만 비율을 고정한다. */
      var lockAspect = dir.length === 2 && (e.type === 'image' || e2.shiftKey);
      if (lockAspect) {
        var dw = Math.abs((w - o.w) / o.w), dh = Math.abs((h - o.h) / o.h);
        if (dw >= dh) { h = w / ratio; gy = []; }
        else          { w = h * ratio; gx = []; }
        if (dir.indexOf('w') >= 0) x = o.x + o.w - w;
        if (dir.indexOf('n') >= 0) y = o.y + o.h - h;
      }
      if (lockAspect) {
        /* 최소 크기에서도 비율이 깨지지 않게 두 축을 함께 제한한다. */
        var minW = Math.max(MIN_SIZE, MIN_SIZE * ratio);
        if (w < minW || h < MIN_SIZE) {
          w = minW; h = w / ratio;
          if (dir.indexOf('w') >= 0) x = o.x + o.w - w;
          if (dir.indexOf('n') >= 0) y = o.y + o.h - h;
        }
      } else {
        if (w < MIN_SIZE) { if (dir.indexOf('w') >= 0) x -= (MIN_SIZE - w); w = MIN_SIZE; }
        if (h < MIN_SIZE) { if (dir.indexOf('n') >= 0) y -= (MIN_SIZE - h); h = MIN_SIZE; }
      }

      e.x = Math.round(x); e.y = Math.round(y);
      e.w = Math.round(w); e.h = Math.round(h);
      applyGeom(n, e);
      drawOverlay(); drawGuides(gx, gy);
    },
    end: function () { drawGuides([], []); if (did) refresh(); }
  };
}

/** 빈 곳 드래그 = 범위 선택 */
function beginMarquee(ev, additive) {
  var node = curNode(); if (!node) return;
  var s = toCanvas(ev);
  var box = el('div', 'edmq');
  $('#edov').appendChild(box);
  ED.drag = {
    move: function (e2) {
      var p = toCanvas(e2);
      var r = toScreen(Math.min(s.x, p.x), Math.min(s.y, p.y), Math.abs(p.x - s.x), Math.abs(p.y - s.y));
      box.style.left = r.l + 'px'; box.style.top = r.t + 'px';
      box.style.width = r.w + 'px'; box.style.height = r.h + 'px';
      box._c = { x1: Math.min(s.x, p.x), y1: Math.min(s.y, p.y), x2: Math.max(s.x, p.x), y2: Math.max(s.y, p.y) };
    },
    end: function () {
      var c = box._c; box.remove();
      if (!c || (c.x2 - c.x1 < 3 && c.y2 - c.y1 < 3)) { if (!additive) select([], false); return; }
      var hit = [];
      node.querySelectorAll('.el').forEach(function (n) {
        if (!selectable(n)) return;
        var e = n._def;
        if (e.x + e.w > c.x1 && e.x < c.x2 && e.y + e.h > c.y1 && e.y < c.y2) hit.push(n);
      });
      select(hit, additive);
    }
  };
}

/* ══════════════════════════════════════════════════════════════════════
   6. 텍스트 직접 편집
      ⚠ [data-bind] 숫자는 contenteditable="false" 로 막아 통째 삭제를 방지한다.
        (지워지면 다음 렌더에서 그 숫자가 사라진다)
   ════════════════════════════════════════════════════════════════════ */
function enterText(node) {
  if (!contentEditableEl(node)) {
    var why = lockReason(node);
    if (why) toast(why);
    return;
  }
  exitText();
  ED.text = node;
  ED.undoBeforeText = dump();          /* 글을 고치기 "직전" 상태 — 되돌리기의 기준점 */

  /* 검증 숫자의 "원천 표기"를 def.html 에서 뜬다 (화면 값은 records 에서 채운 것이라 다를 수 있다) */
  ED.origBinds = {};
  var tmp = document.createElement('div');
  tmp.innerHTML = node._def.html || '';
  tmp.querySelectorAll('[data-bind]').forEach(function (n) {
    ED.origBinds[n.getAttribute('data-bind')] = n.innerHTML;
  });

  /* 숫자 조각만 못 건드리게 잠근다 — 문장은 자유롭게 고칠 수 있다 */
  node.querySelectorAll('[data-bind]').forEach(function (n) { n.setAttribute('contenteditable', 'false'); });
  node.setAttribute('contenteditable', 'true');
  node.classList.add('edtext');
  node.focus();
  ED.textBefore = editedHtml(node, ED.origBinds);
  drawOverlay(); renderInspector();
}
function exitText() {
  var node = ED.text; if (!node) return;
  ED.text = null;
  node.removeAttribute('contenteditable');
  node.classList.remove('edtext');
  node.querySelectorAll('[data-bind]').forEach(function (n) { n.removeAttribute('contenteditable'); });

  var html = editedHtml(node, ED.origBinds);
  if (html !== ED.textBefore) {
    ED.undo.push(ED.undoBeforeText || dump());     /* 편집 시작 시점으로 되돌아가게 */
    if (ED.undo.length > UNDO_MAX) ED.undo.shift();
    ED.redo.length = 0;
    node._def.html = html;
    setDirty(true);

    /* ⚠ 숫자 조각은 통째로 지워질 수는 있다(Backspace 한 번). 조용히 사라지면
       그 자리에 있던 검증값이 발표자료에서 없어진 채로 나간다 — 반드시 알린다. */
    var left = {};
    node.querySelectorAll('[data-bind]').forEach(function (n) { left[n.getAttribute('data-bind')] = 1; });
    var lost = Object.keys(ED.origBinds || {}).filter(function (k) { return !left[k]; });
    if (lost.length) {
      toast('⚠ 검증 숫자 ' + lost.length + '개가 지워졌습니다 (' + lost.join(', ') + ') — Ctrl+Z 로 되돌릴 수 있습니다');
      console.warn('[deck] 편집 중 [data-bind] 소실:', lost);
    }
  }
  ED.undoBeforeText = null;
  ED.origBinds = null;
  refresh();
}
function fmt(cmd, val) {
  if (!ED.text) { toast('먼저 더블클릭해서 텍스트 편집 상태로 들어가세요'); return; }
  document.execCommand('styleWithCSS', false, cmd === 'foreColor');
  document.execCommand(cmd, false, val);
  ED.text.focus();
}

/* ══════════════════════════════════════════════════════════════════════
   7. 요소 · 슬라이드 조작
   ════════════════════════════════════════════════════════════════════ */
function dataIndexOf(id) {
  return (Deck.data.slides || []).findIndex(function (s) { return s.id === id; });
}
function rerender(keepIds) {
  var sid = curDef() ? curDef().id : null;
  var ids = keepIds || ED.sel.map(function (n) { return n.dataset.id; });
  Deck.render();
  var i = sid ? Deck.slides.findIndex(function (s) { return s.def.id === sid; }) : 0;
  Deck.go(i < 0 ? 0 : i, false);
  var s = curSlide();
  ED.sel = s ? ids.map(function (id) { return $('.el[data-id="' + id + '"]', s.node); }).filter(Boolean) : [];
  refresh();
}

function addElement(kind) {
  var def = curDef();
  if (!slideEditable(def)) { toast('목차·부록은 자동 생성이라 편집할 수 없습니다'); return; }
  snap();
  var cv = canvasSize();
  var taken = (def.els || []).map(function (e) { return e.id; });
  var id = uid('e', taken);
  var e = { id: id, x: Math.round(cv.w * 0.07), y: Math.round(cv.h * 0.35), w: 500, h: 160 };
  if (kind === 'text')  { e.type = 'text'; e.html = '<p class="lead">새 문장</p>'; }
  if (kind === 'title') { e.type = 'text'; e.h = 67; e.w = cv.w - Math.round(cv.w * 0.07) * 2;
                          e.y = 120; e.html = '<h2 class="title">새 제목</h2>'; }
  if (kind === 'box')   { e.type = 'text'; e.html = '';
                          e.st = { background: '#1e2126', border: '1px solid #2f353d', borderRadius: '8px' }; }
  if (kind === 'image') {
    e.type = 'image'; e.w = 596; e.h = 420; e.kind = 'user'; e.src = ''; e.fit = 'contain';
    e.caption = ''; e.slot = uid((def.id || 'img') + '_', collectSlots());
  }
  (def.els = def.els || []).push(e);
  rerender([id]);
}
function collectSlots() {
  var out = [];
  (Deck.data.slides || []).forEach(function (s) {
    (s.els || []).forEach(function (e) { if (e.slot) out.push(e.slot); });
  });
  return out;
}
function duplicateSel() {
  var def = curDef(); if (!slideEditable(def) || !ED.sel.length) return;
  snap();
  var taken = (def.els || []).map(function (e) { return e.id; });
  var ids = [];
  selDefs().forEach(function (e) {
    var c = clone(e);
    c.id = uid('e', taken); taken.push(c.id);
    c.x += 16; c.y += 16;
    if (c.slot) c.slot = uid(c.slot + '_', collectSlots());
    def.els.push(c); ids.push(c.id);
  });
  rerender(ids);
}
function deleteSel() {
  var def = curDef(); if (!slideEditable(def) || !ED.sel.length) return;
  snap();
  var kill = selDefs();
  def.els = (def.els || []).filter(function (e) { return kill.indexOf(e) < 0; });
  rerender([]);
}
function zOrder(dir) {
  var def = curDef(); if (!slideEditable(def) || ED.sel.length !== 1) return;
  snap();
  var e = ED.sel[0]._def, i = def.els.indexOf(e);
  var j = (dir === 'front') ? def.els.length - 1 : (dir === 'back') ? 0 : i + dir;
  j = Math.max(0, Math.min(def.els.length - 1, j));
  def.els.splice(i, 1); def.els.splice(j, 0, e);
  rerender([e.id]);
}
function alignSel(how) {
  if (ED.sel.length < 2) { toast('두 개 이상 선택하세요'); return; }
  snap();
  var ds = selDefs();
  var x1 = Math.min.apply(null, ds.map(function (e) { return e.x; }));
  var x2 = Math.max.apply(null, ds.map(function (e) { return e.x + e.w; }));
  var y1 = Math.min.apply(null, ds.map(function (e) { return e.y; }));
  var y2 = Math.max.apply(null, ds.map(function (e) { return e.y + e.h; }));
  ds.forEach(function (e) {
    if (how === 'l') e.x = x1;
    if (how === 'r') e.x = x2 - e.w;
    if (how === 'cx') e.x = Math.round((x1 + x2) / 2 - e.w / 2);
    if (how === 't') e.y = y1;
    if (how === 'b') e.y = y2 - e.h;
    if (how === 'cy') e.y = Math.round((y1 + y2) / 2 - e.h / 2);
  });
  ED.sel.forEach(function (n) { applyGeom(n, n._def); });
  refresh();
}
/** 선언된 프레임은 그대로 두고, 그림을 프레임의 가로·세로에 정확히 맞춘다. */
function fitImageToFrame() {
  var n = ED.sel[0]; if (!n || n._def.type !== 'image') { toast('이미지를 선택하세요'); return; }
  snap();
  n._def.frame = 'fixed';
  n._def.fit = 'fill';
  rerender([n.dataset.id]);              /* data-fit과 고정 프레임을 함께 다시 그린다 */
  toast('그림을 프레임에 맞췄습니다');
}

function slideOp(op) {
  var def = curDef(); if (!def) return;
  var di = dataIndexOf(def.id);
  if (di < 0 && op !== 'add') { toast('자동 생성 장은 옮기거나 지울 수 없습니다'); return; }
  snap();
  var list = Deck.data.slides;
  if (op === 'add' || op === 'dup') {
    var taken = list.map(function (s) { return s.id; });
    var ns = (op === 'dup' && di >= 0) ? clone(list[di])
           : { id: '', name: '새 슬라이드', els: [] };
    ns.id = uid('n', taken);
    if (op === 'dup') { ns.name = (ns.name || '') + ' (복사)'; delete ns.grpOpen; }
    list.splice((di < 0 ? list.length - 1 : di) + 1, 0, ns);
    Deck.render();
    var i = Deck.slides.findIndex(function (s) { return s.def.id === ns.id; });
    Deck.go(i < 0 ? Deck.cur : i, false);
    ED.sel = []; refresh();
    return;
  }
  if (op === 'del') {
    if (list.length <= 1) { toast('마지막 한 장은 지울 수 없습니다'); return; }
    list.splice(di, 1);
    Deck.render(); Deck.go(Math.min(Deck.cur, Deck.slides.length - 1), false);
    ED.sel = []; refresh();
    return;
  }
  if (op === 'up' || op === 'down') {
    var j = di + (op === 'up' ? -1 : 1);
    if (j < 0 || j >= list.length) return;
    var t = list[di]; list[di] = list[j]; list[j] = t;
    Deck.render();
    var k2 = Deck.slides.findIndex(function (s) { return s.def.id === t.id; });
    Deck.go(k2 < 0 ? Deck.cur : k2, false);
    refresh();
  }
}

/* ══════════════════════════════════════════════════════════════════════
   8. 이미지 넣기 — assets/user/ 폴더에 직접 써 넣는다
      ★ 그래야 "파일 하나 복사 = 교체" 규칙(§16.2)과 어긋나지 않는다.
        data URL 로 굽으면 deck.js 가 수십 MB 로 부푼다.
   ════════════════════════════════════════════════════════════════════ */
async function pickImage() {
  var n = ED.sel[0];
  if (!n || n._def.type !== 'image') { toast('이미지 요소를 선택하세요'); return; }
  if (!global.showOpenFilePicker) { toast('이 브라우저에서는 파일 넣기를 지원하지 않습니다 — 폴더에 직접 저장하세요'); return; }
  try {
    var picked = await global.showOpenFilePicker({
      types: [{ description: '이미지', accept: { 'image/*': ['.png', '.jpg', '.jpeg'] } }],
    });
    var file = await picked[0].getFile();
    await applyPickedImage(file, true);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    toast('넣지 못했습니다: ' + (err && err.message ? err.message : err));
  }
}

/** 선택한 이미지를 먼저 화면에 반영하고, 그 다음 assets/user 에 영구 저장한다.
 *  디스크 쓰기보다 미리보기를 먼저 하는 이유:
 *    · 폴더 선택 창이 떠 있는 동안에도 사용자가 고른 그림을 바로 확인할 수 있다.
 *    · 같은 URL의 과거 404/이미지가 캐시돼도 새 그림이 가려지지 않는다.
 *  _previewSrc 는 dump()가 제거하므로 blob URL이 deck.js에 저장되지 않는다. */
async function applyPickedImage(file, persist) {
  var n = ED.sel[0];
  if (!n || n._def.type !== 'image') { toast('이미지 요소를 선택하세요'); return false; }
  var validType = file && /^image\/(png|jpe?g)$/i.test(file.type || '');
  var validName = file && /\.(png|jpe?g)$/i.test(file.name || '');
  if (!validType && !validName) {
    toast('PNG 또는 JPG 이미지를 선택하세요'); return false;
  }
  var e = n._def, id = n.dataset.id;
  if (!e.slot) { toast('먼저 이미지 슬롯 이름을 입력하세요'); return false; }

  if (e._previewSrc) URL.revokeObjectURL(e._previewSrc);
  e._previewSrc = URL.createObjectURL(file);
  rerender([id]);
  toast('이미지를 바로 반영했습니다');

  if (persist === false) return true;                 /* 자동검수용: 파일 시스템은 건드리지 않는다 */
  if (!global.showDirectoryPicker) {
    toast('화면에는 반영했습니다 — 유지하려면 assets/user 폴더에 직접 저장하세요');
    return true;
  }
  try {
    var dir = await storedDirHandle();
    if (!dir || !await directoryWritable(dir)) {
      toast('최초 한 번만 assets/user 폴더를 선택하세요');
      dir = await global.showDirectoryPicker({ mode: 'readwrite' });
      if (dir && dir.name && dir.name.toLowerCase() !== 'user') {
        toast('docs/presentation/assets/user 폴더를 선택해야 합니다');
        return true;
      }
      if (!await directoryWritable(dir)) throw new Error('directory-write-permission-denied');
      ED.dirHandle = dir;
      ED.dirHandleLoaded = true;
      await rememberDirHandle(dir);
    }
    var ext = /\.jpe?g$/i.test(file.name) ? 'jpg' : 'png';
    var name = e.slot + '.' + ext;
    var fh = await dir.getFileHandle(name, { create: true });
    var w = await fh.createWritable();
    await w.write(file); await w.close();
    /* PNG가 JPG보다 먼저 탐색되므로 반대 확장자가 남으면 새 JPG를 가린다. */
    var stale = e.slot + (ext === 'png' ? '.jpg' : '.png');
    try {
      if (dir.removeEntry) await dir.removeEntry(stale);
    } catch (removeErr) {
      if (!removeErr || removeErr.name !== 'NotFoundError') throw removeErr;
    }
    toast('바로 반영하고 저장했습니다 — assets/user/' + name);
    return true;
  } catch (err) {
    if (err && err.name === 'AbortError') {
      toast('화면에는 반영했습니다 — 폴더 저장은 취소했습니다');
      return true;
    }
    toast('화면에는 반영했습니다 — 저장 실패: ' + (err && err.message ? err.message : err));
    return true;
  }
}

/* ══════════════════════════════════════════════════════════════════════
   9. 저장 — data/deck.js 를 그대로 다시 쓴다
   ════════════════════════════════════════════════════════════════════ */
var HEADER =
'/* ════════════════════════════════════════════════════════════════════════\n' +
' *  발표 내용 — 이 파일이 슬라이드의 원본입니다.\n' +
' *\n' +
' *  ★ 화면에서 편집하세요. (덱을 열고 E 키 → 편집 모드)\n' +
' *    직접 손으로 고쳐도 되지만, 좌표(x,y,w,h)는 캔버스 1600×900 기준 픽셀입니다.\n' +
' *\n' +
' *  ⚠ 검증 수치는 여기 없습니다 — data/verification.js(자동 생성)에서 옵니다.\n' +
' *    type:\'vtable\' 요소와 [data-bind] 표시는 엔진이 매번 원천에서 채웁니다.\n' +
' *\n' +
' *  최초 생성: frontend/scripts/convert-deck.mjs\n' +
' * ══════════════════════════════════════════════════════════════════════ */\n';

function fileText() { return HEADER + 'window.__DECK__ = ' + dump() + '\n'; }

/* 브라우저는 로컬 파일을 페이지가 임의로 덮어쓰지 못하게 한다.
   사용자가 최초 한 번 고른 deck.js 핸들을 IndexedDB에 보관하면, 다음 실행부터는
   그 핸들의 쓰기 권한만 확인하고 같은 파일에 바로 저장할 수 있다. */
var HANDLE_DB = 'strixdeck.files.v1';
var HANDLE_STORE = 'handles';
/* 발표 폴더를 복사해 새 덱을 만들었을 때 이전 폴더의 deck.js를 덮어쓰지 않도록
   현재 index.html 경로별로 파일 핸들을 따로 기억한다. */
var HANDLE_SCOPE = location.protocol + '//' + location.host + location.pathname;
var HANDLE_KEY = 'deck.js|' + HANDLE_SCOPE;
var DIR_HANDLE_KEY = 'assets/user|' + HANDLE_SCOPE;

function handleDb() {
  return new Promise(function (resolve, reject) {
    if (!global.indexedDB) { reject(new Error('no-indexeddb')); return; }
    var req = global.indexedDB.open(HANDLE_DB, 1);
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains(HANDLE_STORE)) req.result.createObjectStore(HANDLE_STORE);
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error || new Error('indexeddb-open')); };
  });
}

async function storedFileHandle() {
  if (ED.fileHandleLoaded) return ED.fileHandle;
  ED.fileHandleLoaded = true;
  try {
    var db = await handleDb();
    ED.fileHandle = await new Promise(function (resolve, reject) {
      var req = db.transaction(HANDLE_STORE, 'readonly').objectStore(HANDLE_STORE).get(HANDLE_KEY);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { reject(req.error); };
    });
    db.close();
  } catch (err) { ED.fileHandle = null; }              /* IndexedDB 불가 환경은 세션 안에서만 기억 */
  return ED.fileHandle;
}

async function storedDirHandle() {
  if (ED.dirHandleLoaded) return ED.dirHandle;
  ED.dirHandleLoaded = true;
  try {
    var db = await handleDb();
    ED.dirHandle = await new Promise(function (resolve, reject) {
      var req = db.transaction(HANDLE_STORE, 'readonly').objectStore(HANDLE_STORE).get(DIR_HANDLE_KEY);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { reject(req.error); };
    });
    db.close();
  } catch (err) { ED.dirHandle = null; }
  return ED.dirHandle;
}

async function rememberFileHandle(handle) {
  try {
    var db = await handleDb();
    await new Promise(function (resolve, reject) {
      var req = db.transaction(HANDLE_STORE, 'readwrite').objectStore(HANDLE_STORE).put(handle, HANDLE_KEY);
      req.onsuccess = function () { resolve(); };
      req.onerror = function () { reject(req.error); };
    });
    db.close();
  } catch (err) { /* 핸들 구조화 복제가 안 되는 환경에서도 현재 세션 저장은 계속한다 */ }
}

async function rememberDirHandle(handle) {
  try {
    var db = await handleDb();
    await new Promise(function (resolve, reject) {
      var req = db.transaction(HANDLE_STORE, 'readwrite').objectStore(HANDLE_STORE).put(handle, DIR_HANDLE_KEY);
      req.onsuccess = function () { resolve(); };
      req.onerror = function () { reject(req.error); };
    });
    db.close();
  } catch (err) { /* 현재 세션에서는 ED.dirHandle 로 계속 사용한다 */ }
}

async function writePermission(handle) {
  if (!handle) return false;
  if (!handle.queryPermission) return true;
  var opt = { mode: 'readwrite' };
  if (await handle.queryPermission(opt) === 'granted') return true;
  return !!handle.requestPermission && await handle.requestPermission(opt) === 'granted';
}

async function writable(handle) {
  return !!handle && !!handle.createWritable && await writePermission(handle);
}

async function directoryWritable(handle) {
  return !!handle && !!handle.getFileHandle && await writePermission(handle);
}

async function chooseDeckFile() {
  toast('처음 한 번만 기존 data/deck.js를 선택하세요');
  var types = [{ description: '발표 내용', accept: { 'text/javascript': ['.js'] } }];
  var handle;
  if (global.showOpenFilePicker) {
    var picked = await global.showOpenFilePicker({ multiple: false, types: types });
    handle = picked[0];
  } else if (global.showSaveFilePicker) {
    handle = await global.showSaveFilePicker({ suggestedName: 'deck.js', types: types });
  } else throw new Error('no-picker');
  if (handle && handle.name && handle.name.toLowerCase() !== 'deck.js') {
    toast('data/deck.js 파일을 선택해야 합니다');
    return null;
  }
  return handle;
}

async function save() {
  if (ED.saving) { toast('저장 중입니다'); return; }
  ED.saving = true;
  exitText();                    /* 고치던 글을 먼저 데이터에 반영하고 나서 쓴다 */
  var text = fileText();
  try {
    var handle = await storedFileHandle();
    if (!handle || !await writable(handle)) {
      handle = await chooseDeckFile();
      if (!handle) return;
      if (!await writable(handle)) throw new Error('write-permission-denied');
      ED.fileHandle = handle;
      ED.fileHandleLoaded = true;
      await rememberFileHandle(handle);
    }
    var w = await handle.createWritable();
    await w.write(text); await w.close();
    ED.dirty = false; localStorage.removeItem(DRAFT_KEY);
    setDirty(false);
    toast('기존 data/deck.js에 덮어썼습니다');
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    var a = el('a');                                    /* 폴백 — 내려받아 직접 덮어쓰기 */
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
    a.download = 'deck.js'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    toast('내려받았습니다 — data/deck.js 에 덮어쓰세요');
  } finally { ED.saving = false; }
}

/* ══════════════════════════════════════════════════════════════════════
   10. 화면 — 상단 바 · 인스펙터
   ════════════════════════════════════════════════════════════════════ */
/** keepText=true 는 "글자 서식" 단추 전용 — 그 단추들은 편집 중인 선택 영역에 작용하므로
 *  텍스트 편집을 끝내면 안 된다. 나머지 단추는 반드시 먼저 끝내야 한다.
 *  ⚠ 안 그러면 글을 고치는 중에 [저장]을 눌렀을 때 그 편집이 빠진 채 파일에 쓰인다(실측 전 발견). */
function btn(label, title, fn, cls, keepText) {
  var b = el('button', 'edbtn' + (cls ? ' ' + cls : ''), label);
  b.type = 'button'; b.title = title || label;
  /* mousedown 을 막아야 contenteditable 의 선택 영역이 살아 있다(서식 단추가 동작하는 이유) */
  b.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); });
  b.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    if (!keepText) exitText();
    fn();
  });
  return b;
}
function group() { var g = el('div', 'grp'); for (var i = 0; i < arguments.length; i++) g.appendChild(arguments[i]); return g; }
function sep() { return el('div', 'sep'); }

function buildChrome() {
  var bar = el('div'); bar.id = 'edbar';
  bar.appendChild(el('span', 'tag', '편집'));
  bar.appendChild(sep());
  var bU = btn('↶', '되돌리기 (Ctrl+Z)', undo);
  var bR = btn('↷', '다시 (Ctrl+Shift+Z)', redo);
  bar.appendChild(group(bU, bR));
  bar.appendChild(sep());
  bar.appendChild(group(
    btn('＋글', '텍스트 상자 추가', function () { addElement('text'); }),
    btn('＋제목', '제목 추가', function () { addElement('title'); }),
    btn('＋그림', '이미지 자리 추가', function () { addElement('image'); }),
    btn('＋상자', '도형(배경 상자) 추가', function () { addElement('box'); })
  ));
  bar.appendChild(sep());
  bar.appendChild(group(
    btn('장 추가', '슬라이드 추가', function () { slideOp('add'); }),
    btn('장 복사', '슬라이드 복사', function () { slideOp('dup'); }),
    btn('◀ 앞으로', '앞으로 이동', function () { slideOp('up'); }),
    btn('뒤로 ▶', '뒤로 이동', function () { slideOp('down'); }),
    btn('장 삭제', '슬라이드 삭제', function () { slideOp('del'); })
  ));
  bar.appendChild(sep());
  var stat = el('span', 'stat'); stat.id = 'edstat';
  bar.appendChild(stat);
  bar.appendChild(el('div', 'spacer'));
  bar.appendChild(group(
    btn('전체 넘침 검사', '모든 장에서 상자를 넘는 내용 찾기', checkAll),
    btn('저장', '저장 (Ctrl+S)', save, 'pri'),
    btn('나가기', '편집 모드 끄기 (E)', function () { toggle(false); })
  ));
  document.body.appendChild(bar);

  var insp = el('div'); insp.id = 'edinsp';
  document.body.appendChild(insp);

  var ov = el('div'); ov.id = 'edov';
  document.body.appendChild(ov);

  var t = el('div'); t.id = 'edtoast';
  document.body.appendChild(t);

  var dr = el('div'); dr.id = 'eddraft';
  document.body.appendChild(dr);

  ED.bU = bU; ED.bR = bR;
}

function renderBarState() {
  if (!ED.bU) return;
  ED.bU.disabled = !ED.undo.length;
  ED.bR.disabled = !ED.redo.length;
  var s = $('#edstat'); if (!s) return;
  var over = Object.keys(ED.over || {}).length;
  var d = curDef();
  s.innerHTML = (d ? (Deck.cur + 1) + '/' + Deck.slides.length + ' · ' + esc(d.name || d.id) : '')
              + (over ? ' · 이 장 넘침 <b>' + over + '</b>건' : '')
              + (ED.dirty ? ' · 저장 안 됨' : '');
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 전 장 넘침 검사 — 저장 전에 한 번 눌러보라는 용도(비싸므로 자동으로 돌리지 않는다) */
function checkAll() {
  var all = Deck.checkOverflow() || [];
  if (!all.length) { toast('전 장 넘침 없음 (' + Deck.slides.length + '장)'); return; }
  toast('넘침 ' + all.length + '건 — ' + all.slice(0, 3).map(function (o) {
    return (o.slide) + '장 ' + o.el;
  }).join(', ') + (all.length > 3 ? ' 외' : ''));
  var i = Deck.slides.findIndex(function (s) { return s.def.id === all[0].id; });
  if (i >= 0) goSlide(i);
  console.warn('[deck] 넘침', all);
}

function num(labelText, val, fn) {
  var r = el('div', 'row');
  r.appendChild(el('label', null, labelText));
  var i = el('input'); i.type = 'number'; i.value = (val === undefined ? '' : val);
  i.addEventListener('change', function () { fn(parseFloat(i.value) || 0); });
  i.addEventListener('mousedown', function (e) { e.stopPropagation(); });
  r.appendChild(i);
  return r;
}
function sel2(labelText, opts, val, fn) {
  var r = el('div', 'row');
  r.appendChild(el('label', null, labelText));
  var s = el('select');
  opts.forEach(function (o) {
    var op = el('option', null, o[1]); op.value = o[0];
    if (String(o[0]) === String(val || '')) op.selected = true;
    s.appendChild(op);
  });
  s.addEventListener('change', function () { fn(s.value); });
  s.addEventListener('mousedown', function (e) { e.stopPropagation(); });
  r.appendChild(s);
  return r;
}
function section(title) { var d = el('div', 'sec'); if (title) d.appendChild(el('h4', null, title)); return d; }

function commit(fn) { snap(); fn(); }

function renderInspector() {
  var insp = $('#edinsp'); if (!insp) return;
  var oldList = $('.slist', insp);
  var keepTop = oldList ? oldList.scrollTop : 0;     /* 다시 그려도 장 목록 스크롤은 유지 */
  var keepPane = insp.scrollTop;
  insp.innerHTML = '';
  var def = curDef();

  /* ── 슬라이드 ── */
  var s1 = section('슬라이드');
  if (!def) { s1.appendChild(el('div', 'hint', '슬라이드가 없습니다')); insp.appendChild(s1); insp.scrollTop = keepPane; return; }
  if (!slideEditable(def)) {
    s1.appendChild(el('div', 'lock', '자동 생성 장입니다 — 목차는 슬라이드 목록에서, 부록 A 는 records/*.json 에서 매번 다시 만들어집니다. 여기서 고쳐도 남지 않습니다.'));
    insp.appendChild(s1);
  } else {
    var r1 = el('div', 'row');
    r1.appendChild(el('label', null, '이름'));
    var iN = el('input'); iN.type = 'text'; iN.value = def.name || '';
    iN.addEventListener('change', function () { commit(function () { def.name = iN.value; }); rerender(); });
    r1.appendChild(iN); s1.appendChild(r1);

    var r2 = el('div', 'row');
    r2.appendChild(el('label', null, '목차'));
    var iT = el('input'); iT.type = 'text'; iT.value = def.toc || '';
    iT.placeholder = '(비우면 이름 사용)';
    iT.addEventListener('change', function () { commit(function () { def.toc = iT.value || undefined; }); rerender(); });
    r2.appendChild(iT); s1.appendChild(r2);

    var chs = (Deck.data.meta || {}).chapters || [];
    var chOpts = [['', '(번호 없음)']].concat(chs.map(function (c) { return [c.id, c.title]; }));
    s1.appendChild(sel2('챕터', chOpts, def.ch, function (v) {
      commit(function () { def.ch = v || undefined; if (!v) { def.grp = undefined; def.grpOpen = undefined; } });
      rerender();
    }));
    var ch = chs.find(function (c) { return c.id === def.ch; });
    if (ch && ch.groups && ch.groups.length) {
      var gOpts = [['', '(그룹 없음)']].concat(ch.groups.map(function (g) { return [g.id, g.title]; }));
      s1.appendChild(sel2('그룹', gOpts, def.grp, function (v) {
        commit(function () { def.grp = v || undefined; }); rerender();
      }));
    }
    var r3 = el('div', 'row');
    r3.appendChild(el('label', null, '각주'));
    var iF = el('input'); iF.type = 'text'; iF.value = def.note || '';
    iF.addEventListener('change', function () { commit(function () { def.note = iF.value || undefined; }); rerender(); });
    r3.appendChild(iF); s1.appendChild(r3);
    insp.appendChild(s1);
  }

  /* ── 선택 요소 ── */
  var s2 = section('선택');
  if (!ED.sel.length) {
    s2.appendChild(el('div', 'hint',
      '요소를 클릭해 고르세요. 빈 곳을 끌면 범위 선택, 더블클릭하면 글자를 직접 고칩니다.'));
    insp.appendChild(s2);
  } else if (ED.sel.length > 1) {
    s2.appendChild(el('div', 'hint', ED.sel.length + '개 선택됨'));
    var ar = el('div', 'btnrow');
    [['l', '왼쪽'], ['cx', '가운데'], ['r', '오른쪽'], ['t', '위'], ['cy', '중간'], ['b', '아래']]
      .forEach(function (a) { ar.appendChild(btn(a[1], '정렬', function () { alignSel(a[0]); })); });
    s2.appendChild(ar);
    insp.appendChild(s2);
  } else {
    var n = ED.sel[0], e = n._def;
    s2.appendChild(el('div', 'hint', e.type + ' · ' + e.id));
    var why = lockReason(n);
    if (why) s2.appendChild(el('div', 'lock', why));
    var bn = bindNote(n);
    if (bn) s2.appendChild(el('div', 'note', bn));
    insp.appendChild(s2);

    /* ★ 이미지는 이 값이 "최대 영역"이고 실제로 보이는 상자는 그림 비율로 줄어든다.
       두 값이 다른 이유를 여기서 말해주지 않으면 W=484 인데 화면은 260 이라 혼란스럽다. */
    var isImg = (e.type === 'image');
    var sg = section(isImg ? '위치 · 최대 영역' : '위치 · 크기');
    if (isImg) {
      var aw = Math.round(parseFloat(n.style.width) || 0);
      var ah = Math.round(parseFloat(n.style.height) || 0);
      sg.appendChild(el('div', 'hint', '화면에 보이는 크기 ' + aw + ' × ' + ah
        + ' — 그림 비율에 맞춰 줄어 가운데 놓입니다. 아래 값은 "쓸 수 있는 최대 영역"입니다.'));
    }
    sg.appendChild(num('X', e.x, function (v) { commit(function () { e.x = v; }); applyGeom(n, e); refresh(); }));
    sg.appendChild(num('Y', e.y, function (v) { commit(function () { e.y = v; }); applyGeom(n, e); refresh(); }));
    sg.appendChild(num('W', e.w, function (v) { commit(function () { e.w = v; }); applyGeom(n, e); refresh(); }));
    sg.appendChild(num('H', e.h, function (v) { commit(function () { e.h = v; }); applyGeom(n, e); refresh(); }));
    var zr = el('div', 'btnrow');
    zr.appendChild(btn('맨앞', '맨 앞으로', function () { zOrder('front'); }));
    zr.appendChild(btn('앞으로', '한 칸 앞으로', function () { zOrder(1); }));
    zr.appendChild(btn('뒤로', '한 칸 뒤로', function () { zOrder(-1); }));
    zr.appendChild(btn('맨뒤', '맨 뒤로', function () { zOrder('back'); }));
    sg.appendChild(zr);
    insp.appendChild(sg);

    var sf = section('서식 (상자 전체)');
    sf.appendChild(num('배율', e.k === undefined ? 1 : e.k, function (v) {
      commit(function () { e.k = (v && v !== 1) ? v : undefined; });
      if (e.k) n.style.setProperty('--k', e.k); else n.style.removeProperty('--k');
      applyGeom(n, e); refresh();
    }));
    var st = e.st || {};
    var cr = el('div', 'row');
    cr.appendChild(el('label', null, '색'));
    var ic = el('input'); ic.type = 'color'; ic.value = cssColor(st.color) || '#d8dce2';
    /* ⚠ input 이벤트로 받으면 색을 고르는 동안 인스펙터가 다시 그려져 색 선택창이 닫힌다 */
    ic.addEventListener('change', function () { setSt(n, e, 'color', ic.value); });
    cr.appendChild(ic);
    var bc = el('input'); bc.type = 'color'; bc.value = cssColor(st.background) || '#1e2126';
    bc.title = '배경색';
    bc.addEventListener('change', function () { setSt(n, e, 'background', bc.value); });
    cr.appendChild(bc);
    cr.appendChild(btn('배경끄기', '배경 없음', function () { setSt(n, e, 'background', ''); renderInspector(); }));
    sf.appendChild(cr);
    sf.appendChild(sel2('정렬', [['', '(기본)'], ['left', '왼쪽'], ['center', '가운데'], ['right', '오른쪽']],
      st.textAlign, function (v) { setSt(n, e, 'textAlign', v); }));
    sf.appendChild(sel2('세로', [['', '위'], ['mid', '가운데'], ['bot', '아래']], e.v, function (v) {
      commit(function () { e.v = v || undefined; });
      if (e.v) n.dataset.v = e.v; else delete n.dataset.v;
      refresh();
    }));
    sf.appendChild(sel2('굵기', [['', '(기본)'], ['400', '보통'], ['700', '굵게']],
      st.fontWeight, function (v) { setSt(n, e, 'fontWeight', v); }));
    sf.appendChild(sel2('글꼴', [['', '(기본)'], ['var(--mono)', '고정폭'], ['var(--sans)', '본문']],
      st.fontFamily, function (v) { setSt(n, e, 'fontFamily', v); }));
    insp.appendChild(sf);

    if (e.type === 'text') {
      var sx = section('글자 (선택 영역)');
      sx.appendChild(el('div', 'hint', '더블클릭해 편집 상태로 들어간 뒤, 글자를 끌어 고르고 누르세요.'));
      var br = el('div', 'btnrow');
      br.appendChild(btn('굵게', '선택 영역 굵게', function () { fmt('bold'); }, '', true));
      br.appendChild(btn('기울임', '선택 영역 기울임', function () { fmt('italic'); }, '', true));
      var fc = el('input'); fc.type = 'color'; fc.value = '#4ea1ff';
      fc.title = '선택 영역 글자색';
      fc.addEventListener('change', function () { fmt('foreColor', fc.value); });
      br.appendChild(fc);
      br.appendChild(btn('서식 지우기', '선택 영역 서식 제거', function () { fmt('removeFormat'); }, '', true));
      sx.appendChild(br);
      insp.appendChild(sx);
    }

    if (e.type === 'image') {
      var si = section('이미지');
      si.appendChild(el('div', 'hint', '슬롯 이름 = assets/user/<이름>.png'));
      var sr = el('div', 'row');
      sr.appendChild(el('label', null, '슬롯'));
      var isl = el('input'); isl.type = 'text'; isl.value = e.slot || '';
      isl.addEventListener('change', function () { commit(function () { e.slot = isl.value; }); rerender(); });
      sr.appendChild(isl); si.appendChild(sr);
      var cr2 = el('div', 'row');
      cr2.appendChild(el('label', null, '설명'));
      var ica = el('input'); ica.type = 'text'; ica.value = e.caption || '';
      ica.addEventListener('change', function () { commit(function () { e.caption = ica.value; }); rerender(); });
      cr2.appendChild(ica); si.appendChild(cr2);
      si.appendChild(sel2('맞춤', [['contain', '비율 유지(기본)'], ['cover', '상자 채우기'], ['fill', '늘려 채우기']],
        e.fit || 'contain', function (v) { commit(function () { e.fit = v; }); rerender(); }));
      var ir = el('div', 'btnrow');
      ir.appendChild(btn('그림 파일 넣기', 'assets/user 에 저장', pickImage));
      ir.appendChild(btn('그림을 프레임에 맞춤', '현재 W×H 프레임 전체에 그림을 늘려 맞춤', fitImageToFrame));
      si.appendChild(ir);
      insp.appendChild(si);
    }
  }

  /* ── 슬라이드 목록 ── */
  var s3 = section('장 목록');
  var list = el('div', 'slist');
  Deck.slides.forEach(function (s, i) {
    var it = el('div', 'sitem' + (i === Deck.cur ? ' cur' : ''));
    it.appendChild(el('span', 'n', String(i + 1)));
    it.appendChild(el('span', 't', s.def.name || s.def.id));
    it.addEventListener('mousedown', function (ev) { ev.preventDefault(); ev.stopPropagation(); goSlide(i); });
    list.appendChild(it);
  });
  s3.appendChild(list);
  insp.appendChild(s3);
  list.scrollTop = keepTop;
  insp.scrollTop = keepPane;
  var cur = $('.sitem.cur', list);
  if (cur && !keepTop) cur.scrollIntoView({ block: 'nearest' });
}
function cssColor(v) { return (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) ? v : null; }
function setSt(n, e, key, val) {
  commit(function () {
    e.st = e.st || {};
    if (val) e.st[key] = val; else delete e.st[key];
    if (!Object.keys(e.st).length) e.st = undefined;
  });
  n.style[key] = val || '';         /* 전체 재렌더 없이 그 자리에서 반영 */
  refresh();
}

function goSlide(i) {
  exitText();
  Deck.go(Math.max(0, Math.min(Deck.slides.length - 1, i)), false);
  ED.sel = [];
  refresh();
}

/** 선택 · 오버레이 · 인스펙터 · 상단바를 한꺼번에 최신 상태로 */
function refresh() {
  ED.sel = ED.sel.filter(function (n) { return n.isConnected; });
  if (ED.on) recomputeOverflow();
  drawOverlay();
  renderInspector();
  renderBarState();
}

/* ══════════════════════════════════════════════════════════════════════
   10.5 개요 화면(`O`)에서 슬라이드 관리 — 고르기 · 복사 · 삭제 · 순서 바꾸기
        ★ 발표 중에는 지금까지와 똑같다(클릭하면 그 장으로 이동).
          관리 기능은 **편집 모드일 때만** 나타난다 — 발표 도중 실수로 장을 지우면 안 된다.
   ════════════════════════════════════════════════════════════════════ */
function ovOpen() { var o = $('#ov'); return !!o && o.classList.contains('on'); }
function ovIdx(sid) { return (Deck.data.slides || []).findIndex(function (s) { return s.id === sid; }); }
function ovSel() { return (ED.ovSel || []).filter(function (id) { return ovIdx(id) >= 0; }); }

/** 슬라이드를 바꾼 뒤 — 다시 그리고, 보던 장을 유지하고, 개요를 다시 만든다 */
function ovCommit(fn) {
  var curId = curDef() ? curDef().id : null;
  snap();
  fn();
  Deck.render();
  var i = curId ? Deck.slides.findIndex(function (s) { return s.def.id === curId; }) : 0;
  Deck.go(i < 0 ? Math.min(Deck.cur, Deck.slides.length - 1) : i, false);
  ED.sel = [];
  ovRebuild();
  refresh();
}
function ovRebuild() {
  if (!ovOpen()) return;
  Deck.ovBuilt = false;
  Deck.toggleOverview(true);
  ovDecorate();
}

/** 개요 카드에 편집용 표시를 입힌다 (개요는 엔진이 만들고, 편집 기능만 여기서 얹는다) */
function ovDecorate() {
  var ov = $('#ov'); if (!ov) return;
  var h = ov.querySelector('h3');
  if (h) h.textContent = '개요 — 클릭 = 고르기 · 더블클릭 = 그 장으로 · 끌어서 순서 변경';
  ov.querySelectorAll('.ovc').forEach(function (c) {
    var gen = c.classList.contains('gen');
    c.classList.toggle('ovsel', !gen && (ED.ovSel || []).indexOf(c.dataset.sid) >= 0);
    c.draggable = !gen;
  });
  var bar = $('#ovbar');
  if (bar) {
    var n = ovSel().length;
    var t = $('#ovbar .ovcount');
    if (t) t.textContent = n ? (n + '장 선택됨')
                             : '카드를 클릭해 고르세요 (Shift = 범위 · Ctrl = 하나씩 · 끌어서 순서 변경)';
    bar.querySelectorAll('[data-need]').forEach(function (b) { b.disabled = !n; });
    var s = $('#ovbar .ovsave');
    if (s) s.style.display = ED.dirty ? '' : 'none';
  }
}

function buildOvBar() {
  var ov = $('#ov'); if (!ov || $('#ovbar')) return;
  var bar = el('div'); bar.id = 'ovbar';
  bar.appendChild(btn('복사 (Ctrl+C)', '선택한 장 복사', function () { ovCopy(false); })).dataset.need = '1';
  bar.appendChild(btn('붙여넣기 (Ctrl+V)', '복사한 장을 뒤에 붙여넣기', ovPaste));
  bar.appendChild(btn('바로 복제', '선택한 장을 바로 뒤에 복제', ovDup)).dataset.need = '1';
  bar.appendChild(btn('삭제 (Del)', '선택한 장 삭제', function () { ovDel(); })).dataset.need = '1';
  bar.appendChild(btn('◀ 앞으로', '선택한 장을 앞으로', function () { ovMove(-1); })).dataset.need = '1';
  bar.appendChild(btn('뒤로 ▶', '선택한 장을 뒤로', function () { ovMove(1); })).dataset.need = '1';
  bar.appendChild(btn('선택 해제', '', function () { ED.ovSel = []; ovDecorate(); }));
  bar.appendChild(el('span', 'ovcount'));
  bar.appendChild(el('div', 'spacer'));
  var sv = btn('저장 (Ctrl+S)', 'data/deck.js 에 저장', save, 'pri');
  sv.classList.add('ovsave'); sv.style.display = 'none';
  bar.appendChild(sv);
  bar.appendChild(btn('닫기 (O)', '개요 닫기', function () { Deck.toggleOverview(false); }));
  ov.insertBefore(bar, ov.querySelector('.ovgrid'));
}

function ovDup() {
  var ids = ovSel(); if (!ids.length) return;
  ovCommit(function () {
    var list = Deck.data.slides;
    ids.map(ovIdx).sort(function (a, b) { return b - a; }).forEach(function (i) {
      var c = clone(list[i]);
      c.id = uid('n', list.map(function (s) { return s.id; }));
      c.name = (c.name || '') + ' (복사)';
      delete c.grpOpen;                       /* 그룹 개요 장이 둘이 되면 번호 체계가 깨진다 */
      list.splice(i + 1, 0, c);
    });
  });
  toast(ids.length + '장 복사했습니다');
}
function ovDel(quiet) {
  var ids = ovSel(); if (!ids.length) return;
  if (Deck.data.slides.length - ids.length < 1) { toast('마지막 한 장은 지울 수 없습니다'); return; }
  ovCommit(function () {
    Deck.data.slides = Deck.data.slides.filter(function (s) { return ids.indexOf(s.id) < 0; });
  });
  ED.ovSel = []; ovDecorate();
  if (!quiet) toast(ids.length + '장 삭제했습니다 — Ctrl+Z 로 되돌릴 수 있습니다');
}
function ovSelectAll() {
  var ov = $('#ov'); if (!ov) return;
  ED.ovSel = Array.from(ov.querySelectorAll('.ovc:not(.gen)')).map(function (c) { return c.dataset.sid; });
  ovDecorate();
}

/* ── 장 복사 · 붙여넣기 (Ctrl+C / Ctrl+X / Ctrl+V) ─────────────────────── */
function ovCopy(cut) {
  var ids = ovSel();
  if (!ids.length) { toast('먼저 장을 고르세요'); return; }
  ED.clip = { kind: 'slide', items: ids.map(function (id) { return clone(Deck.data.slides[ovIdx(id)]); }) };
  if (cut) { ovDel(true); toast(ids.length + '장 잘라냈습니다 — Ctrl+V 로 붙여넣으세요'); }
  else toast(ids.length + '장 복사했습니다 — Ctrl+V 로 붙여넣으세요');
}
function ovPaste() {
  if (!ED.clip || ED.clip.kind !== 'slide' || !ED.clip.items.length) { toast('복사한 장이 없습니다'); return; }
  var made = [];
  ovCommit(function () {
    var list  = Deck.data.slides;
    var taken = list.map(function (s) { return s.id; });
    var sel   = ovSel();
    /* 고른 장이 있으면 그 뒤에, 없으면 지금 보고 있는 장 뒤에 */
    var at = sel.length ? Math.max.apply(null, sel.map(ovIdx))
                        : (curDef() ? ovIdx(curDef().id) : list.length - 1);
    if (at < 0) at = list.length - 1;
    var news = ED.clip.items.map(function (s) {
      var c = clone(s);
      c.id = uid('n', taken); taken.push(c.id);
      delete c.grpOpen;            /* 그룹 개요 장이 둘이 되면 번호 체계가 깨진다 */
      made.push(c.id);
      return c;
    });
    Array.prototype.splice.apply(list, [at + 1, 0].concat(news));
  });
  ED.ovSel = made; ovDecorate();
  toast(made.length + '장 붙여넣었습니다');
}

/* ── 요소 복사 · 붙여넣기 (개요가 아닌 편집 화면에서) ──────────────────── */
function elCopy(cut) {
  if (!ED.sel.length) { toast('먼저 요소를 고르세요'); return; }
  ED.clip = { kind: 'el', items: selDefs().map(clone) };
  var n = ED.sel.length;
  if (cut) { deleteSel(); toast(n + '개 잘라냈습니다'); }
  else toast(n + '개 복사했습니다');
}
function elPaste() {
  var def = curDef();
  if (!ED.clip || ED.clip.kind !== 'el') { toast('복사한 요소가 없습니다'); return; }
  if (!slideEditable(def)) { toast('목차·부록은 편집할 수 없습니다'); return; }
  snap();
  var taken = (def.els = def.els || []).map(function (e) { return e.id; });
  var ids = [];
  ED.clip.items.forEach(function (s) {
    var c = clone(s);
    c.id = uid('e', taken); taken.push(c.id);
    c.x += 16; c.y += 16;
    if (c.slot) c.slot = uid(c.slot + '_', collectSlots());
    def.els.push(c); ids.push(c.id);
  });
  rerender(ids);
  toast(ids.length + '개 붙여넣었습니다');
}
function ovMove(dir) {
  var ids = ovSel(); if (!ids.length) return;
  ovCommit(function () {
    var list = Deck.data.slides;
    var order = ids.map(ovIdx).sort(function (a, b) { return dir < 0 ? a - b : b - a; });
    order.forEach(function (i) {
      var j = i + dir;
      if (j < 0 || j >= list.length) return;
      if (ids.indexOf(list[j].id) >= 0) return;      /* 같이 움직이는 것끼리는 넘지 않는다 */
      var t = list[i]; list[i] = list[j]; list[j] = t;
    });
  });
}
/** 끌어다 놓기 — 선택한 장 전부를 목표 위치로 옮긴다 */
function ovDrop(targetSid, after) {
  var ids = ovSel();
  if (ED.ovDrag && ids.indexOf(ED.ovDrag) < 0) ids = [ED.ovDrag];
  if (!ids.length || ids.indexOf(targetSid) >= 0) return;
  ovCommit(function () {
    var list = Deck.data.slides;
    var moving = list.filter(function (s) { return ids.indexOf(s.id) >= 0; });
    var rest   = list.filter(function (s) { return ids.indexOf(s.id) < 0; });
    var at = rest.findIndex(function (s) { return s.id === targetSid; });
    if (at < 0) at = rest.length - 1;
    Array.prototype.splice.apply(rest, [at + (after ? 1 : 0), 0].concat(moving));
    Deck.data.slides = rest;
  });
}

/* ══════════════════════════════════════════════════════════════════════
   11. 입력 — 마우스 · 키
   ════════════════════════════════════════════════════════════════════ */
/* 개요 카드 클릭 = 고르기 (엔진의 "클릭하면 그 장으로 이동"을 편집 중에는 가로챈다).
   ⚠ 카드 안에는 슬라이드 축소판이 통째로 복제돼 있어 `.el` 이 잔뜩 들어 있다.
     막지 않으면 캔버스 편집으로 오인해 복제본을 선택·드래그한다. */
function onOvClick(ev) {
  if (!ovOpen()) return;
  var card = ev.target.closest('#ov .ovc');
  if (!card) return;
  ev.preventDefault(); ev.stopPropagation();
  if (card.classList.contains('gen')) { toast('목차·부록은 자동 생성이라 고를 수 없습니다'); return; }
  var sid = card.dataset.sid;
  ED.ovSel = ED.ovSel || [];
  if (ev.shiftKey && ED.ovSel.length) {                 /* 범위 선택 */
    var cards = Array.from($('#ov').querySelectorAll('.ovc:not(.gen)')).map(function (c) { return c.dataset.sid; });
    var a = cards.indexOf(ED.ovSel[ED.ovSel.length - 1]), b = cards.indexOf(sid);
    if (a >= 0 && b >= 0) {
      var lo = Math.min(a, b), hi = Math.max(a, b);
      for (var i = lo; i <= hi; i++) if (ED.ovSel.indexOf(cards[i]) < 0) ED.ovSel.push(cards[i]);
    }
  } else if (ev.ctrlKey || ev.metaKey) {
    var k = ED.ovSel.indexOf(sid);
    if (k >= 0) ED.ovSel.splice(k, 1); else ED.ovSel.push(sid);
  } else {
    ED.ovSel = (ED.ovSel.length === 1 && ED.ovSel[0] === sid) ? [] : [sid];
  }
  ovDecorate();
}
/** 개요에서 더블클릭 = 개요를 닫고 그 장으로 (한 번 클릭은 고르기라서 이동은 더블클릭이다) */
function onOvDbl(ev) {
  if (!ovOpen()) return;
  var card = ev.target.closest('#ov .ovc'); if (!card) return;
  ev.preventDefault(); ev.stopPropagation();
  var i = parseInt(card.dataset.i, 10);
  Deck.toggleOverview(false);
  if (!isNaN(i)) { ED.on ? goSlide(i) : Deck.go(i); }
}
function onOvDrag(ev) {
  if (!ovOpen()) return;
  var card = ev.target.closest('#ov .ovc');
  if (ev.type === 'dragstart') {
    if (!card || card.classList.contains('gen')) { ev.preventDefault(); return; }
    ED.ovDrag = card.dataset.sid;
    if (ev.dataTransfer) { ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', ED.ovDrag); } catch (e) {} }
    return;
  }
  if (!ED.ovDrag) return;
  if (ev.type === 'dragover') {
    ev.preventDefault();
    $('#ov').querySelectorAll('.dropL,.dropR').forEach(function (n) { n.classList.remove('dropL', 'dropR'); });
    if (!card || card.classList.contains('gen')) return;
    var r = card.getBoundingClientRect();
    card.classList.add(ev.clientX > r.left + r.width / 2 ? 'dropR' : 'dropL');
    return;
  }
  if (ev.type === 'drop') {
    ev.preventDefault();
    var after = card && card.classList.contains('dropR');
    $('#ov').querySelectorAll('.dropL,.dropR').forEach(function (n) { n.classList.remove('dropL', 'dropR'); });
    if (card && !card.classList.contains('gen')) ovDrop(card.dataset.sid, after);
    ED.ovDrag = null;
    return;
  }
  if (ev.type === 'dragend') {
    $('#ov').querySelectorAll('.dropL,.dropR').forEach(function (n) { n.classList.remove('dropL', 'dropR'); });
    ED.ovDrag = null;
  }
}

function onDown(ev) {
  if (!ED.on || ev.button !== 0) return;
  if (ev.target.closest('#edbar, #edinsp, #eddraft')) return;
  if (ev.target.closest('#ov')) return;      /* 개요는 onOvClick 이 맡는다 */

  var h = ev.target.closest('.edh');
  if (h) { ev.preventDefault(); beginResize(ev, h.dataset.d); return; }

  if (ED.text && ev.target.closest('.el') === ED.text) return;    /* 글 쓰는 중 */
  exitText();

  var node = ev.target.closest('.el');
  var slide = curDef();
  if (node && (!slideEditable(slide) || !selectable(node))) node = null;

  if (node) {
    ev.preventDefault();
    if (ev.shiftKey) { select([node], true); if (ED.sel.indexOf(node) < 0) return; }
    else if (ED.sel.indexOf(node) < 0) select([node], false);
    beginMove(ev);
  } else {
    ev.preventDefault();
    if (!slideEditable(slide)) { select([], false); return; }
    beginMarquee(ev, ev.shiftKey);
  }
}
function onMove(ev) { if (ED.drag && ED.drag.move) ED.drag.move(ev); }
function onUp(ev)   { if (ED.drag) { if (ED.drag.end) ED.drag.end(ev); ED.drag = null; } }

function onDblClick(ev) {
  if (!ED.on) return;
  if (ev.target.closest('#edbar, #edinsp')) return;
  if (ev.target.closest('#ov')) return;      /* 개요는 onOvDbl 이 맡는다 */
  var node = ev.target.closest('.el');
  if (!node || !selectable(node) || !slideEditable(curDef())) return;
  ev.preventDefault();
  select([node], false);
  if (node._def.type === 'image') { pickImage(); return; }
  enterText(node);
}

/** ★ preventDefault 만으로는 부족하다 — deck.js 의 발표용 키 처리가 뒤(버블)에서 또 돈다.
 *  예: Esc 로 편집을 끄면 그 직후 엔진이 같은 Esc 를 받아 "개요"를 열어버린다.
 *  편집기가 처리한 키는 반드시 전파까지 끊는다. */
function take(ev) { ev.preventDefault(); ev.stopPropagation(); }

function onKey(ev) {
  var k = ev.key;
  var inField = ev.target && /^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName);

  /* ── Ctrl 조합 — 편집 모드가 아니어도(개요에서도) 동작해야 하는 것들 ── */
  if ((ev.ctrlKey || ev.metaKey) && !inField) {
    if (k === 's' || k === 'S' || k === 'ㄴ') { take(ev); save(); return; }
    /* ⚠ 글을 쓰는 중이면 나머지는 브라우저 기본에 맡긴다 —
       타이핑 도중의 Ctrl+Z 는 "방금 친 글자"를 되돌려야지 슬라이드를 되돌리면 안 된다 */
    if (ED.text) return;
    if (k === 'z' || k === 'Z' || k === 'ㅋ') { take(ev); ev.shiftKey ? redo() : undo(); return; }
    if (k === 'y' || k === 'Y' || k === 'ㅛ') { take(ev); redo(); return; }

    if (ovOpen()) {                                   /* 개요 = 슬라이드 단위 */
      if (k === 'c' || k === 'C' || k === 'ㅊ') { take(ev); ovCopy(false); return; }
      if (k === 'x' || k === 'X' || k === 'ㅌ') { take(ev); ovCopy(true);  return; }
      if (k === 'v' || k === 'V' || k === 'ㅍ') { take(ev); ovPaste();     return; }
      if (k === 'a' || k === 'A' || k === 'ㅁ') { take(ev); ovSelectAll(); return; }
      return;
    }
    if (ED.on) {                                      /* 편집 화면 = 요소 단위 */
      if (k === 'c' || k === 'C' || k === 'ㅊ') { take(ev); elCopy(false); return; }
      if (k === 'x' || k === 'X' || k === 'ㅌ') { take(ev); elCopy(true);  return; }
      if (k === 'v' || k === 'V' || k === 'ㅍ') { take(ev); elPaste();     return; }
      if (k === 'd' || k === 'D' || k === 'ㅇ') { take(ev); duplicateSel(); return; }
      if (k === 'a' || k === 'A' || k === 'ㅁ') {
        take(ev);
        var all = []; (curNode() ? curNode().querySelectorAll('.el') : []).forEach(function (n) { if (selectable(n)) all.push(n); });
        select(all, false); return;
      }
    }
    return;
  }

  /* ── 개요 화면의 장 관리 — 편집 모드가 아니어도 동작한다 ──
     ⚠ 방향키는 "고른 장이 있을 때만" 가져간다. 아무것도 안 골랐으면
       엔진의 앞뒤 장 넘김이 그대로 살아 있어야 한다. */
  if (!inField && !ED.text && ovOpen()) {
    if (k === 'Delete' || k === 'Backspace') { take(ev); ovDel(); return; }
    if ((k === 'ArrowLeft' || k === 'ArrowRight') && ovSel().length) {
      take(ev); ovMove(k === 'ArrowLeft' ? -1 : 1); return;
    }
    if (k === 'Escape' || k === 'o' || k === 'O' || k === 'ㅐ') {
      take(ev); ED.ovSel = []; Deck.toggleOverview(false); return;
    }
  }

  /* 편집 모드 진입/해제 — 입력창 안에서는 글자로 취급한다 */
  if (!ED.on) {
    if (!inField && !ev.ctrlKey && !ev.metaKey && (k === 'e' || k === 'E' || k === 'ㄷ')) {
      take(ev); toggle(true);
    }
    return;
  }
  if (inField) return;

  if (ED.text) {                                    /* 글 쓰는 중에는 Esc 만 가져간다 */
    if (k === 'Escape') { take(ev); exitText(); }
    return;
  }

  if (ovOpen()) return;                                    /* 개요 키는 위에서 이미 처리했다 */
  if (k === 'o' || k === 'O' || k === 'ㅐ') { take(ev); Deck.toggleOverview(true); return; }
  if (k === 'Escape') { take(ev); if (ED.sel.length) select([], false); else toggle(false); return; }
  if (k === 'e' || k === 'E' || k === 'ㄷ') { take(ev); toggle(false); return; }
  if (k === 'Delete' || k === 'Backspace') { take(ev); deleteSel(); return; }
  if (k === 'PageDown') { take(ev); goSlide(Deck.cur + 1); return; }
  if (k === 'PageUp')   { take(ev); goSlide(Deck.cur - 1); return; }
  if (k === 'Tab') {
    take(ev);
    var list = [];
    (curNode() ? curNode().querySelectorAll('.el') : []).forEach(function (n) { if (selectable(n)) list.push(n); });
    if (!list.length) return;
    var i = list.indexOf(ED.sel[0]);
    select([list[(i + (ev.shiftKey ? -1 : 1) + list.length) % list.length]], false);
    return;
  }
  if (/^Arrow/.test(k) && ED.sel.length) {
    take(ev);
    var step = ev.shiftKey ? 10 : 1;
    var dx = (k === 'ArrowLeft' ? -step : k === 'ArrowRight' ? step : 0);
    var dy = (k === 'ArrowUp' ? -step : k === 'ArrowDown' ? step : 0);
    snap();
    ED.sel.forEach(function (n) { n._def.x += dx; n._def.y += dy; applyGeom(n, n._def); });
    refresh();
  }
}

/* ══════════════════════════════════════════════════════════════════════
   12. 켜기 · 끄기 · 부팅
   ════════════════════════════════════════════════════════════════════ */
function toggle(on) {
  if (on === undefined) on = !ED.on;
  if (on === ED.on) return;
  exitText();
  ED.on = on;
  document.body.classList.toggle('editing', on);
  if (!on) { ED.sel = []; toastOff(); }   /* 발표 화면에 편집 알림이 남아 있지 않게 */
  Deck.fit();                       /* 무대 크기가 바뀌었다 — 캔버스를 다시 맞춘다 */
  refresh();
  ovDecorate();
  if (on) toast('편집 모드 — E 로 나가기 · O 개요에서 장 관리 · Ctrl+S 저장');
}
Deck.editorToggle = toggle;

function offerDraft() {
  var raw = null;
  try { raw = localStorage.getItem(DRAFT_KEY); } catch (err) { return; }
  if (!raw || raw === dump()) return;
  var b = $('#eddraft'); if (!b) return;
  b.innerHTML = '';
  b.appendChild(el('span', null, '저장하지 않고 닫은 편집 내용이 있습니다.'));
  b.appendChild(btn('복구', '그 내용으로 되돌리기', function () {
    ED.undo.push(dump()); restore(raw); b.classList.remove('on'); toast('복구했습니다 — 확인 후 저장하세요');
  }, 'pri'));
  b.appendChild(btn('버리기', '초안 삭제', function () {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e2) {}
    b.classList.remove('on');
  }));
  b.classList.add('on');
}

function boot() {
  document.body.classList.add('edok');     /* 편집기를 쓸 수 있는 환경 — 개요 관리 UI 의 표시 조건 */
  buildChrome();
  buildOvBar();

  /* 개요는 엔진이 열고 닫는다(발표 중에도). 열릴 때마다 카드에 편집 표시를 다시 입혀야 하는데,
     엔진은 내부 함수로 여닫아서 훅이 없다 → #ov 의 class 변화를 지켜본다.
     ⚠ buildOverview() 가 카드를 새로 만든 "뒤"에 class 가 바뀌므로 순서도 맞는다. */
  var ovNode = $('#ov');
  if (ovNode && global.MutationObserver) {
    new MutationObserver(function () { ovDecorate(); })
      .observe(ovNode, { attributes: true, attributeFilter: ['class'] });
  }
  document.addEventListener('mousedown', onDown, true);
  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('mouseup', onUp, true);
  document.addEventListener('dblclick', onDblClick, true);
  document.addEventListener('dblclick', onOvDbl, true);
  document.addEventListener('click', onOvClick, true);
  document.addEventListener('keydown', onKey, true);
  ['dragstart', 'dragover', 'drop', 'dragend'].forEach(function (t) {
    document.addEventListener(t, onOvDrag, true);
  });
  window.addEventListener('resize', function () { if (ED.on) refresh(); });
  window.addEventListener('beforeunload', function (e) {
    if (!ED.dirty) return;
    e.preventDefault(); e.returnValue = '';
  });
  Deck.hooks.afterGo.push(function () { if (ED.on) refresh(); });
  offerDraft();
}

/* 진단·자동검사용 창구 (frontend/scripts/check-editor.mjs 가 쓴다).
   사람이 쓰는 기능이 아니라, "손댔을 때 조용히 깨졌는지"를 기계가 확인하는 통로다. */
Deck.ed = ED;
Deck.edFileText = fileText;
Deck.edCheckAll = checkAll;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else setTimeout(boot, 0);

})(window);
