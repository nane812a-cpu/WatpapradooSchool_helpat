/**
 * translations.js
 * Thai / English translations for Memory Helper.
 * Subjects, Teachers, Schools, and Homework demo keys removed.
 * Priorities: normal | important | urgent
 * Statuses:   pending | completed
 */

const TRANSLATIONS = {
  th: {
    // ── App ──────────────────────────────────────────────────────────────────
    appName:    'Memory Helper',
    appTagline: 'ผู้ช่วยจำงานนักเรียน',

    // ── Auth ─────────────────────────────────────────────────────────────────
    login:           'เข้าสู่ระบบ',
    register:        'สมัครสมาชิก',
    logout:          'ออกจากระบบ',
    email:           'อีเมล',
    username:        'ชื่อผู้ใช้',
    password:        'รหัสผ่าน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    fullName:        'ชื่อ-นามสกุล',
    rememberMe:      'จดจำฉัน',
    noAccount:       'ยังไม่มีบัญชี?',
    haveAccount:     'มีบัญชีแล้ว?',
    registerNow:     'สมัครเลย',
    loginNow:        'เข้าสู่ระบบ',
    showPassword:    'แสดงรหัสผ่าน',
    hidePassword:    'ซ่อนรหัสผ่าน',

    // ── Nav ──────────────────────────────────────────────────────────────────
    dashboard:     'หน้าหลัก',
    myTasks:       'งานของฉัน',
    calendar:      'ปฏิทิน',
    notifications: 'การแจ้งเตือน',
    profile:       'โปรไฟล์',
    settings:      'ตั้งค่า',
    schools:       'โรงเรียน',
    subjects:      'วิชา',
    teachers:      'ครู',

    // ── Dashboard ────────────────────────────────────────────────────────────
    greeting_morning:   'อรุณสวัสดิ์',
    greeting_afternoon: 'สวัสดีตอนบ่าย',
    greeting_evening:   'สวัสดีตอนเย็น',
    todayIs:            'วันนี้คือ',
    todaysTasks:        'งานวันนี้',
    upcomingTasks:      'งานที่กำลังจะถึง',
    overdueTasks:       'งานที่เลยกำหนด',
    completedTasks:     'งานที่เสร็จแล้ว',
    todaysProgress:     'ความคืบหน้าวันนี้',
    totalTasks:         'งานทั้งหมด',
    completed:          'เสร็จแล้ว',
    pending:            'รอดำเนินการ',
    overdue:            'เลยกำหนด',
    dueToday:           'ครบกำหนดวันนี้',
    noTasksToday:       'ไม่มีงานสำหรับวันนี้ 🎉',
    noUpcomingTasks:    'ไม่มีงานที่กำลังจะถึง',
    noOverdueTasks:     'ไม่มีงานที่เลยกำหนด 👍',
    noCompletedYet:     'ยังไม่มีงานที่เสร็จ',

    // ── Tasks ────────────────────────────────────────────────────────────────
    addTask:         '+ เพิ่มงาน',
    editTask:        'แก้ไขงาน',
    taskTitle:       'ชื่องาน',
    taskTitlePh:     'เช่น การบ้านคณิตศาสตร์...',
    noTasksYet:      'ยังไม่มีงาน',
    noTasksHint:     'กด "+ เพิ่มงาน" เพื่อสร้างงานแรกของคุณ',
    noResults:       'ไม่พบผลลัพธ์',
    searchTasks:     'ค้นหางาน...',
    taskAdded:       'เพิ่มงานสำเร็จ',
    taskUpdated:     'อัปเดตงานสำเร็จ',
    taskDeleted:     'ลบงานสำเร็จ',
    taskCompleted:   'ทำเครื่องหมายว่าเสร็จแล้ว',
    taskMarkedPending: 'ทำเครื่องหมายว่ายังไม่เสร็จ',

    // ── Form ─────────────────────────────────────────────────────────────────
    title:                  'ชื่อเรื่อง',
    description:            'รายละเอียด',
    descriptionPlaceholder: 'ใส่รายละเอียด (ไม่บังคับ)...',
    subject:                'วิชา',
    subjectPh:               'เช่น คณิตศาสตร์ (ไม่บังคับ)',
    teacher:                'ครูผู้สอน',
    teacherPh:               'เช่น อาจารย์สมชาย (ไม่บังคับ)',
    date:                   'วันที่กำหนดส่ง',
    time:                   'เวลา (ไม่บังคับ)',
    priority:               'ความสำคัญ',
    status:                 'สถานะ',
    cancel:                 'ยกเลิก',
    save:                   'บันทึก',
    delete:                 'ลบ',
    edit:                   'แก้ไข',
    noSubjectsYet:          'ยังไม่มีวิชาที่บันทึกไว้',
    noTeachersYet:          'ยังไม่มีครูที่บันทึกไว้',

    // ── Priority ─────────────────────────────────────────────────────────────
    normal:    'ปกติ',
    important: 'สำคัญ',
    urgent:    'เร่งด่วน',

    // ── Status ───────────────────────────────────────────────────────────────
    statusPending:   'รอดำเนินการ',
    statusCompleted: 'เสร็จแล้ว',
    markCompleted:   'ทำเครื่องหมายว่าเสร็จแล้ว',
    markPending:     'ทำเครื่องหมายว่ายังไม่เสร็จ',

    // ── Filters / Sort ────────────────────────────────────────────────────────
    all:          'ทั้งหมด',
    today:        'วันนี้',
    upcoming:     'กำลังจะถึง',
    highPriority: 'เร่งด่วน',
    sortDate:     'วันที่',
    sortPriority: 'ความสำคัญ',
    sortTitle:    'ชื่อเรื่อง',

    // ── Notifications ────────────────────────────────────────────────────────
    notificationCenter:   'ศูนย์การแจ้งเตือน',
    dueSoon:              'ใกล้ถึงกำหนด',
    markAsRead:           'ทำเครื่องหมายว่าอ่านแล้ว',
    markAllRead:          'ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว',
    noNotifications:      'ไม่มีการแจ้งเตือน',
    enableBrowserNotif:   'เปิดการแจ้งเตือนเบราว์เซอร์',
    browserNotifEnabled:  'เปิดการแจ้งเตือนแล้ว',
    browserNotifDenied:   'ถูกปฏิเสธการแจ้งเตือน',

    // ── Calendar ─────────────────────────────────────────────────────────────
    calendarView: 'มุมมองปฏิทิน',
    noEventsDay:  'ไม่มีงานในวันนี้',

    // ── Profile ──────────────────────────────────────────────────────────────
    profileTitle:    'โปรไฟล์ของฉัน',
    editProfile:     'แก้ไขโปรไฟล์',
    saveProfile:     'บันทึกโปรไฟล์',
    memberSince:     'สมาชิกตั้งแต่',
    changePassword:  'เปลี่ยนรหัสผ่าน',
    currentPassword: 'รหัสผ่านปัจจุบัน',
    newPassword:     'รหัสผ่านใหม่',

    // ── Settings ─────────────────────────────────────────────────────────────
    settingsTitle:    'ตั้งค่า',
    appearance:       'รูปลักษณ์',
    lightMode:        'โหมดสว่าง',
    darkMode:         'โหมดมืด',
    languageSettings: 'ตั้งค่าภาษา',
    thai:             'ภาษาไทย',
    english:          'ภาษาอังกฤษ',
    dataManagement:   'จัดการข้อมูล',
    clearAllData:     'ล้างข้อมูลทั้งหมด',
    exportData:       'ส่งออกข้อมูล',
    importData:       'นำเข้าข้อมูล',
    confirmClearData: 'แน่ใจไหม? การกระทำนี้ไม่สามารถย้อนกลับได้',

    // ── Toast / feedback ─────────────────────────────────────────────────────
    loginSuccess:    'เข้าสู่ระบบสำเร็จ',
    logoutSuccess:   'ออกจากระบบแล้ว',
    registerSuccess: 'สมัครสมาชิกสำเร็จ',
    profileSaved:    'บันทึกโปรไฟล์สำเร็จ',
    dataCleaned:     'ล้างข้อมูลทั้งหมดแล้ว',
    dataExported:    'ส่งออกข้อมูลสำเร็จ',

    // ── Validation ───────────────────────────────────────────────────────────
    fieldRequired:    'กรุณากรอกข้อมูลในช่องนี้',
    titleRequired:    'กรุณาใส่ชื่อเรื่อง',
    emailRequired:    'กรุณาใส่อีเมล',
    emailInvalid:     'รูปแบบอีเมลไม่ถูกต้อง',
    passwordRequired: 'กรุณาใส่รหัสผ่าน',
    passwordShort:    'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
    usernameRequired: 'กรุณาใส่ชื่อผู้ใช้',
    loginFailed:      'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    userExists:       'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว',
    dateRequired:     'กรุณาเลือกวันที่',

    // ── Confirm dialogs ───────────────────────────────────────────────────────
    confirmDelete: 'แน่ใจไหมที่จะลบงานนี้?',
    confirmLogout: 'แน่ใจไหมที่จะออกจากระบบ?',
    yes:           'ใช่',
    no:            'ไม่',

    // ── Misc ─────────────────────────────────────────────────────────────────
    featureRemoved: 'ฟีเจอร์นี้ถูกลบออกแล้ว',
  },

  en: {
    // ── App ──────────────────────────────────────────────────────────────────
    appName:    'Memory Helper',
    appTagline: 'Student Task & Reminder Assistant',

    // ── Auth ─────────────────────────────────────────────────────────────────
    login:           'Login',
    register:        'Register',
    logout:          'Logout',
    email:           'Email',
    username:        'Username',
    password:        'Password',
    confirmPassword: 'Confirm Password',
    fullName:        'Full Name',
    rememberMe:      'Remember me',
    noAccount:       "Don't have an account?",
    haveAccount:     'Already have an account?',
    registerNow:     'Register now',
    loginNow:        'Login now',
    showPassword:    'Show password',
    hidePassword:    'Hide password',

    // ── Nav ──────────────────────────────────────────────────────────────────
    dashboard:     'Dashboard',
    myTasks:       'My Tasks',
    calendar:      'Calendar',
    notifications: 'Notifications',
    profile:       'Profile',
    settings:      'Settings',
    schools:       'Schools',
    subjects:      'Subjects',
    teachers:      'Teachers',

    // ── Dashboard ────────────────────────────────────────────────────────────
    greeting_morning:   'Good morning',
    greeting_afternoon: 'Good afternoon',
    greeting_evening:   'Good evening',
    todayIs:            'Today is',
    todaysTasks:        "Today's Tasks",
    upcomingTasks:      'Upcoming Tasks',
    overdueTasks:       'Overdue Tasks',
    completedTasks:     'Completed Tasks',
    todaysProgress:     "Today's Progress",
    totalTasks:         'Total Tasks',
    completed:          'Completed',
    pending:            'Pending',
    overdue:            'Overdue',
    dueToday:           'Due Today',
    noTasksToday:       'No tasks for today 🎉',
    noUpcomingTasks:    'No upcoming tasks',
    noOverdueTasks:     'No overdue tasks 👍',
    noCompletedYet:     'No completed tasks yet',

    // ── Tasks ────────────────────────────────────────────────────────────────
    addTask:           '+ Add Task',
    editTask:          'Edit Task',
    taskTitle:         'Task Title',
    taskTitlePh:       'e.g. Math homework, Science project...',
    noTasksYet:        'No tasks yet',
    noTasksHint:       'Click "+ Add Task" to create your first task.',
    noResults:         'No results found',
    searchTasks:       'Search tasks...',
    taskAdded:         'Task added successfully',
    taskUpdated:       'Task updated successfully',
    taskDeleted:       'Task deleted successfully',
    taskCompleted:     'Marked as completed',
    taskMarkedPending: 'Marked as pending',

    // ── Form ─────────────────────────────────────────────────────────────────
    title:                  'Title',
    description:            'Description',
    descriptionPlaceholder: 'Add details (optional)...',
    subject:                'Subject',
    subjectPh:               'e.g. Mathematics (optional)',
    teacher:                'Teacher',
    teacherPh:               'e.g. Mr. Smith (optional)',
    date:                   'Due Date',
    time:                   'Due Time (optional)',
    priority:               'Priority',
    status:                 'Status',
    cancel:                 'Cancel',
    save:                   'Save',
    delete:                 'Delete',
    edit:                   'Edit',
    noSubjectsYet:          'No subjects saved yet',
    noTeachersYet:          'No teachers saved yet',

    // ── Priority ─────────────────────────────────────────────────────────────
    normal:    'Normal',
    important: 'Important',
    urgent:    'Urgent',

    // ── Status ───────────────────────────────────────────────────────────────
    statusPending:   'Pending',
    statusCompleted: 'Completed',
    markCompleted:   'Mark as Completed',
    markPending:     'Mark as Pending',

    // ── Filters / Sort ────────────────────────────────────────────────────────
    all:          'All',
    today:        'Today',
    upcoming:     'Upcoming',
    highPriority: 'Urgent',
    sortDate:     'Date',
    sortPriority: 'Priority',
    sortTitle:    'Title',

    // ── Notifications ────────────────────────────────────────────────────────
    notificationCenter:  'Notification Center',
    dueSoon:             'Due Soon',
    markAsRead:          'Mark as read',
    markAllRead:         'Mark all as read',
    noNotifications:     'No notifications',
    enableBrowserNotif:  'Enable Browser Notifications',
    browserNotifEnabled: 'Notifications enabled',
    browserNotifDenied:  'Notification permission denied',

    // ── Calendar ─────────────────────────────────────────────────────────────
    calendarView: 'Calendar View',
    noEventsDay:  'No tasks on this day',

    // ── Profile ──────────────────────────────────────────────────────────────
    profileTitle:    'My Profile',
    editProfile:     'Edit Profile',
    saveProfile:     'Save Profile',
    memberSince:     'Member Since',
    changePassword:  'Change Password',
    currentPassword: 'Current Password',
    newPassword:     'New Password',

    // ── Settings ─────────────────────────────────────────────────────────────
    settingsTitle:    'Settings',
    appearance:       'Appearance',
    lightMode:        'Light Mode',
    darkMode:         'Dark Mode',
    languageSettings: 'Language Settings',
    thai:             'Thai',
    english:          'English',
    dataManagement:   'Data Management',
    clearAllData:     'Clear All Data',
    exportData:       'Export Data',
    importData:       'Import Data',
    confirmClearData: 'Are you sure? This action cannot be undone.',

    // ── Toast / feedback ─────────────────────────────────────────────────────
    loginSuccess:    'Logged in successfully',
    logoutSuccess:   'Logged out successfully',
    registerSuccess: 'Account created successfully',
    profileSaved:    'Profile saved successfully',
    dataCleaned:     'All data cleared',
    dataExported:    'Data exported successfully',

    // ── Validation ───────────────────────────────────────────────────────────
    fieldRequired:    'This field is required',
    titleRequired:    'Please enter a title',
    emailRequired:    'Please enter your email',
    emailInvalid:     'Invalid email format',
    passwordRequired: 'Please enter your password',
    passwordShort:    'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    usernameRequired: 'Please enter a username',
    loginFailed:      'Invalid email or password',
    userExists:       'Username or email already exists',
    dateRequired:     'Please select a due date',

    // ── Confirm dialogs ───────────────────────────────────────────────────────
    confirmDelete: 'Are you sure you want to delete this task?',
    confirmLogout: 'Are you sure you want to logout?',
    yes:           'Yes',
    no:            'No',

    // ── Misc ─────────────────────────────────────────────────────────────────
    featureRemoved: 'This feature has been removed.',
  },
};

// ── Translation engine ────────────────────────────────────────────────────────

let currentLang = localStorage.getItem('mh_lang') || 'th';

function t(key) {
  return (TRANSLATIONS[currentLang]?.[key]) ||
         (TRANSLATIONS['en']?.[key]) ||
         key;
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('mh_lang', lang);
  applyTranslations();
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

function getLang() {
  return currentLang;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.documentElement.lang = currentLang;
}
