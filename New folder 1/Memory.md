# Memory for AI Food Scanner & Nutrition Coach App Development

This document serves as a persistent memory for the AI agent, tracking progress, key decisions, and contextual information during the development of the AI Food Scanner & Nutrition Coach app. It will be updated as the AI begins coding and progresses through the project phases to ensure continuity and prevent loss of context.

## Current Development State:

*   **Phase:** Phase 1 Completed / Phase 2 Preparation
*   **Last Action:** Built full AI Nutrition & Fitness Coach View (`AICoachView.tsx`), integrated Workout & 3D Muscle Anatomy Explorer (`WorkoutView.tsx`), updated Navigation shell, and verified clean TypeScript production build.
*   **Key Learnings/Decisions:** 
    - AI Coach provides real-time context on TDEE, protein deficit, and daily budget constraints (INR).
    - Food suggestions returned by AI Coach can be directly logged to the daily meal tracker in one click.

## Pending Tasks for AI:

*   Backend Supabase API endpoint integration
*   Native mobile bundle wrapping (Capacitor/React Native)

## Codebase Overview:

*   `src/components/DashboardView.tsx`: Core dashboard with TDEE, macros & meal logs
*   `src/components/CustomMealPlanner.tsx`: Indian budget meal planner with Glycemic Index warnings
*   `src/components/FoodScannerView.tsx`: AI image & barcode food scanner
*   `src/components/AICoachView.tsx`: Interactive AI nutrition & budget coach chatbot
*   `src/components/WorkoutView.tsx` & `MuscleAnatomyExplorer.tsx`: 3D Muscle Anatomy Map & exercise logger
*   `src/components/AnalyticsView.tsx`: Micro/macro analytics & daily tracking graphs
