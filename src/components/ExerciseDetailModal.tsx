import React, { useState } from 'react';
import { ExerciseItem } from '../data/exerciseDatabase';
import { X, Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, Dumbbell, Activity, Info, Sparkles } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: ExerciseItem | null;
  onClose: () => void;
  onLogExercise?: (exercise: ExerciseItem) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onLogExercise,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'video' | 'anatomy' | 'biomechanics'>('video');

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-mono">
                {exercise.muscleGroup}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md capitalize">
                {exercise.equipment}
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 capitalize">
                {exercise.difficulty}
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-slate-100">{exercise.name}</h3>
            <p className="text-xs text-slate-400">
              Movement Pattern: <strong className="text-slate-200 uppercase">{exercise.movementPattern}</strong> • Target RPE: <strong className="text-emerald-400 font-mono">{exercise.rpeTarget}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            data-testid="btn-close-exercise-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'video' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            HD Video & Loop
          </button>
          <button
            onClick={() => setActiveTab('anatomy')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'anatomy' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Muscle Anatomy Map
          </button>
          <button
            onClick={() => setActiveTab('biomechanics')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'biomechanics' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Biomechanics & Cues
          </button>
        </div>

        {/* Tab 1: HD Video Simulation */}
        {activeTab === 'video' && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center group shadow-inner">
              <img
                src={exercise.videoThumbnail}
                alt={exercise.name}
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              
              {/* Play / Pause Overlay */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              {/* Status bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> 1080p 60fps Biomechanical Loop
                </span>
                <span>Rest Period: {exercise.restSeconds}s</span>
              </div>
            </div>

            {/* Target Scheme */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Sets</span>
                <strong className="text-sky-400 text-sm">{exercise.targetSets} Sets</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Reps</span>
                <strong className="text-emerald-400 text-sm">{exercise.targetReps} Reps</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Rest Timer</span>
                <strong className="text-amber-400 text-sm">{exercise.restSeconds}s</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Intensity</span>
                <strong className="text-violet-400 text-sm">{exercise.rpeTarget}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Anatomical Muscle Map */}
        {activeTab === 'anatomy' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                <Dumbbell className="w-4 h-4" />
                <span>Primary & Secondary Anatomical Activation</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Primary Agonist Muscle:</span>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                    {exercise.primaryMuscle} (100% Tension)
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Secondary Synergist Muscles:</span>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {exercise.secondaryMuscles.map((sec, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-lg border border-sky-500/20"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Biomechanics & Form Cues */}
        {activeTab === 'biomechanics' && (
          <div className="space-y-4 animate-fade-in">
            {/* Cues */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Execution Form Cues & Setup</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {exercise.executionCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mistakes */}
            <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Form Mistakes to Avoid</span>
              </div>
              <ul className="space-y-1 text-xs text-rose-200/90 list-disc list-inside">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Close Inspector
          </button>
          {onLogExercise && (
            <button
              onClick={() => {
                onLogExercise(exercise);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Log Active Sets for This Exercise</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
