'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2, Clock, Circle, AlertCircle, TrendingUp,
  ShieldCheck, ArrowRight, MapPin, Calendar, FileText,
  Activity, Cpu, Upload, ChevronDown, ExternalLink, RefreshCw
} from 'lucide-react';

type Status = 'completed' | 'in-progress' | 'pending';

interface PermitStep {
  title: string;
  status: Status;
  date: string;
  summary: string;
  detail: string;
  docs: string[];
}

const steps: PermitStep[] = [
  {
    title: 'Intake & Registration',
    status: 'completed',
    date: 'Mar 10, 2024',
    summary: '12 documents verified. Business number assigned.',
    detail: 'AI verified 12 corporate documents against Beşiktaş Municipality requirements. Business registration number BŞK-2024-4221 assigned. Tax registration confirmed with GİB.',
    docs: ['business_registration.pdf', 'tax_certificate.pdf', 'identity_copy.pdf'],
  },
  {
    title: 'Permit Classification',
    status: 'completed',
    date: 'Mar 11, 2024',
    summary: '3 permit types identified. Classification confidence: 97%.',
    detail: 'System identified 3 permits required: İşyeri Açma ve Çalışma Ruhsatı, Yangın Uygunluk Belgesi, and Gıda Satış Ruhsatı. Path approved by ComplianceAgent.',
    docs: ['permit_classification_report.json'],
  },
  {
    title: 'Fire Safety Inspection',
    status: 'in-progress',
    date: 'In Review',
    summary: 'Physical inspection done. Certificate pending.',
    detail: 'Site inspection completed Mar 13. Kitchen exhaust ventilation schematic is under review by İtfaiye. Upload the fire safety drawing to expedite approval.',
    docs: ['fire_inspection_request.pdf'],
  },
  {
    title: 'Workplace License Issuance',
    status: 'pending',
    date: 'Est. Mar 18',
    summary: 'Awaiting fire certificate. Municipality processing in 2–3 days.',
    detail: 'Municipality will issue İşyeri Açma ve Çalışma Ruhsatı once fire certificate arrives. Estimated 2–3 business days after submission.',
    docs: [],
  },
];

const agents = [
  { name: 'PlannerAgent',   desc: 'Determines permit path',      active: false },
  { name: 'ValidatorAgent', desc: 'Checks document compliance',  active: true },
  { name: 'TrackerAgent',   desc: 'Monitors workflow state',     active: true },
];

function StepBadge({ status }: { status: Status }) {
  if (status === 'completed')   return <span className="status-done">Completed</span>;
  if (status === 'in-progress') return <span className="status-active">In Progress</span>;
  return <span className="status-pending">Pending</span>;
}

function StepIcon({ status }: { status: Status }) {
  if (status === 'completed')   return <CheckCircle2 size={18} className="text-emerald-400" />;
  if (status === 'in-progress') return <Clock size={18} className="text-blue-400" />;
  return <Circle size={18} className="text-slate-600" />;
}

export default function Dashboard() {
  const [expanded, setExpanded] = useState<number | null>(2);

  const done     = steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((done / steps.length) * 100);

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-7">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut', duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        >
          <div className="space-y-1.5">
            <span className="badge badge-blue">
              <Activity size={10} className="animate-pulse" />
              Live Session · #IST-BŞK-4221
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Permit Dashboard</h1>
            <p className="text-sm text-slate-500 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-400" /> Beşiktaş Restaurant, Istanbul</span>
              <span className="h-3 w-px bg-slate-700" />
              <span className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-400" /> Started Mar 10, 2024</span>
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <Link href="/chat">
              <button className="btn btn-outline !py-2 !px-4 !text-sm">
                <RefreshCw size={14} /> Ask AI
              </button>
            </Link>
            <button className="btn btn-blue !py-2 !px-4 !text-sm">
              <Upload size={14} /> Upload Docs
            </button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut', duration: 0.4, delay: 0.07 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: 'Compliance Score', value: '94.8%',    color: 'text-emerald-400', icon: ShieldCheck },
            { label: 'Steps Complete',   value: `${done}/4`, color: 'text-blue-400',    icon: CheckCircle2 },
            { label: 'Est. Days Left',   value: '8 days',   color: 'text-amber-400',   icon: Clock },
            { label: 'Active AI Agents', value: '2 running',color: 'text-violet-400',  icon: Cpu },
          ].map((s, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <s.icon size={16} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium truncate">{s.label}</p>
                <p className={`text-lg font-bold leading-tight ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Progress Bar ── */}
        <div className="card p-4 flex items-center gap-4">
          <span className="text-sm font-medium text-slate-400 whitespace-nowrap shrink-0">Overall Progress</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-blue-500"
            />
          </div>
          <span className="text-sm font-bold text-white shrink-0">{progress}%</span>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-12 gap-5">

          {/* Workflow Steps */}
          <div className="lg:col-span-8 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-0.5">Workflow Steps</h2>
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: 'easeOut', duration: 0.4 }}
                className={`card overflow-hidden cursor-pointer transition-colors ${
                  s.status === 'in-progress' ? 'border-blue-500/30' : ''
                }`}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                    s.status === 'completed'  ? 'bg-emerald-500/10 border border-emerald-500/20' :
                    s.status === 'in-progress' ? 'bg-blue-500/10 border border-blue-500/25' :
                    'border border-white/5'
                  }`} style={s.status === 'pending' ? { background: 'rgba(255,255,255,0.03)' } : {}}>
                    <StepIcon status={s.status} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-semibold text-white text-[15px]">{s.title}</h3>
                      <StepBadge status={s.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 truncate">{s.summary}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-600 hidden sm:block font-medium">{s.date}</span>
                    <ChevronDown
                      size={15}
                      className={`text-slate-600 transition-transform duration-200 ${expanded === i ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-3 border-t border-white/5 space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed">{s.detail}</p>

                        {s.docs.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {s.docs.map(doc => (
                              <div key={doc} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <FileText size={11} className="text-blue-400 shrink-0" />
                                {doc}
                                <ExternalLink size={10} className="text-slate-600" />
                              </div>
                            ))}
                          </div>
                        )}

                        {s.status === 'in-progress' && (
                          <button className="btn btn-blue !py-2 !px-4 !text-sm">
                            <Upload size={13} /> Upload Required Document
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
          <div className="lg:col-span-4 space-y-4">

            {/* Action Required */}
            <div className="card p-5 space-y-4 border-amber-500/20" style={{ background: 'rgba(245,158,11,0.04)' }}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertCircle size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Action Required</p>
                  <p className="text-sm font-semibold text-white mt-0.5">Upload fire safety plan</p>
                </div>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Kitchen exhaust ventilation schematic must be submitted by <strong className="text-white">Mar 14, 18:00 IST</strong> to avoid permit delay.
              </p>
              <button className="btn btn-blue w-full !py-2.5 !text-sm justify-center">
                <Upload size={13} /> Upload drawing
              </button>
            </div>

            {/* AI Agents */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">AI Agents</p>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <span className="live-dot w-2 h-2 relative shrink-0" />
                  2 active
                </span>
              </div>
              <div className="space-y-2">
                {agents.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${a.active ? 'text-blue-400' : 'text-slate-600'}`}
                         style={{ background: a.active ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${a.active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                      <Cpu size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white">{a.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{a.desc}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${a.active ? 'text-blue-400' : 'text-slate-700'}`}>
                      {a.active ? 'Running' : 'Idle'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step */}
            <div className="card p-5 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">What's next</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                After the fire certificate is submitted, your <span className="text-blue-400 font-medium">İşyeri Açma ve Çalışma Ruhsatı</span> will be requested automatically.
              </p>
              <Link href="/chat" className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                Ask AI about this step <ArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
