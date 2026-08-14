import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MUSCLE_HIERARCHY, TOTAL_EXERCISES_INDEXED, FEATURED_EXERCISES, ExerciseItem } from '../data/exerciseDatabase';
import { Dumbbell, Calendar, Play, CheckCircle2, Clock, Flame, ShieldAlert, Sparkles, Search, Filter, Activity, Layers } from 'lucide-react';

export const WorkoutPlanView: React.FC = () => {
  const { user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'routine' | 'anatomy_library'>('routine');
  const [activeSplit, setActiveSplit] = useState<'Push Pull Legs' | 'Upper Lower' | 'Full Body 4-Day'>('Push Pull Legs');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchExercise, setSearchExercise] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  const filteredExercises = FEATURED_EXERCISES.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'all' || ex.muscleGroup.toLowerCase().includes(selectedMuscle.toLowerCase()) || ex.primaryMuscle.toLowerCase().includes(selectedMuscle.toLowerCase());
    const matchesSearch = ex.name.toLowerCase().includes(searchExercise.toLowerCase()) || ex.primaryMuscle.toLowerCase().includes(searchExercise.toLowerCase());
    const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    return matchesMuscle && matchesSearch && matchesEquip;
  });

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4" data-testid="workout-view">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-sky-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">AI Workout & Anatomical Exercise Engine</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono font-bold">
              1,322+ EXERCISES • HEAD-TO-TOE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic periodized routine and comprehensive muscle anatomical index covering 24 muscle groups.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'routine' ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Routine Split
          </button>
          <button
            onClick={() => setActiveTab('anatomy_library')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'anatomy_library' ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            1,000+ Exercise Anatomy
          </button>
        </div>
      </div>

      {/* VIEW 1: ACTIVE ROUTINE SPLIT */}
      {activeTab === 'routine' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Split Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['Push Pull Legs', 'Upper Lower', 'Full Body 4-Day'] as const).map((split) => (
                <button
                  key={split}
                  onClick={() => setActiveSplit(split)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSplit === split ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {split}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-400">
              Target: <strong className="text-emerald-400">Hypertrophy RPE 8-9</strong>
            </div>
          </div>

          {/* Routine Exercise Cards */}
          <div className="space-y-3">
            {FEATURED_EXERCISES.slice(0, 6).map((ex, idx) => (
              <div
                key={ex.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-4 shadow-xl transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={ex.videoThumbnail}
                      alt={ex.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700/60 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {ex.rpeTarget}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {ex.equipment}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-base font-heading mt-0.5">
                        {ex.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Primary Target: <strong className="text-slate-200">{ex.primaryMuscle}</strong> • Sets: <strong className="text-sky-300">{ex.targetSets}</strong> • Reps: <strong className="text-sky-300">{ex.targetReps}</strong> (Rest: {ex.restSeconds}s)
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 font-medium block">Load Target</span>
                    <strong className="text-emerald-400 text-xs font-mono">Progressive</strong>
                  </div>
                </div>

                {/* Form Cues */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Execution Form Cues:</div>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {ex.executionCues.map((cue, cIdx) => (
                      <li key={cIdx}>{cue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* VIEW 2: 1,000+ HEAD-TO-TOE ANATOMICAL EXERCISE LIBRARY */}
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
                className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-4 shadow-xl space-y-3"
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

    </div>
  );
};
