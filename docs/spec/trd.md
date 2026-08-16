# TRD.md — Technical Requirements Document

## 1. Tech Stack (Current)
| Layer | Technology | Status |
|---|---|---|
| Language | Python 3.x | — |
| Data validation | Pydantic 2.6.1 | Partially wired (models exist, not consistently used — see Architecture.md §3) |
| Persistence | `sqlite3` (stdlib) | Implemented, but conflicts with declared dependency below |
| Persistence (declared) | SQLAlchemy 2.0.27 | **Declared in requirements.txt, not implemented anywhere** |
| Output formatting | `tabulate` 0.9.0 | **Declared, not implemented anywhere** |
| Interface | CLI (`input()`/`print()`) | Implemented |

## 2. Stack Decision Needed
Two of three declared dependencies are unused. This TRD recommends: **drop SQLAlchemy, keep raw `sqlite3`.** Rationale — single table, no relationships, no migrations needed at this scale; an ORM adds abstraction overhead without a corresponding benefit for one `measurements` table. If the project later adds multiple related tables (e.g., normalized exercise history, multi-user support), revisit this decision — that's the point at which an ORM starts paying for itself. See `decisions.md` for the recorded rationale.

`tabulate` should be kept and wired in during Phase 2 (Phases.md) — it's the right tool for rendering `WorkoutSession` output as a table and shouldn't be dropped.

## 3. Performance Requirements
Negligible. Single-user, local file, no concurrent access, dataset size in the low thousands of rows at most (daily measurement logs over years of use). No indexing, caching, or query optimization work is justified at this scale — flag it explicitly if effort gets spent here, since it would be premature.

## 4. Security Requirements
- No authentication needed — single local user, single local machine.
- No secrets, API keys, or network calls in this application; there is nothing to leak.
- Input validation exists to prevent crashes and bad data (see `validators.py`), not to prevent malicious input — there is no adversarial user model here.

## 5. Scalability Plan
None required at current scope. If multi-user or cloud sync is ever added (out of scope per `Rules.md`), that would require a full architecture revision — not an incremental patch — and should be treated as a new PRD, not a phase of this one.

## 6. Testing Requirements
- Unit tests for pure functions (`validators.py`, ratio math, progression calculation logic) — no framework dependency required beyond `pytest` if the team wants one; not currently in `requirements.txt`.
- No integration/E2E test infrastructure is justified for a single-file CLI app at this scope.

## 7. Explicit Non-Requirements
Stated here to prevent scope creep during future phases:
- No web UI, no REST API, no mobile client.
- No cloud persistence or backup — local file only.
- No third-party fitness API integrations (e.g., wearables) unless a future PRD specifies it.
