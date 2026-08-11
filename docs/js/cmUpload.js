/* ============================================================================
   STRIX site — Community attachments: inline images + downloadable files
   Single source: community_image_upload_devplan.md

   Classic script (NOT a module). Load order matters:
       auth.js  (provides window._sb / window._user)
         → cmUpload.js  (this file)
           → community.js  (calls window.STRIX_CMUP)

   Responsibilities
     · clipboard paste / drag-drop / file pick  → File objects
     · images: validate → downscale → upload → DRAFT row → `![alt](url)` token
     · files:  validate → upload → DRAFT row → attachment list (no body token)
     · claim drafts for a post/comment on submit, prune tokens the author removed
     · delete Storage objects when a post/comment/attachment goes away

   This file is also the SINGLE SOURCE of the storage URL prefixes that
   community.js whitelists when rendering (see imagePrefix / fileUrl).
   Two buckets on purpose: only the IMAGE bucket prefix is ever turned into an
   <img>, so an uploaded file can never be rendered as an image.
   ============================================================================ */
(function () {
  'use strict'

  // ── constants ──────────────────────────────────────────────────────────────
  var SUPABASE_URL = 'https://vkptgohyktnkrludpwej.supabase.co'
  var PUBLIC_BASE  = SUPABASE_URL + '/storage/v1/object/public/'

  var IMG_BUCKET  = 'community'
  var FILE_BUCKET = 'community-files'
  var IMG_PREFIX  = PUBLIC_BASE + IMG_BUCKET + '/'
  var FILE_PREFIX = PUBLIC_BASE + FILE_BUCKET + '/'

  var MAX_IMAGES       = 10                 // per post / per comment
  var MAX_SOURCE_BYTES = 10 * 1024 * 1024   // image, before downscale
  var MAX_UPLOAD_BYTES = 5  * 1024 * 1024   // image, MUST match bucket limit
  var MAX_EDGE         = 1600               // longest edge after downscale
  var REENCODE_OVER    = 1.5 * 1024 * 1024

  var MAX_FILES      = 5                    // per post / per comment
  var MAX_FILE_BYTES = 20 * 1024 * 1024     // MUST match bucket limit

  var ORPHAN_AGE_MS = 24 * 60 * 60 * 1000
  var PATH_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*\/[A-Za-z0-9._-]+$/

  var EXT_BY_MIME = {
    'image/png':  'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif':  'gif'
  }
  var MIME_BY_EXT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }

  // Kept in lockstep with the ca_fobj_insert policy in
  // supabase-community-attachments-migration.sql. html/svg/xml and every
  // executable form are deliberately absent.
  var FILE_EXT = [
    'pdf', 'zip', '7z', 'gz', 'rar',
    'csv', 'txt', 'log', 'md', 'json',
    'xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'hwp', 'hwpx',
    'dwg', 'dxf',
    'dcr', 'mgt', 'at2', 'out', 'tcl', 'inp', 's2k', 'e2k',
    'png', 'jpg', 'jpeg', 'webp', 'gif'
  ]

  // ── state ──────────────────────────────────────────────────────────────────
  var _seq = 0
  var _sessions = {}   // scope ('post' | 'comment') -> session

  // ── small helpers ──────────────────────────────────────────────────────────
  function sb() { return window._sb || null }
  function uid() { return (window._user && window._user.id) || null }

  function ct(key, fallback) {
    var dict = (window.T && window.T[window.currentLang]) || {}
    var en = (window.T && window.T.en) || {}
    return dict[key] || en[key] || fallback || key
  }

  function showMsg(s, text) {
    if (!s || !s.msgEl) { if (text) console.warn('[cmUpload]', text); return }
    s.msgEl.textContent = text
    if (text) s.msgEl.classList.add('show')
    else s.msgEl.classList.remove('show')
  }

  function rawExt(file) {
    var name = String((file && file.name) || '')
    var m = /\.([A-Za-z0-9]+)$/.exec(name)
    return m ? m[1].toLowerCase() : null
  }

  function imageExtOf(file) {
    var m = String((file && file.type) || '').toLowerCase()
    if (EXT_BY_MIME[m]) return EXT_BY_MIME[m]
    var e = rawExt(file)
    return (e && MIME_BY_EXT[e]) ? EXT_BY_MIME[MIME_BY_EXT[e]] : null
  }

  function imageMimeOf(file) {
    var m = String((file && file.type) || '').toLowerCase()
    if (EXT_BY_MIME[m]) return m
    var e = imageExtOf(file)
    return e ? MIME_BY_EXT[e] : null
  }

  function isImage(file) { return !!imageMimeOf(file) }
  function isAllowedFile(file) {
    var e = rawExt(file)
    return !!e && FILE_EXT.indexOf(e) >= 0
  }

  function displayName(file) {
    var n = String((file && file.name) || 'file')
    // strip control characters only — spaces, hyphens and unicode are preserved
    n = n.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim()
    return (n || 'file').slice(0, 120)
  }

  // alt text lives inside `![ ... ]` and is HTML-escaped later, so strip only
  // the characters that would break the token itself.
  function altOf(file) {
    var name = displayName(file)
    var dot = name.lastIndexOf('.')
    if (dot > 0) name = name.slice(0, dot)
    name = name.replace(/[\[\]()\r\n]/g, ' ').replace(/\s+/g, ' ').trim()
    return (name || 'image').slice(0, 60)
  }

  function rand6() {
    var c = 'abcdefghijklmnopqrstuvwxyz0123456789', out = ''
    for (var i = 0; i < 6; i++) out += c.charAt(Math.floor(Math.random() * c.length))
    return out
  }

  function formatBytes(n) {
    n = Number(n) || 0
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB'
    return (n / (1024 * 1024)).toFixed(1) + ' MB'
  }

  /** Never trust a stored url column — rebuild it from bucket + path. */
  function publicUrl(bucket, path) {
    if (!path || !PATH_RE.test(path) || path.indexOf('..') >= 0) return null
    if (bucket === IMG_BUCKET) return IMG_PREFIX + path
    if (bucket === FILE_BUCKET) return FILE_PREFIX + path
    return null
  }

  function tokenFor(alt, url) { return '![' + alt + '](' + url + ')' }
  function placeholderFor(seq) { return '[uploading image #' + seq + ']' }

  // ── caret-aware text insertion ─────────────────────────────────────────────
  function rememberCaret(s) {
    var ta = s.ta
    if (!ta) return
    s.caret = { start: ta.selectionStart, end: ta.selectionEnd }
  }

  function insertText(s, text) {
    var ta = s.ta
    if (!ta) return false
    var start, end
    if (document.activeElement === ta) { start = ta.selectionStart; end = ta.selectionEnd }
    else if (s.caret) { start = s.caret.start; end = s.caret.end }
    else { start = ta.value.length; end = ta.value.length }
    if (start == null || start > ta.value.length) { start = ta.value.length; end = ta.value.length }
    if (end == null || end < start) end = start

    var before = ta.value.slice(0, start)
    var after = ta.value.slice(end)
    var padL = (before && !/\n$/.test(before)) ? '\n' : ''
    var padR = (after && !/^\n/.test(after)) ? '\n' : ''
    var chunk = padL + text + padR

    var limit = ta.maxLength > 0 ? ta.maxLength : Infinity
    if (before.length + chunk.length + after.length > limit) return false

    ta.value = before + chunk + after
    var pos = before.length + chunk.length
    try { ta.selectionStart = ta.selectionEnd = pos } catch (e) {}
    s.caret = { start: pos, end: pos }
    return true
  }

  function replaceText(s, from, to) {
    var ta = s.ta
    if (!ta || ta.value.indexOf(from) < 0) return false
    ta.value = ta.value.split(from).join(to)
    return true
  }

  function stripText(s, text) {
    var ta = s.ta
    if (!ta || !text || ta.value.indexOf(text) < 0) return
    // swallow one adjacent newline so removals don't pile up blank lines
    ta.value = ta.value.split(text + '\n').join('').split(text).join('')
  }

  // ── image processing ───────────────────────────────────────────────────────
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file)
      var img = new Image()
      img.onload = function () { URL.revokeObjectURL(url); resolve(img) }
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')) }
      img.src = url
    })
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve) {
      if (!canvas.toBlob) { resolve(null); return }
      canvas.toBlob(function (b) { resolve(b) }, type, quality)
    })
  }

  /** Returns { blob, mime, width, height }. GIF passes through untouched. */
  async function processImage(file, mime) {
    var img = null
    try { img = await loadImage(file) } catch (e) { img = null }
    var w = img ? (img.naturalWidth || img.width) : 0
    var h = img ? (img.naturalHeight || img.height) : 0

    if (mime === 'image/gif' || !img || !w || !h) {
      return { blob: file, mime: mime, width: w || null, height: h || null }
    }

    var maxEdge = Math.max(w, h)
    var needResize = maxEdge > MAX_EDGE
    if (!needResize && file.size <= REENCODE_OVER) {
      return { blob: file, mime: mime, width: w, height: h }
    }

    var scale = needResize ? (MAX_EDGE / maxEdge) : 1
    var tw = Math.max(1, Math.round(w * scale))
    var th = Math.max(1, Math.round(h * scale))

    var canvas = document.createElement('canvas')
    canvas.width = tw
    canvas.height = th
    var ctx = canvas.getContext('2d')
    if (!ctx) return { blob: file, mime: mime, width: w, height: h }
    ctx.drawImage(img, 0, 0, tw, th)

    var out = await canvasToBlob(canvas, 'image/webp', 0.85)
    // A browser that cannot encode webp silently produces image/png instead —
    // which keeps alpha, but on a photo can come out far larger than the source
    // and blow the bucket cap. Fall back to jpeg only when png is actually big.
    if (out && out.type === 'image/png' && out.size > REENCODE_OVER) {
      var jpg = await canvasToBlob(canvas, 'image/jpeg', 0.88)
      if (jpg && jpg.type === 'image/jpeg' && jpg.size < out.size) out = jpg
    }
    if (!out || !EXT_BY_MIME[out.type]) out = await canvasToBlob(canvas, 'image/jpeg', 0.88)
    if (!out || !EXT_BY_MIME[out.type]) return { blob: file, mime: mime, width: w, height: h }
    if (!needResize && out.size >= file.size) return { blob: file, mime: mime, width: w, height: h }

    return { blob: out, mime: out.type, width: tw, height: th }
  }

  // ── chips UI ───────────────────────────────────────────────────────────────
  function paintChips(s) {
    var box = s.chipsEl
    if (!box) return
    box.textContent = ''
    if (!s.items.length) { box.style.display = 'none'; return }
    box.style.display = 'flex'

    s.items.forEach(function (it) {
      var chip = document.createElement('div')
      chip.className = 'cm-chip' + (it.kind === 'file' ? ' file' : '') + (it.status === 'err' ? ' err' : '')

      if (it.kind === 'image' && it.thumb) {
        var img = document.createElement('img')
        img.src = it.thumb
        img.alt = ''
        chip.appendChild(img)
      } else if (it.kind === 'file') {
        var ico = document.createElement('span')
        ico.className = 'cm-chip-ico'
        ico.textContent = '📎'
        chip.appendChild(ico)
        var nm = document.createElement('span')
        nm.className = 'cm-chip-n'
        nm.textContent = it.name
        nm.title = it.name
        chip.appendChild(nm)
        var sz = document.createElement('span')
        sz.className = 'cm-chip-b'
        sz.textContent = formatBytes(it.bytes)
        chip.appendChild(sz)
      }

      if (it.status !== 'done') {
        var st = document.createElement('span')
        st.className = 'cm-chip-st'
        st.textContent = it.status === 'up'
          ? ct('comm.attUploading', 'Uploading…')
          : (it.errText || ct('comm.attFail', 'Upload failed.'))
        chip.appendChild(st)
      }

      var x = document.createElement('button')
      x.type = 'button'
      x.className = 'cm-chip-x'
      x.title = ct('comm.attRemove', 'Remove')
      x.setAttribute('aria-label', ct('comm.attRemove', 'Remove'))
      x.textContent = '×'
      x.onclick = function (ev) { ev.preventDefault(); ev.stopPropagation(); removeOne(s.scope, it.seq) }
      chip.appendChild(x)

      box.appendChild(chip)
    })
  }

  function dropItem(s, it) {
    if (it.thumb) { try { URL.revokeObjectURL(it.thumb) } catch (e) {} it.thumb = null }
    var i = s.items.indexOf(it)
    if (i >= 0) s.items.splice(i, 1)
  }

  /**
   * How many attachments of `kind` this parent would end up with.
   * s.base counts what is ALREADY saved on the post/comment being edited —
   * without it the "10 images per post" cap would only apply per compose
   * session, so re-editing a full post could double the real count.
   */
  function countLive(s, kind) {
    var base = (s.base && s.base[kind]) || 0
    return base + s.items.filter(function (i) { return i.kind === kind && i.status !== 'err' }).length
  }

  function clearBaseline(s) { s.base = { image: 0, file: 0 } }

  /** Seed s.base from what the post/comment already holds (edit screen). */
  async function loadBaseline(scope, kind, parentId) {
    var s = _sessions[scope]
    if (!s) return
    clearBaseline(s)
    if (!parentId || !sb()) return
    var col = kind === 'comment' ? 'comment_id' : 'post_id'
    var r = await sb().from('community_attachments').select('kind').eq(col, parentId)
    ;((r && r.data) || []).forEach(function (x) {
      if (s.base[x.kind] != null) s.base[x.kind]++
    })
  }

  // ── upload pipeline ────────────────────────────────────────────────────────
  async function eraseRemote(it) {
    if (!it || !sb()) return
    try { if (it.path) await sb().storage.from(it.bucket).remove([it.path]) } catch (e) {}
    try { if (it.id) await sb().from('community_attachments').delete().eq('id', it.id) } catch (e) {}
    it.path = null
    it.id = null
  }

  function enqueue(s, file, forceKind) {
    if (!sb()) return
    if (!uid()) { showMsg(s, ct('comm.attFailAuth', 'Please log in to attach files.')); return }

    var kind = forceKind || (isImage(file) ? 'image' : 'file')

    if (kind === 'image') {
      if (countLive(s, 'image') >= MAX_IMAGES) {
        showMsg(s, ct('comm.attFailImgCount', 'Up to 10 images per post.')); return
      }
      var mime = imageMimeOf(file)
      if (!mime) { showMsg(s, ct('comm.attFailType', 'Unsupported file type.')); return }
      if (file.size > MAX_SOURCE_BYTES) { showMsg(s, ct('comm.attFailImgSize', 'Image is too large (max 10 MB).')); return }
      startImage(s, file, mime)
      return
    }

    if (countLive(s, 'file') >= MAX_FILES) {
      showMsg(s, ct('comm.attFailFileCount', 'Up to 5 files per post.')); return
    }
    if (!isAllowedFile(file)) { showMsg(s, ct('comm.attFailType', 'Unsupported file type.')); return }
    if (file.size > MAX_FILE_BYTES) { showMsg(s, ct('comm.attFailFileSize', 'File is too large (max 20 MB).')); return }
    startFile(s, file)
  }

  function startImage(s, file, mime) {
    var it = newItem('image', file)
    var ph = placeholderFor(it.seq)
    if (!insertText(s, ph)) {
      if (it.thumb) { try { URL.revokeObjectURL(it.thumb) } catch (e) {} }
      showMsg(s, ct('comm.attFailRoom', 'Not enough room left in the post body.'))
      return
    }
    it.placeholder = ph
    try { it.thumb = URL.createObjectURL(file) } catch (e) { it.thumb = null }
    s.items.push(it)
    showMsg(s, '')
    paintChips(s)
    runImage(s, it, file, mime)
  }

  function startFile(s, file) {
    var it = newItem('file', file)
    s.items.push(it)
    showMsg(s, '')
    paintChips(s)
    runFile(s, it, file)
  }

  function newItem(kind, file) {
    return {
      seq: ++_seq,
      kind: kind,
      bucket: kind === 'image' ? IMG_BUCKET : FILE_BUCKET,
      status: 'up',
      name: displayName(file),
      bytes: file.size,
      alt: kind === 'image' ? altOf(file) : null,
      token: null,
      placeholder: null,
      path: null,
      id: null,
      url: null,
      linked: false,
      cancelled: false,
      errText: null,
      thumb: null
    }
  }

  async function upload(it, blob, mime, ext) {
    var owner = uid()
    if (!owner) throw new Error('AUTH')
    var path = owner + '/' + Date.now() + '-' + rand6() + '.' + ext
    var opt = { contentType: mime || 'application/octet-stream', upsert: false, cacheControl: '31536000' }
    var up = await sb().storage.from(it.bucket).upload(path, blob, opt)
    if (up && up.error) {
      // Retry ONLY a name collision. Retrying a 413 or an RLS denial just wastes
      // a round trip and then reports the second, less useful error.
      var em = String((up.error && up.error.message) || '')
      if (!/already exists|duplicate|resource already|409/i.test(em)) throw up.error
      path = owner + '/' + Date.now() + '-' + rand6() + '.' + ext
      up = await sb().storage.from(it.bucket).upload(path, blob, opt)
      if (up && up.error) throw up.error
    }
    it.path = path
    it.url = publicUrl(it.bucket, path)
    if (!it.url) throw new Error('PATH')

    var ins = await sb().from('community_attachments')
      .insert({
        owner_id: owner, kind: it.kind, bucket: it.bucket,
        path: path, url: it.url, name: it.name,
        mime: mime || 'application/octet-stream', bytes: blob.size,
        width: it.width || null, height: it.height || null
      })
      .select('id').single()
    if (ins && ins.error) throw ins.error
    it.id = ins.data && ins.data.id
  }

  async function runImage(s, it, file, mime) {
    try {
      var proc = await processImage(file, mime)
      // A GIF is never re-encoded (animation), so a big one can still be over
      // the bucket cap after "processing" — that needs its own message.
      if (proc.blob.size > MAX_UPLOAD_BYTES) throw new Error('IMGBIG')
      var ext = EXT_BY_MIME[proc.mime]
      if (!ext) throw new Error('TYPE')
      it.width = proc.width
      it.height = proc.height
      it.bytes = proc.blob.size

      await upload(it, proc.blob, proc.mime, ext)
      if (it.cancelled) {
        // cancelled mid-flight: the placeholder is still sitting in the body and
        // nothing else will ever take it out
        if (it.placeholder) { stripText(s, it.placeholder); it.placeholder = null }
        await eraseRemote(it); dropItem(s, it); paintChips(s); return
      }

      it.status = 'done'
      it.token = tokenFor(it.alt, it.url)
      if (!replaceText(s, it.placeholder, it.token)) {
        // the author deleted the placeholder mid-upload — don't lose the image
        insertText(s, it.token)
      }
      it.placeholder = null
      paintChips(s)
    } catch (err) {
      await failItem(s, it, err)
    }
  }

  async function runFile(s, it, file) {
    try {
      var ext = rawExt(file)
      if (!ext || FILE_EXT.indexOf(ext) < 0) throw new Error('TYPE')
      await upload(it, file, file.type || 'application/octet-stream', ext)
      if (it.cancelled) { await eraseRemote(it); dropItem(s, it); paintChips(s); return }
      it.status = 'done'
      paintChips(s)
    } catch (err) {
      await failItem(s, it, err)
    }
  }

  async function failItem(s, it, err) {
    await eraseRemote(it)
    if (it.placeholder) { stripText(s, it.placeholder); it.placeholder = null }
    it.status = 'err'
    it.errText = errorText(it, err)
    showMsg(s, it.errText)
    paintChips(s)
  }

  function errorText(it, err) {
    var m = String((err && (err.message || err.error_description || err.error)) || err || '')
    if (/CA_RATE_LIMIT/.test(m)) return ct('comm.attFailRate', 'Too many uploads. Please try again later.')
    if (m === 'IMGBIG') return ct('comm.attFailImgBig', 'This image could not be compressed under 5 MB.')
    if (/exceeded the maximum allowed size|payload too large|413/i.test(m)) {
      return it.kind === 'file'
        ? ct('comm.attFailFileSize', 'File is too large (max 20 MB).')
        : ct('comm.attFailImgBig', 'This image could not be compressed under 5 MB.')
    }
    if (m === 'TYPE' || m === 'PATH' || /mime type|not supported|invalid_mime/i.test(m)) {
      return ct('comm.attFailType', 'Unsupported file type.')
    }
    if (m === 'AUTH' || /jwt|not authenticated|unauthorized|401/i.test(m)) {
      return ct('comm.attFailAuth', 'Please log in to attach files.')
    }
    if (/row-level security|violates|403/i.test(m)) return ct('comm.attFailDenied', 'Upload was rejected.')
    return ct('comm.attFail', 'Upload failed.') + (m ? ' ' + m : '')
  }

  // ── event binding ──────────────────────────────────────────────────────────
  function filesFromPaste(e) {
    var dt = e.clipboardData
    if (!dt) return []
    var out = []
    var items = dt.items ? Array.prototype.slice.call(dt.items) : []
    items.forEach(function (i) {
      if (i.kind === 'file') {
        var f = i.getAsFile()
        if (f) out.push(f)
      }
    })
    if (!out.length && dt.files && dt.files.length) {
      out = Array.prototype.slice.call(dt.files)
    }
    return out.filter(function (f) { return isImage(f) || isAllowedFile(f) })
  }

  function bindEvents(s, ta) {
    ta.addEventListener('paste', function (e) {
      var files = filesFromPaste(e)
      if (!files.length) return           // plain text paste must still work
      e.preventDefault()
      rememberCaret(s)
      files.forEach(function (f) { enqueue(s, f) })
    })

    ta.addEventListener('dragover', function (e) {
      if (!e.dataTransfer) return
      e.preventDefault()
      ta.classList.add('cm-drop')
    })
    ta.addEventListener('dragleave', function () { ta.classList.remove('cm-drop') })
    ta.addEventListener('drop', function (e) {
      ta.classList.remove('cm-drop')
      var list = e.dataTransfer && e.dataTransfer.files
      if (!list || !list.length) return
      // swallow the drop unconditionally: without this the browser NAVIGATES to
      // a dropped file we rejected, throwing the half-written post away
      e.preventDefault()
      var files = Array.prototype.slice.call(list).filter(function (f) { return isImage(f) || isAllowedFile(f) })
      if (!files.length) { showMsg(s, ct('comm.attFailType', 'Unsupported file type.')); return }
      rememberCaret(s)
      files.forEach(function (f) { enqueue(s, f) })
    })

    ;['keyup', 'click', 'input', 'blur'].forEach(function (ev) {
      ta.addEventListener(ev, function () { rememberCaret(s) })
    })
  }

  // ── public API ─────────────────────────────────────────────────────────────
  function attach(ta, opts) {
    opts = opts || {}
    var scope = opts.scope || 'post'
    var s = _sessions[scope]
    if (!s) {
      s = _sessions[scope] = { scope: scope, items: [], caret: null, ta: null, chipsEl: null, msgEl: null }
      clearBaseline(s)
    }
    if (!s.base) clearBaseline(s)
    if (!ta) { s.ta = null; s.chipsEl = null; s.msgEl = null; return s }
    s.ta = ta
    s.chipsEl = opts.chipsEl || null
    s.msgEl = opts.msgEl || null
    if (!ta.__cmupBound) { bindEvents(s, ta); ta.__cmupBound = true }
    paintChips(s)
    return s
  }

  function pick(scope, kind) {
    var s = _sessions[scope]
    if (!s || !s.ta) return
    rememberCaret(s)
    var input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = kind === 'file'
      ? FILE_EXT.map(function (e) { return '.' + e }).join(',')
      : 'image/png,image/jpeg,image/webp,image/gif'
    input.onchange = function (e) {
      var list = e.target.files
      if (!list) return
      Array.prototype.slice.call(list).forEach(function (f) {
        enqueue(s, f, kind === 'file' ? 'file' : 'image')
      })
    }
    input.click()
  }

  async function removeOne(scope, seq) {
    var s = _sessions[scope]
    if (!s) return
    var it = null
    for (var i = 0; i < s.items.length; i++) { if (s.items[i].seq === seq) { it = s.items[i]; break } }
    if (!it) return

    if (it.status === 'up') {
      // the request cannot be aborted, so the chip stays until it lands — but
      // take the placeholder out of the body right away so the author sees it go
      it.cancelled = true
      if (it.placeholder) { stripText(s, it.placeholder); it.placeholder = null }
      return
    }
    if (it.token) stripText(s, it.token)
    if (it.placeholder) stripText(s, it.placeholder)
    if (!it.linked) await eraseRemote(it)
    dropItem(s, it)
    paintChips(s)
  }

  function hasPending(scope) {
    var s = _sessions[scope]
    return !!(s && s.items.some(function (i) { return i.status === 'up' }))
  }

  /** Claim this session's drafts for a freshly saved post/comment. */
  async function linkTo(scope, kind, parentId) {
    var s = _sessions[scope]
    if (!s || !parentId || !sb()) return {}
    var ids = s.items
      .filter(function (i) { return i.status === 'done' && !i.linked && i.id })
      .map(function (i) { return i.id })
    if (!ids.length) return {}

    var patch = kind === 'comment' ? { comment_id: parentId } : { post_id: parentId }
    var res = await sb().from('community_attachments').update(patch).in('id', ids)
    if (res && res.error) return { error: res.error }
    s.items.forEach(function (i) { if (ids.indexOf(i.id) >= 0) i.linked = true })
    return {}
  }

  /**
   * Delete IMAGE attachments of a parent whose token is no longer in the body.
   * Files are never pruned — they live in the attachment list, not in the body.
   */
  async function prune(kind, parentId, body) {
    if (!parentId || !sb()) return
    var col = kind === 'comment' ? 'comment_id' : 'post_id'
    var res = await sb().from('community_attachments')
      .select('id,bucket,path').eq(col, parentId).eq('kind', 'image')
    if (!res || res.error || !res.data || !res.data.length) return
    var text = String(body || '')
    var dead = res.data.filter(function (r) {
      var u = publicUrl(r.bucket, r.path)
      return !u || text.indexOf(u) < 0
    })
    if (!dead.length) return
    try { await sb().storage.from(IMG_BUCKET).remove(dead.map(function (d) { return d.path })) } catch (e) {}
    try { await sb().from('community_attachments').delete().in('id', dead.map(function (d) { return d.id })) } catch (e) {}
  }

  /** Drop every not-yet-claimed upload of a session (compose cancelled). */
  async function discard(scope) {
    var s = _sessions[scope]
    if (!s) return
    var doomed = s.items.filter(function (i) { return !i.linked })
    s.items = s.items.filter(function (i) { return i.linked })
    clearBaseline(s)          // the next compose target sets its own
    paintChips(s)
    for (var i = 0; i < doomed.length; i++) {
      if (doomed[i].status === 'up') { doomed[i].cancelled = true; continue }
      await eraseRemote(doomed[i])
      if (doomed[i].thumb) { try { URL.revokeObjectURL(doomed[i].thumb) } catch (e) {} }
    }
  }

  function reset(scope) {
    var s = _sessions[scope]
    if (!s) return
    s.items.forEach(function (i) { if (i.thumb) { try { URL.revokeObjectURL(i.thumb) } catch (e) {} } })
    s.items = []
    s.caret = null
    clearBaseline(s)
    paintChips(s)
  }

  /**
   * Fetch FILE attachments for a post and its comments, sanitised for rendering.
   * Returns { post: [row], byComment: { <commentId>: [row] } } where each row is
   * { id, url, name, bytes } and url was rebuilt from bucket+path (never trusted).
   */
  async function fetchFiles(postId, commentIds) {
    var out = { post: [], byComment: {} }
    if (!sb()) return out
    var cols = 'id,bucket,path,name,bytes,post_id,comment_id,created_at'

    function take(rows) {
      return (rows || []).map(function (r) {
        var u = publicUrl(r.bucket, r.path)
        if (!u) return null
        return { id: r.id, url: u, name: String(r.name || 'file').slice(0, 120), bytes: r.bytes, commentId: r.comment_id }
      }).filter(Boolean)
    }

    // both queries are independent — run them together, not one after the other
    var qPost = postId
      ? sb().from('community_attachments').select(cols)
          .eq('post_id', postId).eq('kind', 'file').order('created_at', { ascending: true })
      : null
    var qComments = (commentIds && commentIds.length)
      ? sb().from('community_attachments').select(cols)
          .in('comment_id', commentIds).eq('kind', 'file').order('created_at', { ascending: true })
      : null

    var pair = await Promise.all([qPost, qComments])
    var a = pair[0], b = pair[1]

    if (a && a.data) out.post = take(a.data)
    if (b && b.data) {
      take(b.data).forEach(function (r) {
        if (!out.byComment[r.commentId]) out.byComment[r.commentId] = []
        out.byComment[r.commentId].push(r)
      })
    }
    return out
  }

  /**
   * Storage objects are NOT removed by the row cascade — Postgres knows nothing
   * about Storage. Call this BEFORE deleting the post/comment, while the rows
   * that point at the objects still exist.
   */
  async function removeForPost(postId) {
    if (!postId || !sb()) return
    var byBucket = {}
    function add(rows) {
      (rows || []).forEach(function (r) {
        if (!r.path || !r.bucket) return
        if (!byBucket[r.bucket]) byBucket[r.bucket] = []
        byBucket[r.bucket].push(r.path)
      })
    }
    var a = await sb().from('community_attachments').select('bucket,path').eq('post_id', postId)
    add(a && a.data)

    var c = await sb().from('community_comments').select('id').eq('post_id', postId)
    var cids = ((c && c.data) || []).map(function (r) { return r.id })
    if (cids.length) {
      var b = await sb().from('community_attachments').select('bucket,path').in('comment_id', cids)
      add(b && b.data)
    }
    await removeByBucket(byBucket)
  }

  async function removeForComment(commentId) {
    if (!commentId || !sb()) return
    var a = await sb().from('community_attachments').select('bucket,path').eq('comment_id', commentId)
    var byBucket = {}
    ;((a && a.data) || []).forEach(function (r) {
      if (!r.path || !r.bucket) return
      if (!byBucket[r.bucket]) byBucket[r.bucket] = []
      byBucket[r.bucket].push(r.path)
    })
    await removeByBucket(byBucket)
  }

  /** Delete one already-saved attachment (used by the edit screen). */
  async function deleteAttachment(id) {
    if (!id || !sb()) return { error: { message: 'no id' } }
    var r = await sb().from('community_attachments').select('bucket,path').eq('id', id).single()
    if (r && r.error) return { error: r.error }
    if (r && r.data && r.data.path) {
      try { await sb().storage.from(r.data.bucket).remove([r.data.path]) } catch (e) {}
    }
    var d = await sb().from('community_attachments').delete().eq('id', id)
    if (d && d.error) return { error: d.error }
    return {}
  }

  async function removeByBucket(byBucket) {
    var buckets = Object.keys(byBucket)
    for (var i = 0; i < buckets.length; i++) {
      if (!byBucket[buckets[i]].length) continue
      try { await sb().storage.from(buckets[i]).remove(byBucket[buckets[i]]) } catch (e) {}
    }
  }

  /**
   * Admin sweep. Two independent leaks:
   *   ⓐ draft rows older than 24 h (composed, never submitted)
   *   ⓑ Storage objects whose row is already gone — e.g. a commenter's file on
   *      a post deleted by the post author: the row cascaded, the object did not
   */
  async function sweepOrphans() {
    if (!sb()) return { drafts: 0, files: 0, error: 'no client' }
    var drafts = 0, files = 0

    var o = await sb().rpc('ca_list_orphans')
    if (o && o.error) return { drafts: 0, files: 0, error: o.error.message }
    var rows = (o && o.data) || []
    if (rows.length) {
      var byBucket = {}
      rows.forEach(function (r) {
        if (!byBucket[r.bucket]) byBucket[r.bucket] = []
        byBucket[r.bucket].push(r.path)
      })
      await removeByBucket(byBucket)
      var del = await sb().from('community_attachments').delete().in('id', rows.map(function (r) { return r.id }))
      if (!del || !del.error) drafts = rows.length
    }

    var known = {}
    var kp = await sb().rpc('ca_all_paths')
    if (kp && kp.error) return { drafts: drafts, files: 0, error: kp.error.message }
    ;((kp && kp.data) || []).forEach(function (r) { known[r.bucket + '/' + r.path] = true })

    var cutoff = Date.now() - ORPHAN_AGE_MS
    var buckets = [IMG_BUCKET, FILE_BUCKET]
    for (var bi = 0; bi < buckets.length; bi++) {
      var bucket = buckets[bi]
      var stale = []
      var roots = await sb().storage.from(bucket).list('', { limit: 1000 })
      var folders = (roots && roots.data) || []
      for (var i = 0; i < folders.length; i++) {
        var f = folders[i]
        if (!f || !f.name || f.name === '.emptyFolderPlaceholder') continue
        if (f.id) continue                                   // a file at the root — not ours
        var page = await sb().storage.from(bucket).list(f.name, { limit: 1000 })
        var entries = (page && page.data) || []
        if (entries.length >= 1000) {
          console.warn('[cmUpload] sweep: ' + bucket + '/' + f.name + ' hit the 1000-entry page limit; some objects were not examined')
        }
        for (var j = 0; j < entries.length; j++) {
          var en = entries[j]
          if (!en || !en.name || en.name === '.emptyFolderPlaceholder' || !en.id) continue
          var full = f.name + '/' + en.name
          if (known[bucket + '/' + full]) continue
          var made = Date.parse(en.created_at || en.updated_at || '')
          // no usable timestamp → leave it alone. Deleting on an unparsable date
          // could destroy an upload that is still in flight.
          if (!isFinite(made) || made > cutoff) continue
          stale.push(full)
        }
      }
      if (stale.length) {
        try { await sb().storage.from(bucket).remove(stale); files += stale.length } catch (e) {}
      }
    }
    return { drafts: drafts, files: files }
  }

  // ── export (classic script: top-level vars do NOT attach to window) ────────
  window.STRIX_CMUP = {
    imagePrefix: function () { return IMG_PREFIX },
    filePrefix: function () { return FILE_PREFIX },
    publicUrl: publicUrl,
    formatBytes: formatBytes,
    maxImages: MAX_IMAGES,
    maxFiles: MAX_FILES,
    attach: attach,
    loadBaseline: loadBaseline,
    pick: pick,
    removeOne: removeOne,
    hasPending: hasPending,
    linkTo: linkTo,
    prune: prune,
    discard: discard,
    reset: reset,
    fetchFiles: fetchFiles,
    deleteAttachment: deleteAttachment,
    removeForPost: removeForPost,
    removeForComment: removeForComment,
    sweepOrphans: sweepOrphans
  }
})()
