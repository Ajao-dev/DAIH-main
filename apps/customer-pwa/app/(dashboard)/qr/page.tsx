'use client';

import React, { useState, useEffect } from 'react';
import { QRDisplay } from '@daih/ui';
import { api, useAuth } from '@daih/api-client';
import { BookingSummary, BookingState } from '@daih/types';
import { ShieldAlert, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function QRPage() {
  const { user } = useAuth();
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.bookings
      .getMyBookings()
      .then((bookings) => {
        if (!isMounted) return;
        const validPassBooking = (bookings || []).find(
          (b) =>
            [BookingState.CONFIRMED, BookingState.ACTIVE, BookingState.CHECKED_IN].includes(b.state) &&
            Boolean(b.qrToken)
        );
        setConfirmedBooking(validPassBooking || null);
      })
      .catch((err) => {
        console.warn('Could not fetch active bookings for QR pass:', err?.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Digital Access Pass
        </h1>
        <p className="text-xs text-slate-500">
          Scan this QR code at DAIH Reception or Security Gate
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#23055c]" />
          <span className="text-xs font-semibold">Loading access pass...</span>
        </div>
      ) : confirmedBooking && confirmedBooking.qrToken ? (
        <QRDisplay
          token={confirmedBooking.qrToken}
          bookingRef={confirmedBooking.reference}
          customerName={`${confirmedBooking.customerName}${user?.clientId ? ` (${user.clientId})` : ''}`}
          validUntil={new Date(confirmedBooking.endTime).toLocaleString('en-NG', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">No Confirmed Active Access Pass</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              QR access passes are automatically generated once payment for your booking is confirmed.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-[#23055c] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a0446] transition-all"
          >
            <Calendar className="h-4 w-4" />
            <span>Book a Workspace</span>
          </Link>
        </div>
      )}
    </div>
  );
}
