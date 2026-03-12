'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2, Circle, Clock, AlertCircle, TrendingUp, 
  ShieldCheck, ArrowRight, MapPin, Calendar, FileText, 
  Activity, Cpu, Upload, RefreshCw, ExternalLink, ChevronDown
} from 'lucide-react';

type Status = 'completed' | 'in-progress' | 'pending';

interface Step {
  title:    string;
  status:   Status;
  date:     string;
  shortDesc: string;
  longDesc:  string;
  docs:     string[];
}

const steps: Step[] = [
  {
    title:     'Intake & Registration',
    status:    'completed',
    date:      'Mar 10, 2024',
    shortDesc: 'Documents submitted & verified.',
    longDesc:  'AI verified 12 corporate documents against Beşiktaş Municipality requirements. Business registration number BŞK-2024-4221 assigned.',
    docs:      ['business_registration.pdf', 'tax_certificate.pdf', 'identity_copy.pdf'],
  },
  {
    title:     'Permit Classification',
    status:    'completed',
    date:      'Mar 11, 2024',
    shortDesc: 'License types identified.',
    longDesc:  'System identified 3 required permits: (1) İşyeri Açma ve Çalışma Ruhsatı, (2) Yangın Uygunluk Belgesi, (3) Gıda Satış Ruhsatı. Classification model confidence: 97%.',
    docs:      ['permit_classification_report.json'],
  },
  {
    title:     'Fire Safety Inspection',
    status:    'in-progress',
    date:      'In Review',
    shortDesc: 'Awaiting fire department sign-off.',
    longDesc:  'Physical site inspection completed Mar 13. Ventilation schematic for kitchen exhaust system is under review by İtfaiye (fire dept). Awaiting digital certificate upload.',
    docs:      ['fire_inspection_request.pdf'],
  },
  {
    title:     'Workplace License Issuance',
    status:    'pending',
    date:      'Estimated Mar 18',
    shortDesc: 'Awaiting fire certificate first.',
    longDesc:  'Municipality will issue the final Çalışma Ruhsatı once the fire safety certificate is received. Expected processing time: 2–3 business days.',
    docs:      [],
  },
];

const agents = [
  { name: 'PlannerAgent',    role: 'Determines permit path',     status: 'idle' },
  { name: 'ValidatorAgent',  role: 'Checks document compliance', status: 'active' },
  { name: 'TrackerAgent',    role: 'Monitors workflow state',    status: 'active' },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'completed')  return <CheckCircle2 size={20} className="text-emerald-400" />;
  if (status === 'in-progress') return <Clock size={20} className="text-blue-400" />;
  return <Circle size={20} className="text-slate-600" />;
}

function StatusBadge({ status }: { status: Status }) {
  if (status === 'completed')  return <span className="badge badge-green">Completed</span>;
  if (status === 'in-progress') return <span className="badge badge-blue">In Progress</span>;
  return <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }}>Pending</span>;
}

export default function Dashboard() {
  const [expanded, setExpanded] = useState<number | null>(2); // fire inspection open by default

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <main className="pt-28 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 space-y-8">

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="badge badge-blue">
                <Activity size={11} className="animate-pulse" />
                Live Session • #IST-BŞK-4221
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Permit Dashboard</h1>
            <p className="text-sm text-slate-400 flex items-center gap-3">
              <MapPin size={13} className="text-blue-400" /> Beşiktaş Restaurant, Istanbul
              <span className="h-3 w-px bg-slate-700" />
              <Calendar size={13} className="text-blue-400" /> Started Mar 10, 2024
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/chat">
              <button className="btn-ghost !py-2.5 !px-5 !text-sm">
                <RefreshCw size={14} /> Ask AI
              </button>
            </Link>
            <button className="btn-primary !py-2.5 !px-5 !text-sm">
              <Upload size={14} /> Upload Docs
            </button>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: 'easeOut', duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Compliance Score', value: '94.8%', color: 'text-emerald-400', icon: ShieldCheck },
            { label: 'Steps Complete',   value: `${completedCount}/${steps.length}`, color: 'text-blue-400', icon: CheckCircle2 },
            { label: 'Days Remaining',   value: '8 days',                color: 'text-amber-400',   icon: Clock },
            { label: 'AI Agents Active', value: '2 running',             color: 'text-purple-400',  icon: Cpu },
          ].map((stat, i) => (
            <div key={i} className="card p-5 flex items-start gap-4">
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                <stat.icon size={16} className={stat.color} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Progress Bar ── */}
        <div className="card p-5 flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-400 whitespace-nowrap">Overall Progress</span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
            />
          </div>
          <span className="text-sm font-bold text-white whitespace-nowrap">{progress}%</span>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Workflow Steps — Accordion */}
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Workflow Steps</h2>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`card overflow-hidden cursor-pointer ${step.status === 'in-progress' ? 'border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.1)]' : ''}`}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                {/* Header Row */}
                <div className="p-5 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    step.status === 'completed' ? 'step-done' :
                    step.status === 'in-progress' ? 'step-active' : 'step-pending'
                  }`}>
                    <StatusIcon status={step.status} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-white text-[15px]">{step.title}</h3>
                      <StatusBadge status={step.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{step.shortDesc}</p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-500 hidden sm:block">{step.date}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform ${expanded === i ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed">{step.longDesc}</p>

                        {step.docs.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Attached Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {step.docs.map((doc) => (
                                <div key={doc} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 font-medium">
                                  <FileText size={12} className="text-blue-400" />
                                  {doc}
                                  <ExternalLink size={10} className="text-slate-600 cursor-pointer hover:text-white transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {step.status === 'in-progress' && (
                          <button className="btn-primary !py-2 !px-5 !text-sm">
                            <Upload size={14} />
                            Upload Required Document
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-5">

            {/* Critical Action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="card p-6 space-y-4 border-amber-500/25 bg-[rgba(245,158,11,0.05)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Action Required</p>
                  <p className="text-sm font-bold text-white">Upload fire safety plans</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kitchen exhaust ventilation schematic must be uploaded by <strong className="text-white">Mar 14, 18:00 IST</strong> to avoid delays.
              </p>
              <button className="btn-primary !py-2.5 w-full !text-sm justify-center">
                <Upload size={14} /> Upload Drawing
              </button>
            </motion.div>

            {/* AI Agent Monitor */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Agents</p>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>
              <div className="space-y-2">
                {agents.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-blue-500/20 transition-all">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                      a.status === 'active' ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-slate-800 border-white/5 text-slate-600'
                    }`}>
                      <Cpu size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{a.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{a.role}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      a.status === 'active' ? 'text-blue-400' : 'text-slate-700'
                    }`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step */}
            <div className="card p-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Next Step</p>
              <p className="text-sm font-semibold text-white leading-relaxed">
                Once fire safety certificate is received, your <strong className="text-blue-400">Workplace License (İşyeri Ruhsatı)</strong> will be automatically requested.
              </p>
              <Link href="/chat" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                Ask AI about this step <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
