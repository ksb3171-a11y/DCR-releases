/* ============================================================================
   STRIX site — Feature Request board (Supabase feature_requests / feature_votes)
   Classic script. Depends on globals from auth.js (_sb, _user, openModal) and
   i18n.js (currentLang). Functions are global for inline onclick handlers.
   ============================================================================ */

const FR_CATS = ['analysis','design','ui','bug','etc']
const FR_STATUS = ['proposed','reviewing','planned','in_progress','done','declined']
const FR_STATUS_LABEL = { proposed:'Proposed', reviewing:'Reviewing', planned:'Planned', in_progress:'In Progress', done:'Done', declined:'Declined' }
let _frCat = 'all', _frSort = 'top', _frReqs = [], _frMyVotes = new Set()

function isBoardAdmin() { return _user && _user.email === ADMIN_EMAIL }
function frEsc(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])) }
function frDate(d) { return d ? new Date(d).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'ko-KR') : '' }

function openBoard() {
  document.getElementById('boardModal').classList.add('open')
  boardShowList()
  loadRequests()
}
function closeBoard() { document.getElementById('boardModal').classList.remove('open') }

function boardShowList() {
  document.getElementById('boardList').style.display = 'flex'
  document.getElementById('boardDetail').style.display = 'none'
  document.getElementById('boardNew').style.display = 'none'
}

async function loadRequests() {
  const body = document.getElementById('boardBody')
  body.innerHTML = '<div class="board-empty">Loading…</div>'
  const { data, error } = await _sb.from('feature_requests')
    .select('id,title,body,category,author_name,status,admin_reply,admin_reply_at,vote_count,is_hidden,created_at')
  if (error) { body.innerHTML = '<div class="board-empty">Failed to load: ' + frEsc(error.message) + '</div>'; return }
  _frReqs = data || []
  _frMyVotes = new Set()
  if (_user) {
    const { data: votes } = await _sb.from('feature_votes').select('request_id').eq('user_id', _user.id)
    if (votes) votes.forEach(v => _frMyVotes.add(v.request_id))
  }
  renderRequests()
}

function renderRequests() {
  const body = document.getElementById('boardBody')
  let list = _frReqs.slice()
  if (_frCat !== 'all') list = list.filter(r => r.category === _frCat)
  list.sort((a, b) => _frSort === 'recent'
    ? new Date(b.created_at) - new Date(a.created_at)
    : (b.vote_count - a.vote_count) || (new Date(b.created_at) - new Date(a.created_at)))
  if (!list.length) { body.innerHTML = '<div class="board-empty">No requests yet. Be the first to suggest a feature!</div>'; return }
  body.innerHTML = list.map(r => {
    const voted = _frMyVotes.has(r.id)
    return `<div class="req-card" onclick="boardShowDetail('${r.id}')">
      <div class="req-vote" onclick="event.stopPropagation()">
        <button class="${voted ? 'voted' : ''}" onclick="toggleVote('${r.id}')" title="Upvote">▲</button>
        <span class="vc">${r.vote_count}</span>
      </div>
      <div class="req-main">
        <div class="req-title">${frEsc(r.title)}</div>
        <div class="req-meta">
          <span class="cat-badge cat-${r.category}">${r.category}</span>
          <span class="st-badge st-${r.status}">${FR_STATUS_LABEL[r.status] || r.status}</span>
          <span>${frEsc(r.author_name)}</span>
          <span>· ${frDate(r.created_at)}</span>
          ${r.admin_reply ? '<span class="req-replied">· 💬 Admin replied</span>' : ''}
          ${r.is_hidden ? '<span style="color:#f48771">· hidden</span>' : ''}
        </div>
        <div class="req-excerpt">${frEsc(r.body)}</div>
      </div>
    </div>`
  }).join('')
}

async function toggleVote(id) {
  if (!_user) { closeBoard(); openModal('login'); return }
  const req = _frReqs.find(r => r.id === id)
  if (!req) return
  const voted = _frMyVotes.has(id)
  if (voted) { _frMyVotes.delete(id); req.vote_count = Math.max(0, req.vote_count - 1) }
  else { _frMyVotes.add(id); req.vote_count++ }
  renderRequests()
  if (document.getElementById('boardDetail').style.display === 'block') boardShowDetail(id)
  if (voted) await _sb.from('feature_votes').delete().eq('request_id', id).eq('user_id', _user.id)
  else       await _sb.from('feature_votes').insert({ request_id: id, user_id: _user.id })
}

function boardShowDetail(id) {
  const r = _frReqs.find(x => x.id === id)
  if (!r) return
  document.getElementById('boardList').style.display = 'none'
  document.getElementById('boardNew').style.display = 'none'
  const el = document.getElementById('boardDetail')
  el.style.display = 'block'
  const voted = _frMyVotes.has(r.id)
  let html = `<button class="board-back" onclick="boardShowList()">← Back to list</button>
    <div class="detail-title">${frEsc(r.title)}</div>
    <div class="detail-meta">
      <span class="cat-badge cat-${r.category}">${r.category}</span>
      <span class="st-badge st-${r.status}">${FR_STATUS_LABEL[r.status] || r.status}</span>
      <span>${frEsc(r.author_name)}</span><span>· ${frDate(r.created_at)}</span>
      <button class="board-btn ghost" style="padding:5px 14px;margin-left:auto" onclick="toggleVote('${r.id}')">▲ ${r.vote_count}${voted ? ' ✓' : ''}</button>
    </div>
    <div class="detail-body">${frEsc(r.body)}</div>`
  if (r.admin_reply) {
    html += `<div class="detail-reply"><div class="rl">💬 Admin Reply · ${frDate(r.admin_reply_at)}</div><div class="rt">${frEsc(r.admin_reply)}</div></div>`
  }
  if (isBoardAdmin()) {
    html += `<div class="admin-panel">
      <div class="apl">🛠 Admin Controls</div>
      <div class="board-field"><label>Status</label>
        <select id="adStatus">${FR_STATUS.map(s => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${FR_STATUS_LABEL[s]}</option>`).join('')}</select></div>
      <div class="board-field"><label>Admin Reply</label>
        <textarea id="adReply" placeholder="Official reply…">${frEsc(r.admin_reply || '')}</textarea></div>
      <div class="board-actions">
        <button class="board-btn" onclick="adminSaveReq('${r.id}')">Save</button>
        <button class="board-btn ghost" onclick="adminToggleHide('${r.id}')">${r.is_hidden ? 'Unhide' : 'Hide'}</button>
        <button class="board-btn danger" onclick="adminDeleteReq('${r.id}')">Delete</button>
      </div>
    </div>`
  }
  el.innerHTML = html
}

async function adminSaveReq(id) {
  const status = document.getElementById('adStatus').value
  const reply = document.getElementById('adReply').value.trim()
  const patch = { status, admin_reply: reply || null, admin_reply_at: reply ? new Date().toISOString() : null }
  const { error } = await _sb.from('feature_requests').update(patch).eq('id', id)
  if (error) { alert('Save failed: ' + error.message); return }
  Object.assign(_frReqs.find(r => r.id === id), patch)
  boardShowDetail(id)
}
async function adminToggleHide(id) {
  const r = _frReqs.find(x => x.id === id)
  const { error } = await _sb.from('feature_requests').update({ is_hidden: !r.is_hidden }).eq('id', id)
  if (error) { alert('Failed: ' + error.message); return }
  r.is_hidden = !r.is_hidden
  boardShowDetail(id)
}
async function adminDeleteReq(id) {
  if (!confirm('Delete this request permanently?')) return
  const { error } = await _sb.from('feature_requests').delete().eq('id', id)
  if (error) { alert('Delete failed: ' + error.message); return }
  _frReqs = _frReqs.filter(r => r.id !== id)
  boardShowList(); renderRequests()
}

function boardShowNew() {
  if (!_user) { closeBoard(); openModal('login'); return }
  document.getElementById('boardList').style.display = 'none'
  document.getElementById('boardDetail').style.display = 'none'
  const el = document.getElementById('boardNew')
  el.style.display = 'block'
  el.innerHTML = `<button class="board-back" onclick="boardShowList()">← Back to list</button>
    <div class="detail-title" style="font-size:18px">Suggest a Feature</div>
    <div class="board-msg error" id="newMsg"></div>
    <div class="board-field"><label>Category</label>
      <select id="newCat">${FR_CATS.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
    <div class="board-field"><label>Title</label>
      <input id="newTitle" maxlength="140" placeholder="Short summary of your idea"></div>
    <div class="board-field"><label>Description</label>
      <textarea id="newBody" maxlength="4000" placeholder="Describe the feature and why it would help…"></textarea></div>
    <div class="board-actions">
      <button class="board-btn" id="newSubmit" onclick="submitRequest()">Submit</button>
      <button class="board-btn ghost" onclick="boardShowList()">Cancel</button>
    </div>`
}

async function submitRequest() {
  if (!_user) { openModal('login'); return }
  const title = document.getElementById('newTitle').value.trim()
  const body = document.getElementById('newBody').value.trim()
  const category = document.getElementById('newCat').value
  const msg = document.getElementById('newMsg')
  msg.classList.remove('show')
  if (title.length < 2) { msg.textContent = 'Please enter a title (min 2 characters).'; msg.classList.add('show'); return }
  if (body.length < 1) { msg.textContent = 'Please enter a description.'; msg.classList.add('show'); return }
  const btn = document.getElementById('newSubmit'); btn.disabled = true
  const { error } = await _sb.from('feature_requests').insert({
    title, body, category,
    author_id: _user.id,
    author_name: _profile?.name || _user.email.split('@')[0]
  })
  btn.disabled = false
  if (error) { msg.textContent = 'Submit failed: ' + error.message; msg.classList.add('show'); return }
  boardShowList()
  loadRequests()
}

document.getElementById('boardChips')?.addEventListener('click', e => {
  const b = e.target.closest('.board-chip'); if (!b) return
  document.querySelectorAll('#boardChips .board-chip').forEach(x => x.classList.remove('active'))
  b.classList.add('active'); _frCat = b.dataset.cat; renderRequests()
})
document.getElementById('boardSort')?.addEventListener('change', e => { _frSort = e.target.value; renderRequests() })
document.getElementById('boardModal')?.addEventListener('click', function (e) { if (e.target === this) closeBoard() })
