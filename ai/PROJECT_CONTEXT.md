# Project Context — PUFFF Station Vendors SA (Repo Memory)

## Goal
Build and polish a premium disposable vape e-commerce site with a luxury black + neon smoke vibe.
Must be reliable, functional, and visually consistent. Minimal drift. Minimal refactors.

## Stack
- Next.js 16 App Router
- Supabase (DB + Storage bucket)
- TailwindCSS
- Framer Motion
- Sharp image processing on API route
- Deployed on Vercel

## Core Features Implemented (high-level)
- Shop page listing products from Supabase
- Product detail page
- Admin panel to manage products
- Product image upload pipeline (API route exists)
- Smoke video background effects and hex-based tint controls (in progress)
- Remote image config includes Supabase domain in next.config.ts

## Key Constraints
- Don’t rewrite architecture.
- Don’t add new frameworks.
- Don’t refactor unrelated code.
- Work on one task at a time.
- Output full updated file content for changes.

## Media
- Product images stored in Supabase Storage bucket.
- Images must be optimized, slim-looking, consistent.
- Background removal should be free and high-quality (rembg service preferred).

## Deployment
- Vercel deployment.
- Environment vars stored in Vercel and used in Next.js (Supabase keys, etc.)

## How Work Is Done
- AI reads files in /ai/ before changes.
- AI implements next unchecked task in /ai/TASKS.md.
- AI outputs updated file contents for each changed file.
- User runs and tests locally, commits changes to GitHub.

## Current Highest Priority Problems (from prompt doc)
- Smoke hex color accuracy (no hue rotate hacks)
- Smoke vibrancy (neon, not dull)
- Smoke layering behind product image
- Product detail preview smoke system
- Android flicker avoidance
- Product image optimization and background removal automation