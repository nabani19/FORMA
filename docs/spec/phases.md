# Phases.md — Build Roadmap

## Phase 0 — Scaffold (Complete)
- Directory structure, Pydantic models, static workout generator, static progression message, unwired DB layer.
- **Status:** done, but several pieces below are not yet connected to each other (see `Architecture.md` §3).

## Phase 1 — Wire the Data Layer
Goal: nothing is stateless anymore.
- Call `init_db()` on app startup in `main.py`.
- Route menu option 2 input through `validate_circumference()` before computing the ratio.
- Persist each metrics entry to the `measurements` table instead of just printing the computed ratio.
- Add a "View History" path (new menu option) that reads back stored rows.
- **Exit criteria:** closing and reopening the app preserves prior measurement logs.

## Phase 2 — Wire the Model Layer
Goal: the Pydantic models actually constrain the data flowing through the app.
- Change `WorkoutGenerator.generate_v_taper_split()` to return `WorkoutSession` objects (with `Exercise` children), not a raw dict.
- Instantiate `UserProfile` from menu option 1 input and validate `experience_level` against the allowed set before generating a routine.
- Render `WorkoutSession` output using `tabulate` instead of a raw `print()` of a dict — this also resolves the currently-unused dependency.
- **Exit criteria:** removing a required field from a model causes a visible validation error, not a silent `KeyError` downstream.

## Phase 3 — Real Progression Logic
Goal: `ProgressionEngine` operates on logged history, not a static string.
- `ProgressionEngine.calculate_next_load()` reads the most recent logged set/weight/reps for a given exercise from the DB.
- Apply the 2.5–5% load-increase rule programmatically based on whether the prior top-set rep target was met (this logic currently exists only as a printed comment, not code).
- Persist the calculated next-session target back to the DB so it's available on the following run.
- **Exit criteria:** running option 3 twice in a row with different logged outcomes produces different recommended loads.

## Phase 4 — Dependency Cleanup
- Resolve the SQLAlchemy/sqlite3 conflict per `decisions.md`.
- Remove or wire in any dependency in `requirements.txt` not actually imported anywhere.

## Phase 5 — Polish & Guardrails
- Input re-prompting on invalid CLI entries instead of raw exceptions.
- Basic unit tests for `validators.py` and `ProgressionEngine` (pure functions, easiest to test in isolation).
- README update to reflect the now-functional feature set (currently describes Phase 2/3 behavior as if it already exists).

**Sequencing rule:** don't start Phase 2 model work until Phase 1's DB wiring is done — building the model layer on top of a data layer that doesn't persist anything means retesting everything once persistence lands.
