import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SlidersHorizontal, Check, X, ChevronDown, ChevronUp, Utensils, Pill, Calculator } from 'lucide-react';

/**
 * BudgetSettingsPanel — All budgets are set in ₹/month.
 * Meal monthly budget → stored as monthlyBudgetInr & dailyBudgetInr (derived ÷ 30).
 * Supplement monthly budget → stored as supplementBudgetInr.
 */
export const BudgetSettingsPanel: React.FC = () => {
  const { user, updateUser, showToast } = useApp();
  const [open, setOpen] = useState(false);

  // Local edit state — committed only when user clicks Save
  const [monthlyMeal, setMonthlyMeal] = useState(user?.monthlyBudgetInr     || 6000);
  const [suppBudget,  setSuppBudget]  = useState(user?.supplementBudgetInr  || 3500);

  const combinedTotal = monthlyMeal + suppBudget;
  const dailyMeal     = Math.round(monthlyMeal / 30);

  const handleSave = () => {
    updateUser({
      monthlyBudgetInr:    monthlyMeal,
      dailyBudgetInr:      dailyMeal,
      supplementBudgetInr: suppBudget,
    });
    showToast('Budget settings saved!', 'success');
    setOpen(false);
  };

  const handleDiscard = () => {
    setMonthlyMeal(user?.monthlyBudgetInr    || 6000);
    setSuppBudget(user?.supplementBudgetInr  || 3500);
    setOpen(false);
  };

  const presetsMonthlyMeal = [2000, 3000, 4000, 5000, 6000, 8000, 10000];
  const presetsSupp        = [1000, 1500, 2000, 2500, 3500, 5000];

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl shadow-xl overflow-hidden" data-testid="budget-settings-panel">

      {/* Toggle Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-all"
        data-testid="btn-toggle-budget-settings"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-100">Budget Settings</div>
            <div className="text-[10px] text-slate-400 font-mono" data-testid="budget-summary-header">
              🍛 ₹{user?.monthlyBudgetInr || 6000}/mo meals &nbsp;·&nbsp;
              💊 ₹{user?.supplementBudgetInr || 3500}/mo supplements &nbsp;·&nbsp;
              Total: ₹{(user?.monthlyBudgetInr || 6000) + (user?.supplementBudgetInr || 3500)}/mo
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {open ? 'Close' : 'Adjust Budgets'}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expandable Editor */}
      {open && (
        <div className="border-t border-slate-800 px-5 pb-5 pt-4 space-y-6 animate-fade-in" data-testid="budget-editor-content">

          {/* ── 1. Monthly Meal Budget ──────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-slate-200">Monthly Meal Budget</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold font-mono text-emerald-400" data-testid="meal-budget-display">
                  ₹{monthlyMeal.toLocaleString('en-IN')}
                  <span className="text-xs text-slate-400 font-normal">/month</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  ÷ 30 days = <span className="text-emerald-300 font-bold">₹{dailyMeal}/day</span>
                </div>
              </div>
            </div>

            <input
              type="range"
              min={1000} max={30000} step={500}
              value={monthlyMeal}
              onChange={(e) => setMonthlyMeal(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 rounded-full"
              data-testid="input-meal-budget-range"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹1,000 min</span>
              <span className="text-emerald-400 font-bold">₹{monthlyMeal.toLocaleString('en-IN')} selected</span>
              <span>₹30,000 max</span>
            </div>

            {/* Direct number input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">Or type exact:</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={1000} max={30000} step={500}
                  value={monthlyMeal}
                  onChange={(e) => setMonthlyMeal(Math.max(1000, Math.min(30000, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-100 font-bold font-mono focus:outline-none focus:border-emerald-500"
                  data-testid="input-meal-budget-number"
                />
              </div>
              <span className="text-xs text-slate-400 shrink-0">per month</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {presetsMonthlyMeal.map((p) => (
                <button
                  key={p}
                  onClick={() => setMonthlyMeal(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    monthlyMeal === p
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500/50'
                  }`}
                  data-testid={`btn-preset-meal-${p}`}
                >
                  ₹{p.toLocaleString('en-IN')}/mo
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80" />

          {/* ── 2. Monthly Supplement Budget ───────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-slate-200">Supplement Budget</span>
              </div>
              <div className="text-lg font-extrabold font-mono text-purple-400" data-testid="supp-budget-display">
                ₹{suppBudget.toLocaleString('en-IN')}
                <span className="text-xs text-slate-400 font-normal">/month</span>
              </div>
            </div>

            <input
              type="range"
              min={500} max={10000} step={100}
              value={suppBudget}
              onChange={(e) => setSuppBudget(Number(e.target.value))}
              className="w-full accent-purple-500 h-2 rounded-full"
              data-testid="input-supp-budget-range"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹500 min</span>
              <span className="text-purple-400 font-bold">₹{suppBudget.toLocaleString('en-IN')} selected</span>
              <span>₹10,000 max</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">Or type exact:</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={500} max={10000} step={100}
                  value={suppBudget}
                  onChange={(e) => setSuppBudget(Math.max(500, Math.min(10000, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-100 font-bold font-mono focus:outline-none focus:border-purple-500"
                  data-testid="input-supp-budget-number"
                />
              </div>
              <span className="text-xs text-slate-400 shrink-0">per month</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {presetsSupp.map((p) => (
                <button
                  key={p}
                  onClick={() => setSuppBudget(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    suppBudget === p
                      ? 'bg-purple-500 text-slate-950 border-purple-500'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500/50'
                  }`}
                  data-testid={`btn-preset-supp-${p}`}
                >
                  ₹{p.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80" />

          {/* ── 3. Combined Monthly Total ───────────────────────────── */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Calculator className="w-4 h-4 text-amber-400" />
              Combined Monthly Health Budget
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 mb-1">🍛 Meals/Food</div>
                <div className="font-extrabold font-mono text-emerald-400">₹{monthlyMeal.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">per month</div>
                <div className="text-[10px] text-emerald-300 mt-0.5 font-bold">≈ ₹{dailyMeal}/day</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 mb-1">💊 Supplements</div>
                <div className="font-extrabold font-mono text-purple-400">₹{suppBudget.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">per month</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 mb-1">💰 Total</div>
                <div className="font-extrabold font-mono text-amber-400" data-testid="combined-budget-total">₹{combinedTotal.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">per month</div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 text-center">
              ₹{monthlyMeal.toLocaleString('en-IN')} meals + ₹{suppBudget.toLocaleString('en-IN')} supplements ={' '}
              <span className="text-amber-300 font-bold">₹{combinedTotal.toLocaleString('en-IN')} / month</span>
            </div>
          </div>

          {/* ── Save / Discard ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              data-testid="btn-save-budget"
            >
              <Check className="w-4 h-4" />
              Save Budget Settings
            </button>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-xl transition-all text-xs border border-slate-700"
              data-testid="btn-discard-budget"
            >
              <X className="w-3.5 h-3.5" />
              Discard
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            All budgets are in ₹ INR and saved locally across the entire app.
          </p>
        </div>
      )}
    </div>
  );
};
