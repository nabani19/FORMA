import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Crown, 
  Ruler, 
  Dumbbell, 
  TrendingUp, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Zap, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Info,
  Clock
} from 'lucide-react';

interface AestheticExercise {
  name: string;
  targetGroup: string;
  sets: number;
  reps: string;
  rpe: string;
  tempo: string;
  biomechanicsCue: string;
}

interface AestheticSession {
  dayTitle: string;
  focus: string;
  exercises: AestheticExercise[];
}

export const AestheticPhysiqueView: React.FC = () => {
  const { 
    aestheticHistory, 
    addAestheticMeasurement, 
    deleteAestheticMeasurement, 
    setIsPdfExportModalOpen, 
    showToast,
    setActiveTab
  } = useApp();

  // ── 1. Adonis V-Taper Calculator State ───────────────────────────
  const [shouldersInput, setShouldersInput] = useState<string>('48.0');
  const [waistInput, setWaistInput] = useState<string>('31.0');
  const [chestInput, setChestInput] = useState<string>('41.0');
  const [armsInput, setArmsInput] = useState<string>('15.5');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  // Input Validation (0 < circumference <= 100 inches, or <= 254 cm)
  const shouldersNum = parseFloat(shouldersInput) || 0;
  const waistNum = parseFloat(waistInput) || 0;
  const chestNum = parseFloat(chestInput) || 0;
  const armsNum = parseFloat(armsInput) || 0;

  const shouldersInches = unit === 'cm' ? shouldersNum / 2.54 : shouldersNum;
  const waistInches = unit === 'cm' ? waistNum / 2.54 : waistNum;
  const chestInches = unit === 'cm' ? chestNum / 2.54 : chestNum;
  const armsInches = unit === 'cm' ? armsNum / 2.54 : armsNum;

  const isValidInput = shouldersInches > 0 && shouldersInches <= 100 && waistInches > 0 && waistInches <= 100;
  const currentRatio = isValidInput ? parseFloat((shouldersInches / waistInches).toFixed(3)) : 0;
  const goldenTargetRatio = 1.618;

  // Target Delta Calculations
  const requiredShouldersForGolden = isValidInput ? parseFloat((waistInches * goldenTargetRatio).toFixed(1)) : 0;
  const requiredWaistForGolden = isValidInput ? parseFloat((shouldersInches / goldenTargetRatio).toFixed(1)) : 0;
  const shoulderDeltaInches = parseFloat((requiredShouldersForGolden - shouldersInches).toFixed(1));
  const waistDeltaInches = parseFloat((waistInches - requiredWaistForGolden).toFixed(1));

  // Silhouette Classification
  const getRatioStatus = (r: number) => {
    if (r >= 1.618) return { label: 'Golden Adonis Frame (1.618+)', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/40', badge: 'Elite Greek God' };
    if (r >= 1.55) return { label: 'Near Adonis Target (1.55 - 1.61)', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40', badge: 'High Aesthetic' };
    if (r >= 1.45) return { label: 'V-Taper Athletic (1.45 - 1.54)', color: 'text-sky-300', bg: 'bg-sky-500/20 border-sky-500/40', badge: 'Athletic V-Taper' };
    if (r >= 1.30) return { label: 'Athletic Frame (1.30 - 1.44)', color: 'text-indigo-300', bg: 'bg-indigo-500/20 border-indigo-500/40', badge: 'Moderate Taper' };
    return { label: 'Developing Taper (< 1.30)', color: 'text-slate-300', bg: 'bg-slate-800 border-slate-700', badge: 'Foundation Phase' };
  };

  const statusInfo = getRatioStatus(currentRatio);

  const handleSaveMeasurement = () => {
    if (!isValidInput) {
      showToast('Please enter valid measurements (1 to 100 inches).', 'error');
      return;
    }
    addAestheticMeasurement({
      shouldersInches: parseFloat(shouldersInches.toFixed(1)),
      waistInches: parseFloat(waistInches.toFixed(1)),
      chestInches: chestInches > 0 ? parseFloat(chestInches.toFixed(1)) : undefined,
      armsInches: armsInches > 0 ? parseFloat(armsInches.toFixed(1)) : undefined,
    });
  };

  // ── 2. Biomechanics Hierarchy Accordion State ────────────────────
  const [expandedTier, setExpandedTier] = useState<number | null>(1);

  const BIOMECHANICS_HIERARCHY = [
    {
      tier: 1,
      name: 'Lateral Deltoids — The Width Anchor',
      priority: 'Priority #1 (Highest Leverage)',
      target: 'Shoulder Width (The Top of the "V")',
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      exercises: [
        { name: 'Cable Lateral Raises (Constant Tension)', sets: '4 sets × 12-15 reps', tempo: '2-1-3', cue: 'Slight forward lean, internal rotation (thumb-down bias), 1s peak contraction pause.' },
        { name: 'Seated Dumbbell Lateral Raises', sets: '3 sets × 12-15 reps', tempo: '2-0-2', cue: 'Eliminates leg drive; raise in scapular plane 30° forward.' },
        { name: 'Lean-Away Single-Arm Cable Raise', sets: '3 sets × 15-20 reps', tempo: '2-1-2', cue: 'Maximizes length-tension moment arm throughout entire range of motion.' },
      ],
      rationale: 'Lateral delts sit at the widest point of the torso. Standard DB raises have near-zero resistance at the bottom stretch; cables keep tension perpendicular to the arm through the full arc.'
    },
    {
      tier: 2,
      name: 'Lats — The Taper Driver',
      priority: 'Priority #2 (Taper Equation)',
      target: 'Back Width & V-Taper Silhouette',
      color: 'from-sky-500 to-blue-500',
      badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      exercises: [
        { name: 'Wide-Grip Lat Pulldown / Pull-Up (Vertical Pull)', sets: '4 sets × 8-10 reps', tempo: '2-1-3', cue: 'Humerus adduction in scapular plane. Drive elbows down & back. Full overhead stretch.' },
        { name: 'Straight-Arm Cable Pulldown (Isolation)', sets: '3 sets × 12-15 reps', tempo: '2-1-2', cue: 'Isolates lat insertion with zero forearm/biceps fatigue.' },
        { name: 'Chest-Supported Row / Kelso Shrug (Thickness)', sets: '3 sets × 10-12 reps', tempo: '2-1-2', cue: 'Scapular retraction for upper back density and 3D depth.' },
      ],
      rationale: 'Vertical pulls bias width via adduction; horizontal rows bias thickness via scapular retraction. Keep grip passive and drive with the elbows.'
    },
    {
      tier: 3,
      name: 'Upper Chest (Clavicular Pec) — The Frame Filler',
      priority: 'Priority #3 (Upper Torso Balance)',
      target: 'Clavicular Pec Transition & Frame Balance',
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      exercises: [
        { name: 'Incline Barbell / DB Press (30–45° Bench)', sets: '4 sets × 8-10 reps', tempo: '2-0-3', cue: 'Resistance vector perpendicular to clavicular fibers. 3s eccentric, continuous tension (no lockout).' },
        { name: 'Low-to-High Cable Fly', sets: '3 sets × 12-15 reps', tempo: '2-1-2', cue: 'Follows upward fiber angle from sternum to clavicle.' },
        { name: 'Incline Machine Press (Stability-Assisted)', sets: '3 sets × 10-12 reps', tempo: '2-0-2', cue: 'Safe progressive overload to mechanical failure without stabilizer burnout.' },
      ],
      rationale: 'Fills out upper torso and balances shoulder-to-chest transition, preventing a "bottom-heavy" chest appearance under clothing.'
    },
    {
      tier: 4,
      name: 'Arms (Biceps & Triceps) — The Detail Layer',
      priority: 'Priority #4 (Density & Peak)',
      target: 'Arm Fullness & Triceps Density (2/3 of Arm Size)',
      color: 'from-purple-500 to-indigo-500',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      exercises: [
        { name: 'Incline Dumbbell Curl (Long Head Stretch)', sets: '3 sets × 10-12 reps', tempo: '2-1-3', cue: 'Arm behind torso maximizes stretch-mediated hypertrophy of the biceps long head.' },
        { name: 'Overhead Cable Triceps Extension', sets: '4 sets × 10-12 reps', tempo: '2-1-3', cue: 'Shoulder elevation stretches triceps long head at origin for maximal growth.' },
        { name: 'Close-Grip Bench Press', sets: '3 sets × 6-8 reps', tempo: '2-0-2', cue: 'Compound triceps mass builder for dense medial and lateral heads.' },
      ],
      rationale: 'Triceps make up ~66% of upper arm circumference. Prioritize the long heads of both biceps and triceps via length-biased lengthened loading.'
    },
    {
      tier: 5,
      name: 'Abdominals & Obliques — The Waist Illusion',
      priority: 'Priority #5 (Tight Waist Control)',
      target: 'Tight Controlled Waistline (Anti-Widening)',
      color: 'from-rose-500 to-pink-500',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      exercises: [
        { name: 'Hanging Leg Raise (Spinal Decompression)', sets: '3 sets × 10-15 reps', tempo: '2-1-2', cue: 'Flexion-based rectus abdominis movement with zero axial spinal compression.' },
        { name: 'Weighted Cable Crunch', sets: '3 sets × 12-15 reps', tempo: '2-1-2', cue: 'Roll pelvis toward sternum; do not hip flex.' },
      ],
      rationale: 'Train rectus abdominis with flexion movements. Obliques get sufficient stimulus from compound bracing. Heavy side bends widen the waist and ruin the V-taper!'
    },
    {
      tier: 6,
      name: 'Legs — Structural Balance (Non-Negotiable)',
      priority: 'Priority #6 (Proportional Silhouette)',
      target: 'Proportional Lower-Body X-Frame',
      color: 'from-cyan-500 to-teal-500',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      exercises: [
        { name: 'Back Squat or Hack Squat (Quad-Dominant)', sets: '4 sets × 8-10 reps', tempo: '2-0-2', cue: 'Full range of motion below parallel triggers maximal quad sweep hypertrophy.' },
        { name: 'Romanian Deadlift (Posterior Chain Hinge)', sets: '3 sets × 10-12 reps', tempo: '2-1-3', cue: 'Slow hip hinge keeping bar on shins; deep hamstring stretch is the growth trigger.' },
        { name: 'Walking Lunge or Leg Press (Volume Accessory)', sets: '3 sets × 12-15 reps', tempo: '2-0-2', cue: 'Unilateral stability and adductor/glute proportion.' },
      ],
      rationale: 'Skipping legs creates an unbalanced silhouette that makes the upper-body V-taper appear smaller by contrast.'
    },
  ];

  // ── 3. Aesthetic Workout Routine Generator State ─────────────────
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const WORKOUT_SPLITS: Record<'beginner' | 'intermediate' | 'advanced', AestheticSession[]> = {
    beginner: [
      {
        dayTitle: 'Day 1: Upper Frame Width (V-Taper Foundation)',
        focus: 'Lateral Delts, Lat Width & Upper Chest',
        exercises: [
          { name: 'Cable Lateral Raises', targetGroup: 'Side Delts', sets: 4, reps: '12-15', rpe: 'RPE 8', tempo: '2-1-3', biomechanicsCue: 'Slight forward lean, internal rotation (thumb-down bias), 1s peak pause.' },
          { name: 'Wide-Grip Lat Pulldowns', targetGroup: 'Lats (Width)', sets: 4, reps: '8-10', rpe: 'RPE 8', tempo: '2-1-3', biomechanicsCue: 'Elbows drive down & back, deep overhead stretch at top.' },
          { name: 'Incline Dumbbell Press (30°)', targetGroup: 'Upper Chest', sets: 3, reps: '8-12', rpe: 'RPE 8', tempo: '2-0-3', biomechanicsCue: 'Continuous tension on clavicular fibers, avoid locking out.' },
        ]
      },
      {
        dayTitle: 'Day 2: Lower X-Frame Base (Balance Foundation)',
        focus: 'Quad Sweep, Hamstrings & Calves',
        exercises: [
          { name: 'Barbell Back Squats', targetGroup: 'Quads / Glutes', sets: 4, reps: '8-10', rpe: 'RPE 8', tempo: '2-0-2', biomechanicsCue: 'Full range of motion below parallel for complete quad recruitment.' },
          { name: 'Romanian Deadlifts', targetGroup: 'Hamstrings', sets: 3, reps: '10-12', rpe: 'RPE 7.5', tempo: '2-1-3', biomechanicsCue: 'Slow hip hinge; feel deep hamstring stretch under load.' },
          { name: 'Standing Calf Raises', targetGroup: 'Calves', sets: 4, reps: '12-15', rpe: 'RPE 8.5', tempo: '2-2-2', biomechanicsCue: '2s bottom stretch, 2s peak contraction on balls of feet.' },
        ]
      },
      {
        dayTitle: 'Day 3: Arms & Aesthetic Details',
        focus: 'Long Head Biceps, Triceps & Flexion Core',
        exercises: [
          { name: 'Incline Dumbbell Curls', targetGroup: 'Biceps (Long Head)', sets: 3, reps: '10-12', rpe: 'RPE 8', tempo: '2-1-3', biomechanicsCue: 'Arm behind torso for stretch-mediated hypertrophy.' },
          { name: 'Overhead Cable Triceps Extensions', targetGroup: 'Triceps (Long Head)', sets: 3, reps: '10-12', rpe: 'RPE 8', tempo: '2-1-3', biomechanicsCue: 'Shoulders elevated to stretch long head at origin.' },
          { name: 'Hanging Leg Raises', targetGroup: 'Rectus Abdominis', sets: 3, reps: '10-15', rpe: 'RPE 8', tempo: '2-1-2', biomechanicsCue: 'Spinal flexion without rotational stress to preserve waist taper.' },
        ]
      }
    ],
    intermediate: [
      {
        dayTitle: 'Day 1: Upper Width Heavy (Shoulder & Lat Overload)',
        focus: 'Lateral Delt Anchors & Vertical Lat Adduction',
        exercises: [
          { name: 'Cable Lateral Raises (Constant Tension)', targetGroup: 'Side Delts', sets: 4, reps: '12-15', rpe: 'RPE 8.5', tempo: '2-1-3', biomechanicsCue: 'Constant cable tension through full arc.' },
          { name: 'Wide-Grip Weighted Pull-Ups', targetGroup: 'Lats (Width)', sets: 4, reps: '6-8', rpe: 'RPE 8.5', tempo: '2-1-3', biomechanicsCue: 'Scapular plane adduction for maximal lat flare.' },
          { name: 'Incline Barbell Press (30°)', targetGroup: 'Upper Chest', sets: 4, reps: '6-8', rpe: 'RPE 8', tempo: '2-0-3', biomechanicsCue: 'Touch upper sternum, 3s controlled eccentric.' },
          { name: 'Chest-Supported Row', targetGroup: 'Upper Back / Lats', sets: 3, reps: '10-12', rpe: 'RPE 8', tempo: '2-1-2', biomechanicsCue: 'Retract scapulae for upper back 3D thickness.' },
        ]
      },
      {
        dayTitle: 'Day 2: Lower X-Frame Quad & Core Sweep',
        focus: 'Quad Sweep, Leg Hypertrophy & Waist Control',
        exercises: [
          { name: 'Hack Squat (Quad-Dominant)', targetGroup: 'Quads', sets: 4, reps: '8-10', rpe: 'RPE 8.5', tempo: '2-0-2', biomechanicsCue: 'Deep knee flexion below parallel for vastus lateralis sweep.' },
          { name: 'Leg Extensions (Peak Contraction)', targetGroup: 'Rectus Femoris', sets: 3, reps: '12-15', rpe: 'RPE 9', tempo: '2-1-2', biomechanicsCue: '1s hard lock at top of each repetition.' },
          { name: 'Hanging Leg Raises', targetGroup: 'Core (Waist Control)', sets: 4, reps: '12-15', rpe: 'RPE 8', tempo: '2-1-2', biomechanicsCue: 'Strict flexion without heavy rotational loading.' },
        ]
      },
      {
        dayTitle: 'Day 3: Upper Detail Hypertrophy & Arms',
        focus: 'Long Head Arms, Upper Pec Fly & Lean-Away Laterals',
        exercises: [
          { name: 'Lean-Away Single-Arm Cable Raise', targetGroup: 'Side Delts', sets: 4, reps: '15-20', rpe: 'RPE 9', tempo: '2-1-2', biomechanicsCue: 'Lean torso 20° away from cable tower for continuous load.' },
          { name: 'Straight-Arm Cable Pulldown', targetGroup: 'Lats (Isolation)', sets: 3, reps: '12-15', rpe: 'RPE 8.5', tempo: '2-1-2', biomechanicsCue: 'Keep elbows slightly fixed, depress scapulae at bottom.' },
          { name: 'Low-to-High Cable Fly', targetGroup: 'Clavicular Pec', sets: 3, reps: '12-15', rpe: 'RPE 8.5', tempo: '2-1-2', biomechanicsCue: 'Upward scooping arc matching clavicular fiber angle.' },
          { name: 'Incline Dumbbell Curl', targetGroup: 'Biceps (Long Head)', sets: 3, reps: '10-12', rpe: 'RPE 8.5', tempo: '2-1-3', biomechanicsCue: 'Deep lengthened stretch at bottom of each rep.' },
          { name: 'Overhead Cable Triceps Extension', targetGroup: 'Triceps (Long Head)', sets: 4, reps: '10-12', rpe: 'RPE 8.5', tempo: '2-1-3', biomechanicsCue: 'Elbows high, full stretch behind neck.' },
        ]
      },
      {
        dayTitle: 'Day 4: Posterior Chain & Aesthetic Finish',
        focus: 'Hamstring Lengthening, Calves & Upper Traps',
        exercises: [
          { name: 'Romanian Deadlifts (Barbell)', targetGroup: 'Hamstrings', sets: 4, reps: '8-10', rpe: 'RPE 8', tempo: '2-1-3', biomechanicsCue: 'Push hips back until hamstrings reach end-range stretch.' },
          { name: 'Lying Leg Curls', targetGroup: 'Hamstrings', sets: 3, reps: '10-12', rpe: 'RPE 8.5', tempo: '2-1-2', biomechanicsCue: 'Dorsiflex ankles to maximize hamstring recruitment.' },
          { name: 'Seated Calf Raises', targetGroup: 'Soleus', sets: 4, reps: '15-20', rpe: 'RPE 9', tempo: '2-2-2', biomechanicsCue: '2s bottom stretch, 2s squeeze.' },
          { name: 'Weighted Cable Crunch', targetGroup: 'Rectus Abdominis', sets: 3, reps: '12-15', rpe: 'RPE 8', tempo: '2-1-2', biomechanicsCue: 'Curling spine downwards without pulling with arms.' },
        ]
      }
    ],
    advanced: [
      {
        dayTitle: 'Day 1: Upper Width Priority (Side Delt & Lat Dominance)',
        focus: 'High-Frequency V-Taper Overload',
        exercises: [
          { name: 'Cable Lateral Raises (Constant Tension)', targetGroup: 'Side Delts', sets: 5, reps: '12-15', rpe: 'RPE 9', tempo: '2-1-3', biomechanicsCue: 'Top aesthetic priority. 1s pause at peak.' },
          { name: 'Weighted Wide-Grip Pull-Ups', targetGroup: 'Lats (Width)', sets: 4, reps: '6-8', rpe: 'RPE 9', tempo: '2-1-3', biomechanicsCue: 'Dead-hang stretch to chin over bar.' },
          { name: 'Incline Barbell Press (30°)', targetGroup: 'Upper Chest', sets: 4, reps: '6-8', rpe: 'RPE 8.5', tempo: '2-0-3', biomechanicsCue: 'Clavicular overload with 3s eccentric.' },
          { name: 'Straight-Arm Cable Pulldown', targetGroup: 'Lats (Isolation)', sets: 4, reps: '12-15', rpe: 'RPE 8.5', tempo: '2-1-2', biomechanicsCue: 'Total lat fatigue with zero grip burnout.' },
        ]
      },
      {
        dayTitle: 'Day 2: Lower Quad Sweep & Aesthetic Core',
        focus: 'Vastus Lateralis Flaring & Waist Tightening',
        exercises: [
          { name: 'Hack Squats (Narrow Stance)', targetGroup: 'Quads (Sweep)', sets: 4, reps: '8-10', rpe: 'RPE 8.5', tempo: '2-0-2', biomechanicsCue: 'Narrow foot placement emphasizes outer quad sweep.' },
          { name: 'Leg Press (Quad Bias)', targetGroup: 'Quads', sets: 4, reps: '10-12', rpe: 'RPE 8.5', tempo: '2-0-2', biomechanicsCue: 'Feet low on platform, deep knee flexion.' },
          { name: 'Hanging Leg Raises with Hold', targetGroup: 'Core', sets: 4, reps: '12-15', rpe: 'RPE 8.5', tempo: '2-1-2', biomechanicsCue: 'Spinal flexion only; avoid heavy rotational oblique work.' },
        ]
      },
      {
        dayTitle: 'Day 3: Upper Chest & Shoulder Hypertrophy Specialization',
        focus: 'Clavicular Pecs & Lateral Delt Secondary Session',
        exercises: [
          { name: 'Incline Machine Press (Heavy Rest-Pause)', targetGroup: 'Upper Chest', sets: 4, reps: '8-10', rpe: 'RPE 9', tempo: '2-0-2', biomechanicsCue: 'High stability allows pushing past failure safely.' },
          { name: 'Lean-Away Single-Arm Cable Raise', targetGroup: 'Side Delts', sets: 4, reps: '15-20', rpe: 'RPE 9', tempo: '2-1-2', biomechanicsCue: 'Secondary weekly frequency trigger for lateral head.' },
          { name: 'Low-to-High Cable Fly', targetGroup: 'Upper Pecs', sets: 3, reps: '12-15', rpe: 'RPE 8.5', tempo: '2-1-2', biomechanicsCue: 'Squeeze upper chest at chin level.' },
          { name: 'Seated DB Lateral Raises (Drop Set)', targetGroup: 'Side Delts', sets: 3, reps: '12 + 10 drop', rpe: 'RPE 9.5', tempo: '2-0-2', biomechanicsCue: 'Strict form; drop weight by 30% without rest.' },
        ]
      },
      {
        dayTitle: 'Day 4: Posterior Chain & Hamstring Stretch',
        focus: 'Glute-Ham Tie-In & Calves',
        exercises: [
          { name: 'Romanian Deadlifts (Deficit)', targetGroup: 'Hamstrings', sets: 4, reps: '8-10', rpe: 'RPE 8.5', tempo: '2-1-3', biomechanicsCue: 'Extra 1-inch range of motion for maximum hamstring tension.' },
          { name: 'Seated Leg Curls (Lengthened Position)', targetGroup: 'Hamstrings', sets: 4, reps: '10-12', rpe: 'RPE 9', tempo: '2-1-2', biomechanicsCue: 'Torso leaned forward stretches hamstrings at hip joint.' },
          { name: 'Standing Calf Raises (Heavy)', targetGroup: 'Gastrocnemius', sets: 4, reps: '10-12', rpe: 'RPE 9', tempo: '2-2-2', biomechanicsCue: 'Full dorsiflexion stretch.' },
        ]
      },
      {
        dayTitle: 'Day 5: Direct Arm Specialization (Long Head Bias)',
        focus: 'Biceps Peak, Triceps Lateral/Long Head & Forearms',
        exercises: [
          { name: 'Incline Dumbbell Curls', targetGroup: 'Biceps (Long Head)', sets: 4, reps: '10-12', rpe: 'RPE 8.5', tempo: '2-1-3', biomechanicsCue: 'Maximum stretch at bottom.' },
          { name: 'Overhead Cable Triceps Extensions', targetGroup: 'Triceps (Long Head)', sets: 4, reps: '10-12', rpe: 'RPE 9', tempo: '2-1-3', biomechanicsCue: 'Direct triceps volume for upper arm diameter.' },
          { name: 'Hammer Curls (Cross-Body)', targetGroup: 'Brachialis / Forearm', sets: 3, reps: '10-12', rpe: 'RPE 8.5', tempo: '2-0-2', biomechanicsCue: 'Pushes biceps peak outward.' },
          { name: 'Close-Grip Bench Press', targetGroup: 'Triceps Mass', sets: 3, reps: '6-8', rpe: 'RPE 8.5', tempo: '2-0-2', biomechanicsCue: 'Hands shoulder-width apart, elbows tucked.' },
        ]
      }
    ]
  };

  // ── 4. Progressive Overload 2.5%-5% Calculator State ─────────────
  const [calcExercise, setCalcExercise] = useState('Cable Lateral Raises');
  const [currentWeightKg, setCurrentWeightKg] = useState('15');
  const [repsDone, setRepsDone] = useState('15');
  const [rpeLogged, setRpeLogged] = useState('7.5');

  const weightNum = parseFloat(currentWeightKg) || 0;
  const repsNum = parseInt(repsDone, 10) || 0;
  const rpeNum = parseFloat(rpeLogged) || 8;

  const isOverloadTriggered = repsNum >= 12 && rpeNum <= 8.0;
  const recommendedIncreaseKg = isOverloadTriggered
    ? weightNum < 25 ? 1.25 : parseFloat((weightNum * 0.05).toFixed(2))
    : 0;
  const nextTargetWeightKg = parseFloat((weightNum + recommendedIncreaseKg).toFixed(2));

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto px-4 pt-4 animate-fade-in" data-testid="aesthetic-physique-view">

      {/* ── 1. Hero Golden Ratio Header ───────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/30 border border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 font-mono flex items-center gap-1.5 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                ADONIS GOLDEN RATIO Φ = 1.618
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                Biomechanics-Driven V-Taper Suite
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 tracking-tight flex items-center gap-2.5">
              <span>The Aesthetic Physique Blueprint</span>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Aesthetics is an optical illusion built on ratios: maximize shoulder and lat width while keeping a tight, controlled waistline.
              Engineered with length-tension curves, stretch-mediated hypertrophy, and anti-widening waist safeguards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="/aesthetic-physique-blueprint.pdf"
              download="The-Aesthetic-Physique-Blueprint.pdf"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Download Blueprint PDF</span>
            </a>
            <button
              onClick={() => setIsPdfExportModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all"
            >
              <Dumbbell className="w-4 h-4 text-sky-400" />
              <span>Workout Logger</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Adonis V-Taper Index & Silhouette Calculator ─────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 font-heading">
                Adonis Index & V-Taper Ratio Analyzer
              </h3>
              <p className="text-xs text-slate-400">
                Measure circumference around the widest point of shoulders (deltoid lateral heads) and the narrowest point of waist (above navel).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                unit === 'in' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid="btn-unit-in"
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                unit === 'cm' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid="btn-unit-cm"
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* 4-Input Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-[11px] text-amber-300 font-bold block flex items-center justify-between">
              <span>Shoulders ({unit})</span>
              <span className="text-[10px] text-slate-500">Top Width</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={shouldersInput}
              onChange={(e) => setShouldersInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-base font-extrabold focus:outline-none"
              placeholder="e.g. 48.0"
              data-testid="input-shoulders"
            />
            <span className="text-[10px] text-slate-400 block">Deltoid lateral circumference</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-[11px] text-rose-300 font-bold block flex items-center justify-between">
              <span>Waist ({unit})</span>
              <span className="text-[10px] text-slate-500">Base Anchor</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={waistInput}
              onChange={(e) => setWaistInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-slate-100 text-base font-extrabold focus:outline-none"
              placeholder="e.g. 31.0"
              data-testid="input-waist"
            />
            <span className="text-[10px] text-slate-400 block">Narrowest waist circumference</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-[11px] text-emerald-300 font-bold block flex items-center justify-between">
              <span>Chest ({unit})</span>
              <span className="text-[10px] text-slate-500">Optional</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={chestInput}
              onChange={(e) => setChestInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-slate-100 text-base font-extrabold focus:outline-none"
              placeholder="e.g. 41.0"
              data-testid="input-chest"
            />
            <span className="text-[10px] text-slate-400 block">Across mid-nipple line</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-[11px] text-sky-300 font-bold block flex items-center justify-between">
              <span>Arms ({unit})</span>
              <span className="text-[10px] text-slate-500">Optional</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={armsInput}
              onChange={(e) => setArmsInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-xl px-3 py-2 text-slate-100 text-base font-extrabold focus:outline-none"
              placeholder="e.g. 15.5"
              data-testid="input-arms"
            />
            <span className="text-[10px] text-slate-400 block">Flexed peak bicep/tricep</span>
          </div>
        </div>

        {/* Live Ratio Result & Spectrum Gauge */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                Calculated Adonis Shoulder-to-Waist Ratio
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black font-mono text-amber-400 tracking-tight" data-testid="ratio-result">
                  {currentRatio > 0 ? currentRatio.toFixed(3) : '—'}
                </span>
                <div className="space-y-0.5">
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} font-mono block`} data-testid="ratio-badge">
                    {statusInfo.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Golden Guidepost: <strong>1.618</strong> (Adonis Index)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                onClick={handleSaveMeasurement}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all font-mono"
                data-testid="btn-save-measurement"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save to History Log</span>
              </button>
            </div>
          </div>

          {/* Visual Spectrum Progress Meter */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>1.20 (Base)</span>
              <span>1.35 (Athletic)</span>
              <span>1.50 (V-Taper)</span>
              <span className="text-amber-300 font-bold">1.618 (Golden Φ)</span>
              <span>1.75 (X-Frame)</span>
            </div>
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-amber-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(5, ((currentRatio - 1.2) / 0.55) * 100))}%` }}
              />
            </div>
          </div>

          {/* Biomechanical Delta Insight */}
          {isValidInput && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">Upper Width Roadmap:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {shoulderDeltaInches > 0
                      ? `Gain +${shoulderDeltaInches} inches on shoulder perimeter (Side Delts + Lat width) at current waist to hit 1.618.`
                      : `Shoulder width currently surpasses the 1.618 golden proportion by +${Math.abs(shoulderDeltaInches)} in!`}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">Waist Tightening Roadmap:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {waistDeltaInches > 0
                      ? `Alternatively, reduce -${waistDeltaInches} inches from waist via body fat optimization to achieve 1.618 without added size.`
                      : `Waistline is optimally tapered relative to current frame width!`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Critical Safeguard Warning (Waist Widening Prevention) ── */}
      <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900 border border-rose-500/50 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-rose-200 font-heading flex items-center gap-2">
              <span>CRITICAL AESTHETIC SAFEGUARD: Anti-Waist Widening Protocol</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">
                Non-Negotiable
              </span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              <strong>Avoid heavy loaded side bends, heavy dumbbell Russian twists, and weighted oblique rotations.</strong> Oblique muscle hypertrophy directly increases waist circumference, destroying the V-Taper illusion. Obliques receive optimal isometric stimulus from compound bracing (Squats, Rows, Presses). Train core with <strong>pure flexion (Hanging Leg Raises, Cable Crunches)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Interactive 6-Tier Biomechanics Hierarchy Explorer ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 font-heading">
                6-Tier Biomechanics Muscle Hierarchy (The Blueprint)
              </h3>
              <p className="text-xs text-slate-400">
                Sequenced by leverage on the Adonis Ratio — not arbitrary muscle size in a vacuum.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20 self-start sm:self-auto font-bold">
            Evidence-Based Hypertrophy
          </span>
        </div>

        <div className="space-y-3">
          {BIOMECHANICS_HIERARCHY.map((item) => {
            const isExpanded = expandedTier === item.tier;
            return (
              <div
                key={item.tier}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded ? 'bg-slate-950/90 border-slate-700 shadow-lg' : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => setExpandedTier(isExpanded ? null : item.tier)}
                  className="p-4 flex items-center justify-between cursor-pointer gap-3 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center text-slate-300 shrink-0">
                      0{item.tier}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 font-heading truncate">
                          {item.name}
                        </h4>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                          {item.priority}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{item.target}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 space-y-4 border-t border-slate-800/80 text-xs animate-fade-in">
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {item.rationale}
                    </p>

                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold font-mono uppercase text-slate-400 tracking-wider block">
                        Prescribed Biomechanical Exercises & Execution Tempos:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {item.exercises.map((ex, idx) => (
                          <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5 flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-slate-200 text-xs">{ex.name}</div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 font-bold mt-1">
                                <span>{ex.sets}</span>
                                <span>·</span>
                                <span className="text-sky-300">Tempo: {ex.tempo}</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-slate-800/60">
                              {ex.cue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Aesthetic Workout Routine Generator ─────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 font-heading">
                Aesthetic Workout Routine Generator
              </h3>
              <p className="text-xs text-slate-400">
                Periodized routines designed with length-tension bias and V-Taper frequency optimization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExperienceLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase transition-all ${
                  experienceLevel === lvl
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                data-testid={`btn-level-${lvl}`}
              >
                {lvl} ({lvl === 'beginner' ? '3-Day' : lvl === 'intermediate' ? '4-Day' : '5-Day'})
              </button>
            ))}
          </div>
        </div>

        {/* Tabulate-Style Rendered Sessions */}
        <div className="space-y-4" data-testid="workout-split-table">
          {WORKOUT_SPLITS[experienceLevel].map((session, sIdx) => (
            <div key={sIdx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-300 font-mono tracking-wide uppercase">
                    {session.dayTitle}
                  </h4>
                  <span className="text-[11px] text-slate-400">{session.focus}</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 self-start sm:self-auto">
                  {session.exercises.length} Targeted Exercises
                </span>
              </div>

              {/* High-Contrast Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-2">Target Group</th>
                      <th className="py-2 px-2">Exercise</th>
                      <th className="py-2 px-2">Sets</th>
                      <th className="py-2 px-2">Reps</th>
                      <th className="py-2 px-2">Intensity</th>
                      <th className="py-2 px-2">Tempo</th>
                      <th className="py-2 px-2">Biomechanical Cue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {session.exercises.map((ex, eIdx) => (
                      <tr key={eIdx} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-2 font-bold text-amber-400 shrink-0">{ex.targetGroup}</td>
                        <td className="py-2.5 px-2 font-bold text-slate-100">{ex.name}</td>
                        <td className="py-2.5 px-2 text-slate-300">{ex.sets}</td>
                        <td className="py-2.5 px-2 text-slate-300">{ex.reps}</td>
                        <td className="py-2.5 px-2 text-sky-400 font-bold">{ex.rpe}</td>
                        <td className="py-2.5 px-2 text-emerald-400 font-bold">{ex.tempo}</td>
                        <td className="py-2.5 px-2 text-[11px] text-slate-400 font-sans">{ex.biomechanicsCue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Aesthetic Progressive Overload & 1RM Micro-Calculator ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 font-heading">
                Aesthetic Overload Engine (2.5% to 5% Micro-Progression)
              </h3>
              <p className="text-xs text-slate-400">
                Rule Applied: If top rep target is met with RPE &le; 8.0, increase load by 2.5% to 5% on next week session.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 self-start sm:self-auto">
            Auto-Regulated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block font-bold uppercase">Aesthetic Exercise</label>
            <select
              value={calcExercise}
              onChange={(e) => setCalcExercise(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              data-testid="select-overload-exercise"
            >
              <option value="Cable Lateral Raises">Cable Lateral Raises</option>
              <option value="Wide-Grip Lat Pulldowns">Wide-Grip Lat Pulldowns</option>
              <option value="Incline Dumbbell Press">Incline Dumbbell Press</option>
              <option value="Incline Dumbbell Curls">Incline Dumbbell Curls</option>
              <option value="Overhead Cable Triceps Ext">Overhead Cable Triceps Ext</option>
              <option value="Romanian Deadlifts">Romanian Deadlifts</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block font-bold uppercase">Current Load (kg)</label>
            <input
              type="number"
              step="0.5"
              value={currentWeightKg}
              onChange={(e) => setCurrentWeightKg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
              data-testid="overload-current-weight"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block font-bold uppercase">Reps Achieved</label>
            <input
              type="number"
              value={repsDone}
              onChange={(e) => setRepsDone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
              data-testid="input-overload-reps"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block font-bold uppercase">Set RPE / Effort</label>
            <select
              value={rpeLogged}
              onChange={(e) => setRpeLogged(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
              data-testid="select-overload-rpe"
            >
              <option value="6.0">RPE 6 (4 reps in tank)</option>
              <option value="7.0">RPE 7 (3 reps in tank)</option>
              <option value="7.5">RPE 7.5 (2-3 reps in tank)</option>
              <option value="8.0">RPE 8 (2 reps in tank)</option>
              <option value="8.5">RPE 8.5 (1-2 reps in tank)</option>
              <option value="9.0">RPE 9 (1 rep in tank)</option>
              <option value="10.0">RPE 10 (Max Effort / 0 reps)</option>
            </select>
          </div>
        </div>

        {/* Calculation Prescription Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Prescription for Next Session:</span>
            <div className="text-sm font-bold text-slate-100 mt-0.5">
              {isOverloadTriggered ? (
                <span className="text-emerald-400 font-mono font-extrabold flex items-center gap-1.5" data-testid="overload-next-weight">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Target Met! Increase load by +{recommendedIncreaseKg} kg &rarr; Prescribed Target: {nextTargetWeightKg} kg
                </span>
              ) : (
                <span className="text-amber-400 font-mono font-bold flex items-center gap-1.5" data-testid="overload-next-weight">
                  <Info className="w-4 h-4 text-amber-400" />
                  Maintain current {weightNum} kg load until top rep target is met with RPE &le; 8.0.
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto text-center">
            Landmarks: 10–20 Hard Sets/Wk · 48–72h Rest
          </div>
        </div>
      </div>

      {/* ── 7. Historical Measurements & Trend Log ─────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 backdrop-blur-xl" data-testid="history-table">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 font-mono">
              V-Taper Measurement Log History ({aestheticHistory.length} Recorded)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Persistent Local SQLite / Cache
          </span>
        </div>

        {aestheticHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No measurements logged yet. Use the calculator above to record your first entry.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-2">Log Date</th>
                  <th className="py-2 px-2">Shoulders</th>
                  <th className="py-2 px-2">Waist</th>
                  <th className="py-2 px-2">Chest</th>
                  <th className="py-2 px-2">Arms</th>
                  <th className="py-2 px-2">Adonis Ratio</th>
                  <th className="py-2 px-2">Classification</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {aestheticHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/60 transition-colors" data-testid={`history-row-${item.id}`}>
                    <td className="py-2.5 px-2 text-slate-400 font-mono">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-amber-300">{item.shouldersInches} in</td>
                    <td className="py-2.5 px-2 font-bold text-rose-300">{item.waistInches} in</td>
                    <td className="py-2.5 px-2 text-slate-300">{item.chestInches ? `${item.chestInches} in` : '—'}</td>
                    <td className="py-2.5 px-2 text-slate-300">{item.armsInches ? `${item.armsInches} in` : '—'}</td>
                    <td className="py-2.5 px-2 font-black text-amber-400 text-sm">{item.ratio}</td>
                    <td className="py-2.5 px-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => deleteAestheticMeasurement(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete log entry"
                        data-testid={`btn-delete-measurement-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
