/**
 * teachers.js
 * Real CRUD + storage for user-created Teachers.
 * No predefined / sample teachers — every entry is typed in by the user
 * on the Add Task form and saved here so it can be reused later.
 * Teachers are scoped per user account (userId).
 */

// ── CRUD ─────────────────────────────────────────────────────────────────────

/** Get all teachers belonging to a user (or all, if no userId given). */
function getTeachers(userId = null) {
  const all = getTeachersRaw();
  return userId ? all.filter(tc => tc.userId === userId) : all;
}

/** Just the reusable names, sorted alphabetically — for datalist/autocomplete. */
function getTeacherNames(userId = null) {
  return getTeachers(userId).map(tc => tc.name).sort((a, b) => a.localeCompare(b));
}

function getTeacherById(id) {
  return getTeachersRaw().find(tc => tc.id === id) || null;
}

function getTeacherByName(name, userId = null) {
  const clean = (name || '').trim().toLowerCase();
  if (!clean) return null;
  return getTeachers(userId).find(tc => tc.name.toLowerCase() === clean) || null;
}

/**
 * Add a teacher if it doesn't already exist for this user (case-insensitive).
 * Returns the existing or newly-created teacher object, or null for blank input.
 */
function addTeacher(name, userId) {
  const clean = (name || '').trim();
  if (!clean) return null;

  const existing = getTeacherByName(clean, userId);
  if (existing) return existing;

  const teachers = getTeachersRaw();
  const teacher = {
    id:        generateId(),
    name:      clean,
    userId:    userId || getCurrentUser()?.id || null,
    createdAt: new Date().toISOString(),
  };
  teachers.push(teacher);
  saveTeachersRaw(teachers);
  return teacher;
}

function updateTeacher(id, fields) {
  const teachers = getTeachersRaw();
  const idx = teachers.findIndex(tc => tc.id === id);
  if (idx === -1) return null;
  if (fields?.name !== undefined) teachers[idx].name = fields.name.trim();
  saveTeachersRaw(teachers);
  return teachers[idx];
}

function deleteTeacher(id) {
  saveTeachersRaw(getTeachersRaw().filter(tc => tc.id !== id));
}

function seedDemoTeachers() { /* intentionally a no-op — no sample teachers are ever created */ }

// ── Page stub (no dedicated Teachers page in the current UI) ────────────────

function openTeacherModal()      {}
function confirmDeleteTeacher()  {}

function renderTeachersPage(user) {
  const el = document.getElementById('page-teachers');
  if (!el) return;
  const list = getTeachers(user?.id);
  el.innerHTML = `
    <div class="page-header">
      <h1>${typeof t === 'function' ? t('teachers') : 'Teachers'}</h1>
    </div>
    ${list.length === 0
      ? `<div class="empty-state"><div class="empty-icon">👩‍🏫</div><p style="color:var(--text-2)">${typeof t === 'function' ? t('noTeachersYet') : 'No teachers yet — add one from the task form.'}</p></div>`
      : `<div class="entity-grid">${list.map(tc => `
          <div class="entity-card">
            <span>${typeof escapeHtml === 'function' ? escapeHtml(tc.name) : tc.name}</span>
          </div>`).join('')}</div>`}`;
}
