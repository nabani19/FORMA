import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, DietaryPreference, Gender, ActivityLevel, HealthGoal } from '../types';
import { ArrowRight, Check, ShieldAlert, Sparkles, Calculator, Target, Lock } from 'lucide-react';
import { ALL_DIETARY_REGIMES, ALL_FOOD_ALLERGENS } from '../data/mockFoodDatabase';
import { calculateClinicalNutrition, CalculationFormula } from '../utils/whoFormulas';

export const OnboardingWizard: React.FC = () => {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [firstName, setFirstName] = useState(user.firstName || 'Jane');
  const [lastName, setLastName] = useState(user.lastName || 'Doe');
  const [gender, setGender] = useState<Gender>(user.gender || 'female');
  const [heightCm, setHeightCm] = useState(user.heightCm || 168);
  const [weightKg, setWeightKg] = useState(user.weightKg || 62.5);
  const [age, setAge] = useState(26);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user.activityLevel || 'moderately_active');
  const [healthGoal, setHealthGoal] = useState<HealthGoal>(user.healthGoal || 'muscle_gain');
  const [formula, setFormula] = useState<CalculationFormula>('who_fao');
  const [monthlyBudgetInr, setMonthlyBudgetInr] = useState(user.monthlyBudgetInr || 6000);

  // Comprehensive Dietary & Allergen List
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([
    'High-Protein Hypertrophy',
    'Gluten-Free (Celiac Safe)'
  ]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['Peanuts']);

  const toggleRestriction = (name: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const toggleAllergy = (name: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const clinicalResults = calculateClinicalNutrition({
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel,
    healthGoal,
    formula,
  });

  const handleFinish = () => {
    const updatedUser: User = {
      ...user,
      firstName,
      lastName,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      healthGoal,
      calculationFormula: formula,
      dailyCalorieTarget: clinicalResults.caloriesTarget,
      dailyProteinTargetG: clinicalResults.proteinGrams,
      dailyCarbsTargetG: clinicalResults.carbsGrams,
      dailyFatTargetG: clinicalResults.fatsGrams,
      dailyFiberTargetG: clinicalResults.fiberGrams,
      dailyBudgetInr: Math.round(monthlyBudgetInr / 30),
      monthlyBudgetInr: monthlyBudgetInr,
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    };

    const newPrefs: DietaryPreference[] = [
      ...selectedRestrictions.map((r, i) => ({
        preferenceId: `pref_r_${i}`,
        userId: user.userId,
        type: 'restriction' as const,
        value: r,
      })),
      ...selectedAllergies.map((a, i) => ({
        preferenceId: `pref_a_${i}`,
        userId: user.userId,
        type: 'allergy' as const,
        value: a,
      })),
    ];

    completeOnboarding(updatedUser, newPrefs);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden" style={{ backgroundColor: '#121A2B' }}>
        
        {/* Ambient glow */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Wizard Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-100 flex flex-wrap items-center gap-2">
                  Welcome to Forma
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                    WHO 2024 • ICMR-NIN
                  </span>
                </h1>

                {/* Fix #1: Outcome-focused support text (16px / 24px line height, max-w 280px mobile / 520px desktop, color #B8C0D4 on #121A2B, CR >= 7:1) */}
                <p
                  className="mt-1.5 text-[16px] leading-[24px] max-w-[280px] md:max-w-[520px] font-normal"
                  style={{ color: '#B8C0D4' }}
                >
                  Unlock your clinical metabolic plan, Adonis V-Taper targets, and personalized budget meal blueprint in under 60 seconds.
                </p>
                <p className="text-xs text-slate-400 mt-1">Step {step} of 3 • Clinical Biometrics, Cultural Regimes & Budget</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto shrink-0">
              {step === 1 ? '1. Biometrics & Budget' : step === 2 ? '2. Regimes & Allergies' : '3. Clinical Targets'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Fix #2: Trust & Reassurance Row (16px lock, 14px text, 16px below on desktop / 12px on mobile, fill #111827, border #2A3348, text #D7DDEA) */}
          <div
            className="mt-3 md:mt-4 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-[14px] leading-snug border transition-all"
            style={{
              backgroundColor: '#111827',
              borderColor: '#2A3348',
              color: '#D7DDEA',
            }}
          >
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" style={{ width: 16, height: 16 }} />
            <span>
              <strong className="font-semibold text-slate-100">Private & Secure:</strong> Your biometrics, health biomarkers, and budget remain encrypted locally and are never shared.
            </span>
          </div>
        </div>

        {/* STEP 1: Personal Details & Monthly Food Budget */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Daily Physical Activity Level (WHO PAL)</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="sedentary">Sedentary (1.40 PAL • Seated work)</option>
                  <option value="lightly_active">Lightly Active (1.55 PAL • 1-3 days exercise)</option>
                  <option value="moderately_active">Moderately Active (1.75 PAL • 3-5 days gym)</option>
                  <option value="very_active">Very Active (1.90 PAL • 6-7 days hard training)</option>
                  <option value="extra_active">Extra Active (2.10 PAL • Competitive athlete)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Monthly Food Budget (₹ INR)</span>
                  <span className="text-emerald-400 font-mono text-[11px]">~₹{Math.round(monthlyBudgetInr / 30)}/day</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={monthlyBudgetInr}
                    onChange={(e) => setMonthlyBudgetInr(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. 6000"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                <span>Next: 22 Regimes & Allergen Safeguards</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Comprehensive 22 Dietary Regimes & 18 Food Allergens */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in max-h-[62vh] overflow-y-auto pr-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  Select Dietary Regimes & Cultural Preferences (22 Types)
                </h3>
                <span className="text-[11px] text-slate-400">{selectedRestrictions.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_DIETARY_REGIMES.map((item) => {
                  const active = selectedRestrictions.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleRestriction(item.name)}
                      title={item.desc}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {active ? `✓ ${item.name}` : `+ ${item.name}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Select Known Food Allergies (Allergen Safeguards — 18 Types)
                </h3>
                <span className="text-[11px] text-rose-400">{selectedAllergies.length} active guards</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Scanned food items or meal suggestions containing these flagged allergens will trigger an instant high-contrast warning banner.
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_FOOD_ALLERGENS.map((item) => {
                  const active = selectedAllergies.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAllergy(item.name)}
                      title={item.severity}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                        active
                          ? 'bg-rose-500/25 border-rose-500 text-rose-200 shadow-md shadow-rose-500/10 ring-1 ring-rose-500/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {active ? `⚠️ ${item.name}` : `+ ${item.name}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between sticky bottom-0 bg-slate-900 py-2 border-t border-slate-800">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                <span>Next: Scientific WHO Calculation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Scientific Clinical Formula & Health Objective */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in max-h-[62vh] overflow-y-auto pr-2">
            
            {/* Formula Selector */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-heading">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  Clinical Energy Calculation Formula Standard:
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  ISO / WHO Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'who_fao', name: 'WHO / FAO / UNU 2004', desc: 'World Health Organization Gold Standard' },
                  { id: 'mifflin_st_jeor', name: 'Mifflin-St Jeor (ADA)', desc: 'American Dietetic Association Standard' },
                  { id: 'katch_mcardle', name: 'Katch-McArdle', desc: 'Lean Body Mass & Body Fat formula' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormula(f.id as CalculationFormula)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                      formula === f.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-slate-100">{f.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Select Your Health Objective
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'weight_loss', label: 'Fat Reduction (Deficit)', desc: 'Safe 450 kcal WHO deficit with muscle sparing protein' },
                  { id: 'muscle_gain', label: 'Hypertrophy (Surplus)', desc: '2.0g/kg high protein surplus for maximum lean growth' },
                  { id: 'maintain_weight', label: 'Metabolic Balance', desc: 'Sustained energy & weight maintenance' },
                  { id: 'heart_health', label: 'Heart & Longevity', desc: 'Low sodium, low saturated fat & high Omega-3' },
                  { id: 'diabetic_management', label: 'Diabetic & Low GI', desc: 'Low Glycemic Index & fiber stabilization' },
                ].map((g) => {
                  const active = healthGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setHealthGoal(g.id as HealthGoal)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-100">{g.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">{g.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Preview */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Calculated Scientific Targets ({clinicalResults.formulaDescription}):</span>
                <span className="text-emerald-400 font-mono">{clinicalResults.proteinGramsPerKg} g/kg Protein</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-emerald-400 font-extrabold text-lg font-mono">{clinicalResults.caloriesTarget}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Daily kcal</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-sky-400 font-extrabold text-lg font-mono">{clinicalResults.proteinGrams}g</div>
                  <div className="text-[10px] text-slate-400 font-medium">Protein</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-extrabold text-lg font-mono">{clinicalResults.carbsGrams}g</div>
                  <div className="text-[10px] text-slate-400 font-medium">Carbohydrates</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-rose-400 font-extrabold text-lg font-mono">{clinicalResults.fatsGrams}g</div>
                  <div className="text-[10px] text-slate-400 font-medium">Fats</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Fiber Target: <strong className="text-emerald-300">{clinicalResults.fiberGrams}g</strong></span>
                <span>Water: <strong className="text-sky-300">{clinicalResults.waterLiters}L/day</strong></span>
                <span>Sat Fat Limit: <strong className="text-rose-300">&lt; {clinicalResults.saturatedFatLimitGrams}g</strong></span>
                <span>Budget: <strong className="text-amber-300">₹{Math.round(monthlyBudgetInr / 30)}/day</strong></span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between sticky bottom-0 bg-slate-900 py-2 border-t border-slate-800">
              <button
                onClick={() => setStep(2)}
                className="text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 transition-all"
              >
                <Check className="w-5 h-5" />
                <span>Launch App Dashboard</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
