"use client";

import React from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";

interface ActiveSubscriptionCardProps {
  planName?: string;
  qrHref?: string;
  billingCycle?: string;
}

export const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({
  planName = "Executive Elite",
  qrHref = "/qr",
  billingCycle = "Monthly Unlimited · Renews 30 Sept 2026",
}) => {
  return (
    <div className="bg-white border border-purple-100/90 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-purple-200">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <h4 className="text-xl sm:text-2xl font-extrabold text-[#181c20] tracking-tight">
            {planName}
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">{billingCycle}</p>
      </div>

      <Link
        href={qrHref}
        className="inline-flex items-center justify-center gap-2 bg-[#23055c] hover:bg-[#392271] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
      >
        <QrCode className="w-4 h-4" />
        View QR Code
      </Link>
    </div>
  );
};
