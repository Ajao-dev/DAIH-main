"use client";

import React from "react";
import { DoorOpen, Coffee, Laptop } from "lucide-react";

export const RecentActivityCard: React.FC = () => {
  const activities = [
    {
      id: "1",
      title: "Main Entrance Access",
      time: "Today, 8:45 AM",
      icon: DoorOpen,
      amount: null,
    },
    {
      id: "2",
      title: "Barista Bar Purchase",
      time: "Today, 8:30 AM",
      icon: Coffee,
      amount: "-₦4,500",
    },
    {
      id: "3",
      title: "Hot Desk Reservation",
      time: "Yesterday, 9:00 AM",
      icon: Laptop,
      amount: null,
    },
  ];

  return (
    <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Recent Activity
      </h3>

      <div className="space-y-3.5">
        {activities.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#23055c] flex items-center justify-center shrink-0 mt-0.5 border border-purple-100/60">
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#181c20]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.time}
                  </p>
                </div>
                {item.amount && (
                  <span className="text-xs font-bold text-rose-600">
                    {item.amount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
