# PeopleOS HRIS

`prototype/peopleos_hris_pro.tsx` is the authoritative high-fidelity prototype for all page visuals, layout, interaction, and copy. Do not modify it. When making changes, preserve its behavior unless the user explicitly requests a deviation. The older `HRIS Web App 前端 Spec.md` is historical background; the prototype takes precedence.

Current backend scope is local-only authentication, permissions, employee records and private attachments in worker/. Other business modules remain mock; employee mutations initiated by those modules must save through the employee API. Never deploy, log in to Cloudflare, use remote bindings, or run remote resource commands without a new explicit user instruction. Keep local secrets, seed account emails, .dev.vars and D1/R2 data out of git.

Run `npm run build`, `npm test`, `npm run check:routes`, and `npm run check:browser` after changes affecting the foundation. The browser check starts an isolated local Wrangler/D1/R2 instance and authenticates real test accounts in a separate headless Chrome profile; no UI role-switch bypass. QA generates an ignored copy of the prototype; never edit the reference source to make a check pass.

The self-service request form is an explicit user-approved exception to the prototype: use `src/constants/selfService.ts` for the arbitrary-depth type tree and leaf-specific form fields. Other pages remain governed by the prototype. Keep the authoritative prototype file unchanged.
