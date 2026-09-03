import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, ShieldCheck, CheckCircle2, AlertTriangle, Dumbbell, Utensils, MessageSquare, Send, Award, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/nutritionUtils';

interface ClientProfile {
  id: string;
  name: string;
  goal: string;
  avatar: string;
  macroCompliancePct: number;
  dailyCalories: number;
  dailyProteinG: number;
  loggedToday: boolean;
  medicalRiskStatus: 'Optimal' | 'Caution' | 'Review Required';
  assignedSplit: string;
  notes: string;
}

export const TrainerPortalView: React.FC = () => {
  const { showToast } = useApp();

  const [clients, setClients] = useState<ClientProfile[]>([
    {
      id: 'c1',
      name: 'Rahul Sharma',
      goal: 'Lean Muscle Hypertrophy (+3kg)',
      avatar: 'RS',
      macroCompliancePct: 94,
      dailyCalories: 2650,
      dailyProteinG: 165,
      loggedToday: true,
      medicalRiskStatus: 'Optimal',
      assignedSplit: 'Push Pull Legs (6-Day Hypertrophy)',
      notes: 'Strong deadlift progression. Ensure post-workout carbs are hit consistently.',
    },
    {
      id: 'c2',
      name: 'Priya Patel',
      goal: 'Fat Loss & PCOS Metabolic Control',
      avatar: 'PP',
      macroCompliancePct: 88,
      dailyCalories: 1750,
      dailyProteinG: 120,
      loggedToday: true,
      medicalRiskStatus: 'Caution',
      assignedSplit: 'Upper Lower (4-Day Strength)',
      notes: 'Monitored fasting glucose. Replaced high glycemic foods with complex fiber.',
    },
    {
      id: 'c3',
      name: 'Vikram Malhotra',
      goal: 'Strength & 1RM Progression',
      avatar: 'VM',
      macroCompliancePct: 92,
      dailyCalories: 2900,
      dailyProteinG: 180,
      loggedToday: false,
      medicalRiskStatus: 'Optimal',
      assignedSplit: 'Full Body 4-Day Strength & Core',
      notes: 'Squat RPE was 6.5 last session — auto-bump load +2.5kg for next week.',
    },
    {
      id: 'c4',
      name: 'Sneha Gupta',
      goal: 'Endurance & Clinical Health',
      avatar: 'SG',
      macroCompliancePct: 96,
      dailyCalories: 2000,
      dailyProteinG: 110,
      loggedToday: true,
      medicalRiskStatus: 'Optimal',
      assignedSplit: 'Upper Lower Hypertrophy Split',
      notes: 'Vitamin D levels improving steadily with morning protocol.',
    },
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string>('c1');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    showToast(`Feedback note sent to ${selectedClient.name}!`, 'success');
    setFeedbackMessage('');
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4 animate-fade-in" data-testid="trainer-portal-view">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">Enterprise Trainer & Coach Portal</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold">
              PHASE 26 • MULTI-CLIENT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time client macro compliance, periodized workout progress, and biometric risk flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Active Roster: <strong className="text-emerald-400">{clients.length} Athletes</strong></span>
        </div>
      </div>

      {/* Main Grid: Client Roster List + Client Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Client Roster */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Client Roster ({clients.length})
          </div>

          <div className="space-y-2">
            {clients.map((c) => {
              const active = selectedClientId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-indigo-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {c.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.goal}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {c.macroCompliancePct}%
                    </span>
                    <span className="text-[9px] text-slate-500">adherence</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Client Detailed Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 backdrop-blur-xl">
            
            {/* Client Top Bio Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  {selectedClient.avatar}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-100">{selectedClient.name}</h3>
                  <p className="text-xs text-indigo-300">{selectedClient.goal}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border font-mono uppercase ${
                  selectedClient.medicalRiskStatus === 'Optimal'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {selectedClient.medicalRiskStatus} Risk Status
                </span>
              </div>
            </div>

            {/* Macro & Nutrition Targets */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Assigned Nutritional Prescription</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Daily Target</span>
                  <strong className="text-slate-100 text-sm">{selectedClient.dailyCalories} kcal</strong>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Target Protein</span>
                  <strong className="text-emerald-400 text-sm">{selectedClient.dailyProteinG} g</strong>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Compliance</span>
                  <strong className="text-indigo-400 text-sm">{selectedClient.macroCompliancePct}%</strong>
                </div>
              </div>
            </div>

            {/* Assigned Split */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-sky-400" /> Assigned Periodization Split:
                </span>
                <span className="text-xs font-extrabold text-sky-400 font-mono">
                  {selectedClient.assignedSplit}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coach Notes: <em>"{selectedClient.notes}"</em>
              </p>
            </div>

            {/* Coach Direct Feedback Box */}
            <form onSubmit={handleSendFeedback} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Send Direct Clinical Feedback / Workout Adjustment</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={500}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder={`Message ${selectedClient.name} (e.g. Increase hydration + add 50g carbs pre-workout)...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
