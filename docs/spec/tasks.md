# tasks.md — Task Tracker

Status legend: `[ ]` planned · `[~]` in progress · `[x]` complete

## Phase 0 — Scaffold
- [x] Directory structure created
- [x] Pydantic models defined (`UserProfile`, `Exercise`, `WorkoutSession`, `PhysiqueMetrics`)
- [x] Static `WorkoutGenerator.generate_v_taper_split()` returning hardcoded routine
- [x] Static `ProgressionEngine.calculate_next_load()` printing rule text
- [x] `database/connection.py` with `init_db()` and `get_db_connection()` (unwired)
- [x] `utils/validators.py` with `validate_circumference()` (unwired)

## Phase 1 — Wire the Data Layer
- [ ] Call `init_db()` on app startup
- [ ] Route menu option 2 input through `validate_circumference()`
- [ ] Persist metrics entries to the `measurements` table
- [ ] Add "View History" menu option to read back stored rows

## Phase 2 — Wire the Model Layer
- [ ] `WorkoutGenerator` returns `WorkoutSession`/`Exercise` objects, not a dict
- [ ] Instantiate and validate `UserProfile` from menu option 1 input
- [ ] Render workout output with `tabulate`

## Phase 3 — Real Progression Logic
- [ ] `ProgressionEngine` reads most recent logged set from DB
- [ ] Implement the 2.5–5% load-increase rule as code, not just a printed message
- [ ] Persist calculated next-session target

## Phase 4 — Dependency Cleanup
- [ ] Remove SQLAlchemy from `requirements.txt` (per decisions.md D1)
- [ ] Confirm `tabulate` is imported and used after Phase 2
- [ ] Confirm every import in the codebase has a matching `requirements.txt` entry and vice versa

## Phase 5 — Polish & Guardrails
- [ ] Re-prompt on invalid CLI input instead of raising uncaught exceptions
- [ ] Unit tests for `validators.py`
- [ ] Unit tests for `ProgressionEngine` load calculation
- [ ] Update README to match actual (not aspirational) feature set

## Backlog / Not Yet Scheduled
- [ ] Decide whether `IDEAL_WAIST_TO_SHOULDER_RATIO` should ever become per-user (see decisions.md D2) — no action unless requested
- [ ] Consider export of logged history to CSV — not in current PRD scope, flag before building
