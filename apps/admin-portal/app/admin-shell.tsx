'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@daih/api-client';
import { AdminHeader, AdminSidebar } from '../components/navigation';
import { Loader2 } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/login' || pathname.startsWith('/login');

  // Enforce authentication on all protected console routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // If on login page, render children directly without any admin navbar / header / sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#ebeef3]">{children}</div>;
  }

  // If session is resolving or unauthenticated on protected page, show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#23055c] flex items-center justify-center shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#23055c]" />
          </div>
          <span className="text-xs font-bold text-slate-500 tracking-tight">
            Authenticating Admin Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9ff] text-[#181c20] antialiased flex flex-col min-h-screen">
      {/* Top Header Navbar - Authenticated Users Only */}
      <AdminHeader
        isMobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Main Layout (Left Navigation Sidebar + Main Content) */}
      <div className="flex flex-1 pt-[65px] relative">
        {/* Left Navigation Sidebar - Authenticated Users Only */}
        <AdminSidebar
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 top-[65px]"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#f7f9ff] min-w-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Shared Console Footer */}
      <footer className="bg-[#23055c] text-white w-full px-4 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto border-t border-[#392271] z-10 relative text-xs">
        <div className="font-bold tracking-tight text-sm">
          DAIH Workspace
        </div>
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-slate-300 text-xs">
          <span>Operations Console</span>
          <span>•</span>
          <span>Paystack Sandbox Connected</span>
          <span>•</span>
          <span>Audit Logging Active</span>
        </nav>
        <div className="text-slate-400 text-xs">
          © 2026 DAIH Hub. Internal Admin Access Only.
        </div>
      </footer>
    </div>
  );
}
