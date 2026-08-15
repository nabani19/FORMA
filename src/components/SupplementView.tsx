import React from 'react';
import { useApp } from '../context/AppContext';
import { Pill, ShieldCheck, CheckCircle2, Sparkles, Lock, ArrowUpRight, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';

interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  rationale: string;
  evidenceRating: string;
  medicalCheckPassed: boolean;
  estMonthlyCostINR: number;
  priorityRank: number;
  clinicalCategory: string;
  benefitBadge: string;
}

export const SupplementView: React.FC = () => {
  const { user, updateUser, showToast } = useApp();

  // ── Global Synchronized User Budget ─────────────────────────────
  const userBudget = user?.supplementBudgetInr ?? 3500;
  const mealMonthlyBudget = user?.monthlyBudgetInr ?? 6000;

  // ── 6 Clinically Verified Supplements Ranked by Clinical Priority ─
  const allSupplements: SupplementItem[] = [
    {
      id: 'supp_3',
      name: 'Vitamin D3 + K2 (MK-7 Micro-Encapsulated)',
      dosage: '5,000 IU D3 + 100mcg K2',
      timing: 'Morning with fat-containing breakfast',
      rationale: 'Top clinical essential. Corrects severe Vitamin D3 deficiencies (<30 ng/mL) ubiquitous across Indian populations. MK-7 K2 prevents vascular calcification and directs calcium directly to bone matrix.',
      evidenceRating: 'A+ (Essential Baseline)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 350,
      priorityRank: 1,
      clinicalCategory: 'Immunity & Bone Biomarkers',
      benefitBadge: 'Priority #1 Essential',
    },
    {
      id: 'supp_2',
      name: 'Creatine Monohydrate (Creapure® 200 Mesh)',
      dosage: '5g daily',
      timing: 'Anytime with carbohydrates/protein',
      rationale: 'Gold standard ergogenic aid (ISSN 2024). Saturates intramuscular phosphocreatine reserves to accelerate ATP regeneration, enhancing strength output by 8–14% and supporting neural recovery.',
      evidenceRating: 'A+ (Gold Standard)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 650,
      priorityRank: 2,
      clinicalCategory: 'ATP Energy & Cellular Strength',
      benefitBadge: 'Priority #2 Ergogenic',
    },
    {
      id: 'supp_1',
      name: 'Unflavored Whey Protein Isolate (90%)',
      dosage: '30g (1 scoop)',
      timing: 'Post-workout / Morning',
      rationale: 'Delivers 27g of pure, fast-absorbing complete protein containing 5.5g BCAAs and 2.7g Leucine. Triggers mTOR pathway to maximize Muscle Protein Synthesis (MPS) within your daily macro targets.',
      evidenceRating: 'A+ (Strong Evidence)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 1950,
      priorityRank: 3,
      clinicalCategory: 'Muscle Protein Synthesis',
      benefitBadge: 'Priority #3 Macro Core',
    },
    {
      id: 'supp_4',
      name: 'Triple Strength Omega-3 Fish Oil (1000mg EPA/DHA)',
      dosage: '2 softgels daily',
      timing: 'With lunch or dinner',
      rationale: 'High-potency EPA/DHA reduces systemic inflammation and post-exercise DOMS soreness, optimizes triglyceride profiles, and improves cellular membrane fluidity per AHA guidelines.',
      evidenceRating: 'A (High Support)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 750,
      priorityRank: 4,
      clinicalCategory: 'Cardiovascular & Anti-Inflammatory',
      benefitBadge: 'Priority #4 Recovery',
    },
    {
      id: 'supp_5',
      name: 'Magnesium Glycinate (Elemental 400mg)',
      dosage: '400mg',
      timing: '45 mins before bedtime',
      rationale: 'Chelated high-bioavailability magnesium activates GABAergic neural synthesis for deep Slow-Wave Sleep (SWS), prevents nocturnal muscle spasms, and accelerates central nervous system restoration.',
      evidenceRating: 'A (High Support)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 450,
      priorityRank: 5,
      clinicalCategory: 'Deep Sleep & Neuromuscular',
      benefitBadge: 'Priority #5 Sleep CNS',
    },
    {
      id: 'supp_6',
      name: 'Zinc Picolinate (25mg) + Copper Balance',
      dosage: '25mg',
      timing: 'With lunch',
      rationale: 'Essential trace cofactor required for testosterone synthesis, immune T-lymphocyte proliferation, cellular antioxidant defense, and thyroid hormone T3/T4 metabolic balance.',
      evidenceRating: 'A (High Support)',
      medicalCheckPassed: true,
      estMonthlyCostINR: 280,
      priorityRank: 6,
      clinicalCategory: 'Endocrine & Cellular Immunity',
      benefitBadge: 'Priority #6 Micronutrient',
    },
  ];

  // ── AI Smart Budget Obedience Engine ─────────────────────────────
  // Automatically selects the best clinical supplements in ranked order
  // strictly fitting within userBudget with ZERO overspend.
  let runningCost = 0;
  const optimizedList = allSupplements.map((supp) => {
    if (runningCost + supp.estMonthlyCostINR <= userBudget) {
      runningCost += supp.estMonthlyCostINR;
      return { ...supp, isIncluded: true };
    }
    return { ...supp, isIncluded: false };
  });

  const includedSupplements = optimizedList.filter((s) => s.isIncluded);
  const optionalSupplements = optimizedList.filter((s) => !s.isIncluded);

  const totalMonthlyINR = includedSupplements.reduce((acc, s) => acc + s.estMonthlyCostINR, 0);
  const budgetRemaining = Math.max(0, userBudget - totalMonthlyINR);
  const budgetUtilizationPct = userBudget > 0 ? Math.min(100, Math.round((totalMonthlyINR / userBudget) * 100)) : 0;

  const handleExpandBudget = (additionalCost: number) => {
    const newBudget = userBudget + additionalCost;
    updateUser({ supplementBudgetInr: newBudget });
    showToast(`Budget expanded to ₹${newBudget.toLocaleString('en-IN')}/mo to unlock next tier!`, 'success');
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4 animate-fade-in" data-testid="supplement-view">

      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Pill className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">AI Clinical Supplement Advisor</h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> 100% BUDGET OBEYED
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Every supplement is scientifically ranked by clinical return-on-investment and strictly fitted within your 
            <strong className="text-purple-300 font-mono"> ₹{userBudget.toLocaleString('en-IN')}/month</strong> budget. Zero overspending guaranteed.
          </p>
        </div>

        {/* Live Budget Utilization Card */}
        <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 min-w-[240px] shadow-lg shrink-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300 uppercase tracking-wider mb-1">
            <span>Stack Allocation</span>
            <span className="text-emerald-400 font-mono font-bold">{budgetUtilizationPct}% Used</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-400">
            ₹{totalMonthlyINR.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-slate-400 font-normal">/ ₹{userBudget.toLocaleString('en-IN')}</span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${budgetUtilizationPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>{includedSupplements.length} of {allSupplements.length} Supplements</span>
            <span className="text-emerald-300 font-bold">₹{budgetRemaining} Buffer</span>
          </div>
        </div>
      </div>

      {/* ── Central Synchronized Budget Controller ──────────────────── */}
      <BudgetSettingsPanel />

      {/* ── Combined Health Budget Summary ─────────────────────────── */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Synchronized Monthly Health Investment:</span>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-emerald-300">🍛 Food: <strong>₹{mealMonthlyBudget.toLocaleString('en-IN')}/mo</strong></span>
          <span className="text-purple-300">💊 Supplements: <strong>₹{userBudget.toLocaleString('en-IN')}/mo</strong></span>
          <span className="text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
            Total: ₹{(mealMonthlyBudget + userBudget).toLocaleString('en-IN')} / month
          </span>
        </div>
      </div>

      {/* ── AI 100% Optimized Stack Banner ──────────────────────────── */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 border border-purple-500/40 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>AI Optimized Protocol ({includedSupplements.length} Selected)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                100% In Budget
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Strictly selected in clinical hierarchy for your <span className="text-purple-300 font-semibold">{user.healthGoal?.replace('_', ' ').toUpperCase()}</span> goal. Total cost is exactly <strong className="text-emerald-400">₹{totalMonthlyINR}</strong> (obeying your ₹{userBudget} limit).
            </p>
          </div>
        </div>
      </div>

      {/* ── 1. ACTIVE SUPPLEMENTS IN BUDGET (100% OBEYED) ─────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Active Clinical Stack ({includedSupplements.length} of {allSupplements.length})
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            ₹{totalMonthlyINR.toLocaleString('en-IN')} / month
          </span>
        </div>

        {includedSupplements.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="text-sm font-bold text-slate-200">Budget set too low to include minimum tier</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please adjust your supplement budget above (minimum ₹350/mo for Vitamin D3+K2) to activate your AI recommendations.
            </p>
            <button
              onClick={() => handleExpandBudget(500)}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Set Budget to ₹500/mo
            </button>
          </div>
        ) : (
          includedSupplements.map((supp) => (
            <div
              key={supp.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-3 backdrop-blur-xl relative overflow-hidden"
            >
              {/* Left edge indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-purple-500" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 pl-1">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-100 text-base font-heading">{supp.name}</h4>
                      <span className="text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-mono">
                        {supp.benefitBadge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{supp.clinicalCategory}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:self-center self-end">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                    {supp.evidenceRating}
                  </span>
                  <span className="text-sm font-extrabold text-purple-400 font-mono bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    ₹{supp.estMonthlyCostINR}/mo
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1">{supp.rationale}</p>

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
                  <span className="text-[10px] text-slate-400 font-medium block">Budget Status</span>
                  <strong className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% In Budget
                  </strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── 2. OPTIONAL NEXT TIER (LOCKED BY CURRENT BUDGET) ─────────── */}
      {optionalSupplements.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Optional Upgrades (Requires Expanding Budget)
            </h3>
            <span className="text-xs text-slate-400">
              Not included in your ₹{userBudget} cap
            </span>
          </div>

          <div className="space-y-3">
            {optionalSupplements.map((supp) => {
              const shortfall = supp.estMonthlyCostINR - budgetRemaining;
              return (
                <div
                  key={supp.id}
                  className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4 transition-all opacity-85 hover:opacity-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-300 font-heading">{supp.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        {supp.benefitBadge}
                      </span>
                      <span className="text-xs font-mono text-purple-400/90 font-bold">
                        ₹{supp.estMonthlyCostINR}/mo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-2xl">{supp.rationale}</p>
                  </div>

                  <button
                    onClick={() => handleExpandBudget(shortfall > 0 ? shortfall : supp.estMonthlyCostINR)}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500 hover:text-slate-950 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shrink-0"
                    title={`Expand budget by ₹${shortfall} to unlock`}
                  >
                    <span>+ Add (₹{supp.estMonthlyCostINR}/mo)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
