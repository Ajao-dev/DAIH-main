'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@daih/api-client';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  Sparkles,
} from 'lucide-react';

interface TopAppBarProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  onMobileMenuToggle,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 w-full z-30 flex justify-between items-center px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-slate-600 hover:text-[#23055c] p-2 rounded-lg hover:bg-slate-100 transition"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* DAIH Logo Branding */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <img
            src="/images/logo.png"
            alt="DAIH Hub Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          {title && title !== 'Executive Flux' && (
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#23055c] border-l border-slate-200 pl-3">
              {title}
            </span>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Search Bar (Desktop) */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workspace..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#23055c] focus:border-transparent transition-all"
          />
        </div>

        {/* Book Space Action Slot */}
        <Link
          href="/book"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#23055c] hover:bg-[#35089e] text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Book Space</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            title="Notifications"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#23055c] hover:bg-slate-100 transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
          </button>

          <Link
            href="/support"
            title="Help & Support"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#23055c] hover:bg-slate-100 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>

          {/* User Profile Avatar */}
          <Link href="/dashboard" className="flex items-center gap-2 ml-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#23055c] to-[#392271] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-purple-200/80">
              {user?.firstName?.[0] || 'M'}
              {user?.lastName?.[0] || ''}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
