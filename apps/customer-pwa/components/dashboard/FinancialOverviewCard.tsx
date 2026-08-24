'use client';

import React from 'react';

interface FinancialOverviewCardProps {
  totalPaid?: string;
  label?: string;
}

export const FinancialOverviewCard: React.FC<FinancialOverviewCardProps> = ({
  totalPaid = '₦45,000.00',
  label = 'Total Invoices Paid',
}) => {
  return (
    <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-6 space-y-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Financial Overview
      </h3>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-3xl font-extrabold text-[#23055c] tracking-tight leading-tight">
        {totalPaid}
      </p>
    </div>
  );
};
