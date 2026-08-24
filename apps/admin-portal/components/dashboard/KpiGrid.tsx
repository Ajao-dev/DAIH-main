"use client";

import React from "react";

export const KpiGrid: React.FC = () => {
  return (
    <div className="space-y-6 mb-8">
      {/* 1. Visitor Telemetry Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-label-md text-xs font-bold text-outline uppercase tracking-wider">
            Visitor Flow & Loyalty Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Daily Visitors */}
          <div className="bg-surface-container-lowest p-5 rounded-lg border border-accent-soft elevation-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-primary/10 rounded-DEFAULT text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">today</span>
              </div>
              <span className="font-label-sm text-label-sm text-surface-tint bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                +5%
              </span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Daily Visitors
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-1">
                142
              </p>
              <p className="text-[11px] text-on-surface-variant/80 mt-1 font-medium">
                Logged on-site today
              </p>
            </div>
          </div>

          {/* Weekly Visitors */}
          <div className="bg-surface-container-lowest p-5 rounded-lg border border-accent-soft elevation-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-secondary/10 rounded-DEFAULT text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">date_range</span>
              </div>
              <span className="font-label-sm text-label-sm text-surface-tint bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                +14%
              </span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Weekly Visitors
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-1">
                894
              </p>
              <p className="text-[11px] text-on-surface-variant/80 mt-1 font-medium">
                Monday to Sunday tally
              </p>
            </div>
          </div>

          {/* Monthly Visitors */}
          <div className="bg-surface-container-lowest p-5 rounded-lg border border-accent-soft elevation-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-primary-container/10 rounded-DEFAULT text-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-surface-tint bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                +18%
              </span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Monthly Visitors
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-1">
                3,420
              </p>
              <p className="text-[11px] text-on-surface-variant/80 mt-1 font-medium">
                Month-to-date footfall
              </p>
            </div>
          </div>

          {/* Repeat Customers */}
          <div className="bg-surface-container-lowest p-5 rounded-lg border border-accent-soft elevation-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-[#10b981]/10 rounded-DEFAULT text-[#10b981] flex items-center justify-center">
                <span className="material-symbols-outlined">sync</span>
              </div>
              <span className="font-label-sm text-label-sm text-[#065f46] bg-[#d1fae5] px-2 py-0.5 rounded-full font-semibold">
                High Retention
              </span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Repeat Customers
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-1">
                68%
              </p>
              <p className="text-[11px] text-on-surface-variant/80 mt-1 font-medium">
                246 active returnee members
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operations Yield, Occupancy & Peak Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Revenue */}
        <div className="bg-surface-container-lowest p-5 rounded-lg border border-accent-soft elevation-1 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 rounded-DEFAULT text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">attach_money</span>
            </div>
            <span className="font-label-sm text-label-sm text-surface-tint bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
              +12.5% MTD
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Total Revenue (MTD)
            </p>
            <p className="font-headline-sm text-headline-sm text-on-surface mt-1">
              $45,280
            </p>
            <p className="text-[11px] text-on-surface-variant/80 mt-1 font-medium">
              Today: $1,450 · Paystack settlements active
            </p>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-surface-container-lowest p-5 rounded-lg border border-accent-soft elevation-1 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-on-tertiary-container/10 rounded-DEFAULT text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <span className="font-label-sm text-label-sm text-outline bg-surface-variant px-2 py-0.5 rounded-full font-semibold">
              -2% vs peak
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Occupancy Rate
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="font-headline-sm text-headline-sm text-on-surface">
                78%
              </p>
              <span className="text-xs text-on-surface-variant font-mono">
                78 / 104 Seats
              </span>
            </div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-on-tertiary-container h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: "78%" }}
              />
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-surface-container-lowest p-5 rounded-lg border border-accent-soft elevation-1 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-secondary/10 rounded-DEFAULT text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-semibold">
              Peak: 1:15 PM
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Peak Hours Window
            </p>
            <p className="font-headline-sm text-[20px] font-bold text-on-surface mt-1">
              11:00 AM – 03:30 PM
            </p>
            <p className="text-[11px] text-on-surface-variant/80 mt-1 font-medium">
              94% capacity surge during midday hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
