'use client';

import React from 'react';
import { CreditCard, RefreshCw, Receipt, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export interface FinanceKpiData {
  totalRevenue: string;
  revenueGrowth: string;
  isRevenueUp: boolean;
  mrr: string;
  mrrGrowth: string;
  isMrrUp: boolean;
  avgBookingValue: string;
  avgChange: string;
  isAvgUp: boolean;
  outstandingAmount: string;
  pendingCount: number;
}

interface FinanceKpiGridProps {
  data?: Partial<FinanceKpiData>;
  onViewPendingInvoices?: () => void;
}

export const FinanceKpiGrid: React.FC<FinanceKpiGridProps> = ({
  data,
  onViewPendingInvoices,
}) => {
  const kpi: FinanceKpiData = {
    totalRevenue: data?.totalRevenue || '₦45,230,000.00',
    revenueGrowth: data?.revenueGrowth || '12.5%',
    isRevenueUp: data?.isRevenueUp ?? true,
    mrr: data?.mrr || '₦28,500,000.00',
    mrrGrowth: data?.mrrGrowth || '5.2%',
    isMrrUp: data?.isMrrUp ?? true,
    avgBookingValue: data?.avgBookingValue || '₦142,500.00',
    avgChange: data?.avgChange || '1.1%',
    isAvgUp: data?.isAvgUp ?? false,
    outstandingAmount: data?.outstandingAmount || '₦3,450,000.00',
    pendingCount: data?.pendingCount || 12,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Revenue */}
      <div className="bg-white/80 backdrop-blur-md border border-[#EBE7F5] p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
              {kpi.totalRevenue}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#392271]/10 flex items-center justify-center text-[#23055c] shrink-0">
            <CreditCard className="w-5 h-5 text-[#23055c]" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <TrendingUp className="w-3.5 h-3.5" />
            {kpi.revenueGrowth}
          </span>
          <span className="text-slate-400">vs last 30 days</span>
        </div>
      </div>

      {/* 2. Monthly Recurring Revenue (MRR) */}
      <div className="bg-white/80 backdrop-blur-md border border-[#EBE7F5] p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Recurring (MRR)
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
              {kpi.mrr}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#bfa9fe]/20 flex items-center justify-center text-[#65519f] shrink-0">
            <RefreshCw className="w-5 h-5 text-[#65519f]" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <TrendingUp className="w-3.5 h-3.5" />
            {kpi.mrrGrowth}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      </div>

      {/* 3. Average Booking Value */}
      <div className="bg-white/80 backdrop-blur-md border border-[#EBE7F5] p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Booking Value
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
              {kpi.avgBookingValue}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100/50 flex items-center justify-center text-amber-800 shrink-0">
            <Receipt className="w-5 h-5 text-amber-800" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
            <TrendingDown className="w-3.5 h-3.5" />
            {kpi.avgChange}
          </span>
          <span className="text-slate-400">vs last 30 days</span>
        </div>
      </div>

      {/* 4. Outstanding / Pending Invoices */}
      <div className="bg-white/80 backdrop-blur-md border border-[#EBE7F5] p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Outstanding Invoices
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
              {kpi.outstandingAmount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-slate-500 font-medium">
            {kpi.pendingCount} pending invoices
          </span>
          <button
            onClick={onViewPendingInvoices}
            className="text-[#23055c] hover:underline font-bold cursor-pointer"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
};
