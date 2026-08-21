'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@daih/ui';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';

export default function BookResourcePage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(600); // 10-minute hold timer
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {confirmed ? (
          <Card className="p-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Booking Confirmed!</h2>
              <p className="text-xs text-slate-500">
                Payment successful via Paystack. Your access pass is active.
              </p>
              <p className="font-mono text-sm font-bold text-[#1f3a68]">
                Ref: DAIH-BK-{Math.floor(10000 + Math.random() * 90000)}
              </p>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push('/qr')}
            >
              View Access QR Pass
            </Button>
          </Card>
        ) : (
          <Card className="p-8 space-y-6">
            {/* Hold Banner */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <Clock className="h-4 w-4 text-amber-700 animate-pulse" />
                <span>Space Reserved on Hold:</span>
              </div>
              <span className="font-mono font-bold text-sm text-amber-800">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900">Confirm Reservation</h1>
              <p className="text-xs text-slate-500">Hot Desk - Monthly Unlimited Pass</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-900">Ground Floor Lounge</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-900">1 Month (30 Days)</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                <span className="text-slate-900">Total Amount</span>
                <span className="text-[#1f3a68]">₦45,000</span>
              </div>
            </div>

            <Button
              variant="amber"
              className="w-full"
              isLoading={isProcessing}
              onClick={handleCheckout}
            >
              <CreditCard className="h-4 w-4 mr-2" /> Pay ₦45,000 via Paystack
            </Button>

            <p className="text-[11px] text-center text-slate-400">
              Secured with Paystack 256-bit encryption. Instant activation upon payment.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
