/* ============================================================================
   STRIX site — auth, profile, members, admin image upload (Supabase + Cloudinary)
   Classic script (NOT a module): functions are global so inline onclick handlers
   and board.js can call them. Requires i18n.js (window.T / window.currentLang).
   ============================================================================ */

// ── SUPABASE ──
const _sb = window.supabase.createClient(
  'https://vkptgohyktnkrludpwej.supabase.co',
  'sb_publishable_g9dLaqgEqjyjEo8FlRdsKA_h131qxJM'
)
// billing.js (pricing/account) reads `window._sb`/`_user`/`_profile`. In a classic
// (non-module) script, top-level const/let do NOT attach to window, so publish _sb here
// and _user/_profile in updateAuthUI() — otherwise billing.js boot is skipped (blank page).
window._sb = _sb

// Download URLs (GitHub Releases)
const DL = {
  win:   'https://github.com/ksb3171-a11y/DCR-releases/releases/latest/download/DCR-Setup.exe',
  mac:   '#',
  linux: '#'
}

// ── ADMIN IMAGE MANAGEMENT ──
const ADMIN_EMAIL = 'ksb3171@gmail.com'
const CLOUDINARY_CLOUD = 'dbdamtf2t'
const CLOUDINARY_PRESET = 'homepage-images'
const CLOUDINARY_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto/`
const CLOUDINARY_UPLOAD = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`

function createUploadOverlay() {
  const ov = document.createElement('div')
  ov.className = 'upload-overlay'
  ov.innerHTML = '<span style="font-size:28px">📷</span><span>Click to upload image</span>'
  return ov
}

async function loadSiteImages() {
  const { data: rows } = await _sb.from('site_images').select('key, url')
  const urlMap = {}
  if (rows) rows.forEach(r => urlMap[r.key] = r.url)

  document.querySelectorAll('[data-image-key]').forEach(el => {
    const key = el.getAttribute('data-image-key')
    if (urlMap[key]) { showImage(el, urlMap[key]); return }
    // Fallback: probe default Cloudinary path
    const url = CLOUDINARY_URL + 'dcr-homepage/' + key
    const probe = new Image()
    const bust = '?v=' + Date.now()
    probe.onload = () => showImage(el, url + bust)
    probe.onerror = () => {}
    probe.src = url + bust
  })
}

function showImage(el, url) {
  const h = el.style.height
  el.innerHTML = ''
  el.removeAttribute('data-label')
  el.style.cssText += ';background:none;border:none;padding:0;'
  const img = document.createElement('img')
  img.src = url
  img.style.cssText = 'width:100%;height:' + (h || '100%') + ';object-fit:cover;display:block;border-radius:inherit;'
  el.appendChild(img)
  if (document.body.classList.contains('admin-mode')) el.appendChild(createUploadOverlay())
}

function enableAdminMode() {
  if (document.body.classList.contains('admin-mode')) return
  document.body.classList.add('admin-mode')
  const badge = document.getElementById('adminBadge')
  if (badge) badge.style.display = 'flex'
  document.querySelectorAll('[data-image-key]').forEach(el => {
    el.style.position = 'relative'
    el.appendChild(createUploadOverlay())
    el.addEventListener('click', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const key = el.getAttribute('data-image-key')
        el.style.opacity = '0.5'
        const fd = new FormData()
        fd.append('file', file)
        fd.append('upload_preset', CLOUDINARY_PRESET)
        fd.append('public_id', 'dcr-homepage/' + key + '_' + Date.now())
        try {
          const res = await fetch(CLOUDINARY_UPLOAD, { method: 'POST', body: fd })
          const data = await res.json()
          el.style.opacity = '1'
          if (data.error) { alert('Upload failed: ' + data.error.message); return }
          const newUrl = data.secure_url
          await _sb.from('site_images').upsert({ key, url: newUrl })
          showImage(el, newUrl)
        } catch (err) {
          el.style.opacity = '1'
          alert('Upload failed: ' + err.message)
        }
      }
      input.click()
    })
  })
}

// ── ADMIN MEMBERS MODAL ──
async function openMembersModal() {
  document.getElementById('membersModal').classList.add('open')
  const tbody = document.getElementById('membersTableBody')
  const footer = document.getElementById('membersFooter')
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#555;padding:32px">Loading...</td></tr>'

  const { data: profiles, error } = await _sb
    .from('profiles')
    .select('id, name, expires_at, is_blocked, created_at')
    .order('created_at', { ascending: false })

  if (error || !profiles) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#f48771;padding:32px">Failed to load: ' + (error?.message || 'unknown') + '</td></tr>'
    return
  }

  const { data: { users } } = await _sb.auth.admin.listUsers().catch(() => ({ data: { users: [] } }))
  const emailMap = {}
  if (users) users.forEach(u => emailMap[u.id] = u.email)

  const now = new Date()
  tbody.innerHTML = profiles.map((p, i) => {
    const exp = p.expires_at ? new Date(p.expires_at) : null
    const active = exp && exp > now
    const expText = exp ? exp.toLocaleDateString('ko-KR') : '–'
    const status = exp
      ? (active ? '<span class="badge-active">Active</span>' : '<span class="badge-expired">Expired</span>')
      : '–'
    const joined = p.created_at ? new Date(p.created_at).toLocaleString('ko-KR') : '–'
    const email = emailMap[p.id] || '–'
    const blocked = p.is_blocked ? '<span style="color:#f48771;font-weight:700">Yes</span>' : '–'
    return `<tr>
      <td>${i + 1}</td>
      <td>${p.name || '–'}</td>
      <td>${email}</td>
      <td>${expText}</td>
      <td>${status}</td>
      <td>${blocked}</td>
      <td>${joined}</td>
    </tr>`
  }).join('')

  const activeCount = profiles.filter(p => p.expires_at && new Date(p.expires_at) > now).length
  footer.textContent = `Total: ${profiles.length} members  |  Active: ${activeCount}  |  Expired: ${profiles.length - activeCount}`
}

function closeMembersModal() {
  document.getElementById('membersModal').classList.remove('open')
}

// ── AUTH STATE ──
let _user = null, _profile = null

// ── MODAL ──
function openModal(type) {
  document.getElementById(type === 'login' ? 'loginModal' : 'signupModal').classList.add('open')
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open')
}
function switchModal(from, to) {
  closeModal(from + 'Modal')
  openModal(to)
}

// ── LOGIN ──
async function handleLogin(e) {
  e.preventDefault()
  const btn = document.getElementById('loginBtn')
  const err = document.getElementById('loginError')
  btn.disabled = true; err.classList.remove('show')

  const { data, error } = await _sb.auth.signInWithPassword({
    email:    document.getElementById('li_email').value.trim(),
    password: document.getElementById('li_password').value
  })

  if (error) {
    err.textContent = error.message; err.classList.add('show')
    btn.disabled = false; return
  }
  await loadProfile(data.user)
  closeModal('loginModal')
  document.getElementById('loginForm').reset()
  btn.disabled = false
}

// ── SIGNUP ──
async function handleSignup(e) {
  e.preventDefault()
  const btn     = document.getElementById('signupBtn')
  const err     = document.getElementById('signupError')
  const success = document.getElementById('signupSuccess')
  btn.disabled = true; err.classList.remove('show'); success.classList.remove('show')

  const pw  = document.getElementById('su_password').value
  const pw2 = document.getElementById('su_pw_confirm').value
  const t   = T[currentLang] || T.en

  if (pw !== pw2) {
    err.textContent = t['auth.err_pw_match']; err.classList.add('show')
    btn.disabled = false; return
  }
  if (pw.length < 8) {
    err.textContent = t['auth.err_pw_short']; err.classList.add('show')
    btn.disabled = false; return
  }

  const { error } = await _sb.auth.signUp({
    email:    document.getElementById('su_email').value.trim(),
    password: pw,
    options: { data: {
      name:        document.getElementById('su_name').value.trim(),
      affiliation: document.getElementById('su_affiliation').value.trim(),
      phone:       document.getElementById('su_phone').value.trim()
    }}
  })

  if (error) {
    err.textContent = error.message; err.classList.add('show')
    btn.disabled = false; return
  }
  success.textContent = t['auth.signup_success']
  success.classList.add('show')
  document.getElementById('signupForm').style.display = 'none'
  btn.disabled = false
}

// ── LOGOUT ──
async function handleLogout() {
  await _sb.auth.signOut()
  _user = null; _profile = null
  document.getElementById('userDropdown').classList.remove('open')
  updateAuthUI(null, null)
}

// ── LOAD PROFILE ──
async function loadProfile(user) {
  if (!user) { updateAuthUI(null, null); return }
  const { data: profile } = await _sb.from('profiles').select('*').eq('id', user.id).single()
  _user = user; _profile = profile
  updateAuthUI(user, profile)
}

// ── UPDATE UI ──
function updateAuthUI(user, profile) {
  window._user    = user    || null   // published for billing.js (account/pricing)
  window._profile = profile || null
  const out = document.getElementById('navAuthOut')
  const in_ = document.getElementById('navAuthIn')
  if (!out || !in_) return
  if (!user) {
    out.style.display = 'flex'; in_.style.display = 'none'
    updateDownloadState(false, false)
    return
  }
  out.style.display = 'none'; in_.style.display = 'flex'

  const name    = profile?.name || user.email
  const initial = name.charAt(0).toUpperCase()
  document.getElementById('userAvatar').textContent      = initial
  document.getElementById('userDisplayName').textContent = name
  document.getElementById('dropName').textContent        = name
  document.getElementById('dropEmail').textContent       = user.email

  const t = T[currentLang] || T.en
  if (profile?.expires_at) {
    const diff = Math.ceil((new Date(profile.expires_at) - new Date()) / 86400000)
    document.getElementById('dropExp').textContent = diff > 0
      ? t['auth.days_left'].replace('{n}', diff)
      : t['auth.expired']
  }

  const expired  = profile?.expires_at && new Date(profile.expires_at) < new Date()
  const blocked  = profile?.is_blocked
  updateDownloadState(true, !(expired || blocked))
}

function updateDownloadState(loggedIn, canDownload) {
  const locked  = document.getElementById('dlLocked')
  const expired = document.getElementById('dlExpired')
  const btns    = ['dlWin','dlMac','dlLinux'].map(id => document.getElementById(id)).filter(Boolean)

  if (locked) locked.classList.remove('show')
  if (expired) expired.classList.remove('show')
  btns.forEach(b => { b.classList.remove('disabled'); b.onclick = null; b.href = '#' })

  if (!loggedIn) {
    if (locked) locked.classList.add('show')
    btns.forEach(b => { b.classList.add('disabled') })
  } else if (!canDownload) {
    if (expired) expired.classList.add('show')
    btns.forEach(b => { b.classList.add('disabled') })
  } else {
    const w = document.getElementById('dlWin'); if (w) w.href = DL.win
    const m = document.getElementById('dlMac'); if (m) m.href = DL.mac
    const l = document.getElementById('dlLinux'); if (l) l.href = DL.linux
  }
}

// ── USER DROPDOWN ──
document.getElementById('userBtn')?.addEventListener('click', e => {
  e.stopPropagation()
  document.getElementById('userDropdown').classList.toggle('open')
})
document.addEventListener('click', () => {
  document.getElementById('userDropdown')?.classList.remove('open')
})

// ── MODAL OVERLAY: close on backdrop click ──
;['loginModal','signupModal'].forEach(id => {
  const overlay = document.getElementById(id)
  if (!overlay) return
  // Close only when the press AND release both land on the backdrop itself.
  // A plain 'click' fires on the common ancestor of mousedown/mouseup, so selecting
  // text in a field (release outside the card) or dismissing the browser password
  // popup could close the modal mid-typing. Tracking mousedown prevents that.
  let downOnBackdrop = false
  overlay.addEventListener('mousedown', e => { downOnBackdrop = (e.target === overlay) })
  overlay.addEventListener('click', e => {
    if (e.target === overlay && downOnBackdrop) closeModal(id)
    downOnBackdrop = false
  })
})

// ── Re-render language-dependent dynamic text on language change ──
window.onLangApplied = function (lang) {
  if (_user && _profile?.expires_at) {
    const t = T[lang] || T.en
    const diff = Math.ceil((new Date(_profile.expires_at) - new Date()) / 86400000)
    const exp = document.getElementById('dropExp')
    if (exp) exp.textContent = diff > 0 ? t['auth.days_left'].replace('{n}', diff) : t['auth.expired']
  }
}

// ── SESSION INIT ──
_sb.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    loadProfile(session.user)
    if (session.user.email === ADMIN_EMAIL) enableAdminMode()
  } else updateAuthUI(null, null)
})
_sb.auth.onAuthStateChange((_, session) => {
  if (session) {
    loadProfile(session.user)
    if (session.user.email === ADMIN_EMAIL) enableAdminMode()
  } else updateAuthUI(null, null)
})

// Load admin-managed images
loadSiteImages()
