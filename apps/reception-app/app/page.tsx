'use client';

import React, { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Search, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { Card, Button, Input, StatusBadge } from '@daih/ui';
import { BookingState } from '@daih/types';

export default function ReceptionScannerPage() {
  const [scanInput, setScanInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setVerificationResult({
        valid: true,
        reference: 'DAIH-BK-88219',
        customerName: 'Tunde Adeleke',
        clientId: 'DAIH-2026-0042',
        resource: 'Hot Desk - Ground Floor Lounge',
        validUntil: '30 Sep 2026, 9:00 PM',
        status: BookingState.CONFIRMED,
      });
    }, 400);
  };

  const handleCheckIn = () => {
    setVerificationResult((prev: any) => ({
      ...prev,
      status: BookingState.CHECKED_IN,
      checkedInAt: new Date().toLocaleTimeString(),
    }));
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-lg">
            R
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Reception & Security Terminal</h1>
            <p className="text-xs text-slate-400">Terminal ID: REC-GATE-01 · Officer On Duty</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Scanner Ready
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Scanner Column */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Scan Access QR Code
            </h2>

            <div className="h-56 bg-slate-950 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-6 text-center">
              <QrCode className="h-16 w-16 text-slate-600 mb-3 animate-pulse" />
              <p className="text-xs font-medium text-slate-300">Point scanner hardware at member pass</p>
              <p className="text-[11px] text-slate-500 mt-1">or enter reference token below</p>
            </div>

            <form onSubmit={handleScan} className="flex gap-2">
              <input
                type="text"
                placeholder="Scan / Type DAIH-BK-88219..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={isScanning}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                {isScanning ? 'Verifying...' : 'Validate'}
              </button>
            </form>
          </div>
        </div>

        {/* Verification Result Column */}
        <div className="md:col-span-6">
          {verificationResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-sm text-emerald-400">Valid Access Pass</span>
                </div>
                <StatusBadge status={verificationResult.status} />
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-slate-500">Member Name</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {verificationResult.customerName}
                  </p>
                  <p className="text-slate-400 font-mono">{verificationResult.clientId}</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl space-y-2 border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Workspace</span>
                    <span className="font-semibold text-white">{verificationResult.resource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booking Ref</span>
                    <span className="font-mono text-amber-400 font-semibold">{verificationResult.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pass Expiry</span>
                    <span className="font-medium text-slate-300">{verificationResult.validUntil}</span>
                  </div>
                </div>

                {verificationResult.checkedInAt && (
                  <p className="text-emerald-400 text-center font-semibold text-xs">
                    ✓ Checked in at {verificationResult.checkedInAt}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCheckIn}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Confirm Check-In
                </button>
                <button
                  onClick={() => setVerificationResult(null)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-slate-700 mb-3" />
              <p className="text-xs font-medium text-slate-400">No pass scanned</p>
              <p className="text-[11px] text-slate-600 mt-1">Scanned credentials will appear here instantly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
