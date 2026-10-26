const STORAGE_KEY = 'scopewise-project-v1';
const seedData = {
  rate: 1500,
  scope: [
    { id: 's1', title: 'Website pages', details: 'Up to 5 responsive pages: Home, About, Services, Work and Contact.' },
    { id: 's2', title: 'Visual direction', details: 'One design direction with colour palette and typography, approved before build.' },
    { id: 's3', title: 'Contact form', details: 'Name, email and message fields with delivery to the studio inbox.' },
    { id: 's4', title: 'Mobile responsive layout', details: 'Layouts tested at common mobile, tablet and desktop widths.' },
    { id: 's5', title: 'SEO foundations', details: 'Page titles, descriptions and image alt text for agreed pages.' },
    { id: 's6', title: 'Two revision rounds', details: 'Two consolidated rounds of feedback on the approved design.' }
  ],
  requests: [
    { id: 'r1', title: 'Add a member login area', details: 'Could we add a login page so our members can access their resources?', date: 'Today', scopeId: null, hours: 3, status: 'review' },
    { id: 'r2', title: 'Add one more service page', details: 'We have a new service to launch. Can we add a dedicated page for it?', date: 'Yesterday', scopeId: 's1', hours: 1.5, status: 'review' },
    { id: 'r3', title: 'Update the contact form fields', details: 'Please add a phone number field to the contact form.', date: '18 Oct 2026', scopeId: 's3', hours: 0.5, status: 'agreed' }
  ]
};
let data = loadData();
let activeFilter = 'all';
let toastTimer;

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored.scope) && Array.isArray(stored.requests)) return stored;
  } catch (_) {}
  return structuredClone(seedData);
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); render(); }
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function money(value) { return '₹' + Math.round(value).toLocaleString('en-IN'); }
function scopeName(id) { return data.scope.find(item => item.id === id)?.title || 'Possible change · not matched'; }
function dateLabel() { return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date()); }
function requestBadge(status) {
  const map = { review: ['Needs review', 'pill-review'], agreed: ['Agreed', 'pill-agreed'], declined: ['Not proceeding', 'pill-declined'], 'in-scope': ['In scope', 'pill-in-scope'] };
  const [label, cls] = map[status] || map.review;
  return `<span class="pill ${cls}">${label}</span>`;
}
function requestSymbol(req) { return req.scopeId ? '✓' : '↗'; }
function statusDescription(req) { return req.status === 'review' && !req.scopeId ? 'Possible change · needs your review' : req.status === 'review' ? 'Matched to ' + scopeName(req.scopeId) : req.status === 'agreed' ? 'Change agreed' : req.status === 'declined' ? 'Not proceeding' : 'Part of agreed scope'; }

function render() {
  document.querySelector('#scopeStat').textContent = data.scope.length;
  document.querySelector('#requestStat').textContent = data.requests.length;
  const open = data.requests.filter(r => r.status === 'review').length;
  document.querySelector('#openRequestFoot').textContent = `${open} need your review`;
  document.querySelector('#navCount').textContent = open;
  document.querySelector('#hoursStat').innerHTML = `${data.requests.filter(r => r.status === 'review').reduce((sum, r) => sum + Number(r.hours || 0), 0).toFixed(1)}<span class="stat-unit"> hrs</span>`;
  document.querySelector('#costStat').textContent = `${money(data.requests.filter(r => r.status === 'review').reduce((sum, r) => sum + Number(r.hours || 0), 0) * data.rate)} potential value`;
  document.querySelector('#hourlyRateDisplay').innerHTML = `${money(data.rate)}<span>/hr</span>`;
  document.querySelector('#scopeRateDisplay').textContent = `${money(data.rate)}/hr`;
  renderRecent(); renderRequests(); renderScope(); populateScopeSelect();
}
function renderRecent() {
  const list = [...data.requests].sort((a,b) => data.requests.indexOf(a) - data.requests.indexOf(b)).slice(0,3);
  document.querySelector('#recentRequests').innerHTML = list.length ? list.map(req => `<div class="request-row" data-request="${req.id}"><div class="request-symbol ${req.scopeId ? 'in-scope' : ''}">${requestSymbol(req)}</div><div class="request-main"><div class="request-title">${escapeHtml(req.title)}</div><div class="request-meta">${escapeHtml(statusDescription(req))}</div></div><div class="request-side">${requestBadge(req.status)}<span class="request-date">${escapeHtml(req.date)}</span></div></div>`).join('') : emptyInline();
}
function renderScope() {
  const host = document.querySelector('#scopeList');
  host.innerHTML = data.scope.map(item => {
    const linked = data.requests.filter(r => r.scopeId === item.id).length;
    return `<div class="scope-item"><div class="scope-title">${escapeHtml(item.title)}</div><div class="scope-description">${escapeHtml(item.details || 'No acceptance details added yet.')}</div><div class="scope-usage">${linked ? `${linked} request${linked > 1 ? 's' : ''} linked` : 'No requests yet'}</div><div class="scope-actions"><button class="small-icon-button" data-edit-scope="${item.id}" aria-label="Edit ${escapeHtml(item.title)}">✎</button><button class="small-icon-button" data-delete-scope="${item.id}" aria-label="Delete ${escapeHtml(item.title)}">×</button></div></div>`;
  }).join('') || '<div class="empty-state"><strong>No deliverables yet</strong><p>Add the items both sides agreed to deliver.</p></div>';
}
function renderRequests() {
  const filtered = data.requests.filter(req => activeFilter === 'all' || (activeFilter === 'review' ? req.status === 'review' : ['agreed','declined','in-scope'].includes(req.status)));
  document.querySelector('#allFilterCount').textContent = data.requests.length;
  document.querySelector('#reviewFilterCount').textContent = data.requests.filter(r => r.status === 'review').length;
  document.querySelector('#resolvedFilterCount').textContent = data.requests.filter(r => r.status !== 'review').length;
  document.querySelector('#requestCountLabel').textContent = `${filtered.length} request${filtered.length === 1 ? '' : 's'}`;
  const host = document.querySelector('#allRequests');
  host.innerHTML = filtered.length ? filtered.map(req => `<article class="request-card" data-request="${req.id}"><div class="request-card-top"><div class="request-card-heading"><div class="request-symbol ${req.scopeId ? 'in-scope' : ''}">${requestSymbol(req)}</div><h3>${escapeHtml(req.title)}</h3></div>${requestBadge(req.status)}</div><div class="request-card-meta">${escapeHtml(req.date)} <span>·</span> ${escapeHtml(statusDescription(req))}</div>${req.details ? `<p class="request-card-desc">“${escapeHtml(req.details)}”</p>` : ''}<div class="request-card-bottom"><span>Estimate <strong>${Number(req.hours || 0).toFixed(1)} hrs</strong></span><span>Potential value <strong>${money(Number(req.hours || 0) * data.rate)}</strong></span><span class="card-arrow">Open request →</span></div></article>`).join('') : `<div class="empty-state"><strong>${activeFilter === 'review' ? 'You’re all caught up' : 'No requests here yet'}</strong><p>${activeFilter === 'review' ? 'New requests that need a decision will appear here.' : 'Log a client request to start comparing it with your scope.'}</p>${activeFilter === 'all' ? '<button class="button button-dark" data-open-request>＋ Log a request</button>' : ''}</div>`;
}
function emptyInline() { return '<div class="empty-state"><strong>No requests yet</strong><p>Capture a client request to compare it with your scope.</p></div>'; }
function populateScopeSelect() {
  const select = document.querySelector('#matchScope');
  const current = select.value;
  select.innerHTML = '<option value="">Possible change / not matched</option>' + data.scope.map(s => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('');
  if ([...select.options].some(o => o.value === current)) select.value = current;
}

function go(view) {
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === view + 'View'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  history.replaceState(null, '', '#' + view);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function toast(message) {
  const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}
function openRequestDialog() { populateScopeSelect(); document.querySelector('#requestForm').reset(); document.querySelector('#requestDialog').showModal(); }
function openScopeDialog(item) {
  const form = document.querySelector('#scopeForm'); form.reset();
  document.querySelector('#scopeModalTitle').textContent = item ? 'Edit deliverable' : 'Add a deliverable';
  document.querySelector('#scopeIdInput').value = item?.id || '';
  document.querySelector('#scopeTitle').value = item?.title || '';
  document.querySelector('#scopeDetails').value = item?.details || '';
  document.querySelector('#scopeDialog').showModal();
}
function openDetail(id) {
  const req = data.requests.find(r => r.id === id); if (!req) return;
  const dialog = document.querySelector('#detailDialog');
  const summary = `Hi,\n\nThe original scope includes: ${req.scopeId ? scopeName(req.scopeId) : '[relevant agreed scope item]'}.\n\nYour new request: “${req.title}”\n\nThis appears ${req.scopeId ? 'related to the agreed item above and may need clarification' : 'to be outside the items listed in our original scope'}. My current estimate is ${Number(req.hours || 0).toFixed(1)} additional hours (${money(Number(req.hours || 0) * data.rate)} at the project rate).\n\nPlease let me know how you would like to proceed. I’ll wait for your confirmation before starting this additional work.`;
  document.querySelector('#detailContent').innerHTML = `<div class="detail-top"><div><div class="eyebrow">REQUEST DETAIL</div><h2>${escapeHtml(req.title)}</h2><div class="detail-meta">Logged ${escapeHtml(req.date)} · ${requestBadge(req.status)}</div></div><button class="close-button" data-close-detail aria-label="Close">×</button></div><div class="detail-section"><h4>CLIENT REQUEST</h4><p>${escapeHtml(req.details || 'No additional details were added.')}</p></div><div class="detail-section"><h4>COMPARE WITH AGREED SCOPE</h4><div class="detail-data"><div><span>Closest scope item</span><strong>${escapeHtml(scopeName(req.scopeId))}</strong></div><div><span>Current status</span><strong>${escapeHtml(statusDescription(req))}</strong></div></div></div><div class="detail-section"><h4>YOUR ESTIMATE</h4><div class="detail-data"><div><span>Additional time</span><strong>${Number(req.hours || 0).toFixed(1)} hours</strong></div><div><span>Potential value</span><strong>${money(Number(req.hours || 0) * data.rate)}</strong></div></div></div><div class="detail-section"><h4>DRAFT CHANGE SUMMARY <span style="font-weight:400;letter-spacing:0">· review before sharing</span></h4><div class="summary-box" id="summaryBox">${escapeHtml(summary)}</div></div><div class="detail-actions"><div class="detail-actions-left"><button class="detail-action" data-edit-request="${req.id}">Edit request</button><button class="detail-action" data-copy-summary>Copy summary</button></div><div class="detail-actions-right">${req.status === 'review' ? `<button class="detail-action danger" data-set-status="declined" data-id="${req.id}">Decline</button><button class="detail-action primary" data-set-status="agreed" data-id="${req.id}">Mark agreed</button>` : `<button class="detail-action" data-set-status="review" data-id="${req.id}">Reopen review</button>`}</div></div>`;
  dialog.showModal();
}

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-view]'); if (nav) { event.preventDefault(); go(nav.dataset.view); return; }
  const viewLink = event.target.closest('[data-view-link]'); if (viewLink) { go(viewLink.dataset.viewLink); return; }
  if (event.target.closest('[data-open-request]')) { openRequestDialog(); return; }
  const reqEl = event.target.closest('[data-request]'); if (reqEl) { openDetail(reqEl.dataset.request); return; }
  const editScope = event.target.closest('[data-edit-scope]'); if (editScope) { openScopeDialog(data.scope.find(s => s.id === editScope.dataset.editScope)); return; }
  const deleteScope = event.target.closest('[data-delete-scope]'); if (deleteScope) {
    const item = data.scope.find(s => s.id === deleteScope.dataset.deleteScope); if (!item) return;
    if (data.requests.some(r => r.scopeId === item.id)) { toast('Unlink requests before deleting this scope item.'); return; }
    data.scope = data.scope.filter(s => s.id !== item.id); save(); toast('Scope item removed.'); return;
  }
  if (event.target.closest('#addScopeButton, #addScopeRow')) { openScopeDialog(); return; }
  const filter = event.target.closest('[data-filter]'); if (filter) { activeFilter = filter.dataset.filter; document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('selected', b === filter)); renderRequests(); return; }
  const status = event.target.closest('[data-set-status]'); if (status) { const req = data.requests.find(r => r.id === status.dataset.id); if (req) { req.status = status.dataset.setStatus; save(); document.querySelector('#detailDialog').close(); toast(req.status === 'agreed' ? 'Marked as agreed. Your client has not been notified.' : req.status === 'declined' ? 'Marked as not proceeding.' : 'Request returned to review.'); } return; }
  if (event.target.closest('[data-copy-summary]')) { const text = document.querySelector('#summaryBox').innerText; navigator.clipboard?.writeText(text).then(() => toast('Draft copied. Review before sharing.')).catch(() => toast('Select and copy the draft manually.')); return; }
  if (event.target.closest('[data-close-detail]')) { document.querySelector('#detailDialog').close(); return; }
  const editRequest = event.target.closest('[data-edit-request]'); if (editRequest) {
    const req = data.requests.find(r => r.id === editRequest.dataset.editRequest); if (!req) return;
    document.querySelector('#detailDialog').close(); openRequestDialog();
    document.querySelector('#requestTitle').value = req.title; document.querySelector('#requestDetails').value = req.details || ''; document.querySelector('#matchScope').value = req.scopeId || ''; document.querySelector('#hoursEstimate').value = req.hours || '';
    document.querySelector('#saveRequestButton').dataset.editId = req.id; return;
  }
});

document.querySelector('#requestForm').addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault(); const form = new FormData(event.currentTarget); const editId = document.querySelector('#saveRequestButton').dataset.editId;
  const record = { title: String(form.get('title')).trim(), details: String(form.get('details') || '').trim(), scopeId: String(form.get('scopeId') || '') || null, hours: Number(form.get('hours') || 0) };
  if (!record.title) return;
  if (editId) { Object.assign(data.requests.find(r => r.id === editId), record); delete document.querySelector('#saveRequestButton').dataset.editId; }
  else data.requests.unshift({ ...record, id: 'r' + Date.now(), date: dateLabel(), status: 'review' });
  document.querySelector('#requestDialog').close(); save(); toast(editId ? 'Request updated.' : 'Request saved for your review.');
});
document.querySelector('#scopeForm').addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault(); const title = document.querySelector('#scopeTitle').value.trim(); const details = document.querySelector('#scopeDetails').value.trim(); const id = document.querySelector('#scopeIdInput').value;
  if (!title) return;
  if (id) Object.assign(data.scope.find(s => s.id === id), { title, details }); else data.scope.push({ id: 's' + Date.now(), title, details });
  document.querySelector('#scopeDialog').close(); save(); toast(id ? 'Scope item updated.' : 'Scope item added.');
});
document.querySelector('#editRateButton').addEventListener('click', () => { document.querySelector('#rateInput').value = data.rate; document.querySelector('#rateDialog').showModal(); });
document.querySelector('#rateForm').addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault(); data.rate = Number(document.querySelector('#rateInput').value || 0); document.querySelector('#rateDialog').close(); save(); toast('Hourly rate updated.');
});
document.querySelector('#projectSwitcher').addEventListener('click', () => toast('This demo includes one sample project.'));
window.addEventListener('hashchange', () => { const requested = location.hash.slice(1); if (['overview','scope','requests'].includes(requested)) go(requested); });
const initialView = location.hash.slice(1); if (['overview','scope','requests'].includes(initialView)) go(initialView);
render();
