CREATE TABLE audit_logs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 actor_id TEXT NOT NULL REFERENCES users(id),
 employee_id TEXT NOT NULL,
 action TEXT NOT NULL CHECK(action IN ('read','create','update','attachment_upload','attachment_download')),
 sensitive_fields TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX audit_employee ON audit_logs(employee_id,created_at);
CREATE INDEX audit_actor ON audit_logs(actor_id,created_at);
