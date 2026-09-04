import os
import math
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

load_dotenv()

# ==============================================================================
# 1. Structured Schemas for Gemini Nutrition Extraction
# ==============================================================================

class IngredientBreakdown(BaseModel):
    name: str = Field(description="Name of the food item or ingredient")
    weight_g: float = Field(description="Estimated weight in grams (specify raw vs cooked)")
    protein_g: float = Field(description="Protein in grams")
    carbs_g: float = Field(description="Total carbohydrates in grams")
    fats_g: float = Field(description="Total fats in grams")
    fiber_g: float = Field(description="Dietary fiber in grams")
    saturated_fat_g: float = Field(default=0.0, description="Saturated fat in grams")


class MealExtractionResponse(BaseModel):
    items: List[IngredientBreakdown]
    glycemic_index: int = Field(description="Estimated Glycemic Index (0-100)")
    glycemic_index_label: str = Field(description="'Low', 'Medium', or 'High'")
    nova_group: str = Field(description="NOVA group classification (e.g., 'Group 1', 'Group 2')")


class AdaptiveTargetsRequest(BaseModel):
    daily_calories_14d: List[float] = Field(..., min_length=14, description="At least 14 days of logged daily calories")
    daily_weights_kg_14d: List[float] = Field(..., min_length=14, description="At least 14 days of logged body weight (kg)")
    goal_phase: str = Field(default="fat_loss", description="'fat_loss', 'maintenance', or 'bulk'")
    baseline_tdee: Optional[int] = Field(default=None, description="Optional baseline TDEE for safety clamping")


# ==============================================================================
# 2. Complete Nutrition & Adaptive Metabolic Engine
# ==============================================================================

class RealWorldNutritionEngine:
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=key) if key else None
        # Using gemini-3.6-flash which is active and tested with the provided API key
        self.model_id = "gemini-3.6-flash"

    # --------------------------------------------------------------------------
    # Part A: Robust Meal Nutrition Parser (Deterministic Math)
    # --------------------------------------------------------------------------
    def analyze_meal(self, meal_text: str) -> Dict[str, Any]:
        """
        Parses meal text and strictly derives total calories from (P*4 + C*4 + F*9).
        """
        if not self.client:
            raise ValueError("GEMINI_API_KEY is not set. Please configure your API key.")

        system_instruction = (
            "You are a clinical dietary analysis system. Break down the user's logged meal "
            "into ingredients with portion weights in grams. Ground values on standard nutritional "
            "databases (e.g., USDA FoodData / IFCT). "
            "Account for hidden cooking oils (1 tsp oil ≈ 4.5g fat / 40 kcal). "
            "Do NOT compute total calories; provide only per-item weights and macronutrients."
        )

        response = self.client.models.generate_content(
            model=self.model_id,
            contents=f"Analyze this meal log:\n\n{meal_text}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.0,
                response_mime_type="application/json",
                response_schema=MealExtractionResponse,
            ),
        )

        parsed = MealExtractionResponse.model_validate_json(response.text)

        total_weight = sum(item.weight_g for item in parsed.items)
        total_p = sum(item.protein_g for item in parsed.items)
        total_c = sum(item.carbs_g for item in parsed.items)
        total_f = sum(item.fats_g for item in parsed.items)
        total_fiber = sum(item.fiber_g for item in parsed.items)
        total_sat_fat = sum(item.saturated_fat_g for item in parsed.items)

        # Deterministic Atwater Derivation
        strict_calories = round((total_p * 4.0) + (total_c * 4.0) + (total_f * 9.0))
        net_carbs = max(0.0, total_c - total_fiber)

        return {
            "calories": strict_calories,
            "total_weight_g": round(total_weight),
            "glycemic_index": parsed.glycemic_index,
            "glycemic_index_label": parsed.glycemic_index_label,
            "nova_group": parsed.nova_group,
            "protein_g": round(total_p, 1),
            "carbs_g": round(total_c, 1),
            "net_carbs_g": round(net_carbs, 1),
            "fats_g": round(total_f, 1),
            "saturated_fat_g": round(total_sat_fat, 1),
            "fiber_g": round(total_fiber, 1),
            "items": [item.model_dump() for item in parsed.items],
        }

    # --------------------------------------------------------------------------
    # Part B: Baseline TDEE (Mifflin-St Jeor)
    # --------------------------------------------------------------------------
    @staticmethod
    def calculate_baseline_tdee(
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: str = "male",
        activity: str = "moderate",
    ) -> int:
        bmr = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)
        bmr += 5.0 if gender.lower() == "male" else -161.0

        activity_multipliers = {
            "sedentary": 1.20,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.725,
            "extra_active": 1.90,
        }
        return round(bmr * activity_multipliers.get(activity.lower(), 1.55))

    # --------------------------------------------------------------------------
    # Part C: Real-World Adaptive Feedback Engine
    # --------------------------------------------------------------------------
    def calculate_adaptive_targets(
        self,
        daily_calories_14d: List[float],
        daily_weights_kg_14d: List[float],
        goal_phase: str = "fat_loss",     # "fat_loss", "maintenance", "bulk"
        baseline_tdee: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Calculates True Expenditure and next week's macro targets using
        smoothed rolling weight deltas and metabolic safety clamps.
        """
        if len(daily_calories_14d) < 14 or len(daily_weights_kg_14d) < 14:
            raise ValueError("Adaptive analysis requires at least 14 days of logs.")

        # 1. Calculate weekly rolling averages to remove water weight noise
        week1_avg_weight = sum(daily_weights_kg_14d[:7]) / 7.0
        week2_avg_weight = sum(daily_weights_kg_14d[7:14]) / 7.0
        weight_delta_kg = week2_avg_weight - week1_avg_weight
        current_weight = round(week2_avg_weight, 1)

        avg_logged_calories = sum(daily_calories_14d) / len(daily_calories_14d)

        # 2. Energy balance calculation (7,700 kcal per kg of tissue)
        daily_energy_imbalance = (weight_delta_kg * 7700.0) / 7.0
        raw_tdee = avg_logged_calories - daily_energy_imbalance

        # 3. Safety Clamping (Prevents wild shifts from water loss or logging errors)
        if baseline_tdee:
            max_allowed_tdee = baseline_tdee * 1.25
            min_allowed_tdee = baseline_tdee * 0.75
            real_tdee = round(min(max(raw_tdee, min_allowed_tdee), max_allowed_tdee))
        else:
            real_tdee = round(raw_tdee)

        # 4. Phase Adjustments
        if goal_phase == "fat_loss":
            target_calories = round(real_tdee - 450)     # Sustainable deficit (~0.4 kg/week)
            protein_g = round(current_weight * 2.2)       # Protein elevated to spare muscle
        elif goal_phase == "bulk":
            target_calories = round(real_tdee + 250)     # Controlled lean surplus
            protein_g = round(current_weight * 1.8)
        else:  # Maintenance
            target_calories = real_tdee
            protein_g = round(current_weight * 1.8)

        # 5. Macro Distribution (Fats: 25%, Carbs: Remainder)
        fat_g = round((target_calories * 0.25) / 9.0)
        carbs_g = round((target_calories - (protein_g * 4 + fat_g * 9)) / 4.0)

        # Exact Atwater reconciliation
        final_calories = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)

        return {
            "current_avg_weight_kg": current_weight,
            "weekly_weight_change_kg": round(weight_delta_kg, 2),
            "avg_logged_calories": round(avg_logged_calories),
            "true_tdee": real_tdee,
            "goal_phase": goal_phase,
            "next_week_targets": {
                "calories": final_calories,
                "protein_g": protein_g,
                "carbs_g": carbs_g,
                "fats_g": fat_g,
            },
        }


# ==============================================================================
# 3. Demonstration & Testing
# ==============================================================================
if __name__ == "__main__":
    engine = RealWorldNutritionEngine()

    print("=" * 60)
    print("1. TESTING MEAL ANALYSIS (DETERMINISTIC 4-4-9 CHECK)")
    print("=" * 60)

    sample_meal = "150g boiled white rice, 100g yellow dal cooked with 1 tsp mustard oil, and 2 boiled eggs."
    try:
        meal_result = engine.analyze_meal(sample_meal)
        print(f"Meal: {sample_meal}")
        print(f"Total Calories : {meal_result['calories']} kcal (Derived strictly via 4-4-9)")
        print(f"Protein        : {meal_result['protein_g']}g")
        print(f"Carbs          : {meal_result['carbs_g']}g (Net: {meal_result['net_carbs_g']}g)")
        print(f"Fats           : {meal_result['fats_g']}g (Sat: {meal_result['saturated_fat_g']}g)")
        print(f"Fiber          : {meal_result['fiber_g']}g")
        print(f"Glycemic Index : {meal_result['glycemic_index']} ({meal_result['glycemic_index_label']})")
        print(f"NOVA Group     : {meal_result['nova_group']}")
    except Exception as e:
        print(f"Meal analysis note: {e}")

    print("\n" + "=" * 60)
    print("2. TESTING ADAPTIVE TDEE & MACRO ADJUSTMENT (14-DAY WINDOW)")
    print("=" * 60)

    daily_calories = [1820, 1790, 1850, 1780, 1810, 1800, 1830,
                      1790, 1810, 1800, 1820, 1780, 1840, 1810]

    daily_weights = [70.5, 70.4, 70.6, 70.3, 70.4, 70.2, 70.3,
                     70.2, 70.0, 70.1, 69.9, 70.0, 69.8, 69.9]

    baseline = engine.calculate_baseline_tdee(70, 175, 25, "male", "moderate")

    targets = engine.calculate_adaptive_targets(
        daily_calories_14d=daily_calories,
        daily_weights_kg_14d=daily_weights,
        goal_phase="fat_loss",
        baseline_tdee=baseline,
    )

    print(f"Current Avg Weight  : {targets['current_avg_weight_kg']} kg")
    print(f"Weekly Weight Trend : {targets['weekly_weight_change_kg']} kg / week")
    print(f"Calculated True TDEE: {targets['true_tdee']} kcal/day")
    print("\nAdjusted Targets for Next Week:")
    for k, v in targets["next_week_targets"].items():
        print(f"  {k}: {v}")
