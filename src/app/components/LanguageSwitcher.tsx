'use client';

import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'tr', label: 'TR' },
    { code: 'ar', label: 'AR' },
  ] as const;

  return (
    <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
      {langs.map((lang) => {
        const active = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`relative px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
              active 
                ? 'text-[var(--text)]' 
                : 'text-[var(--muted)] hover:text-[var(--text)] opacity-70 hover:opacity-100'
            }`}
          >
            {active && (
              <motion.div
                layoutId="active-lang"
                className="absolute inset-0 bg-[var(--surface)] shadow-sm rounded-lg border border-[var(--border)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
