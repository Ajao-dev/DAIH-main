'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@daih/api-client';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
} from 'lucide-react';

interface TopAppBarProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = 'Executive Flux',
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

        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#23055c]">
          {title}
        </h1>
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
