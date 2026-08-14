// 🤖 OpenRouter AI Vision Integration Engine — Flex Aura: Clinical Edition
// Upgraded to Dual-Gate multi-candidate analysis with Bergman ODE parameters.

const OPENROUTER_API_KEY =
  ((import.meta as any).env?.VITE_OPENROUTER_API_KEY as string) || '';
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterFoodAnalysis {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodiumMg: number;
  servingSize: string;
  priceInr: number;
  healthScore: number;
  glycemicIndex: number;
  sugarSpikeRisk: 'Low' | 'Moderate' | 'High';
  qualityScore: string;
  processingLevel: 'Whole Food' | 'Minimally Processed' | 'Processed' | 'Ultra-Processed';
  ingredients: string[];
  vitaminCMg?: number;
  calciumMg?: number;
  ironMg?: number;
  potassiumMg?: number;
  magnesiumMg?: number;
  allergens?: string[];
  dietaryFlags?: string[];
  cookingMethod?: string;
}

/** A single AI food candidate from Gate 1 identification */
export interface FoodCandidate {
  /** Rank 1–3 (most to least confident) */
  rank: number;
  /** AI confidence score 0–100 */
  confidencePercent: number;
  name: string;
  category: string;
  /** Estimated grams for detected portion */
  estimatedGrams: number;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodiumMg: number;
  glycemicIndex: number;
  sugarSpikeRisk: 'Low' | 'Moderate' | 'High';
  healthScore: number;
  qualityScore: string;
  processingLevel: 'Whole Food' | 'Minimally Processed' | 'Processed' | 'Ultra-Processed';
  ingredients: string[];
  /** Hidden ingredient inference (e.g. "sticky sauce implies +8g sugar") */
  hiddenIngredients?: string[];
  allergens: string[];
  dietaryFlags: string[];
  cookingMethod: string;
  vitaminCMg: number;
  calciumMg: number;
  ironMg: number;
  potassiumMg: number;
  magnesiumMg: number;
  priceInr: number;
}

/** Full multi-candidate response from the clinical vision API */
export interface ClinicalVisionResult {
  candidates: FoodCandidate[];
  sceneDescription: string;
  overallConfidence: number;
}

/**
 * Original single-result analyzer (kept for backward compatibility).
 */
export async function analyzeFoodImageWithOpenRouter(
  imageBase64: string,
  modelId: string = 'google/gemini-2.0-flash-001'
): Promise<OpenRouterFoodAnalysis | null> {
  const result = await analyzeFoodImageClinical(imageBase64, modelId);
  if (!result || result.candidates.length === 0) return null;
  const top = result.candidates[0];
  return {
    name: top.name,
    category: top.category,
    calories: top.calories,
    protein: top.protein,
    carbs: top.carbs,
    fat: top.fat,
    fiber: top.fiber,
    sugar: top.sugar,
    sodiumMg: top.sodiumMg,
    servingSize: top.servingSize,
    priceInr: top.priceInr,
    healthScore: top.healthScore,
    glycemicIndex: top.glycemicIndex,
    sugarSpikeRisk: top.sugarSpikeRisk,
    qualityScore: top.qualityScore,
    processingLevel: top.processingLevel,
    ingredients: top.ingredients,
    vitaminCMg: top.vitaminCMg,
    calciumMg: top.calciumMg,
    ironMg: top.ironMg,
    potassiumMg: top.potassiumMg,
    magnesiumMg: top.magnesiumMg,
    allergens: top.allergens,
    dietaryFlags: top.dietaryFlags,
    cookingMethod: top.cookingMethod,
  };
}

/**
 * CLINICAL GRADE: Multi-candidate Dual-Gate vision analysis.
 *
 * Returns top-3 food identity candidates with confidence scores,
 * per-ingredient portion estimates, and hidden ingredient inference.
 * This powers Gate 1 (Identity) in the Flex Aura scan state machine.
 */
export async function analyzeFoodImageClinical(
  imageBase64: string,
  modelId: string = 'google/gemini-2.0-flash-001'
): Promise<ClinicalVisionResult | null> {
  try {
    const prompt = `You are the Flex Aura Metabolic Systems Architect — a world-class AI clinical nutritionist and food vision scientist. Your task is to analyze this food image and return a JSON object with TOP 3 food identity candidates ranked by confidence.

For each candidate, infer:
1. Exact food identity and confidence (use visual cues: texture, color, plating style, portion size)
2. Estimated grams for the visible portion (use plate/bowl as size reference — a standard plate is 26cm)
3. Complete macronutrient profile scaled to the VISIBLE portion
4. Hidden ingredients (e.g., "glossy appearance implies starch-based sauce = +6g sugar")
5. Glycemic Index (GI) from nutritional databases — this is CRITICAL for the ODE glucose solver

Return ONLY this JSON (no markdown, no extra text):
{
  "sceneDescription": "Brief scene analysis (plate type, portion size estimate, cooking style)",
  "overallConfidence": 87,
  "candidates": [
    {
      "rank": 1,
      "confidencePercent": 91,
      "name": "Grilled Chicken Tikka with Basmati Rice",
      "category": "High Protein Indian",
      "estimatedGrams": 350,
      "servingSize": "1 Plate (350g)",
      "calories": 520,
      "protein": 42,
      "carbs": 48,
      "fat": 14,
      "fiber": 3,
      "sugar": 4,
      "sodiumMg": 480,
      "glycemicIndex": 52,
      "sugarSpikeRisk": "Moderate",
      "healthScore": 88,
      "qualityScore": "Very Good",
      "processingLevel": "Minimally Processed",
      "ingredients": ["Chicken breast 200g", "Basmati rice 100g", "Tikka marinade", "Capsicum", "Onion"],
      "hiddenIngredients": ["Butter/ghee in marinade (~5g)", "Tandoor char adds sodium"],
      "allergens": ["Dairy"],
      "dietaryFlags": ["High Protein", "Gluten-Free"],
      "cookingMethod": "Tandoor Grilled",
      "vitaminCMg": 28,
      "calciumMg": 95,
      "ironMg": 3.8,
      "potassiumMg": 580,
      "magnesiumMg": 72,
      "priceInr": 180
    },
    {
      "rank": 2,
      "confidencePercent": 7,
      "name": "Chicken Biryani",
      "category": "Mixed Rice Dish",
      "estimatedGrams": 380,
      "servingSize": "1 Plate (380g)",
      "calories": 610,
      "protein": 36,
      "carbs": 68,
      "fat": 22,
      "fiber": 2,
      "sugar": 5,
      "sodiumMg": 620,
      "glycemicIndex": 62,
      "sugarSpikeRisk": "High",
      "healthScore": 74,
      "qualityScore": "Good",
      "processingLevel": "Minimally Processed",
      "ingredients": ["Chicken 180g", "Basmati rice 150g", "Biryani masala", "Fried onions", "Ghee"],
      "hiddenIngredients": ["Ghee ~15g adds significant fat"],
      "allergens": ["Dairy"],
      "dietaryFlags": ["High Calorie"],
      "cookingMethod": "Dum Cooked",
      "vitaminCMg": 8,
      "calciumMg": 70,
      "ironMg": 3.2,
      "potassiumMg": 420,
      "magnesiumMg": 55,
      "priceInr": 220
    },
    {
      "rank": 3,
      "confidencePercent": 2,
      "name": "Chicken Shawarma Bowl",
      "category": "Mediterranean Protein",
      "estimatedGrams": 330,
      "servingSize": "1 Bowl (330g)",
      "calories": 490,
      "protein": 38,
      "carbs": 42,
      "fat": 18,
      "fiber": 4,
      "sugar": 3,
      "sodiumMg": 520,
      "glycemicIndex": 45,
      "sugarSpikeRisk": "Low",
      "healthScore": 84,
      "qualityScore": "Very Good",
      "processingLevel": "Minimally Processed",
      "ingredients": ["Chicken thigh 180g", "Pita bread 60g", "Hummus", "Tomato", "Cucumber", "Garlic sauce"],
      "hiddenIngredients": ["Garlic sauce may contain mayo (~8g fat)"],
      "allergens": ["Gluten", "Sesame"],
      "dietaryFlags": ["High Protein"],
      "cookingMethod": "Rotisserie",
      "vitaminCMg": 18,
      "calciumMg": 88,
      "ironMg": 4.1,
      "potassiumMg": 510,
      "magnesiumMg": 68,
      "priceInr": 150
    }
  ]
}

REMEMBER: The glycemicIndex is CRITICAL — it drives the Bergman ODE glucose simulation. Use real GI database values. Never guess linearly. Be precise.`;

    const formattedImage = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://flex-aura-clinical.vercel.app/',
        'X-Title': 'Flex Aura Clinical — Dual-Gate Food Scanner',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: formattedImage } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.warn('[ClinicalVision] OpenRouter response:', response.status);
      if (modelId !== 'google/gemini-2.0-flash-001') {
        return analyzeFoodImageClinical(imageBase64, 'google/gemini-2.0-flash-001');
      }
      return null;
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content || '';

    // Extract valid JSON
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed: ClinicalVisionResult = JSON.parse(match[0]);

    // Validate structure
    if (!parsed.candidates || !Array.isArray(parsed.candidates)) return null;

    return parsed;
  } catch (error) {
    console.error('[ClinicalVision] Exception:', error);
    return null;
  }
}
