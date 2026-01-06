# PUFFF Station Vendors SA — Task List (Do one at a time)

## How to Work
- Only do ONE task per run.
- After completing a task, update this file:
  - mark it ✅ Done
  - add a short note about what changed
  - mention files touched

---

## Priority: MUST FINISH BEFORE LAUNCH (Jan 10)
- [x] ✅ Fix smoke tint accuracy (must match chosen hex exactly) — switched smoke gradients/overlays to use exact hex RGB vars; removed hue-rotate tinting; files: `app/smoke.css`, `app/shop/page.tsx`
- [x] ?o. Make smoke more neon / vibrant and correctly layered behind product (not behind banner) ??? boosted smoke opacity/contrast, added neon core glow, and set z-index layering to keep smoke behind product/pedestal; files: `components/products/ProductCard.tsx`
- [x] ?o. Apply same smoke system to product detail page (preview.mp4 + preview hex) ??? wired smoke RGB vars + pufff haze/pad on detail view and boosted preview tint to match; files: `app/shop/[id]/page.tsx`
- [x] ?o. Prevent Android flicker / repaint loops (smoke video + motion) ??? added Android gate to disable heavy smoke animations/filters and tagged smoke videos for overrides; files: `components/utils/AndroidMotionGate.tsx`, `app/layout.tsx`, `app/smoke.css`, `components/products/ProductCard.tsx`, `components/shop/ShopHero.tsx`, `components/shop/ScrollShowcase.tsx`, `app/shop/page.tsx`, `app/shop/[id]/page.tsx`
- [x] ?o. Improve product image consistency (size/crop/slim look) ??? standardized image wrappers/sizing on cards, featured hero, and detail view for consistent proportions; files: `components/products/ProductCard.tsx`, `app/shop/page.tsx`, `app/shop/[id]/page.tsx`
- [x] ?o. Integrate proper background remover (free / high quality) into upload pipeline (rembg service) ??? added optional REMBG_URL processing for product create and image replace uploads; files: `app/api/admin/products/route.ts`, `app/api/admin/products/image/route.ts`
- [x] ?o. Ensure admin panel is mobile responsive and stable ??? improved admin header/actions stacking and list card layout for small screens across products/orders/support; files: `app/admin/products/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/support/page.tsx`, `app/admin/page.tsx`
- [x] ?o. Confirm no performance regressions (no heavy rerenders / no massive payloads) ??? reduced smoke video preload to metadata and enabled async lazy image decoding on heavy hero/detail images; files: `app/shop/page.tsx`, `components/shop/ShopHero.tsx`, `app/shop/[id]/page.tsx`

---

## Secondary Improvements (If time allows)
- [x] ?o. Improve SEO defaults (meta titles, descriptions) ??? added metadataBase, title template, Open Graph, Twitter, and icon defaults; file: `app/layout.tsx`
- [x] ?o. Improve category filtering UI polish ? added category filter pills with URL param support and active state; file: `app/shop/page.tsx`
- [x] ?o. Improve cart and checkout UX polish ? improved mobile header actions, added item counts, cart item summary on checkout, and a continue shopping action; files: `app/cart/page.tsx`, `app/checkout/page.tsx`
- [x] ?o. Improve skeleton/loading states ? added animated skeleton cards for orders and support loading states; files: `app/orders/page.tsx`, `app/support/page.tsx`
- [x] ?o. Audit for broken links and edge cases ? scanned internal hrefs vs app routes; no missing routes found; files: `app`, `components`

---

## Definition of Done
A task is done when:
- UI matches luxury black + neon vibe
- no flicker on Android
- smoke is accurate color
- no major console errors
- performance remains smooth
