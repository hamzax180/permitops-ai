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
    <main className="pt-16 overflow-x-hidden">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-24 pb-32 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.16),transparent_70%)]" />
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto text-center space-y-8">

          {/* Badge */}
          <motion.div variants={fade} className="flex justify-center">
            <span className="badge badge-blue">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-blue-500" />
              </span>
              Istanbul Live — v2.4 Protocol
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={fade} className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
              Get your Turkish business<br />
              permit in <span className="text-blue-400">days, not months</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              PermitOps AI automates the entire permit journey — from document checklist
              to municipal approval — for restaurants, cafés, and retail businesses across Turkey.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fade} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/chat">
              <button className="btn btn-blue text-base px-7 py-3">
                Start free application <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="btn btn-outline text-base px-7 py-3">
                See a live demo
              </button>
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={fade} className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 pt-2 text-sm text-slate-500">
            {['No credit card required', 'No lawyer needed', 'Municipality-official process'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-emerald-500 shrink-0" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ DISTRICT LOGOS ═══════════════ */}
      <section className="py-10 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-slate-600 uppercase tracking-widest mb-6">Supported municipalities</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-3">
            {logos.map(l => (
              <span key={l} className="text-slate-500 font-semibold text-sm tracking-wide hover:text-slate-300 transition-colors cursor-default select-none">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <p className="section-label">The process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How it works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Four steps from conversation to approved permit, guided by AI every step of the way.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {howItWorks.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: 'easeOut', duration: 0.5 }}
                className="card card-hover p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/12 border border-blue-500/20 flex items-center justify-center text-blue-400" style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <s.icon size={20} />
                  </div>
                  <span className="text-3xl font-black text-white/5 select-none">{s.num}</span>
                </div>
                <h3 className="font-semibold text-white text-[15px] leading-snug">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <p className="section-label">Technology</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Built for the Turkish market</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Enterprise-grade AI infrastructure trained on Turkish municipal law and permit regulations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: 'easeOut', duration: 0.5 }}
                className="card card-hover p-7 space-y-5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:bg-blue-600/15 transition-colors" style={{ background: 'rgba(59,130,246,0.08)' }}>
                    <f.icon size={22} />
                  </div>
                  <span className="badge badge-amber">{f.badge}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white text-[16px]">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="card grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/5">
            {stats.map((s, i) => (
              <div key={i} className="p-8 text-center space-y-1">
                <p className="text-4xl font-black text-white">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to open your business in Turkey?
          </h2>
          <p className="text-slate-400 text-lg">Start your application today. Our AI advisor will guide you through every step.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link href="/chat">
              <button className="btn btn-blue text-base px-8 py-3.5">
                Talk to AI Advisor <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="btn btn-outline text-base px-8 py-3.5">
                View demo <Clock size={15} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center">
              <ShieldCheck size={12} className="text-white" />
            </div>
            <span className="font-semibold text-slate-400">PermitOps AI</span>
          </div>
          <p>© 2024 PermitOps AI. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Docs'].map(l => (
              <a key={l} href="#" className="hover:text-slate-300 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </main>
  );
}
