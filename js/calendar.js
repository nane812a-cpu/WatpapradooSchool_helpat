/**
 * calendar.js  –  Calendar view, fully driven by the Task (reminder) system.
 *
 * Every task created/edited/deleted via the Add Task modal (see reminders.js
 * + app.js openTaskModal/handleSaveTask) is stored in localStorage under
 * mh_reminders. This file reads that same store fresh on every render, so
 * the calendar is always in sync with Tasks — no separate calendar data,
 * no demo/sample entries.
 */

let calState = {
  year:  new Date().getFullYear(),
  month: new Date().getMonth(),
  selectedDate: null,
  filter: 'all', // 'all' | 'pending' | 'completed' | 'overdue'
};

// ── Main render ───────────────────────────────────────────────────────────────

function renderCalendar(containerId, userId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { year, month } = calState;

  // ── Build date map straight from tasks (reminders) ─────────────────────────
  // Grouping is done purely by each task's own `date` field (its Due Date),
  // so a task always lands on the calendar day that matches what the user
  // picked in the Add Task form.
  const dateMap = {}; // dateStr -> Task[]

  filterReminders('all', userId).forEach(task => {
    if (!task.date) return;
    if (!dateMap[task.date]) dateMap[task.date] = [];
    dateMap[task.date].push(task);
  });

  const today       = todayStr();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames_en = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthNames_th = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const dayHeaders_en = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayHeaders_th = ['อา','จ','อ','พ','พฤ','ศ','ส'];

  const lang       = getLang();
  const monthNames = lang === 'th' ? monthNames_th : monthNames_en;
  const dayHeaders = lang === 'th' ? dayHeaders_th : dayHeaders_en;

  // Thai calendar convention: display year in Buddhist Era (B.E. = C.E. + 543).
  // Internally every date stays a plain Gregorian 'YYYY-MM-DD' string — only
  // this label is shifted, so date math/comparisons/storage are unaffected.
  const displayYear = lang === 'th' ? year + 543 : year;

  // ── Filter bar (All / Pending / Completed / Overdue) ────────────────────────
  const filterOpts = ['all', 'pending', 'completed', 'overdue'];
  const filterBtns = filterOpts.map(f =>
    `<button class="filter-btn ${calState.filter===f?'active':''} btn-sm"
       style="padding:.25rem .65rem;font-size:.72rem"
       onclick="setCalFilter('${f}')">${t(f)}</button>`
  ).join('');

  let html = `
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button class="cal-nav-btn" id="calPrev" aria-label="Previous month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="cal-month-title">
          <span class="cal-month">${monthNames[month]}</span>
          <span class="cal-year">${displayYear}</span>
        </div>
        <button class="cal-nav-btn" id="calNext" aria-label="Next month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="cal-mode-bar" style="display:flex;gap:.35rem;padding:.5rem .75rem;border-bottom:1px solid var(--border);flex-wrap:wrap">${filterBtns}</div>
      <div class="calendar-grid">`;

  dayHeaders.forEach(d => { html += `<div class="cal-day-header">${d}</div>`; });
  for (let i = 0; i < firstDay; i++) { html += `<div class="cal-cell cal-empty"></div>`; }

  const MAX_VISIBLE_TITLES = 2;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr  = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayTasks = (dateMap[dateStr] || []).filter(taskr => _matchesCalFilter(taskr));
    const isToday  = dateStr === today;
    const isSel    = dateStr === calState.selectedDate;

    const hasOverdue = dayTasks.some(taskr => isOverdue(taskr));
    const hasHigh    = dayTasks.some(taskr => taskr.priority === 'urgent' && !taskr.completed);
    const hasAny     = dayTasks.length > 0;

    let cls = 'cal-cell';
    if (isToday)      cls += ' cal-today';
    if (isSel)        cls += ' cal-selected';
    if (hasOverdue)   cls += ' cal-has-overdue';
    else if (hasHigh) cls += ' cal-has-high';
    else if (hasAny)  cls += ' cal-has-events';

    // Sort so overdue/urgent surface first, then by time.
    const sorted = [...dayTasks].sort((a, b) => {
      const pr = { urgent: 0, important: 1, normal: 2 };
      const pa = pr[a.priority] ?? 2, pb = pr[b.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      return (a.time || '').localeCompare(b.time || '');
    });

    const visible  = sorted.slice(0, MAX_VISIBLE_TITLES);
    const overflow = sorted.length - visible.length;

    const titlesHtml = visible.map(taskr => {
      const subj  = taskr.subject ? getSubjectByName(taskr.subject, userId) : null;
      const color = subj?.color || (taskr.priority === 'urgent' ? 'var(--danger)' : taskr.priority === 'important' ? 'var(--warning)' : 'var(--info)');
      return `<div class="cal-task-title ${taskr.completed ? 'strikethrough' : ''}"
                   style="border-left-color:${color}"
                   title="${escapeHtml(taskr.title)}"
                   onclick="event.stopPropagation(); openTaskModal('${taskr.id}');">
                ${escapeHtml(taskr.title)}
              </div>`;
    }).join('');

    const overflowHtml = overflow > 0
      ? `<div class="cal-task-more">+${overflow} ${lang==='th' ? 'เพิ่มเติม' : 'more'}</div>`
      : '';

    html += `
      <div class="${cls}" data-date="${dateStr}" role="button" tabindex="0" aria-label="${dateStr}">
        <span class="cal-day-num">${day}</span>
        ${hasAny ? `<div class="cal-task-titles">${titlesHtml}${overflowHtml}</div>` : ''}
      </div>`;
  }

  html += `</div></div>`;
  container.innerHTML = html;

  container.querySelector('#calPrev').addEventListener('click', () => {
    calState.month--; if (calState.month<0){calState.month=11;calState.year--;}
    renderCalendar(containerId, userId);
  });
  container.querySelector('#calNext').addEventListener('click', () => {
    calState.month++; if (calState.month>11){calState.month=0;calState.year++;}
    renderCalendar(containerId, userId);
  });
  container.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
    const onSelect = () => {
      calState.selectedDate = cell.dataset.date;
      renderCalendar(containerId, userId);
      showDayPanel(cell.dataset.date, userId);
    };
    cell.addEventListener('click', onSelect);
    cell.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect();} });
  });

  if (calState.selectedDate) showDayPanel(calState.selectedDate, userId);
}

function _matchesCalFilter(taskr) {
  switch (calState.filter) {
    case 'pending':   return !taskr.completed;
    case 'completed': return !!taskr.completed;
    case 'overdue':   return isOverdue(taskr);
    default:          return true;
  }
}

function setCalFilter(filter) {
  calState.filter = filter;
  const userId = getCurrentUser()?.id;
  renderCalendar('calendarContainer', userId);
}

// ── Day panel (tasks due that day) ───────────────────────────────────────────

function showDayPanel(dateStr, userId = null) {
  const panel = document.getElementById('calDayPanel');
  if (!panel) return;

  const dayTasks = filterReminders('all', userId)
    .filter(taskr => taskr.date === dateStr)
    .filter(taskr => _matchesCalFilter(taskr));

  const d    = new Date(dateStr + 'T12:00:00');
  const lang = getLang();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  // th-TH locale formatting renders the year in Buddhist Era (B.E.) automatically;
  // the underlying dateStr / Date object stay plain Gregorian.
  const displayDate = d.toLocaleDateString(lang==='th' ? 'th-TH' : 'en-US', opts);

  let itemsHtml = '';

  if (dayTasks.length > 0) {
    const sorted = sortReminders(dayTasks, 'priority');
    sorted.forEach(taskr => {
      const subj   = taskr.subject ? getSubjectByName(taskr.subject, userId) : null;
      const color  = subj?.color || 'var(--info)';
      const isDone = !!taskr.completed;
      const over   = isOverdue(taskr);
      const status = isDone ? 'completed' : over ? 'overdue' : isDueToday(taskr) ? 'dueToday' : 'upcoming';
      itemsHtml += `
        <div class="cal-reminder-item ${isDone?'is-completed':''}" style="border-left:3px solid ${color};cursor:pointer"
             onclick="openTaskModal('${taskr.id}')">
          <div class="cal-ri-left">
            <span class="cal-ri-dot status-${status}"></span>
            <div>
              <div class="cal-ri-title ${isDone?'strikethrough':''}">${escapeHtml(taskr.title)}</div>
              ${taskr.subject ? `<div class="cal-ri-sub" style="color:${color}">${escapeHtml(taskr.subject)}${taskr.teacher ? ' · ' + escapeHtml(taskr.teacher) : ''}</div>` : (taskr.teacher ? `<div class="cal-ri-sub">${escapeHtml(taskr.teacher)}</div>` : '')}
            </div>
          </div>
          <div class="cal-ri-right">
            ${taskr.time ? `<span class="cal-ri-time">${taskr.time}</span>` : ''}
            <span class="badge badge-${taskr.priority}">${t(taskr.priority)}</span>
            <button class="icon-btn" onclick="event.stopPropagation(); openTaskModal('${taskr.id}');" aria-label="${t('edit')}" style="width:24px;height:24px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>`;
    });
  } else {
    itemsHtml = `<div class="cal-empty-day"><span>📭</span><p>${t('noEventsDay')}</p></div>`;
  }

  panel.innerHTML = `
    <div class="cal-day-panel-inner">
      <div class="cal-day-panel-header">
        <h3>${displayDate}</h3>
        <button class="btn btn-sm btn-primary" onclick="openTaskModal(null,'${dateStr}')">
          + ${t('addTask')}
        </button>
      </div>
      <div class="cal-day-items">${itemsHtml}</div>
    </div>`;

  panel.style.display = 'block';
  panel.classList.add('fade-in');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function resetCalendar() {
  calState.year  = new Date().getFullYear();
  calState.month = new Date().getMonth();
  calState.selectedDate = null;
}
