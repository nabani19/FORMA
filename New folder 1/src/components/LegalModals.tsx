import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Cookie, FileText, X, Check } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const consent = localStorage.getItem('tracker_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    localStorage.setItem('tracker_cookie_consent', type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slide-up">
      <div className="glass-panel p-5 rounded-3xl border border-zinc-800 shadow-2xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Privacy & Cookie Preferences (GDPR)
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              We use essential cookies to maintain your encrypted session, TDEE calculations, and zero-trust security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleAccept('all')}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
          >
            Accept All Cookies
          </button>
          <button
            onClick={() => handleAccept('essential')}
            className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs transition"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-zinc-800 p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            {type === 'privacy' ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </span>
          <h3 className="text-xl font-extrabold text-white font-display">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions of Service'}
          </h3>
        </div>

        <div className="text-xs text-zinc-300 space-y-3 leading-relaxed border-t border-zinc-800 pt-4">
          {type === 'privacy' ? (
            <>
              <p><strong>1. Data Security & Storage:</strong> TRACker stores your nutritional data, macro targets, and profile settings in production-hardened PostgreSQL databases backed by Supabase with Row Level Security (RLS).</p>
              <p><strong>2. Encryption Standards:</strong> User authentication credentials are protected using Argon2id password hashing parameters. Session tokens are stored strictly in secure HttpOnly cookies.</p>
              <p><strong>3. AI Vision Data Handling:</strong> Food images captured via the AI Scanner are processed ephemerally for nutritional identification and are not sold or redistributed to third parties.</p>
              <p><strong>4. User Rights (GDPR/CCPA):</strong> You retain full rights to request data deletion, export your logged workouts/meals, or close your account at any time.</p>
            </>
          ) : (
            <>
              <p><strong>1. Service Disclaimer:</strong> TRACker provides AI-assisted nutrition and calorie estimates using Mifflin-St Jeor formulas. This application does not provide formal medical or clinical advice.</p>
              <p><strong>2. Subscriptions & Payments:</strong> Subscriptions (Pro ₹499/mo, Elite ₹999/mo) are billed monthly in INR. You may upgrade, downgrade, or cancel your plan at any time without penalty.</p>
              <p><strong>3. User Conduct:</strong> Users agree not to attempt reverse engineering or unauthorized API exploitation of the vision model endpoints.</p>
              <p><strong>4. Availability:</strong> TRACker strives for 99.9% uptime on Vercel deployment infrastructure.</p>
            </>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
