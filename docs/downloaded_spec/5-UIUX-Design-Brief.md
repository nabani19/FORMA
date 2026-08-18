# 5-UIUX-Design-Brief.md — UI/UX Design System & Experience Brief

> **Forma (FitForge AI)**: Visual tokens, color palettes, animations, typography, and micro-interactions.

---

## 1. Visual Language & Aesthetics Philosophy
The Forma design system creates an immediate **"WOW" factor**:
- **Glassmorphism**: `backdrop-blur-md`, subtle `border-slate-800`, semi-transparent slate backgrounds (`bg-slate-950/85`, `bg-slate-900/95`).
- **Dynamic Energy Gradients**:
  - Primary Action / Success: Emerald to Teal (`from-emerald-500 to-teal-500`)
  - Energy & Glycemic Indicators: Amber to Orange (`from-amber-500 to-orange-500`)
  - Muscle & Protein: Sky to Cyan (`from-sky-500 to-cyan-500`)
  - Dietary Alerts / Fat: Rose to Red (`from-rose-500 to-red-600`)
- **Dark Mode Excellence**: Curated deep space slate canvas (`#020617` and `#0f172a`) with high contrast (WCAG AAA compliant).

---

## 2. Micro-Animations & Dynamic Scanning Reticle

1. **Laser Sweep Viewfinder Animation**:
   - Continuous vertical scanning laser beam with emerald blur glow (`animate-laser`).
   - Reticle corner targets highlighting food items on the video stream or canvas preview.
2. **Real-Time Macro Counters**:
   - Smooth animated numbers when adjusting portion sliders or switching component selections.
3. **Circular Progress Rings**:
   - SVG circular stroke dash-offset animations for Daily Calories, Protein, Carbs, Fats, and Water fulfillment.

---

## 3. Interactive Component Guidelines

### Multi-Item Plate Breakdown Card
- Checkbox toggle with instant visual dimming for deselected items.
- Smooth HTML5 range slider for grams with instant live macro recalculation.
- Individual component micro-badges (Protein, Carbs, Fats).

### Visual Hand-Measurement Popover
- Modal displaying the 8 standard ICMR-NIN / USDA visual representations (Fist, Palm, Cupped Hand, Thumb, Katori, Cup, Tablespoon, Slice) with food item examples.

### Toast Notifications
- Floating non-intrusive feedback toasts for scan success, barcode verification, and meal logging.
