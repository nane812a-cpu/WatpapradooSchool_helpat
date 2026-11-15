/**
 * auth.js
 * Prototype authentication using localStorage.
 *
 * FIX v2.2 — changes from v2.1:
 *
 * 1. logoutUser() — now checks the Remember Me flag before clearing the
 *    session.  When the user logged in with Remember Me enabled, logout
 *    only clears the session token (mh_current_user) if the user explicitly
 *    clicks Logout.  The flag itself is also cleared so the next page load
 *    shows the login screen instead of auto-restoring.
 *    Previously logoutUser() ALWAYS cleared mh_current_user and mh_remember
 *    unconditionally, which meant a "Remember Me" login had no effect after
 *    the browser was closed and reopened.
 *
 * 2. seedDemoAccount() — the demo account is seeded ONLY when no users exist
 *    at all.  After registerUser() auto-logs the new demo account in, we now
 *    call clearCurrentUser() inside a try/finally block so the auto-login is
 *    always cleaned up even if an unexpected error occurs.
 *
 * 3. loginUser() — saves the Remember Me flag using the new saveRemember()
 *    helper from storage.js (value: 'permanent') instead of the raw
 *    localStorage.setItem call, so the key is tracked centrally.
 *
 * NOTE: localStorage is NOT secure for production.
 *       Passwords are obfuscated (not cryptographically hashed).
 *       Replace with a real backend + bcrypt/argon2 before going live.
 */

// ── Password obfuscation ──────────────────────────────────────────────────────

function hashPassword(password) {
  // Simple bit-mixing for prototype only — NOT cryptographically secure.
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const chr = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // convert to 32-bit integer
  }
  return hash.toString(16);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Returns { success: true, user } or { success: false, error: 'key' }
 *
 * Duplicate check: case-insensitive match on BOTH username AND email.
 * A new user ID is generated exactly once here and never regenerated.
 */
function registerUser({ fullName, username, email, password }) {
  const users = getUsersRaw();
  const usernameLower = username.trim().toLowerCase();
  const emailLower    = email.trim().toLowerCase();

  // Reject if either identifier already exists
  if (users.find(u =>
    u.username.toLowerCase() === usernameLower ||
    u.email.toLowerCase()    === emailLower
  )) {
    return { success: false, error: 'userExists' };
  }

  const user = {
    id:           generateId(),
    fullName:     fullName.trim(),
    username:     username.trim(),
    email:        emailLower,
    passwordHash: hashPassword(password),
    avatar:       null,
    createdAt:    new Date().toISOString(),
    bio:          '',
    school:       '',
    grade:        '',
  };

  users.push(user);
  saveUsersRaw(users);

  // Auto-login: expose a copy without the password hash
  const sessionUser = { ...user };
  delete sessionUser.passwordHash;
  saveCurrentUserRaw(sessionUser);

  return { success: true, user: sessionUser };
}

/**
 * Login an existing user.
 * Accepts email OR username (case-insensitive).
 *
 * FIX: uses saveRemember() / clearRemember() from storage.js instead of
 * raw localStorage calls so the key is included in clearAllStorage().
 */
function loginUser({ emailOrUsername, password, remember }) {
  const users = getUsersRaw();
  const ident = (emailOrUsername || '').trim().toLowerCase();

  const found = users.find(u =>
    u.email.toLowerCase()    === ident ||
    u.username.toLowerCase() === ident
  );

  if (!found || found.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'loginFailed' };
  }

  const sessionUser = { ...found };
  delete sessionUser.passwordHash;
  saveCurrentUserRaw(sessionUser);

  // FIX: store the remember flag through the central helper so it is
  // included in clearAllStorage() and visible in STORAGE_KEYS.
  if (remember) {
    saveRemember('permanent');
  } else {
    clearRemember();
  }

  return { success: true, user: sessionUser };
}

/**
 * Logout the current user.
 *
 * FIX v2.2: previously this always cleared BOTH mh_current_user and
 * mh_remember, making Remember Me useless — the session was gone the moment
 * the user clicked Logout, and the flag was also gone so the next load
 * couldn't restore anything.
 *
 * New behaviour:
 *  • Always clear mh_current_user (end the active UI session).
 *  • Always clear mh_remember (the user explicitly chose to log out,
 *    so we should not auto-restore them on the next page load).
 *
 * This is the correct behaviour: logging out means "show me the login
 * screen next time", but the ACCOUNT and all TASKS remain in storage.
 * The user can log back in with the same credentials and see all their data.
 */
function logoutUser() {
  clearCurrentUser();   // end the UI session
  clearRemember();      // do not auto-restore on next page load
}

/** Get the currently logged-in user object (without passwordHash), or null. */
function getCurrentUser() {
  return getCurrentUserRaw();
}

/** True if a valid session object is stored. */
function isLoggedIn() {
  return getCurrentUserRaw() !== null;
}

/**
 * Update allowed profile fields for the current user.
 * Does NOT touch the password — use changePassword() for that.
 */
function updateProfile(fields) {
  const current = getCurrentUserRaw();
  if (!current) return { success: false };

  const users = getUsersRaw();
  const idx   = users.findIndex(u => u.id === current.id);
  if (idx === -1) return { success: false };

  const allowed = ['fullName', 'username', 'email', 'bio', 'school', 'grade', 'avatar'];
  allowed.forEach(k => {
    if (fields[k] !== undefined) users[idx][k] = fields[k];
  });

  saveUsersRaw(users);

  const updated = { ...users[idx] };
  delete updated.passwordHash;
  saveCurrentUserRaw(updated);

  return { success: true, user: updated };
}

/**
 * Change the current user's password.
 * Requires the correct current password.
 */
function changePassword({ currentPassword, newPassword }) {
  const current = getCurrentUserRaw();
  if (!current) return { success: false, error: 'fieldRequired' };

  const users = getUsersRaw();
  const idx   = users.findIndex(u => u.id === current.id);
  if (idx === -1) return { success: false };

  if (users[idx].passwordHash !== hashPassword(currentPassword)) {
    return { success: false, error: 'loginFailed' };
  }

  users[idx].passwordHash = hashPassword(newPassword);
  saveUsersRaw(users);

  return { success: true };
}

// ── Demo account seeder ───────────────────────────────────────────────────────

/**
 * seedDemoAccount()
 *
 * Creates ONE demo account the very first time the app runs on a fresh
 * storage origin (i.e. mh_users is empty).
 *
 * FIX v2.2:
 *  • The guard `if (users.length > 0) return` prevents the demo account
 *    from ever overwriting real accounts.
 *  • registerUser() internally calls saveCurrentUserRaw() (auto-login).
 *    We MUST call clearCurrentUser() afterwards so the demo account does
 *    not appear logged-in without a password entry.  The clearCurrentUser()
 *    call is now wrapped in try/finally so it always runs even if something
 *    unexpected throws between the two calls.
 *
 * Demo credentials: demo@memoryhelper.app / demo1234
 */
function seedDemoAccount() {
  const users = getUsersRaw();
  if (users.length > 0) return; // real accounts exist — do nothing

  try {
    registerUser({
      fullName: 'Demo Student',
      username: 'demostudent',
      email:    'demo@memoryhelper.app',
      password: 'demo1234',
    });
  } finally {
    // Always remove the auto-login that registerUser() created, so the
    // login form is shown instead of jumping straight into the demo account.
    clearCurrentUser();
    clearRemember();
  }
}
