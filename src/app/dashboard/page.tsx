'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2, Clock, Circle, AlertCircle,
  ShieldCheck, ArrowRight, MapPin, Calendar, FileText,
  Activity, Cpu, Upload, ChevronDown, ExternalLink, RefreshCw, X, Fingerprint, Lock
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
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Document uploaded successfully!");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [tckn, setTckn] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function fetchState() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8003/workflow/latest'); 
        if (res.ok) {
          const json = await res.json();
          if (json && Object.keys(json).length > 0) {
            setData(json);
          }
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, []);

  const refresh = async () => {
    try {
      const res = await fetch('http://localhost:8003/workflow/latest');
      if (res.ok) {
        const json = await res.json();
        if (json && Object.keys(json).length > 0) {
          setData(json);
        }
      }
    } catch (e) {
      console.error("Manual refresh failed", e);
    }
  };

  const steps: PermitStep[] = data ? [
    ...(data.execution_plan?.steps.map((step: string, i: number) => ({
      title: step,
      status: i === 0 ? 'completed' : (i === 1 ? 'in-progress' : 'pending'),
      date: data.last_updated ? new Date(data.last_updated).toLocaleDateString() : 'Recent',
      summary: `Step ${i + 1} of the permit process.`,
      detail: `Agent ${data.execution_plan.assigned_agents[i] || 'System'} is handling this step.`,
      docs: i === 1 ? (data.permit_plan?.documents || []) : [],
    })) || []),
  ] : [
    {
      title: 'Initialize Workflow',
      status: 'pending',
      date: 'N/A',
      summary: 'Start a chat to generate your permit plan.',
      detail: 'Once you describe your business in the chat, the AI will generate a customized permit path for you here.',
      docs: [],
    }
  ];

  const done = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;

  const handleUploadClick = () => {
    setShowModal(true);
  };

  const submitEDevlet = async () => {
    setUploading(true);
    try {
      const res = await fetch('http://localhost:8003/api/submit-edevlet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tckn, password })
      });

      const json = await res.json();
      
      if (json.status === "success") {
        setToastType("success");
        setToastMessage(json.message || "Submitted successfully via e-Devlet bot.");
        setShowModal(false);
        refresh(); // refetch state
      } else {
        setToastType("error");
        setToastMessage(json.message || "Failed to submit.");
      }
    } catch (e) {
      setToastType("error");
      setToastMessage("Network error communicating with backend.");
    } finally {
      setUploading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Activity size={32} className="animate-pulse text-blue-600" />
          <p className="text-sm font-medium">Synchronizing with Beşiktaş Municipality...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-50 rounded-lg shadow-xl shadow-black/5 border px-5 py-3 flex items-center gap-3 backdrop-blur-md ${
              toastType === 'success' ? 'border-emerald-500/20 bg-emerald-50' : 'border-red-500/20 bg-red-50'
            }`}
          >
            {toastType === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-600" />}
            <span className={`text-sm font-semibold ${toastType === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* e-Devlet Login Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                       <ShieldCheck size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">e-Devlet Integration</h3>
                      <p className="text-xs text-gray-500">Secure AI Automation Bot</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Our RPA bot requires your credentials to log into turkiye.gov.tr and automatically submit the verified documents to Beşiktaş Municipality on your behalf.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-1.5 ml-0.5">T.C. Kimlik No</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Fingerprint size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        maxLength={11}
                        value={tckn}
                        onChange={(e) => setTckn(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        placeholder="11-digit ID number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-1.5 ml-0.5">e-Devlet Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={submitEDevlet}
                    disabled={uploading || !tckn || !password}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? <Activity size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {uploading ? 'Bot Navigating Portal...' : 'Approve Bot Submission'}
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">Your credentials are used solely for this session and are NEVER logged into our database.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Permit Dashboard</h1>
            <p className="text-sm text-gray-500 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-600" /> {data?.business_profile?.raw_query || 'Beşiktaş Restaurant'}, Istanbul</span>
              <span className="h-3 w-px bg-gray-300" />
              <span className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-600" /> {data?.last_updated ? `Updated ${new Date(data.last_updated).toLocaleDateString()}` : 'No active session'}</span>
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <button onClick={refresh} className="btn btn-outline !py-2 !px-3 !text-sm lg:flex hidden items-center gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Sync
            </button>
            <Link href="/chat">
              <button className="btn btn-outline !py-2 !px-4 !text-sm">
                <ArrowRight size={14} /> Ask AI
              </button>
            </Link>
            <button onClick={handleUploadClick} disabled={uploading} className="btn btn-blue !py-2 !px-4 !text-sm disabled:opacity-50">
              <Upload size={14} /> {uploading ? 'Processing...' : 'Upload Docs'}
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
            { label: 'Compliance Score', value: `${progress > 0 ? progress : '0'}%`,    color: 'text-emerald-600', icon: ShieldCheck },
            { label: 'Steps Complete',   value: `${done}/${steps.length}`, color: 'text-blue-600',    icon: CheckCircle2 },
            { label: 'Est. Days Left',   value: `${Math.max(0, steps.length * 2 - done * 2)} days`,   color: 'text-amber-500',   icon: Clock },
            { label: 'Active AI Agents', value: `${data?.execution_plan?.assigned_agents.length || 0} active`, color: 'text-violet-600',  icon: Cpu },
          ].map((s, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <s.icon size={16} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 font-medium truncate">{s.label}</p>
                <p className={`text-lg font-bold leading-tight ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Progress Bar ── */}
        <div className="card p-4 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap shrink-0">Overall Progress</span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-blue-600"
            />
          </div>
          <span className="text-sm font-bold text-gray-900 shrink-0">{progress}%</span>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-12 gap-5">

          {/* Workflow Steps */}
          <div className="lg:col-span-8 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 px-0.5">Workflow Steps</h2>
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
                    s.status === 'completed'  ? 'bg-emerald-50 border border-emerald-200' :
                    s.status === 'in-progress' ? 'bg-blue-50 border border-blue-200' :
                    'border border-gray-200'
                  }`} style={s.status === 'pending' ? { background: 'rgba(0,0,0,0.02)' } : {}}>
                    <StepIcon status={s.status} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-[15px]">{s.title}</h3>
                      <StepBadge status={s.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 truncate">{s.summary}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-500 hidden sm:block font-medium">{s.date}</span>
                    <ChevronDown
                      size={15}
                      className={`text-gray-500 transition-transform duration-200 ${expanded === i ? 'rotate-180' : ''}`}
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
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{s.detail}</p>

                        {s.docs.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {s.docs.map(doc => (
                              <div key={doc} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <FileText size={11} className="text-blue-600 shrink-0" />
                                {doc}
                                <ExternalLink size={10} className="text-gray-500" />
                              </div>
                            ))}
                          </div>
                        )}

                        {s.status === 'in-progress' && (
                          <button onClick={handleUploadClick} disabled={uploading} className="btn btn-blue !py-2 !px-4 !text-sm disabled:opacity-50">
                            <Upload size={13} /> {uploading ? 'Checking...' : 'Upload Required Document'}
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
            <div className="card p-5 space-y-4 border-amber-200" style={{ background: 'rgba(245,158,11,0.04)' }}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Action Required</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{steps[1]?.title || 'Awaiting Information'}</p>
                </div>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Please provide details or documents for <strong className="text-gray-900">{steps[1]?.title || 'next steps'}</strong> to avoid permit delay.
              </p>
              <button onClick={handleUploadClick} disabled={uploading || !data} className="btn btn-blue w-full !py-2.5 !text-sm justify-center disabled:opacity-50">
                <Upload size={13} /> {uploading ? 'Verifying AI...' : 'Upload information'}
              </button>
            </div>

            {/* AI Agents */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">AI Agents</p>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="live-dot w-2 h-2 relative shrink-0" />
                  {data?.execution_plan?.assigned_agents.length || 0} active
                </span>
              </div>
              <div className="space-y-2">
                {(data?.execution_plan?.assigned_agents || ['Planner', 'Classifier']).map((name: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-blue-600"
                         style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <Cpu size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900">{name}</p>
                      <p className="text-[11px] text-gray-500 truncate">Agent processing workflow</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Running
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step */}
            <div className="card p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">What&apos;s next</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                After the fire certificate is submitted, your <span className="text-blue-600 font-medium">İşyeri Açma ve Çalışma Ruhsatı</span> will be requested automatically.
              </p>
              <Link href="/chat" className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1.5 transition-colors">
                Ask AI about this step <ArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
