import React, { useState } from 'react';
import { Mail, Bug, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface SupportBugModalProps {
  mode: 'support' | 'bug' | null;
  onClose: () => void;
}

export const SupportBugModal: React.FC<SupportBugModalProps> = ({ mode, onClose }) => {
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'critical'>('medium');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!mode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-zinc-800 p-6 sm:p-8 space-y-4 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            {mode === 'support' ? <Mail className="w-5 h-5" /> : <Bug className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-display">
              {mode === 'support' ? 'Contact Support & Feedback' : 'Submit Bug Report'}
            </h3>
            <span className="text-xs text-zinc-400">
              {mode === 'support' ? 'Response within 24 hours' : 'Direct report to QA Engineering team'}
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-emerald-400">
              {mode === 'support' ? 'Feedback message sent!' : 'Bug report submitted successfully!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'bug' && (
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'critical'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`py-1.5 rounded-lg border font-bold capitalize transition ${
                        severity === sev 
                          ? sev === 'critical' ? 'bg-red-600 text-white border-red-500' : 'bg-blue-600 text-white border-blue-500' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-zinc-400 font-bold block mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder={mode === 'support' ? 'How can we help?' : 'Brief description of issue'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-bold block mb-1">Details & Steps to Reproduce</label>
              <textarea
                rows={4}
                required
                placeholder={mode === 'support' ? 'Tell us your thoughts or feature request...' : 'Describe what happened and steps to reproduce...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue transition"
            >
              Submit {mode === 'support' ? 'Support Ticket' : 'Bug Report'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
