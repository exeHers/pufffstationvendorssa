# PUFFF Station — Phase 2 Roadmap

## Phase 1: Compliance & Legal Foundation
### 1. Mandatory Legal Documentation
- [ ] Create `/app/terms/page.tsx` with comprehensive Terms of Service.
- [ ] Create `/app/privacy/page.tsx` with a detailed Privacy Policy.
- [ ] Create `/app/refunds/page.tsx` outlining the Refund & Return Policy.
- [ ] Implement a robust, legally compliant age verification gate.

---

## Phase 2: "Matte" Theme Polish & UI Consistency
### 2. Eradicate "Fuchsia" & "Pink" Remnants
- [ ] Replace all instances of `fuchsia`, `pink`, `#D946EF`, and `#ff00ff` with the new "Matte Violet" palette.
- [ ] Standardize all interactive elements (buttons, links, inputs) to use CSS variables for consistent theming.

### 3. Homepage `is_featured` Logic
- [ ] Implement a dedicated "Featured" section on the homepage that exclusively displays products with the `is_featured` flag.
- [ ] Ensure this section is visually distinct and prioritized.

---

## Phase 3: Admin Dashboard Overhaul
### 4. Search & Filtering Implementation
- [ ] Add search and filter functionality to the Products, Orders, and Reviews sections of the admin dashboard.
- [ ] Implement sorting by date, price, and status.

### 5. Advanced Analytics Dashboard
- [ ] Create a new "Analytics" tab in the admin dashboard.
- [ ] Display key metrics like total sales, top-selling products, and new customers.
- [ ] Integrate charts and graphs for visual trend analysis.

---

## Phase 4: Technical Debt & Scalability
### 6. Database-Backed Cart
- [ ] Migrate the cart from `localStorage` to a database-backed system.
- [ ] Ensure cart contents are synchronized across devices when a user is logged in.

### 7. Centralized Error Logging
- [ ] Implement a centralized error logging service (e.g., Sentry, LogRocket) to capture and monitor all front-end and back-end errors.
- [ ] Set up alerts for critical issues to enable proactive debugging.
