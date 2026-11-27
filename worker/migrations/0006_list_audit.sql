CREATE TABLE audit_logs_new (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 actor_id TEXT NOT NULL REFERENCES users(id),
 employee_id TEXT,
 action TEXT NOT NULL CHECK(action IN ('list','read','create','update','attachment_upload','attachment_download')),
 sensitive_fields TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 filters_json TEXT,
 CHECK((action='list' AND employee_id IS NULL AND filters_json IS NOT NULL) OR (action!='list' AND employee_id IS NOT NULL AND filters_json IS NULL))
);
INSERT INTO audit_logs_new(id,actor_id,employee_id,action,sensitive_fields,created_at)
 SELECT id,actor_id,employee_id,action,sensitive_fields,created_at FROM audit_logs;
DROP TABLE audit_logs;
ALTER TABLE audit_logs_new RENAME TO audit_logs;
CREATE INDEX audit_employee ON audit_logs(employee_id,created_at);
CREATE INDEX audit_actor ON audit_logs(actor_id,created_at);
