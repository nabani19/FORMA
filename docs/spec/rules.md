# Rules.md — Agent Boundaries for Aesthetic Physique Tracker

## Stack Constraints
- **This is a CLI application. Do not introduce a web framework (Flask/FastAPI/Django), GUI toolkit, or any HTTP server** unless explicitly requested in a new PRD revision. The current scope is `input()`/`print()` I/O only.
- **Do not add new third-party dependencies without updating `requirements.txt` in the same change.** A dependency used in code but absent from `requirements.txt` is a shipped bug, not a minor omission.
- **Resolve the SQLAlchemy-vs-sqlite3 conflict before building on top of `database/connection.py`.** Either (a) remove `SQLAlchemy` from `requirements.txt` and keep raw `sqlite3`, or (b) migrate `connection.py` to SQLAlchemy's ORM. Do not leave both declared and only one implemented — see `decisions.md` for which direction was chosen.
- `tabulate` is declared but unused. Either wire it into output formatting (recommended for Phase 2, see `Phases.md`) or remove it from `requirements.txt`. Unused declared dependencies are treated as defects here, not harmless slack.

## Data Integrity Rules
- **Every numeric user input must pass through `utils/validators.py` before use.** No exceptions — `main.py` option 2 currently skips this for waist/shoulder circumference; that's a defect to fix in Phase 1, not a pattern to replicate elsewhere.
- **Pydantic models in `models/` are the source of truth for data shape.** If a service function's return type doesn't match its corresponding model (e.g., `WorkoutGenerator` returning `dict` instead of `WorkoutSession`), that's a bug to fix, not a model to abandon. Don't quietly delete an unused model instead of wiring it in — confirm with the user first.
- Do not silently swallow exceptions from user input parsing (e.g., wrapping `float(input(...))` in a bare `try/except: pass`). Fail loudly with a clear re-prompt, per standard CLI UX.

## Scope Boundaries
- Do not add user accounts, cloud sync, or multi-user support. This is explicitly single-user, single-machine.
- Do not change `IDEAL_WAIST_TO_SHOULDER_RATIO` from a config constant to a hardcoded literal elsewhere in the code — it must remain centrally defined in `config.py`.
- Do not add features not traceable to a line in `prd.md` or an approved entry in `tasks.md`. If a feature seems useful but isn't specified, propose it — don't build it speculatively.

## Error Handling Standard
- User-facing errors: clear, one-line, no stack traces printed to the CLI.
- Internal/unexpected errors: allow the exception to propagate with a full traceback during development; wrap with user-friendly messaging only once the code path is stable, not before.
