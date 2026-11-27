CREATE TABLE users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL COLLATE NOCASE UNIQUE,
 role TEXT NOT NULL CHECK(role IN ('hr_lead','dept_head','employee')),
 employee_id TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);
CREATE TABLE auth_codes (
 email_hash TEXT PRIMARY KEY,
 code_hash TEXT NOT NULL,
 nonce TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0,
 used_at INTEGER
);
CREATE TABLE sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE auth_rate_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email_hash TEXT NOT NULL,
 ip_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX auth_rate_email ON auth_rate_events(email_hash,created_at);
CREATE INDEX auth_rate_ip ON auth_rate_events(ip_hash,created_at);
