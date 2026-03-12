'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Hash, Globe, FileText, Shield } from 'lucide-react';

type Role = 'assistant' | 'user';
interface Msg { id: number; role: Role; content: string; }

const QUICK_Q = [
  'What permits do I need for a restaurant in Istanbul?',
  'How long does the fire safety inspection take?',
  'What is İşyeri Açma ve Çalışma Ruhsatı?',
  'What documents does Beşiktaş Municipality require?',
  'What is the cost of a fire safety certificate?',
];

let _id = 1;

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, role: 'assistant', content: "Merhaba! I'm PermitOps AI — your Turkish business permit specialist.\n\nI'm synchronized with Beşiktaş Municipality protocols (2024-B). Ask me anything about:\n\n• Permit requirements for your business type\n• Required documents and checklists\n• Timeline and cost estimates\n• Municipality-specific regulations" }
  ]);
  const [input, setInput]   = useState('');
  const [busy,  setBusy]    = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');

    const userMsg: Msg = { id: _id++, role: 'user', content: q };
    setMsgs(p => [...p, userMsg]);
    setBusy(true);

    try {
      const res  = await fetch('http://localhost:8000/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMsgs(p => [...p, { id: _id++, role: 'assistant', content: data.content ?? data.answer ?? data.response ?? 'Done.' }]);
    } catch {
      setMsgs(p => [...p, {
        id: _id++, role: 'assistant',
        content: "⚠️ Backend is currently offline.\n\nTo connect live AI:\n1. Run `cd backend && python main.py`\n2. Ensure it's running on http://localhost:8000\n\nIn the meantime, feel free to browse the permit dashboard or ask general questions.",
      }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden pt-16">
      <div className="flex flex-1 min-h-0 max-w-6xl mx-auto w-full px-4 py-4 gap-4">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-4 w-64 xl:w-72 shrink-0">

          {/* Agent Card */}
          <div className="card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 shrink-0">
                <Bot size={20} />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0a0f1e]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">PermitOps AI</p>
                <p className="text-[11px] text-emerald-400 font-medium">Online</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[12px] text-slate-500">
              <div className="flex items-center gap-2"><Globe size={11} className="text-blue-400 shrink-0" /> Istanbul v2.4 Protocol</div>
              <div className="flex items-center gap-2"><FileText size={11} className="text-blue-400 shrink-0" /> 14 permit types indexed</div>
              <div className="flex items-center gap-2"><Shield size={11} className="text-blue-400 shrink-0" /> Municipal data updated Mar 12</div>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="card p-4 flex-1 space-y-3 overflow-y-auto slim-scroll">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Common questions</p>
            <div className="space-y-1.5">
              {QUICK_Q.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  disabled={busy}
                  className="w-full text-left text-[12px] text-slate-400 hover:text-white rounded-lg px-3 py-2.5 transition-colors disabled:opacity-40 hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <Hash size={10} className="inline text-blue-500 mr-1.5" />{q}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* ── Chat Panel ── */}
        <div className="flex-1 card flex flex-col min-h-0 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">AI Permit Advisor</p>
                <p className="text-[11px] text-slate-500">Turkish Business Permit Specialist</p>
              </div>
            </div>
            <span className="badge badge-blue">
              <span className={`h-1.5 w-1.5 rounded-full ${busy ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'}`} />
              {busy ? 'Thinking...' : 'Ready'}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto slim-scroll px-5 py-5 space-y-5">
            <AnimatePresence>
              {msgs.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    m.role === 'assistant'
                      ? 'text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 border border-white/8'
                  }`} style={{ background: m.role === 'assistant' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)' }}>
                    {m.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
                  </div>

                  <div className={`flex flex-col gap-1 max-w-[78%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1">
                      {m.role === 'assistant' ? 'PermitOps AI' : 'You'}
                    </span>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'assistant'
                        ? 'text-slate-200 rounded-tl-sm'
                        : 'text-white rounded-tr-sm'
                    }`} style={m.role === 'assistant'
                      ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }
                      : { background: '#2563eb', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }
                    }>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {busy && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center text-blue-400 shrink-0" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Bot size={15} />
                </div>
                <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="dots"><span /><span /><span /></div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 px-4 py-4 border-t border-white/5 space-y-3">
            {/* Mobile quick questions */}
            <div className="lg:hidden flex gap-2 overflow-x-auto slim-scroll pb-0.5">
              {['Fire Permit', 'Timeline', 'Documents', 'Costs'].map(t => (
                <button key={t} onClick={() => send(t)} disabled={busy}
                  className="shrink-0 text-[11px] font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                disabled={busy}
                placeholder="Ask about permits, documents, timelines in Turkey..."
                className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all focus-ring disabled:opacity-50 font-medium"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="btn btn-blue !py-3 !px-4 !rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
