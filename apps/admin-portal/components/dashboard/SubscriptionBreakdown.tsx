"use client";

import React from "react";

export interface SubscriptionPlanMetric {
  name: string;
  count: number;
  percentage: number;
  revenueContribution: string;
  colorClass: string;
  barColorClass: string;
}

const subscriptionPlans: SubscriptionPlanMetric[] = [
  {
    name: "Daily Hot Desk Pass",
    count: 148,
    percentage: 42,
    revenueContribution: "$5,180",
    colorClass: "text-primary",
    barColorClass: "bg-primary-container",
  },
  {
    name: "Monthly Dedicated Desk",
    count: 58,
    percentage: 31,
    revenueContribution: "$26,100",
    colorClass: "text-secondary",
    barColorClass: "bg-secondary",
  },
  {
    name: "Weekly Flex Plan",
    count: 36,
    percentage: 16,
    revenueContribution: "$5,400",
    colorClass: "text-on-tertiary-container",
    barColorClass: "bg-on-tertiary-container",
  },
  {
    name: "Corporate & Private Suite",
    count: 8,
    percentage: 11,
    revenueContribution: "$8,600",
    colorClass: "text-[#10b981]",
    barColorClass: "bg-[#10b981]",
  },
];

export const SubscriptionBreakdown: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-accent-soft p-6 elevation-1 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-accent-soft">
          <div>
            <h3 className="font-headline-sm text-[20px] leading-[28px] font-semibold text-on-surface">
              Subscription Breakdown
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
              Active tier allocation & plan revenue share
            </p>
          </div>
          <span className="material-symbols-outlined text-outline">
            pie_chart
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3 rounded-full bg-surface-variant overflow-hidden flex mb-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              style={{ width: `${plan.percentage}%` }}
              className={`${plan.barColorClass} h-full transition-all duration-500`}
              title={`${plan.name}: ${plan.percentage}%`}
            />
          ))}
        </div>

        {/* Individual Plan List */}
        <div className="space-y-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className="p-3 bg-workspace-surface rounded-DEFAULT border border-accent-soft/60 flex items-center justify-between hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${plan.barColorClass}`}
                />
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                    {plan.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    {plan.count} active subscribers · {plan.revenueContribution}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {plan.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-accent-soft flex items-center justify-between text-xs text-on-surface-variant">
        <span className="font-medium">Total Active Subscriptions</span>
        <span className="font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
          250 Accounts
        </span>
      </div>
    </div>
  );
};
