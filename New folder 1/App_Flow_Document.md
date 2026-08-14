# App Flow Document for AI Food Scanner & Nutrition Coach App

This document outlines the screen-to-screen navigation, user decision trees, state transitions, and end-to-end workflow sequences for the AI Food Scanner & Nutrition Coach application. It serves as a guide for development, ensuring a consistent and intuitive user experience.

## 1. User Onboarding Flow

```mermaid
graph TD
    A[App Launch] --> B{First Time User?}
    B -- Yes --> C[Welcome Screen]
    C --> D[Sign Up / Login Screen]
    D -- Sign Up --> E[Registration Form]
    E --> F[Create Profile: Personal Info]
    F --> G[Create Profile: Dietary Preferences]
    G --> H[Create Profile: Health Goals]
    H --> I[Home Screen (Logged In)]
    B -- No --> D
    D -- Login --> I
```

*   **A: App Launch:** User opens the application.
*   **B: First Time User?:** System checks if the user has an existing session or profile.
*   **C: Welcome Screen:** Displays app benefits and calls to action for new users.
*   **D: Sign Up / Login Screen:** Allows existing users to log in or new users to initiate registration.
*   **E: Registration Form:** Collects basic user credentials (email, password).
*   **F: Create Profile: Personal Info:** Gathers demographic data (age, gender, height, weight).
*   **G: Create Profile: Dietary Preferences:** Collects dietary restrictions, allergies, and preferences.
*   **H: Create Profile: Health Goals:** Sets user health objectives (e.g., weight loss, muscle gain).
*   **I: Home Screen (Logged In):** Main dashboard for authenticated users.

## 2. Food Scanning & Logging Flow

```mermaid
graph TD
    A[Home Screen] --> B{Scan Food Action}
    B -- Tap Scan Icon --> C[Scan Options (Camera/Barcode)]
    C -- Select Camera --> D[Camera View]
    D -- Take Photo --> E[Image Processing (Backend)]
    E -- AI Identifies Food --> F[Scan Results Screen]
    C -- Select Barcode --> G[Barcode Scanner View]
    G -- Scan Barcode --> H[Barcode Processing (Backend)]
    H -- Retrieve Data --> F
    F --> I{Log Meal?}
    I -- Yes --> J[Log Meal Form (Portion, Meal Type)]
    J --> K[Meal Logged Confirmation]
    K --> A
    I -- No --> A
```

*   **A: Home Screen:** User initiates food scanning.
*   **B: Scan Food Action:** User taps a dedicated scan button/icon.
*   **C: Scan Options:** Presents choices: use camera for image recognition or barcode scanner.
*   **D: Camera View:** Activates device camera for food image capture.
*   **E: Image Processing (Backend):** Uploads image to backend AI for identification.
*   **F: Scan Results Screen:** Displays identified food, nutritional information, and coaching tips.
*   **G: Barcode Scanner View:** Activates device camera for barcode scanning.
*   **H: Barcode Processing (Backend):** Sends barcode to backend for database lookup.
*   **I: Log Meal?:** User decides whether to log the scanned food.
*   **J: Log Meal Form:** Allows user to specify portion size and meal type.
*   **K: Meal Logged Confirmation:** Confirms successful logging and returns to Home Screen.

## 3. Progress Tracking & Coaching Flow

```mermaid
graph TD
    A[Home Screen] --> B[Navigation: Progress/Dashboard]
    B --> C[Progress Dashboard Screen]
    C --> D{View Details?}
    D -- View Meal History --> E[Meal History Screen]
    E --> F[Meal Detail Screen]
    D -- View Nutritional Summary --> G[Nutritional Summary Screen (Charts)]
    C --> H[Coaching Tips Section]
    H --> I[Coaching Detail Screen]
    I --> C
```

*   **A: Home Screen:** User navigates to progress section.
*   **B: Navigation: Progress/Dashboard:** User selects the progress or dashboard tab/menu item.
*   **C: Progress Dashboard Screen:** Displays an overview of nutritional intake, goal progress, and recent coaching tips.
*   **D: View Details?:** User can choose to dive deeper into specific data.
*   **E: Meal History Screen:** Lists all logged meals chronologically.
*   **F: Meal Detail Screen:** Shows detailed information for a selected logged meal.
*   **G: Nutritional Summary Screen:** Presents visual charts and graphs of nutritional intake over time.
*   **H: Coaching Tips Section:** Displays personalized coaching advice on the dashboard.
*   **I: Coaching Detail Screen:** Provides more in-depth explanation and actionable steps for a specific coaching tip.
