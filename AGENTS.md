# PeopleOS HRIS

`prototype/peopleos_hris_pro.tsx` is the authoritative high-fidelity prototype for all page visuals, layout, interaction, and copy. Do not modify it. When making changes, preserve its behavior unless the user explicitly requests a deviation. The older `HRIS Web App 前端 Spec.md` is historical background; the prototype takes precedence.

This stage implements the foundation only: Tailwind v4, typed component/module extraction, React Router, three prototype roles, and Zustand state. Do not add business-module features beyond the prototype.

Run `npm run build`, `npm test`, `npm run check:routes`, and `npm run check:browser` after changes affecting the foundation. The browser check uses a local Vite dev server on port 5173 and an isolated headless Chrome profile. QA generates an ignored copy of the prototype; never edit the reference source to make a check pass.
