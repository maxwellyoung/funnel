# Funnel Case Study

## Problem

People collect more learning material than they can meaningfully process. Bookmarks, PDFs, notes, and links become a backlog instead of a system. Funnel explores a product workflow for turning saved material into a manageable review surface.

## Approach

The app treats learning resources as active objects with state: saved, reviewed, categorized, and returned to when useful. The interface is intentionally more operational than editorial, because the core job is repeated triage.

## Engineering decisions

- Use Next.js and TypeScript for a conventional, deployable web app foundation.
- Use Supabase for authentication and persistence primitives.
- Include PDF handling because real learning workflows often involve documents, not just URLs.
- Use Radix primitives to keep interaction states accessible and predictable.

## Tradeoffs

- A general resource manager risks becoming another dumping ground, so the product needs strong review and pruning mechanics.
- PDF support adds complexity, but it makes the product more honest about real-world learning material.
- Supabase accelerates the app foundation, but local-first capture would be worth exploring for offline use.

## Next steps

- Add review cadence and resurfacing rules.
- Add import flows for browser bookmarks and reading apps.
- Add summaries that cite the original material instead of replacing it.
- Add export paths so user data is not trapped.
