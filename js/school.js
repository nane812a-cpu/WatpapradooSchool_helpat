/**
 * school.js
 * A separate "Schools" entity is not part of this build (a user's school is
 * just a field on their Profile — see auth.js / updateProfile). This module
 * stays in place, working and error-free, as a compatibility layer for any
 * code that still references school functions. No demo/sample schools are
 * ever created.
 */

function getSchools()           { return []; }
function getSchoolById()        { return null; }
function addSchool()            { return null; }
function updateSchool()         { return null; }
function deleteSchool()         {}
function openSchoolModal()      {}
function confirmDeleteSchool()  {}
function seedDemoSchools()      {}

function renderSchoolsPage(user) {
  const el = document.getElementById('page-schools');
  if (!el) return;
  el.innerHTML = `
    <div class="page-header">
      <h1>${typeof t === 'function' ? t('schools') : 'Schools'}</h1>
    </div>
    <div class="empty-state">
      <div class="empty-icon">🏫</div>
      <p style="color:var(--text-2)">${typeof t === 'function' ? t('featureRemoved') : 'This feature has been removed.'}</p>
    </div>`;
}
