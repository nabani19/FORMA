import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

load_dotenv()

from nutrition_calculator import (
    NutritionCalculator,
    MacroPlanRequest,
    Gender,
    ActivityLevel,
    Phase,
)
from adaptive_nutrition_engine import (
    RealWorldNutritionEngine,
    AdaptiveTargetsRequest,
)

# ==============================================================================
# 1. Pydantic Extraction Schemas
# ==============================================================================
class FoodItem(BaseModel):
    name: str
    weight_g: float
    protein_g: float
    carbs_g: float
    fats_g: float
    fiber_g: float
    saturated_fat_g: float

class RawMealExtraction(BaseModel):
    items: list[FoodItem] = Field(description="List of ingredients with macros")
    glycemic_index: int = Field(description="Estimated Glycemic Index (0-100)")
    glycemic_index_label: str = Field(description="Classification: 'Low', 'Medium', or 'High'")
    nova_group: str = Field(description="e.g. 'Group 1', 'Group 2', 'Group 3', or 'Group 4'")

class MealRequest(BaseModel):
    meal_text: str

# ==============================================================================
# 2. FastAPI Application Setup
# ==============================================================================
app = FastAPI(title="Antigravity Nutrition Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "https://tracker-app-ai.vercel.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in backend/.env or your environment.",
        )
    return genai.Client(api_key=api_key)

# ==============================================================================
# 3. API Route: Gemini Extraction + Deterministic 4-4-9 Calculation
# ==============================================================================
@app.post("/api/analyze")
def analyze_meal(req: MealRequest):
    if not req.meal_text.strip():
        raise HTTPException(status_code=400, detail="Meal text cannot be empty.")

    client = get_gemini_client()

    system_instruction = (
        "You are an expert clinical nutrition parsing agent. "
        "Extract ingredients, estimated weights in grams, and per-item macronutrients (USDA/IFCT). "
        "Estimate overall Glycemic Index and NOVA Group. "
        "Do NOT estimate or compute top-level total calories."
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=f"Analyze the nutritional content of this meal:\n\n{req.meal_text}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.0,
                response_mime_type="application/json",
                response_schema=RawMealExtraction,
            ),
        )
        extracted = RawMealExtraction.model_validate_json(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # --- DETERMINISTIC ARITHMETIC ENGINE ---
    total_weight = sum(i.weight_g for i in extracted.items)
    total_protein = sum(i.protein_g for i in extracted.items)
    total_carbs = sum(i.carbs_g for i in extracted.items)
    total_fats = sum(i.fats_g for i in extracted.items)
    total_fiber = sum(i.fiber_g for i in extracted.items)
    total_sat_fat = sum(i.saturated_fat_g for i in extracted.items)

    # Net Carbs = Total Carbs - Fiber
    net_carbs = max(0.0, total_carbs - total_fiber)

    # Standard Atwater Factor Formula: (P * 4) + (C * 4) + (F * 9)
    strict_calories = round((total_protein * 4.0) + (total_carbs * 4.0) + (total_fats * 9.0))

    return {
        "calories": strict_calories,
        "total_weight_g": round(total_weight),
        "glycemic_index": extracted.glycemic_index,
        "glycemic_index_label": extracted.glycemic_index_label,
        "nova_group": extracted.nova_group,
        "protein_g": round(total_protein, 1),
        "carbs_g": round(total_carbs, 1),
        "net_carbs_g": round(net_carbs, 1),
        "fats_g": round(total_fats, 1),
        "saturated_fats_g": round(total_sat_fat, 1),
        "fiber_g": round(total_fiber, 1),
        "items": [i.model_dump() for i in extracted.items],
    }

# ==============================================================================
# 4. API Routes: Mifflin-St Jeor Macro & Phase Calculator
# ==============================================================================
class UserStatsRequest(BaseModel):
    weight_kg: float = Field(..., gt=20, lt=350, description="Weight in kilograms")
    height_cm: float = Field(..., gt=50, lt=300, description="Height in centimeters")
    age: int = Field(..., gt=10, lt=130, description="Age in years")
    gender: Gender = Field(Gender.MALE, description="Gender (male or female)")
    activity: ActivityLevel = Field(ActivityLevel.MODERATE, description="Physical activity level")


@app.post("/api/calculate-macros")
def calculate_macros_endpoint(req: MacroPlanRequest):
    """
    Calculates exact target calories and macro splits for a specific phase
    (Maintenance, Fat Loss, or Bulk) using Mifflin-St Jeor & Atwater reconciliation.
    """
    return NutritionCalculator.calculate_phase_plan(
        weight_kg=req.weight_kg,
        height_cm=req.height_cm,
        age=req.age,
        gender=req.gender,
        activity=req.activity,
        phase=req.phase,
    )


@app.post("/api/macro-report")
def macro_report_endpoint(req: UserStatsRequest):
    """
    Generates side-by-side targets for Maintenance, Fat Loss, and Bulking phases.
    """
    return NutritionCalculator.generate_all_phases_report(
        weight_kg=req.weight_kg,
        height_cm=req.height_cm,
        age=req.age,
        gender=req.gender,
        activity=req.activity,
    )


adaptive_engine = RealWorldNutritionEngine()

@app.post("/api/adaptive-targets")
def adaptive_targets_endpoint(req: AdaptiveTargetsRequest):
    """
    Calculates True Expenditure and next week's macro targets using
    smoothed rolling weight deltas (14-day window) and metabolic safety clamps.
    """
    try:
        return adaptive_engine.calculate_adaptive_targets(
            daily_calories_14d=req.daily_calories_14d,
            daily_weights_kg_14d=req.daily_weights_kg_14d,
            goal_phase=req.goal_phase,
            baseline_tdee=req.baseline_tdee,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# 5. Frontend UI: Identical Dark Card Component
# ==============================================================================
@app.get("/", response_class=HTMLResponse)
def serve_ui():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Forma AI Nutrition & Macro Engine</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0b111e] text-slate-100 min-h-screen flex flex-col items-center justify-start p-4 md:p-8">

      <div class="w-full max-w-2xl space-y-6">
        <!-- Header -->
        <div class="text-center space-y-1">
          <h1 class="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span class="text-cyan-400">FORMA</span> NUTRITION & MACRO ENGINE
          </h1>
          <p class="text-xs text-slate-400 font-medium">Mifflin-St Jeor BMR • Atwater 4-4-9 Reconciled • Gemini 3.6 Flash</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex bg-[#151d30] p-1 rounded-2xl border border-slate-800">
          <button id="tabMealBtn" onclick="switchTab('meal')" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition bg-cyan-600 text-white shadow">
            🥗 AI Meal Scanner
          </button>
          <button id="tabMacroBtn" onclick="switchTab('macro')" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-400 hover:text-white">
            ⚖️ TDEE & Phase Calculator
          </button>
        </div>

        <!-- TAB 1: Meal Analyzer -->
        <div id="mealTab" class="space-y-6">
          <div class="bg-[#151d30] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h2 class="text-xs font-bold tracking-wider text-slate-400 uppercase">Log Your Meal</h2>
            <textarea id="mealInput" rows="3" class="w-full bg-[#0d1424] border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" placeholder="e.g. 150g boiled rice, 100g dal, 2 eggs, 1 banana..."></textarea>
            <button onclick="analyzeMeal()" id="btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">Analyze Meal</button>
          </div>

          <!-- Result Card Container -->
          <div id="cardContainer" class="hidden bg-[#151c2e] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-2xl bg-[#36270e] flex items-center justify-center border border-[#6d4d12]">
                  <span class="text-xl">🔥</span>
                </div>
                <div>
                  <div class="flex items-baseline space-x-1.5">
                    <span id="calVal" class="text-3xl font-bold tracking-tight text-white">0</span>
                    <span class="text-sm font-medium text-slate-400">kcal</span>
                  </div>
                  <p class="text-xs text-slate-400">Total weight: <span id="weightVal">0</span>g</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <div class="bg-[#1a233a] border border-slate-700/60 px-3 py-1.5 rounded-xl text-right">
                  <span class="text-[10px] block text-slate-400 uppercase">Glycemic Index</span>
                  <span id="giVal" class="text-xs font-semibold text-amber-400">50 (Low)</span>
                </div>
                <div class="bg-[#1a233a] border border-slate-700/60 px-3 py-1.5 rounded-xl text-right">
                  <span class="text-[10px] block text-slate-400 uppercase">NOVA Group</span>
                  <span id="novaVal" class="text-xs font-semibold text-emerald-400">Group 2</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-2.5">
              <div class="bg-[#0f283d] border border-[#1d4b72] rounded-2xl p-3 text-center">
                <div id="proteinVal" class="text-lg font-bold text-sky-400">0g</div>
                <div class="text-xs text-slate-300 font-medium">Protein</div>
              </div>
              <div class="bg-[#2d2815] border border-[#5c4f1c] rounded-2xl p-3 text-center">
                <div id="carbsVal" class="text-lg font-bold text-amber-400">0g</div>
                <div class="text-xs text-slate-300 font-medium">Carbs</div>
                <div class="text-[10px] text-slate-400 mt-0.5">(<span id="netCarbsVal">0</span>g net)</div>
              </div>
              <div class="bg-[#311624] border border-[#6b2548] rounded-2xl p-3 text-center">
                <div id="fatsVal" class="text-lg font-bold text-rose-400">0g</div>
                <div class="text-xs text-slate-300 font-medium">Fats</div>
                <div class="text-[10px] text-slate-400 mt-0.5">(<span id="satFatVal">0</span>g sat)</div>
              </div>
              <div class="bg-[#112d26] border border-[#1b5c4d] rounded-2xl p-3 text-center">
                <div id="fiberVal" class="text-lg font-bold text-emerald-400">0g</div>
                <div class="text-xs text-slate-300 font-medium">Fiber</div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span class="font-semibold text-slate-300">Ingredients parsed:</span>
              <ul id="itemsList" class="mt-1.5 list-disc list-inside space-y-1"></ul>
            </div>
          </div>
        </div>

        <!-- TAB 2: Macro & Phase Calculator -->
        <div id="macroTab" class="hidden space-y-6">
          <div class="bg-[#151d30] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 class="text-xs font-bold tracking-wider text-slate-400 uppercase">Your Body Stats</h2>
            
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label class="text-[11px] text-slate-400 block mb-1">Weight (kg)</label>
                <input id="calcWeight" type="number" step="0.5" value="70" class="w-full bg-[#0d1424] border border-slate-700 rounded-xl p-2 text-sm text-slate-200">
              </div>
              <div>
                <label class="text-[11px] text-slate-400 block mb-1">Height (cm)</label>
                <input id="calcHeight" type="number" step="1" value="175" class="w-full bg-[#0d1424] border border-slate-700 rounded-xl p-2 text-sm text-slate-200">
              </div>
              <div>
                <label class="text-[11px] text-slate-400 block mb-1">Age</label>
                <input id="calcAge" type="number" value="25" class="w-full bg-[#0d1424] border border-slate-700 rounded-xl p-2 text-sm text-slate-200">
              </div>
              <div>
                <label class="text-[11px] text-slate-400 block mb-1">Gender</label>
                <select id="calcGender" class="w-full bg-[#0d1424] border border-slate-700 rounded-xl p-2 text-sm text-slate-200">
                  <option value="male" selected>Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div class="col-span-2 md:col-span-2">
                <label class="text-[11px] text-slate-400 block mb-1">Activity Level</label>
                <select id="calcActivity" class="w-full bg-[#0d1424] border border-slate-700 rounded-xl p-2 text-sm text-slate-200">
                  <option value="sedentary">Sedentary (desk job, no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate" selected>Moderate (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extra_active">Extra Active (2x/day or physical job)</option>
                </select>
              </div>
            </div>

            <button onclick="calculateMacros()" id="calcBtn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">
              Calculate Phase Plans
            </button>
          </div>

          <!-- Calculator Results -->
          <div id="macroResults" class="hidden space-y-4">
            <!-- Energy Summary Banner -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-[#151c2e] border border-slate-800 rounded-2xl p-4 text-center">
                <span class="text-[11px] text-slate-400 uppercase font-semibold">Basal Metabolic Rate (BMR)</span>
                <div class="text-2xl font-bold text-white mt-0.5"><span id="bmrVal">0</span> <span class="text-xs font-normal text-slate-400">kcal</span></div>
                <p class="text-[10px] text-slate-500 mt-1">Mifflin-St Jeor baseline</p>
              </div>
              <div class="bg-[#151c2e] border border-slate-800 rounded-2xl p-4 text-center">
                <span class="text-[11px] text-slate-400 uppercase font-semibold">Maintenance (TDEE)</span>
                <div class="text-2xl font-bold text-cyan-400 mt-0.5"><span id="tdeeVal">0</span> <span class="text-xs font-normal text-slate-400">kcal</span></div>
                <p class="text-[10px] text-slate-500 mt-1">Activity adjusted</p>
              </div>
            </div>

            <!-- Phase Cards Container -->
            <div id="phaseCards" class="grid grid-cols-1 md:grid-cols-3 gap-3"></div>
          </div>
        </div>

      </div>

      <script>
        function switchTab(tab) {
          const mealTab = document.getElementById("mealTab");
          const macroTab = document.getElementById("macroTab");
          const tabMealBtn = document.getElementById("tabMealBtn");
          const tabMacroBtn = document.getElementById("tabMacroBtn");

          if (tab === 'meal') {
            mealTab.classList.remove("hidden");
            macroTab.classList.add("hidden");
            tabMealBtn.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition bg-cyan-600 text-white shadow";
            tabMacroBtn.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-400 hover:text-white";
          } else {
            mealTab.classList.add("hidden");
            macroTab.classList.remove("hidden");
            tabMacroBtn.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition bg-cyan-600 text-white shadow";
            tabMealBtn.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition text-slate-400 hover:text-white";
          }
        }

        async function analyzeMeal() {
          const text = document.getElementById("mealInput").value;
          const btn = document.getElementById("btn");
          if (!text.trim()) return;

          btn.innerText = "Analyzing with Gemini...";
          btn.disabled = true;

          try {
            const res = await fetch("/api/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ meal_text: text })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error");

            document.getElementById("calVal").innerText = data.calories;
            document.getElementById("weightVal").innerText = data.total_weight_g;
            document.getElementById("giVal").innerText = `${data.glycemic_index} (${data.glycemic_index_label})`;
            document.getElementById("novaVal").innerText = data.nova_group;

            document.getElementById("proteinVal").innerText = `${data.protein_g}g`;
            document.getElementById("carbsVal").innerText = `${data.carbs_g}g`;
            document.getElementById("netCarbsVal").innerText = data.net_carbs_g;
            document.getElementById("fatsVal").innerText = `${data.fats_g}g`;
            document.getElementById("satFatVal").innerText = data.saturated_fats_g;
            document.getElementById("fiberVal").innerText = `${data.fiber_g}g`;

            const list = document.getElementById("itemsList");
            list.innerHTML = "";
            data.items.forEach(i => {
              const li = document.createElement("li");
              li.innerText = `${i.name} (${i.weight_g}g): ${i.protein_g}g P | ${i.carbs_g}g C | ${i.fats_g}g F`;
              list.appendChild(li);
            });

            document.getElementById("cardContainer").classList.remove("hidden");
          } catch(e) {
            alert("Analysis failed: " + e.message);
          } finally {
            btn.innerText = "Analyze Meal";
            btn.disabled = false;
          }
        }

        async function calculateMacros() {
          const btn = document.getElementById("calcBtn");
          const payload = {
            weight_kg: parseFloat(document.getElementById("calcWeight").value),
            height_cm: parseFloat(document.getElementById("calcHeight").value),
            age: parseInt(document.getElementById("calcAge").value),
            gender: document.getElementById("calcGender").value,
            activity: document.getElementById("calcActivity").value,
          };

          btn.innerText = "Calculating...";
          btn.disabled = true;

          try {
            const res = await fetch("/api/macro-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Calculation error");

            document.getElementById("bmrVal").innerText = data.bmr;
            document.getElementById("tdeeVal").innerText = data.maintenance_tdee;

            const container = document.getElementById("phaseCards");
            container.innerHTML = "";

            const phaseLabels = {
              fat_loss: { title: "Fat Loss", color: "rose", badge: "20% Deficit" },
              maintenance: { title: "Maintenance", color: "cyan", badge: "100% TDEE" },
              bulk: { title: "Lean Bulk", color: "emerald", badge: "10% Surplus" }
            };

            for (const [key, plan] of Object.entries(data.plans)) {
              const meta = phaseLabels[key] || { title: key, color: "slate", badge: "" };
              const card = document.createElement("div");
              card.className = "bg-[#151c2e] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3";
              card.innerHTML = `
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white uppercase tracking-wider">${meta.title}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">${meta.badge}</span>
                  </div>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-2xl font-black text-white">${plan.target_calories}</span>
                    <span class="text-xs text-slate-400">kcal/day</span>
                  </div>
                </div>

                <div class="space-y-1.5 text-xs">
                  <div class="flex justify-between text-sky-400">
                    <span>Protein (${plan.macro_percentages.protein}%):</span>
                    <span class="font-bold">${plan.protein_g}g</span>
                  </div>
                  <div class="flex justify-between text-amber-400">
                    <span>Carbs (${plan.macro_percentages.carbs}%):</span>
                    <span class="font-bold">${plan.carbs_g}g</span>
                  </div>
                  <div class="flex justify-between text-rose-400">
                    <span>Fats (${plan.macro_percentages.fats}%):</span>
                    <span class="font-bold">${plan.fats_g}g</span>
                  </div>
                </div>

                <div class="text-[10px] text-slate-500 pt-2 border-t border-slate-800 text-center">
                  Atwater Verified: ${(plan.protein_g * 4 + plan.carbs_g * 4 + plan.fats_g * 9).toFixed(1)} kcal
                </div>
              `;
              container.appendChild(card);
            }

            document.getElementById("macroResults").classList.remove("hidden");
          } catch(e) {
            alert("Calculation failed: " + e.message);
          } finally {
            btn.innerText = "Calculate Phase Plans";
            btn.disabled = false;
          }
        }
      </script>
    </body>
    </html>
    """

# ==============================================================================
# 5. Run Server Directly
# ==============================================================================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
