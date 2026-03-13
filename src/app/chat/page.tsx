'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Loader2, Link2, Image as ImageIcon, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';

type Role = 'assistant' | 'user';
interface Msg { id: number; role: Role; content: string; }

export default function ChatPage() {
  const { t, isRTL } = useLanguage();
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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('permitops_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setMsgs(parsed);
          msgIdRef.current = Math.max(...parsed.map((m: Msg) => m.id)) + 1;
        }
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever msgs change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('permitops_chat_history', JSON.stringify(msgs));
    }
  }, [msgs, isLoaded]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');

    const userMsg: Msg = { id: msgIdRef.current++, role: 'user', content: q };
    setMsgs(p => [...p, userMsg]);
    setBusy(true);

    try {
      const res = await fetch('http://localhost:8003/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMsgs(p => [...p, { id: msgIdRef.current++, role: 'assistant', content: data.content ?? data.answer ?? data.response ?? 'Done.' }]);
    } catch {
      setMsgs(p => [...p, {
        id: msgIdRef.current++, role: 'assistant',
        content: "⚠️ Backend is currently offline.\n\nMake sure the backend is running on http://localhost:8003",
      }]);
    } finally {
      setBusy(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem('permitops_chat_history');
    setMsgs([]);
    msgIdRef.current = 1;
  };

  const isEmpty = msgs.length === 0;

  return (
    <main className="h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-purple-500/30 font-sans overflow-hidden transition-colors duration-300">

      {/* ── Top Header Bar ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0 bg-[var(--nav-bg)] backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {/* Branding removed */}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={clearChat}
            className="flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors bg-[var(--surface-2)] hover:bg-[var(--border-2)] px-4 py-2 rounded-full border border-[var(--border)]"
          >
            <Sparkles size={14} className="text-purple-500" />
            {t('chat_new')}
          </button>
          <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)]">
            <User size={16} />
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-h-0 relative">

        {isEmpty ? (
          /* Empty / Landing State (Centered) */
          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-6 gap-8 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
                {t('chat_greeting')}
              </h1>
              <h2 className="text-2xl md:text-3xl font-light text-[var(--muted)]">
                {t('chat_subtitle')}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mt-4"
            >
              {QUICK_Q.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm py-3 px-6 rounded-2xl transition-all hover:border-[var(--border-2)] text-left shadow-sm"
                >
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-10 pb-40 slim-scroll">
            <AnimatePresence initial={false}>
              {msgs.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-purple-500 shrink-0 mr-4 mt-1 shadow-sm">
                      <Sparkles size={16} />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${m.role === 'user'
                        ? 'bg-[var(--surface-2)] text-[var(--text)] px-5 py-3.5 rounded-[24px] border border-[var(--border)] shadow-sm'
                        : 'text-[var(--text)] py-1 w-full'
                      }`}>
                      {m.role === 'assistant' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-purple-500" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-purple-500" {...props} />,
                            a: ({ node, ...props }) => <a className="text-purple-600 dark:text-purple-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-[var(--text)]" {...props} />,
                            code: ({ node, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !className?.includes('language-');
                              return isInline
                                ? <code className="bg-[var(--surface-2)] text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>{children}</code>
                                : <div className="bg-black/80 dark:bg-black/40 rounded-xl border border-[var(--border)] overflow-hidden my-4"><div className="px-4 py-2 bg-white/5 text-[10px] text-gray-500 font-mono uppercase tracking-widest">{match?.[1] || 'code'}</div><pre className="p-4 overflow-x-auto text-[13px] text-gray-300 font-mono"><code {...props}>{children}</code></pre></div>
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
                <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-purple-400 shrink-0 mr-4">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div className="text-[var(--muted)] py-1 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-[var(--muted)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--muted)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--muted)] rounded-full animate-bounce"></span>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}

        {/* ── Sticky Input Bar (Bottom) ── */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent pt-10 pb-8 px-4 flex justify-center">
          <div className="w-full max-w-3xl relative">
            <div className={`relative flex items-end gap-2 bg-[var(--surface-2)] rounded-[28px] p-2 border border-[var(--border)] shadow-lg transition-all duration-300 focus-within:border-[var(--accent)] ${busy ? 'opacity-50' : ''}`}>

              <button disabled className="shrink-0 p-3 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-not-allowed">
                <Link2 size={20} />
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
                className="flex-1 max-h-[200px] min-h-[44px] py-3.5 bg-transparent text-[15px] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none resize-none overflow-y-auto slim-scroll"
                rows={1}
              />

              {input.trim() ? (
                <button
                  onClick={() => {
                    send();
                    if (inputRef.current) inputRef.current.style.height = 'auto';
                  }}
                  disabled={busy}
                  className="shrink-0 mb-1 mr-1 h-10 w-10 flex items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-lg active:scale-95"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 mb-1 mr-1">
                  <button disabled className="p-3 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-not-allowed">
                    <Mic size={20} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-center text-[10px] text-[var(--muted)] mt-3">
              PermitOps AI Advisor v2.4 • Municipal Protocol Engine
            </p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .slim-scroll::-webkit-scrollbar { width: 5px; }
        .slim-scroll::-webkit-scrollbar-track { background: transparent; }
        .slim-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .slim-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}} />
    </main>
  );
}
