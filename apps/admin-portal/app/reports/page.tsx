'use client';

import React from 'react';
import { Card, Button } from '@daih/ui';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
            Utilisation & Analytics Reports
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Aggregated space utilisation metrics, peak demand hours, and financial reconciliations
          </p>
        </div>
        <Button variant="primary" size="sm" className="bg-[#23055c] hover:bg-[#392271] text-white">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download Executive Summary (PDF)
        </Button>
      </div>

      <div id="utilisation" className="grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-mt-20">
        <Card className="p-5 border border-accent-soft bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant font-medium">Average Daily Footfall</p>
          <p className="text-3xl font-extrabold text-on-surface mt-2">142</p>
          <p className="text-[11px] text-[#065f46] font-semibold mt-1">+18% vs last month</p>
        </Card>
        <Card className="p-5 border border-accent-soft bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant font-medium">Peak Demand Window</p>
          <p className="text-3xl font-extrabold text-[#23055c] mt-2">11 AM – 4 PM</p>
          <p className="text-[11px] text-on-surface-variant mt-1">Tuesdays & Thursdays</p>
        </Card>
        <Card className="p-5 border border-accent-soft bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant font-medium">Auditorium Utilisation</p>
          <p className="text-3xl font-extrabold text-on-tertiary-container mt-2">45%</p>
          <p className="text-[11px] text-on-surface-variant mt-1">8 Days booked this month</p>
        </Card>
      </div>

      <Card id="exports" className="p-6 space-y-4 border border-accent-soft bg-surface-container-lowest scroll-mt-20">
        <h3 className="font-bold text-sm text-on-surface">Available Pre-Generated Reports</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-workspace-surface rounded-xl border border-accent-soft">
            <div>
              <p className="font-bold text-xs text-on-surface">August 2026 Monthly Financial Reconciliation</p>
              <p className="text-[11px] text-on-surface-variant">Includes Paystack transaction fees, refunds, and net settlements</p>
            </div>
            <Button variant="outline" size="sm">Export CSV</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-workspace-surface rounded-xl border border-accent-soft">
            <div>
              <p className="font-bold text-xs text-on-surface">Q3 Workspace Occupancy & Density Audit</p>
              <p className="text-[11px] text-on-surface-variant">Hourly breakdown across Hot Desks, Dedicated Desks, and Suites</p>
            </div>
            <Button variant="outline" size="sm">Export CSV</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
