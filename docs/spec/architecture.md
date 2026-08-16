# Architecture.md — Aesthetic Physique Tracker

## 1. System Type
Single-user, local CLI application. No network layer, no auth, no multi-tenancy. State lives in one SQLite file (`physique_tracker.db`) next to `config.py`.

## 2. Layered Structure

```
main.py                 → entry point, menu loop, I/O boundary
├── models/              → Pydantic schemas (data shape contracts)
├── services/            → business logic (workout generation, progression math)
├── database/             → persistence (raw sqlite3, not an ORM)
└── utils/                 → stateless helpers (validation)
```

Intended data flow: `main.py` collects input → validates via `utils/validators.py` → constructs a `models/` object → passes to a `services/` function → persisted via `database/connection.py` → result printed back to user.

## 3. Actual Data Flow (as of this PRD)
This is where the current code diverges from the intended layering above — worth fixing before adding features on top:

- **`main.py` never calls `init_db()` or `get_db_connection()`.** The `measurements` table is defined but nothing writes to or reads from it. Every session is stateless; nothing you log persists between runs.
- **`WorkoutGenerator.generate_v_taper_split()` returns a raw `dict[str, list[str]]`**, not a `WorkoutSession` / `Exercise` pair as modeled in `models/workout.py`. The models exist but aren't on the call path.
- **`main.py` option 2 (V-Taper check) never calls `validate_circumference()`** before doing the division — a `0` or negative waist input will raise `ZeroDivisionError` or produce a nonsensical negative ratio uncaught.
- **`UserProfile` is imported in `main.py` but never instantiated.** Experience level is passed as a bare string, not validated against the `beginner/intermediate/advanced` contract implied by the `Field` description.
- **`ProgressionEngine.calculate_next_load()` takes no arguments and reads no state** — it prints a static rule rather than operating on any logged history, so "Log Workout & Calculate Progressive Overload" (main menu option 3) doesn't actually log anything yet.

## 4. Target Architecture (post-Phase 2, see Phases.md)
Once wired correctly:
1. Menu option 1 → `WorkoutGenerator` returns `WorkoutSession` objects → rendered via `tabulate` (currently an unused dependency).
2. Menu option 2 → input passed through `validate_circumference()` → `PhysiqueMetrics` constructed → written to `database/connection.py` → ratio computed from stored history, not just the current input.
3. Menu option 3 → most recent `measurements` row read from DB → `ProgressionEngine` computes next load from actual logged weight/reps, not a static print statement.

## 5. Why raw `sqlite3` instead of the declared SQLAlchemy dependency
`requirements.txt` lists `SQLAlchemy==2.0.27`, but `database/connection.py` uses the stdlib `sqlite3` module directly. This is a real inconsistency, not a style choice — see `decisions.md` for the resolution and `TRD.md` for the stack implication.
