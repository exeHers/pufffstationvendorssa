# ParkStationVendorsSA – Active Tasks

## Priority: Homepage & UX Improvements

### 1. Persistent Live Background Video (Homepage Only)
- The MP4 live video must act as a **fixed background layer** on the homepage.
- When the user scrolls, all content (hero text, features, products, etc.) should scroll **over** the video.
- The video should not be contained inside a section.
- The footer must **not** appear over the video.
- This behavior applies **only to the homepage**.

---

### 2. Featured Drops (Admin-Controlled)
- Featured Drops must be:
  - Enableable / disableable from the Admin Panel
  - Have customizable title and description set by the admin
- The Featured Drops admin controls must be moved:
  - They should live inside **Admin → Management**
  - They must not be their own separate admin section

---

### 3. Product Deletion System
- Products must support:
  - **Soft delete** (hide from users but keep in database)
  - **Hard delete** (permanently remove from Supabase and all references)
- The admin must be able to choose which delete type to use.

---

### 4. Matte UI Theme
- The overall site background must have a more **matte** appearance.
- The shop section should remain purple, but must look more **muted and matte**, not glossy or vibrant.

---

### 5. Quick Add Panel (Admin)
- The Quick Add panel must become fully functional.
- It must allow the admin to quickly:
  - Add products
  - Update inventory
  - Perform fast actions without navigating through multiple screens
- It is designed for speed and convenience.

---

### 6. Reviews System
- Add a **“Give Us a Review”** option in the site footer.
- Users must be able to submit:
  - 1 to 5 star rating
  - Optional text

---

### 7. Admin-Controlled Reviews Display
- The admin must be able to:
  - View all submitted reviews
  - Choose which reviews to display publicly
- Display rules:
  - Reviews appear at the **bottom of the homepage**
  - If Featured Drops is enabled → Reviews appear **below Featured Drops**
  - If Featured Drops is disabled → Reviews appear in its place

---

### 8. Admin Panel Expansion
- The Admin Panel should become more powerful and detailed.
- Roo Code is allowed to propose **useful improvements**, but:
  - It must not invent features outside this scope
  - It must not break existing systems
  - If unsure, it must ask the owner (you) before implementing

---

## Agent Rules

- Follow this file as the **source of truth**
- Do not invent new systems not listed here
- Do not remove existing functionality unless instructed
- If a decision is unclear, **ask the project owner**
- Prefer extending existing code instead of rewriting
- After every successful task:
  - Run the app
  - Ensure nothing is broken
  - Commit clean, working code
