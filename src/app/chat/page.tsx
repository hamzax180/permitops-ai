'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Mic, Plus, ChevronDown, Building2, FileText, Search, Clock, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

import Sidebar from '../components/Sidebar';

type Role = 'assistant' | 'user';
interface Msg { id: number; role: Role; content: string; }

export default function ChatPage() {
  const { t, isRTL, language } = useLanguage();
  const { token, isAuthenticated, user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  
  const QUICK_Q = [
    t('chat_q1'),
    t('chat_q2'),
    t('chat_q3'),
    t('chat_q4'),
  ];
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgIdRef = useRef(1);

  // Load sessions on mount or when auth changes
  useEffect(() => {
    const initSession = async () => {
      if (isAuthenticated && token) {
        try {
          const res = await apiFetch(`/chat/sessions?token=${token}`);
          if (res?.ok) {
            const data = await res.json();
            if (data.length > 0 && !sessionId) {
              setSessionId(data[0].id);
              setSessionTitle(data[0].title || '');
            } else if (data.length === 0) {
              handleNewChat();
            }
          }
        } catch (e) {
          console.error("Failed to fetch sessions", e);
        }
      } else {
        setSessionId("default-session");
      }
    };
    initSession();
  }, [token, isAuthenticated]);

  // Load messages from backend when sessionId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionId) return;
      
      if (isAuthenticated && token) {
        try {
          const res = await apiFetch(`/chat/history/${sessionId}?token=${token}`);
          if (res?.ok) {
            const data = await res.json();
            setMsgs(data);
            if (data.length > 0) {
              msgIdRef.current = Math.max(...data.map((m: any) => m.id)) + 1;
            } else {
              msgIdRef.current = 1;
            }
          }
        } catch (e) {
          console.error("Failed to fetch history from backend", e);
        }
      } else if (sessionId === "default-session") {
        const saved = localStorage.getItem('permitops_chat_history');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
              setMsgs(parsed);
              msgIdRef.current = Math.max(...parsed.map((m: Msg) => m.id)) + 1;
            }
          } catch (e) {
            console.error("Failed to parse local chat history", e);
          }
        }
      }
      setIsLoaded(true);
    };
    loadHistory();
  }, [sessionId, token, isAuthenticated]);

  useEffect(() => {
    if (isLoaded && !isAuthenticated && sessionId === "default-session") {
      localStorage.setItem('permitops_chat_history', JSON.stringify(msgs));
    }
    if (sessionId) {
      localStorage.setItem('permitops_active_session_id', sessionId);
      // Use a specific key so Dashboard only updates when a session is set
      localStorage.setItem('permitops_workflow_update', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', { key: 'permitops_workflow_update' }));
    }
  }, [msgs, isLoaded, isAuthenticated, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  // Auto-send a question if navigated from "Ask AI about this step"
  useEffect(() => {
    if (!sessionId || !isLoaded) return;
    const pending = localStorage.getItem('permitops_ask_step');
    if (!pending) return;
    localStorage.removeItem('permitops_ask_step');
    // Small delay so the page settles first
    const timer = setTimeout(() => send(pending), 600);
    return () => clearTimeout(timer);
  }, [sessionId, isLoaded]);

  const handleNewChat = async () => {
    if (isAuthenticated && token) {
      try {
        const res = await apiFetch(`/chat/sessions?token=${token}`, { method: 'POST' });
        if (res?.ok) {
          const data = await res.json();
          setSessionId(data.id);
          setMsgs([]);
        }
      } catch (e) {
        console.error("Failed to create new session", e);
      }
    } else {
      clearChat();
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/chat/history/${id}?token=${token}`, { method: 'DELETE' });
      if (res?.ok) {
        if (sessionId === id) setSessionId(null);
        else setSessionId(prev => prev); 
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy || !sessionId) return;
    setInput('');

    const userMsg: Msg = { id: msgIdRef.current++, role: 'user', content: q };
    setMsgs(p => [...p, userMsg]);
    setBusy(true);
    if (!sessionTitle && msgs.length === 0) {
      setSessionTitle(q.length > 35 ? q.slice(0, 32) + '...' : q);
    }

    try {
      const res = await apiFetch(`/agent/query${token ? `?token=${token}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language, context: { session_id: sessionId } }),
      });
      if (!res || !res.ok) throw new Error();
      const data = await res.json();
      
      if (data.session_title) {
        setSessionTitle(data.session_title);
      }
      
      setMsgs(p => [...p, { id: msgIdRef.current++, role: 'assistant', content: data.content ?? data.answer ?? data.response ?? 'Done.' }]);
    } catch {
      setMsgs(p => [...p, { id: msgIdRef.current++, role: 'assistant', content: "⚠️ Backend is currently offline. Please make sure the server is running." }]);
    } finally {
      setBusy(false);
    }
  };

  const clearChat = async () => {
    if (isAuthenticated && token && sessionId) {
      try {
        await fetch(`http://localhost:8003/chat/history/${sessionId}?token=${token}`, { method: 'DELETE' });
        setSessionId(null);
      } catch (e) {
        console.error("Failed to clear history on backend", e);
      }
    } else {
      localStorage.removeItem('permitops_chat_history');
      setMsgs([]);
      msgIdRef.current = 1;
    }
  };

  const isEmpty = msgs.length === 0;

  return (
    <div className="flex h-screen overflow-hidden selection:bg-purple-500/30 pt-16 relative" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0f1a 100%)' }}>
      <Sidebar 
        currentSessionId={sessionId}
        onSessionSelect={(id, title) => { setSessionId(id); setSessionTitle(title); }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        token={token}
      />
      
      {/* Centered Chat Title for Screen — High Visibility */}
      <div className="absolute left-0 right-0 top-[76px] flex justify-center pointer-events-none z-30 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-2 rounded-full glass-card border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-xl max-w-[70vw] truncate pointer-events-auto"
        >
          <span className="text-xs md:text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300 whitespace-nowrap tracking-widest uppercase drop-shadow-md">
            {sessionTitle || t('chat_new')}
          </span>
        </motion.div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 transition-colors duration-300 relative">
        <div className="h-16 shrink-0" /> {/* Spacer for the centered title container */}

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">

          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 gap-2 pb-32">
              {/* Suggestion Chips */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-2.5 max-w-4xl mb-8"
              >
                {[
                  { icon: Building2, label: t('chat_suggestion_business'), color: '#60a5fa',  bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)'  },
                  { icon: FileText,  label: t('chat_suggestion_permit'),   color: '#c084fc',  bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)' },
                  { icon: Search,    label: t('chat_suggestion_location'), color: '#4ade80',  bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)'  },
                  { icon: Clock,     label: t('chat_suggestion_duration'), color: '#fb923c',  bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.2)'  },
                  { icon: Sparkles,  label: t('chat_suggestion_cost'),     color: '#facc15',  bg: 'rgba(250,204,21,0.1)',  border: 'rgba(250,204,21,0.2)'  },
                  { icon: HelpCircle,label: t('chat_suggestion_help'),     color: '#818cf8',  bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' }
                ].map((chip, i) => (
                  <div
                    key={i}
                    style={{ background: chip.bg, border: `1px solid ${chip.border}` }}
                    className="text-white/70 text-sm py-2.5 px-5 rounded-full flex items-center gap-2 font-medium select-none backdrop-blur-sm"
                  >
                    {chip.icon && <chip.icon size={14} style={{ color: chip.color }} />}
                    {chip.label}
                  </div>
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="w-full mb-8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl md:text-2xl font-medium bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent">
                     {t('chat_welcome').replace('{name}', user?.fullName || (user?.email ? user.email.split('@')[0] : 'there'))}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-white">
                  {t('chat_begin')}
                </h1>
              </motion.div>

              {/* Chat Input Pill (empty state, centered) */}
              <div className="w-full max-w-3xl mb-12">
                <div className="rounded-[28px] p-2 pr-3 min-h-[140px] flex flex-col border border-white/10 hover:border-white/20 transition-all" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                    }}
                    placeholder={t('chat_placeholder_alt')}
                    className="flex-1 bg-transparent text-[18px] p-4 text-white placeholder:text-white/30 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between px-2 pb-1">
                    <div className="flex items-center gap-1">
                      <button className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                       <span className="text-xs font-medium text-white/30 flex items-center gap-1 cursor-pointer hover:text-white/60 transition-colors mr-2">
                         Fast <ChevronDown size={14} />
                       </span>
                       {input.trim() ? (
                        <button onClick={() => send()} disabled={busy}
                          className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-purple-400 hover:bg-white/10 transition-colors">
                          <Send size={20} />
                        </button>
                      ) : (
                        <button className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all">
                          <Mic size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Suggestions */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2.5 max-w-4xl"
              >
                {[
                  { label: t('chat_suggestion_obtain') },
                  { label: t('chat_suggestion_steps') },
                  { label: t('chat_suggestion_docs') }
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => send(chip.label)}
                    className="text-white/60 hover:text-white text-[15px] py-2.5 px-6 rounded-full transition-all font-medium active:scale-95 touch-manipulation border border-white/10 hover:border-white/25 hover:bg-white/5 backdrop-blur-sm"
                  >
                    {chip.label}
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-12 pb-40 slim-scroll">
              <AnimatePresence initial={false}>
                {msgs.map(m => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#4285f4] to-[#9b72cb] flex items-center justify-center text-white shrink-0 mr-4 mt-1 shadow-lg">
                        <Sparkles size={16} />
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-[16px] leading-[1.6] whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'px-5 py-3.5 rounded-[22px] border border-white/10 text-white/90'
                          : 'text-white/80 py-2 w-full font-normal'
                      }`}
                      style={m.role === 'user' ? { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' } : {}}
                    >
                        {m.role === 'assistant' ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ node, ...props }) => <p className="mb-6 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-3 marker:text-[#8ab4f8]" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-3 marker:text-[#8ab4f8]" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-[var(--text)]" {...props} />,
                              a: ({ node, ...props }) => <a className="text-[var(--accent)] hover:underline transition-colors" {...props} />,
                              code: ({ node, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !className?.includes('language-');
                                return isInline
                                  ? <code className="bg-[var(--surface-2)] text-[#f28b82] px-1.5 py-0.5 rounded text-[14px] font-mono" {...props}>{children}</code>
                                  : <div className="bg-[#0e0e0e] rounded-xl border border-white/5 overflow-hidden my-6"><div className="px-4 py-2 bg-white/5 text-[11px] text-white/40 font-mono uppercase tracking-widest border-b border-white/5">{match?.[1] || 'code'}</div><pre className="p-4 overflow-x-auto text-[14px] text-gray-300 font-mono leading-relaxed"><code {...props}>{children}</code></pre></div>
                              }
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {busy && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start">
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] shrink-0 mr-4">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div className="text-[var(--muted)] py-2 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-[var(--muted)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[var(--muted)]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-[var(--muted)]/30 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}

          {/* Sticky Input Bar (Only visible when NOT empty) */}
          {!isEmpty && (
            <div className="absolute bottom-0 left-0 w-full pt-12 pb-10 px-4 flex justify-center" style={{ background: 'linear-gradient(to top, #0a0a0f 60%, transparent)' }}>
              <div className="w-full max-w-3xl relative px-2">
                <div className={`relative flex flex-col rounded-[28px] p-2 pr-3 min-h-[56px] border border-white/10 transition-all duration-300 ${busy ? 'opacity-70' : 'hover:border-white/20 focus-within:border-white/20'}`} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                  
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                        if (inputRef.current) inputRef.current.style.height = 'auto';
                      }
                    }}
                    disabled={busy}
                    placeholder={t('chat_placeholder')}
                    className="flex-1 max-h-[200px] min-h-[48px] px-4 py-3 bg-transparent text-[16px] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none resize-none overflow-y-auto slim-scroll"
                    rows={1}
                  />

                  <div className="flex items-center justify-between px-2 pb-1">
                    <div className="flex items-center gap-1">
                      <button className="p-2.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                        <Plus size={20} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {input.trim() ? (
                        <button
                          onClick={() => {
                            send();
                            if (inputRef.current) inputRef.current.style.height = 'auto';
                          }}
                          disabled={busy}
                          className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors"
                        >
                          <Send size={20} />
                        </button>
                      ) : (
                        <button className="p-3 text-[var(--muted)] hover:text-[var(--text)] transition-colors px-2">
                          <Mic size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-center text-[11px] text-[var(--muted)] mt-4 font-normal tracking-wide">
                  PermitOps AI Advisor • Municipal Protocol Engine • v2.4
                </p>
              </div>
            </div>
          )}

        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .slim-scroll::-webkit-scrollbar { width: 6px; }
          .slim-scroll::-webkit-scrollbar-track { background: transparent; }
          .slim-scroll::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 10px; }
          .slim-scroll::-webkit-scrollbar-thumb:hover { background: var(--border); }
        `}} />
      </main>
    </div>
  );
}
