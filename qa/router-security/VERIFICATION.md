# Router security upgrade — 2026-11-27

- Installed `react-router-dom` and `react-router`: 6.30.6 → 7.18.7 (exact versions).
- Manually installed the requested stable release; no `npm audit fix --force`.
- Followed the [official v6 → v7 guide](https://github.com/remix-run/react-router/blob/react-router%407.18.7/docs/upgrading/v6.md): moved application and QA imports to `react-router`. Retained the upgraded `react-router-dom` compatibility package as requested. Node 24 and React/ReactDOM 18 meet the v7 requirements. This declarative router has no multi-segment splats, relative links, component-local lazy definitions, data-router fetchers, actions or hydration configuration requiring additional migration.

## Navigation audit

- No application `<Link>` elements.
- `LoginPage`: validates untrusted `location.state.next` with `isInternalPath`; invalid targets and `/login` fall back to `/dashboard`.
- `useWorkspaceNavigation`: validates every dynamically constructed destination before passing it to the router, including values derived from the current URL or store.
- `App` and `AuthBoundary`: all `<Navigate>` destinations are fixed internal paths. The URL pathname stored as login return state is validated at consumption.
- `Layout`: its dynamic destination is gated by membership in the fixed navigation menu; otherwise it uses `/dashboard`.
- No URL query parameter or API response is otherwise used directly as a router destination.
- The shared validator requires one leading slash, rejects backslashes, control characters, protocols and network-path references, and checks decoded and URL-normalized paths. Navigation tests cover the requested attacks, encoded variants, malformed values and valid internal paths with query/hash.

## Verification

- `npm run build`: passed (existing dependency annotation and bundle-size warnings).
- `npm test`: passed all frontend state checks, navigation checks and 6 API/store transaction tests.
- `npm run test:worker`: 37/37 passed.
- `npm run check:routes`: 29 route/role combinations passed, preserving prototype markup within existing approved exceptions.
- `npm run check:browser`: 71 checks passed, 0 runtime errors, real local Worker/D1/R2 and OTP authentication. Includes unsafe login return-state fallback and valid return paths. Reran outside sandbox after local socket permission denial.
- `npm audit --json`: empty vulnerabilities; info/low/moderate/high/critical/total all 0. No React Router alerts.
- `npm run check:private` and `git diff --check`: passed.

The authoritative prototype was not edited. No Cloudflare login, deployment or remote resource operation was performed. Pre-existing edits to `worker/wrangler.production.jsonc` are excluded from this change.
