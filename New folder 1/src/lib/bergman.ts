/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FLEX AURA: CLINICAL — Bergman Minimal Model ODE Solver (TypeScript / RK4)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * AGENTS.md RULE 1 (Mathematical Purity):
 *   NEVER use linear formulas for glucose prediction.
 *   All spike calculations MUST route through the Bergman Minimal Model solver.
 *
 * The 3-Compartment Bergman System:
 *   dG/dt = -p1*(G - Gb) - X*G + Ra(t)          [Glucose dynamics]
 *   dX/dt = -p2*X + p3*(I - Ib)                   [Remote insulin]
 *   dI/dt = γ*(max(G - G_threshold, 0)) - n*I    [Insulin secretion]
 *
 * Ra(t) = Glucose Appearance Rate from gut absorption, modulated by:
 *   - Carbohydrate content (primary driver)
 *   - Fat content         (delays gastric emptying → shifts Ra peak right)
 *   - Protein content     (minor gluconeogenic contribution + delays)
 *   - Fiber content       (attenuates peak, slows absorption)
 */

export interface BergmanParams {
  /** Glucose effectiveness (1/min) — default from Flex Aura docs */
  p1: number;
  /** Remote insulin clearance rate (1/min) */
  p2: number;
  /** Insulin sensitivity factor (mL/µU·min²) */
  p3: number;
  /** Baseline fasting glucose (mg/dL) */
  Gb: number;
  /** Baseline fasting insulin (µU/mL) */
  Ib: number;
}

export interface GlucoseCurvePoint {
  /** Time in minutes since meal */
  t: number;
  /** Predicted blood glucose in mg/dL */
  G: number;
}

export interface BergmanResult {
  /** Full 181-point glucose curve (t=0 to t=180 min, 1 min resolution) */
  curve: GlucoseCurvePoint[];
  /** Peak glucose value in mg/dL */
  peakGlucoseMgDl: number;
  /** Time at which peak occurs (minutes) */
  peakTimeMins: number;
  /** Area Under the Curve (mg·min/dL) — trapezoidal integration */
  auc: number;
  /** Clinical risk classification */
  spikeRisk: 'Low' | 'Moderate' | 'High';
}

export interface MealMacros {
  /** Net carbohydrates in grams */
  carbsG: number;
  /** Fat in grams (delays gastric emptying) */
  fatG: number;
  /** Protein in grams (minor gluconeogenic + delay effect) */
  proteinG: number;
  /** Fiber in grams (attenuates peak) */
  fiberG: number;
  /** Glycemic Index of food (0–100) */
  glycemicIndex?: number;
}

/** Default Bergman parameters from Flex Aura AGENTS.md */
export const DEFAULT_BERGMAN_PARAMS: BergmanParams = {
  p1: 0.028735,
  p2: 0.028344,
  p3: 0.0000502,
  Gb: 90.0,
  Ib: 7.0,
};

/**
 * Compute the glucose appearance rate Ra(t) in mg/dL/min.
 *
 * This is a physiological model of gut glucose absorption:
 *   1. Net digestible carbs  = carbsG - (fiberG * 0.5)   [partial fiber subtraction]
 *   2. GI factor scales the absorption speed (high GI = faster peak)
 *   3. Fat creates a gastric emptying delay (shifts the Ra peak rightward)
 *   4. Protein adds a smaller, later-peaking contribution
 *
 * The result is a log-normal-shaped impulse approximation.
 */
function computeRa(
  t: number,
  macros: MealMacros,
  bodyWeightKg: number = 70
): number {
  const { carbsG, fatG, proteinG, fiberG, glycemicIndex } = macros;

  // Digestible carbs (fiber slows but doesn't block)
  const digestibleCarbs = Math.max(0, carbsG - fiberG * 0.5);

  // GI scales how fast absorption peaks (low GI = slower, later peak)
  const giNorm = Math.max(10, Math.min(100, glycemicIndex ?? 55)) / 100;

  // Gastric emptying delay from fat and protein (minutes)
  // High fat meals can delay peak by 30–90 minutes
  const fatDelay = fatG * 0.8;
  const proteinDelay = proteinG * 0.3;
  const totalDelay = Math.max(0, fatDelay + proteinDelay);

  // Peak absorption time: low GI foods peak later
  const tPeak = 30 + (1 - giNorm) * 45 + totalDelay;

  // Total glucose load delivered to systemic circulation (mg)
  // Bioavailability: ~65% of digestible carbs enter systemic blood (35% extracted on first-pass by liver)
  const totalGlucoseMg = digestibleCarbs * 1000 * 0.65;

  // Protein contributes ~58% gluconeogenically but over 90–180 min
  const proteinGlucoseMg = proteinG * 1000 * 0.58 * 0.4;

  // ── Carb absorption: log-normal impulse ───────────────────────────────────
  if (t <= 0) return 0;
  const sigma = 0.6 + (1 - giNorm) * 0.4 + totalDelay * 0.005;
  const mu = Math.log(tPeak);
  const carbRa = (totalGlucoseMg / (t * sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-Math.pow(Math.log(t) - mu, 2) / (2 * sigma * sigma));

  // ── Protein contribution: much later, smaller peak ─────────────────────
  const tPeakProtein = 90 + totalDelay * 0.5;
  const sigmaP = 0.8;
  const muP = Math.log(tPeakProtein);
  const proteinRa = t <= 0 ? 0 :
    (proteinGlucoseMg / (t * sigmaP * Math.sqrt(2 * Math.PI))) *
    Math.exp(-Math.pow(Math.log(Math.max(1, t)) - muP, 2) / (2 * sigmaP * sigmaP));

  // Convert from total-body mg/min to mg/dL/min (divide by distribution volume ~2.2 dL/kg * bodyWeight)
  const distributionVolumeDl = bodyWeightKg * 0.22 * 10;
  return (carbRa + proteinRa * 0.5) / distributionVolumeDl;
}

/**
 * RK4 (4th-order Runge-Kutta) step for the Bergman system.
 * State vector: [G, X, I]
 */
function rk4Step(
  t: number,
  state: [number, number, number],
  dt: number,
  params: BergmanParams,
  macros: MealMacros,
  bodyWeightKg: number
): [number, number, number] {
  const deriv = (tt: number, s: [number, number, number]): [number, number, number] => {
    const [G, X, I] = s;
    const { p1, p2, p3, Gb, Ib } = params;
    const Ra = computeRa(tt, macros, bodyWeightKg);

    // Bergman Minimal Model ODEs
    const dGdt = -p1 * (G - Gb) - X * G + Ra;
    const dXdt = -p2 * X + p3 * (I - Ib);

    // Insulin secretion: gamma * max(G - threshold, 0) - n*I
    const gamma = 0.006;
    const n = 0.09;
    const G_threshold = 100; // mg/dL — pancreatic threshold
    const dIdt = gamma * Math.max(0, G - G_threshold) - n * I;

    return [dGdt, dXdt, dIdt];
  };

  const [G, X, I] = state;

  const k1 = deriv(t, state);
  const k2 = deriv(t + dt / 2, [
    G + dt / 2 * k1[0],
    X + dt / 2 * k1[1],
    I + dt / 2 * k1[2],
  ]);
  const k3 = deriv(t + dt / 2, [
    G + dt / 2 * k2[0],
    X + dt / 2 * k2[1],
    I + dt / 2 * k2[2],
  ]);
  const k4 = deriv(t + dt, [
    G + dt * k3[0],
    X + dt * k3[1],
    I + dt * k3[2],
  ]);

  return [
    G + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    X + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    Math.max(0, I + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])),
  ];
}

/**
 * Run the full Bergman Minimal Model simulation.
 *
 * @param macros    - Confirmed meal macros (from Dual-Gate verification)
 * @param params    - User's biological parameters (from DB / defaults)
 * @param duration  - Simulation duration in minutes (default: 180)
 * @param dt        - Integration step in minutes (default: 0.5 for accuracy)
 * @param bodyWeightKg - User's body weight for glucose distribution volume
 *
 * @returns BergmanResult with full curve, peak, AUC, and spike risk
 */
export function runBergmanODE(
  macros: MealMacros,
  params: BergmanParams = DEFAULT_BERGMAN_PARAMS,
  duration: number = 180,
  dt: number = 0.5,
  bodyWeightKg: number = 70
): BergmanResult {
  // Initial conditions: fasting state
  let state: [number, number, number] = [
    params.Gb, // G(0) = fasting glucose
    0,         // X(0) = no remote insulin action
    params.Ib, // I(0) = fasting insulin
  ];

  const rawCurve: { t: number; G: number }[] = [];
  const steps = Math.round(duration / dt);

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    rawCurve.push({ t, G: Math.max(40, state[0]) }); // clamp to physiological minimum
    if (i < steps) {
      state = rk4Step(t, state, dt, params, macros, bodyWeightKg);
    }
  }

  // Downsample to 1-minute resolution for the UI
  const curve: GlucoseCurvePoint[] = [];
  for (let t = 0; t <= duration; t++) {
    const closest = rawCurve.reduce((prev, curr) =>
      Math.abs(curr.t - t) < Math.abs(prev.t - t) ? curr : prev
    );
    curve.push({ t, G: Math.round(closest.G * 10) / 10 });
  }

  // Peak detection
  let peakGlucoseMgDl = params.Gb;
  let peakTimeMins = 0;
  for (const pt of curve) {
    if (pt.G > peakGlucoseMgDl) {
      peakGlucoseMgDl = pt.G;
      peakTimeMins = pt.t;
    }
  }

  // Trapezoidal AUC integration (above fasting baseline)
  let auc = 0;
  for (let i = 1; i < curve.length; i++) {
    const g1 = Math.max(0, curve[i - 1].G - params.Gb);
    const g2 = Math.max(0, curve[i].G - params.Gb);
    auc += ((g1 + g2) / 2) * 1; // 1 minute intervals
  }
  auc = Math.round(auc);

  // Clinical spike risk classification (ADA postprandial: Rise <= 50 mg/dL / Peak < 140 mg/dL = Low)
  const rise = peakGlucoseMgDl - params.Gb;
  const spikeRisk: 'Low' | 'Moderate' | 'High' =
    rise <= 50 ? 'Low' : rise <= 90 ? 'Moderate' : 'High';

  return { curve, peakGlucoseMgDl, peakTimeMins, auc, spikeRisk };
}

/**
 * Utility: classify a GI value into a human-readable label
 */
export function classifyGlycemicIndex(gi: number): string {
  if (gi <= 55) return 'Low GI';
  if (gi <= 69) return 'Medium GI';
  return 'High GI';
}

/**
 * Utility: get the peak zone color for the SVG glucose curve
 */
export function getPeakZoneColor(peakMgDl: number): {
  stroke: string;
  fill: string;
  label: string;
} {
  if (peakMgDl < 140) return { stroke: '#10B981', fill: '#10B98120', label: 'Normal' };
  if (peakMgDl < 180) return { stroke: '#F59E0B', fill: '#F59E0B20', label: 'Elevated' };
  return { stroke: '#F43F5E', fill: '#F43F5E20', label: 'Danger Zone' };
}
