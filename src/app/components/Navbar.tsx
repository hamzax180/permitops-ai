'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Menu, X, FileCheck, Sun, Moon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ isAppPage = false }: { isAppPage?: boolean }) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { t, isRTL } = useLanguage();

  const links = [
    { href: '/', label: t('navbar_home') },
    { href: '/chat', label: t('navbar_chat') },
    { href: '/dashboard', label: t('navbar_dashboard') },
    { href: '/pricing', label: t('navbar_pricing') || 'Pricing' },
  ];



  return (
    <header
      className={`${isAppPage ? 'relative z-[20] w-full shrink-0' : 'fixed inset-x-0 top-0 z-[100]'} transition-all duration-300 ${scrolled ? 'bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-md' : 'bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)]/30'
        }`}
    >
      <div className="w-full pl-20 pr-6 md:pr-12 h-16 flex items-center justify-between">

        {/* Logo removed */}

        {/* Desktop Nav - Left Aligned */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-[var(--surface-2)]"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{user?.fullName || user?.email}</span>
              <button 
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-full text-sm font-bold shadow-lg transition-all active:scale-95">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <div className="space-y-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === href ? 'bg-[var(--surface-2)] text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <button onClick={logout} className="w-full py-2.5 rounded-full font-bold text-sm text-red-500 border border-red-500/20">
              Logout
            </button>
          ) : (
            <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <button className="text-[var(--text)] w-full py-2.5 rounded-full font-bold text-sm border border-[var(--border)]">Login</button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <button className="bg-[var(--text)] text-[var(--bg)] w-full py-2.5 rounded-full font-bold text-sm">Sign Up</button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
}
