# Product Requirement Document (PRD) — v1.1

## Changelog from v1.0
This revision resolves three defects identified during architecture review (full rationale in `decisions.md`, `Architecture.md`):
1. **Dependency conflict resolved:** `SQLAlchemy` removed from `requirements.txt` — it was declared but never implemented; `database/connection.py` uses raw `sqlite3` and that's now the documented standard (decisions.md D1).
2. **Validation gap closed:** `main.py` option 2 now routes waist/shoulder input through `validate_circumference()` before computing the ratio, instead of dividing raw unchecked floats.
3. **Model/service mismatch closed:** `WorkoutGenerator` now returns `WorkoutSession`/`Exercise` objects as originally modeled, not a bare `dict` — and `tabulate` (previously an unused dependency) is now wired in to render that output.

Progression logic (`ProgressionEngine` reading real logged history rather than printing a static rule) remains a **Phase 3 stub** in this revision, not a v1.1 deliverable — see `Phases.md`. Marking it explicitly rather than letting it look finished but behave like a placeholder.

---

## 1. Project Overview
A single-user, local CLI application for planning and tracking an aesthetic V-Taper / X-Frame physique. Users generate structured workout routines, log body measurements, and (from Phase 3 onward) receive progression recommendations based on logged training history rather than static rules.

**Explicit non-goals** (carried forward from `TRD.md` §7): no web or mobile UI, no cloud sync, no multi-user support, no third-party wearable integrations. Flag any of these before building — they are not implicit backlog items.

## 2. System Architecture & Directory Structure

```text
aesthetic-physique-tracker/
├── README.md
├── requirements.txt
├── config.py
├── main.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── workout.py
│   └── metrics.py
├── database/
│   ├── __init__.py
│   └── connection.py
├── services/
│   ├── __init__.py
│   ├── workout_generator.py
│   └── progression_engine.py
└── utils/
    ├── __init__.py
    └── validators.py
```

No structural changes from v1.0 — the fix is in what each file *does*, not the layout.

---

## 3. Comprehensive File Specifications

### File: `requirements.txt`
```text
pydantic==2.6.1
tabulate==0.9.0
```
`SQLAlchemy` removed (decisions.md D1). `tabulate` retained and now actually imported in `main.py`.

### File: `config.py`
```python
import os

DATABASE_NAME = "physique_tracker.db"
DB_PATH = os.path.join(os.path.dirname(__file__), DATABASE_NAME)

# Aesthetic targets configuration
# Note: 1.618 is a bodybuilding heuristic (the "Adonis Index"), not a
# physiologically derived value — it doesn't account for frame size or height.
IDEAL_WAIST_TO_SHOULDER_RATIO = 1.618

VERSION = "1.1.0"
DEBUG = False
```

### File: `main.py`
```python
import sys
from tabulate import tabulate

from database.connection import init_db, save_measurement
from services.progression_engine import ProgressionEngine
from services.workout_generator import WorkoutGenerator
from utils.validators import validate_circumference

VALID_EXPERIENCE_LEVELS = {"beginner", "intermediate", "advanced"}


def main():
    init_db()

    print("=" * 50)
    print("  AESTHETIC PHYSIQUE TRACKER & ANALYSER v1.1.0")
    print("=" * 50)
    print("1. Generate Aesthetic Workout Routine")
    print("2. Check V-Taper Metric Status")
    print("3. Log Workout & Calculate Progressive Overload")
    print("4. Exit")
    print("-" * 50)

    choice = input("Select an option: ").strip()

    if choice == "1":
        experience = input(
            "Enter experience level (beginner/intermediate/advanced): "
        ).lower().strip()
        if experience not in VALID_EXPERIENCE_LEVELS:
            print(f"Invalid experience level. Must be one of: {', '.join(VALID_EXPERIENCE_LEVELS)}")
            return

        sessions = WorkoutGenerator.generate_v_taper_split(experience)
        for session in sessions:
            print(f"\n{session.day_name}")
            rows = [[ex.target_group, ex.name, ex.sets, ex.reps] for ex in session.exercises]
            print(tabulate(rows, headers=["Target Group", "Exercise", "Sets", "Reps"]))

    elif choice == "2":
        try:
            waist = float(input("Enter waist circumference (inches): "))
            shoulders = float(input("Enter shoulder circumference (inches): "))
        except ValueError:
            print("Please enter numeric values.")
            return

        if not (validate_circumference(waist) and validate_circumference(shoulders)):
            print("Circumference values must be greater than 0 and no more than 100 inches.")
            return

        ratio = shoulders / waist
        print(f"\nYour current Shoulder-to-Waist ratio is: {ratio:.3f}")
        print("Golden Aesthetic Target: 1.618 (heuristic guidepost, not a strict target)")
        save_measurement(shoulders, waist)

    elif choice == "3":
        print("\nCalculating next session metrics...")
        ProgressionEngine.calculate_next_load()

    else:
        print("Exiting application.")
        sys.exit()


if __name__ == "__main__":
    main()
```

### File: `models/__init__.py`
```python
# Empty file to initialize models module package
```

### File: `models/user.py`
```python
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    username: str
    experience_level: str = Field(description="Must be beginner, intermediate, or advanced")
    current_weight_kg: float
    body_fat_percentage: float
```
Unchanged from v1.0. Not yet instantiated in `main.py` — deferred to Phase 2 (`tasks.md`), since v1.1 validates experience level against the allowed set directly rather than via the full model. Wiring the model in is tracked, not abandoned.

### File: `models/workout.py`
```python
from pydantic import BaseModel
from typing import List

class Exercise(BaseModel):
    name: str
    target_group: str  # e.g., "Side Delts", "Lats", "Upper Chest"
    sets: int
    reps: str
    weight_lbs: float

class WorkoutSession(BaseModel):
    day_name: str
    exercises: List[Exercise]
```
Unchanged — but now actually on the call path from `services/workout_generator.py` (see below), which was the defect this revision fixes.

### File: `models/metrics.py`
```python
from pydantic import BaseModel
from datetime import datetime

class PhysiqueMetrics(BaseModel):
    date: datetime = datetime.now()
    shoulder_circumference_in: float
    waist_circumference_in: float
    chest_circumference_in: float
    arm_circumference_in: float
```
Unchanged. Not yet instantiated in `main.py` option 2 — `save_measurement()` currently takes raw floats directly. Full model wiring is Phase 2 scope; flagging rather than silently leaving it inconsistent.

### File: `database/__init__.py`
```python
# Empty file to initialize database module package
```

### File: `database/connection.py`
```python
import sqlite3
from datetime import datetime

from config import DB_PATH


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS measurements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_date TEXT,
            shoulders REAL,
            waist REAL
        )
    ''')
    conn.commit()
    conn.close()


def save_measurement(shoulders: float, waist: float) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO measurements (log_date, shoulders, waist) VALUES (?, ?, ?)",
        (datetime.now().isoformat(), shoulders, waist),
    )
    conn.commit()
    conn.close()
```
`save_measurement()` is new in v1.1 — this is what closes the "nothing persists" gap flagged in `Architecture.md` §3. A `get_measurement_history()` read-path is Phase 1 backlog (`tasks.md`), not yet included here.

### File: `services/__init__.py`
```python
# Empty file to initialize services module package
```

### File: `services/workout_generator.py`
```python
from models.workout import Exercise, WorkoutSession


class WorkoutGenerator:
    @staticmethod
    def generate_v_taper_split(experience_level: str) -> list[WorkoutSession]:
        return [
            WorkoutSession(
                day_name="Day 1: Upper Frame Width",
                exercises=[
                    Exercise(name="Cable Lateral Raises", target_group="Side Delts", sets=4, reps="12-15", weight_lbs=0.0),
                    Exercise(name="Wide-Grip Pull-Ups", target_group="Lats", sets=4, reps="6-10", weight_lbs=0.0),
                    Exercise(name="Incline Dumbbell Press", target_group="Upper Chest", sets=3, reps="8-12", weight_lbs=0.0),
                ],
            ),
            WorkoutSession(
                day_name="Day 2: Lower X-Frame Base",
                exercises=[
                    Exercise(name="Barbell Squats", target_group="Quads", sets=4, reps="8-10", weight_lbs=0.0),
                    Exercise(name="Romanian Deadlifts", target_group="Hamstrings", sets=3, reps="10-12", weight_lbs=0.0),
                    Exercise(name="Standing Calf Raises", target_group="Calves", sets=4, reps="12-15", weight_lbs=0.0),
                ],
            ),
            WorkoutSession(
                day_name="Day 3: Arms & Aesthetic Details",
                exercises=[
                    Exercise(name="Hammer Curls", target_group="Brachialis/Forearm", sets=3, reps="10-12", weight_lbs=0.0),
                    Exercise(name="Tricep Pushdowns", target_group="Triceps", sets=3, reps="10-12", weight_lbs=0.0),
                    Exercise(name="Hanging Leg Raises", target_group="Core", sets=3, reps="10-15", weight_lbs=0.0),
                ],
            ),
        ]
```
This is the core fix in this revision: return type is now `list[WorkoutSession]`, matching `models/workout.py`, instead of a bare `dict[str, list[str]]`. `experience_level` is accepted but not yet used to vary volume/exercise selection — that's real, tracked scope (Phase 2/3 stretch), not something this PRD claims is already handled.

### File: `services/progression_engine.py`
```python
class ProgressionEngine:
    @staticmethod
    def calculate_next_load():
        print("[Engine] Session auto-regulated.")
        print("[Engine] Rule Applied: If top rep target is met, increase load by 2.5% to 5% next week.")
```
**Unchanged from v1.0 — explicitly marked as a Phase 3 stub in this revision, not a defect being carried silently.** It has no arguments and reads no state because there is no workout-log table yet (only `measurements` exists, which stores body metrics, not lifted weights/reps). Building that table and wiring real history into this function is Phase 3 scope in `Phases.md`.

### File: `utils/__init__.py`
```python
# Empty file to initialize utils module package
```

### File: `utils/validators.py`
```python
def validate_circumference(value: float) -> bool:
    if value <= 0 or value > 100:
        return False
    return True
```
Unchanged — but now actually called from `main.py`, which is the fix this revision makes.

---

## 4. Traceability
Every code change in this revision maps to an entry in `decisions.md` (D1) or a defect noted in `Architecture.md` §3. Nothing here was changed on aesthetic preference alone — if a future revision wants to change something not tied to a recorded defect or decision, add the decision first, then the code.
