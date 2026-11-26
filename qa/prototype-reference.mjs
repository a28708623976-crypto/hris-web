import { existsSync, readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

// A generated QA-only copy lets us select the original prototype's initial view.
// The authoritative prototype is only read, never rewritten.
export function prepareReference() {
  const source = readFileSync("prototype/peopleos_hris_pro.tsx", "utf8");
  const ast = ts.createSourceFile(
    "reference.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const app = ast.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name.text === "App",
  );
  const fields = [
    "role",
    "activeApp",
    "activeNav",
    "atsActiveNav",
    "atsViewMode",
  ];
  const edits = app.body.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => {
      const declaration = statement.declarationList.declarations[0];
      if (!ts.isArrayBindingPattern(declaration.name)) return [];
      const name = declaration.name.elements[0].name.text;
      if (!fields.includes(name)) return [];
      const arg = declaration.initializer.arguments[0];
      return [
        [
          arg.getStart(ast),
          arg.end,
          `(globalThis.__PEOPLEOS_REFERENCE__?.${name} ?? ${arg.getText(ast)})`,
        ],
      ];
    });
  let fixture = source;
  for (const [start, end, replacement] of edits.sort((a, b) => b[0] - a[0]))
    fixture = fixture.slice(0, start) + replacement + fixture.slice(end);
  fixture +=
    "\nexport { calcAge, calcTenure, calcProbationEndDate, calcContractEndDate, addDaysToDate, createEmptyEmployeeForm, INITIAL_EMPLOYEES, INITIAL_ONBOARDING_TASKS, INITIAL_LIFECYCLE_TASKS, INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_PERF_RECORDS };\n";
  const validation = app.body.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find(
      (declaration) => declaration.name.getText(ast) === "validateEmployeeForm",
    );
  fixture +=
    "\nexport const referenceValidateEmployeeForm = " +
    validation.initializer.getText(ast) +
    ";\n";
  const output = "qa/.prototype-reference.tsx";
  if (!existsSync(output) || readFileSync(output, "utf8") !== fixture) {
    writeFileSync(output, fixture);
  }
}
