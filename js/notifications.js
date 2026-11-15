/**
 * notifications.js
 * In-app notification logic and optional browser push notifications.
 */

// ── Build notification list from reminders ────────────────────────────────────

/**
 * Build a structured list of notification items from current reminders.
 * Returns array of { id, reminderId, type, title, subtitle, date }
 * type: 'overdue' | 'dueToday' | 'dueSoon' | 'upcoming' | 'completed'
 */
function buildNotifications(userId = null) {
  const reminders = filterReminders('all', userId);
  const notifs = [];

  reminders.forEach(r => {
    if (r.completed) {
      notifs.push({
        id:         'c-' + r.id,
        reminderId: r.id,
        type:       'completed',
        title:      r.title,
        subtitle:   r.subject || '',
        date:       r.date,
        time:       r.time,
        priority:   r.priority,
        category:   r.category,
      });
      return;
    }

    if (isOverdue(r)) {
      notifs.push({ id: 'o-' + r.id, reminderId: r.id, type: 'overdue',   title: r.title, subtitle: r.subject || '', date: r.date, time: r.time, priority: r.priority, category: r.category });
    } else if (isDueToday(r)) {
      notifs.push({ id: 'd-' + r.id, reminderId: r.id, type: 'dueToday',  title: r.title, subtitle: r.subject || '', date: r.date, time: r.time, priority: r.priority, category: r.category });
    } else if (isDueSoon(r)) {
      notifs.push({ id: 's-' + r.id, reminderId: r.id, type: 'dueSoon',   title: r.title, subtitle: r.subject || '', date: r.date, time: r.time, priority: r.priority, category: r.category });
    } else if (isUpcoming(r)) {
      notifs.push({ id: 'u-' + r.id, reminderId: r.id, type: 'upcoming',  title: r.title, subtitle: r.subject || '', date: r.date, time: r.time, priority: r.priority, category: r.category });
    }
  });

  // Sort: overdue first, then dueToday, dueSoon, upcoming, completed
  const order = { overdue: 0, dueToday: 1, dueSoon: 2, upcoming: 3, completed: 4 };
  notifs.sort((a, b) => {
    const diff = order[a.type] - order[b.type];
    if (diff !== 0) return diff;
    return (a.date || '').localeCompare(b.date || '');
  });

  return notifs;
}

function getUnreadCount(userId = null) {
  const readIds = getReadNotifIds();
  return buildNotifications(userId).filter(n =>
    n.type !== 'completed' && !readIds.includes(n.id)
  ).length;
}

function markNotifRead(id) {
  const ids = getReadNotifIds();
  if (!ids.includes(id)) {
    ids.push(id);
    saveReadNotifIds(ids);
  }
}

function markAllNotifsRead(userId = null) {
  const notifs = buildNotifications(userId);
  const ids = notifs.map(n => n.id);
  saveReadNotifIds(ids);
}

// ── Browser notifications ─────────────────────────────────────────────────────

let browserNotifInterval = null;

async function requestBrowserPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied')  return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

function getBrowserNotifPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function sendBrowserNotif(title, body, tag = '') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    tag,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%236366f1"/><text x="50%25" y="55%25" font-size="18" text-anchor="middle" dominant-baseline="middle" fill="white">📚</text></svg>',
  });
}

/**
 * Start polling for upcoming reminders to fire browser notifications.
 * Checks every 60 seconds.
 */
function startNotificationPoller(userId = null) {
  if (browserNotifInterval) clearInterval(browserNotifInterval);

  const checkAndFire = () => {
    if (getBrowserNotifPermission() !== 'granted') return;
    const sentKey = 'mh_sent_notifs';
    const sent    = JSON.parse(localStorage.getItem(sentKey) || '[]');
    const now     = new Date();

    filterReminders('all', userId).forEach(r => {
      if (r.completed || !r.date || !r.time) return;
      const due = new Date(r.date + 'T' + r.time);
      const minsUntil = (due - now) / 60000;
      // Fire 15 min before
      if (minsUntil > 0 && minsUntil <= 15 && !sent.includes(r.id)) {
        sendBrowserNotif(
          '📚 Memory Helper',
          `${r.title} — ${r.subject || ''} (${r.time})`
        );
        sent.push(r.id);
        localStorage.setItem(sentKey, JSON.stringify(sent));
      }
    });
  };

  checkAndFire();
  browserNotifInterval = setInterval(checkAndFire, 60 * 1000);
}

function stopNotificationPoller() {
  if (browserNotifInterval) clearInterval(browserNotifInterval);
}
