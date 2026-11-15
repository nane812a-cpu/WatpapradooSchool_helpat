/**
 * storage.js
 * localStorage abstraction layer for Memory Helper.
 * All keys prefixed with 'mh_' to avoid collisions.
 *
 * FIX v2.2 — changes from v2.1:
 *  • Added mh_remember to STORAGE_KEYS so it is tracked centrally.
 *  • storageGet now logs a parse error with the offending key so silent
 *    data corruption is visible in the browser console.
 *  • Added getRemember() / saveRemember() / clearRemember() helpers.
 *  • Added migrateOrphanReminders() — assigns reminders that have no
 *    userId to the first registered user (safe one-time migration).
 *  • clearAppData() no longer wipes subjects/teachers (those are
 *    reference data the user typed in; only tasks + messages are cleared).
 *  • exportAllData() / importAllData() unchanged — backward-compatible.
 */

const STORAGE_KEYS = {
  reminders:   'mh_reminders',
  users:       'mh_users',
  currentUser: 'mh_current_user',
  theme:       'mh_theme',
  lang:        'mh_lang',
  messages:    'mh_messages',
  readNotifs:  'mh_read_notifs',
  subjects:    'mh_subjects',
  teachers:    'mh_teachers',
  remember:    'mh_remember',      // NEW: 'permanent' | 'session' | absent
};

// ── Generic helpers ───────────────────────────────────────────────────────────

function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    // Log so the developer can see corrupted keys in DevTools console.
    console.warn('[Memory Helper] storageGet: JSON parse failed for key "' + key + '":', err.message);
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('[Memory Helper] storageSet: write failed for key "' + key + '":', err.message);
    return false;
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('[Memory Helper] storageRemove: failed for key "' + key + '":', err.message);
  }
}

// ── Reminder storage ──────────────────────────────────────────────────────────

function getRemindersRaw()        { return storageGet(STORAGE_KEYS.reminders, []); }
function saveRemindersRaw(data)   { return storageSet(STORAGE_KEYS.reminders, data); }

// ── User storage ──────────────────────────────────────────────────────────────

function getUsersRaw()            { return storageGet(STORAGE_KEYS.users, []); }
function saveUsersRaw(users)      { return storageSet(STORAGE_KEYS.users, users); }
function getCurrentUserRaw()      { return storageGet(STORAGE_KEYS.currentUser, null); }
function saveCurrentUserRaw(user) { return storageSet(STORAGE_KEYS.currentUser, user); }
function clearCurrentUser()       { storageRemove(STORAGE_KEYS.currentUser); }

// ── Remember-Me flag ──────────────────────────────────────────────────────────
// Value stored is 'permanent' when the user ticked Remember Me, otherwise
// the key is absent (or 'session' for explicit non-remember logins).

function getRemember()            { return storageGet(STORAGE_KEYS.remember, null); }
function saveRemember(value)      { return storageSet(STORAGE_KEYS.remember, value); }
function clearRemember()          { storageRemove(STORAGE_KEYS.remember); }

// ── Notification read-state ───────────────────────────────────────────────────

function getReadNotifIds()        { return storageGet(STORAGE_KEYS.readNotifs, []); }
function saveReadNotifIds(ids)    { return storageSet(STORAGE_KEYS.readNotifs, ids); }

// ── Message storage ───────────────────────────────────────────────────────────

function getMessagesRaw()         { return storageGet(STORAGE_KEYS.messages, []); }
function saveMessagesRaw(msgs)    { return storageSet(STORAGE_KEYS.messages, msgs); }

// ── Subject / Teacher storage (user-created only, no seed data) ───────────────

function getSubjectsRaw()         { return storageGet(STORAGE_KEYS.subjects, []); }
function saveSubjectsRaw(data)    { return storageSet(STORAGE_KEYS.subjects, data); }
function getTeachersRaw()         { return storageGet(STORAGE_KEYS.teachers, []); }
function saveTeachersRaw(data)    { return storageSet(STORAGE_KEYS.teachers, data); }

// ── Theme / Lang ──────────────────────────────────────────────────────────────

function getTheme()               { return storageGet(STORAGE_KEYS.theme, 'light'); }
function saveTheme(theme)         { return storageSet(STORAGE_KEYS.theme, theme); }

// ── Export / Import ───────────────────────────────────────────────────────────

function exportAllData() {
  return {
    reminders:  getRemindersRaw(),
    messages:   getMessagesRaw(),
    subjects:   getSubjectsRaw(),
    teachers:   getTeachersRaw(),
    exportedAt: new Date().toISOString(),
    version:    '2.2',
  };
}

function importAllData(data) {
  if (Array.isArray(data.reminders)) saveRemindersRaw(data.reminders);
  if (Array.isArray(data.messages))  saveMessagesRaw(data.messages);
  if (Array.isArray(data.subjects))  saveSubjectsRaw(data.subjects);
  if (Array.isArray(data.teachers))  saveTeachersRaw(data.teachers);
}

// ── Clear app data (keeps user accounts AND subjects/teachers) ────────────────
// Wipes only tasks and messages — the data the user is explicitly asking to
// delete.  Subjects and teachers are reference data the user typed in and
// are preserved so autocomplete still works after a clear.

function clearAppData() {
  storageRemove(STORAGE_KEYS.reminders);
  storageRemove(STORAGE_KEYS.messages);
  storageRemove(STORAGE_KEYS.readNotifs);
  // Also wipe legacy keys from old versions.
  ['mh_schools', 'mh_homework', 'mh_notifications', 'mh_sent_notifs'].forEach(k => {
    try { localStorage.removeItem(k); } catch (_) {}
  });
}

// ── Wipe everything including accounts ───────────────────────────────────────

function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach(k => storageRemove(k));
  ['mh_schools', 'mh_homework', 'mh_notifications', 'mh_sent_notifs'].forEach(k => {
    try { localStorage.removeItem(k); } catch (_) {}
  });
}

// ── ID generator ─────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ── Orphan-reminder migration ─────────────────────────────────────────────────
/**
 * migrateOrphanReminders(userId)
 *
 * Some reminders may have been saved with userId === null (e.g. from an older
 * version of the app, or if getCurrentUser() returned null at save time).
 * This function reassigns those orphan reminders to the given userId so they
 * become visible to the logged-in user.
 *
 * Rules:
 *  • Only reminders with userId === null or userId === undefined are touched.
 *  • Each migrated reminder keeps its original id, title, date, etc.
 *  • A console message is logged for each migrated record so the developer
 *    can verify the migration in DevTools.
 *  • If no orphans exist, the function is a no-op (no write to storage).
 *
 * Returns the number of reminders that were migrated.
 */
function migrateOrphanReminders(userId) {
  if (!userId) return 0;
  const reminders = getRemindersRaw();
  let count = 0;
  const updated = reminders.map(r => {
    if (r.userId == null) {
      count++;
      console.info('[Memory Helper] migrateOrphanReminders: assigning reminder "' + r.title + '" (' + r.id + ') to user ' + userId);
      return { ...r, userId };
    }
    return r;
  });
  if (count > 0) saveRemindersRaw(updated);
  return count;
}

// ── Stubs for legacy calls from removed School/Homework entities ─────────────

function getSchoolsRaw()       { return []; }
function saveSchoolsRaw()      {}
function getHomeworkRaw()      { return []; }
function saveHomeworkRaw()     {}
