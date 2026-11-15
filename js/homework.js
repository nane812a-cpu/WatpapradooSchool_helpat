/**
 * homework.js
 * Homework is no longer tracked as a separate entity — it's just a Task
 * (see reminders.js) with a Subject and Teacher attached (see subjects.js /
 * teachers.js). This module stays in place, working and error-free, purely
 * as a compatibility layer for any older code paths (e.g. calendar.js) that
 * still reference a "homework" list, so nothing breaks and nothing shows
 * duplicate or fake entries. No demo/sample homework is ever created.
 */

function getHomework()         { return []; }
function getHomeworkById()     { return null; }
function addHomework()         { return null; }
function updateHomework()      { return null; }
function deleteHomework()      {}
function completeHomework()    {}
function filterHomework()      { return []; }
function isHwOverdue()         { return false; }
function isHwDueToday()        { return false; }
function handleToggleHw()      {}
function openHomeworkModal()   {}
function confirmDeleteHomework(){}
function seedDemoHomework()    {}
function hwMiniCard()          { return ''; }
function hwCard()              { return ''; }
function setHwFilter()         {}
function buildSubjectOptions() { return '<option value="">–</option>'; }

// Stub page renderer (page-homework section still exists in HTML)
function renderHomeworkPage(user) {
  const el = document.getElementById('page-homework');
  if (!el) return;
  el.innerHTML = `
    <div class="page-header">
      <h1>${typeof t === 'function' ? t('myTasks') : 'My Tasks'}</h1>
    </div>
    <div class="empty-state">
      <div class="empty-icon">📝</div>
      <p style="color:var(--text-2)">Use the <strong>Tasks</strong> page to manage your assignments.</p>
    </div>`;
}
