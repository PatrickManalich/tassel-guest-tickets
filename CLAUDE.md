# Guardrails

- Verify with the dev server and quick checks. Don't build verification scripts or take screenshots for cosmetic changes unless asked. If a check fails twice, stop and report it instead of continuing to investigate.
- No headless-browser screenshots for visual checks (spacing, line wraps, layout) unless explicitly asked, and even then keep it to one or two shots, not an iterative loop. Reason from the CSS instead, or just make the change and let the user look at it.
- Don't spawn subagents for verification or exploration.
- The user can see and click the running app themselves. Don't re-fetch pages or parse rendered HTML to confirm what they can eyeball in five seconds. Only chase things that could be silently wrong without a visible symptom: type errors, data wiring, state logic.
- Don't add dependencies, component libraries, or anything beyond what SPEC.md lists unless asked.
- Work in small, reviewable chunks. Stop and summarize what changed after each one rather than running long unattended.
- Commit only when the user says so.
- Once a dev server is started for the user to test against, leave it running in the background. Don't kill it after your own verification checks — the user tests in the same running instance rather than starting their own.

## Project reference

- `SPEC.md` is the authoritative build spec: the original take-home brief (quoted verbatim at the top — never edit that section, even when it uses wording the app has since diverged from) plus every decision layered on top since. Check it before making UI/behavior calls; several sections already document explicit, deliberate departures from the original brief's own wording.
- `mock-data.json` at the repo root is a verbatim, untouched reference copy of the seed data as originally provided. The app doesn't import it — `src/data/mock-data.ts` is the typed module actually consumed by the code, kept in sync by hand.

## Conventions established so far

- **"claimed" vs "assigned" split is intentional, not a bug.** The `Allotment.claimed` field (in `types/guest-tickets.ts`, `data/mock-data.ts`, the hook, and component props) matches `mock-data.json`'s actual key and should stay `claimed` — it's the data contract. Every rendered string, however, says "assigned" ("X of Y assigned", "All tickets assigned", the slot-group `aria-label`s, the disabled-button reason). Don't "fix" one to match the other; they're deliberately decoupled, and SPEC.md's Data model section explains why.
- **No trailing periods on short UI copy** — headlines, status lines, button-adjacent text (e.g. "All 5 tickets have been assigned", "Not armed"). Full sentences in dialog body copy and error messages keep periods (e.g. "We couldn't save your guest." / "Please try again.").
- **Dialog error/description copy is passed in as props, not hardcoded.** `GuestFormDialog` takes `title`, `description`, `errorTitle`, `errorDescription` from its caller rather than deriving them internally from a mode switch, so Reassign (and any admin-side reuse) can supply its own wording without editing the shared component.
- **Dialog footer button order:** the primary action (Save/Reassign/Remove) comes before Cancel in JSX/DOM order. That makes Tab land on it right after the last field when it's enabled, and fall through to Cancel via native disabled-button skipping when it's not. Tailwind `order-1`/`order-2` classes restore the usual visual layout (Cancel first/left, primary action last/right) without touching tab order — apply the same pattern when building the Remove confirmation's AlertDialog footer.
- **Dialogs are capped at `max-h-[85dvh] overflow-y-auto`** from the start, not retrofitted — avoids the on-screen-keyboard-covers-Save problem SPEC.md's Accessibility section calls out.
- **Email validation** is pragmatic (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), validates on blur/submit rather than every keystroke, and blank is always valid since email is optional.
- **The "Demo controls" panel lives outside the product component tree on purpose** (`src/components/demo/`, not `src/components/guest-tickets/`). It renders below the screen with a "Simulate a save error" button that arms the *next* add/reassign/remove attempt (via `useGuestTickets`'s `armNextFailure`) to fail once, then auto-disarms. There's no automatic or random failure — this panel is the only way to reach the save-error state.
