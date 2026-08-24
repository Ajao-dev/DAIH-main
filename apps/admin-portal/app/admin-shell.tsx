"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@daih/api-client";
import { AdminHeader, AdminSidebar } from "../components/navigation";
import { AccessDeniedView } from "../components/auth/AccessDeniedView";
import { Loader2 } from "lucide-react";
import { Permission, ROLE_PERMISSIONS, UserRole } from "@daih/types";

interface RoutePermissionRule {
  pathPrefix: string;
  permission: Permission;
}

const ROUTE_RULES: RoutePermissionRule[] = [
  {
    pathPrefix: "/bookings",
    permission: Permission.BOOKINGS_READ_ALL,
  },
  {
    pathPrefix: "/staff",
    permission: Permission.USERS_MANAGE,
  },
  {
    pathPrefix: "/finance",
    permission: Permission.PAYMENTS_READ,
  },
  {
    pathPrefix: "/reports",
    permission: Permission.REPORTS_VIEW,
  },
  {
    pathPrefix: "/settings",
    permission: Permission.SYSTEM_CONFIG,
  },
  {
    pathPrefix: "/operations",
    permission: Permission.BOOKINGS_READ_ALL,
  },
  {
    pathPrefix: "/customers",
    permission: Permission.BOOKINGS_READ_ALL,
  },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/login" || pathname.startsWith("/login");
  const isAccessDeniedPage =
    pathname === "/access-denied" || pathname.startsWith("/access-denied");
  const isPublicPage = isLoginPage || isAccessDeniedPage;

  // Enforce authentication on all protected console routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPage) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isPublicPage, router]);

  // If on login page, render children directly without navbar / sidebar
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

  // Check RBAC permission for current route
  const matchingRule = ROUTE_RULES.find(
    (rule) =>
      pathname === rule.pathPrefix ||
      pathname.startsWith(`${rule.pathPrefix}/`),
  );

  const rawRole = (user?.role || "").toString().toUpperCase();
  const isSuperAdmin =
    rawRole === "SUPER_ADMIN" ||
    rawRole === "ADMIN" ||
    rawRole === UserRole.SUPER_ADMIN;

  const roleKey =
    Object.values(UserRole).find((r) => r.toUpperCase() === rawRole) ||
    (user?.role as UserRole);
  const userPermissions =
    roleKey && ROLE_PERMISSIONS[roleKey] ? ROLE_PERMISSIONS[roleKey] : [];

  const hasPermission =
    isSuperAdmin ||
    !matchingRule ||
    userPermissions.includes(matchingRule.permission) ||
    (pathname.startsWith("/bookings") &&
      (rawRole === "OPERATIONS_ADMIN" ||
        rawRole === "RECEPTION_OFFICER" ||
        userPermissions.includes(Permission.BOOKINGS_READ_ALL))) ||
    (pathname.startsWith("/operations") &&
      (rawRole === "OPERATIONS_ADMIN" ||
        userPermissions.includes(Permission.RESOURCES_MANAGE) ||
        userPermissions.includes(Permission.BOOKINGS_READ_ALL))) ||
    (pathname.startsWith("/customers") &&
      (rawRole === "OPERATIONS_ADMIN" ||
        userPermissions.includes(Permission.BOOKINGS_READ_ALL))) ||
    (pathname.startsWith("/finance") &&
      (rawRole === "FINANCE_OFFICER" ||
        userPermissions.includes(Permission.PAYMENTS_READ))) ||
    (pathname.startsWith("/reports") &&
      (rawRole === "MANAGEMENT_VIEWER" ||
        rawRole === "FINANCE_OFFICER" ||
        rawRole === "OPERATIONS_ADMIN" ||
        userPermissions.includes(Permission.REPORTS_VIEW))) ||
    (pathname.startsWith("/staff") &&
      (rawRole === "OPERATIONS_ADMIN" ||
        userPermissions.includes(Permission.USERS_MANAGE)));

  const isForbidden = !hasPermission;

  // If accessing a forbidden resource or on /access-denied, render standalone page without navbar
  if (isAccessDeniedPage || isForbidden) {
    return <AccessDeniedView />;
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
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Shared Console Footer */}
      <footer className="bg-[#23055c] text-white w-full px-4 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto border-t border-[#392271] z-10 relative text-xs">
        <div className="font-bold tracking-tight text-sm">DAIH Workspace</div>
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
