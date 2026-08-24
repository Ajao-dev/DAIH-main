"use client";

import React from "react";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";

interface UpcomingBookingCardProps {
  title?: string;
  time?: string;
  location?: string;
  detailsHref?: string;
  badge?: string;
  badgeColor?: "purple" | "emerald" | "amber";
}

export const UpcomingBookingCard: React.FC<UpcomingBookingCardProps> = ({
  title = "Glass Meeting Room A",
  time = "Today, 2:00 PM - 3:00 PM",
  location = "Floor 2 · Executive Innovation Wing",
  detailsHref = "/bookings",
  badge,
  badgeColor = "purple",
}) => {
  return (
    <div className="bg-white border border-purple-100/90 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-purple-200">
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2.5">
          <h4 className="text-base sm:text-lg font-bold text-[#181c20] tracking-tight">
            {title}
          </h4>
          {badge && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                badgeColor === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  : badgeColor === "amber"
                    ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                    : "bg-purple-50 text-[#23055c] border border-purple-100"
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#23055c]" />
            {time}
          </span>
          {location && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {location}
            </span>
          )}
        </div>
      </div>

      <Link
        href={detailsHref}
        className="px-6 py-2.5 bg-transparent border border-[#23055c] text-[#23055c] hover:bg-[#23055c] hover:text-white font-bold text-xs rounded-xl transition-all text-center whitespace-nowrap cursor-pointer shadow-xs"
      >
        View Details
      </Link>
    </div>
  );
};
