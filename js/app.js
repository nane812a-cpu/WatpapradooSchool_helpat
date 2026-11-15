/**
 * app.js – Memory Helper main controller.
 * Handles routing, page rendering, modals, toasts, theme, and language.
 * No subject / teacher / school / homework demo data.
 */

// ── App state ─────────────────────────────────────────────────────────────────
const App = {
  currentPage:   'dashboard',
  currentFilter: 'all',
  currentSort:   'date',
  searchQuery:   '',
  sidebarOpen:   false,
};

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1. Seed a demo account only if the user database is completely empty.
  //    This never overwrites real accounts.
  seedDemoAccount();

  applyTheme(getTheme());
  applyTranslations();
  updateLangToggle();

  // 2. FIX: Determine whether to auto-restore a session.
  //
  //    The old code only called isLoggedIn() which checks mh_current_user.
  //    That worked for a tab refresh (session object still present) but NOT
  //    for "close browser → reopen" because browsers may clear sessionStorage
  //    on close.  However, localStorage survives browser restarts, so
  //    mh_current_user IS still there after a restart — meaning the old code
  //    actually worked for Remember Me users already.
  //
  //    The real gap was: the user logs OUT (which clears mh_current_user),
  //    then reopens the page.  At that point isLoggedIn() returns false and
  //    the app showed the login screen — correct.  But the user's account
  //    and tasks were still in localStorage, so they could log back in.
  //
  //    What was truly broken: Remember Me flag was stored but NEVER read
  //    on startup, so it had no effect.  We now read it here:
  //      • If mh_current_user is present  → session is active, go straight in.
  //      • If mh_current_user is absent
  //          AND mh_remember === 'permanent'  → try to rehydrate (see below).
  //      • Otherwise → show login screen.
  //
  //    Rehydration from Remember Me:
  //    After a logout the session (mh_current_user) is cleared and
  //    mh_remember is also cleared (see logoutUser() fix in auth.js).
  //    So "permanent" remember only survives when the BROWSER was closed
  //    without the user clicking Logout.  In that case we restore the last
  //    active user automatically.
  //
  //    FIX: also run migrateOrphanReminders so tasks saved without a userId
  //    (older app versions) become visible to the logged-in user.

  if (isLoggedIn()) {
    // Active session in localStorage (tab refresh, or browser reopen without
    // having logged out).
    const user = getCurrentUser();
    const migrated = migrateOrphanReminders(user.id);
    if (migrated > 0) {
      console.info('[Memory Helper] Migrated ' + migrated + ' orphan reminder(s) to user ' + user.id);
    }
    showApp();
    navigateTo('dashboard');
  } else if (getRemember() === 'permanent') {
    // Browser was closed without logout AND the user had Remember Me on.
    // mh_current_user was cleared externally (e.g. private-browsing quirk),
    // but we can look up the last user via the users array.
    // We pick the most-recently-created real (non-demo) user, or fall back
    // to the demo account as a last resort.
    const users = getUsersRaw();
    const candidate = users
      .filter(u => u.email !== 'demo@memoryhelper.app')
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      [0] || users[0];

    if (candidate) {
      const sessionUser = { ...candidate };
      delete sessionUser.passwordHash;
      saveCurrentUserRaw(sessionUser);

      const migrated = migrateOrphanReminders(sessionUser.id);
      if (migrated > 0) {
        console.info('[Memory Helper] Migrated ' + migrated + ' orphan reminder(s) to user ' + sessionUser.id);
      }
      showApp();
      navigateTo('dashboard');
    } else {
      clearRemember();
      showAuth('login');
    }
  } else {
    showAuth('login');
  }

  bindGlobalEvents();
  startNotificationPoller(getCurrentUser()?.id);
});

// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  saveTheme(theme);
  const emoji = theme === 'dark' ? '☀️' : '🌙';
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon)  icon.textContent = emoji;
  if (label) { label.setAttribute('data-i18n', theme === 'dark' ? 'lightMode' : 'darkMode'); label.textContent = t(theme === 'dark' ? 'lightMode' : 'darkMode'); }
  const topIcon = document.querySelector('#themeToggleBtnTop span');
  if (topIcon) topIcon.textContent = emoji;
}

function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// ── Language ──────────────────────────────────────────────────────────────────
function updateLangToggle() {
  const btn = document.getElementById('langToggleBtn');
  if (btn) btn.textContent = getLang() === 'th' ? '🇬🇧 English' : '🇹🇭 ภาษาไทย';
}

function toggleLanguage() {
  setLanguage(getLang() === 'th' ? 'en' : 'th');
  updateLangToggle();
  navigateTo(App.currentPage);
}

document.addEventListener('languageChanged', () => {
  updateLangToggle();
  updateNotifBadge();
});

// ── Auth screens ──────────────────────────────────────────────────────────────
function showAuth(mode = 'login') {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('appShell').style.display   = 'none';
  renderAuthForm(mode);
}

function showApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appShell').style.display   = 'flex';
  renderUserInfo();
  updateNotifBadge();
}

function renderAuthForm(mode) {
  const container = document.getElementById('authFormContainer');
  if (mode === 'login') {
    container.innerHTML = `
      <div class="auth-card fade-in">
        <div class="auth-logo">
          <div class="auth-logo-icon">📚</div>
          <h1 class="auth-title">${t('appName')}</h1>
          <p class="auth-subtitle">${t('appTagline')}</p>
        </div>
        <form id="loginForm" novalidate>
          <div class="form-group">
            <label class="form-label">${t('email')}</label>
            <input type="text" id="loginEmail" class="form-input" placeholder="${t('email')}" autocomplete="username" required>
            <span class="form-error" id="loginEmailErr"></span>
          </div>
          <div class="form-group">
            <label class="form-label">${t('password')}</label>
            <div class="input-password-wrap">
              <input type="password" id="loginPassword" class="form-input" placeholder="${t('password')}" autocomplete="current-password" required>
              <button type="button" class="pw-toggle" id="loginPwToggle" aria-label="${t('showPassword')}">👁️</button>
            </div>
            <span class="form-error" id="loginPasswordErr"></span>
          </div>
          <div class="form-check-row">
            <label class="form-check"><input type="checkbox" id="loginRemember"> <span>${t('rememberMe')}</span></label>
          </div>
          <span class="form-error" id="loginGlobalErr"></span>
          <button type="submit" class="btn btn-primary btn-block">${t('login')}</button>
        </form>
        <p class="auth-switch">${t('noAccount')} <a href="#" id="switchToRegister">${t('registerNow')}</a></p>
        <p class="auth-demo-hint">Demo: <strong>demo@memoryhelper.app</strong> / <strong>demo1234</strong></p>
        <p class="auth-origin-hint" id="authOriginHint"></p>
        <div class="auth-portal-link">
          <a href="../school-map/index.html" class="btn-portal-link">🗺️ School Map — แผนที่โรงเรียนวัดป่าประดู่</a>
        </div>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="auth-card fade-in">
        <div class="auth-logo">
          <div class="auth-logo-icon">📚</div>
          <h1 class="auth-title">${t('appName')}</h1>
          <p class="auth-subtitle">${t('register')}</p>
        </div>
        <form id="registerForm" novalidate>
          <div class="form-group">
            <label class="form-label">${t('fullName')}</label>
            <input type="text" id="regFullName" class="form-input" placeholder="${t('fullName')}" required>
            <span class="form-error" id="regFullNameErr"></span>
          </div>
          <div class="form-group">
            <label class="form-label">${t('username')}</label>
            <input type="text" id="regUsername" class="form-input" placeholder="${t('username')}" required>
            <span class="form-error" id="regUsernameErr"></span>
          </div>
          <div class="form-group">
            <label class="form-label">${t('email')}</label>
            <input type="email" id="regEmail" class="form-input" placeholder="${t('email')}" required>
            <span class="form-error" id="regEmailErr"></span>
          </div>
          <div class="form-group">
            <label class="form-label">${t('password')}</label>
            <div class="input-password-wrap">
              <input type="password" id="regPassword" class="form-input" placeholder="${t('password')}" required>
              <button type="button" class="pw-toggle" id="regPwToggle" aria-label="${t('showPassword')}">👁️</button>
            </div>
            <span class="form-error" id="regPasswordErr"></span>
          </div>
          <div class="form-group">
            <label class="form-label">${t('confirmPassword')}</label>
            <input type="password" id="regConfirmPw" class="form-input" placeholder="${t('confirmPassword')}" required>
            <span class="form-error" id="regConfirmPwErr"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-block">${t('register')}</button>
        </form>
        <p class="auth-switch">${t('haveAccount')} <a href="#" id="switchToLogin">${t('loginNow')}</a></p>
        <div class="auth-portal-link">
          <a href="../school-map/index.html" class="btn-portal-link">🗺️ School Map — แผนที่โรงเรียนวัดป่าประดู่</a>
        </div>
      </div>`;
  }
  bindAuthEvents(mode);
}

// ── Auth event binding ────────────────────────────────────────────────────────
function bindAuthEvents(mode) {
  if (mode === 'login') {
    document.getElementById('switchToRegister')?.addEventListener('click', e => { e.preventDefault(); renderAuthForm('register'); });
    document.getElementById('loginPwToggle')?.addEventListener('click', () => togglePwVisibility('loginPassword', 'loginPwToggle'));
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // FIX: Show the current browser origin so the user can confirm they are
    // opening the site from the same address as before.  LocalStorage is
    // scoped to the origin (scheme + host + port), so switching from
    // http://127.0.0.1:5500 to http://localhost:5500 means a different
    // storage partition and previously saved accounts will not appear.
    const hintEl = document.getElementById('authOriginHint');
    if (hintEl) {
      const origin = window.location.origin || window.location.protocol + '//' + window.location.host;
      hintEl.textContent = '🔒 ' + (getLang() === 'th'
        ? 'ข้อมูลบันทึกอยู่ที่: ' + origin
        : 'Data stored at: ' + origin);
    }
  } else {
    document.getElementById('switchToLogin')?.addEventListener('click', e => { e.preventDefault(); renderAuthForm('login'); });
    document.getElementById('regPwToggle')?.addEventListener('click', () => togglePwVisibility('regPassword', 'regPwToggle'));
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  }
}

function togglePwVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  if (btn) btn.textContent = input.type === 'password' ? '👁️' : '🙈';
}

function handleLogin(e) {
  e.preventDefault();
  clearFormErrors(['loginEmailErr','loginPasswordErr','loginGlobalErr']);
  const emailOrUsername = document.getElementById('loginEmail').value.trim();
  const password        = document.getElementById('loginPassword').value;
  const remember        = document.getElementById('loginRemember').checked;
  let valid = true;
  if (!emailOrUsername) { setFieldError('loginEmailErr',    t('emailRequired'));    valid = false; }
  if (!password)        { setFieldError('loginPasswordErr', t('passwordRequired')); valid = false; }
  if (!valid) return;
  const result = loginUser({ emailOrUsername, password, remember });
  if (!result.success) { setFieldError('loginGlobalErr', t(result.error)); return; }

  // FIX: migrate any reminders that were saved without a userId so they
  // become visible to this user immediately after login.
  const migrated = migrateOrphanReminders(result.user.id);
  if (migrated > 0) {
    console.info('[Memory Helper] handleLogin: migrated ' + migrated + ' orphan reminder(s) to user ' + result.user.id);
  }

  showToast(t('loginSuccess'), 'success');
  showApp();
  navigateTo('dashboard');
  startNotificationPoller(result.user.id);
}

function handleRegister(e) {
  e.preventDefault();
  clearFormErrors(['regFullNameErr','regUsernameErr','regEmailErr','regPasswordErr','regConfirmPwErr']);
  const fullName = document.getElementById('regFullName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirmPw').value;
  let valid = true;
  if (!fullName)  { setFieldError('regFullNameErr',  t('fieldRequired'));     valid = false; }
  if (!username)  { setFieldError('regUsernameErr',  t('usernameRequired'));  valid = false; }
  if (!email)     { setFieldError('regEmailErr',     t('emailRequired'));     valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('regEmailErr', t('emailInvalid')); valid = false; }
  if (!password)  { setFieldError('regPasswordErr',  t('passwordRequired'));  valid = false; }
  else if (password.length < 6) { setFieldError('regPasswordErr', t('passwordShort')); valid = false; }
  if (password !== confirm) { setFieldError('regConfirmPwErr', t('passwordMismatch')); valid = false; }
  if (!valid) return;
  const result = registerUser({ fullName, username, email, password });
  if (!result.success) { setFieldError('regConfirmPwErr', t(result.error)); return; }

  // FIX: migrate orphan reminders to the newly registered user so any tasks
  // saved before an account existed are not lost.
  const migrated = migrateOrphanReminders(result.user.id);
  if (migrated > 0) {
    console.info('[Memory Helper] handleRegister: migrated ' + migrated + ' orphan reminder(s) to new user ' + result.user.id);
  }

  showToast(t('registerSuccess'), 'success');
  showApp();
  navigateTo('dashboard');
  startNotificationPoller(result.user.id);
}

function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearFormErrors(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) { el.textContent = ''; el.style.display = 'none'; } });
}

// ── Navigation / Routing ──────────────────────────────────────────────────────
function navigateTo(page) {
  App.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) {
    pageEl.classList.add('active');
    pageEl.classList.add('page-enter');
    setTimeout(() => pageEl.classList.remove('page-enter'), 400);
  }
  document.querySelectorAll(`.nav-link[data-page="${page}"]`).forEach(l => l.classList.add('active'));
  closeSidebar();
  renderPage(page);
  applyTranslations();
}

function renderPage(page) {
  const user = getCurrentUser();
  switch (page) {
    case 'dashboard':     renderDashboard(user);         break;
    case 'tasks':         renderTasksPage(user);          break;
    case 'calendar':      renderCalendarPage(user);       break;
    case 'notifications': renderNotificationsPage(user);  break;
    case 'profile':       renderProfilePage(user);        break;
    case 'settings':      renderSettingsPage();           break;
    default: break;
  }
  updateNotifBadge();
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function openSidebar()  { App.sidebarOpen = true;  document.getElementById('sidebar').classList.add('open');    document.getElementById('sidebarOverlay').classList.add('active'); }
function closeSidebar() { App.sidebarOpen = false; document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('active'); }
function toggleSidebar(){ App.sidebarOpen ? closeSidebar() : openSidebar(); }

function renderUserInfo() {
  const user = getCurrentUser();
  if (!user) return;
  const el = document.getElementById('sidebarUser');
  if (!el) return;
  const initials = user.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  el.innerHTML = `
    <div class="sidebar-avatar">${user.avatar ? `<img src="${user.avatar}" alt="">` : `<span>${initials}</span>`}</div>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${escapeHtml(user.fullName)}</div>
      <div class="sidebar-user-email">${escapeHtml(user.email)}</div>
    </div>`;
}

function updateNotifBadge() {
  const user  = getCurrentUser();
  const count = getUnreadCount(user?.id);
  document.querySelectorAll('.notif-badge').forEach(b => {
    b.textContent   = count > 9 ? '9+' : count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard(user) {
  const stats   = getReminderStats(user?.id);
  const todayRem   = filterReminders('today',   user?.id);
  const overdueRem = filterReminders('overdue', user?.id);
  const upcomRem   = filterReminders('upcoming', user?.id).slice(0, 4);

  const hour     = new Date().getHours();
  const greetKey = hour < 12 ? 'greeting_morning' : hour < 17 ? 'greeting_afternoon' : 'greeting_evening';
  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const dateOpts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const dateStr  = new Date().toLocaleDateString(getLang() === 'th' ? 'th-TH' : 'en-US', dateOpts);

  document.getElementById('page-dashboard').innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="greeting-text">${t(greetKey)}, <span class="gradient-text">${escapeHtml(user?.fullName?.split(' ')[0] || '')}</span> 👋</h1>
        <p class="greeting-date">${t('todayIs')} ${dateStr}</p>
      </div>
      <button class="btn btn-primary" onclick="openTaskModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>${t('addTask')}</span>
      </button>
    </div>

    <div class="stats-grid" style="margin-bottom:1rem">
      ${statCard('📋', stats.total,     'totalTasks', 'stat-blue')}
      ${statCard('✅', stats.completed, 'completed',  'stat-green')}
      ${statCard('⏳', stats.pending,   'pending',    'stat-yellow')}
      ${statCard('🔴', stats.overdue,   'overdue',    'stat-red')}
      ${statCard('📅', stats.today,     'dueToday',   'stat-teal')}
    </div>

    <div class="progress-card">
      <div class="progress-header">
        <span>${t('todaysProgress')}</span>
        <span class="progress-pct">${progressPct}%</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${progressPct}%"></div></div>
    </div>

    <div class="dashboard-grid">
      <div class="dash-section">
        <div class="dash-section-header">
          <h2>${t('todaysTasks')}</h2>
          <span class="badge badge-green">${todayRem.length}</span>
        </div>
        ${todayRem.length === 0
          ? `<div class="empty-state-small"><span>🎉</span><p>${t('noTasksToday')}</p></div>`
          : todayRem.map(r => reminderMiniCard(r)).join('')}
      </div>

      <div class="dash-section">
        <div class="dash-section-header">
          <h2>${t('upcomingTasks')}</h2>
          <span class="badge badge-blue">${upcomRem.length}</span>
        </div>
        ${upcomRem.length === 0
          ? `<div class="empty-state-small"><span>📭</span><p>${t('noUpcomingTasks')}</p></div>`
          : upcomRem.map(r => reminderMiniCard(r)).join('')}
      </div>

      <div class="dash-section">
        <div class="dash-section-header">
          <h2>${t('overdueTasks')}</h2>
          <span class="badge badge-red">${overdueRem.length}</span>
        </div>
        ${overdueRem.length === 0
          ? `<div class="empty-state-small"><span>👍</span><p>${t('noOverdueTasks')}</p></div>`
          : overdueRem.map(r => reminderMiniCard(r)).join('')}
      </div>

      <div class="dash-section">
        <div class="dash-section-header">
          <h2>${t('completedTasks')}</h2>
          <span class="badge badge-green">${stats.completed}</span>
        </div>
        ${stats.completed === 0
          ? `<div class="empty-state-small"><span>📝</span><p>${t('noCompletedYet')}</p></div>`
          : filterReminders('completed', user?.id).slice(0, 4).map(r => reminderMiniCard(r)).join('')}
      </div>
    </div>`;
}

function statCard(icon, value, labelKey, cls) {
  return `<div class="stat-card ${cls}"><div class="stat-icon">${icon}</div><div class="stat-body"><div class="stat-value">${value}</div><div class="stat-label">${t(labelKey)}</div></div></div>`;
}

function reminderMiniCard(r) {
  const status = r.completed ? 'completed' : isOverdue(r) ? 'overdue' : isDueToday(r) ? 'dueToday' : 'upcoming';
  return `
    <div class="reminder-mini-card priority-${r.priority} ${r.completed ? 'is-completed' : ''}" onclick="openTaskModal('${r.id}')">
      <div class="rmc-left">
        <button class="complete-btn ${r.completed ? 'done' : ''}"
                onclick="event.stopPropagation();toggleTaskComplete('${r.id}')"
                aria-label="${t(r.completed ? 'markPending' : 'markCompleted')}">
          ${r.completed ? '✅' : '<span class="check-circle"></span>'}
        </button>
        <div>
          <div class="rmc-title ${r.completed ? 'strikethrough' : ''}">${escapeHtml(r.title)}</div>
          ${r.subject ? `<div class="rmc-sub" style="font-size:.72rem;color:var(--text-3)">${escapeHtml(r.subject)}</div>` : ''}
        </div>
      </div>
      <div class="rmc-right">
        ${r.date ? `<span class="rmc-date status-${status}">${formatDate(r.date)} ${r.time || ''}</span>` : ''}
        <span class="badge badge-${r.priority}">${t(r.priority)}</span>
      </div>
    </div>`;
}

// ── Tasks page ────────────────────────────────────────────────────────────────
function renderTasksPage(user) {
  const filters = ['all', 'pending', 'completed', 'overdue'];
  const filterBtns = filters.map(f =>
    `<button class="filter-btn ${App.currentFilter === f ? 'active' : ''}" onclick="setFilter('${f}')">${t(f)}</button>`
  ).join('');

  document.getElementById('page-tasks').innerHTML = `
    <div class="page-header">
      <h1>${t('myTasks')}</h1>
      <button class="btn btn-primary" onclick="openTaskModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>${t('addTask')}</span>
      </button>
    </div>
    <div class="tasks-toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" id="taskSearch" class="search-input" placeholder="${t('searchTasks')}"
               value="${escapeHtml(App.searchQuery)}" oninput="handleSearch(this.value)">
      </div>
      <div class="sort-wrap">
        <select class="form-select sort-select" onchange="handleSort(this.value)">
          <option value="date"     ${App.currentSort==='date'     ?'selected':''}>${t('sortDate')}</option>
          <option value="priority" ${App.currentSort==='priority' ?'selected':''}>${t('sortPriority')}</option>
          <option value="title"    ${App.currentSort==='title'    ?'selected':''}>${t('sortTitle')}</option>
        </select>
      </div>
    </div>
    <div class="filter-bar">${filterBtns}</div>
    <div id="taskList" class="task-list"></div>`;

  renderTaskList(user);
}

function renderTaskList(user) {
  const userId = user?.id;
  let list = App.searchQuery
    ? searchReminders(App.searchQuery, userId)
    : filterReminders(App.currentFilter, userId);
  list = sortReminders(list, App.currentSort);

  const container = document.getElementById('taskList');
  if (!container) return;

  if (list.length === 0) {
    const isEmpty = filterReminders('all', userId).length === 0;
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${isEmpty ? '📋' : '🔍'}</div>
        <h3>${isEmpty ? t('noTasksYet') : t('noResults')}</h3>
        <p style="color:var(--text-3);font-size:.875rem">${isEmpty ? t('noTasksHint') : ''}</p>
        ${isEmpty ? `<button class="btn btn-primary" onclick="openTaskModal()" style="margin-top:.5rem">${t('addTask')}</button>` : ''}
      </div>`;
    return;
  }

  container.innerHTML = list.map(r => taskCard(r)).join('');
}

function taskCard(r) {
  const status = r.completed ? 'completed' : isOverdue(r) ? 'overdue' : isDueToday(r) ? 'dueToday' : 'upcoming';
  return `
    <div class="task-card priority-${r.priority} ${r.completed ? 'is-completed' : ''}" id="tc-${r.id}">
      <div class="tc-main">
        <button class="complete-btn ${r.completed ? 'done' : ''}"
                onclick="toggleTaskComplete('${r.id}')"
                aria-label="${t(r.completed ? 'markPending' : 'markCompleted')}">
          ${r.completed ? '✅' : '<span class="check-circle"></span>'}
        </button>
        <div class="tc-content" onclick="openTaskModal('${r.id}')">
          <div class="tc-title ${r.completed ? 'strikethrough' : ''}">${escapeHtml(r.title)}</div>
          ${r.description ? `<div class="tc-desc">${escapeHtml(r.description)}</div>` : ''}
          <div class="tc-meta">
            ${r.subject ? `<span class="tc-chip">📚 ${escapeHtml(r.subject)}</span>` : ''}
            ${r.teacher ? `<span class="tc-chip">👩‍🏫 ${escapeHtml(r.teacher)}</span>` : ''}
            ${r.date ? `<span class="tc-chip chip-date status-${status}">📅 ${formatDate(r.date)}${r.time ? ' ' + r.time : ''}</span>` : ''}
            <span class="tc-chip">
              ${r.completed
                ? `<span style="color:var(--success)">✅ ${t('statusCompleted')}</span>`
                : `<span style="color:var(--warning)">⏳ ${t('statusPending')}</span>`}
            </span>
          </div>
        </div>
        <div class="tc-actions">
          <span class="badge badge-${r.priority}">${t(r.priority)}</span>
          <button class="icon-btn" onclick="openTaskModal('${r.id}')" aria-label="${t('edit')}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="confirmDeleteTask('${r.id}')" aria-label="${t('delete')}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>`;
}

function setFilter(f) {
  App.currentFilter = f;
  App.searchQuery   = '';
  renderTasksPage(getCurrentUser());
}

function handleSearch(q) {
  App.searchQuery = q;
  renderTaskList(getCurrentUser());
}

function handleSort(s) {
  App.currentSort = s;
  renderTaskList(getCurrentUser());
}

// ── Task Modal (Add / Edit) ───────────────────────────────────────────────────
function openTaskModal(id = null, prefillDate = null) {
  const reminder = id ? getReminderById(id) : null;
  const isEdit   = !!reminder;
  const userId   = getCurrentUser()?.id;
  const subjectNames = getSubjectNames(userId);
  const teacherNames = getTeacherNames(userId);

  document.getElementById('modalTitle').textContent = t(isEdit ? 'editTask' : 'addTask');
  document.getElementById('modalBody').innerHTML = `
    <form id="taskForm" novalidate>
      <input type="hidden" id="taskId" value="${id || ''}">

      <div class="form-group">
        <label class="form-label">${t('taskTitle')} <span class="required">*</span></label>
        <input type="text" id="taskTitle" class="form-input"
               placeholder="${t('taskTitlePh')}"
               value="${escapeHtml(reminder?.title || '')}" required>
        <span class="form-error" id="taskTitleErr"></span>
      </div>

      <div class="form-group">
        <label class="form-label">${t('description')}</label>
        <textarea id="taskDesc" class="form-input form-textarea"
                  placeholder="${t('descriptionPlaceholder')}">${escapeHtml(reminder?.description || '')}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">📚 ${t('subject')}</label>
          <input type="text" id="taskSubject" class="form-input" list="subjectSuggestions"
                 placeholder="${t('subjectPh')}" autocomplete="off"
                 value="${escapeHtml(reminder?.subject || '')}">
          <datalist id="subjectSuggestions">
            ${subjectNames.map(n => `<option value="${escapeHtml(n)}">`).join('')}
          </datalist>
        </div>
        <div class="form-group">
          <label class="form-label">👩‍🏫 ${t('teacher')}</label>
          <input type="text" id="taskTeacher" class="form-input" list="teacherSuggestions"
                 placeholder="${t('teacherPh')}" autocomplete="off"
                 value="${escapeHtml(reminder?.teacher || '')}">
          <datalist id="teacherSuggestions">
            ${teacherNames.map(n => `<option value="${escapeHtml(n)}">`).join('')}
          </datalist>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('date')} <span class="required">*</span></label>
          <input type="date" id="taskDate" class="form-input"
                 value="${reminder?.date || prefillDate || ''}">
          <span class="form-error" id="taskDateErr"></span>
        </div>
        <div class="form-group">
          <label class="form-label">${t('time')}</label>
          <input type="time" id="taskTime" class="form-input"
                 value="${reminder?.time || ''}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t('priority')}</label>
        <div class="priority-radio-group">
          ${PRIORITIES.map(p => `
            <label class="priority-radio priority-radio-${p} ${(reminder?.priority || 'normal') === p ? 'active' : ''}">
              <input type="radio" name="taskPriority" value="${p}"
                     ${(reminder?.priority || 'normal') === p ? 'checked' : ''}
                     onchange="updatePriorityRadios()">
              ${t(p)}
            </label>`).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t('status')}</label>
        <div class="status-radio-group">
          <label class="status-radio ${!reminder?.completed ? 'active' : ''}">
            <input type="radio" name="taskStatus" value="pending"
                   ${!reminder?.completed ? 'checked' : ''}
                   onchange="updateStatusRadios()">
            ⏳ ${t('statusPending')}
          </label>
          <label class="status-radio status-radio-done ${reminder?.completed ? 'active' : ''}">
            <input type="radio" name="taskStatus" value="completed"
                   ${reminder?.completed ? 'checked' : ''}
                   onchange="updateStatusRadios()">
            ✅ ${t('statusCompleted')}
          </label>
        </div>
      </div>
    </form>`;

  document.getElementById('modalSaveBtn').onclick = handleSaveTask;
  document.getElementById('modalDeleteBtn').style.display = isEdit ? 'inline-flex' : 'none';
  document.getElementById('modalDeleteBtn').onclick = () => { closeModal(); confirmDeleteTask(id); };
  openModal();
}

function updatePriorityRadios() {
  document.querySelectorAll('.priority-radio').forEach(lbl => {
    lbl.classList.toggle('active', lbl.querySelector('input').checked);
  });
}

function updateStatusRadios() {
  document.querySelectorAll('.status-radio').forEach(lbl => {
    lbl.classList.toggle('active', lbl.querySelector('input').checked);
  });
}

function handleSaveTask() {
  clearFormErrors(['taskTitleErr', 'taskDateErr']);
  const id          = document.getElementById('taskId').value;
  const title       = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDesc').value.trim();
  const subject     = document.getElementById('taskSubject').value.trim();
  const teacher     = document.getElementById('taskTeacher').value.trim();
  const date        = document.getElementById('taskDate').value;
  const time        = document.getElementById('taskTime').value;
  const priority    = document.querySelector('input[name="taskPriority"]:checked')?.value || 'normal';
  const statusVal   = document.querySelector('input[name="taskStatus"]:checked')?.value || 'pending';
  const completed   = statusVal === 'completed';

  const { valid, errors } = validateReminderForm({ title, date });
  if (!valid) {
    if (errors.title) setFieldError('taskTitleErr', t(errors.title));
    if (errors.date)  setFieldError('taskDateErr',  t(errors.date));
    return;
  }

  const user = getCurrentUser();

  // Save subject/teacher so they can be reused (suggested) on future tasks.
  // Blank input is simply skipped — nothing predefined is ever created.
  if (subject) addSubject(subject, user?.id);
  if (teacher) addTeacher(teacher, user?.id);

  if (id) {
    const existing = getReminderById(id);
    updateReminder(id, { title, description, subject, teacher, date, time, priority });
    // Handle completion status change separately
    if (completed !== existing?.completed) {
      completed ? completeReminder(id) : uncompleteReminder(id);
    }
    showToast(t('taskUpdated'), 'success');
  } else {
    const newTask = addReminder({ title, description, subject, teacher, date, time, priority }, user?.id);
    if (completed) completeReminder(newTask.id);
    showToast(t('taskAdded'), 'success');
  }

  closeModal();
  renderPage(App.currentPage);
}

function toggleTaskComplete(id) {
  const r = getReminderById(id);
  if (!r) return;
  if (r.completed) {
    uncompleteReminder(id);
    showToast(t('taskMarkedPending'), 'info');
  } else {
    completeReminder(id);
    showToast(t('taskCompleted'), 'success');
  }
  renderPage(App.currentPage);
}

function confirmDeleteTask(id) {
  showConfirm(t('confirmDelete'), () => {
    deleteReminder(id);
    showToast(t('taskDeleted'), 'error');
    renderPage(App.currentPage);
  });
}

// Keep old name as alias so notifications.js still works
function openReminderModal(id, prefillDate) { openTaskModal(id, prefillDate); }
function toggleReminderComplete(id)         { toggleTaskComplete(id); }
function confirmDeleteReminder(id)          { confirmDeleteTask(id); }

// ── Calendar page ─────────────────────────────────────────────────────────────
function renderCalendarPage(user) {
  document.getElementById('page-calendar').innerHTML = `
    <div class="page-header">
      <h1>${t('calendarView')}</h1>
      <button class="btn btn-primary" onclick="openTaskModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>${t('addTask')}</span>
      </button>
    </div>
    <div class="calendar-layout">
      <div id="calendarContainer"></div>
      <div id="calDayPanel" class="cal-day-panel" style="display:none"></div>
    </div>`;
  renderCalendar('calendarContainer', user?.id);
}

// ── Notifications page ────────────────────────────────────────────────────────
function renderNotificationsPage(user) {
  const notifs  = buildNotifications(user?.id);
  const readIds = getReadNotifIds();

  document.getElementById('page-notifications').innerHTML = `
    <div class="page-header">
      <h1>${t('notificationCenter')}</h1>
      <div class="header-actions">
        <button class="btn btn-outline" onclick="handleMarkAllRead()">${t('markAllRead')}</button>
        <button class="btn btn-outline" id="browserNotifBtn" onclick="handleBrowserNotifRequest()">
          🔔 ${t('enableBrowserNotif')}
        </button>
      </div>
    </div>
    <div class="notif-list" id="notifList">
      ${notifs.length === 0
        ? `<div class="empty-state"><div class="empty-icon">🔕</div><h3>${t('noNotifications')}</h3></div>`
        : notifs.map(n => notifCard(n, readIds.includes(n.id))).join('')}
    </div>`;

  updateBrowserNotifBtn();
}

function notifCard(n, isRead) {
  const icons  = { overdue:'🔴', dueToday:'🟡', dueSoon:'🟠', upcoming:'🔵', completed:'🟢' };
  const labels = { overdue:'overdue', dueToday:'dueToday', dueSoon:'dueSoon', upcoming:'upcoming', completed:'completed' };
  return `
    <div class="notif-card notif-${n.type} ${isRead ? 'is-read' : ''}" id="nc-${n.id}">
      <div class="notif-icon">${icons[n.type] || '🔵'}</div>
      <div class="notif-content">
        <div class="notif-title">${escapeHtml(n.title)}</div>
        <div class="notif-meta">
          <span class="notif-status-badge">${t(labels[n.type])}</span>
          ${n.date ? `<span class="notif-date">📅 ${formatDate(n.date)} ${n.time || ''}</span>` : ''}
          <span class="badge badge-${n.priority}">${t(n.priority)}</span>
        </div>
      </div>
      <div class="notif-actions">
        ${!isRead ? `<button class="icon-btn" onclick="handleMarkRead('${n.id}')" aria-label="${t('markAsRead')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </button>` : ''}
        <button class="icon-btn" onclick="openTaskModal('${n.reminderId}')" aria-label="${t('edit')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>
    </div>`;
}

function handleMarkRead(id) {
  markNotifRead(id);
  document.getElementById('nc-' + id)?.classList.add('is-read');
  updateNotifBadge();
}

function handleMarkAllRead() {
  markAllNotifsRead(getCurrentUser()?.id);
  document.querySelectorAll('.notif-card').forEach(el => el.classList.add('is-read'));
  updateNotifBadge();
}

async function handleBrowserNotifRequest() {
  const result = await requestBrowserPermission();
  updateBrowserNotifBtn();
  if (result === 'granted')     showToast(t('browserNotifEnabled'), 'success');
  else if (result === 'denied') showToast(t('browserNotifDenied'), 'error');
}

function updateBrowserNotifBtn() {
  const btn  = document.getElementById('browserNotifBtn');
  if (!btn) return;
  const perm = getBrowserNotifPermission();
  if (perm === 'granted') {
    btn.innerHTML = `✅ ${t('browserNotifEnabled')}`;
    btn.disabled  = true;
  } else if (perm === 'denied') {
    btn.innerHTML = `❌ ${t('browserNotifDenied')}`;
    btn.disabled  = true;
  }
}

// ── Profile page ──────────────────────────────────────────────────────────────
function renderProfilePage(user) {
  if (!user) return;
  const stats    = getReminderStats(user.id);
  const initials = user.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const joined   = new Date(user.createdAt).toLocaleDateString(getLang() === 'th' ? 'th-TH' : 'en-US', { year:'numeric', month:'long', day:'numeric' });

  document.getElementById('page-profile').innerHTML = `
    <div class="page-header"><h1>${t('profileTitle')}</h1></div>
    <div class="profile-layout">
      <div class="profile-card">
        <div class="profile-avatar-big">${user.avatar ? `<img src="${user.avatar}" alt="">` : `<span>${initials}</span>`}</div>
        <h2 class="profile-name">${escapeHtml(user.fullName)}</h2>
        <p class="profile-username">@${escapeHtml(user.username)}</p>
        <p class="profile-email">${escapeHtml(user.email)}</p>
        <p class="profile-joined">${t('memberSince')}: ${joined}</p>
        <div class="profile-stats">
          <div class="pstat"><div class="pstat-val">${stats.total}</div><div class="pstat-lbl">${t('totalTasks')}</div></div>
          <div class="pstat"><div class="pstat-val">${stats.completed}</div><div class="pstat-lbl">${t('completedTasks')}</div></div>
          <div class="pstat"><div class="pstat-val">${stats.overdue}</div><div class="pstat-lbl">${t('overdue')}</div></div>
        </div>
      </div>
      <div class="profile-edit-card">
        <h3>${t('editProfile')}</h3>
        <form id="profileForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('fullName')}</label>
              <input type="text" id="pfFullName" class="form-input" value="${escapeHtml(user.fullName)}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('username')}</label>
              <input type="text" id="pfUsername" class="form-input" value="${escapeHtml(user.username)}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('email')}</label>
            <input type="email" id="pfEmail" class="form-input" value="${escapeHtml(user.email)}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">🏫 ${getLang()==='th'?'โรงเรียน':'School'}</label>
              <input type="text" id="pfSchool" class="form-input" value="${escapeHtml(user.school||'')}">
            </div>
            <div class="form-group">
              <label class="form-label">📚 ${getLang()==='th'?'ระดับชั้น':'Grade'}</label>
              <input type="text" id="pfGrade" class="form-input" value="${escapeHtml(user.grade||'')}">
            </div>
          </div>
          <button type="submit" class="btn btn-primary">${t('saveProfile')}</button>
        </form>
        <div class="profile-divider"></div>
        <h3>${t('changePassword')}</h3>
        <form id="changePasswordForm">
          <div class="form-group">
            <label class="form-label">${t('currentPassword')}</label>
            <input type="password" id="pfCurrentPw" class="form-input" placeholder="${t('currentPassword')}">
            <span class="form-error" id="pfPwErr"></span>
          </div>
          <div class="form-group">
            <label class="form-label">${t('newPassword')}</label>
            <input type="password" id="pfNewPw" class="form-input" placeholder="${t('newPassword')}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('confirmPassword')}</label>
            <input type="password" id="pfConfirmPw" class="form-input" placeholder="${t('confirmPassword')}">
          </div>
          <button type="submit" class="btn btn-outline">${t('changePassword')}</button>
        </form>
      </div>
    </div>`;

  document.getElementById('profileForm').addEventListener('submit', e => {
    e.preventDefault();
    const result = updateProfile({
      fullName: document.getElementById('pfFullName').value.trim(),
      username: document.getElementById('pfUsername').value.trim(),
      email:    document.getElementById('pfEmail').value.trim(),
      school:   document.getElementById('pfSchool').value.trim(),
      grade:    document.getElementById('pfGrade').value.trim(),
    });
    if (result.success) { showToast(t('profileSaved'), 'success'); renderUserInfo(); renderProfilePage(getCurrentUser()); }
  });

  document.getElementById('changePasswordForm').addEventListener('submit', e => {
    e.preventDefault();
    clearFormErrors(['pfPwErr']);
    const currentPw = document.getElementById('pfCurrentPw').value;
    const newPw     = document.getElementById('pfNewPw').value;
    const confirmPw = document.getElementById('pfConfirmPw').value;
    if (newPw !== confirmPw) { setFieldError('pfPwErr', t('passwordMismatch')); return; }
    if (newPw.length < 6)   { setFieldError('pfPwErr', t('passwordShort'));    return; }
    const result = changePassword({ currentPassword: currentPw, newPassword: newPw });
    if (!result.success) { setFieldError('pfPwErr', t(result.error || 'loginFailed')); return; }
    showToast(t('profileSaved'), 'success');
    document.getElementById('changePasswordForm').reset();
  });
}

// ── Settings page ─────────────────────────────────────────────────────────────
function renderSettingsPage() {
  const theme = getTheme();
  const lang  = getLang();
  document.getElementById('page-settings').innerHTML = `
    <div class="page-header"><h1>${t('settingsTitle')}</h1></div>
    <div class="settings-layout">
      <div class="settings-section">
        <h3>${t('appearance')}</h3>
        <div class="theme-options">
          <button class="theme-opt ${theme==='light'?'active':''}" onclick="applyTheme('light');renderSettingsPage()">
            <span>☀️</span><span>${t('lightMode')}</span>
          </button>
          <button class="theme-opt ${theme==='dark'?'active':''}" onclick="applyTheme('dark');renderSettingsPage()">
            <span>🌙</span><span>${t('darkMode')}</span>
          </button>
        </div>
      </div>
      <div class="settings-section">
        <h3>${t('languageSettings')}</h3>
        <div class="theme-options">
          <button class="theme-opt ${lang==='th'?'active':''}" onclick="setLanguage('th');updateLangToggle();renderSettingsPage()">
            <span>🇹🇭</span><span>${t('thai')}</span>
          </button>
          <button class="theme-opt ${lang==='en'?'active':''}" onclick="setLanguage('en');updateLangToggle();renderSettingsPage()">
            <span>🇬🇧</span><span>${t('english')}</span>
          </button>
        </div>
      </div>
      <div class="settings-section">
        <h3>${t('dataManagement')}</h3>
        <div class="settings-actions">
          <button class="btn btn-outline" onclick="handleExport()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${t('exportData')}
          </button>
          <label class="btn btn-outline" style="cursor:pointer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ${t('importData')}
            <input type="file" accept=".json" style="display:none" onchange="handleImport(event)">
          </label>
          <button class="btn btn-danger" onclick="handleClearData()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            ${t('clearAllData')}
          </button>
        </div>
      </div>
    </div>`;
}

function handleExport() {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `memory-helper-backup-${todayStr()}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast(t('dataExported'), 'success');
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      importAllData(data);
      showToast(t('taskAdded'), 'success');
      renderPage(App.currentPage);
    } catch { showToast('Invalid file', 'error'); }
  };
  reader.readAsText(file);
}

function handleClearData() {
  // FIX: use a stronger, explicit confirmation message so the user
  // understands exactly what will be deleted (tasks + messages only;
  // accounts and subject/teacher names are kept).
  const msg = getLang() === 'th'
    ? 'ลบงานและข้อความทั้งหมดหรือไม่?\n\nบัญชีผู้ใช้และข้อมูลวิชา/ครูจะยังคงอยู่\nการกระทำนี้ไม่สามารถย้อนกลับได้'
    : 'Delete ALL tasks and messages?\n\nUser accounts and subject/teacher names will be kept.\nThis cannot be undone.';
  showConfirm(msg, () => {
    clearAppData();
    showToast(t('dataCleaned'), 'success');
    renderPage(App.currentPage);
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
function handleLogout() {
  showConfirm(t('confirmLogout'), () => {
    stopNotificationPoller();
    logoutUser();
    showToast(t('logoutSuccess'), 'success');
    showAuth('login');
  });
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal() {
  const modal = document.getElementById('mainModal');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('.modal-content')?.classList.add('modal-in'), 10);
}

function closeModal() {
  const modal = document.getElementById('mainModal');
  modal.querySelector('.modal-content')?.classList.remove('modal-in');
  setTimeout(() => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }, 200);
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function showConfirm(message, onConfirm) {
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmModal').classList.add('active');
  document.getElementById('confirmYesBtn').onclick = () => {
    document.getElementById('confirmModal').classList.remove('active');
    onConfirm();
  };
  document.getElementById('confirmNoBtn').onclick = () => {
    document.getElementById('confirmModal').classList.remove('active');
  };
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const id    = 'toast-' + Date.now();
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.id = id;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${escapeHtml(message)}</span><button class="toast-close" onclick="removeToast('${id}')">×</button>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => removeToast(id), 3500);
}

function removeToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('toast-show');
  setTimeout(() => el.remove(), 300);
}

// ── Date format helpers ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(getLang() === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString(getLang() === 'th' ? 'th-TH' : 'en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ── escapeHtml (shared utility) ───────────────────────────────────────────────
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Global event bindings ─────────────────────────────────────────────────────
function bindGlobalEvents() {
  document.getElementById('hamburgerBtn')?.addEventListener('click', toggleSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); navigateTo(link.dataset.page); });
  });

  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('langToggleBtn')?.addEventListener('click', toggleLanguage);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn')?.addEventListener('click', closeModal);
  document.getElementById('mainModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('mainModal')) closeModal();
  });

  document.getElementById('fabAddBtn')?.addEventListener('click', () => openTaskModal());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      document.getElementById('confirmModal')?.classList.remove('active');
    }
  });

  document.getElementById('globalSearch')?.addEventListener('input', e => {
    const q = e.target.value;
    if (q.length > 0) {
      App.searchQuery = q;
      navigateTo('tasks');
    }
  });
}
