'use client';

import React, { useState } from 'react';

export const RevenueTrendChart: React.FC = () => {
  const [period, setPeriod] = useState<'Daily' | 'Weekly'>('Daily');

  const dailyPoints = [
    { label: 'Oct 1', value: '₦850k', x: 0, y: 80 },
    { label: 'Oct 8', value: '₦1.4m', x: 30, y: 50 },
    { label: 'Oct 15', value: '₦1.8m', x: 60, y: 30 },
    { label: 'Oct 22', value: '₦1.6m', x: 80, y: 45 },
    { label: 'Oct 29', value: '₦2.1m', x: 100, y: 20 },
  ];

  const weeklyPoints = [
    { label: 'Wk 1', value: '₦6.2m', x: 0, y: 70 },
    { label: 'Wk 2', value: '₦9.8m', x: 33, y: 40 },
    { label: 'Wk 3', value: '₦11.4m', x: 66, y: 25 },
    { label: 'Wk 4', value: '₦14.5m', x: 100, y: 15 },
  ];

  const points = period === 'Daily' ? dailyPoints : weeklyPoints;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EBE7F5] rounded-xl p-6 flex flex-col h-[400px] shadow-xs">
      {/* Header with Title and Period Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900">Revenue Trend</h3>
        <div className="flex gap-1.5 bg-[#F8F9FA] p-1 rounded-lg border border-[#EBE7F5]">
          <button
            onClick={() => setPeriod('Daily')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              period === 'Daily'
                ? 'bg-[#392271] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('Weekly')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              period === 'Weekly'
                ? 'bg-[#392271] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="flex-1 relative w-full h-full border-b border-l border-[#EBE7F5] mt-4 ml-8 mr-2">
        {/* Y Axis Labels */}
        <div className="absolute -left-9 top-0 bottom-0 flex flex-col justify-between text-[11px] font-semibold text-slate-400 h-full pb-6">
          <span>₦2.5M</span>
          <span>₦2.0M</span>
          <span>₦1.5M</span>
          <span>₦1.0M</span>
          <span>₦0</span>
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          <div className="w-full border-t border-slate-100 h-0"></div>
          <div className="w-full border-t border-slate-100 h-0"></div>
          <div className="w-full border-t border-slate-100 h-0"></div>
          <div className="w-full border-t border-slate-100 h-0"></div>
        </div>

        {/* SVG Area & Line Path */}
        <svg
          className="absolute inset-0 w-full h-[calc(100%-24px)] overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="revenueChartGrad" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#392271" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#392271" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d="M0,80 C10,70 20,90 30,50 C40,10 50,40 60,30 C70,20 80,60 90,40 C95,30 100,20 100,20 L100,100 L0,100 Z"
            fill="url(#revenueChartGrad)"
          />

          {/* Stroke Line */}
          <path
            d="M0,80 C10,70 20,90 30,50 C40,10 50,40 60,30 C70,20 80,60 90,40 C95,30 100,20 100,20"
            fill="none"
            stroke="#392271"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data Points */}
          <circle cx="30" cy="50" fill="#ffffff" r="4" stroke="#392271" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <circle cx="60" cy="30" fill="#ffffff" r="4" stroke="#392271" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <circle cx="90" cy="40" fill="#ffffff" r="4" stroke="#392271" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <circle cx="100" cy="20" fill="#ffffff" r="4" stroke="#392271" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* X Axis Labels */}
        <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[11px] font-semibold text-slate-400">
          {points.map((p) => (
            <span key={p.label}>{p.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
