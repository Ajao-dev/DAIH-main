'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@daih/api-client';
import { useToast } from '@daih/ui';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  KeyRound,
  Settings,
  HelpCircle,
  LogOut,
  X,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarNavProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const toast = useToast();

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Member';
  const displayRole = user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Premium Member';

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have been signed out.', { title: 'Signed Out' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'Plans & Book',
      href: '/book',
      icon: Layers,
      active: pathname === '/book' || pathname.startsWith('/book/'),
    },
    {
      label: 'My Bookings',
      href: '/bookings',
      icon: Calendar,
      active: pathname.startsWith('/bookings'),
    },
    {
      label: 'Entry Key',
      href: '/qr',
      icon: KeyRound,
      active: pathname.startsWith('/qr'),
    },
    {
      label: 'Settings',
      href: '/dashboard#settings',
      icon: Settings,
      active: false,
    },
  ];

  const renderContent = (collapsed: boolean) => (
    <div className={`flex flex-col h-full justify-between p-4 bg-[#F8F9FA] text-[#181c20] transition-all duration-300 ${collapsed ? 'px-2' : 'p-4'}`}>
      {/* Brand & Profile Header */}
      <div>
        <div className={`flex items-center justify-between pt-2 pb-4 mb-4 border-b border-slate-200/60 ${collapsed ? 'flex-col gap-3 px-0' : 'px-2'}`}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="DAIH Hub"
              className={`${collapsed ? 'h-7' : 'h-8'} w-auto object-contain transition-all`}
            />
          </Link>

          {/* Desktop Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex text-slate-400 hover:text-[#23055c] p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Close button for mobile drawer */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Badge */}
        <div className={`flex items-center mb-6 ${collapsed ? 'justify-center px-0' : 'gap-3 px-2'}`} title={displayName}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#23055c] to-[#392271] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {user?.firstName?.[0] || 'M'}
            {user?.lastName?.[0] || ''}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-[#181c20] truncate">{displayName}</h2>
              <p className="text-[11px] text-slate-500 truncate">{displayRole}</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    collapsed ? 'justify-center px-2' : 'px-3.5'
                  } ${
                    item.active
                      ? 'bg-[#EBE7F5] text-[#23055c] shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-[#23055c]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#23055c]' : 'text-slate-500'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-200/70 space-y-3">
        <Link
          href="/book"
          onClick={onMobileClose}
          title={collapsed ? 'Book a Space' : undefined}
          className={`w-full flex items-center justify-center gap-2 bg-[#23055c] hover:bg-[#392271] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm ${
            collapsed ? 'px-0' : 'px-3'
          }`}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Book a Space</span>}
        </Link>

        <ul className="space-y-1">
          <li>
            <Link
              href="/support"
              onClick={onMobileClose}
              title={collapsed ? 'Support' : undefined}
              className={`flex items-center gap-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/50 hover:text-[#23055c] rounded-xl transition ${
                collapsed ? 'justify-center px-2' : 'px-3'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Support</span>}
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
              className={`w-full flex items-center gap-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer ${
                collapsed ? 'justify-center px-2' : 'px-3'
              }`}
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <nav
        className={`h-screen hidden md:flex flex-col border-r border-slate-200/80 fixed left-0 top-0 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderContent(isCollapsed)}
      </nav>

      {/* Mobile Drawer Backdrop & Menu (Always expanded for usability on mobile) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-4/5 max-w-xs h-full bg-[#F8F9FA] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderContent(false)}
          </div>
        </div>
      )}
    </>
  );
};
