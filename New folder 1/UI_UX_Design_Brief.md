# UI/UX Design Brief for AI Food Scanner & Nutrition Coach App

This document provides a comprehensive UI/UX design brief for the AI Food Scanner & Nutrition Coach application, detailing the visual style guide, component specifications, interaction patterns, accessibility standards, and key user journey touchpoints. It builds upon the foundational `Design.md` and `PRD.md` documents.

## 1. Visual Style Guide

### 1.1 Brand Personality

*   **Keywords:** Empowering, Trustworthy, Modern, Clean, Friendly, Efficient.
*   **Overall Feel:** The app should feel supportive and easy to use, promoting healthy habits without being overly prescriptive or intimidating.

### 1.2 Color Palette

(Refer to `Design.md` for detailed hex codes and usage.)

*   **Primary:** Green (health, growth, freshness)
*   **Secondary:** Blue (trust, clarity, technology)
*   **Accent:** Orange (energy, action, warning)
*   **Neutrals:** Various shades of gray and white for backgrounds, text, and borders to ensure readability and a clean aesthetic.

### 1.3 Typography

(Refer to `Design.md` for detailed font families, weights, and sizing examples.)

*   **Headings:** Montserrat (Bold, Semi-Bold) - Strong, modern, and impactful.
*   **Body Text:** Open Sans (Regular, Semi-Bold) - Highly readable, friendly, and versatile for informational content.

### 1.4 Iconography

*   **Style:** Minimalist line icons, consistent in weight and style.
*   **Purpose:** To visually represent actions, categories, and information clearly and concisely.
*   **Examples:** Camera icon for scanning, magnifying glass for search, person icon for profile, leaf icon for healthy options.

### 1.5 Imagery & Illustrations

*   **Photography:** High-quality, realistic images of food items for scan results. Focus on clarity and appeal.
*   **Illustrations:** Simple, friendly, and informative illustrations for onboarding, empty states, and educational content. Avoid overly complex or cartoonish styles.

## 2. Component Specifications

### 2.1 Buttons

*   **Primary Action:** Filled button with Primary Green background, white text. Rounded corners (e.g., 8px radius).
*   **Secondary Action:** Outlined button with Primary Green border, Primary Green text, transparent background.
*   **Destructive Action:** Filled button with red background, white text.
*   **States:** Default, Hover/Pressed (slightly darker shade), Disabled (Light Gray background, Medium Gray text).

### 2.2 Input Fields

*   **Style:** Light Gray background, Medium Gray border (1px). Rounded corners (e.g., 4px radius).
*   **States:** Default, Focus (Primary Green border), Error (red border, error message below).
*   **Placeholder Text:** Medium Gray.

### 2.3 Cards

*   **Usage:** Displaying food scan results, meal log entries, coaching tips.
*   **Style:** White background, subtle shadow (e.g., `box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1)`), rounded corners (e.g., 8px radius).
*   **Content Layout:** Clear hierarchy with prominent food name, key nutritional highlights, and action buttons.

### 2.4 Navigation Bars

*   **Bottom Tab Bar:** White background, subtle top border. Active icon/label in Primary Green, inactive in Medium Gray.
*   **Top App Bar (Header):** White background, clear title (H1/H2 typography), and relevant action icons (e.g., settings, back).

## 3. Interaction Patterns

*   **Feedback:** Provide immediate visual and haptic feedback for user actions (e.g., button presses, successful scans).
*   **Loading States:** Use subtle animations (e.g., skeleton loaders, spinners) for data loading to manage user expectations.
*   **Error Handling:** Clear, concise, and actionable error messages. Guide users on how to resolve issues.
*   **Gestures:** Standard mobile gestures (tap, swipe, pinch-to-zoom for images) should be intuitive and consistent.

## 4. Accessibility Standards

*   **Color Contrast:** Adhere to WCAG 2.1 AA standards for text and interactive elements (minimum contrast ratio of 4.5:1 for small text, 3:1 for large text).
*   **Font Sizing:** Allow for dynamic type scaling. Ensure minimum font size of 12px for critical information.
*   **Touch Targets:** Minimum touch target size of 48x48 dp for all interactive elements.
*   **Screen Reader Support:** Implement proper semantic HTML/React Native accessibility props for all UI elements, ensuring clear labels and roles.
*   **Alternative Text:** Provide descriptive alt text for all informative images.

## 5. User Journey Touchpoints

### 5.1 Onboarding & Setup

*   **Screens:** Welcome, Sign Up/Login, Profile Creation (Personal Info, Dietary Preferences, Goals).
*   **Experience:** Guided, clear steps with progress indicators. Use friendly illustrations and clear microcopy.

### 5.2 Food Scanning & Information Retrieval

*   **Screens:** Camera View, Barcode Scanner, Scan Results (Nutritional Info Display).
*   **Experience:** Fast, responsive camera. Clear instructions for scanning. Instantaneous display of results with key information highlighted.

### 5.3 Meal Logging

*   **Screens:** Scan Results (Log Meal action), Meal Log Entry Form.
*   **Experience:** Simple, quick logging process. Pre-fill data where possible. Easy to adjust portion sizes.

### 5.4 Nutrition Coaching & Progress Tracking

*   **Screens:** Dashboard (Summary), Coaching Tips, Progress Charts, Meal History.
*   **Experience:** Engaging and encouraging. Visual representation of progress. Actionable coaching advice. Easy navigation to historical data.
