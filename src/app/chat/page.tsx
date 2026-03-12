'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Globe, Info, FileText, Hash, Loader2 } from 'lucide-react';

type Role = 'assistant' | 'user';
interface Message { role: Role; content: string; id: number; }

const QUICK_QUESTIONS = [
  'What permits do I need for a restaurant in Istanbul?',
  'How long does the fire safety inspection take?',
  'What is İşyeri Açma ve Çalışma Ruhsatı?',
  'What documents are required for Beşiktaş?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: `Merhaba! I'm your PermitOps AI Advisor 🇹🇷\n\nI specialize in Turkish business permits — restaurants, cafes, retail, and more. I'm synchronized with the latest Beşiktaş Municipality protocols (2024-B).\n\nHow can I help you today? You can ask me about:\n• Required permits for your business\n• Document checklists\n• Timelines and costs\n• Municipality-specific requirements`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  let idCounter = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setInput('');
    const userMsg: Message = { id: idCounter.current++, role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: idCounter.current++,
        role: 'assistant',
        content: data.content ?? data.answer ?? data.response ?? 'Received.',
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: idCounter.current++,
        role: 'assistant',
        content: `⚠️ Backend is offline or unreachable.\n\nTo connect the AI:\n1. Start the FastAPI server: \`cd backend && python main.py\`\n2. Ensure it runs on http://localhost:8000\n\n*Demo mode: I can still answer questions based on my training.*`,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <main className="h-screen flex flex-col pt-20 pb-0 overflow-hidden">
      <div className="flex-1 flex max-w-6xl mx-auto w-full px-4 gap-6 min-h-0 py-6">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-72 gap-4 flex-shrink-0">

          {/* Status Card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 flex-shrink-0">
                <Bot size={20} />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[var(--navy)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">PermitOps AI</p>
                <p className="text-[11px] text-emerald-400 font-semibold">Online · Session #PX-982</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed space-y-1">
              <p className="flex items-center gap-2"><Globe size={11} className="text-blue-400" /> Istanbul Municipal v2.4</p>
              <p className="flex items-center gap-2"><FileText size={11} className="text-blue-400" /> 14 permit types loaded</p>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="card p-5 space-y-3 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Common Questions</p>
            <div className="space-y-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left text-xs text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-blue-500/20 rounded-xl p-3 transition-all disabled:opacity-40"
                >
                  <span className="text-blue-500 mr-1.5">#</span>{q}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="card p-4 border-blue-500/15 bg-blue-600/[0.05] flex items-start gap-3">
            <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Start the <strong className="text-white">FastAPI backend</strong> on port 8000 for live AI responses.
            </p>
          </div>
        </aside>

        {/* ── Chat Area ── */}
        <div className="flex-1 flex flex-col card min-h-0 overflow-hidden">

          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI Permit Advisor</p>
                <p className="text-[10px] text-slate-500">Turkish Business Permit Specialist</p>
              </div>
            </div>
            <span className="badge badge-blue">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              {loading ? 'Thinking...' : 'Ready'}
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto slim-scroll p-6 space-y-6">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                    m.role === 'assistant'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                      : 'bg-slate-700 border border-white/10 text-slate-300'
                  }`}>
                    {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-1">
                      {m.role === 'assistant' ? 'PermitOps AI' : 'You'}
                    </span>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'assistant'
                        ? 'bg-white/[0.05] border border-white/8 text-slate-200 rounded-tl-md'
                        : 'bg-blue-600 text-white rounded-tr-md shadow-lg shadow-blue-600/25'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 bg-white/[0.05] border border-white/8 rounded-2xl rounded-tl-md">
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 border-t border-white/5 space-y-3">
            {/* Quick Tag Row (mobile) */}
            <div className="flex gap-2 overflow-x-auto slim-scroll pb-1">
              {['Fire Permit', 'Zoning', 'Cost Estimate', 'Timeline'].map(tag => (
                <button
                  key={tag}
                  onClick={() => sendMessage(tag)}
                  disabled={loading}
                  className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/20 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
                >
                  <Hash size={10} className="text-blue-500" />{tag}
                </button>
              ))}
            </div>

            {/* Text Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                  placeholder="Ask about permits, documents, timelines..."
                  className="w-full bg-[var(--navy-100)] border border-white/10 focus:border-blue-500/50 rounded-xl px-5 py-3.5 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="btn-primary !py-3 !px-4 !rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
