'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Sparkles, X, ArrowLeft, RefreshCw, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';

export default function PricingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(true);
  const [iyzicoFormHtml, setIyzicoFormHtml] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const plans = [
    {
      name: 'Free',
      price: '₺0',
      description: 'Essential business permit guidance for everyone.',
      features: [
        'Basic AI Permit Consultation',
        'Standard Search Capability',
        'Single Active Session',
        'Community Support'
      ],
      buttonText: 'Current Plan',
      isPremium: false,
      color: 'bg-gray-500/10 border-gray-500/20'
    },
    {
      name: 'Premium',
      monthlyPrice: 299,
      yearlyPrice: 3157, // (299 * 12) * 0.88 approx
      description: 'Full capabilities for scaling your business in Istanbul.',
      features: [
        'Unlimited AI Permit Consultations',
        'Priority Agent Workflows',
        'Unlimited Project Histories',
        'Advanced Doc Management',
        '1-on-1 Regulatory Support',
        'Early Access to New Laws'
      ],
      buttonText: 'Upgrade to Premium',
      isPremium: true,
      popular: true,
      color: 'bg-indigo-600/5 border-indigo-500/30'
    }
  ];

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    try {
      setIsSubscribing(true);
      const token = localStorage.getItem('permitops_token');
      if (!token) {
        setToast({ message: "Please log in to browse plans", type: 'error' });
        router.push('/login');
        return;
      }

      // We'll use sandbox codes or placeholder codes
      // In production, these would be the real iyzico PricingPlanReferenceCodes
      const planCode = planType === 'yearly' ? 'P66275815_YEARLY' : 'P66275815_MONTHLY';

      const res = await apiFetch(`/payment/subscribe?token=${token}&plan_code=${planCode}`, { method: 'POST' });
      if (res && res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.checkoutFormContent) {
          setIyzicoFormHtml(json.checkoutFormContent);
        } else {
          throw new Error(json.errorMessage || "Initialization failed");
        }
      } else {
        throw new Error("Payment server unreachable");
      }
    } catch (e: any) {
      setToast({ message: e.message || "Failed to start subscription", type: 'error' });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[12px] font-bold tracking-widest uppercase"
          >
            <Sparkles size={14} />
            Pricing Plans
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-[var(--text)] tracking-tight"
          >
            Empower Your Permit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Journey</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--muted)] max-w-2xl mx-auto font-medium"
          >
            Choose the plan that fits your business scale. From independent cafes to large-scale retail chains, we've got you covered with automated regulatory compliance.
          </motion.p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm font-bold ${!isYearly ? 'text-indigo-600' : 'text-[var(--muted)]'}`}>Monthly</span>
          <div 
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] p-1 cursor-pointer flex items-center relative transition-colors hover:border-indigo-500/40"
          >
            <motion.div 
              animate={{ x: isYearly ? 24 : 0 }}
              className="w-6 h-6 rounded-full bg-indigo-600 shadow-md flex items-center justify-center"
            />
          </div>
          <span className={`text-sm font-bold ${isYearly ? 'text-indigo-600' : 'text-[var(--muted)]'}`}>
            Yearly
          </span>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase"
          >
            Save 12%
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={`relative p-8 rounded-[40px] border shadow-xl flex flex-col transition-all hover:scale-[1.02] ${plan.color} backdrop-blur-md`}
            >
              {plan.popular && (
                <div className="absolute top-6 right-8 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-black text-[var(--text)] mb-2 uppercase tracking-wide">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-[var(--text)]">
                    {plan.name === 'Free' ? '₺0' : (isYearly ? `₺${Math.round(plan.yearlyPrice / 12)}` : `₺${plan.monthlyPrice}`)}
                  </span>
                  <span className="text-[var(--muted)] font-medium">/month</span>
                </div>
                {plan.isPremium && isYearly && (
                  <p className="text-[10px] text-indigo-500 font-bold mt-2">Billed annually at ₺{plan.yearlyPrice}</p>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-3">
                    <div className="mt-1 p-0.5 rounded-full bg-indigo-500/10 text-indigo-600">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">{feat}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={!plan.isPremium || isSubscribing}
                onClick={() => handleSubscribe(isYearly ? 'yearly' : 'monthly')}
                className={`w-full py-4 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 group ${
                  plan.isPremium 
                    ? 'bg-indigo-600 text-white shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95' 
                    : 'bg-[var(--surface-2)] text-[var(--muted)] cursor-not-allowed opacity-60'
                }`}
              >
                {isSubscribing && plan.isPremium ? <RefreshCw size={18} className="animate-spin" /> : (plan.isPremium ? <Zap size={18} fill="currentColor" /> : <Star size={18} />)}
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ/Trust */}
        <div className="mt-20 text-center">
            <p className="text-[var(--muted)] text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
              <ShieldCheck className="text-emerald-500" size={16} />
              Secure payments powered by <strong>iyzico</strong>. Cancel anytime with one click.
            </p>
        </div>
      </main>

      {/* iyzico Modal */}
      <AnimatePresence>
        {iyzicoFormHtml && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-[#1e1f20] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border border-[var(--border)]"
               style={{ minHeight: '650px' }}
            >
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xl text-[var(--text)] uppercase tracking-wide">Secure Checkout</h3>
                  <p className="text-xs text-[var(--muted)] font-medium">Complete your Premium subscription via iyzico</p>
                </div>
                <button onClick={() => setIyzicoFormHtml(null)} className="p-2 hover:bg-black/5 rounded-full text-[var(--muted)] transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4" id="iyzico-form-container">
                 <div dangerouslySetInnerHTML={{ __html: iyzicoFormHtml }} />
                 <div id="iyzipay-checkout-form" className="responsive"></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]">
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-lg border ${
                toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
             }`}
           >
              {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
              <span className="text-sm font-black">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
           </motion.div>
        </div>
      )}
    </div>
  );
}
