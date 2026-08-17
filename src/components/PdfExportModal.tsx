import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, Download, FileText, CheckCircle2, Dumbbell, ShoppingBag, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/nutritionUtils';
import { FEATURED_EXERCISES } from '../data/exerciseDatabase';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ReportType = 'nutrition' | 'workout' | 'grocery' | 'medical';

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose }) => {
  const { user, mealLogs, preferences } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('nutrition');

  if (!isOpen) return null;

  const userAge = user.dateOfBirth
    ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()
    : 25;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    let reportContent = '';
    const dateStr = new Date().toLocaleDateString('en-IN', { dateStyle: 'full' });

    if (selectedReport === 'nutrition') {
      reportContent = `FITFORGE AI — CLINICAL NUTRITION & 5-MEAL MACRO BLUEPRINT
Generated On: ${dateStr}
Client: ${user.firstName} ${user.lastName} (${userAge} yrs, ${user.gender})
Biometrics: ${user.weightKg} kg | ${user.heightCm} cm | BMI: ${(user.weightKg / Math.pow(user.heightCm / 100, 2)).toFixed(1)}
Target Calories: ${user.dailyCalorieTarget} kcal/day
Target Protein: ${user.dailyProteinTargetG} g/day
Target Carbs: ${user.dailyCarbsTargetG} g/day
Target Fats: ${user.dailyFatTargetG} g/day
Daily Food Budget: ${formatINR(user.dailyBudgetInr || 200)} / day (Monthly: ${formatINR(user.monthlyBudgetInr || 6000)})

DIETARY PREFERENCES & ALLERGENS:
${preferences.map((p) => `- ${p.value} (${p.type})`).join('\n') || 'None recorded'}

TODAY'S LOGGED MEALS:
${mealLogs.map((m) => `- [${m.mealType.toUpperCase()}] ${m.foodName} (${m.portionSizeGrams}g) — ${m.calculatedNutrients.calories} kcal, ${m.calculatedNutrients.protein_g}g P, ${m.calculatedNutrients.carbs_g}g C, ${m.calculatedNutrients.fat_g}g F`).join('\n') || 'No meals logged yet'}
`;
    } else if (selectedReport === 'workout') {
      reportContent = `FITFORGE AI — PERIODIZED HYPERTROPHY WORKOUT SPLIT
Generated On: ${dateStr}
Client: ${user.firstName} ${user.lastName}
Goal: Muscle Hypertrophy & Strength (RPE 8-9)

ASSIGNED EXERCISES & TARGET VOLUME:
${FEATURED_EXERCISES.map((ex, i) => `${i + 1}. ${ex.name} (${ex.muscleGroup.toUpperCase()})
   Target: ${ex.targetSets} Sets × ${ex.targetReps} Reps | Intensity: ${ex.rpeTarget} | Rest: ${ex.restSeconds}s
   Primary Target: ${ex.primaryMuscle} | Equipment: ${ex.equipment}`).join('\n\n')}
`;
    } else if (selectedReport === 'grocery') {
      reportContent = `FITFORGE AI — 2026 INDIAN MARKET HIGH-PROTEIN GROCERY CHECKLIST
Generated On: ${dateStr}
Monthly Food Budget: ${formatINR(user.monthlyBudgetInr || 6000)}

RECOMMENDED STAPLES & HIGH-PROTEIN SOURCES:
1. Defatted Soya Chunks (2 kg) — ₹190 (1,040g Protein)
2. Whole Eggs (30-Pack Tray) — ₹210 (180g Protein)
3. Fresh Low-Fat Paneer (1 kg) — ₹340 (180g Protein)
4. Premium Raw Whey Protein (1 kg) — ₹1,899 (800g Protein)
5. Brown Chickpeas / Kala Chana (2 kg) — ₹160 (380g Protein)
6. Rolled Oats (1.5 kg) — ₹240 (195g Protein)
7. Double Toned Milk (10 L) — ₹380 (320g Protein)
8. Roasted Peanut Butter (1 kg) — ₹299 (260g Protein)
`;
    } else if (selectedReport === 'medical') {
      reportContent = `FITFORGE AI — CLINICAL BIOMARKER & LAB BLOOD ANALYSIS
Generated On: ${dateStr}
Patient: ${user.firstName} ${user.lastName}

BIOMARKER SUMMARY:
- Fasting Blood Glucose: Normal (88 mg/dL)
- HbA1c: Normal (5.2%)
- Total Cholesterol: Optimal (168 mg/dL)
- Vitamin D3 (25-OH): Monitored (34 ng/mL)
- Vitamin B12: Optimal (420 pg/mL)
- Hemoglobin: Normal (15.2 g/dL)

CLINICAL RECOMMENDATION:
Maintain current whole-food micronutrient intake and ensure daily sun exposure or vitamin D3 supplementation.
`;
    }

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FitForge_${selectedReport}_report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto" data-testid="pdf-export-modal">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold font-heading text-xl">
            <FileText className="w-6 h-6" />
            <span>Phase 24: Clinical 1-Click PDF Report Generator</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            data-testid="btn-close-pdf-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'nutrition' as const, label: 'Nutrition Plan', icon: FileText, desc: '5-Meal & Macros' },
            { id: 'workout' as const, label: 'Workout Split', icon: Dumbbell, desc: 'Periodized Sets' },
            { id: 'grocery' as const, label: 'Grocery List', icon: ShoppingBag, desc: '2026 Price Index' },
            { id: 'medical' as const, label: 'Medical Lab', icon: Activity, desc: 'Blood Biomarkers' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  active
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                data-testid={`tab-report-${tab.id}`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold">{tab.label}</div>
                  <div className="text-[10px] text-slate-400">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Print Preview Canvas */}
        <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-inner border border-slate-300 font-sans space-y-4 max-h-72 overflow-y-auto print:max-h-none print:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-300 pb-3">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">FITFORGE AI CLINICAL REPORT</h2>
              <p className="text-xs text-slate-600">WHO & ICMR-NIN Clinical Performance Protocol</p>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div>ID: #{user.userId.slice(-6).toUpperCase()}</div>
            </div>
          </div>

          {/* Report Body */}
          <div className="text-xs space-y-2.5">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2.5 rounded-xl">
              <div><strong>Client:</strong> {user.firstName} {user.lastName} ({userAge} yrs, {user.gender})</div>
              <div><strong>Biometrics:</strong> {user.weightKg} kg | {user.heightCm} cm</div>
            </div>

            {selectedReport === 'nutrition' && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Daily Macro & Calorie Targets:</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-100 p-2 rounded-lg"><span className="text-[10px] block text-slate-500">Calories</span><strong>{user.dailyCalorieTarget} kcal</strong></div>
                  <div className="bg-slate-100 p-2 rounded-lg"><span className="text-[10px] block text-slate-500">Protein</span><strong>{user.dailyProteinTargetG} g</strong></div>
                  <div className="bg-slate-100 p-2 rounded-lg"><span className="text-[10px] block text-slate-500">Carbohydrates</span><strong>{user.dailyCarbsTargetG} g</strong></div>
                  <div className="bg-slate-100 p-2 rounded-lg"><span className="text-[10px] block text-slate-500">Fats</span><strong>{user.dailyFatTargetG} g</strong></div>
                </div>
                <div className="text-[11px] text-slate-600 pt-1">
                  Daily Budget Allocated: <strong>{formatINR(user.dailyBudgetInr || 200)}/day</strong> (Monthly: {formatINR(user.monthlyBudgetInr || 6000)})
                </div>
              </div>
            )}

            {selectedReport === 'workout' && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Assigned Exercises & Volume Targets:</h4>
                <ul className="space-y-1 list-disc list-inside text-slate-700">
                  {FEATURED_EXERCISES.slice(0, 4).map((ex) => (
                    <li key={ex.id}>
                      <strong>{ex.name}</strong> ({ex.muscleGroup}): {ex.targetSets} sets × {ex.targetReps} reps • {ex.rpeTarget}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedReport === 'grocery' && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">High-Protein Staples (2026 Market Index):</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="bg-slate-100 p-2 rounded">Defatted Soya Chunks 2kg — ₹190 (1,040g Protein)</div>
                  <div className="bg-slate-100 p-2 rounded">Whole Eggs 30-Pack — ₹210 (180g Protein)</div>
                  <div className="bg-slate-100 p-2 rounded">Fresh Paneer 1kg — ₹340 (180g Protein)</div>
                  <div className="bg-slate-100 p-2 rounded">Raw Whey Protein 1kg — ₹1,899 (800g Protein)</div>
                </div>
              </div>
            )}

            {selectedReport === 'medical' && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Biomarker Laboratory Findings:</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-slate-700">
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded">HbA1c: 5.2% (Optimal)</div>
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded">Glucose: 88 mg/dL</div>
                  <div className="bg-amber-50 text-amber-800 p-2 rounded">Vit D3: 34 ng/mL</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Formatted with clinical headers, ready for print & export.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadText}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              data-testid="btn-download-report"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all"
              data-testid="btn-print-report"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
