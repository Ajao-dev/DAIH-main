'use client';

import React, { useState, useEffect } from 'react';
import { Download, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onOpenWalkInModal?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOpenWalkInModal }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      const blob = new Blob(
        [
          JSON.stringify(
            {
              report: 'DAIH Workspace Operations Pulse',
              timestamp: new Date().toISOString(),
              totalRevenueMtd: '$45,280',
              activeBookings: 142,
              occupancy: '78%',
              newMembersWtd: 24,
              systemHealth: 'Core API: 99.9% Uptime, Stripe: Operational, Doors: 2 Offline',
            },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daih-operations-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }, 400);
  };

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Operations Overview
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Real-time pulse of DAIH Workspace facilities.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-accent-soft shadow-xs">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Live Updates Active
          </span>
        </div>

        {onOpenWalkInModal && (
          <button
            onClick={onOpenWalkInModal}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-3.5 py-2 rounded-DEFAULT shadow-xs hover:shadow transition-all active:opacity-90 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Pass</span>
          </button>
        )}

        <button
          onClick={handleDownload}
          title="Download Operations Report"
          className="bg-surface-container-lowest border border-accent-soft p-2 rounded-DEFAULT text-on-surface-variant hover:bg-surface-container transition-colors shadow-xs cursor-pointer flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">
            {downloading ? 'hourglass_top' : 'download'}
          </span>
        </button>
      </div>
    </div>
  );
};
