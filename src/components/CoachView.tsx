import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage, CoachingTip } from '../types';
import { Bot, Send, Sparkles, User as UserIcon, Lightbulb, CheckCircle2, ChevronRight, Zap, Cpu } from 'lucide-react';
import { askAiCoach, AiChatMessage, TOP_AI_MODELS } from '../utils/aiService';
import { checkRateLimit } from '../utils/securityEngine';

export const CoachView: React.FC = () => {
  const { user, preferences, mealLogs, setIsScannerOpen, showToast } = useApp();

  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-001');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: `Hello ${user.firstName || 'Jane'}! I am Forma AI, your clinical nutritionist and strength performance coach. Powered by top-tier frontier models and latest WHO & ICMR-NIN 2024 standards, I specialize in authentic Indian family meal planning, macro nutrient timing, and budget optimization (Meals: ₹${Math.round((user.monthlyBudgetInr || 6000) / 30)}/day × 30 days = ₹${user.monthlyBudgetInr || 6000}/mo + Supplements: ₹2,400/mo). How can I guide you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Plan 5 Indian family meals under ₹180/day',
        'How to hit 140g protein with Soya & Moong Dal?',
        'Analyze my daily calorie & macro balance',
        'Recommend post-workout recovery snacks',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Compute stats for context
  const totalProtein = Math.round(mealLogs.reduce((sum, log) => sum + log.calculatedNutrients.protein_g, 0));
  const totalCalories = Math.round(mealLogs.reduce((sum, log) => sum + log.calculatedNutrients.calories, 0));

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery.trim();
    if (!textToSend || isThinking) return;

    // Rate Limit Protection: 10 queries per minute per client
    const rateCheck = checkRateLimit('user_ai_coach', 10, 60000);
    if (!rateCheck.allowed) {
      showToast(`Rate limit reached. Please wait ${rateCheck.resetSeconds}s before sending another message.`, 'warning');
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!queryText) setInputQuery('');
    setIsThinking(true);

    try {
      // Convert history for OpenRouter
      const historyForApi: AiChatMessage[] = newMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const aiReplyText = await askAiCoach(
        historyForApi,
        {
          caloriesTarget: user.dailyCalorieTarget,
          proteinTarget: user.dailyProteinTargetG,
          healthGoal: user.healthGoal,
          dietaryPreferences: preferences.map((p) => p.value),
          allergies: preferences.filter((p) => p.type === 'allergy').map((p) => p.value),
          monthlyBudgetInr: user.monthlyBudgetInr || 6000,
          supplementBudgetInr: 2400,
        },
        selectedModel
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Plan tomorrow’s 5 Indian meals', 'Open Food Scanner', 'Review Supplement Stack'],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error generating AI coach response:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const coachingTips: CoachingTip[] = [
    {
      id: 'tip_1',
      title: 'Post-Workout Leucine Threshold (2.7g)',
      category: 'protein',
      summary: 'Consume 25-35g of protein rich in Leucine within 90 minutes of resistance training.',
      details: 'Muscle Protein Synthesis (MPS) requires crossing the leucine trigger threshold. Whey Isolate, Eggs, Soya Chunks or Paneer provide optimal essential amino acids for fast recovery.',
      actionableSteps: ['Drink Whey Shake post-workout', 'Pair with 30g fast-digesting carbs'],
      impactLevel: 'high',
      read: false,
    },
    {
      id: 'tip_2',
      title: 'Latest WHO / ICMR 35ml/kg Hydration Protocol',
      category: 'hydration',
      summary: 'Target 3.2 Liters of water daily to optimize dietary fiber gut transit and muscle volumization.',
      details: 'Under latest WHO consensus, drinking adequate water stabilizes plasma volume, prevents false hunger pangs, and maximizes muscle intracellular creatine uptake.',
      actionableSteps: ['Drink 500ml upon waking', 'Hydrate between 5 meals'],
      impactLevel: 'medium',
      read: true,
    },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">Forma AI Nutritionist & Coach</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 animate-pulse" /> LIVE MULTI-MODEL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time conversational intelligence with WHO & ICMR 2024 guidelines, Indian family diets, and budget algorithms.
          </p>
        </div>

        {/* Live Daily Macro Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Protein</span>
            <span className="text-sm font-bold font-mono text-sky-400">
              {totalProtein}g / {user.dailyProteinTargetG}g
            </span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Calories</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {totalCalories} / {user.dailyCalorieTarget} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Active Frontier LLM:</span>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {TOP_AI_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedModel === m.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{m.name}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                {m.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col h-[550px] backdrop-blur-xl">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold shadow-lg'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] text-right font-mono ${
                    msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (action.includes('Scanner')) {
                            setIsScannerOpen(true);
                          } else {
                            handleSend(action);
                          }
                        }}
                        className="text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all"
                      >
                        {action} →
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start items-center text-xs text-emerald-400 font-mono">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl animate-pulse">
                Forma AI is running {TOP_AI_MODELS.find(m => m.id === selectedModel)?.name || 'Gemini 2.0'} inference...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800/80 mt-2 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Forma AI about Indian family recipes, WHO macros, budget meals (₹180/day) or workout recovery..."
            className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isThinking || !inputQuery.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all flex items-center justify-center shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Verified Clinical Guidelines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coachingTips.map((tip) => (
          <div
            key={tip.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                {tip.category}
              </span>
              <span className="text-[10px] font-semibold text-sky-400 font-mono">Impact: High</span>
            </div>
            <h4 className="font-bold text-sm text-slate-100 font-heading">{tip.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{tip.details}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
