# PUFFF Station Vendors SA — Product Spec (Single Source of Truth)

## Project Overview
PUFFF Station Vendors SA is a Next.js 16 (App Router) e-commerce website for disposable vapes. The site is functional but requires polishing, optimization, and several key fixes.

## Tech Stack
- Next.js 16 (App Router, webpack)
- Supabase (database + auth + storage bucket)
- TailwindCSS
- Framer Motion
- Sharp (server-side image optimization in API route)
- Hosted on Vercel

## Visual / Brand Goals
- Luxury black theme
- Centered vape product image
- Neon / vibrant smoke video behind the product
- Smoke color MUST match the chosen hex color from admin panel
- Smooth, professional animations
- No flicker, no lag, must work on mobile (Android/iPhone)

## Must-Haves (Functional)
### Shop
- Shop page lists products from Supabase
- Product cards show:
  - product image
  - name
  - price
  - stock / status badge
  - optional bulk pricing
  - add to cart button

### Product Detail
- Product detail page displays:
  - full product info
  - preview smoke video + preview hex smoke color
  - same luxury vibe as shop

### Admin
- Admin panel features:
  - add/edit/delete products
  - upload product image
  - store smoke hex colors (scroll + preview)
  - mobile responsive admin UI
  - stable and reliable input validation

### Media Handling
- Product images must:
  - be optimized
  - be consistently sized/cropped
  - look “slim” and clean (not thick)
- Background removal must be high quality and preferably free.
- Avoid heavy client-side processing.

## Performance Requirements
- Smoke video effects must not cause flicker, repaint loops, or heavy re-renders
- Must be smooth on Android (common flicker source)
- Avoid triggering layout thrash
- Avoid large media payloads

## Strict Rules
- Do NOT change architecture or folder structure unless explicitly required.
- Do NOT introduce new dependencies unless necessary and justified.
- Keep changes minimal and targeted.
- Always preserve existing functionality.
- Prefer incremental improvements, not rewrites.

## How AI Should Operate
- Read `/ai/SPEC.md` and `/ai/TASKS.md` before making any changes.
- Only implement ONE task at a time.
- For every change:
  - list files changed
  - explain why
  - output full updated file content for each changed file
- If unsure, ask before altering system-level logic.