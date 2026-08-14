# Master Prompt for AI Food Scanner & Nutrition Coach App Development

## Project Overview

Develop a cross-platform mobile application (iOS and Android) named "AI Food Scanner & Nutrition Coach." The app will allow users to scan food items (via image recognition or barcode) to instantly retrieve detailed nutritional information and receive personalized nutrition coaching. The goal is to empower users to make informed dietary choices, manage dietary restrictions, and achieve health and fitness goals.

## Core Functionality

1.  **User Authentication & Profile Management:** Secure registration, login, and comprehensive user profiles including personal data, dietary preferences, allergies, and health goals.
2.  **Food Scanning:**
    *   **Image Recognition:** AI-powered identification of food items from photos.
    *   **Barcode Scanning:** Retrieval of nutritional data from packaged food barcodes.
3.  **Nutritional Information Display:** Detailed breakdown of calories, macronutrients, micronutrients, ingredients, and allergen/dietary flagging.
4.  **Nutrition Coaching:** Personalized recommendations, meal planning assistance, and progress tracking based on user profiles and logged meals.

## Technical Stack

*   **Mobile Frontend:** React Native, TypeScript, TailwindCSS, Redux Toolkit.
*   **Backend (API/Business Logic):** Node.js, Express.js.
*   **Backend (AI/ML):** Python, FastAPI, TensorFlow/PyTorch.
*   **Databases:** PostgreSQL (relational data), MongoDB (food item data).
*   **Cloud Platform:** AWS (EC2, S3, RDS, Lambda, SageMaker, API Gateway, SQS/SNS).

## Documentation Provided

Refer to the following Markdown files for detailed specifications:

*   `PRD.md`: Project Requirements Document
*   `Architecture.md`: Application Architecture
*   `Rules.md`: AI Development Rules and Guidelines
*   `Phases.md`: Project Development Phases
*   `Design.md`: Visual Design Guidelines (Colors, Typography, Theme)
*   `Memory.md`: AI's Persistent Memory (to be updated during development)
*   `agent.md`: AI Agent Definition, Role, and Instructions
*   `decisions.md`: Rationale for Technical and Design Decisions
*   `tasks.md`: Dynamic Roadmap and Task Tracking
*   `BackendSchema.md`: Database Structure, API Endpoints, Data Models
*   `UI_UX_Design_Brief.md`: Visual Style Guide, Component Specs, Interaction Patterns
*   `App_Flow_Document.md`: Screen-to-Screen Navigation, User Journeys
*   `TRD.md`: Technical Requirements Document

## Instructions for AI Agent

*   **Adhere strictly** to all specifications and guidelines provided in the accompanying documentation files.
*   **Prioritize** security, performance, scalability, and maintainability throughout the development process.
*   **Utilize** the `Memory.md`, `decisions.md`, and `tasks.md` files to maintain context, track progress, and record all significant technical and design choices.
*   **Follow** the iterative development approach outlined in `Phases.md`.
*   **Ensure** all code is clean, well-documented, and testable.
*   **Communicate** proactively regarding progress, challenges, and any deviations from the plan.
*   **The ultimate goal** is to deliver a robust, user-friendly, and high-performing AI Food Scanner & Nutrition Coach application.

## Next Steps

Proceed with Phase 1 of the development as outlined in `Phases.md`, focusing on Core Mobile App & User Authentication, referring to `Architecture.md`, `BackendSchema.md`, `UI_UX_Design_Brief.md`, and `TRD.md` for detailed implementation guidance.
