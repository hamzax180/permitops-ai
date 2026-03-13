'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Menu, X, FileCheck } from 'lucide-react';

const links = [
  { href: '/',          label: 'Home' },
  { href: '/chat',      label: 'AI Advisor' },
  { href: '/dashboard', label: 'My Permits' },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (pathname === '/chat') return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-black/5' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/40">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-[15px] text-gray-900 tracking-tight">
            Permit<span className="text-blue-600">Ops</span>
          </span>
          <span className="hidden sm:block text-[10px] font-semibold text-gray-500 tracking-widest uppercase mt-px">AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-gray-100/50"
                    style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
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
          <Link href="/dashboard">
            <button className="btn btn-outline !py-2 !px-4 !text-sm">
              Dashboard
            </button>
          </Link>
          <Link href="/chat">
            <button className="btn btn-blue !py-2 !px-4 !text-sm">
              <FileCheck size={14} />
              Start for free
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors"
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
          className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 py-4 space-y-1"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100">
            <Link href="/chat" onClick={() => setOpen(false)}>
              <button className="btn btn-blue w-full mt-1">Start for free</button>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
