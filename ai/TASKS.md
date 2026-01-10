# TASKS.md — PUFFF Station Vendors SA (ai-build)
Last updated: 2026-01-10

## 🔥 Project Context
Luxury neon smoke disposable vape e-commerce site.
Stack: Next.js App Router (Next 16), Tailwind, Supabase (db/auth/storage), Vercel.
Brand vibe: **Black + neon smoke + premium + alive + sleek**.

Homepage is a **front cover / brand landing page** (not a product grid).
Shop page is where product listing lives.

---

# ✅ NON-NEGOTIABLE RULES (READ FIRST)
1) Work ONLY on branch `ai-build`. Do NOT touch `main`.
2) Do NOT restructure the app architecture.
3) Do NOT remove existing sections/pages/features unless explicitly asked.
4) Do NOT rename navigation labels randomly. Existing naming must remain consistent.
5) If you are unsure about any requirement or behavior, you MUST ASK before implementing.
6) If something requires manual action from the owner (Supabase migrations, env vars, policies, storage, etc.), you MUST:
   - clearly explain what needs to be done
   - give step-by-step instructions
   - include exact SQL (if relevant)
   - explain where in Supabase UI to run it
   - list expected outcomes + how to verify it worked
7) Batch work: Do not stop after one tiny change. Complete tasks in the phase before reporting back.
8) Performance is critical: avoid Android flicker and heavy rerenders.
9) After each phase: run `npm run dev` AND fix errors until clean.
10) Before final: run `npm run build` and confirm success.

---

# ✅ TOP PRIORITY GOALS
1) Homepage must be a perfect cover page with breathing room (especially mobile).
2) Header must be clean and behave consistently across desktop/mobile.
3) Site must feel more alive with subtle premium motion.
4) Featured products must be controlled by Admin and can show on Homepage and/or Shop.
5) Footer must be complete, professional, and compliant.

---

# ✅ FILE ANCHORS (where changes likely happen)
- Homepage: `app/page.tsx`
- Header component: search for `Header` or `Navbar` components in `/components`
- Admin route: `app/admin/**`
- Smoke background video: `public/hero/neon-smoke.mp4`

---

# ✅ PHASE 1 — HOMEPAGE COVER PAGE POLISH (NO PRODUCTS BY DEFAULT)
### Goal
Homepage is a **premium cover page** with:
- animated smoke background
- clear brand identity
- strong CTA
- NOT cramped on mobile
- feels alive

### Requirements
- Keep smoke MP4 background (`/hero/neon-smoke.mp4`) active.
- Homepage background video should remain fixed behind all sections while scrolling (homepage only).
- Add subtle dark overlay/gradient to maintain text readability.
- Mobile spacing fix: increase vertical spacing + padding to reduce claustrophobia.
- Improve typography and layout to feel premium on desktop and mobile.
- Brand identity:
  - Logo + “PUFFF Station Vendors SA” must stand out
  - Must NOT look like a product card
  - Must be placed cleanly, not treated as a product tile
- Keep homepage content minimal and cover-like.
- Add subtle motion:
  - hero text fade-in
  - CTA hover glow
  - section reveal fade-in (once, lightweight)
  - no heavy loops or continuous JS animation

### Acceptance Criteria
- Homepage looks great on mobile and desktop.
- No cramped spacing on mobile.
- No Android flicker.
- No product grid on homepage by default.

---

# ✅ PHASE 2 — HEADER FIXES (DESKTOP LIKE MOBILE, NO BULLSHIT)
### Goal
Clean header. Desktop should not list every category. Must feel premium.

### Requirements
- Header must NOT have dropdown hover area that triggers everywhere.
- Dropdown must only open when hovering/clicking correct trigger.
- Desktop header should match mobile approach:
  - clean nav links (Home / Shop / Support / Login / Cart)
  - optional single “Browse” dropdown (NOT replacing main nav)
- Header should shrink slightly on scroll (subtle).
- Logo must always be visible and clickable.
- Ensure naming is correct:
  - no random renames like “Categories” replacing main nav label unless explicitly approved.
  - use existing naming or “Browse”.

### Acceptance Criteria
- Hover works only where expected.
- Header does not block clicks across entire top bar.
- Desktop looks better than mobile.

---

# ✅ PHASE 3 — FOOTER (ADD NOW)
### Goal
Footer must be complete, clean, and legally safe.

### Must include
- Brand name
- Navigation links
- Contact email + support email
- Social placeholders (Instagram / TikTok)
- Legal and compliance:
  - 18+ warning
  - “No sales to minors”
  - Terms + Privacy
  - Refund/Returns
  - Disclaimer about nicotine / trademarks

### Acceptance Criteria
- Footer exists on all pages.
- Footer matches theme and looks premium.

---

# ✅ PHASE 4 — FEATURED PRODUCT SYSTEM (ADMIN CONTROLS WHERE THEY SHOW)
### Goal
Admin can control whether featured products show on:
- Homepage (as separate section below hero)
- Shop page
- Both
- None

Homepage default remains ZERO products unless Admin enables featured display.

### Requirements
1) Add product toggle:
   - Products must have `is_featured boolean default false`.
   - If column does not exist, provide SQL migration instructions.
2) Add site-level settings:
   - Create `site_settings` table (single row) to control featured placement:
     - show_featured_home boolean
     - show_featured_shop boolean
     - featured_home_limit int
     - featured_shop_limit int
     - featured_home_title text
     - featured_shop_title text
     - updated_at timestamptz
3) Admin UI:
   - Create a "Site Settings" section in admin.
   - Admin can toggle:
     - Show featured on homepage
     - Show featured on shop
   - Admin can set:
     - limits (home/shop)
     - titles (home/shop)
   - Must feel like a real control dashboard (power + clarity).
4) Homepage:
   - Featured section appears BELOW hero (not inside hero).
   - Only appears if enabled via site settings.
5) Shop page:
   - Featured strip/grid appears near top if enabled.
6) Performance:
   - Use server-side fetch where possible.
   - Avoid heavy rerenders.

### Acceptance Criteria
- Admin can enable/disable featured display home/shop.
- Featured products appear only when enabled.
- Default homepage stays product-free.
- Admin feels powerful and in control.

---

# ✅ PHASE 5 — FLAVOUR MOOD CATEGORY SYSTEM (HOME → SHOP FILTER)
### Goal
User picks flavour mood → shop filtered.

### Requirements
- Add homepage section:
  "What flavour are you feeling today?"
- Flavour chips/cards must feel premium neon.
- Click leads to `/shop?flavour=<slug>`
- Shop page must filter products reliably using flavour field (already exists).
- Ensure Next.js 16 searchParams async requirements are satisfied.

### Acceptance Criteria
- Flavour picker works.
- Shop filters correctly.
- No runtime errors.

---

# ✅ PHASE 6 — ADMIN PANEL “POWER DASHBOARD” POLISH
### Goal
Admin panel must match theme and feel powerful.

### Requirements
- Improve spacing, layout, and readability (desktop + mobile).
- Add “Quick Actions” panel:
  - Toggle featured placement (home/shop)
  - Quick search products
  - Quick edit featured toggles
- Add “Detailed Editing” section:
  - full product edit controls (existing)
- Must remain stable and not cluttered.

### Acceptance Criteria
- Admin feels like he controls the site.
- Quick actions + detailed controls exist.
- UI doesn’t break on mobile.

---

# ✅ PHASE 7 — IMAGE WORKFLOW QUALITY (MINIMAL BUT EFFECTIVE)
### Goal
Product images look consistent and premium.

### Requirements
- Improve image optimizer output so products are not fat/squashed.
- Enforce consistent size and padding.
- Add background remover tools dropdown links in admin (free options).
- Dropdown must not interfere with admin UI.

### Acceptance Criteria
- Product images look slimmer and consistent.
- Dropdown works cleanly.

---

# ✅ FINAL CHECKLIST (MANDATORY)
- Run `npm run dev` → no errors.
- Run `npm run build` → passes.
- Test homepage on mobile → not cramped.
- Test header dropdown behavior.
- Test featured toggles behavior.
- Test shop flavour filter.
- Summarize changed files + what was done.
- Commit once per phase or once at end if safe.

---

# ✅ COMMIT RULE
After completing the phase(s) assigned:
- `git add -A`
- `git commit -m "<meaningful message>"`

Do NOT push. Owner will push after testing.