import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Menu, Settings, HelpCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (id: string) => void;
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
      const res = await fetch(`http://localhost:8003/chat/sessions?token=${token}`);
      if (res.ok) {
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
      className="h-full bg-[#131314] flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-50 shadow-2xl border-r border-white/5"
    >
      {/* Top Menu Button */}
      <div className="p-4 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 rounded-full hover:bg-white/10 text-white transition-colors"
          title="Collapse menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-4">
        <button
          onClick={onNewChat}
          className={`group flex items-center justify-start gap-3 h-12 transition-all duration-300 rounded-full bg-[#000000] hover:bg-[#1a1a1a] border border-white/5 shadow-md overflow-hidden ${
            isExpanded ? 'w-36 px-4' : 'w-10 px-2.5 ml-1'
          }`}
        >
          <Plus size={20} className="text-[#8ab4f8] shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium text-white/90 whitespace-nowrap"
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
              className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-3 mb-3 mt-4"
            >
               {t('sidebar_recent')}
            </motion.h3>
          )}
        </AnimatePresence>

        {loading && sessions.length === 0 ? (
          <div className="space-y-4 px-3 py-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-2 bg-white/5 animate-pulse rounded-full w-full" />
            ))}
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`group relative flex items-center gap-3 p-3 rounded-full transition-all cursor-pointer ${
                currentSessionId === s.id
                  ? 'bg-[#2a2b2d] text-white shadow-sm'
                  : 'hover:bg-white/5 text-white/70 hover:text-white'
              }`}
              onClick={() => onSessionSelect(s.id)}
              title={s.title}
            >
              <MessageSquare size={18} className={currentSessionId === s.id ? 'text-[#8ab4f8]' : 'text-white/40'} />
              {isExpanded && (
                <span className="text-sm font-medium truncate flex-1 pr-6">{s.title}</span>
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

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 mt-auto border-t border-white/5">
        {[
          { icon: HelpCircle, label: t('sidebar_help'), color: 'text-white/60' },
          { icon: History, label: t('sidebar_activity'), color: 'text-white/60' },
          { icon: Settings, label: t('sidebar_settings'), color: 'text-white/60' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="group flex items-center gap-3 p-3 rounded-full hover:bg-white/5 cursor-pointer transition-all"
            title={item.label}
          >
            <item.icon size={18} className={`${item.color} group-hover:text-white transition-colors`} />
            {isExpanded && (
              <span className="text-sm font-medium text-white/70 group-hover:text-white">{item.label}</span>
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
