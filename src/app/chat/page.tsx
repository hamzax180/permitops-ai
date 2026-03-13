'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Loader2, Link2, Image as ImageIcon, Mic, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

import Sidebar from '../components/Sidebar';

type Role = 'assistant' | 'user';
interface Msg { id: number; role: Role; content: string; }

export default function ChatPage() {
  const { t, isRTL } = useLanguage();
  const { token, isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
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
          const res = await fetch(`http://localhost:8003/chat/sessions?token=${token}`);
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0 && !sessionId) {
              setSessionId(data[0].id);
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
          const res = await fetch(`http://localhost:8003/chat/history/${sessionId}?token=${token}`);
          if (res.ok) {
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
  }, [msgs, isLoaded, isAuthenticated, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const handleNewChat = async () => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`http://localhost:8003/chat/sessions?token=${token}`, { method: 'POST' });
        if (res.ok) {
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
      const res = await fetch(`http://localhost:8003/chat/history/${id}?token=${token}`, { method: 'DELETE' });
      if (res.ok) {
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

    try {
      const res = await fetch(`http://localhost:8003/agent/query${token ? `?token=${token}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, context: { session_id: sessionId } }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMsgs(p => [...p, { id: msgIdRef.current++, role: 'assistant', content: data.content ?? data.answer ?? data.response ?? 'Done.' }]);
    } catch {
      setMsgs(p => [...p, { id: msgIdRef.current++, role: 'assistant', content: "⚠️ Backend is currently offline." }]);
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
    <div className="flex h-screen bg-[#131314] text-white overflow-hidden selection:bg-[#8ab4f8]/30">
      <Sidebar 
        currentSessionId={sessionId}
        onSessionSelect={(id) => setSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        token={token}
      />
      
      <main className="flex-1 flex flex-col min-w-0 transition-colors duration-300 relative">
        {/* Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 shrink-0 bg-[#131314]/80 backdrop-blur-md z-10 transition-all">
          <div className="flex items-center gap-3">
              <span className="text-lg font-medium tracking-tight bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent">
                PermitOps
              </span>
              <span className="text-white/40 text-sm hidden sm:block">AI Advisor</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#9b72cb] p-[1.5px] cursor-pointer hover:shadow-lg transition-shadow">
              <div className="w-full h-full rounded-full bg-[#131314] flex items-center justify-center">
                <User size={16} className="text-white/80" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">

          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-6 gap-8 pb-32">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-center space-y-4"
              >
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white/90">
                  {t('chat_greeting')}
                </h1>
                <h2 className="text-2xl md:text-3xl font-light text-white/40">
                  {t('chat_subtitle')}
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mt-4 w-full"
              >
                {QUICK_Q.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className="bg-[#1e1f20] hover:bg-[#2a2b2d] border border-white/5 text-white/80 text-sm py-4 px-6 rounded-2xl transition-all hover:border-white/10 text-left shadow-sm group"
                  >
                    <span className="line-clamp-2">{q}</span>
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
                      <div className={`text-[16px] leading-[1.6] whitespace-pre-wrap ${m.role === 'user'
                          ? 'bg-[#1e1f20] text-white px-6 py-4 rounded-[28px] border border-white/5 shadow-md'
                          : 'text-[#e3e3e3] py-2 w-full font-normal'
                        }`}>
                        {m.role === 'assistant' ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ node, ...props }) => <p className="mb-6 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-3 marker:text-[#8ab4f8]" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-3 marker:text-[#8ab4f8]" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                              a: ({ node, ...props }) => <a className="text-[#8ab4f8] hover:underline transition-colors" {...props} />,
                              code: ({ node, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !className?.includes('language-');
                                return isInline
                                  ? <code className="bg-[#2a2b2d] text-[#f28b82] px-1.5 py-0.5 rounded text-[14px] font-mono" {...props}>{children}</code>
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
                  <div className="h-8 w-8 rounded-full bg-[#1e1f20] flex items-center justify-center text-[#8ab4f8] shrink-0 mr-4">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div className="text-white/40 py-2 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-white/10 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}

          {/* Sticky Input Bar (Pill Capsule) */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#131314] via-[#131314] to-transparent pt-12 pb-10 px-4 flex justify-center">
            <div className="w-full max-w-3xl relative px-2">
              <div className={`relative flex items-end gap-3 bg-[#1e1f20] rounded-[32px] p-2 pr-3 min-h-[56px] border border-transparent transition-all duration-300 group ${busy ? 'opacity-70' : 'hover:bg-[#2a2b2d] focus-within:bg-[#2a2b2d] focus-within:ring-1 focus-within:ring-white/10'}`}>

                <button className="shrink-0 p-3 text-white/60 hover:text-white transition-colors">
                  <Plus size={22} />
                </button>

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
                  className="flex-1 max-h-[200px] min-h-[24px] py-3.5 bg-transparent text-[16px] text-white placeholder:text-white/30 focus:outline-none resize-none overflow-y-auto slim-scroll"
                  rows={1}
                />

                <div className="flex items-center gap-1 mb-1 shadow-sm">
                  {input.trim() ? (
                    <button
                      onClick={() => {
                        send();
                        if (inputRef.current) inputRef.current.style.height = 'auto';
                      }}
                      disabled={busy}
                      className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-[#8ab4f8] hover:bg-white/5 transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  ) : (
                    <button className="p-3 text-white/60 hover:text-white transition-colors px-2">
                      <Mic size={22} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-center text-[11px] text-white/30 mt-4 font-normal tracking-wide">
                PermitOps AI Advisor • Municipal Protocol Engine • v2.4
              </p>
            </div>
          </div>

        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .slim-scroll::-webkit-scrollbar { width: 6px; }
          .slim-scroll::-webkit-scrollbar-track { background: transparent; }
          .slim-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
          .slim-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
        `}} />
      </main>
    </div>
  );
}
