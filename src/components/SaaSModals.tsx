import React, { useState } from 'react';
import { useApp, UserPlan } from '../context/AppContext';
import { X, Lock, CreditCard, ShieldCheck, MessageSquare, Check, Sparkles } from 'lucide-react';

export const SaaSModals: React.FC = () => {
  const {
    userPlan,
    selectPlan,
    isLoggedIn,
    toggleLogin,
    cookiesAccepted,
    acceptCookies,
    declineCookies,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isBillingModalOpen,
    setIsBillingModalOpen,
    isLegalModalOpen,
    setIsLegalModalOpen,
    isSupportModalOpen,
    setIsSupportModalOpen,
    submitSupportTicket,
  } = useApp();

  const [supportCategory, setSupportCategory] = useState<string>('bug');
  const [supportMessage, setSupportMessage] = useState<string>('');

  return (
    <>
      {/* 1. AUTH MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold font-heading text-lg">
                <Lock className="w-5 h-5" />
                <span>Account & Authentication</span>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="text-xs text-slate-300">
                Logged in as: <strong className="text-slate-100">user@forma-ai.io</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Plan:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {userPlan} Plan
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={toggleLogin}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
                >
                  {isLoggedIn ? 'Sign Out' : 'Sign In'}
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsBillingModalOpen(true);
                }}
                className="text-xs text-emerald-400 font-bold hover:underline"
              >
                Manage Subscription & Upgrade →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BILLING & SUBSCRIPTIONS MODAL */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold font-heading text-xl">
                <CreditCard className="w-6 h-6" />
                <span>SaaS Subscription Plans</span>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Upgrade your Forma protocol to unlock unlimited AI vision scans, blood biomarker risk AI, and personalized workout splits.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Starter Plan */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                userPlan === 'starter' ? 'bg-slate-800/80 border-emerald-500' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <h4 className="font-heading font-extrabold text-base text-slate-100">Starter Protocol</h4>
                  <div className="text-2xl font-extrabold text-white mt-1">₹0 <span className="text-xs font-medium text-slate-400">/ month</span></div>
                  <ul className="text-xs text-slate-300 space-y-2 mt-4">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Basic Food Scanner</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Daily Macro Logging</li>
                  </ul>
                </div>
                <button
                  onClick={() => selectPlan('starter')}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-colors ${
                    userPlan === 'starter' ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                  }`}
                >
                  {userPlan === 'starter' ? 'Active Plan' : 'Select Starter'}
                </button>
              </div>

              {/* Pro Warrior Plan */}
              <div className={`p-5 rounded-2xl border relative flex flex-col justify-between space-y-4 ${
                userPlan === 'pro' ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="absolute -top-3 right-4 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Recommended
                </span>
                <div>
                  <h4 className="font-heading font-extrabold text-base text-slate-100">Pro Warrior</h4>
                  <div className="text-2xl font-extrabold text-white mt-1">₹499 <span className="text-xs font-medium text-slate-400">/ month</span></div>
                  <ul className="text-xs text-slate-300 space-y-2 mt-4">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited AI Vision Scans</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Medical Blood Risk AI</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Allergen Safeguard Engine</li>
                  </ul>
                </div>
                <button
                  onClick={() => selectPlan('pro')}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-colors ${
                    userPlan === 'pro' ? 'bg-emerald-500 text-slate-950' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950'
                  }`}
                >
                  {userPlan === 'pro' ? 'Active Plan' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                userPlan === 'enterprise' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <h4 className="font-heading font-extrabold text-base text-slate-100">Enterprise Fortress</h4>
                  <div className="text-2xl font-extrabold text-white mt-1">₹1,999 <span className="text-xs font-medium text-slate-400">/ month</span></div>
                  <ul className="text-xs text-slate-300 space-y-2 mt-4">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-User Household Vault</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 24/7 AI Nutrition Coach</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Custom Export & PDF Reports</li>
                  </ul>
                </div>
                <button
                  onClick={() => selectPlan('enterprise')}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-colors ${
                    userPlan === 'enterprise' ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                  }`}
                >
                  {userPlan === 'enterprise' ? 'Active Plan' : 'Upgrade to Enterprise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LEGAL & PRIVACY MODAL */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold font-heading text-lg">
                <ShieldCheck className="w-5 h-5" />
                <span>Privacy Policy & Terms of Service</span>
              </div>
              <button
                onClick={() => setIsLegalModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3 text-xs text-slate-300 max-h-96 overflow-y-auto leading-relaxed">
              <h4 className="font-bold text-slate-100">1. Data Privacy & GDPR Compliance</h4>
              <p>
                Forma protects user health metrics and meal logs. All data is encrypted locally or in secure cloud storage. We never monetize or sell personal nutritional data.
              </p>
              <h4 className="font-bold text-slate-100 mt-2">2. Terms of Use</h4>
              <p>
                Nutritional recommendations and blood biomarker classifications are provided for fitness tracking purposes only. They do not constitute formal medical diagnostics.
              </p>
              <h4 className="font-bold text-slate-100 mt-2">3. Subscription Cancellation</h4>
              <p>
                Subscriptions can be modified or cancelled at any time without hidden fees.
              </p>
            </div>

            <button
              onClick={() => setIsLegalModalOpen(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
            >
              I Accept Terms & Conditions
            </button>
          </div>
        </div>
      )}

      {/* 4. SUPPORT & BUG REPORT MODAL */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold font-heading text-lg">
                <MessageSquare className="w-5 h-5" />
                <span>Support & Bug Feedback</span>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSupportTicket(supportCategory, supportMessage);
                setSupportMessage('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category:</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="bug">🐛 Report a Bug</option>
                  <option value="feature">💡 Feature Request</option>
                  <option value="question">❓ General Question</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Message:</label>
                <textarea
                  required
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue or suggestion..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. COOKIE CONSENT BANNER */}
      {!cookiesAccepted && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 border-t border-emerald-500/30 p-4 backdrop-blur-md shadow-2xl animate-fade-in">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 text-center sm:text-left">
              🍪 We use essential cookies to keep your Forma session secure and save your health preferences.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={acceptCookies}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={declineCookies}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
