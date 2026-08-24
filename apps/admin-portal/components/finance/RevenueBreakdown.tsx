'use client';

import React from 'react';

export interface BreakdownItem {
  name: string;
  amount: string;
  percentage: number;
  colorClass: string;
  dotColor: string;
}

interface RevenueBreakdownProps {
  items?: BreakdownItem[];
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ items }) => {
  const defaultItems: BreakdownItem[] = [
    {
      name: 'Dedicated Desks',
      amount: '₦18,400,000',
      percentage: 45,
      colorClass: 'bg-[#392271]',
      dotColor: '#392271',
    },
    {
      name: 'Meeting Rooms & Halls',
      amount: '₦12,200,000',
      percentage: 30,
      colorClass: 'bg-[#65519f]',
      dotColor: '#65519f',
    },
    {
      name: 'Podcast & Media Studios',
      amount: '₦8,150,000',
      percentage: 15,
      colorClass: 'bg-[#301700]',
      dotColor: '#301700',
    },
    {
      name: 'Private Office Suites',
      amount: '₦6,480,000',
      percentage: 10,
      colorClass: 'bg-[#0032d0]',
      dotColor: '#0032d0',
    },
  ];

  const list = items && items.length > 0 ? items : defaultItems;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EBE7F5] rounded-xl p-6 flex flex-col h-[400px] shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-6">Revenue by Resource</h3>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {list.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.dotColor }}
                />
                {item.name}
              </span>
              <span className="font-bold text-slate-900">{item.amount}</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${item.colorClass}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-1 text-right font-medium">
              {item.percentage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
