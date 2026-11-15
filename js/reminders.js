/**
 * reminders.js
 * CRUD operations and filtering for tasks/reminders.
 * Priorities: normal | important | urgent
 * Statuses:   pending | completed
 * No subject, category, or demo data.
 */

// ── Constants ────────────────────────────────────────────────────────────────

const PRIORITIES = ['normal', 'important', 'urgent'];

// ── CRUD ─────────────────────────────────────────────────────────────────────

function getReminders(userId = null) {
  const all = getRemindersRaw();
  return userId ? all.filter(r => r.userId === userId) : all;
}

function getReminderById(id) {
  return getRemindersRaw().find(r => r.id === id) || null;
}

function addReminder(data, userId) {
  const reminders = getRemindersRaw();
  const reminder = {
    id:          generateId(),
    title:       (data.title || '').trim(),
    description: (data.description || '').trim(),
    subject:     (data.subject || '').trim(),
    teacher:     (data.teacher || '').trim(),
    date:        data.date || '',
    time:        data.time || '',
    priority:    PRIORITIES.includes(data.priority) ? data.priority : 'normal',
    completed:   false,
    createdAt:   new Date().toISOString(),
    userId:      userId || getCurrentUser()?.id || null,
  };
  reminders.push(reminder);
  saveRemindersRaw(reminders);
  return reminder;
}

function updateReminder(id, data) {
  const reminders = getRemindersRaw();
  const idx = reminders.findIndex(r => r.id === id);
  if (idx === -1) return null;

  const updated = {
    ...reminders[idx],
    title:       data.title !== undefined       ? (data.title || '').trim()       : reminders[idx].title,
    description: data.description !== undefined ? (data.description || '').trim() : reminders[idx].description,
    subject:     data.subject !== undefined      ? (data.subject || '').trim()     : reminders[idx].subject,
    teacher:     data.teacher !== undefined      ? (data.teacher || '').trim()     : reminders[idx].teacher,
    date:        data.date !== undefined        ? data.date                        : reminders[idx].date,
    time:        data.time !== undefined        ? data.time                        : reminders[idx].time,
    priority:    PRIORITIES.includes(data.priority) ? data.priority               : reminders[idx].priority,
    updatedAt:   new Date().toISOString(),
  };

  reminders[idx] = updated;
  saveRemindersRaw(reminders);
  return updated;
}

function deleteReminder(id) {
  saveRemindersRaw(getRemindersRaw().filter(r => r.id !== id));
}

function completeReminder(id) {
  return _toggleComplete(id, true);
}

function uncompleteReminder(id) {
  return _toggleComplete(id, false);
}

function _toggleComplete(id, state) {
  const reminders = getRemindersRaw();
  const idx = reminders.findIndex(r => r.id === id);
  if (idx === -1) return null;
  reminders[idx].completed    = state;
  reminders[idx].completedAt  = state ? new Date().toISOString() : null;
  saveRemindersRaw(reminders);
  return reminders[idx];
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function isOverdue(r) {
  if (!r.date || r.completed) return false;
  return r.date < todayStr();
}

function isDueToday(r) {
  return r.date === todayStr() && !r.completed;
}

function isDueSoon(r) {
  if (!r.date || r.completed) return false;
  const today = new Date();
  const due   = new Date(r.date + 'T00:00:00');
  const diff  = (due - today) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 3;
}

function isUpcoming(r) {
  if (!r.date || r.completed) return false;
  return r.date > todayStr();
}

// ── Filtering & searching ─────────────────────────────────────────────────────

/**
 * filterReminders(filter, userId?)
 * filter: 'all' | 'pending' | 'completed' | 'overdue' | 'today' | 'upcoming' | 'highPriority'
 */
function filterReminders(filter = 'all', userId = null) {
  let list = getReminders(userId);

  switch (filter) {
    case 'pending':      return list.filter(r => !r.completed);
    case 'completed':    return list.filter(r => r.completed);
    case 'overdue':      return list.filter(r => isOverdue(r));
    case 'today':        return list.filter(r => isDueToday(r));
    case 'upcoming':     return list.filter(r => isUpcoming(r));
    case 'highPriority': return list.filter(r => r.priority === 'urgent' && !r.completed);
    default:             return list;
  }
}

function searchReminders(query, userId = null) {
  if (!query || !query.trim()) return filterReminders('all', userId);
  const q = query.toLowerCase();
  return filterReminders('all', userId).filter(r =>
    r.title.toLowerCase().includes(q) ||
    (r.description || '').toLowerCase().includes(q)
  );
}

function sortReminders(list, by = 'date', order = 'asc') {
  const priorityOrder = { urgent: 0, important: 1, normal: 2 };
  return [...list].sort((a, b) => {
    let va, vb;
    switch (by) {
      case 'priority': va = priorityOrder[a.priority]; vb = priorityOrder[b.priority]; break;
      case 'title':    va = a.title.toLowerCase();     vb = b.title.toLowerCase();     break;
      case 'createdAt':va = a.createdAt;               vb = b.createdAt;               break;
      default:
        va = a.date || '';
        vb = b.date || '';
    }
    if (va < vb) return order === 'asc' ? -1 : 1;
    if (va > vb) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ── Statistics ────────────────────────────────────────────────────────────────

function getReminderStats(userId = null) {
  const all = getReminders(userId);
  return {
    total:     all.length,
    completed: all.filter(r => r.completed).length,
    pending:   all.filter(r => !r.completed && !isOverdue(r)).length,
    overdue:   all.filter(r => isOverdue(r)).length,
    today:     all.filter(r => isDueToday(r)).length,
  };
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateReminderForm({ title, date }) {
  const errors = {};
  if (!title || !title.trim()) errors.title = 'titleRequired';
  if (!date)                   errors.date  = 'dateRequired';
  return { valid: Object.keys(errors).length === 0, errors };
}
