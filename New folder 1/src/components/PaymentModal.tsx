import React, { useState } from 'react';
import { useAppStore, formatInr } from '../store/useAppStore';
import { SubscriptionPlan } from '../types';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, X, AlertTriangle } from 'lucide-react';

interface PaymentModalProps {
  targetPlan: SubscriptionPlan;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ targetPlan, isOpen, onClose }) => {
  const { userProfile, updateProfile } = useAppStore();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const planPrices: Record<SubscriptionPlan, number> = {
    free: 0,
    pro: 499,
    elite: 999,
  };

  const currentPrice = planPrices[userProfile.subscriptionPlan];
  const newPrice = planPrices[targetPlan];
  const isUpgrade = newPrice > currentPrice;
  const isCancel = targetPlan === 'free';

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      updateProfile({ subscriptionPlan: targetPlan });
      setSuccessMessage(
        isCancel 
          ? 'Subscription cancelled. Switched to Starter Free Plan.' 
          : isUpgrade 
            ? `Successfully upgraded to ${targetPlan.toUpperCase()} Plan (${formatInr(newPrice)}/mo)!` 
            : `Switched plan to ${targetPlan.toUpperCase()} (${formatInr(newPrice)}/mo).`
      );

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-zinc-800 p-6 sm:p-8 space-y-5 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-display">
              {isCancel ? 'Cancel Subscription' : isUpgrade ? 'Upgrade Plan Checkout' : 'Change Plan'}
            </h3>
            <span className="text-xs text-zinc-400">INR Payment Gateway • Encrypted (Razorpay/Stripe)</span>
          </div>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-emerald-400">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Plan Breakdown */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Target Subscription Tier:</span>
                <span className="font-bold text-white uppercase">{targetPlan} Plan</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Billing Amount:</span>
                <span className="text-base font-extrabold text-emerald-400 font-display">
                  {formatInr(newPrice)} / month
                </span>
              </div>
            </div>

            {/* Test Payment Disclaimer */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Simulated Payment Gateway. No actual funds will be charged.</span>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-2 ${
                isCancel 
                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-glow-blue'
              }`}
            >
              {isProcessing ? (
                <span>Processing Transaction...</span>
              ) : (
                <span>{isCancel ? 'Confirm Cancellation' : `Pay ${formatInr(newPrice)} & Activate`}</span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
