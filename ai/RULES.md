# RULES.md — Codex Operating Rules (READ BEFORE ANY WORK)
These are strict rules. Violating them is considered a failure.

---

## ✅ Branch + Safety
1) ONLY work on branch `ai-build`.
2) NEVER touch `main`.
3) NEVER create or switch branches unless explicitly instructed.
4) NEVER push. The owner will push after testing.

---

## ✅ Scope Control (No Drift)
5) ONLY modify files required to complete the current phase in `/ai/TASKS.md`.
6) Do NOT remove sections/pages/features unless explicitly instructed.
7) Do NOT rename navigation labels or change wording unless instructed.
8) Do NOT "refactor for cleanliness" unless it is required for the task.

---

## ✅ Minimal Diffs (No Over-Engineering)
9) Prefer minimal diffs: smallest change that achieves the goal.
10) Avoid rewriting components, layouts, or architecture.
11) Avoid new dependencies unless explicitly asked.
12) Avoid heavy animation systems, global state changes, or new frameworks.

---

## ✅ Performance Rules (Critical)
13) Avoid Android flicker triggers:
   - no continuous state updates on scroll
   - no rerender loops
   - no heavy JS animation loops
14) Use CSS and simple motion effects.
15) Use animations only on mount/hover/reveal, not constantly running loops.

---

## ✅ Ask If Uncertain (Mandatory)
16) If unsure about requirements: ASK BEFORE IMPLEMENTING.
17) If unsure about a file’s role: ASK BEFORE CHANGING IT.
18) If a change impacts security/auth/db/admin/schema: ASK BEFORE CHANGING IT.

---

## ✅ Owner Actions (Supabase, env, etc.)
19) If anything requires manual steps by the owner (Supabase tables, policies, env vars):
   - Provide exact SQL
   - Provide step-by-step instructions
   - Explain where to run it in Supabase UI
   - Explain how to verify it worked

---

## ✅ Verification
20) After each phase, run:
   - `npm run dev` and verify no errors
21) Before final delivery:
   - `npm run build` must pass
22) Provide:
   - list of modified files
   - summary of changes
   - any follow-up required

---

## ✅ Workflow Discipline
23) Work in phases. Complete the phase fully before reporting back.
24) Do NOT stop after one small edit.
25) Stop and wait for approval after each phase.