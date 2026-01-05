# Architecture Decisions (Do NOT change unless explicitly told)

## Framework
- Next.js 16 App Router is fixed.
- Do not convert to Pages Router.
- Do not migrate bundlers.

## Backend
- Supabase is the backend for products/auth/storage.
- Supabase Storage bucket holds images.
- Do not switch databases or rewrite schema unless asked.

## Styling
- TailwindCSS + existing components remain.
- No new UI frameworks unless necessary.

## Media Pipeline
- Sharp optimization exists and should remain.
- Background removal should be via free rembg service (preferred).
- Avoid client-side heavy processing.

## Deployment
- Deploy on Vercel.
- Use environment variables properly.