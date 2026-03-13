'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Loader2, Link2, Image as ImageIcon, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Role = 'assistant' | 'user';
interface Msg { id: number; role: Role; content: string; }

const QUICK_Q = [
  'What permits do I need for a restaurant in Istanbul?',
  'How long does the fire safety inspection take?',
  'What documents does Beşiktaş Municipality require?',
  'What is the cost of a fire safety certificate?',
];

let _id = 1;

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput]   = useState('');
  const [busy,  setBusy]    = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('permitops_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setMsgs(parsed);
          _id = Math.max(...parsed.map((m: Msg) => m.id)) + 1;
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

    const userMsg: Msg = { id: _id++, role: 'user', content: q };
    setMsgs(p => [...p, userMsg]);
    setBusy(true);

    try {
      const res  = await fetch('http://localhost:8003/agent/query', {
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
        content: "⚠️ Backend is currently offline.\n\nMake sure the backend is running on http://localhost:8003",
      }]);
    } finally {
      setBusy(false);
      // Removed auto-focus so mobile keyboards don't pop up immediately after sending
    }
  };

  const clearChat = () => {
    setMsgs([]);
    localStorage.removeItem('permitops_chat_history');
    _id = 1;
  };

  const isEmpty = msgs.length === 0;

  return (
    <main className="h-screen flex flex-col bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900 font-sans" style={{ background: '#ffffff', color: '#1f2937' }}>
      
      {/* ── Top Header Bar ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2 text-gray-800">
          <span className="font-medium text-[15px]">PermitOps AI</span>
          <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md tracking-wider">Beta</span>
        </div>
        <div className="flex items-center gap-3">
          {!isEmpty && (
            <button
              onClick={clearChat}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors"
            >
              Clear chat
            </button>
          )}
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
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
              className="text-center space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Hello there.
              </h1>
              <h2 className="text-3xl md:text-4xl font-normal text-gray-400">
                How can I help with Istanbul permits today?
              </h2>
            </motion.div>
            
            {/* Suggestion Chips */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-2xl mt-4"
            >
              {QUICK_Q.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm py-3 px-5 rounded-2xl transition-all shadow-sm shadow-gray-100 hover:shadow-md hover:-translate-y-0.5 text-left"
                >
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-10 pb-40">
            <AnimatePresence initial={false}>
              {msgs.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mr-4 mt-1">
                      <Sparkles size={16} className="fill-blue-600/20" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Username explicitly hidden in Gemini style for a cleaner look, but we keep the visual distinction */}
                    
                    <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#f0f4f9] text-gray-800 px-5 py-3.5 rounded-[24px] rounded-tr-sm' // Gray/Blue pill for user
                        : 'text-gray-800 py-1 w-full max-w-full overflow-hidden' // Simple flat text for AI
                    }`}>
                      {m.role === 'assistant' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-gray-400" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-gray-400" {...props} />,
                            li: ({node, ...props}) => <li className="" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-5 text-gray-900" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-5 text-gray-900" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2 mt-4 text-gray-900" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium break-words" target="_blank" rel="noopener noreferrer" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-4 border-gray-200" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto mb-3"><table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md" {...props} /></div>,
                            th: ({node, ...props}) => <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
                            td: ({node, ...props}) => <td className="px-3 py-2 white-space-nowrap text-sm text-gray-700 border-t border-gray-100" {...props} />,
                            code: ({node, className, children, ...props}) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !className?.includes('language-');
                              return isInline 
                                ? <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>{children}</code>
                                : <div className="bg-gray-900 rounded-md overflow-hidden my-3"><div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 font-sans">{match?.[1] || 'code'}</div><pre className="p-4 overflow-x-auto text-[13px] text-gray-50 bg-gray-900"><code className="font-mono bg-transparent p-0" {...props}>{children}</code></pre></div>
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

            {/* Typing Indicator */}
            {busy && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mr-4">
                  <Sparkles size={16} className="animate-pulse fill-blue-600/20" />
                </div>
                <div className="text-gray-400 py-1 flex items-center space-x-1">
                 <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                 <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                 <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}

        {/* ── Sticky Input Bar (Bottom) ── */}
        <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 md:pb-8 px-4 flex justify-center ${isEmpty ? 'top-auto pb-12' : ''}`}>
          <div className="w-full max-w-4xl relative">
            <div className={`relative flex items-end gap-2 bg-[#f0f4f9] rounded-[28px] p-2 transition-shadow duration-300 focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.08)] ${busy ? 'opacity-80' : ''}`}>
              
              {/* Fake action buttons for aesthetic match */}
              <button disabled className="shrink-0 p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors cursor-not-allowed">
                <Link2 size={20} />
              </button>
              
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  // Auto-grow
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                    if(inputRef.current) inputRef.current.style.height = 'auto';
                  }
                }}
                disabled={busy}
                placeholder="Ask PermitOps AI..."
                className="flex-1 max-h-[200px] min-h-[44px] py-3.5 bg-transparent text-[15px] text-gray-800 placeholder:text-gray-500 focus:outline-none resize-none overflow-y-auto slim-scroll rounded-xl"
                rows={1}
              />
              
              {/* Voice / Submit buttons */}
              {input.trim() ? (
                <button
                  onClick={() => {
                    send();
                    if(inputRef.current) inputRef.current.style.height = 'auto';
                  }}
                  disabled={busy}
                  className="shrink-0 mb-1 mr-1 h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                >
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </button>
              ) : (
                <div className="flex items-center gap-1 mb-1 mr-1">
                  <button disabled className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors cursor-not-allowed">
                    <ImageIcon size={20} />
                  </button>
                  <button disabled className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors cursor-not-allowed">
                    <Mic size={20} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-3 hidden md:block">
              PermitOps AI can make mistakes. Verify critical municipal protocols independently.
            </p>
          </div>
        </div>

      </div>
      
      {/* Global minimal scrollbar injection for this page specifically */}
      <style dangerouslySetInnerHTML={{__html: `
        .slim-scroll::-webkit-scrollbar { width: 5px; }
        .slim-scroll::-webkit-scrollbar-track { background: transparent; }
        .slim-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}} />
    </main>
  );
}
