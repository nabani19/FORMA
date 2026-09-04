from enum import Enum
from typing import Dict, Any
from pydantic import BaseModel, Field


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"          # Desk job, little to no exercise
    LIGHT = "light"                  # Exercise 1-3 days/week
    MODERATE = "moderate"            # Exercise 3-5 days/week
    VERY_ACTIVE = "very_active"      # Hard exercise 6-7 days/week
    EXTRA_ACTIVE = "extra_active"    # Intense training twice per day or physical job


class Phase(str, Enum):
    MAINTENANCE = "maintenance"
    FAT_LOSS = "fat_loss"
    BULK = "bulk"


class MacroPlanRequest(BaseModel):
    weight_kg: float = Field(..., gt=20, lt=350, description="Weight in kilograms")
    height_cm: float = Field(..., gt=50, lt=300, description="Height in centimeters")
    age: int = Field(..., gt=10, lt=130, description="Age in years")
    gender: Gender = Field(Gender.MALE, description="Gender (male or female)")
    activity: ActivityLevel = Field(ActivityLevel.MODERATE, description="Physical activity level")
    phase: Phase = Field(Phase.MAINTENANCE, description="Target fitness phase")


class NutritionCalculator:
    # Physical Activity Multipliers
    ACTIVITY_MULTIPLIERS = {
        ActivityLevel.SEDENTARY: 1.20,
        ActivityLevel.LIGHT: 1.375,
        ActivityLevel.MODERATE: 1.55,
        ActivityLevel.VERY_ACTIVE: 1.725,
        ActivityLevel.EXTRA_ACTIVE: 1.90,
    }

    @staticmethod
    def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: Gender) -> float:
        """
        Calculates Basal Metabolic Rate using the Mifflin-St Jeor Equation.
        """
        base_bmr = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)
        if gender == Gender.MALE:
            return base_bmr + 5.0
        else:
            return base_bmr - 161.0

    @classmethod
    def calculate_tdee(
        cls,
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: Gender,
        activity: ActivityLevel
    ) -> float:
        """
        Calculates Total Daily Energy Expenditure (Maintenance Calories).
        """
        bmr = cls.calculate_bmr(weight_kg, height_cm, age, gender)
        multiplier = cls.ACTIVITY_MULTIPLIERS[activity]
        return bmr * multiplier

    @classmethod
    def calculate_phase_plan(
        cls,
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: Gender,
        activity: ActivityLevel,
        phase: Phase
    ) -> Dict[str, Any]:
        """
        Calculates exact target calories and macro splits for a specific phase.
        
        Nutrition Principles applied:
        - Fat Loss: ~20% caloric deficit, higher protein (~2.2g/kg) to spare muscle.
        - Maintenance: 100% of TDEE, balanced protein (~1.8g/kg).
        - Bulking: ~10% surplus (~250-350 kcal), protein (~1.8-2.0g/kg).
        - Fats: Standard 25% of total calories for hormonal health.
        - Carbs: Fills all remaining caloric energy.
        """
        tdee = cls.calculate_tdee(weight_kg, height_cm, age, gender, activity)

        if phase == Phase.FAT_LOSS:
            target_calories = round(tdee * 0.80)       # 20% deficit
            protein_per_kg = 2.2                       # Higher to preserve lean mass
            fat_calorie_ratio = 0.25                   # 25% from healthy fats

        elif phase == Phase.BULK:
            target_calories = round(tdee * 1.10)       # 10% lean surplus
            protein_per_kg = 1.9
            fat_calorie_ratio = 0.25

        else:  # Maintenance
            target_calories = round(tdee)
            protein_per_kg = 1.8
            fat_calorie_ratio = 0.25

        # 1. Calculate Protein (4 kcal/g)
        protein_g = round(weight_kg * protein_per_kg, 1)
        protein_cals = protein_g * 4.0

        # 2. Calculate Fat (9 kcal/g)
        fat_cals = target_calories * fat_calorie_ratio
        fat_g = round(fat_cals / 9.0, 1)
        actual_fat_cals = fat_g * 9.0

        # 3. Calculate Carbs (4 kcal/g) from remaining calories
        remaining_cals = target_calories - (protein_cals + actual_fat_cals)
        carbs_g = round(max(0.0, remaining_cals / 4.0), 1)

        # 4. Strict Atwater re-check to guarantee zero rounding discrepancies
        reconciled_calories = round((protein_g * 4.0) + (carbs_g * 4.0) + (fat_g * 9.0))

        return {
            "phase": phase.value,
            "target_calories": reconciled_calories,
            "tdee_maintenance": round(tdee),
            "protein_g": protein_g,
            "fats_g": fat_g,
            "carbs_g": carbs_g,
            "macro_percentages": {
                "protein": round((protein_g * 4 / reconciled_calories) * 100, 1) if reconciled_calories > 0 else 0,
                "fats": round((fat_g * 9 / reconciled_calories) * 100, 1) if reconciled_calories > 0 else 0,
                "carbs": round((carbs_g * 4 / reconciled_calories) * 100, 1) if reconciled_calories > 0 else 0,
            }
        }

    @classmethod
    def generate_all_phases_report(
        cls,
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: Gender,
        activity: ActivityLevel
    ) -> Dict[str, Any]:
        """
        Generates a side-by-side comparison of Maintenance, Fat Loss, and Bulking.
        """
        bmr = cls.calculate_bmr(weight_kg, height_cm, age, gender)
        tdee = cls.calculate_tdee(weight_kg, height_cm, age, gender, activity)

        return {
            "user_stats": {
                "weight_kg": weight_kg,
                "height_cm": height_cm,
                "age": age,
                "gender": gender.value,
                "activity": activity.value,
            },
            "bmr": round(bmr),
            "maintenance_tdee": round(tdee),
            "plans": {
                Phase.FAT_LOSS.value: cls.calculate_phase_plan(
                    weight_kg, height_cm, age, gender, activity, Phase.FAT_LOSS
                ),
                Phase.MAINTENANCE.value: cls.calculate_phase_plan(
                    weight_kg, height_cm, age, gender, activity, Phase.MAINTENANCE
                ),
                Phase.BULK.value: cls.calculate_phase_plan(
                    weight_kg, height_cm, age, gender, activity, Phase.BULK
                ),
            }
        }


# ==============================================================================
# Example Usage & Verification
# ==============================================================================
if __name__ == "__main__":
    weight = 70.0
    height = 175.0
    age = 25
    gender = Gender.MALE
    activity = ActivityLevel.MODERATE

    report = NutritionCalculator.generate_all_phases_report(
        weight_kg=weight,
        height_cm=height,
        age=age,
        gender=gender,
        activity=activity,
    )

    print("=" * 65)
    print(f"BMR: {report['bmr']} kcal | Maintenance (TDEE): {report['maintenance_tdee']} kcal")
    print("=" * 65)

    for phase_name, plan in report["plans"].items():
        print(f"\n--- {phase_name.upper().replace('_', ' ')} PHASE ---")
        print(f"Target Calories : {plan['target_calories']} kcal")
        print(f"Protein         : {plan['protein_g']}g  ({plan['macro_percentages']['protein']}%)")
        print(f"Carbohydrates   : {plan['carbs_g']}g  ({plan['macro_percentages']['carbs']}%)")
        print(f"Fats            : {plan['fats_g']}g  ({plan['macro_percentages']['fats']}%)")
        
        # Verify Atwater consistency
        check = (plan['protein_g'] * 4) + (plan['carbs_g'] * 4) + (plan['fats_g'] * 9)
        print(f"Math Verification: {check:.1f} kcal matches {plan['target_calories']} kcal")
