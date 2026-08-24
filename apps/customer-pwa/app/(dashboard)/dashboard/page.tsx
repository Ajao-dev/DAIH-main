"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@daih/api-client";
import {
  ActiveSubscriptionCard,
  UpcomingBookingCard,
  FinancialOverviewCard,
  WifiAccessCard,
  RecentActivityCard,
} from "../../../components/dashboard";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";

export default function MemberDashboardPage() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = user?.firstName || "Member";

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-50 via-white to-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#181c20] tracking-tight">
            {getGreeting()}, {firstName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Welcome to your DAIH workspace overview.
          </p>
        </div>

        <Link
          href="/book"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#23055c] hover:bg-[#35089e] text-white text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Book a Workspace
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* Main Grid: 8-Column Main Content & 4-Column Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left / Main Content Column */}
        <div className="col-span-1 md:col-span-8 space-y-8">
          {/* Active Subscription Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Subscription
              </h3>
            </div>
            <ActiveSubscriptionCard
              planName="Executive Dedicated"
              billingCycle="Monthly Unlimited • Renews 30 Sept 2026"
              qrHref="/qr"
            />
          </section>

          {/* Upcoming Reservations Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Reservations
              </h3>
              <span className="text-xs font-semibold text-[#23055c]">
                1 Active
              </span>
            </div>
            <UpcomingBookingCard
              title="Private Office Suite"
              time="Today, 2:00 PM - 3:00 PM"
              location="Floor 2 • Executive Innovation Wing"
              detailsHref="/bookings"
              badge="Upcoming"
              badgeColor="purple"
            />
          </section>

          {/* Confirmed Bookings Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Confirmed Bookings
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                1 Scheduled
              </span>
            </div>
            <UpcomingBookingCard
              title="Dedicated Desk #14 - Pod B"
              time="Tomorrow, 9:00 AM - 6:00 PM"
              location="Ground Floor • Quiet Zone"
              detailsHref="/bookings"
              badge="Confirmed"
              badgeColor="emerald"
            />
          </section>
        </div>

        {/* Right / Sidebar Widgets Column */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          {/* Financial Overview */}
          <FinancialOverviewCard
            totalPaid="₦68,000.00"
            label="Total Invoices Paid"
          />

          {/* Member Wi-Fi Access Card */}
          <WifiAccessCard
            networkName="Innovation_5G"
            password="InnovateTogether2026"
          />

          {/* Recent Access & Facility Activity */}
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
