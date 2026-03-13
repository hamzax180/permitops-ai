'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Bot, Globe, Database,
  Clock, Building2, FileText, ShieldCheck,
  ChevronDown, Search, Sparkles
} from 'lucide-react';
import type { Variants } from 'framer-motion';

/* ── Animation Variants ── */
const fade: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };

/* ── Data ── */
const howItWorks = [
  { num: '01', icon: FileText, title: 'Tell us about your business', desc: 'Answer a few questions about your business type, location, and scope.' },
  { num: '02', icon: Bot, title: 'AI maps your permit path', desc: 'Our agent system identifies every permit and document required for your case.' },
  { num: '03', icon: Building2, title: 'Upload documents', desc: 'We guide you through each required document with checklists and templates.' },
  { num: '04', icon: ShieldCheck, title: 'Receive your approval', desc: 'Track every approval in real time. Estimated timelines per municipality.' },
];

const features = [
  { icon: Bot, title: 'Multi-Agent AI', desc: 'LangGraph orchestrated agents run planning, classification, document validation, and compliance checking in parallel.', badge: 'PydanticAI' },
  { icon: Globe, title: 'All 39 Districts', desc: 'Full Istanbul coverage — Beşiktaş, Kadıköy, Şişli, Ataşehir, and 35 more municipalities, each with distinct protocols.', badge: 'Istanbul' },
  { icon: Database, title: 'Real-Time Tracking', desc: 'Every step of your permit application is tracked in a persistent state machine. Nothing falls through the cracks.', badge: 'LangGraph' },
];

const stats = [
  { value: '39', label: 'Districts covered' },
  { value: '14+', label: 'Permit types' },
  { value: '85%', label: 'Time saved' },
  { value: '98%', label: 'Success rate' },
];

const logos = ['Beşiktaş', 'Kadıköy', 'Şişli', 'Üsküdar', 'Ataşehir', 'Bakırköy'];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden">

      {/* ═══════════════ GEMINI STYLE CONTENT ═══════════════ */}
      <section className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-10 pt-24 pb-10 px-6 relative">

        {/* Animated Header Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-6 h-6 animate-pulse bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] rounded-full blur-[2px] opacity-80" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#8ab4f8] dark:to-[#9b72cb] font-semibold text-lg">
              Hi Hamza
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-[var(--text)] leading-tight">
            Hello there.
          </h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-3xl md:text-4xl text-[var(--muted)] font-light"
          >
            How can I help with Istanbul permits today?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 2 }}
            className="text-xl md:text-2xl text-[var(--muted)] font-light italic opacity-60"
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
          <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-2xl blur-xl group-hover:bg-[var(--accent)]/10 transition-all duration-300 -z-10" />
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 text-left shadow-xl dark:shadow-2xl">
            <input
              type="text"
              placeholder="Ask PermitOps AI..."
              className="bg-transparent border-none outline-none text-xl text-[var(--text)] placeholder-[var(--muted)] w-full"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-[var(--muted)]">
                <FileText size={20} className="hover:text-[var(--text)] cursor-pointer transition-colors" />
                <Bot size={20} className="hover:text-[var(--text)] cursor-pointer transition-colors" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)] font-medium">Fast v2.4</span>
                <Link href="/chat">
                  <button className="bg-[var(--surface-2)] hover:bg-[var(--border-2)] p-2 rounded-full transition-colors border border-[var(--border)]">
                    <ArrowRight size={18} className="text-blue-500" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Pills - More tightly clustered under chat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-2"
        >
          {[
            { label: 'Upload documents', icon: FileText, color: 'text-blue-500' },
            { label: 'Check status', icon: Clock, color: 'text-purple-500' },
            { label: 'Beşiktaş protocols', icon: Building2, color: 'text-rose-500' },
            { label: 'Fire safety guide', icon: ShieldCheck, color: 'text-emerald-500' },
          ].map((item, i) => (
            <button
              key={i}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-2)] hover:bg-[var(--surface-2)] transition-all text-sm font-medium text-[var(--text)] shadow-sm"
            >
              <item.icon size={14} className={item.color} />
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* Scroll Down Arrow - Moved lower to bridge the gap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1 }}
          className="pt-32 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">How it works</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>

      </section>

      {/* ═══════════════ HOW IT WORKS SECTION ═══════════════ */}
      <section id="how-it-works" className="w-full relative overflow-hidden py-40">
        {/* Live Video Background - Brighter & Full Fit */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/how_it_works.mp4" type="video/mp4" />
          </video>
          {/* Sharp Gradual Transitions (The Split) */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg)] to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent z-10" />
          {/* Subtle Dark Overlay for Text Pop */}
          <div className="absolute inset-0 bg-black/30 z-[5]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 px-6">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-lg font-black uppercase tracking-[0.6em] text-purple-500 drop-shadow-sm font-['Outfit']">The Process</h3>
            <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">Getting permits shouldn't be a mystery.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "1. Describe",
                desc: "Enter your business type or permit requirement in plain Turkish or English. Our AI understands municipal nuance.",
                icon: Search
              },
              {
                title: "2. Analyze",
                desc: "PermitOps AI cross-references 450+ municipal protocols to determine your exact path and required files.",
                icon: Sparkles
              },
              {
                title: "3. Automate",
                desc: "Our RPA bot handles the heavy lifting on e-Devlet, filling forms and tracking status while you focus on business.",
                icon: Bot
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col space-y-6 group/card"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white shadow-lg">
                  <step.icon size={24} />
                </div>
                <h4 className="text-2xl font-bold text-white drop-shadow-md">{step.title}</h4>
                <p className="text-lg text-white/95 leading-relaxed font-bold drop-shadow-md">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
