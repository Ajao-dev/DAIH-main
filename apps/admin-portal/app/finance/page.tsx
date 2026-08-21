import React from 'react';
import { Card, Button } from '@daih/ui';
import { Download, RefreshCw } from 'lucide-react';

export default function FinancePage() {
  const transactions = [
    {
      ref: 'DAIH-PAY-88219',
      customer: 'Tunde Adeleke (DAIH-2026-0042)',
      resource: 'Hot Desk - Monthly Unlimited',
      amount: '₦45,000',
      paystackRef: 'pstk_tr_993821094',
      date: '19 Aug 2026, 14:32',
      status: 'SUCCESSFUL',
    },
    {
      ref: 'DAIH-PAY-88218',
      customer: 'Grace Nwosu (DAIH-2026-0019)',
      resource: 'Dedicated Desk - Monthly',
      amount: '₦75,000',
      paystackRef: 'pstk_tr_882910394',
      date: '19 Aug 2026, 11:15',
      status: 'SUCCESSFUL',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Finance & Payment Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Paystack automated webhooks, settlement logs, and transaction audit
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reconcile Paystack
          </Button>
          <Button variant="primary" size="sm" className="bg-[#23055c] hover:bg-[#392271] text-white">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Ledger CSV
          </Button>
        </div>
      </div>

      <div id="summary" className="grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-mt-20">
        <Card className="p-5">
          <p className="text-xs text-slate-500 font-medium">Today’s Settled Revenue</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">₦120,000</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Webhook confirmed</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 font-medium">August Total Revenue</p>
          <p className="text-3xl font-extrabold text-[#1f3a68] mt-2">₦2,450,000</p>
          <p className="text-[11px] text-slate-400 mt-1">Across 42 subscriptions</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 font-medium">Pending Webhooks</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">0</p>
          <p className="text-[11px] text-slate-400 mt-1">All events processed idempotently</p>
        </Card>
      </div>

      <Card id="transactions" className="p-6 scroll-mt-20">
        <h3 className="font-bold text-sm text-slate-900 mb-4">Live Transaction Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-3 font-semibold">Reference</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Workspace Plan</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Paystack Trace</th>
                <th className="pb-3 font-semibold">Date & Time</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.ref}>
                  <td className="py-3 font-mono font-bold text-slate-800">{tx.ref}</td>
                  <td className="py-3 font-medium text-slate-900">{tx.customer}</td>
                  <td className="py-3 text-slate-600">{tx.resource}</td>
                  <td className="py-3 font-bold text-slate-900">{tx.amount}</td>
                  <td className="py-3 font-mono text-slate-500">{tx.paystackRef}</td>
                  <td className="py-3 text-slate-500">{tx.date}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
