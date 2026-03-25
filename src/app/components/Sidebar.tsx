import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MessageSquare, Trash2, Menu, Settings, HelpCircle, History, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../utils/api';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (id: string, title: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  token: string | null;
}

export default function Sidebar({
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  token
}: SidebarProps) {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/chat/sessions?token=${token}`);
      if (res?.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [token, currentSessionId]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 280 : 68 }}
      className="h-full bg-[var(--surface)] flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-50 border-r border-[var(--border)]"
    >
      {/* Top Menu Button */}
      <div className="p-4 mb-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 rounded-full hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
          title="Toggle menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-6">
        <button
          onClick={onNewChat}
          className={`group flex items-center justify-start gap-3 h-12 transition-all duration-300 rounded-full bg-[var(--surface-2)] hover:shadow-md border border-[var(--border)] overflow-hidden ${
            isExpanded ? 'w-40 px-5' : 'w-12 px-3.5'
          }`}
        >
          <Plus size={20} className="text-[var(--accent)] shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium text-[var(--text)] whitespace-nowrap"
              >
                 {t('sidebar_new_chat')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* History Items */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 slim-scroll pr-1">
        <AnimatePresence>
          {isExpanded && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[14px] font-medium text-[var(--text)] px-4 mb-3 mt-4"
            >
               {t('sidebar_recent') || 'Recent'}
            </motion.h3>
          )}
        </AnimatePresence>

        {!token && isExpanded ? (
          <div className="mx-1 p-4 rounded-2xl bg-[var(--surface-2)]/60 border border-[var(--border)] space-y-3 mt-4">
             <p className="text-[13px] font-semibold text-[var(--text)]">Sign in to start saving your chats</p>
             <p className="text-[12px] text-[var(--muted)] leading-relaxed">Once you're signed in, you can access your recent chats here.</p>
             <button className="text-[var(--accent)] text-[13px] font-bold hover:underline">Sign in</button>
          </div>
        ) : loading && sessions.length === 0 ? (
          <div className="space-y-4 px-3 py-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-2 bg-[var(--border)] animate-pulse rounded-full w-full" />
            ))}
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`group relative flex items-center gap-3 p-3 rounded-full transition-all cursor-pointer ${
                currentSessionId === s.id
                  ? 'bg-[var(--surface-2)] text-[var(--text)]'
                  : 'hover:bg-[var(--surface-2)] text-[var(--text)] opacity-90'
              }`}
              onClick={() => onSessionSelect(s.id, s.title)}
              title={s.title}
            >
              <MessageSquare size={18} className="text-[var(--muted)]" />
              {isExpanded && (
                <span className="text-sm font-medium truncate flex-1 pr-6 text-[var(--text)]">{s.title}</span>
              )}
              {isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions — Ensuring crisp separation in both modes */}
      <div className="p-3 space-y-1 mt-auto border-t border-[var(--border)] bg-[var(--surface)]/50">
        <Link href="/pricing" className="block mb-2">
          <div className={`group flex items-center gap-3 p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 cursor-pointer transition-all hover:bg-indigo-500/20 ${!isExpanded ? 'justify-center' : ''}`}>
             <Zap size={18} className="text-indigo-600 shrink-0" fill="currentColor" />
             {isExpanded && <span className="text-sm font-black text-indigo-600">Upgrade</span>}
          </div>
        </Link>
        {[
          { icon: HelpCircle, label: t('sidebar_help'), color: 'text-[var(--muted)]' },
          { icon: History, label: t('sidebar_activity'), color: 'text-[var(--muted)]' },
          { icon: Settings, label: t('sidebar_settings'), color: 'text-[var(--muted)]' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="group flex items-center gap-3 p-3 rounded-full hover:bg-[var(--surface-2)] cursor-pointer transition-all"
            title={item.label}
          >
            <item.icon size={18} className={`${item.color} group-hover:text-[var(--text)] transition-colors`} />
            {isExpanded && (
              <span className="text-sm font-medium text-[var(--text)] opacity-70 group-hover:opacity-100">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <style jsx global>{`
        .slim-scroll::-webkit-scrollbar { width: 4px; }
        .slim-scroll::-webkit-scrollbar-track { background: transparent; }
        .slim-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </motion.aside>
  );
}
