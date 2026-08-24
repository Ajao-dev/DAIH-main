'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api, useAuth } from '@daih/api-client';
import { BookingSummary, BookingState } from '@daih/types';
import {
  Calendar, Clock, QrCode, XCircle, AlertCircle, CheckCircle2,
  Building2, MapPin, ArrowRight, Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';

function formatDate(isoStr: string) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(isoStr: string) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const fetchBookings = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await api.bookings.getMyBookings({ forceRefresh });
      setBookings(data);
    } catch (err) {
      console.warn('Could not load bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();

    const handleFocus = () => {
      fetchBookings(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    setActionLoading(true);
    try {
      await api.bookings.cancelBooking(bookingId, cancelReason || 'Customer requested cancellation');
      setCancellingId(null);
      setCancelReason('');
      await fetchBookings();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const activeBookings = bookings.filter((b) =>
    [BookingState.CONFIRMED, BookingState.HELD, BookingState.PENDING_PAYMENT, BookingState.ACTIVE, BookingState.CHECKED_IN].includes(
      b.state as BookingState
    )
  );

  const historicalBookings = bookings.filter(
    (b) => ![BookingState.CONFIRMED, BookingState.HELD, BookingState.PENDING_PAYMENT, BookingState.ACTIVE, BookingState.CHECKED_IN].includes(
      b.state as BookingState
    )
  );

  const displayedBookings = activeTab === 'active' ? activeBookings : historicalBookings;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE7F5] pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bookings &amp; Passes</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your active workspace reservations and access passes.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchBookings(true)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/book"
            className="bg-[#23055c] hover:bg-[#392271] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Book New Space</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'active' ? 'text-[#23055c]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Active Passes ({activeBookings.length})
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#23055c]" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'history' ? 'text-[#23055c]' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Past &amp; Cancelled ({historicalBookings.length})
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#23055c]" />}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#23055c] mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading your reservations...</p>
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === 'active' ? 'No Active Bookings' : 'No Past Bookings'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'active'
                ? 'You do not have any active space reservations. Reserve your spot today!'
                : 'No past booking records found.'}
            </p>
          </div>
          {activeTab === 'active' && (
            <Link
              href="/book"
              className="inline-block bg-[#23055c] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#392271] transition-all"
            >
              Explore Spaces
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedBookings.map((b) => {
            const isConfirmed = b.state === BookingState.CONFIRMED || b.state === BookingState.CHECKED_IN;
            const isHeld = b.state === BookingState.HELD || b.state === BookingState.PENDING_PAYMENT;
            const isCancelled = b.state === BookingState.CANCELLED;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-[#EBE7F5] shadow-xs flex flex-col justify-between space-y-5 hover:border-[#23055c]/30 transition-all"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">{b.reference}</span>
                      <h3 className="text-base font-bold text-slate-900">{b.resourceName}</h3>
                    </div>
                    <div>

                    </div>
                  </div>

                  {/* Dates & Location */}
                  <div className="bg-[#faf9ff] rounded-xl p-3.5 border border-[#EBE7F5] space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#23055c] shrink-0" />
                      <span>
                        {formatDate(b.startTime)} &mdash; {formatDate(b.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#23055c] shrink-0" />
                      <span>
                        {formatTime(b.startTime)} &mdash; {formatTime(b.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#EBE7F5]/70 font-semibold">
                      <span className="text-slate-500">Amount</span>
                      <span className="text-[#23055c]">
                        {b.currency} {Number(b.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {isConfirmed && (
                    <Link
                      href="/qr"
                      className="flex-1 bg-[#23055c] hover:bg-[#392271] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>View QR Pass</span>
                    </Link>
                  )}
                  {isHeld && (
                    <Link
                      href={`/book/${b.resourceId}`}
                      className="flex-1 bg-[#23055c] hover:bg-[#392271] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Complete Checkout</span>
                    </Link>
                  )}
                  {(isConfirmed || isHeld) && (
                    <button
                      onClick={() => setCancellingId(b.id)}
                      className="px-3 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors"
                      title="Cancel Booking"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">Cancel Booking</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this reservation? The slot will immediately be released for other members.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Reason for Cancellation (Optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Change of schedule, emergency"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#23055c]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setCancellingId(null);
                  setCancelReason('');
                }}
                disabled={actionLoading}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(cancellingId)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>Confirm Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
