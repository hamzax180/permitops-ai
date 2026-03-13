'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Bot, Globe, Database,
  Clock, Building2, FileText, ShieldCheck
} from 'lucide-react';
import type { Variants } from 'framer-motion';

/* ── Animation Variants ── */
const fade: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };

/* ── Data ── */
const howItWorks = [
  { num: '01', icon: FileText,   title: 'Tell us about your business', desc: 'Answer a few questions about your business type, location, and scope.' },
  { num: '02', icon: Bot,        title: 'AI maps your permit path',    desc: 'Our agent system identifies every permit and document required for your case.' },
  { num: '03', icon: Building2,  title: 'Upload documents',            desc: 'We guide you through each required document with checklists and templates.' },
  { num: '04', icon: ShieldCheck, title: 'Receive your approval',      desc: 'Track every approval in real time. Estimated timelines per municipality.' },
];

const features = [
  { icon: Bot,      title: 'Multi-Agent AI',         desc: 'LangGraph orchestrated agents run planning, classification, document validation, and compliance checking in parallel.', badge: 'PydanticAI' },
  { icon: Globe,    title: 'All 39 Districts',        desc: 'Full Istanbul coverage — Beşiktaş, Kadıköy, Şişli, Ataşehir, and 35 more municipalities, each with distinct protocols.', badge: 'Istanbul' },
  { icon: Database, title: 'Real-Time Tracking',      desc: 'Every step of your permit application is tracked in a persistent state machine. Nothing falls through the cracks.', badge: 'LangGraph' },
];

const stats = [
  { value: '39',   label: 'Districts covered' },
  { value: '14+',  label: 'Permit types' },
  { value: '85%',  label: 'Time saved' },
  { value: '98%',  label: 'Success rate' },
];

const logos = ['Beşiktaş', 'Kadıköy', 'Şişli', 'Üsküdar', 'Ataşehir', 'Bakırköy'];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] text-[#e3e3e3] flex flex-col items-center justify-center px-6 transition-colors duration-500">
      
      {/* ═══════════════ GEMINI STYLE CONTENT ═══════════════ */}
      <section className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-10 py-20">
        
        {/* Animated Header Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
             <div className="w-6 h-6 animate-pulse bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] rounded-full blur-[2px] opacity-80" />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ab4f8] to-[#9b72cb] font-semibold text-lg">
               Hi Hamza
             </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white leading-tight">
            Hello there.
          </h1>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-3xl md:text-4xl text-gray-400 font-light"
          >
            How can I help with Istanbul permits today?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 2 }}
            className="text-xl md:text-2xl text-gray-500 font-light italic"
          >
            Where should we start?
          </motion.p>
        </motion.div>

        {/* Minimalist Input Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="w-full max-w-2xl relative group"
        >
          <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-hover:bg-white/10 transition-all duration-300 -z-10" />
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 text-left shadow-2xl">
            <input 
              type="text" 
              placeholder="Ask PermitOps AI..." 
              className="bg-transparent border-none outline-none text-xl text-white placeholder-gray-600 w-full"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-gray-500">
                <FileText size={20} className="hover:text-white cursor-pointer transition-colors" />
                <Bot size={20} className="hover:text-white cursor-pointer transition-colors" />
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-xs text-gray-600 font-medium">Fast v2.4</span>
                 <Link href="/chat">
                    <button className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
                      <ArrowRight size={18} className="text-blue-400" />
                    </button>
                 </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-4"
        >
          {[
            { label: 'Upload documents', icon: FileText, color: 'text-blue-400' },
            { label: 'Check status', icon: Clock, color: 'text-purple-400' },
            { label: 'Beşiktaş protocols', icon: Building2, color: 'text-rose-400' },
            { label: 'Fire safety guide', icon: ShieldCheck, color: 'text-emerald-400' },
          ].map((item, i) => (
            <button 
              key={i}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a1a1a] border border-white/5 hover:border-white/20 hover:bg-[#252525] transition-all text-sm font-medium text-gray-300"
            >
              <item.icon size={14} className={item.color} />
              {item.label}
            </button>
          ))}
        </motion.div>

      </section>

      {/* ═══════════════ PROMO SLIDE ═══════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.8 }}
        className="fixed bottom-10 w-full max-w-lg px-6"
      >
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
             <div className="bg-red-500/10 text-red-500 p-2 rounded-lg">
                <FileText size={16} />
             </div>
             <div>
                <p className="text-xs font-semibold text-white">Sharper insights, better permits.</p>
                <p className="text-[10px] text-gray-500">Meet Nano Banana 2.4 Edition.</p>
             </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors">
            Try it
          </button>
        </div>
      </motion.div>

    </main>
  );
}
