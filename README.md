# Manage guest tickets

A mobile-first, accessible screen for a graduate to manage their
ceremony guest ticket allotment, built as a take-home exercise for
Tassel.

**Live:** https://tassel-guest-tickets.vercel.app/

## Run locally

```
npm install
npm run dev
```

## Stack

Vite + React + TypeScript, Tailwind, shadcn/ui (Dialog, AlertDialog,
Button, Input, Label, Select, Badge, Alert). No backend, all data is
mocked and async is simulated with fake latency.

## Seeing all the states

The app loads with 2 of 5 tickets claimed, matching the ceremony's
starter data. The other states are a couple of clicks away rather
than separate builds:

- **Empty** — remove both seeded guests
- **Full** — add three more guests
- **Save error** — click the small tool icon in the bottom-left
  corner (review tooling, not part of the product), arm "Simulate a
  save error," then attempt any add, reassign, or remove. The next
  attempt fails with an inline error and keeps whatever you typed;
  retrying succeeds.

## Write-up

Key decisions, accessibility approach, and AI usage notes are in
[WRITEUP.md](./WRITEUP.md).
