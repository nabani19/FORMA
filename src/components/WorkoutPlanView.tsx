import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MUSCLE_HIERARCHY, TOTAL_EXERCISES_INDEXED, FEATURED_EXERCISES, ExerciseItem } from '../data/exerciseDatabase';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { 
  Dumbbell, 
  Calendar, 
  Play, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  Search, 
  Filter, 
  Activity, 
  Layers, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Timer, 
  Zap, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

interface WorkoutSetLog {
  setId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number;
  oneRmEst: number;
  completed: boolean;
}

export const WorkoutPlanView: React.FC = () => {
  const { user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'routine' | 'anatomy_library' | 'logger'>('routine');
  const [activeSplit, setActiveSplit] = useState<'Push Pull Legs' | 'Upper Lower' | 'Full Body 4-Day'>('Push Pull Legs');
  const [periodizationPhase, setPeriodizationPhase] = useState<'Hypertrophy (High Volume)' | 'Strength (High Load)' | 'Active Deload (Recovery)'>('Hypertrophy (High Volume)');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchExercise, setSearchExercise] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<ExerciseItem | null>(null);

  // Active Logging State (Phase 23)
  const [activeLoggingExercise, setActiveLoggingExercise] = useState<ExerciseItem>(FEATURED_EXERCISES[0]);
  const [exerciseSets, setExerciseSets] = useState<WorkoutSetLog[]>([
    { setId: 'set_1', setNumber: 1, weightKg: 80, reps: 10, rpe: 8.0, oneRmEst: 106, completed: true },
    { setId: 'set_2', setNumber: 2, weightKg: 82.5, reps: 8, rpe: 8.5, oneRmEst: 104, completed: true },
    { setId: 'set_3', setNumber: 3, weightKg: 85, reps: 6, rpe: 6.5, oneRmEst: 102, completed: false },
  ]);

  // Progressive Overload Alert Banner
  const [overloadAlert, setOverloadAlert] = useState<string | null>(
    '💪 AI Progressive Overload Alert: Set 3 was completed with RPE 6.5 (< 7.0). System recommends bumping starting weight by +2.5 kg on your next session!'
  );

  // Rest Countdown Timer (Phase 21)
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && restSecondsLeft !== null && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (restSecondsLeft === 0) {
      setIsTimerRunning(false);
      showToast('⏰ Rest period complete! Time for your next set.', 'success');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSecondsLeft]);

  const startRestTimer = (seconds: number) => {
    setRestSecondsLeft(seconds);
    setIsTimerRunning(true);
    showToast(`⏱️ ${seconds}s rest timer started!`, 'info');
  };

  const calculateOneRm = (weight: number, reps: number): number => {
    if (reps <= 1) return weight;
    // Brzycki formula
    return Math.round(weight * (36 / (37 - reps)));
  };

  const handleUpdateSet = (setId: string, field: 'weightKg' | 'reps' | 'rpe', value: number) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.setId !== setId) return s;
        const updated = { ...s, [field]: value };
        updated.oneRmEst = calculateOneRm(updated.weightKg, updated.reps);
        return updated;
      })
    );
  };

  const handleToggleSetComplete = (setId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.setId !== setId) return s;
        const nextCompleted = !s.completed;
        if (nextCompleted && s.rpe < 7.0 && s.reps >= 6) {
          setOverloadAlert(
            `🔥 Progressive Overload Alert: Top set completed with RPE ${s.rpe} (< 7.0)! AI prescribes a +2.5 kg load increase next week.`
          );
        }
        return { ...s, completed: nextCompleted };
      })
    );
    showToast('Set status updated!', 'success');
  };

  const handleAddSet = () => {
    const lastSet = exerciseSets[exerciseSets.length - 1];
    const newWeight = lastSet ? lastSet.weightKg : 60;
    const newReps = lastSet ? lastSet.reps : 8;
    const newSet: WorkoutSetLog = {
      setId: `set_${Date.now()}`,
      setNumber: exerciseSets.length + 1,
      weightKg: newWeight,
      reps: newReps,
      rpe: 8.0,
      oneRmEst: calculateOneRm(newWeight, newReps),
      completed: false,
    };
    setExerciseSets((prev) => [...prev, newSet]);
    showToast(`Added Set #${newSet.setNumber}`, 'info');
  };

  const filteredExercises = FEATURED_EXERCISES.filter((ex) => {
    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.muscleGroup.toLowerCase().includes(selectedMuscle.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(selectedMuscle.toLowerCase());
    const matchesSearch =
      ex.name.toLowerCase().includes(searchExercise.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchExercise.toLowerCase());
    const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    return matchesMuscle && matchesSearch && matchesEquip;
  });

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4 animate-fade-in" data-testid="workout-view">
      
      {/* ── 1. Top Header & Periodization Split Title ──────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-sky-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">
              AI Workout & Periodization Engine
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono font-bold">
              PHASES 21 - 23 • 1,322+ EXERCISES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic periodized routine, anatomical muscle index, and progressive overload tracking engine.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'routine' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Routine Split
          </button>
          <button
            onClick={() => setActiveTab('logger')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logger' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            RPE & 1RM Logger
          </button>
          <button
            onClick={() => setActiveTab('anatomy_library')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'anatomy_library' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            1,000+ Exercise Anatomy
          </button>
        </div>
      </div>

      {/* ── Rest Countdown Timer Floating Bar ────────────────────── */}
      {restSecondsLeft !== null && (
        <div className="bg-sky-950/40 border border-sky-500/40 p-4 rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 font-mono font-extrabold text-sm flex items-center justify-center">
              <Timer className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-200">Inter-Set Rest Timer Active</div>
              <div className="text-xl font-extrabold font-mono text-sky-400">
                {Math.floor(restSecondsLeft / 60)}:{(restSecondsLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSecondsLeft((prev) => (prev ? prev + 30 : 30))}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/30"
            >
              +30s
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setRestSecondsLeft(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              Stop Timer
            </button>
          </div>
        </div>
      )}

      {/* ── VIEW 1: ACTIVE ROUTINE SPLIT (Phase 21) ───────────────── */}
      {activeTab === 'routine' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Split & Periodization Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-3xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Training Split:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['Push Pull Legs', 'Upper Lower', 'Full Body 4-Day'] as const).map((split) => (
                  <button
                    key={split}
                    onClick={() => setActiveSplit(split)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSplit === split ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {split}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Periodization Phase:</span>
              <select
                value={periodizationPhase}
                onChange={(e: any) => setPeriodizationPhase(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-sky-300 font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="Hypertrophy (High Volume)">Hypertrophy (High Volume • RPE 8-9)</option>
                <option value="Strength (High Load)">Strength (Heavy Load • RPE 9-10)</option>
                <option value="Active Deload (Recovery)">Active Deload (50% Volume • Recovery)</option>
              </select>
            </div>
          </div>

          {/* Routine Exercise Cards */}
          <div className="space-y-3">
            {FEATURED_EXERCISES.slice(0, 6).map((ex) => (
              <div
                key={ex.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={ex.videoThumbnail}
                      alt={ex.name}
                      onClick={() => setSelectedExerciseForModal(ex)}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700/60 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {ex.rpeTarget}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{ex.equipment}</span>
                      </div>
                      <h3 
                        onClick={() => setSelectedExerciseForModal(ex)}
                        className="font-bold text-slate-100 text-base font-heading mt-0.5 cursor-pointer hover:text-sky-300 transition-colors"
                      >
                        {ex.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Primary: <strong className="text-slate-200">{ex.primaryMuscle}</strong> • Target: <strong className="text-sky-300">{ex.targetSets} sets × {ex.targetReps} reps</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => startRestTimer(ex.restSeconds)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>{ex.restSeconds}s Rest</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveLoggingExercise(ex);
                        setActiveTab('logger');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Sets</span>
                    </button>
                  </div>
                </div>

                {/* Form Cues Preview */}
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs flex items-center justify-between">
                  <div className="text-slate-300 truncate max-w-lg">
                    <strong className="text-sky-400">Biomechanics Cue:</strong> {ex.executionCues[0]}
                  </div>
                  <button
                    onClick={() => setSelectedExerciseForModal(ex)}
                    className="text-sky-400 hover:underline font-bold text-[11px] shrink-0 ml-2"
                  >
                    View HD Inspector →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── VIEW 2: PROGRESSIVE OVERLOAD & RPE/1RM LOGGER (Phase 23) ── */}
      {activeTab === 'logger' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Overload Alert Notification */}
          {overloadAlert && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-3xl flex items-start gap-3 shadow-lg">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200/90 leading-relaxed flex-1">
                {overloadAlert}
              </div>
              <button
                onClick={() => setOverloadAlert(null)}
                className="text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Exercise Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Logged Exercise:</span>
                <h3 className="font-heading font-extrabold text-xl text-slate-100">{activeLoggingExercise.name}</h3>
                <p className="text-xs text-slate-400">
                  Target: {activeLoggingExercise.targetSets} sets × {activeLoggingExercise.targetReps} reps • Intensity: {activeLoggingExercise.rpeTarget}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedExerciseForModal(activeLoggingExercise)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Biomechanical Cues</span>
                </button>
                <button
                  onClick={() => startRestTimer(activeLoggingExercise.restSeconds)}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Start Rest ({activeLoggingExercise.restSeconds}s)</span>
                </button>
              </div>
            </div>

            {/* Set Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 font-mono">
                <div className="col-span-2">Set #</div>
                <div className="col-span-3">Weight (kg)</div>
                <div className="col-span-2">Reps</div>
                <div className="col-span-2">RPE / RIR</div>
                <div className="col-span-2 text-right">Est. 1RM</div>
                <div className="col-span-1 text-center">Done</div>
              </div>

              {exerciseSets.map((s) => (
                <div
                  key={s.setId}
                  className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition-all ${
                    s.completed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-100'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="col-span-2 font-bold font-mono text-xs flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center text-[11px]">
                      {s.setNumber}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      value={s.weightKg}
                      onChange={(e) => handleUpdateSet(s.setId, 'weightKg', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) => handleUpdateSet(s.setId, 'reps', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <select
                      value={s.rpe}
                      onChange={(e) => handleUpdateSet(s.setId, 'rpe', parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                    >
                      <option value="6.0">RPE 6 (4 RIR)</option>
                      <option value="6.5">RPE 6.5 (3-4 RIR)</option>
                      <option value="7.0">RPE 7 (3 RIR)</option>
                      <option value="7.5">RPE 7.5 (2-3 RIR)</option>
                      <option value="8.0">RPE 8 (2 RIR)</option>
                      <option value="8.5">RPE 8.5 (1-2 RIR)</option>
                      <option value="9.0">RPE 9 (1 RIR)</option>
                      <option value="9.5">RPE 9.5 (0-1 RIR)</option>
                      <option value="10.0">RPE 10 (Failure)</option>
                    </select>
                  </div>

                  <div className="col-span-2 text-right font-mono text-xs font-bold text-sky-400">
                    {s.oneRmEst} kg
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => handleToggleSetComplete(s.setId)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        s.completed
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleAddSet}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Add Set #{exerciseSets.length + 1}</span>
              </button>

              <div className="text-xs text-slate-400 font-mono">
                Total Volume: <strong className="text-emerald-400">{exerciseSets.reduce((acc, s) => acc + (s.completed ? s.weightKg * s.reps : 0), 0)} kg</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── VIEW 3: 1,000+ HEAD-TO-TOE ANATOMICAL EXERCISE LIBRARY ── */}
      {activeTab === 'anatomy_library' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Muscle Region Grid (Head to Toe) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 font-heading flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Head-to-Toe Anatomical Muscle Hierarchy (24 Muscle Groups • 1,322 Total Exercises)
              </h3>
              <button
                onClick={() => setSelectedMuscle('all')}
                className="text-xs text-sky-400 hover:underline font-bold"
              >
                Reset All
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {MUSCLE_HIERARCHY.map((m) => {
                const active = selectedMuscle === m.name;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMuscle(m.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-md ring-1 ring-sky-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {m.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Equipment Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchExercise}
                onChange={(e) => setSearchExercise(e.target.value)}
                placeholder="Search across 1,000+ exercises, biomechanics or muscle targets..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none w-full sm:w-auto"
            >
              <option value="all">All Equipment Types</option>
              <option value="barbell">Barbell</option>
              <option value="dumbbell">Dumbbells</option>
              <option value="cables">Cables & Pulleys</option>
              <option value="machine">Machines</option>
              <option value="bodyweight">Bodyweight / Calisthenics</option>
              <option value="bands">Resistance Bands</option>
            </select>
          </div>

          {/* Filtered Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setSelectedExerciseForModal(ex)}
                className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-4 shadow-xl space-y-3 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={ex.videoThumbnail}
                    alt={ex.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700/60 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {ex.movementPattern}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">{ex.equipment}</span>
                      <span className="text-[10px] text-amber-400 font-semibold">{ex.difficulty}</span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm font-heading mt-0.5">{ex.name}</h4>
                    <p className="text-[11px] text-slate-400">Target: <strong className="text-slate-200">{ex.primaryMuscle}</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Sets</span>
                    <strong className="text-sky-400">{ex.targetSets}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Reps</span>
                    <strong className="text-emerald-400">{ex.targetReps}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Intensity</span>
                    <strong className="text-amber-400">{ex.rpeTarget}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── Exercise Detail Modal (Phase 22) ──────────────────────── */}
      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
        onLogExercise={(ex) => {
          setActiveLoggingExercise(ex);
          setActiveTab('logger');
        }}
      />

    </div>
  );
};
