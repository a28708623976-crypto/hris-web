// Authenticated local Worker regression; no prototype role-switch bypass.
import { runBrowser } from "./backend/browser.mjs";
await runBrowser("workflows");
