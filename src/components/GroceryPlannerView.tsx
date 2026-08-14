import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GroceryItem } from '../types';
import { ShoppingBag, Check, Plus, Sparkles } from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';
import { deriveDailyBudget, formatINR } from '../utils/nutritionUtils';

export const GroceryPlannerView: React.FC = () => {
  const { showToast, user } = useApp();
  const [budgetPeriod, setBudgetPeriod] = useState<'weekly' | 'monthly'>('monthly');
  
  // Budget fully synced from user profile & utility
  const dailyBudget   = user?.dailyBudgetInr   || deriveDailyBudget(user?.monthlyBudgetInr);
  const supplementBudget = user?.supplementBudgetInr || 3500;

  const [items, setItems] = useState<GroceryItem[]>([
    { id: 'g_1', name: 'High-Protein Low-Fat Paneer / Tofu', category: 'Protein & Dairy', quantity: '1.5 kg', estPriceINR: 540, purchased: true },
    { id: 'g_2', name: 'Defatted Soya Chunks (52% Protein)', category: 'Grains & Pulses', quantity: '2 kg (Bulk Pack)', estPriceINR: 180, purchased: true },
    { id: 'g_3', name: 'Fresh Farm Eggs (30-Egg Tray)', category: 'Protein & Dairy', quantity: '30 pcs', estPriceINR: 210, purchased: false },
    { id: 'g_4', name: 'Brown Basmati Rice & Rolled Oats', category: 'Grains & Pulses', quantity: '3 kg', estPriceINR: 360, purchased: true },
    { id: 'g_5', name: 'Yellow Moong Dal & Chana Dal', category: 'Grains & Pulses', quantity: '2 kg', estPriceINR: 260, purchased: false },
    { id: 'g_6', name: 'Fresh Spinach (Palak) & Broccoli', category: 'Produce', quantity: '4 bunches', estPriceINR: 120, purchased: true },
    { id: 'g_7', name: 'Sprouting Moong & Chickpeas', category: 'Produce', quantity: '1 kg', estPriceINR: 140, purchased: false },
    { id: 'g_8', name: 'Double-Toned Greek Curd (Dahi)', category: 'Protein & Dairy', quantity: '2 kg', estPriceINR: 240, purchased: true },
    { id: 'g_9', name: 'Pure Cow Ghee & Cold-Pressed Mustard Oil', category: 'Pantry & Spices', quantity: '1 Liter', estPriceINR: 480, purchased: false },
    { id: 'g_10', name: 'Roasted Foxnuts (Makhana) & Chia Seeds', category: 'Pantry & Spices', quantity: '500g', estPriceINR: 280, purchased: false },
  ]);

  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<GroceryItem['category']>('Produce');
  const [newQty, setNewQty] = useState('1 kg');
  const [newPrice, setNewPrice] = useState('150');

  const togglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  const handleAddItem = () => {
    if (!newName.trim()) return;
    const newItem: GroceryItem = {
      id: `g_${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      quantity: newQty,
      estPriceINR: Number(newPrice) || 150,
      purchased: false,
    };
    setItems((prev) => [newItem, ...prev]);
    setNewName('');
    showToast(`Added ${newItem.name} to shopping list`, 'success');
  };

  const totalWeeklyCartPrice = items.reduce((acc, i) => acc + i.estPriceINR, 0);
  const totalMonthlyCartPrice = Math.round(totalWeeklyCartPrice * 4.3);
  const monthlyBudget = user?.monthlyBudgetInr || (dailyBudget * 30);
  const weeklyBudget = Math.round(monthlyBudget / 4.3);
  const overBudget = budgetPeriod === 'monthly'
    ? totalMonthlyCartPrice > monthlyBudget
    : totalWeeklyCartPrice > weeklyBudget;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-teal-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">AI Grocery List & Budget Planner</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono font-bold">
              MONTHLY BUDGET ALLOCATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated market shopping lists optimized for cost-efficiency (bulk staples & high-protein whole foods).
          </p>
        </div>

        {/* Budget Summary */}
        <div className={`border rounded-2xl px-5 py-2.5 text-right ${
          overBudget ? 'bg-rose-500/10 border-rose-500/30' : 'bg-teal-500/10 border-teal-500/30'
        }`}>
          <div className="text-[10px] text-teal-300 font-semibold uppercase tracking-wider">
            {budgetPeriod === 'weekly' ? 'Weekly Grocery Cart' : 'Monthly Projected Cart'}
          </div>
          <div className={`text-xl font-extrabold font-mono ${overBudget ? 'text-rose-400' : 'text-teal-400'}`}>
            ₹{formatINR(budgetPeriod === 'weekly' ? totalWeeklyCartPrice : totalMonthlyCartPrice)}{' '}
            <span className="text-xs font-normal text-slate-400">/ ₹{formatINR(budgetPeriod === 'weekly' ? weeklyBudget : monthlyBudget)}</span>
          </div>
          {overBudget && <div className="text-[10px] text-rose-400">⚠️ Exceeds grocery budget</div>}
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            ₹{dailyBudget}/day × 30 = ₹{formatINR(monthlyBudget)} budget
          </div>
        </div>
      </div>

      {/* ── User Budget Settings ────────────────────────────────── */}
      <BudgetSettingsPanel />

      {/* Period Toggle & Bulk Optimization Tip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Budget View Period:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setBudgetPeriod('weekly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                budgetPeriod === 'weekly' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setBudgetPeriod('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                budgetPeriod === 'monthly' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl col-span-2 flex items-center gap-3 text-xs text-slate-300">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>AI Budget Tip:</strong> Purchasing Soya Chunks and Whole Lentils (Moong/Chana) in 2kg bulk packs saves up to <strong>₹340/month</strong> compared to single-meal packaging.
          </span>
        </div>
      </div>

      {/* Budget Breakdown Banner */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-400">Monthly Health Budget:</span>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-teal-300">🛒 Groceries/Food: <strong>₹{dailyBudget}/day × 30 = ₹{formatINR(monthlyBudget)} INR</strong></span>
          <span className="text-purple-300">💊 Supplements: <strong>₹{formatINR(supplementBudget)} INR/mo</strong></span>
          <span className="text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
            Total: ₹{formatINR(monthlyBudget + supplementBudget)} INR
          </span>
        </div>
      </div>

      {/* Add New Item */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-2 text-xs">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add item (e.g., Chia Seeds, Greek Yogurt)..."
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
          placeholder="Qty"
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
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Shopping List Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => togglePurchased(item.id)}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              item.purchased
                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                : 'bg-slate-900/80 border-slate-800 hover:border-teal-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                  item.purchased
                    ? 'bg-teal-500 border-teal-500 text-slate-950'
                    : 'border-slate-700 bg-slate-950'
                }`}
              >
                {item.purchased && <Check className="w-4 h-4 stroke-[3px]" />}
              </div>
              <div>
                <h4 className={`text-sm font-bold ${item.purchased ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                  {item.name}
                </h4>
                <span className="text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-extrabold text-slate-200 font-mono">{item.quantity}</div>
              <div className="text-[11px] text-teal-300 font-semibold font-mono">₹{formatINR(item.estPriceINR)}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
