"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Shield,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@daih/api-client";

export interface AdminHeaderProps {
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isMobileOpen,
  onMobileToggle,
  isCollapsed,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const getPageInfo = (path: string): { title: string; category: string } => {
    if (path === "/")
      return { title: "Operations Dashboard", category: "Overview" };
    if (path.startsWith("/bookings"))
      return { title: "Booking Engine & Reservations", category: "Operations" };
    if (path.startsWith("/operations"))
      return { title: "Hub Operations & Resources", category: "Operations" };
    if (path.startsWith("/customers"))
      return { title: "Member Directory & Customers", category: "Operations" };
    if (path.startsWith("/finance"))
      return { title: "Finance & Payment Reconciliation", category: "Finance" };
    if (path.startsWith("/reports"))
      return {
        title: "Utilisation & Analytics Reports",
        category: "Governance",
      };
    if (path.startsWith("/staff"))
      return { title: "Staff & RBAC Role Management", category: "Governance" };
    if (path.startsWith("/settings"))
      return { title: "Workspace & System Settings", category: "Governance" };
    if (path.startsWith("/login"))
      return { title: "Admin Authentication", category: "Auth" };
    return { title: "Admin Console", category: "Portal" };
  };

  const pageInfo = getPageInfo(pathname);

  return (
    <header className="bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 border-b border-[#EBE7F5] shadow-xs">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMobileToggle}
          className="lg:hidden text-[#23055c] p-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center text-[#23055c] p-2 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#23055c]" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[#23055c]" />
          )}
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/images/logo.png"
            alt="DAIH Workspace Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-extrabold text-base sm:text-lg text-[#23055c] tracking-tight hidden sm:inline-block">
            DAIH Admin
          </span>
        </Link>

        {/* Current Active Page Breadcrumb / Title */}
        <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-4 py-0.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {pageInfo.category}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-800">
            {pageInfo.title}
          </span>
        </div>
      </div>

      {/* Right: Status & Quick Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live Operations Indicator */}
        <div className="flex items-center gap-2 bg-[#F8F9FA] px-3 py-1.5 rounded-full border border-[#EBE7F5] text-xs font-semibold text-slate-700 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="hidden xs:inline">Live Operations Active</span>
          <span className="xs:hidden">Live</span>
        </div>

        {/* Customer PWA Quick Link */}
        <a
          href={
            process.env.NEXT_PUBLIC_CUSTOMER_PWA_URL || "http://localhost:3001"
          }
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors shadow-xs"
          title="Open Customer PWA"
        >
          <span>Customer PWA</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* User Role Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[#23055c] text-[11px] font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>{user?.role || "OPERATIONS_ADMIN"}</span>
        </div>
      </div>
    </header>
  );
};
