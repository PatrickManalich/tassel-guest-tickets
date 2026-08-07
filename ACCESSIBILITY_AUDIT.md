# Accessibility audit — step 7

Dedicated accessibility pass against SPEC.md's WCAG 2.1 AA requirement (keyboard,
focus, screen reader, contrast). Every item below was actually verified — either
against a running instance of the app via scripted browser checks, or by reading
the exact rendered DOM/source — not assumed from how the code looks. Where a
script produced a surprising result, I re-verified with a second, more careful
check before treating it as real (noted inline where that happened).

**Method note:** headless-browser automation is normally out of scope per
CLAUDE.md's guardrails, but this pass is exactly the case those guardrails
carve out — real accessibility verification, explicitly requested, not a
cosmetic/visual check. Puppeteer + axe-core were used as one-off audit tooling
for this pass only, not added as project dependencies or ongoing test
infrastructure.

## Automated pass

Ran [`axe-core`](https://github.com/dequelabs/axe-core) (via `@axe-core/cli` and
a scripted Puppeteer + axe-core run for dialog-open states, which the CLI can't
reach on its own) against the running dev server:

- Base screen (populated, 2/5 claimed): **0 violations**
- Add guest dialog open: **0 violations**
- Reassign guest dialog open: **0 violations**
- Remove guest AlertDialog open: **0 violations**
- Re-ran after all fixes below: still **0 violations** across all four states —
  no regressions introduced.

**WAVE** was not run — it's a browser-extension/hosted tool with no CLI or
localhost-friendly automation path, and this app isn't deployed anywhere
public. axe-core covers the same class of automated checks (missing labels,
contrast, ARIA misuse), so this isn't a coverage gap, just a tooling
substitution.

Per axe-core's own disclosure (echoed in its CLI output): "only 20% to 50% of
all accessibility issues can automatically be detected." Treating this as a
starting point, not the finish line — everything below is the manual
verification that matters more.

---

## Keyboard

**Tab reaches every interactive element, full page.** Verified the actual tab
sequence (not assumed): 3 open ticket slots → Reassign/Remove per guest row →
Add guest (footer) → devtools icon. This matches visual reading order
top-to-bottom. Ceremony card has no interactive elements (correct — it's
read-only content). Filled ticket slots are correctly *not* in the tab
sequence (they're plain `<div>`s, not buttons — see Slot indicators below).

**Verdict: pass.**

---

## Focus — all three dialogs

**Focus moves into the dialog on open, to the first field / a sensible
default.** Verified via `document.activeElement` immediately after open:
- Add dialog → Name input
- Reassign dialog → Name input
- Remove AlertDialog → Cancel button (Radix's default — focusing the safe
  action first on a destructive-confirmation dialog is correct, not a bug)

**Verdict: pass.**

**Focus trap holds — Tab from the last element cycles back to the first,
never escapes to the page.** Verified by pressing Tab 8 times inside the Add
dialog and logging the sequence: `Name → Email → Save(skipped, disabled) →
Cancel → Close(X) → Name → ...` — a clean 4-element cycle. Confirmed this is
genuinely Radix's focus trap holding, not an assumption.

**Verdict: pass.**

**Escape closes each dialog.** Verified on all three.

**Verdict: pass.**

### 🔧 Found and fixed: focus did not return to the trigger

This is the one real, structural finding in this pass. Verified — not
assumed — across three separate realistic interaction paths (real mouse
click, real keyboard Tab+Enter, and a pre-focused ticket slot + Enter): in
every case, pressing Escape (or Cancel, or a successful save) left focus on
`<body>`, not back on whatever opened the dialog.

**Root cause:** these dialogs are fully controlled (`open`/`onOpenChange`
props) with no `<DialogTrigger>`/`<AlertDialogTrigger>` — each has more than
one possible trigger element (the Add dialog opens from the footer button
*or* any open ticket slot). Radix's automatic "return focus to trigger"
behavior only works through an actual Trigger component; I had assumed
(incorrectly — this is exactly the kind of thing worth checking rather than
trusting) that it would fall back to "whatever was last focused" regardless.
It doesn't — it falls back to nothing.

**Fix:** manual focus capture/restore in `manage-guest-tickets-screen.tsx`.
Each trigger's `onClick` now captures `document.activeElement` into a ref
before opening its dialog; each dialog's `onCloseAutoFocus` (a Radix hook
built for exactly this override case) restores it.

**Second-order bug found while fixing the first:** a *successful* Remove
still failed to restore focus, even with the fix in place — because a
successful Remove deletes its own trigger (the guest row's own Remove
button) as a side effect. The row is kept mounted for its ~200ms exit
animation, so the trigger is still technically `isConnected` at the instant
`onCloseAutoFocus` fires — but it's removed from the DOM moments later,
taking focus with it back to `<body>`. Fixed by having the Remove success
path set a flag that skips the stale trigger and goes straight to a stable
fallback (the page's own `<h1>`, made programmatically focusable via
`tabIndex={-1}`).

Re-verified after both fixes, across: Add (mouse-open+Escape,
keyboard-open+Escape, slot-open+Escape, Cancel-close, successful-save-close)
and Remove (Cancel-close, successful-confirm-close) and Reassign
(Escape-close, confirmed it returns to the *specific* row's button, not just
some Reassign button). All now correctly return focus. Also confirmed the
Add-via-slot-trigger success case (where the trigger *also* gets replaced by
a filled slot) was already correctly handled by the plain `isConnected`
check alone — that swap happens before the dialog even starts closing, unlike
Remove's after-the-fact removal.

---

## Required field and validation

**Name field:** verified via live DOM inspection (not just source reading) —
`required: true` (real HTML attribute), `aria-required="true"`, and the
associated `<label for="...">` resolves to text `"Name*"`. Not asterisk-alone.

**Email format errors tied via `aria-describedby`:** verified live — typing
an invalid email and blurring sets `aria-invalid="true"` and
`aria-describedby` pointing at an element whose text is "Enter a valid email
address." Confirmed the ID reference actually resolves to that element, not
just present in isolation.

**Verdict: pass.**

---

## Slot indicators

Verified live via the rendered DOM, not just the source:

- Group `aria-label`: **"2 of 5 tickets claimed, 3 remaining"** — matches
  SPEC's example format exactly.
- Each open slot: its own `aria-label="Add guest to open ticket"`, distinct
  from the group label, and is a real `<button>`.
- Each filled slot: a plain `<div aria-hidden="true">`, not a button, not
  focusable, not in the tab sequence — confirmed filled slots cannot be
  announced or activated as controls.

**Verdict: pass.**

---

## Save-error banner

Checked all three actions independently (not just the one it was built
for), by arming the demo failure trigger and forcing each action to fail:

| Action | `role="alert"` present | Focus moves to it | Copy |
|---|---|---|---|
| Add | ✅ | ✅ | "We couldn't save your guest." |
| Reassign | ✅ | ✅ | "We couldn't reassign your guest." |
| Remove | ✅ | ✅ | "We couldn't remove this guest." |

(One of these needed a re-test — my first pass at scripting the Reassign
check used an ambiguous button-text selector that matched the row's
trigger button instead of the dialog's submit button, reporting a false
"not found." Re-tested with an unambiguous `button[type=submit]` selector
inside the open dialog and it passed cleanly — noting this so the false
negative doesn't get mistaken for a real one if this audit is revisited.)

**Verdict: pass, all three.**

---

## Live region

Verified live: the allotment count paragraph has `aria-live="polite"` and
its current text reads "2 of 5 claimed" — a complete, announceable phrase on
its own.

**Verdict: pass.**

---

## Touch targets

Measured actual rendered `getBoundingClientRect()` dimensions, not assumed
from className:

| Element | Size |
|---|---|
| Ticket slot circles (open) | 44×44 |
| Row "Reassign" button | 82×44 |
| Row "Remove" icon button | 44×44 |
| "Add guest" footer button | 358×44 (full width) |
| Devtools icon | 44×44 |

### 🔧 Found and fixed: two elements were under 44px

- **Name/Email `Input` fields were 32px tall** (`h-8`, the shared `Input`
  component's default, never overridden in the dialog). Fixed by adding
  `className="h-11"` to both.
- **Dialog's built-in close (X) button was 28×28px** (`size="icon-sm"`, no
  override). Fixed by adding `size-11` to its className.

Both re-measured after the fix: **44×44 confirmed.**

---

## Keyboard-open case

Capped the Add/Reassign dialog at `max-h-[85dvh] overflow-y-auto` (done
during the build, not retrofitted here), and added
`interactive-widget=resizes-content` to the viewport meta tag in an earlier
pass specifically for this. I flagged then, and I'm flagging again now,
because it's still true: **this cannot be verified from this environment.**
No real device, and a desktop-browser resize does not reproduce actual
on-screen-keyboard behavior (iOS Safari in particular has a history of
resolving `position: fixed` percentage offsets against the pre-keyboard
layout viewport even when `dvh` sizing is respected, which the meta tag
addresses but doesn't guarantee across every iOS/Android version).

**Verdict: needs an actual phone.** Open the Add dialog, focus the Email
field, and confirm Save stays reachable via scroll-within-the-dialog rather
than getting stranded above/behind the keyboard.

---

## Manual, DOM-as-screen-reader-proxy check

Read through the actual rendered accessibility-relevant DOM (not just
source) for completeness, sentence-level sanity:

- Dialog `role="dialog"`, `aria-labelledby` resolves to the visible title
  ("Add guest"), `aria-describedby` resolves to the sr-only description
  ("Enter the guest's name and optional email address to claim a ticket.")
  — both are complete sentences a screen reader would announce coherently on
  open, not fragments.
- Slot group and error-banner text (above) both read as complete, sensible
  phrases in isolation, not just present in markup.

**Verdict: pass**, with the standing caveat that this is a proxy, not an
actual screen reader run.

---

## Contrast

Pulled *actual rendered* colors via a canvas-based resolver (this Chrome
version reports `getComputedStyle().color` as `oklch(...)` rather than
`rgb()`, so string-parsing alone would have silently failed — colors were
resolved by letting the browser itself composite them, not hand-converted).

| Pairing | Ratio | Threshold | Result |
|---|---|---|---|
| Foreground text on card/white (headings, guest names) | 19.8:1 | 4.5:1 | ✅ |
| Muted-foreground text on white (school, allotment status, email) | 4.74:1 | 4.5:1 | ✅ (thin-ish margin, still a real pass) |
| Add guest / Save button text on dark fill | 17.18:1 | 4.5:1 | ✅ |
| Reassign/Cancel (outline) button text | 19.8:1 | 4.5:1 | ✅ |
| Required asterisk (destructive) on white | 4.77:1 | 4.5:1 | ✅ |
| Error banner title on card | 4.77:1 | 4.5:1 | ✅ |
| Remove button (solid destructive red) white text | 4.77:1 | 4.5:1 | ✅ |
| Filled slot checkmark (white icon) on brand orange | 3.34:1 | 3:1 (non-text) | ✅ |

### 🔧 Found and fixed: two contrast failures

- **Error banner description text was 4.54:1** — passing, but by a margin
  (0.04) thin enough that it could plausibly tip under with rendering
  variance across browsers/displays. Root cause: shadcn's `Alert` component
  applies `text-destructive/90` (90% opacity) to the description slot in
  its destructive variant. Removed the opacity override; re-verified at
  **4.77:1**, matching the title's safer margin.
- **Open ticket-slot border was 2.23:1 against its white card** — a real
  failure of the 3:1 non-text/UI-component threshold, and unlike the
  decorative card hairline (below), this one matters: it's an interactive
  control people need to visually register as tappable. The color
  (`--hairline-interactive`) had been chosen for "a bit darker than the
  decorative hairline, not too heavy" during the visual polish pass without
  a fresh contrast check at the final value. Iterated candidate hex values
  against the actual rendered background rather than hand-computing OKLCH
  again (a previous manual OKLCH conversion earlier in this project had
  already once produced an estimate that didn't match reality when
  measured — not repeating that mistake). Landed on a shade measuring
  **3.48:1**, comfortable margin above 3:1.

### Noted, not changed: decorative hairline stays under 3:1 on purpose

- Card border vs. white card fill: **1.45:1**
- Card border vs. page cream background: **1.3:1**

Both fail the 3:1 non-text-UI threshold. This is the same `--hairline` token
already documented in `CLAUDE.md` as a **deliberate** choice made during the
visual polish pass, after your own explicit feedback that the original,
properly-3:1-compliant version "looked ugly." WCAG's non-text contrast
requirement (1.4.11) applies to UI *components* — a purely decorative card
edge with no interactive or state-conveying function is a defensible
exemption, and the alternative (true zero-stroke) measures far worse at
~1.1:1. Flagging the exact number here rather than silently letting it pass
unmentioned, since "don't assume, verify" cuts both ways — this is a
knowing tradeoff, not an oversight, but it's still a number worth having on
record.

**Verdict:** two real failures found and fixed (both now comfortably
passing); one pre-existing, previously-discussed tradeoff re-confirmed and
left as-is.

---

## Devtools icon and popover

Verified live, keyboard-only: reachable by Tab (confirmed its position in
the full-page tab sequence, last stop before wrapping), opens on Enter
(confirmed `[data-slot="popover-content"]` appears in the DOM), closes on
Escape (confirmed it's removed). No focus-trap applied, per its
explicitly-out-of-scope status — this was a deliberate design choice from
the pass that built it, not something this pass needed to add.

**Verdict: pass.**

---

## Summary of code changes made in this pass

1. **Focus-return fix** — `manage-guest-tickets-screen.tsx`: trigger
   capture/restore via `onCloseAutoFocus`, plus a stable `<h1>` fallback for
   the case where a successful action deletes its own trigger.
   `guest-form-dialog.tsx` and `remove-guest-dialog.tsx`: new
   `onCloseAutoFocus` passthrough prop.
2. **Touch targets** — `guest-form-dialog.tsx`: `h-11` on both Input fields.
   `dialog.tsx`: `size-11` on the built-in close button.
3. **Contrast** — `alert.tsx`: dropped the `/90` opacity on destructive
   `AlertDescription` text. `index.css`: darkened `--hairline-interactive`
   from `#b5ad9e` to `#948873`.

All verified via `tsc`, `eslint`, and a final axe-core re-run (0 violations,
no regressions) after every change.

## What's still outstanding

- **Keyboard-open dialog behavior on an actual phone** — cannot be verified
  from this environment, needs real-device testing as noted above.
- **A genuine screen-reader run** (VoiceOver/NVDA/JAWS) — the DOM-as-proxy
  read-through is a reasonable stand-in given the constraints, but it isn't
  the real thing. Worth doing if a device/AT combination becomes available
  before this ships.
