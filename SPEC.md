# Manage guest tickets — build spec

## Original task (verbatim)
The task: Design and build a mobile-first, accessible "Manage my guest
tickets" experience for a graduate.

At Tassel, every graduate gets a limited allotment of guest tickets for
their ceremony. Build the screen where a grad can:

- see their ceremony details and allotment (e.g. "2 of 5 claimed")
- add a guest to claim a ticket (name required, email optional)
- remove or reassign a guest
- handle the real states: loading, empty, allotment full, and a save error

Mock the data and fake any async - no real backend, auth, or payments
needed. Use React + TypeScript and whatever styling/component approach
you'd genuinely reach for. Please aim for WCAG 2.1 AA (keyboard, focus,
screen reader, contrast).

What to send back:

1. A runnable project (README with run steps, or a live link -
   StackBlitz/CodeSandbox/Vercel all fine).
2. A short write-up (~1 page): key decisions and trade-offs, how you
   approached accessibility, how you'd turn this into reusable
   components that could also serve our admin side, and what you'd do
   with another day.
3. A quick note on where you used AI tools and where you had to
   correct them, this role is partly about helping the team build
   polished UI with AI, so we're interested in your judgment there.

## Data model
```ts
interface Ceremony { school: string; name: string; date: string; venue: string }
interface Allotment { total: number; claimed: number }
interface Guest { id: string; name: string; email: string | null }
```
`claimed` matches the field name in the source `mock-data.json`, and the UI's display copy uses the same word (see Allotment display below) — no split between the data contract and front-end wording.

## Screen states
- Loading — initial fetch
- Empty — 0 claimed
- Populated — 1 to (total - 1) claimed
- Full — claimed === total

## Shared action flow (add, reassign, remove)
Trigger → dialog opens → confirm → success (screen updates, dialog closes) OR
fail (inline error stays inside the dialog, entered data kept, Save re-enabled for retry)

## Allotment display
- claimed/total shown as clickable slot circles
- filled slot = checkmark (not independently clickable)
- open slot = plus icon, clickable, opens Add dialog
- copy is "X of Y claimed", matching the brief's own phrasing — active/reflexive sense, the grad claims their own tickets. "Reassign" stays a separate word for a separate action and was never required to match the status terminology

## Layout
- White toolbar, page title "Manage guest tickets", no back button (screen is scoped as if embedded in a larger app — state this assumption in the write-up)
- Gray page background, white raised cards (ceremony, allotment, guest list) — base/raised surface pattern
- Ceremony card: school, ceremony name, calendar icon + date, pin icon + venue. No cap/building icons, no per-school logo (keeps the pattern generalizable across every school Tassel serves)
- Guest rows: name, email or "No email provided", two text-labeled actions — "Reassign" and "Remove" (icon-only for remove is fine, reassign needs the word since a pencil icon would contradict the label)
- Bottom sticky full-width "Add guest" button, the one unambiguous primary trigger. Disabled + a nearby reason when full, not just grayed out with no explanation
- No ghost "available" rows in the guest list
- No search bar — five guests is small enough to scan at a glance

## Dialogs
**Add guest** — centered Dialog (not a bottom sheet — trigger can originate from the bottom button or any open slot circle, a sheet reads disconnected from a mid-screen tap)
- Title "Add guest" · Name* required, blank · Email optional, blank
- Placeholders: "Enter first and last name" / "Enter email address"
- Save disabled until name is non-empty

**Reassign guest** — same Dialog shell as Add
- Title "Reassign guest" · read-only info block above the fields (current guest's name + email, plain text, no border, no label)
- Name/Email fields blank, not prefilled
- Button reads "Reassign", not "Save"

**Remove guest** — AlertDialog, not Dialog (forces an explicit choice, no accidental dismiss)
- Title "Remove guest?" · same read-only info block pattern
- Line: "This ticket will be able to be reassigned to another guest."
- Cancel (outline) / Remove (red fill — the one destructive action in the app, color + label together, never color alone)

## Inline error (one shared pattern, used by all three actions)
- Lives inside the dialog that triggered it, never a toast, never closes the dialog
- Positioned above Cancel/Save · `role="alert"` · focus moves to it on failure
- Copy: "We couldn't save your guest." / "Please try again."
- Save stays enabled for immediate retry when the underlying data is still valid

## Accessibility
- `aria-live="polite"` on the allotment count
- Every dialog: focus trap, focus returns to the trigger element on close, Escape closes
- Required field shown as "Name*" — pair with the real `required` attribute and an accessible required label, not the asterisk alone
- Slot row: group `aria-label` ("2 of 5 tickets claimed, 3 remaining"); each open slot individually labeled ("Add guest to open ticket")
- 44px minimum tap targets
- Test the Add/Reassign dialog with the on-screen keyboard open on an actual phone — centered dialogs can get pushed under the keyboard if not capped with `max-height` and internal scroll

## Explicit assumptions for the write-up
- No back button, no nav chrome, no profile/account surface — screen is scoped as embedded
- No per-school branding — keeps the component reusable across every school Tassel serves
- No uniqueness check on guest names — not specified in the brief
- "Reassign" replaces an existing guest with a new one; it does not double as an edit-in-place for fixing a typo on the current guest
