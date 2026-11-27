CREATE TABLE attachments (
 employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
 slot TEXT NOT NULL,
 object_key TEXT NOT NULL UNIQUE,
 filename TEXT NOT NULL,
 mime_type TEXT NOT NULL,
 size INTEGER NOT NULL CHECK(size>0 AND size<=52428800),
 uploaded_at INTEGER NOT NULL,
 PRIMARY KEY(employee_id,slot)
);
