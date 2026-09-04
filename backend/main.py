import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

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

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# ==============================================================================
# 3. API Route: Gemini Extraction + Deterministic 4-4-9 Calculation
# ==============================================================================
@app.post("/api/analyze")
def analyze_meal(req: MealRequest):
    if not req.meal_text.strip():
        raise HTTPException(status_code=400, detail="Meal text cannot be empty.")

    system_instruction = (
        "You are an expert clinical nutrition parsing agent. "
        "Extract ingredients, estimated weights in grams, and per-item macronutrients (USDA/IFCT). "
        "Estimate overall Glycemic Index and NOVA Group. "
        "Do NOT estimate or compute top-level total calories."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
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
# 4. Frontend UI: Identical Dark Card Component
# ==============================================================================
@app.get("/", response_class=HTMLResponse)
def serve_ui():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Nutrition Card - Antigravity AI</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0b111e] text-slate-100 min-h-screen flex flex-col items-center justify-center p-4">

      <div class="w-full max-w-xl space-y-6">
        <!-- Input Form -->
        <div class="bg-[#151d30] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h2 class="text-sm font-semibold tracking-wide text-slate-400 uppercase">Log Your Meal</h2>
          <textarea id="mealInput" rows="3" class="w-full bg-[#0d1424] border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" placeholder="e.g. 150g boiled rice, 100g dal, 2 eggs, 1 banana..."></textarea>
          <button onclick="analyzeMeal()" id="btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-xl transition text-sm">Analyze Meal</button>
        </div>

        <!-- Result Card Container (Matches Platform 2 UI) -->
        <div id="cardContainer" class="hidden bg-[#151c2e] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          
          <!-- Top Row: Calories & Badges -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Flame Icon Box -->
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

          <!-- Bottom Row: 4 Nutrient Badges -->
          <div class="grid grid-cols-4 gap-2.5">
            <!-- Protein -->
            <div class="bg-[#0f283d] border border-[#1d4b72] rounded-2xl p-3 text-center">
              <div id="proteinVal" class="text-lg font-bold text-sky-400">0g</div>
              <div class="text-xs text-slate-300 font-medium">Protein</div>
            </div>

            <!-- Carbs -->
            <div class="bg-[#2d2815] border border-[#5c4f1c] rounded-2xl p-3 text-center">
              <div id="carbsVal" class="text-lg font-bold text-amber-400">0g</div>
              <div class="text-xs text-slate-300 font-medium">Carbs</div>
              <div class="text-[10px] text-slate-400 mt-0.5">(<span id="netCarbsVal">0</span>g net)</div>
            </div>

            <!-- Fats -->
            <div class="bg-[#311624] border border-[#6b2548] rounded-2xl p-3 text-center">
              <div id="fatsVal" class="text-lg font-bold text-rose-400">0g</div>
              <div class="text-xs text-slate-300 font-medium">Fats</div>
              <div class="text-[10px] text-slate-400 mt-0.5">(<span id="satFatVal">0</span>g sat)</div>
            </div>

            <!-- Fiber -->
            <div class="bg-[#112d26] border border-[#1b5c4d] rounded-2xl p-3 text-center">
              <div id="fiberVal" class="text-lg font-bold text-emerald-400">0g</div>
              <div class="text-xs text-slate-300 font-medium">Fiber</div>
            </div>
          </div>

          <!-- Ingredients Collapsible -->
          <div class="pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span class="font-semibold text-slate-300">Ingredients parsed:</span>
            <ul id="itemsList" class="mt-1.5 list-disc list-inside space-y-1"></ul>
          </div>
        </div>
      </div>

      <script>
        async function analyzeMeal() {
          const text = document.getElementById("mealInput").value;
          const btn = document.getElementById("btn");
          if (!text.trim()) return;

          btn.innerText = "Analyzing...";
          btn.disabled = true;

          try {
            const res = await fetch("/api/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ meal_text: text })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error");

            // Populate Card
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
      </script>
    </body>
    </html>
    """

# ==============================================================================
# 5. Run Server Directly
# ==============================================================================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
