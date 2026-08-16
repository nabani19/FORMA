import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Flame, Zap, Award, CheckCircle2, Lock, Star, ChevronRight, Users, ShieldCheck } from 'lucide-react';

export interface Badge {
  id: string;
  name: string;
  category: 'streak' | 'nutrition' | 'workout' | 'clinical';
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export const GamificationWidget: React.FC = () => {
  const { user, mealLogs } = useApp();
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');

  // Compute Gamification Metrics
  const loggedDays = Math.max(1, mealLogs.length > 0 ? 5 : 1);
  const currentStreak = loggedDays;
  const currentXp = 1250 + mealLogs.length * 50;
  const nextLevelXp = 2000;
  const userLevel = Math.min(10, Math.floor(currentXp / 500) + 1);
  const progressPct = Math.min(100, Math.round(((currentXp % 500) / 500) * 100));

  const badges: Badge[] = [
    {
      id: 'b1',
      name: 'Consistency Master',
      category: 'streak',
      description: 'Log daily nutrition for 5 consecutive days',
      icon: '🔥',
      unlocked: currentStreak >= 5,
      unlockedAt: 'Unlocked Today',
      xpReward: 300,
    },
    {
      id: 'b2',
      name: 'Macro Sniper',
      category: 'nutrition',
      description: 'Hit daily calorie target within 5% precision',
      icon: '🎯',
      unlocked: true,
      unlockedAt: 'Unlocked',
      xpReward: 250,
    },
    {
      id: 'b3',
      name: 'Protein Titan',
      category: 'nutrition',
      description: 'Meet 100% of daily clinical protein target',
      icon: '⚡',
      unlocked: true,
      unlockedAt: 'Unlocked',
      xpReward: 200,
    },
    {
      id: 'b4',
      name: 'Clinical Explorer',
      category: 'clinical',
      description: 'Complete blood biomarker risk analysis',
      icon: '🔬',
      unlocked: true,
      unlockedAt: 'Unlocked',
      xpReward: 350,
    },
    {
      id: 'b5',
      name: 'Iron Overload Champion',
      category: 'workout',
      description: 'Log progressive overload with RPE < 7',
      icon: '🏋️',
      unlocked: true,
      unlockedAt: 'Unlocked',
      xpReward: 400,
    },
    {
      id: 'b6',
      name: 'Budget Savvy Master',
      category: 'nutrition',
      description: 'Keep daily meals strictly within INR budget',
      icon: '🛒',
      unlocked: true,
      unlockedAt: 'Unlocked',
      xpReward: 200,
    },
    {
      id: 'b7',
      name: 'Centurion (30-Day Streak)',
      category: 'streak',
      description: 'Maintain an uninterrupted 30-day logging streak',
      icon: '👑',
      unlocked: false,
      xpReward: 1000,
    },
  ];

  const leaderboardUsers = [
    { rank: 1, name: 'Arjun K.', points: '2,890 XP', streak: '24d streak', avatar: 'AK', badge: 'Titan' },
    { rank: 2, name: `${user.firstName || 'You'} (You)`, points: `${currentXp} XP`, streak: `${currentStreak}d streak`, avatar: user.firstName ? user.firstName[0].toUpperCase() : 'U', badge: 'Sniper', isCurrentUser: true },
    { rank: 3, name: 'Ananya S.', points: '1,420 XP', streak: '12d streak', avatar: 'AS', badge: 'Consistent' },
    { rank: 4, name: 'Rohan M.', points: '1,190 XP', streak: '8d streak', avatar: 'RM', badge: 'Explorer' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 backdrop-blur-xl animate-fade-in" data-testid="gamification-widget">
      
      {/* Header & Streak Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-amber-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-current animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-lg text-slate-100">
                Level {userLevel} Metabolic Athlete
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                {currentStreak} DAY STREAK 🔥
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentXp} total XP earned • {500 - (currentXp % 500)} XP to Level {userLevel + 1}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'badges' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Milestone Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'leaderboard' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Level {userLevel} Progress</span>
          <span className="text-amber-400 font-bold">{progressPct}%</span>
        </div>
        <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* VIEW 1: BADGES GRID */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border transition-all relative flex flex-col justify-between space-y-2 ${
                b.unlocked
                  ? 'bg-slate-950/70 border-amber-500/40 shadow-md'
                  : 'bg-slate-950/30 border-slate-800/60 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{b.icon}</span>
                {b.unlocked ? (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                    +{b.xpReward} XP
                  </span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-100 truncate">{b.name}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">{b.description}</p>
              </div>

              {b.unlocked && (
                <div className="text-[9px] font-mono text-amber-400/90 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  <span>{b.unlockedAt}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: COMMUNITY LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-2 pt-1">
          {leaderboardUsers.map((u) => (
            <div
              key={u.rank}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                u.isCurrentUser
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-extrabold font-mono text-sm ${
                  u.rank === 1 ? 'text-amber-400' : u.rank === 2 ? 'text-slate-200' : 'text-amber-700'
                }`}>
                  #{u.rank}
                </span>

                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center shrink-0">
                  {u.avatar}
                </div>

                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{u.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                      {u.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{u.streak}</div>
                </div>
              </div>

              <strong className="text-xs font-mono text-amber-400">{u.points}</strong>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
