CREATE TABLE employee_sequence (id INTEGER PRIMARY KEY CHECK(id=1),next_number INTEGER NOT NULL);
INSERT INTO employee_sequence VALUES(1,1);
CREATE TABLE employees (
 id TEXT PRIMARY KEY,
 department TEXT NOT NULL,
 status TEXT NOT NULL,
 hire_date TEXT NOT NULL,
 name TEXT NOT NULL,
 role TEXT NOT NULL,
 phone TEXT NOT NULL,
 public_json TEXT NOT NULL,
 bank_cards_cipher TEXT NOT NULL,
 id_docs_cipher TEXT NOT NULL,
 salary_cipher TEXT NOT NULL,
 source_key TEXT UNIQUE,
 source_hash TEXT,
 version INTEGER NOT NULL DEFAULT 1,
 updated_at INTEGER NOT NULL
);
CREATE INDEX employees_department ON employees(department);
CREATE INDEX employees_status ON employees(status);
CREATE INDEX employees_hire_date ON employees(hire_date);
