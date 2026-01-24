# Copy/Paste Prompts — Use these exactly (AI consistency)

## Global Rules (prepend to every prompt)
You are working on PUFFF Station Vendors SA.
Read `/ai/PROJECT_CONTEXT.md`, `/ai/SPEC.md`, `/ai/TASKS.md`, `/ai/DECISIONS.md`, `/ai/REFERENCES.md`, `/ai/DRIFT_LOCK.md` before making changes.
Only do ONE task at a time.
Keep changes minimal and targeted. Do NOT refactor unrelated parts.
Output full updated file contents for every file you change.
After changes, list: files changed + why.
Update `/ai/TASKS.md` to mark the task ✅ Done with notes.
If unsure, ask before changing architecture.

---

## Prompt 1 — Start / Repo Understanding
Scan this project context. Summarize what's implemented and the current state. Then list the next 5 highest priority tasks from `/ai/TASKS.md`.

---

## Prompt 2 — Implement Next Task (Recommended)
Implement the next unchecked task in `/ai/TASKS.md`.
Output full updated contents for every changed file.
Update `/ai/TASKS.md` to mark the task ✅ Done with notes.

---

## Prompt 3 — Fix a Specific Error
I ran the project and got this error:
<PASTE ERROR HERE>
Fix it with minimal code changes. Output full updated file contents for any modified files.

---

## Prompt 4 — UI Match to Reference
Match the UI to the reference images provided.
Do not change architecture. Focus only on styling/layout.
Output full updated file contents for modified files.

---

## Prompt 5 — Performance Audit
Audit for performance issues (especially Android flicker / repaint loops).
Propose minimal changes to eliminate flicker and reduce re-rendering.
Output full updated file contents for modified files.