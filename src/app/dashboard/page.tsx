'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2, Clock, Circle, AlertCircle,
  ShieldCheck, ArrowRight, MapPin, Calendar, FileText,
  Activity, Cpu, Upload, ChevronDown, ExternalLink, RefreshCw, X, Fingerprint, Lock, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../utils/api';

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
  const { t } = useLanguage();
  if (status === 'completed') return <span className="badge badge-green">{t('status_completed')}</span>;
  if (status === 'in-progress') return <span className="badge badge-purple">{t('status_in_progress')}</span>;
  return <span className="badge badge-amber">{t('status_pending')}</span>;
}

function StepIcon({ status }: { status: Status }) {
  if (status === 'completed') return <CheckCircle2 size={18} className="text-emerald-500" />;
  if (status === 'in-progress') return <Clock size={18} className="text-purple-500" />;
  return <Circle size={18} className="text-[var(--muted)]" />;
}

export default function Dashboard() {
  const { t, isRTL, language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(t('dashboard_toast_success') || "Document uploaded successfully!");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [tckn, setTckn] = useState('99945855004');
  const [password, setPassword] = useState('••••••••••••');
  const [automatedStepId, setAutomatedStepId] = useState<number | null>(null);

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('permitops_token');
      const sid = localStorage.getItem('permitops_active_session_id');
      const params = new URLSearchParams();
      if (token) params.append('token', token);
      if (sid) params.append('session_id', sid);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiFetch(`/workflow/latest${query}`);
      if (res?.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();

    // listen only for explicit app-dispatched events, not all storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'permitops_workflow_update') fetchState();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchState]);

  const refresh = async () => {
    await fetchState();
  };

  const automateStep = async (id: number) => {
    const step = steps.find(s => s.id === id);
    if (step) {
      setAutomatedStepId(id);
      setShowModal(true);
    }
  };

  const triggerAutomation = async (id: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('permitops_token');
      const sid = localStorage.getItem('permitops_active_session_id');
      const params = new URLSearchParams();
      if (token) params.append('token', token);
      if (sid) params.append('session_id', sid);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiFetch(`/workflow/step/automate/${id}${query}`, { method: 'POST' });
      if (res?.ok) {
        await refresh();
      }
    } catch (e) {
      console.error("Failed to automate step", e);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id: number) => {
    try {
      const token = localStorage.getItem('permitops_token');
      const sid = localStorage.getItem('permitops_active_session_id');
      const params = new URLSearchParams();
      if (token) params.append('token', token);
      if (sid) params.append('session_id', sid);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiFetch(`/workflow/step/complete/${id}${query}`, { method: 'POST' });
      if (res?.ok) {
        await refresh();
      }
    } catch (e) {
      console.error("Failed to mark step complete", e);
    }
  };

  const stepsData = data?.execution_plan?.steps;
  const hasSteps = stepsData && Array.isArray(stepsData) && stepsData.length > 0;

  const steps: any[] = hasSteps ? [
    ...(stepsData.map((s: any, i: number) => ({
      id: s.id,
      title: s.title,
      responsible: s.responsible,
      status: s.status as Status,
      date: data.last_updated ? new Date(data.last_updated).toLocaleDateString() : 'Recent',
      summary: s.notes || `Step ${i + 1} of the permit process.`,
      detail: s.notes || `${s.responsible} is handling this step.`,
      docs: i === 1 ? (data.permit_plan?.documents || []) : [],
    })))
  ] : [
    {
      id: 0,
      title: t('dashboard_init_title'),
      responsible: 'Agent',
      status: 'pending' as Status,
      date: 'N/A',
      summary: t('dashboard_init_summary'),
      detail: t('dashboard_init_detail'),
      docs: [],
    }
  ];

  const done = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;

  const currentAutomatedStep = automatedStepId ? steps.find(s => s.id === automatedStepId) : null;
  const isMersis = currentAutomatedStep && (
    [3, 4, 5].includes(currentAutomatedStep.id) ||
    (
      (currentAutomatedStep.title || "") + 
      (currentAutomatedStep.detail || "") + 
      (currentAutomatedStep.summary || "")
    ).toLowerCase().includes("mersis")
  );
  const portalName = isMersis ? "MERSİS" : "e-Devlet";
  const portalUrl = isMersis ? "https://mersis.ticaret.gov.tr/Portal/KullaniciIslemleri/GirisIslemleri" : "https://giris.turkiye.gov.tr/Giris/";

  const handleUploadClick = () => {
    setShowModal(true);
  };

  const submitEDevlet = async () => {
    setUploading(true);
    // Open window immediately to avoid popup blocker
    const portalWin = window.open('about:blank', '_blank');
    
    try {
      const token = localStorage.getItem('permitops_token');
      const sid = localStorage.getItem('permitops_active_session_id');
      const params = new URLSearchParams();
      if (token) params.append('token', token);
      if (sid) params.append('session_id', sid);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await apiFetch(`/api/submit-edevlet${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tckn, password, portal_url: portalUrl, step_id: automatedStepId })
      });

      if (!res) throw new Error('Backend offline');

      const json = await res.json();

      if (json.status === "success") {
        setToastType("success");
        setToastMessage(json.message || "Submitted successfully via bot.");
        setShowModal(false);
        
        // Use the pre-opened window
        if (portalWin && automatedStepId) {
          const step = steps.find(s => s.id === automatedStepId);
          const isMersis = step && (
            (step.title || "") + 
            (step.detail || "") + 
            (step.summary || "")
          ).toLowerCase().includes("mersis");
          
          let targetUrl = "https://www.turkiye.gov.tr";
          if (isMersis) targetUrl = "https://mersis.gtb.gov.tr";
          
          portalWin.location.href = targetUrl;
          setAutomatedStepId(null);
        } else if (portalWin) {
          portalWin.close();
        }

        refresh();
      } else {
        if (portalWin) portalWin.close();
        setToastType("error");
        setToastMessage(json.message || "Failed to submit.");
      }
    } catch (e) {
      if (portalWin) portalWin.close();
      setToastType("error");
      setToastMessage("Backend offline. Please make sure the server is running.");
    } finally {
      setUploading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Activity size={32} className="animate-pulse text-purple-500" />
          <p className="text-sm font-medium">{t('dashboard_syncing')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[var(--bg)]">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        {/* Fallback Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
        
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={(e) => {
            const video = e.currentTarget;
            video.style.opacity = '1';
          }}
          style={{ opacity: 0, transition: 'opacity 1s ease' }}
          className="absolute inset-0 w-full h-full object-cover z-10"
        >
          <source src="/dashboard_bg.mp4" type="video/mp4" />
        </video>

        {/* Dynamic mesh gradient overlays */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse [animation-delay:2s]" />
        </div>
      </div>

      <div className="relative z-20 pt-24 pb-20 px-6">
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-24 left-1/2 z-50 rounded-lg shadow-xl border px-5 py-3 flex items-center gap-3 backdrop-blur-md ${toastType === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-red-500/20 bg-red-500/10 text-red-500'
                }`}
            >
              {toastType === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{toastMessage}</span>
                {toastType === 'success' && (
                  <button 
                    onClick={() => {
                      const url = toastMessage.toLowerCase().includes('mersis') ? 'https://mersis.gtb.gov.tr' : 'https://www.turkiye.gov.tr';
                      window.open(url, '_blank');
                    }}
                    className="text-[11px] font-bold underline mt-0.5 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Go to Portal <ExternalLink size={10} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* e-Devlet Login Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              key="edevlet-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border)] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <ShieldCheck size={20} className="text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text)]">{portalName} Integration</h3>
                        <p className="text-white/60 text-sm italic">Simulating Local Municipality API...</p>
                      </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
                    Our RPA bot requires your credentials to log into {portalUrl} and automatically submit the verified documents to Beşiktaş Municipality on your behalf.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5 ml-0.5">T.C. Kimlik No</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Fingerprint size={16} className="text-[var(--muted)]" />
                        </div>
                        <div className="w-full">
                          <input
                            type="text"
                            maxLength={11}
                            value={tckn}
                            onChange={(e) => setTckn(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="11-digit ID number"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5 ml-0.5">
                        {portalName} Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock size={16} className="text-[var(--muted)]" />
                        </div>
                        <div className="w-full">
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="••••••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={submitEDevlet}
                      disabled={true}
                      className="w-full py-3 px-4 bg-red-600 cursor-not-allowed opacity-70 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-inner border border-red-400/20"
                    >
                      <ShieldCheck size={18} />
                      <span className="uppercase tracking-tight">DISABLED UNTIL LAW APPROVAL</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">Your credentials are used solely for this session and are NEVER logged into our database.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
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
              <span className="badge badge-purple">
                <Activity size={10} className="animate-pulse" />
                {t('dashboard_live_session')} · #{data?.combined_result?.location ? `IST-${data.combined_result.location.substring(0,3).toUpperCase().replace(/İ/g, 'I')}-4221` : 'IST-TR-4221'}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-[var(--text)] tracking-tight drop-shadow-sm dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{t('dashboard_title')}</h1>
              <p className="text-sm text-[var(--muted)] flex items-center gap-3 flex-wrap font-medium dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                <span className="flex items-center gap-1.5"><MapPin size={12} className="text-purple-500" /> {data?.combined_result?.location ? `${data.combined_result.location} ${data.combined_result.business_type || ''}` : (isRTL ? 'مشروع في إسطنبول' : 'Istanbul Business')}, Istanbul</span>
                <span className="h-3 w-px bg-[var(--border)]" />
                <span className="flex items-center gap-1.5" suppressHydrationWarning><Calendar size={12} className="text-purple-500" /> {data?.last_updated ? `${t('dashboard_updated')} ${new Date(data.last_updated).toLocaleDateString()}` : t('dashboard_no_session')}</span>
              </p>
            </div>

            <div className="flex gap-2.5 shrink-0">
              <button onClick={refresh} className="btn btn-outline !py-2 !px-3 !text-sm lg:flex hidden items-center gap-2">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {t('dashboard_sync')}
              </button>
              <Link href="/chat">
                <button className="btn btn-outline !py-2 !px-4 !text-sm">
                  <ArrowRight size={14} /> {t('dashboard_ask_ai')}
                </button>
              </Link>
              <button onClick={handleUploadClick} disabled={uploading} className="btn btn-purple !py-2 !px-4 !text-sm disabled:opacity-50">
                <Upload size={14} /> {uploading ? t('dashboard_processing') : t('dashboard_upload')}
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
            {([
              { label: t('dashboard_compliance_score'), value: `${progress > 0 ? progress : '0'}%`,  from: '#34d399', to: '#10b981', icon: ShieldCheck,  iconColor: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)'  },
              { label: t('dashboard_steps_complete'),   value: `${done}/${steps.length}`,            from: '#c084fc', to: '#a855f7', icon: CheckCircle2, iconColor: '#c084fc', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)' },
              { label: t('dashboard_est_days'),         value: `${Math.max(0, steps.length*2 - done*2)}d`, from: '#fcd34d', to: '#f59e0b', icon: Clock,    iconColor: '#fcd34d', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
              { label: t('dashboard_active_agents'),    value: `${data?.execution_plan?.assigned_agents?.length || 0}`, from: '#f0abfc', to: '#e879f9', icon: Cpu, iconColor: '#f0abfc', bg: 'rgba(232,121,249,0.12)', border: 'rgba(232,121,249,0.25)' },
            ] as const).map((s, i) => (
              <div key={i} className="glass-card p-5 flex items-center gap-4 transition-all group cursor-default hover:scale-[1.02] hover:shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div style={{ background: s.bg, border: `1px solid ${s.border}` }} className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                  <s.icon size={22} style={{ color: s.iconColor }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate mb-1">{s.label}</p>
                  <p className="text-2xl font-black leading-tight" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Progress Bar ── */}
          <div className="glass-card p-4 flex items-center gap-5">
            <div className="flex flex-col shrink-0">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('dashboard_overall_progress')}</span>
              <span className="text-xl font-black text-white mt-0.5">{progress}%</span>
            </div>
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)' }}
              >
                <div className="absolute inset-0 bg-[length:200%_100%] animate-[shimmer-sweep_2s_linear_infinite]" style={{ background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%)', backgroundSize: '200% 100%' }} />
              </motion.div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Steps</span>
              <span className="text-sm font-black text-white">{done}/{steps.length}</span>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-12 gap-5">

            {/* Workflow Steps */}
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center justify-between px-0.5 mb-1">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('dashboard_workflow_steps')}</h2>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{done} of {steps.length} done</span>
              </div>
              {(showAllSteps ? steps : steps.slice(0, 3)).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, ease: 'easeOut', duration: 0.35 }}
                  className={`glass-card overflow-hidden cursor-pointer
                    ${
                      s.status === 'completed'   ? 'step-card-completed' :
                      s.status === 'in-progress' ? 'step-card-inprogress' :
                                                   'step-card-pending'
                    }`}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="p-4 flex items-center gap-3">
                    {/* Step number */}
                    <div className={`step-num ${
                      s.status === 'completed'   ? 'step-num-completed' :
                      s.status === 'in-progress' ? 'step-num-inprogress' : ''
                    }`}>
                      {s.status === 'completed' ? <CheckCircle2 size={13} /> : s.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-[15px] leading-tight">{s.title}</h3>
                        <StepBadge status={s.status} />
                        {/* Responsible chip */}
                        <span className={
                          (s.responsible.includes('Agent') || s.responsible.includes('Ajan') || s.responsible.includes('وكيل'))
                            ? 'agent-chip' : 'human-chip'
                        }>
                          {(s.responsible.includes('Agent') || s.responsible.includes('Ajan') || s.responsible.includes('وكيل')) ? '⚡ Agent' : '👤 Human'}
                        </span>
                      </div>
                      <p className="text-[13px] text-white/40 mt-0.5 font-medium truncate">{s.summary}</p>
                    </div>

                    <ChevronDown
                      size={15}
                      className={`text-white/30 transition-transform duration-300 shrink-0 ${expanded === i ? 'rotate-180' : ''}`}
                    />
                  </div>

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-3 border-t border-white/[0.07] space-y-4">
                          {/* Manual instructions box */}
                          <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
                            <p className="text-[13px] text-white/70 leading-relaxed font-medium">{s.detail}</p>
                          </div>

                          {s.docs.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {s.docs.map((doc: string) => (
                                <div key={doc} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer bg-white/[0.04] border border-white/[0.08]">
                                  <FileText size={11} className="text-purple-400 shrink-0" />
                                  {doc}
                                  <ExternalLink size={9} className="text-white/30" />
                                </div>
                              ))}
                            </div>
                          )}

                          {s.status !== 'completed' && (
                            <div className="flex flex-wrap gap-2 items-center pt-1">
                              {(s.responsible.includes('Agent') || s.responsible.includes('Ajan') || s.responsible.includes('وكيل')) ? (
                                <>
                                  <button
                                    disabled
                                    className="btn !py-2 !px-3.5 !text-xs flex items-center gap-1.5 opacity-40 cursor-not-allowed bg-white/5 border border-white/10 text-white/50 !rounded-lg"
                                    title="Bot automation disabled pending legal approval"
                                  >
                                    <Lock size={11} />
                                    {language === 'ar' ? 'معطّل — بانتظار الموافقة' : language === 'tr' ? 'Devre Dışı — Yasal Onay' : 'Disabled — Pending Law Approval'}
                                  </button>
                                  <a
                                    href={
                                      ((s.title || '') + (s.summary || '')).toLowerCase().includes('mersis')
                                        ? 'https://mersis.ticaret.gov.tr/Portal/KullaniciIslemleri/GirisIslemleri'
                                        : ((s.title || '') + (s.summary || '')).toLowerCase().includes('gıda') ||
                                          ((s.title || '') + (s.summary || '')).toLowerCase().includes('food') ||
                                          ((s.title || '') + (s.summary || '')).toLowerCase().includes('tarim')
                                        ? 'https://www.tarim.gov.tr'
                                        : 'https://www.turkiye.gov.tr'
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="btn btn-outline !py-2 !px-3.5 !text-xs flex items-center gap-1.5 !rounded-lg"
                                  >
                                    <ExternalLink size={11} />
                                    {language === 'ar' ? 'افعلها يدوياً' : language === 'tr' ? 'Manuel Yap' : 'Do Manually →'}
                                  </a>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); markComplete(s.id); }}
                                  className="btn btn-emerald !py-2 !px-4 !text-xs flex items-center gap-1.5 !rounded-lg"
                                >
                                  <CheckCircle2 size={12} /> {t('dashboard_mark_complete')}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Show More / Less */}
              {steps.length > 3 && (
                <button
                  onClick={() => setShowAllSteps(!showAllSteps)}
                  className="w-full py-3 rounded-2xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-2)] hover:bg-[var(--surface-2)] transition-all text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ChevronDown size={16} className={`transition-transform duration-300 ${showAllSteps ? 'rotate-180' : ''}`} />
                  {showAllSteps ? `Show less` : `Show ${steps.length - 3} more steps`}
                </button>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">

              {/* Action Required */}
              <div className="glass-card p-5 space-y-4 border-amber-500/40 bg-amber-500/10 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                <div className="flex items-start gap-3 relative z-10">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest">{t('dashboard_action_required')}</p>
                    <p className="text-[15px] font-bold text-white mt-1 leading-tight">
                      {steps.find(s => s.status !== 'completed' && s.responsible !== 'Agent')?.title || t('dashboard_all_clear')}
                    </p>
                  </div>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed font-medium relative z-10">
                  {steps.find(s => s.status !== 'completed' && s.responsible !== 'Agent') 
                    ? t('dashboard_action_required_desc').replace('{step}', steps.find(s => s.status !== 'completed' && s.responsible !== 'Agent')?.title || '')
                    : t('dashboard_bot_processing')}
                </p>
                {steps.find(s => s.status !== 'completed' && s.responsible !== 'Agent') && (
                  <button 
                    onClick={() => markComplete(steps.find(s => s.status !== 'completed' && s.responsible !== 'Agent')?.id)} 
                    className="btn btn-purple w-full !py-2.5 !text-sm justify-center shadow-lg transform transition-transform hover:scale-[1.02] relative z-10"
                  >
                    <CheckCircle2 size={14} /> {t('dashboard_mark_done')}
                  </button>
                )}
              </div>

              {/* AI Agents */}
              <div className="glass-card p-5 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-white/40 uppercase tracking-widest">{t('dashboard_active_agents')}</p>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <span className="live-dot w-2 h-2 relative shrink-0" />
                    {data?.execution_plan?.assigned_agents?.length || 0} {t('dashboard_active')}
                  </span>
                </div>
                <div className="space-y-3">
                  {(data?.execution_plan?.assigned_agents || ['Planner', 'Classifier']).map((name: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl transition-all hover:bg-white/10 bg-white/5 border border-white/10 shadow-lg">
                      <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-purple-400 bg-purple-500/20 border border-purple-500/30 shadow-sm">
                        <Cpu size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-white">{name}</p>
                        <p className="text-[11px] text-white/50 font-medium truncate">{t('dashboard_agent_status')}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                        {t('dashboard_running')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step */}
              <div className="glass-card p-5 space-y-4 shadow-xl">
                <p className="text-xs font-black text-white/40 uppercase tracking-widest">{t('dashboard_whats_next')}</p>
                <p className="text-[14px] text-white/90 leading-relaxed font-medium">
                  {t('dashboard_next_step_desc')}
                </p>
                <Link href="/chat" className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-all hover:translate-x-1">
                  {t('dashboard_ask_ai_step')} <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
