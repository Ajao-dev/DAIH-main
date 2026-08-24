import React from 'react';
import { QRDisplay } from '@daih/ui';

export default function QRPage() {
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

      <QRDisplay
        token="daih_sec_token_bk88219_tunde_adeleke"
        bookingRef="DAIH-BK-88219"
        customerName="Tunde Adeleke (DAIH-2026-0042)"
        validUntil="30 September 2026, 9:00 PM"
      />
    </div>
  );
}
