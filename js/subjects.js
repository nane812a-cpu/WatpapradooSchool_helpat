/**
 * subjects.js
 * Real CRUD + storage for user-created Subjects.
 * No predefined / sample subjects — every entry is typed in by the user
 * on the Add Task form and saved here so it can be reused later.
 * Subjects are scoped per user account (userId).
 */

// A small rotating colour palette used purely for visual distinction in the
// calendar/task chips — NOT sample data, just a deterministic style pick.
const SUBJECT_COLORS = ['#16a34a', '#2563eb', '#dc2626', '#9333ea', '#d97706', '#0d9488', '#db2777', '#4f46e5'];

function _colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/** Get all subjects belonging to a user (or all, if no userId given). */
function getSubjects(userId = null) {
  const all = getSubjectsRaw();
  return userId ? all.filter(s => s.userId === userId) : all;
}

/** Just the reusable names, sorted alphabetically — for datalist/autocomplete. */
function getSubjectNames(userId = null) {
  return getSubjects(userId).map(s => s.name).sort((a, b) => a.localeCompare(b));
}

function getSubjectById(id) {
  return getSubjectsRaw().find(s => s.id === id) || null;
}

function getSubjectByName(name, userId = null) {
  const clean = (name || '').trim().toLowerCase();
  if (!clean) return null;
  return getSubjects(userId).find(s => s.name.toLowerCase() === clean) || null;
}

/**
 * Add a subject if it doesn't already exist for this user (case-insensitive).
 * Returns the existing or newly-created subject object, or null for blank input.
 */
function addSubject(name, userId) {
  const clean = (name || '').trim();
  if (!clean) return null;

  const existing = getSubjectByName(clean, userId);
  if (existing) return existing;

  const subjects = getSubjectsRaw();
  const subject = {
    id:        generateId(),
    name:      clean,
    color:     _colorForName(clean),
    userId:    userId || getCurrentUser()?.id || null,
    createdAt: new Date().toISOString(),
  };
  subjects.push(subject);
  saveSubjectsRaw(subjects);
  return subject;
}

function deleteSubject(id) {
  saveSubjectsRaw(getSubjectsRaw().filter(s => s.id !== id));
}

function seedDemoSubjects() { /* intentionally a no-op — no sample subjects are ever created */ }

// ── Page stub (no dedicated Subjects page in the current UI) ────────────────

function openSubjectModal()      {}
function confirmDeleteSubject()  {}
function updateSubject(id, fields) {
  const subjects = getSubjectsRaw();
  const idx = subjects.findIndex(s => s.id === id);
  if (idx === -1) return null;
  if (fields?.name !== undefined) subjects[idx].name = fields.name.trim();
  saveSubjectsRaw(subjects);
  return subjects[idx];
}
function pickSubjectColor(name) { return _colorForName(name || ''); }

function renderSubjectsPage(user) {
  const el = document.getElementById('page-subjects');
  if (!el) return;
  const list = getSubjects(user?.id);
  el.innerHTML = `
    <div class="page-header">
      <h1>${typeof t === 'function' ? t('subjects') : 'Subjects'}</h1>
    </div>
    ${list.length === 0
      ? `<div class="empty-state"><div class="empty-icon">📚</div><p style="color:var(--text-2)">${typeof t === 'function' ? t('noSubjectsYet') : 'No subjects yet — add one from the task form.'}</p></div>`
      : `<div class="entity-grid">${list.map(s => `
          <div class="entity-card" style="border-left:3px solid ${s.color}">
            <span>${typeof escapeHtml === 'function' ? escapeHtml(s.name) : s.name}</span>
          </div>`).join('')}</div>`}`;
}
