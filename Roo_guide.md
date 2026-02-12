# Roo Guide: Cloudflare Pages Deployment

## Executive Summary

We have successfully built and deployed the Next.js application to Cloudflare Pages using the Windows Subsystem for Linux (WSL) environment. However, the deployed application is currently returning an "Internal Server Error" (500) upon access. This is likely due to runtime incompatibility between Next.js server-side features (specifically those relying on Node.js APIs like `fs` and `async_hooks`) and the Cloudflare Edge Runtime.

## Actions Taken

### 1. Environment Setup
*   **Problem:** Building on Windows native caused permission errors (`EACCES`) and path issues.
*   **Resolution:** Switched to using **WSL (Ubuntu)** for all build and deployment commands.
*   **Action:** Cleared `node_modules` and `package-lock.json` to resolve Windows file locking issues.

### 2. Dependency Management
*   **Problem:** `npm install` failed due to peer dependency conflicts between `next` (v15.1.5+) and `@cloudflare/next-on-pages`.
*   **Resolution:** Downgraded Next.js to a compatible version.
*   **Command:** `npm install next@15.1.0`

### 3. Build Configuration
*   **Problem:** The `build` script was recursively calling itself, causing failure.
*   **Resolution:** Updated `package.json` scripts.
    *   `build`: Standard `next build`
    *   `pages:build`: Specific command `npx @cloudflare/next-on-pages`
*   **Problem:** Cloudflare Pages requires specific output directory configuration.
*   **Resolution:** Updated `wrangler.toml` with `pages_build_output_dir = ".vercel/output/static"` and added `compatibility_flags = ["nodejs_compat"]`.

### 4. Edge Runtime Compatibility
*   **Problem:** API routes (`/api/admin/pudo/...`) used Node.js native modules (`fs`, `path`) which are not available in the Edge Runtime.
*   **Resolution:**
    *   **PUDO Upload:** Temporarily disabled the file upload logic (which used `fs.writeFile`) and set it to return a 501 Error.
    *   **Config:** Attempted to alias `async_hooks` to `false` in `next.config.mjs` to suppress webpack errors.
    *   **Directives:** Experimented with `export const runtime = 'edge'` vs `nodejs` and `force-static`.

### 5. Deployment
*   **Problem:** Wrangler authentication failed with environment variables.
*   **Resolution:** Unset `CLOUDFLARE_API_TOKEN` and authenticated interactively via browser (`npx wrangler login`).
*   **Status:** Deployment successfully uploaded assets to Cloudflare Pages.

### 6. Edge Runtime Troubleshooting
*   **Problem:** Application fails with "Internal Server Error" and logs show `Error: No such module "__next-on-pages-dist__/functions/async_hooks"`.
*   **Resolution:**
    *   Added `nodejs_compat` compatibility flag to `wrangler.toml`.
    *   Explicitly set `export const runtime = 'edge'` in `app/layout.tsx`.
    *   Updated `next.config.mjs` to force disable `async_hooks` via both `config.resolve.alias` and `config.resolve.fallback`, removing the conditional check for `nextRuntime === 'edge'`.

## Current Status

*   **Build:** Passing (`npm run pages:build` in WSL).
*   **Deployment:** Successful.
*   **Runtime:** Fails with **Internal Server Error**.
    *   Logs still indicate `Error: No such module "__next-on-pages-dist__/functions/async_hooks"` despite the config changes.

## Next Steps (Self-Prompt)

The immediate goal is to fix the runtime crash. The application is likely trying to execute Node.js code that `nodejs_compat` doesn't cover, or the webpack configuration isn't correctly polyfilling necessary modules for the browser/edge.

**Copy and paste the following prompt to continue the debugging process:**

```text
The deployment is live but crashing with an Internal Server Error related to `async_hooks`.

Please perform the following debugging steps:
1. Re-build and re-deploy the application with the latest `next.config.mjs` changes (aliasing `async_hooks` to false).
2. Use `npx wrangler pages deployment tail` to capture the specific runtime error causing the 500 crash.
3. If `async_hooks` persists: Investigate dependencies that might be importing it. Libraries like `resend`, `@supabase/supabase-js`, or others might be the culprit.
4. Verify if specific API routes (like PUDO or Admin routes) are importing Node.js modules and if they are being bundled into the main worker improperly.

Goal: Get the homepage to load without error.
```
