# decisions.md — Technical Decision Log

Format: **Decision — Date/Phase — Rationale — What would change it**

---

### D1: Drop SQLAlchemy, keep raw `sqlite3`
- **Context:** `requirements.txt` declares SQLAlchemy 2.0.27; `database/connection.py` uses raw `sqlite3`. Only one can be the real answer.
- **Decision:** Standardize on raw `sqlite3`. Remove SQLAlchemy from `requirements.txt` in Phase 4.
- **Rationale:** One table (`measurements`), no relationships, no migrations. An ORM's value proposition (relationship management, migration tooling, query builder safety) doesn't apply at this scale. Raw `sqlite3` is fewer moving parts for the same job.
- **What would change this:** If the schema grows to multiple related tables (e.g., separate `exercises`, `sessions`, `sets` tables with foreign keys) or multi-user support is added, revisit — that's the threshold where an ORM starts earning its overhead.

### D2: Golden ratio (1.618) as the fixed aesthetic target
- **Context:** `config.py` hardcodes `IDEAL_WAIST_TO_SHOULDER_RATIO = 1.618`, framed as a universal target.
- **Decision:** Keep it as a single config constant, not a per-user computed value, for now.
- **Rationale:** Simplicity for v1; matches common bodybuilding heuristics (the "Adonis Index" popularized in fitness circles uses this same ratio as a target). It is a heuristic, not a physiologically derived number — it doesn't account for frame size, height, or individual bone structure, so treat it as a rough guidepost in any user-facing copy, not a definitive target.
- **What would change this:** If the app adds per-user anthropometric calculations (e.g., adjusting target ratio by wrist/ankle frame size), this becomes a computed field per `UserProfile` rather than a global constant.

### D3: CLI interface, not GUI or web
- **Context:** PRD and README both describe this as a CLI application.
- **Decision:** Stay CLI-only through the phases defined in `Phases.md`.
- **Rationale:** Matches stated scope; avoids the significant added complexity of a UI layer (state management, rendering, styling) for what's currently a personal tracking tool.
- **What would change this:** An explicit new PRD requesting a GUI or web frontend — not an incremental addition to the current one.

### D4: Pydantic models are binding, not decorative
- **Context:** `WorkoutGenerator` currently returns a raw `dict`, bypassing the `WorkoutSession`/`Exercise` models defined in `models/workout.py`.
- **Decision:** Treat this as a bug to fix in Phase 2, not a signal to delete the unused models.
- **Rationale:** The models encode the intended data contract (exercise name, target group, sets, reps, weight). Routing service output through them is what makes validation errors visible instead of silent — deleting them to match the current dict-based implementation would be optimizing for the bug instead of the fix.
- **What would change this:** If a deliberate decision is made to keep the app schema-loose, this should be a documented reversal here, not a quiet drift.
