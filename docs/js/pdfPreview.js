/* ============================================================================
   pdfPreview.js — per-benchmark PDF preview lightbox (single source, shared).
   Any page that includes this script gets working <tr data-pdf="..."
   data-title="..."> rows for free: click opens the PDF (native browser
   viewer) in a draggable/resizable lightbox, with a pop-out-to-new-window
   button for moving the preview to another monitor (a DOM modal can never
   render outside its host browser window, so a real OS window is the only
   way to do that — see verification_site_devplan.md Phase 1.5).
   Styling lives in css/components.css; this file only builds the DOM/behavior.
   ============================================================================ */
(function () {
  'use strict';

  function buildModal() {
    var modal = document.createElement('div');
    modal.id = 'pdfPreviewModal';
    modal.className = 'modal-overlay';
    modal.innerHTML =
      '<div class="pdf-modal-box">' +
        '<div class="pdf-modal-head">' +
          '<span id="pdfPreviewTitle"></span>' +
          '<div class="pdf-modal-actions">' +
            '<button type="button" class="pdf-modal-pop" title="Open in a new window (drag that window to another monitor)">⤢</button>' +
            '<button type="button" class="pdf-modal-close" aria-label="Close preview">&times;</button>' +
          '</div>' +
        '</div>' +
        '<iframe id="pdfPreviewFrame" src="" title="Benchmark report preview"></iframe>' +
      '</div>';
    document.body.appendChild(modal);
    return modal;
  }

  function init() {
    var modal = document.getElementById('pdfPreviewModal') || buildModal();
    var box   = modal.querySelector('.pdf-modal-box');
    var head  = modal.querySelector('.pdf-modal-head');
    var frame = document.getElementById('pdfPreviewFrame');
    var title = document.getElementById('pdfPreviewTitle');
    var popBtn = modal.querySelector('.pdf-modal-pop');
    if (!box || !head || !frame) return;

    // Centered only on the very first open — box.dataset.positioned then sticks so a later
    // drag/resize (native CSS `resize`, both write inline style) survives across opens/rows.
    function centerBoxOnce() {
      if (box.dataset.positioned) return;
      var w = Math.min(920, window.innerWidth * 0.92);
      var h = window.innerHeight * 0.88;
      box.style.width  = w + 'px';
      box.style.height = h + 'px';
      box.style.left = Math.round((window.innerWidth - w) / 2) + 'px';
      box.style.top  = Math.round((window.innerHeight - h) / 2) + 'px';
      box.dataset.positioned = '1';
    }

    function open(tr) {
      centerBoxOnce();
      var pdf = tr.getAttribute('data-pdf');
      frame.src = pdf;
      title.textContent = tr.getAttribute('data-title') || '';
      if (popBtn) popBtn.dataset.pdf = pdf || '';
      modal.classList.add('open');
    }
    function close() {
      modal.classList.remove('open');
      frame.src = ''; // stop the embedded PDF viewer while hidden
    }

    document.addEventListener('click', function (e) {
      var row = e.target.closest && e.target.closest('tr[data-pdf]');
      if (row) { open(row); return; }
      // Pop-out — a real OS window (not a page element), so it can be freely dragged to any
      // monitor via the browser's own window chrome, which a DOM modal can never do.
      if (e.target.closest && e.target.closest('.pdf-modal-pop')) {
        var url = popBtn && popBtn.dataset.pdf;
        if (url) window.open(url, '_blank', 'width=900,height=1040,menubar=no,toolbar=no');
        return;
      }
      if (e.target === modal || (e.target.closest && e.target.closest('.pdf-modal-close'))) close();
    });
    document.addEventListener('keydown', function (e) {
      var row = e.target.closest && e.target.closest('tr[data-pdf]');
      if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(row); return; }
      if (e.key === 'Escape') close();
    });

    // Drag-to-move by the title bar, mirroring the app's DraggableModal pattern.
    var drag = null;
    head.addEventListener('mousedown', function (e) {
      if (e.target.closest && e.target.closest('button')) return; // let toolbar buttons work
      var rect = box.getBoundingClientRect();
      drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!drag) return;
      box.style.left = (e.clientX - drag.dx) + 'px';
      box.style.top  = (e.clientY - drag.dy) + 'px';
    });
    document.addEventListener('mouseup', function () { drag = null; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
