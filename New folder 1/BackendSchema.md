# Backend Schema for AI Food Scanner & Nutrition Coach App

This document details the backend schema for the AI Food Scanner & Nutrition Coach application, covering database structure, entity relationships, API endpoints, data models, and storage architecture.

## 1. Database Schema (PostgreSQL & MongoDB)

### 1.1 PostgreSQL (Relational Data)

**Users Table**

| Column Name    | Data Type          | Constraints               | Description                                  |
| :------------- | :----------------- | :------------------------ | :------------------------------------------- |
| `user_id`      | UUID               | PRIMARY KEY, NOT NULL     | Unique identifier for the user               |
| `email`        | VARCHAR(255)       | UNIQUE, NOT NULL          | User's email address                         |
| `password_hash`| VARCHAR(255)       | NOT NULL                  | Hashed password                              |
| `first_name`   | VARCHAR(100)       |                           | User's first name                            |
| `last_name`    | VARCHAR(100)       |                           | User's last name                             |
| `date_of_birth`| DATE               |                           | User's date of birth                         |
| `gender`       | VARCHAR(10)        |                           | User's gender                                |
| `height_cm`    | INTEGER            |                           | User's height in centimeters                 |
| `weight_kg`    | DECIMAL(5,2)       |                           | User's weight in kilograms                   |
| `activity_level`| VARCHAR(50)        |                           | User's activity level (e.g., 'sedentary')    |
| `created_at`   | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()             | Timestamp of user creation                   |
| `updated_at`   | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()             | Timestamp of last update                     |

**DietaryPreferences Table**

| Column Name    | Data Type          | Constraints               | Description                                  |
| :------------- | :----------------- | :------------------------ | :------------------------------------------- |
| `preference_id`| UUID               | PRIMARY KEY, NOT NULL     | Unique identifier for the preference         |
| `user_id`      | UUID               | FOREIGN KEY (Users)       | User associated with this preference         |
| `type`         | VARCHAR(50)        | NOT NULL                  | Type of preference (e.g., 'vegan', 'allergy')|
| `value`        | VARCHAR(255)       | NOT NULL                  | Specific preference (e.g., 'gluten', 'peanut')|

**MealLogs Table**

| Column Name    | Data Type          | Constraints               | Description                                  |
| :------------- | :----------------- | :------------------------ | :------------------------------------------- |
| `log_id`       | UUID               | PRIMARY KEY, NOT NULL     | Unique identifier for the meal log           |
| `user_id`      | UUID               | FOREIGN KEY (Users)       | User who logged the meal                     |
| `food_item_id` | UUID               | FOREIGN KEY (FoodItems)   | ID of the food item (from MongoDB)           |
| `meal_type`    | VARCHAR(50)        |                           | Type of meal (e.g., 'breakfast', 'lunch')    |
| `portion_size` | DECIMAL(5,2)       |                           | Portion size in grams or units               |
| `logged_at`    | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()             | Timestamp when meal was logged               |

### 1.2 MongoDB (Document-based Food Data)

**FoodItems Collection**

```json
{
  "_id": "<UUID>",
  "name": "Apple",
  "barcode": "0012345678905",
  "image_url": "https://example.com/apple.jpg",
  "nutritional_info": {
    "calories": 95,
    "protein_g": 0.5,
    "carbs_g": 25,
    "fat_g": 0.3,
    "fiber_g": 4.4,
    "sugar_g": 19,
    "vitamins": {
      "C_mg": 8.4,
      "A_iu": 50
    },
    "minerals": {
      "potassium_mg": 195,
      "iron_mg": 0.1
    }
  },
  "ingredients": [
    "Apple"
  ],
  "allergens": [],
  "dietary_tags": [
    "vegan",
    "vegetarian",
    "gluten-free"
  ],
  "source": "USDA FoodData Central",
  "last_updated": "2023-07-28T10:00:00Z"
}
```

## 2. API Endpoints

### 2.1 Authentication & User Management

*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Authenticate user and return JWT.
*   `GET /api/users/me`: Get current user profile.
*   `PUT /api/users/me`: Update current user profile.
*   `POST /api/users/me/preferences`: Add dietary preferences.
*   `GET /api/users/me/preferences`: Get dietary preferences.

### 2.2 Food Scanning & Nutrition

*   `POST /api/food/scan/image`: Upload image for food recognition.
    *   **Request:** `multipart/form-data` with image file.
    *   **Response:** `FoodItem` object (or list of potential matches).
*   `GET /api/food/scan/barcode/{barcode}`: Get nutritional info by barcode.
    *   **Response:** `FoodItem` object.
*   `GET /api/food/{food_item_id}`: Get detailed nutritional info for a specific food item.
    *   **Response:** `FoodItem` object.

### 2.3 Meal Logging & Coaching

*   `POST /api/meals`: Log a new meal.
*   `GET /api/meals`: Get user's meal history.
*   `GET /api/meals/summary`: Get daily/weekly/monthly nutritional summary.
*   `GET /api/coach/recommendations`: Get personalized nutrition recommendations.

## 3. Storage Architecture

*   **User Data & Relational Data:** Stored in PostgreSQL RDS instance on AWS.
*   **Food Item Documents:** Stored in MongoDB Atlas (or self-hosted on EC2) on AWS.
*   **User-uploaded Images:** Stored in AWS S3 buckets, with URLs referenced in the `FoodItems` collection or `MealLogs` table.
*   **AI/ML Models:** Stored in AWS S3 and served via AWS SageMaker endpoints or FastAPI application on EC2. 

## 4. Data Models (Simplified Pydantic/TypeScript Interfaces)

```typescript
// User Profile
interface User {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO 8601 date string
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: string;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

// Dietary Preference
interface DietaryPreference {
  preferenceId: string;
  userId: string;
  type: string; // e.g., 'vegan', 'allergy'
  value: string; // e.g., 'gluten', 'peanut'
}

// Nutritional Information (partial)
interface NutritionalInfo {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  // ... other nutrients
}

// Food Item (from MongoDB)
interface FoodItem {
  _id: string;
  name: string;
  barcode?: string;
  imageUrl?: string;
  nutritionalInfo: NutritionalInfo;
  ingredients: string[];
  allergens: string[];
  dietaryTags: string[];
  source: string;
  lastUpdated: string; // ISO 8601 datetime string
}

// Meal Log
interface MealLog {
  logId: string;
  userId: string;
  foodItemId: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portionSize?: number;
  loggedAt: string; // ISO 8601 datetime string
}
```
