'use client';

import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const langs = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ] as const;

  const currentLang = langs.find(l => l.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] border border-transparent hover:border-white/10"
      >
        <Globe size={16} />
        <span>{currentLang?.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 mt-2 w-40 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-xl"
            >
              <div className="py-1">
                {langs.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      language === lang.code 
                        ? 'bg-purple-500/10 text-purple-500 font-bold' 
                        : 'text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-xs opacity-60">{lang.flag}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
