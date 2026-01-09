# PUFFF Station Vendors SA — Codex Task List (ai-build)

## Rules (MUST FOLLOW)
- Work ONLY on branch: `ai-build`
- Minimal edits, no architecture changes
- No new dependencies unless approved
- If uncertain, ASK before implementing
- Batch mode: complete each task fully before pausing
- After each task:
  - list files changed
  - tell me what to test locally (`npm run dev`)
  - do NOT continue until I approve

---

# PHASE 1 — Homepage Brand & Header Polish (High Priority)

## [ ] 1.1 Header: Desktop matches mobile dropdown style
**Goal:** Desktop header must not list every category link, Must be placed in a menu dropdown.
- Keep main nav: Home / Shop / Support / Login / Cart
- Add dropdown: "Flavours" (or "Categories") to shop page.
- Dropdown lists flavour groups (Sweet, Fruity, Ice/Mint, Tobacco, Soda, Berry, Exotic etc.)
- On click → navigates to filtered shop page. Hover Dropdown for pc, and tap dropdown for mobile.

**Done when:**
- desktop header looks clean
- dropdown works & is accessible
- no layout jump

**Test:**
- desktop width 1920, 1440, 1366
- mobile navigation still works

---

## [ ] 1.2 Header Branding Upgrade
**Goal:** Branding must be stronger and more intriguing.
- Add logo next to brand text
- Improve typography & spacing
- Add subtle neon underline/glow accent

**Done when:**
- brand stands out instantly
- header still feels premium and not busy

---

## [ ] 1.3 Hero Background Darken + Readability
**Goal:** Make hero background darker so UI + products pop.
- Add gradient overlays
- Keep cinematic smoke image but reduce brightness
- Ensure text contrast is high

**Test:**
- check readability on all screen sizes

---

## [ ] 1.4 Hero Copy Rewrite (SA street-luxury)
**Goal:** Replace generic wording with better slang + premium tone.
- Keep it clean, confident, and SA styled
- Example vibe: "Clean stock. Fast dispatch. No kak stories."
- No cringe, no over-cussing.

**Done when:**
- copy feels like a real SA vape brand
- consistent tone across hero + perks

---

## [ ] 1.5 Hero “Alive” Micro Animations (Performance Safe)
**Goal:** Make homepage feel alive without flicker.
- CTA glow pulse (slow)
- hover glow + lift on cards
- soft fade-in on hero text once
- respect reduced motion

**No heavy rerenders**
**No Android flicker**

---

# PHASE 2 — Homepage Flavour Selector + Featured Drops

## [ ] 2.1 “What flavour are you feeling today?” section
**Goal:** Add category selector cards/buttons for flavour groups.
- Title: "What flavour are you feeling today?"
- Each flavour is a clickable card with icon + glow.
- Clicking navigates to `/shop` with flavour filter applied.

**Implementation:**
- Use query param (`/shop?flavour=sweet`) or route (`/shop/flavour/sweet`)
- Must integrate with existing shop filtering.

---

## [ ] 2.2 Featured Drops section (Recommended Products)
**Goal:** Show 3–6 featured products on homepage.
- Include “Browse all” CTA to `/shop`
- Cards should be sleek, consistent, premium.

**Future-friendly:** use a simple list now, admin control later.

---

# PHASE 3 — Footer (Mandatory Links + Premium)

## [ ] 3.1 Footer v1
**Goal:** Add footer now with all required links and trust.
Include:
- Support email / contact
- Terms & Conditions
- Privacy Policy
- Refund / Returns (if applicable)
- 18+ warning
- Social links (if available)
- Copyright

**Style:**
- sleek, black glass + neon accents
- not bulky

---

# PHASE 4 — Image Optimizer + Admin Freedom

## [ ] 4.1 Image optimizer tuning (Sharp)
**Goal:** product images must look consistent, slim, not bloated.
- enforce consistent width/height
- crop smartly (center)
- sharpen gently (no harsh)
- compress properly
- ensure background remover output looks clean

**Done when:**
- new uploads look consistent vs older uploads
- no stretched or fat look

---

## [ ] 4.2 Admin panel: more freedom / better UX
**Goal:** Admin UI must be sleek and provide more control.
- Improve layout spacing, mobile support
- Add clearer controls and previews
- Prepare future controls:
  - featured product selection
  - flavour/category edits
  - homepage copy edits

---

# PHASE 5 — Quality + Performance Pass

## [ ] 5.1 UX polish
- Improve spacing + alignment sitewide
- Ensure all headings consistent
- Ensure product cards consistent

## [ ] 5.2 Performance safety
- ensure no rerender loops
- ensure no heavy blur issues on mobile
- keep animations subtle