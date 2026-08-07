# Tech debt & consolidation audit

A read-through of the whole `src/` tree plus `package.json`, looking for dead code, duplication, fragile patterns, and gaps that are fine for a take-home but worth addressing with more time. Every item below was confirmed by reading the actual current code (and in two cases, measuring the rendered DOM) — nothing here is a guess.

Ordered roughly by effort-to-value. "Quick wins" are each under 15 minutes and carry no design risk. "Structural" items are bigger judgment calls worth discussing before touching.

## Quick wins

**Dead `screenState`/`ScreenState`.** [`use-guest-tickets.ts`](src/hooks/use-guest-tickets.ts) computes and returns a `"loading" | "empty" | "populated" | "full"` screen state, but grepping the whole codebase shows nothing ever reads it — every component derives its own view of loading/empty/full locally from `guests`/`allotment`. Delete the type and the computation, or wire it up as the actual source of truth if the duplication below is worth resolving that way instead.

**Unused `Badge` component.** [`badge.tsx`](src/components/ui/badge.tsx) was scaffolded as part of the initial shadcn install but is never imported anywhere in app code. Delete it (it's regenerable via the shadcn CLI if it's ever needed).

**`AlertDialogAction` / `AlertDialogCancel` don't forward `className` to `Button`.** In [`alert-dialog.tsx`](src/components/ui/alert-dialog.tsx), both are shaped like:
```tsx
<Button variant={variant} size={size} asChild>
  <AlertDialogPrimitive.Action className={cn(className)} {...props} />
</Button>
```
`className` reaches only the inner Radix primitive, never `Button`'s own `buttonVariants()` call. Radix's `Slot` then concatenates both elements' class strings onto the final DOM node without deduping, so any override has to out-specificity `Button`'s own classes purely by winning Tailwind's internal utility-generation order — which is not something calling code controls or should rely on.

This is the actual root cause of the `bg-destructive! text-white! hover:bg-destructive/90!` `!important` hack in [`remove-guest-dialog.tsx`](src/components/guest-tickets/remove-guest-dialog.tsx): the color override lost that ordering race and had to be forced. The `order-1 h-11` override on `AlertDialogCancel` in the same file happened to win the same race (verified: renders at 44px) — but that's luck, not a guarantee, and it's the kind of thing that could silently regress on an unrelated Tailwind or class-order change.

Fix at the source: pass `className` (and only `className`, undeduped) to `Button` itself instead of the inner primitive —
```tsx
<Button variant={variant} size={size} className={className} asChild>
  <AlertDialogPrimitive.Action {...props} />
</Button>
```
— which lets `buttonVariants()`'s internal `cn()`/twMerge do a real merge, and removes the need for `!important` at every call site.

**Ungated demo controls panel.** [`App.tsx`](src/App.tsx) renders `<DemoControlsPanel />` unconditionally — there's no `import.meta.env.DEV` (or similar) gate. It's visually distinct from the product UI, but it'd still ship in a production build as-is. Worth an explicit env check if this ever needs to leave prototype status.

## Duplication

**`GuestFormValues` vs. `GuestInput`.** [`guest-form-dialog.tsx`](src/components/guest-tickets/guest-form-dialog.tsx) declares `interface GuestFormValues { name: string; email: string }`, structurally identical to `GuestInput` already exported from [`use-guest-tickets.ts`](src/hooks/use-guest-tickets.ts). One should just alias or reuse the other.

**Dialog shell duplication between `GuestFormDialog` and `RemoveGuestDialog`.** Both hand-roll the same `max-h-[85dvh] overflow-y-auto sm:max-w-sm` content className and the same order-1/order-2 footer-button-ordering comment block. Not wrong, but it's copy-pasted rather than shared — a small wrapper or shared className constant would keep the two dialogs from drifting apart if one gets tweaked and the other doesn't (as nearly happened with the close-button/title overlap fix, which only touched the plain `Dialog`, not `AlertDialog` — worth double-checking `AlertDialogContent` doesn't have the same latent title-overlap risk if it ever grows a close button).

**Hand-rolled focus-management logic in the screen component.** [`manage-guest-tickets-screen.tsx`](src/components/guest-tickets/manage-guest-tickets-screen.tsx) has ~30 lines of trigger-capture / restore-on-close / fallback-to-heading logic (`lastTriggerRef`, `headingRef`, `forceFallbackFocusRef`, `captureTrigger`, `restoreFocusToTrigger`) that exists because the dialogs are fully controlled with no `<DialogTrigger>`. This is exactly the shape of thing that wants to be a `useDialogFocusReturn()` hook — it's generic (doesn't reference guest data at all) and would be directly reusable if this screen's dialog pattern gets copied elsewhere on the admin side.

## Scattered magic numbers

Timing constants are declared locally in whichever file needs them, with no shared source:
- `use-guest-tickets.ts`: `INITIAL_LOAD_DELAY_MS = 700`, `ACTION_DELAY_MS = 600`
- `ticket-slot.tsx`: `REVEAL_DELAY_MS = 400`, `FILL_ANIMATION_MS = 300`
- `guest-list-card.tsx`: `ROW_MOTION_MS = 200`

Each is well-commented at its use site and none are wrong, but there's no single place that says "this app's motion timing is X" — a `motion.ts` (or similar) constants module would make it possible to retune pacing globally instead of hunting three files. Low urgency; only worth it if the animation timing is likely to change as a set.

## Bigger picture

**Zero automated test coverage.** `package.json` has no test script and no testing dependencies (no Vitest, no Testing Library, nothing). Everything so far has been verified by hand in the browser and with targeted one-off Puppeteer/axe-core scripts run from outside the repo. That's been proportionate for a scoped take-home, but the state machine in `use-guest-tickets.ts` (loading → derived screen state, the arm-next-failure-once semantics, add/reassign/remove against `allotment.claimed` derived from `guests.length`) is exactly the kind of logic that's cheap to unit test and expensive to keep manually re-verifying by hand as it grows. If this becomes a real, evolving surface rather than a one-time deliverable, that's the first infrastructure gap to close — starting with the hook in isolation, then a couple of accessibility regression checks (focus return, touch target sizes) codified as an automated axe-core pass instead of ad hoc scripts re-run by hand each time.

## Not flagged (considered and ruled out)

A few things looked debt-shaped on first pass but held up under closer reading, noted here so they aren't re-litigated later:
- `currentGuest?` optional-prop pattern on `GuestFormDialog` (presence = reassign, absence = add) instead of an explicit `mode` string — intentional, documented in `CLAUDE.md`.
- `allotment.claimed` derived from `guests.length` rather than stored — deliberate, avoids state drift, documented.
- `guest-tickets-skeleton.tsx` duplicating the real cards' shapes by hand — normal for skeleton loaders, not worth abstracting against a single set of cards.
