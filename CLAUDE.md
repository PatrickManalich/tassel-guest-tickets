# Guardrails

- Verify with the dev server and quick checks. Don't build verification scripts or take screenshots for cosmetic changes unless asked. If a check fails twice, stop and report it instead of continuing to investigate.
- No headless-browser screenshots for visual checks (spacing, line wraps, layout) unless explicitly asked, and even then keep it to one or two shots, not an iterative loop. Reason from the CSS instead, or just make the change and let the user look at it.
- Don't spawn subagents for verification or exploration.
- The user can see and click the running app themselves. Don't re-fetch pages or parse rendered HTML to confirm what they can eyeball in five seconds. Only chase things that could be silently wrong without a visible symptom: type errors, data wiring, state logic.
- Don't add dependencies, component libraries, or anything beyond what SPEC.md lists unless asked.
- Work in small, reviewable chunks. Stop and summarize what changed after each one rather than running long unattended.
- Commit only when the user says so.
