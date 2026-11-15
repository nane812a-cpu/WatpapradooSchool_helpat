# 📚 Memory Helper

**Memory Helper** is a modern, bilingual (Thai / English) student reminder and task-management web application.  
It runs entirely in the browser — no server, no build step, no npm install required.

---

## ✨ Features

| Feature | Details |
|---|---|
| Dashboard | Greeting, date, today's tasks, upcoming tasks, overdue tasks, upcoming exams, progress bar, quick stats |
| My Tasks | Full CRUD — create, read, update, delete, complete reminders; search, filter, sort |
| Calendar | Month-view calendar with colour-coded event dots; click any day to see & add reminders |
| Notifications | Overdue / Due Today / Due Soon / Upcoming / Completed buckets; mark read; browser push notifications |
| Contact Teacher | Teacher info, school info, local message form with sent-message history |
| Profile | Avatar initials, stats, edit name / username / email / school / grade, change password |
| Settings | Light / Dark mode toggle; Thai / English language toggle; export JSON backup; import JSON; clear data |
| Auth | Register, login (email or username), remember-me, show/hide password, demo account |
| Responsive | Full mobile support (hamburger sidebar, touch targets, stacked layouts, FAB button) |
| Accessibility | Semantic HTML, ARIA roles, keyboard navigation, focus-visible styles, live regions |
| Persistence | All data stored in `localStorage`; theme and language survive page refresh |

---

## 🚀 How to Run

### Option 1 — Open directly (simplest)

1. Navigate to the `memory-helper` folder.
2. Double-click **`index.html`** to open it in your browser.

> Some browsers restrict `localStorage` on `file://` URLs.  
> If data does not persist, use Option 2 below.

### Option 2 — Local web server (recommended)

**Using VS Code Live Server extension:**
1. Open the `memory-helper` folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.

**Using Python (no install needed on most systems):**
```bash
# Python 3
python -m http.server 8080 --directory memory-helper

# Then open http://localhost:8080 in your browser
```

**Using Node.js (npx):**
```bash
npx serve memory-helper
```

---

## 🔐 Demo Account

| Field    | Value                        |
|----------|------------------------------|
| Email    | `demo@memoryhelper.app`      |
| Password | `demo1234`                   |

The demo account is created automatically on first launch.  
It comes pre-loaded with 6 sample reminders (homework, exam, project, school activity).

---

## 📁 Project Structure

```
memory-helper/
│
├── index.html              ← Single HTML shell, all pages rendered by JS
│
├── css/
│   ├── style.css           ← Main design system (variables, components, animations)
│   └── responsive.css      ← Mobile / tablet / desktop breakpoints
│
├── js/
│   ├── translations.js     ← Centralised Thai/English strings + t() helper
│   ├── storage.js          ← localStorage abstraction (get/set/remove)
│   ├── auth.js             ← Register, login, logout, profile update
│   ├── reminders.js        ← CRUD, filter, search, sort, stats, demo seeder
│   ├── notifications.js    ← In-app notification builder + browser push poller
│   ├── calendar.js         ← Month-grid renderer + day-panel
│   └── app.js              ← Main controller: routing, all page renderers,
│                              modal, toast, confirm dialog, global events
│
└── assets/
    ├── icons/              ← (empty — icons are inline SVG / emoji)
    └── images/             ← (empty — no external image dependencies)
```

---

## 🗄️ Data Model

### Reminder
```json
{
  "id":          "abc123",
  "title":       "Mathematics Homework",
  "description": "Complete exercises on pages 45–50",
  "subject":     "Mathematics",
  "date":        "2026-08-10",
  "time":        "08:00",
  "priority":    "high",
  "category":    "homework",
  "completed":   false,
  "createdAt":   "2026-08-08T12:00:00.000Z",
  "userId":      "user123"
}
```

### Priority values
`low` · `medium` · `high`

### Category values
`homework` · `exam` · `project` · `schoolActivity` · `personal` · `other`

---

## 🌐 Bilingual System

All user-facing text lives in `js/translations.js` under a single `TRANSLATIONS` object:

```js
TRANSLATIONS.th.dashboard  // → "หน้าหลัก"
TRANSLATIONS.en.dashboard  // → "Dashboard"
```

Use `t('key')` anywhere in JS to get the current-language string.  
HTML elements with `data-i18n="key"` are updated automatically on language switch.

---

## 🔒 Security Notice

> ⚠️ This is a **frontend-only prototype**.  
> Passwords are obfuscated (not hashed with bcrypt/argon2) and stored in `localStorage`.  
> **Do not use this as-is for a production system.**

To upgrade to production:
1. Replace `auth.js` with API calls to a real backend (Node.js / Django / Laravel etc.).
2. Use `HTTPS`, `httpOnly` cookies, and a proper password-hashing library on the server.
3. Replace `localStorage` reminder storage with a real database.

---

## 🛠️ Customisation

| What | Where |
|---|---|
| Change accent colours | `--primary`, `--purple`, `--teal` in `css/style.css` `:root` |
| Add a new language | Add a new key block in `TRANSLATIONS` in `js/translations.js` |
| Add a new reminder category | Add to `CATEGORIES` array in `js/reminders.js` + translation key |
| Change demo teacher info | Edit `renderContactPage()` in `js/app.js` |
| Connect to a real backend | Replace storage/auth functions in `js/storage.js` and `js/auth.js` |

---

## 📋 Checklist

- [x] Navigation works (all 7 pages)
- [x] Add reminder works
- [x] Edit reminder works
- [x] Delete reminder works
- [x] Complete / uncomplete task works
- [x] Search works
- [x] Filters work (All / Today / Upcoming / Overdue / Completed / High Priority)
- [x] Sort works (Date / Priority / Title)
- [x] Calendar works (month navigation, day panel, add on date)
- [x] Login / Register works
- [x] Logout works
- [x] Dark mode works and persists
- [x] Thai / English switching works and persists
- [x] Data persists after refresh
- [x] Mobile responsive
- [x] Browser notification support (with permission prompt)
- [x] Export / Import JSON backup
- [x] Accessible (ARIA, keyboard, focus states)

---

## 🙏 Credits

Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.  
Fonts: [Inter](https://fonts.google.com/specimen/Inter) · [Sarabun](https://fonts.google.com/specimen/Sarabun) via Google Fonts.
