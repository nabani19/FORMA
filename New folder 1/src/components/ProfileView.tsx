import React, { useState } from 'react';
import { useAppStore, formatInr } from '../store/useAppStore';
import { SubscriptionPlan } from '../types';
import { PaymentModal } from './PaymentModal';
import { User, ShieldCheck, Settings, Award, Flame, RefreshCw, Key, Lock, CheckCircle2, Zap, CreditCard } from 'lucide-react';

interface Props {
  onOpenWizard: () => void;
}

export const ProfileView: React.FC<Props> = ({ onOpenWizard }) => {
  const { userProfile, macroGoals, logout } = useAppStore();
  const [paymentTargetPlan, setPaymentTargetPlan] = useState<SubscriptionPlan | null>(null);

  const plans = [
    {
      id: 'free' as SubscriptionPlan,
      name: 'TRACker Starter',
      price: '₹0',
      period: 'Forever Free',
      features: ['3 AI Camera Scans / day', 'Basic Calorie Tracking', 'Standard Exercise Library']
    },
    {
      id: 'pro' as SubscriptionPlan,
      name: 'TRACker Pro',
      price: '₹499',
      period: 'per month',
      badge: 'Popular',
      features: ['Unlimited AI Camera Scans', 'Full Anatomical 3D Muscle Map', 'Custom INR Meal Plans', 'PDF Plan Exports']
    },
    {
      id: 'elite' as SubscriptionPlan,
      name: 'TRACker Elite Coach',
      price: '₹999',
      period: 'per month (Capped at ₹1,000)',
      badge: 'Max Tier',
      features: ['1-on-1 AI Fitness Coach', 'Custom Supplement Protocols', 'Live Video Form Check AI', 'Priority Edge Models']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Profile Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-glow-blue">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-display">{userProfile.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {userProfile.subscriptionPlan || 'pro'} Plan
              </span>
            </div>
            <p className="text-xs text-zinc-400">{userProfile.email}</p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-300">
              <span className="capitalize text-blue-400 font-semibold">{userProfile.goal.replace('_', ' ')}</span>
              <span>•</span>
              <span>{userProfile.age} yrs</span>
              <span>•</span>
              <span>{userProfile.weightKg} kg / {userProfile.heightCm} cm</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenWizard}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue transition focus-ring"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Edit Profile & TDEE</span>
        </button>
      </div>

      {/* Target Macro Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-zinc-800 text-center">
          <div className="text-[10px] text-zinc-400 font-bold uppercase">Daily TDEE Target</div>
          <div className="text-lg font-extrabold text-white font-display mt-1">{macroGoals.calories} kcal</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-zinc-800 text-center">
          <div className="text-[10px] text-zinc-400 font-bold uppercase">Target Protein</div>
          <div className="text-lg font-extrabold text-blue-400 font-display mt-1">{macroGoals.proteinGrams}g</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-zinc-800 text-center">
          <div className="text-[10px] text-zinc-400 font-bold uppercase">Daily Budget</div>
          <div className="text-lg font-extrabold text-emerald-400 font-display mt-1">{formatInr(userProfile.dailyBudgetInr)}</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-zinc-800 text-center">
          <div className="text-[10px] text-zinc-400 font-bold uppercase">Monthly Budget</div>
          <div className="text-lg font-extrabold text-indigo-400 font-display mt-1">{formatInr(userProfile.dailyBudgetInr * 30)}</div>
        </div>
      </div>

      {/* Monthly Subscription Plans Section (Capped at ₹1,000/mo) */}
      <div className="glass-panel rounded-3xl p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Monthly Subscription Plans (Max ₹1,000 / Month Cap)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Affordable Indian Rupee (₹) pricing capped strictly under ₹1,000/mo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {plans.map((p) => {
            const isCurrent = (userProfile.subscriptionPlan || 'pro') === p.id;
            return (
              <div
                key={p.id}
                className={`glass-card p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                  isCurrent ? 'border-blue-500 bg-blue-950/20' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {p.badge && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-extrabold text-white">{p.name}</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-2xl font-extrabold text-white font-display">{p.price}</span>
                    <span className="text-xs text-zinc-400 ml-1 font-medium">{p.period}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setPaymentTargetPlan(p.id)}
                  className={`w-full mt-5 py-2.5 rounded-xl font-bold text-xs transition ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-glow-green cursor-default'
                      : 'bg-zinc-900 hover:bg-blue-600 text-white border border-zinc-700 hover:border-blue-500'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Manage / Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zero-Trust Security Audit Box */}
      <div className="glass-panel rounded-3xl p-6 border border-zinc-800 space-y-4">
        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Zero-Trust Security & Session Hardening
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-semibold text-white">Password Hashing Algorithm</div>
              <div className="text-[10px] text-zinc-500">Argon2id (Memory 64MB, Parallelism 2, Iterations 3)</div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Hardened
            </span>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-semibold text-white">Session Cookie Storage</div>
              <div className="text-[10px] text-zinc-500">HttpOnly, SameSite=Strict (Zero localStorage Exposure)</div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition"
          >
            Sign Out of Account
          </button>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {paymentTargetPlan && (
        <PaymentModal
          targetPlan={paymentTargetPlan}
          isOpen={Boolean(paymentTargetPlan)}
          onClose={() => setPaymentTargetPlan(null)}
        />
      )}

    </div>
  );
};
