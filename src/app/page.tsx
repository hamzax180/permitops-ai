'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Shield, Bot, Cpu, Globe, CheckCircle,
  Building, FileText, Clock, Star
} from 'lucide-react';

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
} as const;
const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  show:   { y: 0,  opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } }
} as const;

const steps = [
  { label: 'Answer questions',     icon: FileText, done: true },
  { label: 'AI maps your permits', icon: Bot,      done: true },
  { label: 'Upload documents',     icon: Building, done: false },
  { label: 'Receive approvals',    icon: CheckCircle, done: false },
];

const features = [
  {
    icon: Bot, title: 'Multi-Agent AI',
    desc: 'LangGraph orchestrated agents handle planning, classification, validation, and compliance checking in parallel.',
    badge: 'PydanticAI',
  },
  {
    icon: Globe, title: 'Municipal Integration',
    desc: 'Deep knowledge of Beşiktaş, Kadıköy, Şişli and all 39 Istanbul district protocols and regulation codes.',
    badge: 'Istanbul',
  },
  {
    icon: Cpu, title: 'Auto-Document Analysis',
    desc: 'Validator agents cross-check your uploaded PDFs against live Turkish regulatory schemas instantly.',
    badge: 'pgvector',
  },
];

export default function Home() {
  return (
    <main className="pt-32 pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-28">

          {/* ── Hero ── */}
          <section className="text-center space-y-8 relative">
            {/* Decorative bg orb */}
            <div className="absolute inset-0 pointer-events-none -z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.2),transparent_70%)]" />
            </div>

            <motion.div variants={fadeUp}>
              <span className="badge badge-blue">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative rounded-full h-1.5 w-1.5 bg-blue-500" />
                </span>
                Istanbul Live · v2.4 Protocol
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight"
            >
              Get your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-sky-400">Turkish business permit</span><br />
              in days, not months.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              PermitOps AI uses multi-agent intelligence to plan, validate, and track every step of your
              restaurant, cafe, or retail permit application in Turkey.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/chat">
                <button className="btn-primary text-base px-8 py-4">
                  Start Free Application <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="btn-ghost text-base px-8 py-4">
                  View Demo Dashboard
                </button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 pt-4">
              {['100% Free to Start', 'No Lawyer Required', 'Municipality-Verified'].map(t => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> {t}
                </span>
              ))}
            </motion.div>
          </section>

          {/* ── How It Works ── */}
          <motion.section variants={fadeUp} className="space-y-10">
            <div className="text-center space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400">The Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">How it works in 4 steps</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((s, i) => (
                <div key={i} className={`card p-6 flex flex-col items-center text-center gap-4 ${s.done ? 'border-blue-500/20' : ''}`}>
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${s.done ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                    <s.icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Step {i + 1}</span>
                  <p className="text-sm font-semibold text-white leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── Features ── */}
          <motion.section variants={fadeUp} className="space-y-10">
            <div className="text-center space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Technology</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Enterprise-grade AI, built for Turkey</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="card p-8 space-y-5 group">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/25 transition-colors">
                      <f.icon size={24} />
                    </div>
                    <span className="badge badge-amber">{f.badge}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── Social Proof / Stats ── */}
          <motion.section variants={fadeUp}>
            <div className="card p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { num: '39', label: 'Istanbul Districts Supported' },
                { num: '85%', label: 'Faster than Manual Process' },
                { num: '14+', label: 'Permit Types Automated' },
                { num: '98%', label: 'Approval Success Rate' },
              ].map((s, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-4xl md:text-5xl font-black text-white">{s.num}</p>
                  <p className="text-sm text-slate-400 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── CTA Banner ── */}
          <motion.section variants={fadeUp}>
            <div className="card p-12 text-center space-y-6 relative overflow-hidden border-blue-500/20">
              <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_50%_50%,rgba(37,99,235,0.12),transparent_70%)]" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to open your business in Turkey?</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Start your AI-guided permit journey today. No lawyer, no guesswork, no stress.</p>
              <Link href="/chat">
                <button className="btn-primary !px-10 !py-4 !text-base mx-auto">
                  Talk to AI Advisor <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </motion.section>

        </motion.div>
      </div>
    </main>
  );
}
