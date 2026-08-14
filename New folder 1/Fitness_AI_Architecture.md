# AI Fitness System Architecture

## Overview

An AI-powered fitness platform composed of specialized agents that
collaborate to generate personalized diet plans, workout plans, grocery
lists, supplement advice, progress tracking, and downloadable PDFs.

## Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

### Backend

-   Python
-   FastAPI

### AI

-   OpenAI Responses API
-   LangGraph (optional)
-   Pydantic AI (optional)

### Database

-   PostgreSQL
-   Redis
-   Supabase Auth

### Storage

-   Supabase Storage or AWS S3

### PDF Generation

-   ReportLab
-   WeasyPrint

## Folder Structure

``` text
fitness-ai/
├── frontend/
├── backend/
│   ├── api/
│   ├── agents/
│   │   ├── nutrition_agent.py
│   │   ├── workout_agent.py
│   │   ├── medical_agent.py
│   │   ├── supplement_agent.py
│   │   ├── grocery_agent.py
│   │   ├── progress_agent.py
│   │   └── pdf_agent.py
│   ├── models/
│   ├── prompts/
│   ├── database/
│   └── main.py
└── README.md
```

## AI Agents

### User Profile Agent

Collects: - Personal information - Goals - Medical history - Budget -
Lifestyle - Blood reports

### Medical Analysis Agent

Analyzes: - CBC - Kidney function - Liver function - Lipid profile -
Blood sugar - Safety risks

### Nutrition Agent

Generates: - Calories - Macronutrients - Daily meal plan - Weekly meal
schedule - Grocery list - Budget optimization - Hydration

### Workout Agent

Generates: - Weekly split - Exercises - Sets - Reps - Rest -
Progression - Cardio - Mobility

### Supplement Agent

Recommends evidence-based supplements based on goals, medical history,
and budget.

### Grocery Planner Agent

Creates monthly and weekly shopping lists with estimated costs.

### Progress Tracking Agent

Tracks: - Weight - Measurements - Strength - Photos - Workout logs -
Calorie adjustments

### PDF Generator Agent

Creates: - Diet PDF - Workout PDF - Grocery PDF - Progress Report PDF

## API Endpoints

-   POST /analyze-report
-   POST /generate-diet
-   POST /generate-workout
-   POST /generate-pdf
-   POST /weekly-checkin
-   GET /progress
-   GET /shopping-list

## Database Tables

-   Users
-   MedicalHistory
-   BloodReports
-   WorkoutPlans
-   DietPlans
-   Supplements
-   ProgressLogs
-   Measurements
-   Photos

## AI Workflow

1.  User Profile
2.  Medical Analysis
3.  Risk Detection
4.  Nutrition Planning
5.  Workout Generation
6.  Supplement Planning
7.  Budget Optimization
8.  Grocery Planning
9.  PDF Generation
10. Progress Tracking

## Example Nutrition Prompt

Generate: - Calories - Macronutrients - Meal plan - Grocery list -
Budget - Hydration - Safety notes

Return structured JSON.

## Example Workout Prompt

Generate: - Weekly workout split - Exercises - Sets - Reps - Rest -
Tempo - Cardio - Mobility - Progression

Return structured JSON.
