import React from 'react';
import Link from 'next/link';
import { Card, StatusBadge } from '@daih/ui';
import { BookingState } from '@daih/types';
import { QrCode, ArrowRight } from 'lucide-react';

export default function BookingsPage() {
  const bookings = [
    {
      id: 'bk_sample_01',
      reference: 'DAIH-BK-88219',
      resource: 'Hot Desk - Dedicated Pod A',
      location: 'Ground Floor, Innovation Lounge',
      date: '19 Aug 2026 - 30 Sep 2026',
      amount: '₦45,000',
      status: BookingState.CONFIRMED,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Workspace Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your past and active reservations
          </p>
        </div>
        <Link
          href="/book/hot-desk"
          className="px-4 py-2 bg-[#1f3a68] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#182e52] transition"
        >
          Book Space
        </Link>
      </div>

      <div className="space-y-4">
        {bookings.map((b) => (
          <Card key={b.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#1f3a68]">{b.reference}</span>
                  <StatusBadge status={b.status} />
                </div>
                <h3 className="font-bold text-base text-slate-900">{b.resource}</h3>
                <p className="text-xs text-slate-500">{b.location} · {b.date}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total Paid</p>
                  <p className="font-extrabold text-sm text-slate-900">{b.amount}</p>
                </div>
                <Link
                  href="/qr"
                  className="px-3.5 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  <QrCode className="h-4 w-4" /> QR Pass
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
