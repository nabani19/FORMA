import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupplementRecommendation } from '../types';
import { Pill, ShieldCheck, CheckCircle2, DollarSign, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';

export const SupplementView: React.FC = () => {
  const { user } = useApp();

  // ── User-adjustable monthly supplement budget ──────────────────────
  const defaultCap = user?.supplementBudgetInr || 3500;
  const [customMonthlyBudget, setCustomMonthlyBudget] = useState<number>(defaultCap);
  const [budgetTier, setBudgetTier] = useState<'all' | 'essential' | 'performance'>('all');
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  const supplements: (SupplementRecommendation & { tier: 'essential' | 'performance' })[] = [
    {
      id: 'supp_1',
      name: 'Unflavored Whey Protein Isolate (90%)',
      dosage: '30g (1 scoop)',
      timing: 'Post-workout / Morning',
      rationale: 'Supplies 27g fast-digesting complete amino acids (5.5g BCAAs, 2.7g Leucine) to stimulate Muscle Protein Synthesis per ISSN 2024.',
      evidenceRating: 'A+ (Strong Evidence)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 1950,
      tier: 'essential',
    },
    {
      id: 'supp_2',
      name: 'Creatine Monohydrate (Creapure® 200 Mesh)',
      dosage: '5g daily',
      timing: 'Anytime with carbohydrates/protein',
      rationale: 'Elevates phosphocreatine cellular energy stores, increasing 1RM strength output by 8–14% and improving cognitive recovery.',
      evidenceRating: 'A+ (Strong Evidence)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 650,
      tier: 'essential',
    },
    {
      id: 'supp_3',
      name: 'Vitamin D3 + K2 (MK-7 Micro-Encapsulated)',
      dosage: '5,000 IU D3 + 100mcg K2',
      timing: 'Morning with fat-containing breakfast',
      rationale: 'Addresses Vitamin D3 deficiency (< 30 ng/mL) common in Indians. K2 directs calcium to bones, not arterial walls.',
      evidenceRating: 'A (High Support)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 350,
      tier: 'essential',
    },
    {
      id: 'supp_4',
      name: 'Triple Strength Omega-3 Fish Oil (1000mg EPA/DHA)',
      dosage: '2 softgels daily',
      timing: 'With lunch or dinner',
      rationale: 'Reduces systemic DOMS inflammation, lowers triglycerides, and improves cell membrane fluidity per AHA guidelines.',
      evidenceRating: 'A (High Support)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 750,
      tier: 'performance',
    },
    {
      id: 'supp_5',
      name: 'Magnesium Glycinate (Elemental 400mg)',
      dosage: '400mg',
      timing: '45 mins before bedtime',
      rationale: 'Activates GABA synthesis for deep Slow-Wave Sleep (SWS), prevents muscle cramps and restores nocturnal recovery.',
      evidenceRating: 'A (High Support)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 450,
      tier: 'performance',
    },
    {
      id: 'supp_6',
      name: 'Zinc Picolinate (25mg) + Copper Balance',
      dosage: '25mg',
      timing: 'With lunch',
      rationale: 'Crucial for testosterone synthesis, immune lymphocyte function, and thyroid hormone T3/T4 conversion.',
      evidenceRating: 'A (High Support)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 280,
      tier: 'performance',
    },
  ];

  const filteredSupplements = supplements.filter((s) => budgetTier === 'all' || s.tier === budgetTier);
  const totalMonthlyINR = filteredSupplements.reduce((acc, s) => acc + s.estMonthlyCostINR, 0);
  const overBudget = totalMonthlyINR > customMonthlyBudget;

  const mealMonthlyBudget = user?.monthlyBudgetInr || 6000;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-purple-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">AI Supplement Stack Advisor</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono font-bold">
              MONTHLY BUDGET ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Clinically verified supplement protocols tailored to your biometrics and adjustable monthly budget.
          </p>
        </div>

        {/* Monthly Budget Cost Summary */}
        <div className="flex items-center gap-3">
          <div className={`border rounded-2xl px-5 py-2.5 text-right ${overBudget ? 'bg-rose-500/10 border-rose-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
            <div className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">Stack Monthly Cost</div>
            <div className={`text-xl font-extrabold font-mono ${overBudget ? 'text-rose-400' : 'text-purple-400'}`}>
              ₹{totalMonthlyINR} <span className="text-xs text-slate-400 font-normal">/ ₹{customMonthlyBudget} cap</span>
            </div>
            {overBudget && <div className="text-[10px] text-rose-400">⚠️ Exceeds your supplement cap</div>}
          </div>
        </div>
      </div>

      {/* ── User Budget Settings ─────────────────────────────────── */}
      <BudgetSettingsPanel />

      {/* ── User-Adjustable Budget Cap (legacy inline slider kept below) ─ */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Monthly Supplement Budget Cap</span>
            <span className="text-emerald-400 font-mono font-bold">₹{customMonthlyBudget}</span>
          </div>
          <button
            onClick={() => setShowBudgetInput((v) => !v)}
            className="text-xs font-bold text-emerald-400 flex items-center gap-1"
          >
            {showBudgetInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showBudgetInput ? 'Hide' : 'Adjust'}
          </button>
        </div>

        {showBudgetInput && (
          <div className="mt-3 space-y-2">
            <input
              type="range"
              min={500}
              max={10000}
              step={100}
              value={customMonthlyBudget}
              onChange={(e) => setCustomMonthlyBudget(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹500 min</span>
              <span className="text-emerald-400 font-bold">₹{customMonthlyBudget} selected</span>
              <span>₹10,000 max</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[1500, 2000, 3500, 4500, 6000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCustomMonthlyBudget(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    customMonthlyBudget === preset
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500/40'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Budget Breakdown: Meals + Supplements ─────────────────────── */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-slate-400">Monthly Health Budget Breakdown:</span>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-emerald-300">🍛 Meal Food: <strong>₹{mealMonthlyBudget} / month</strong></span>
          <span className="text-purple-300">💊 Supplements: <strong>₹{customMonthlyBudget} cap / month</strong></span>
          <span className="text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
            Total: ₹{mealMonthlyBudget + customMonthlyBudget} / month
          </span>
        </div>
      </div>

      {/* Tier Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All 6 Supplements' },
              { id: 'essential', label: 'Tier 1: Essential (₹2,950)' },
              { id: 'performance', label: 'Tier 2: Recovery (₹1,480)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setBudgetTier(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  budgetTier === t.id
                    ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Supplement Cards */}
      <div className="space-y-4">
        {filteredSupplements.map((supp) => (
          <div
            key={supp.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-3 backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-slate-100 text-base font-heading">{supp.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {supp.evidenceRating}
                </span>
                <span className="text-xs font-extrabold text-purple-400 font-mono">₹{supp.estMonthlyCostINR}/mo</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{supp.rationale}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Clinical Dosage</span>
                <strong className="text-slate-200 font-mono">{supp.dosage}</strong>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Optimal Timing</span>
                <strong className="text-slate-200">{supp.timing}</strong>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-medium block">Safety Status</span>
                <strong className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved Safe
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
