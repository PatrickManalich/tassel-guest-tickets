# Writeup

- The live demo is at https://tassel-guest-tickets.vercel.app/
- The repo, which includes a README covering how to run it, is at https://github.com/PatrickManalich/tassel-guest-tickets
- The Figma workspace with the project plan, state diagrams, and both rounds of wireframes is at https://www.figma.com/design/6ZTwcFrUNIYtuQfgKBCLBn/Tassel-Wireframes?node-id=433-3552

## Key decisions and tradeoffs

I started by outlining a project plan with Claude to work inside the short timeframe. I documented that plan in Figma, mapped out the data model and state behavior as diagrams, and looked at a handful of existing references before touching any code.

From there I sketched two initial layouts. The first big design decision was whether the ticket allotment should read as a progress bar or as five individual slots. I went with five slots. For a small number of tickets, a bar hides the actual count behind a percentage, and five discrete circles let someone see exactly which tickets are open without doing any math. The slots also gave me a spot to put an add guest trigger right on that card, so a grad's eyes never have to leave that section to figure out how to add someone.

That approach does not scale though. Five slots works because five is a number you can take in at a glance. Fifteen would not read the same way. Given another day I would build the allotment display to switch to a progress bar past some guest count, so the pattern still holds for a school with a larger allotment.

A couple of smaller decisions worth naming. The add guest button sits in a sticky footer at the bottom of the screen, since that is the easiest reach point on a phone. Adding and reassigning guests both happen through a dialog rather than a separate page, mainly for accessibility. A dialog gives me one clean focus trap to get right instead of managing focus across a full page transition.

Once I had wireframes I liked, I used Claude and ChatGPT to generate a few higher fidelity mockups off them, mostly to sanity check spacing and see if any small tweaks jumped out. That gave me my final wireframes, which is what I handed to Claude Code to build from.

## Accessibility approach

I had Claude Code run an automated pass first, axe-core against every screen state and all three open dialogs, and it came back clean, zero violations. Axe is upfront that automated tools only catch something like 20 to 50 percent of real issues, so I treated that as a starting point and not a finish line.

The manual pass is where the real problems turned up. I read through the actual rendered DOM as a stand in for a screen reader, since I did not have one set up during this window, and did a pass on my own phone as a second check. That is where I found the dialog was not accounting for the on screen keyboard covering part of the screen. Claude Code could not have caught that on its own. It does not have a phone to test against, and a resized desktop browser does not reproduce real keyboard behavior.

A few other things came out of that pass, focus not returning to dialog triggers, two touch targets under 44 pixels, and two failing contrast pairs. All fixed and reverified. One thing I left alone on purpose, a decorative card border that reads under threshold but is not interactive, and I wrote down the actual number rather than treating it as an oversight.

Full detail on all of this, including the exact ratios, is in the accessibility audit file in the repo.

## Reusable components for the admin side

I built this on shadcn specifically so the components live in the repo and can be customized, not pulled in as a black box. Add and reassign already share one dialog component with two modes, so extending that to an admin view managing guests across many grads would mean reusing the same dialog and row components with different data and permissions behind them, not rebuilding the UI. The card, button, and form primitives underneath were never tied to this one screen to begin with.

## What I would do with another day

Reassigning covers editing right now, since fixing a typo just means reassigning the ticket with corrected info. That works, but I am not confident it is intuitive on first use, and it is the kind of thing that actually needs a real user testing session rather than another guess from me.

I made an assumption that guests get an email when they are added to a ceremony, and I would want to confirm that with the team. If that is true, it is a little odd that email is optional on this screen, and it raises a real question about whether two guests should be allowed to share the same email.

I would also spend more time on the visual design system itself, getting the components closer to Tassel's actual brand rather than the lighter pass I had time for here.

Claude Code generated a TECH_DEBT.md file during the build. I would start working through that list next.

## Where I used AI and where I had to correct it

I used Claude for planning and Claude Code for implementation, with Claude holding context across the whole build and Claude Code doing the actual coding. That split mostly worked, but there were real gaps. Claude would sometimes overexplain instructions with more codebase context baked in than Claude Code actually needed, and the two would drift apart. I ended up being the actual bridge between them more than I expected, and kept SPEC.md and CLAUDE.md files updated in the repo so decisions did not get lost between sessions.

Claude Code misread my instructions more than a few times. It missed labels, used the wrong component variant, and had real trouble understanding a custom dev tool I asked it to build for testing the save error state. I reviewed every change visually against the wireframes rather than trusting a diff summary, and had it commit after each step so I could roll back anything that went sideways.
