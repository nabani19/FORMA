import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GroceryItem } from '../types';
import { ShoppingBag, Check, Plus, Sparkles, Trash2, Sliders, CheckCircle2, RotateCcw, TrendingUp, ShieldAlert, Zap } from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';
import { deriveDailyBudget, formatINR } from '../utils/nutritionUtils';

interface ExtendedGroceryItem extends GroceryItem {
  protein_g?: number;
  calories?: number;
  priorityRank: number;
  nutritionHighlight?: string;
}

export const GroceryPlannerView: React.FC = () => {
  const { showToast, user } = useApp();
  const [budgetPeriod, setBudgetPeriod] = useState<'weekly' | 'monthly'>('monthly');

  // ── Global User Budget (Absolute Top Priority) ────────────────────
  const userMonthlyBudget = user?.monthlyBudgetInr ?? 6000;
  const userDailyBudget   = user?.dailyBudgetInr ?? deriveDailyBudget(userMonthlyBudget);
  const userWeeklyBudget  = Math.round(userMonthlyBudget / 4.3);
  const supplementBudget  = user?.supplementBudgetInr ?? 3500;

  // ── 10 High-Protein & Clinical Whole Food Staples ─────────────────
  const defaultStaples: ExtendedGroceryItem[] = [
    {
      id: 'g_1',
      name: 'Defatted Soya Chunks (52% Protein Bulk Pack)',
      category: 'Grains & Pulses',
      quantity: '2 kg (Bulk Pack)',
      estPriceINR: 180,
      purchased: true,
      protein_g: 1040,
      calories: 6900,
      priorityRank: 1,
      nutritionHighlight: '1040g pure protein (Most cost-effective in India)',
    },
    {
      id: 'g_2',
      name: 'Fresh Farm Eggs (30-Egg Tray)',
      category: 'Protein & Dairy',
      quantity: '30 pcs',
      estPriceINR: 210,
      purchased: true,
      protein_g: 180,
      calories: 2100,
      priorityRank: 2,
      nutritionHighlight: '180g 100% bioavailable protein + Choline',
    },
    {
      id: 'g_3',
      name: 'Yellow Moong Dal & High-Fiber Chana Dal',
      category: 'Grains & Pulses',
      quantity: '2 kg',
      estPriceINR: 260,
      purchased: true,
      protein_g: 480,
      calories: 6800,
      priorityRank: 3,
      nutritionHighlight: '480g plant protein + 320g dietary fiber',
    },
    {
      id: 'g_4',
      name: 'Rolled Oats & Whole Grain Brown Rice',
      category: 'Grains & Pulses',
      quantity: '3 kg',
      estPriceINR: 360,
      purchased: true,
      protein_g: 240,
      calories: 10800,
      priorityRank: 4,
      nutritionHighlight: 'Complex Low-GI slow-release carbs',
    },
    {
      id: 'g_5',
      name: 'Fresh Spinach (Palak), Methi & Broccoli',
      category: 'Produce',
      quantity: '4 bunches',
      estPriceINR: 120,
      purchased: true,
      protein_g: 30,
      calories: 400,
      priorityRank: 5,
      nutritionHighlight: 'Iron, Folate, Lutein & Active Nitrates',
    },
    {
      id: 'g_6',
      name: 'Double-Toned Greek Curd / Dahi',
      category: 'Protein & Dairy',
      quantity: '2 kg',
      estPriceINR: 240,
      purchased: true,
      protein_g: 120,
      calories: 1200,
      priorityRank: 6,
      nutritionHighlight: 'Probiotics & slow-digesting Casein protein',
    },
    {
      id: 'g_7',
      name: 'Sprouting Whole Moong & Kala Chana',
      category: 'Produce',
      quantity: '1 kg',
      estPriceINR: 140,
      purchased: true,
      protein_g: 240,
      calories: 3400,
      priorityRank: 7,
      nutritionHighlight: 'Living enzyme sprouted micronutrients',
    },
    {
      id: 'g_8',
      name: 'High-Protein Low-Fat Paneer / Tofu',
      category: 'Protein & Dairy',
      quantity: '1.5 kg',
      estPriceINR: 540,
      purchased: false,
      protein_g: 300,
      calories: 3900,
      priorityRank: 8,
      nutritionHighlight: '300g complete amino acid matrix',
    },
    {
      id: 'g_9',
      name: 'Roasted Foxnuts (Makhana) & Chia Seeds',
      category: 'Pantry & Spices',
      quantity: '500g',
      estPriceINR: 280,
      purchased: false,
      protein_g: 65,
      calories: 1800,
      priorityRank: 9,
      nutritionHighlight: 'Plant Omega-3 ALAs & evening satiety',
    },
    {
      id: 'g_10',
      name: 'Pure Cow Ghee & Cold-Pressed Mustard Oil',
      category: 'Pantry & Spices',
      quantity: '1 Liter',
      estPriceINR: 480,
      purchased: false,
      protein_g: 0,
      calories: 8800,
      priorityRank: 10,
      nutritionHighlight: 'Healthy fats & fat-soluble vitamin uptake',
    },
  ];

  const [items, setItems] = useState<ExtendedGroceryItem[]>(defaultStaples);

  // ── Auto-Optimize to User's Given Budget ───────────────────────────
  // When budget changes or user clicks "Auto-Fit", automatically activate
  // items strictly up to the user's budget without ever exceeding it.
  const autoOptimizeToBudget = () => {
    const targetWeeklyCap = userWeeklyBudget;
    let accumulated = 0;
    
    // Sort by clinical priority
    const sorted = [...items].sort((a, b) => a.priorityRank - b.priorityRank);
    const updated = sorted.map((item) => {
      if (accumulated + item.estPriceINR <= targetWeeklyCap) {
        accumulated += item.estPriceINR;
        return { ...item, purchased: true };
      } else {
        return { ...item, purchased: false };
      }
    });

    setItems(updated);
    showToast(`Optimized shopping cart strictly under your ₹${userMonthlyBudget.toLocaleString('en-IN')}/mo budget!`, 'success');
  };

  // Initial auto-sync to user's given budget on mount
  useEffect(() => {
    autoOptimizeToBudget();
  }, [userMonthlyBudget]);

  // ── User Customization Handlers ────────────────────────────────────
  const togglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from shopping list', 'info');
  };

  // Add Custom Item State
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<GroceryItem['category']>('Produce');
  const [newQty, setNewQty] = useState('1 kg');
  const [newPrice, setNewPrice] = useState('150');

  const handleAddItem = () => {
    if (!newName.trim()) return;
    const priceNum = Number(newPrice) || 100;
    const newItem: ExtendedGroceryItem = {
      id: `g_${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      quantity: newQty,
      estPriceINR: priceNum,
      purchased: true,
      priorityRank: 99,
      nutritionHighlight: 'User customized staple',
    };
    setItems((prev) => [newItem, ...prev]);
    setNewName('');
    showToast(`Added ${newItem.name} (₹${priceNum}) to customized list`, 'success');
  };

  // ── Calculations ──────────────────────────────────────────────────
  const activeItems = items.filter((i) => i.purchased);
  const inactiveItems = items.filter((i) => !i.purchased);

  const activeWeeklyCart = activeItems.reduce((acc, i) => acc + i.estPriceINR, 0);
  const activeMonthlyCart = Math.round(activeWeeklyCart * 4.3);

  const totalProteinG = activeItems.reduce((acc, i) => acc + (i.protein_g || 0), 0);
  const totalCalories = activeItems.reduce((acc, i) => acc + (i.calories || 0), 0);

  const currentPeriodCost   = budgetPeriod === 'weekly' ? activeWeeklyCart   : activeMonthlyCart;
  const currentPeriodBudget = budgetPeriod === 'weekly' ? userWeeklyBudget   : userMonthlyBudget;

  const budgetBuffer = Math.max(0, currentPeriodBudget - currentPeriodCost);
  const isOverBudget = currentPeriodCost > currentPeriodBudget;
  const budgetUtilizationPct = currentPeriodBudget > 0 ? Math.min(100, Math.round((currentPeriodCost / currentPeriodBudget) * 100)) : 0;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4 animate-fade-in" data-testid="grocery-planner-view">

      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-teal-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">AI Grocery List & Budget Planner</h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> USER BUDGET OBEYED
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Personalized market shopping list strictly obeying your defined{' '}
            <strong className="text-teal-300 font-mono">₹{userMonthlyBudget.toLocaleString('en-IN')}/month</strong> budget.
            Select, customize, and optimize items freely with real-time usable budget tracking.
          </p>
        </div>

        {/* Live Budget Utilization Card */}
        <div className={`border rounded-2xl p-4 min-w-[250px] shadow-lg shrink-0 ${
          isOverBudget ? 'bg-rose-500/10 border-rose-500/40' : 'bg-slate-950/80 border-teal-500/30'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-semibold text-teal-300 uppercase tracking-wider mb-1">
            <span>{budgetPeriod === 'weekly' ? 'Weekly Active Cart' : 'Monthly Projected Cart'}</span>
            <span className={`font-mono font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {budgetUtilizationPct}% Used
            </span>
          </div>
          <div className={`text-2xl font-extrabold font-mono ${isOverBudget ? 'text-rose-400' : 'text-teal-400'}`}>
            ₹{currentPeriodCost.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-slate-400 font-normal">/ ₹{currentPeriodBudget.toLocaleString('en-IN')}</span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
              }`}
              style={{ width: `${budgetUtilizationPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>{activeItems.length} Items Selected</span>
            {isOverBudget ? (
              <span className="text-rose-400 font-bold">⚠️ Exceeds by ₹{currentPeriodCost - currentPeriodBudget}</span>
            ) : (
              <span className="text-emerald-300 font-bold">₹{budgetBuffer} Unspent Buffer</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Central Synchronized Budget Controller ──────────────────── */}
      <BudgetSettingsPanel />

      {/* ── View Controls & Auto-Fit Toolbar ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Period Switcher */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Budget Period:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setBudgetPeriod('weekly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                budgetPeriod === 'weekly' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly (₹{userWeeklyBudget})
            </button>
            <button
              onClick={() => setBudgetPeriod('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                budgetPeriod === 'monthly' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly (₹{userMonthlyBudget})
            </button>
          </div>
        </div>

        {/* Auto-Fit to Budget Button */}
        <button
          onClick={autoOptimizeToBudget}
          className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-500/40 rounded-2xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-teal-300 transition-all shadow-md group"
          title="Recalculate list to strictly obey your exact budget"
        >
          <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>⚡ Auto-Fit to My ₹{userMonthlyBudget.toLocaleString('en-IN')} Budget</span>
        </button>

        {/* Reset / Select All */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-around gap-2">
          <button
            onClick={() => setItems((prev) => prev.map((i) => ({ ...i, purchased: true })))}
            className="text-xs text-slate-300 hover:text-teal-400 font-semibold"
          >
            Select All
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setItems((prev) => prev.map((i) => ({ ...i, purchased: false })))}
            className="text-xs text-slate-400 hover:text-rose-400 font-semibold"
          >
            Clear All
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setItems(defaultStaples)}
            className="text-xs text-teal-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* ── Add Custom Item Card ────────────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>Customize: Add Custom Food Item to List</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 text-xs">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Item name (e.g., Peanut Butter, Rolled Oats)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
          />
          <select
            value={newCat}
            onChange={(e) => setNewCat(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
          >
            <option value="Produce">Produce</option>
            <option value="Protein & Dairy">Protein & Dairy</option>
            <option value="Grains & Pulses">Grains & Pulses</option>
            <option value="Pantry & Spices">Pantry & Spices</option>
          </select>
          <input
            type="text"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            placeholder="Qty (e.g. 1 kg)"
            className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-center font-bold focus:outline-none"
          />
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="₹ Price"
            className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-center font-bold font-mono focus:outline-none"
          />
          <button
            onClick={handleAddItem}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ── 1. ACTIVE SHOPPING LIST (WITHIN BUDGET) ─────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Active Shopping Items ({activeItems.length} Selected)
          </h3>
          <span className="text-xs font-mono text-teal-400 font-bold">
            ₹{activeWeeklyCart}/week · ₹{activeMonthlyCart}/month
          </span>
        </div>

        {activeItems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <p className="text-xs text-slate-400">No items currently active in your shopping cart.</p>
            <button
              onClick={autoOptimizeToBudget}
              className="text-xs text-teal-400 font-bold underline"
            >
              Click here to Auto-Fit items to your ₹{userMonthlyBudget} budget
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {activeItems.map((item) => (
              <div
                key={item.id}
                onClick={() => togglePurchased(item.id)}
                className="flex items-center justify-between p-4 rounded-2xl border bg-slate-900/90 border-slate-800 hover:border-teal-500/40 transition-all cursor-pointer shadow-md group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center border bg-teal-500 border-teal-500 text-slate-950 shrink-0">
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100 font-heading">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    {item.nutritionHighlight && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.nutritionHighlight}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div className="text-xs">
                    <div className="font-extrabold text-slate-200 font-mono">{item.quantity}</div>
                    <div className="text-sm text-teal-400 font-extrabold font-mono">
                      ₹{item.estPriceINR}/wk
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteItem(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. OPTIONAL / UNSELECTED ITEMS ──────────────────────────── */}
      {inactiveItems.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
              Unselected / Optional Items ({inactiveItems.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              Click any item to add it to your active shopping cart
            </span>
          </div>

          <div className="space-y-2">
            {inactiveItems.map((item) => (
              <div
                key={item.id}
                onClick={() => togglePurchased(item.id)}
                className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-950/40 border-slate-800/60 opacity-65 hover:opacity-100 hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center border border-slate-700 bg-slate-900 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                    <span className="text-[10px] text-slate-500 ml-2">({item.quantity})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 font-semibold">+₹{item.estPriceINR}/wk</span>
                  <button
                    onClick={(e) => deleteItem(item.id, e)}
                    className="p-1 rounded text-slate-600 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          USABLE BUDGET OF THINGS & NUTRITIONAL ROI (AT THE END)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/30 border border-teal-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 font-heading">
                Usable Health Budget & Nutritional Yield
              </h3>
              <p className="text-xs text-slate-400">
                Live mathematical reconciliation of your food and supplement allocations
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 self-start sm:self-auto">
            100% User Budget Governed
          </span>
        </div>

        {/* 4-Stat Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">Your Food Budget</span>
            <div className="text-lg font-extrabold text-slate-100 font-mono">
              ₹{userMonthlyBudget.toLocaleString('en-IN')}
              <span className="text-[10px] text-slate-400 font-normal">/mo</span>
            </div>
            <span className="text-[10px] text-teal-400">₹{userDailyBudget}/day allowance</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">Cart Allocated Cost</span>
            <div className={`text-lg font-extrabold font-mono ${isOverBudget ? 'text-rose-400' : 'text-teal-400'}`}>
              ₹{activeMonthlyCart.toLocaleString('en-IN')}
              <span className="text-[10px] text-slate-400 font-normal">/mo</span>
            </div>
            <span className="text-[10px] text-slate-400">₹{activeWeeklyCart}/week actual</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">Usable Buffer / Savings</span>
            <div className={`text-lg font-extrabold font-mono ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOverBudget ? `-₹${activeMonthlyCart - userMonthlyBudget}` : `+₹${budgetBuffer}`}
            </div>
            <span className="text-[10px] text-emerald-300">
              {isOverBudget ? 'Exceeds budget cap' : 'Guaranteed unspent cash'}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">Total Protein Yield</span>
            <div className="text-lg font-extrabold text-sky-400 font-mono">
              {totalProteinG > 0 ? `${totalProteinG}g` : 'Custom'}
            </div>
            <span className="text-[10px] text-sky-300">
              {totalProteinG > 0 ? `~${Math.round(totalProteinG / 7)}g/day weekly avg` : 'Macro indexed'}
            </span>
          </div>
        </div>

        {/* Combined Health Investment Footer */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-300">
            <strong>Combined Monthly Health Plan:</strong> Food (₹{userMonthlyBudget.toLocaleString('en-IN')}) + Supplements (₹{supplementBudget.toLocaleString('en-IN')})
          </div>
          <div className="text-emerald-400 font-bold font-mono text-sm">
            Total Cap: ₹{(userMonthlyBudget + supplementBudget).toLocaleString('en-IN')} / month
          </div>
        </div>
      </div>

    </div>
  );
};
