'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Users,
  Receipt,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@daih/api-client';
import { cn } from '@daih/ui';

export interface AdminSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationSections = [
    {
      title: 'Operations & Hub',
      items: [
        {
          name: 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
          description: 'Live floor pulse & overview',
          badge: 'Live',
        },
        {
          name: 'Operations',
          href: '/operations',
          icon: Layers,
          description: 'Desks, rooms, holds & capacity',
          subItems: [
            { name: 'Resource Capacity Pools', href: '/operations#pools' },
            { name: 'Active Holds & Overrides', href: '/operations#holds' },
          ],
        },
        {
          name: 'Customers',
          href: '/customers',
          icon: Users,
          description: 'Member directory & Client IDs',
          badge: '1.2k',
          subItems: [
            { name: 'Member Directory', href: '/customers#directory' },
            { name: 'Membership Tiers', href: '/customers#tiers' },
          ],
        },
      ],
    },
    {
      title: 'Finance & Commerce',
      items: [
        {
          name: 'Finance',
          href: '/finance',
          icon: Receipt,
          description: 'Paystack ledger & settlements',
          subItems: [
            { name: 'Revenue Summary', href: '/finance#summary' },
            { name: 'Live Transaction Log', href: '/finance#transactions' },
          ],
        },
      ],
    },
    {
      title: 'Governance & Analytics',
      items: [
        {
          name: 'Reports',
          href: '/reports',
          icon: BarChart3,
          description: 'Footfall & space analytics',
          subItems: [
            { name: 'Space Utilisation', href: '/reports#utilisation' },
            { name: 'Pre-Generated Reports', href: '/reports#exports' },
          ],
        },
        {
          name: 'Staff Management',
          href: '/staff',
          icon: UserCheck,
          description: 'Team directory & RBAC roles',
          badge: 'RBAC',
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: Settings,
          description: 'Workspace & hub preferences',
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside
      className={cn(
        'fixed lg:sticky top-[65px] left-0 h-[calc(100vh-65px)] w-64 lg:w-72 bg-white border-r border-[#EBE7F5] z-40 overflow-y-auto flex flex-col justify-between transition-transform duration-300 shadow-xs shrink-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="p-4 sm:p-5 flex-1">
        {/* Navigation Categories */}
        <div className="space-y-6">
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{section.title}</span>
              </div>

              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);

                  return (
                    <div key={item.href} className="space-y-0.5">
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all group relative',
                          isActive
                            ? 'bg-[#392271] text-white font-bold shadow-sm'
                            : 'text-slate-600 hover:bg-[#F8F9FA] hover:text-[#23055c]'
                        )}
                      >
                        {/* Left Active Accent Bar */}
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#a48de2] rounded-r-full" />
                        )}

                        <div
                          className={cn(
                            'p-1.5 rounded-lg shrink-0 transition-colors',
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-purple-50 text-[#23055c] group-hover:bg-purple-100'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  'text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0',
                                  isActive
                                    ? 'bg-white/25 text-white'
                                    : 'bg-purple-100 text-[#23055c]'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              'text-[10px] truncate font-normal',
                              isActive ? 'text-white/75' : 'text-slate-400'
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                      </Link>

                      {/* Sub-items (if active or expanded) */}
                      {isActive && item.subItems && item.subItems.length > 0 && (
                        <div className="pl-9 pr-2 py-1 space-y-0.5 border-l-2 border-purple-100 ml-5 my-1">
                          {item.subItems.map((sub, subIdx) => (
                            <Link
                              key={subIdx}
                              href={sub.href}
                              onClick={onMobileClose}
                              className="flex items-center justify-between py-1 px-2 text-[11px] font-medium text-slate-500 hover:text-[#23055c] hover:bg-purple-50/50 rounded-md transition-colors"
                            >
                              <span>{sub.name}</span>
                              <ChevronRight className="w-3 h-3 text-slate-300" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* User Info & Sign Out Footer */}
      <div className="p-4 border-t border-[#EBE7F5] bg-[#F8F9FA] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#23055c] to-[#65519f] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {getInitials(user ? `${user.firstName} ${user.lastName}` : 'Admin')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-slate-900 truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Staff Administrator'}
            </div>
            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#23055c]" />
              <span>{user?.role || 'OPERATIONS_ADMIN'}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Sign Out of Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
