'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, MessageSquare, LayoutDashboard, FileCheck } from 'lucide-react';

const links = [
  { href: '/',          label: 'Home' },
  { href: '/chat',      label: 'AI Advisor',     icon: MessageSquare },
  { href: '/dashboard', label: 'My Permits',      icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center pt-5 px-4 pointer-events-none"
    >
      <nav className="pointer-events-auto w-full max-w-6xl card flex items-center justify-between px-6 py-3 shadow-2xl shadow-black/40">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-105 transition-transform">
            <Shield size={18} className="text-white" fill="rgba(255,255,255,0.15)" />
          </div>
          <div className="leading-tight">
            <p className="text-white font-bold text-sm tracking-tight">PermitOps</p>
            <p className="text-blue-400 text-[10px] font-semibold tracking-widest uppercase">AI Platform</p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-blue-600/20 border border-blue-500/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-blue-300' : 'text-slate-400 hover:text-white'} transition-colors`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <Link href="/chat">
          <button className="btn-primary !py-2.5 !px-5 !text-sm">
            <FileCheck size={16} />
            Start Application
          </button>
        </Link>
      </nav>
    </motion.header>
  );
}
