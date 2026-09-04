# Forma AI Nutrition Backend

FastAPI + Google Gemini 2.5 Flash backend for the Forma AI Tracker.  
Replaces OpenRouter calls with direct Gemini API for lower latency and better accuracy.

## Key Design: No LLM Calories

Gemini is **never** asked to return calories. All calorie values are computed
server-side using the Atwater formula:
```
calories = (protein_g × 4) + (carbs_g × 4) + (fat_g × 9)
```
This eliminates the hallucination where the LLM returns a calorie total that
contradicts its own macro values.

---

## Setup

### 1. Install Python 3.12
Download from https://www.python.org/downloads/ and **check "Add to PATH"** during install.

### 2. Create virtual environment
```powershell
# Run from the backend/ directory
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set your Gemini API key
Get your key from https://aistudio.google.com/app/apikey

```powershell
# In PowerShell (current session only)
$env:GEMINI_API_KEY = "your-gemini-api-key-here"

# Or create a .env file in backend/ (never commit this!)
# GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Start the server
```powershell
# With venv active:
uvicorn main:app --reload --port 8000

# Or directly:
python main.py
```

The API will be available at: **http://localhost:8000**  
Interactive docs (Swagger UI): **http://localhost:8000/docs**

---

## API Endpoints

### `GET /health`
Returns `{ "status": "ok", "model": "gemini-2.5-flash" }`

### `POST /api/analyze-food`
Analyze a food image or text description.

**Request body:**
```json
{
  "text_description": "400g rice, 100g paneer curry, 2 boiled eggs",
  "image_base64": null,
  "cuisine_hint": "Indian",
  "scan_mode": "standard"
}
```

**Response** — calories are always `(P×4 + C×4 + F×9)`, never from the LLM:
```json
{
  "name": "Indian Balanced Meal",
  "totals": {
    "protein_g": 42.3,
    "carbs_g": 118.0,
    "fat_g": 23.4,
    "calories": 876,
    ...
  },
  "decomposed_components": [...]
}
```

---

## Connecting to the React Frontend

After the backend is running, update `src/utils/aiVisionService.ts`:

```ts
const BACKEND_URL = 'http://localhost:8000';

// Replace the OpenRouter fetch with:
const response = await fetch(`${BACKEND_URL}/api/analyze-food`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text_description: textDescription,
    image_base64: imageBase64,
    cuisine_hint: cuisineHint,
    scan_mode: scanMode,
  }),
});
```
