'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@daih/ui';

export interface DailyActivityRecord {
  id: string;
  date: string;
  day: string;
  customerName: string;
  clientId: string;
  timeIn: string;
  timeOut: string;
  hoursUsed: string;
  workspaceUsed: string;
  meetingRoomUsed: string;
  subscriptionPlan: string;
  amountPaid: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'WAIVED';
}

const sampleActivities: DailyActivityRecord[] = [
  {
    id: 'rec-1',
    date: '2026-08-20',
    day: 'Thursday',
    customerName: 'Sarah Jenkins',
    clientId: 'DAIH-2026-0042',
    timeIn: '08:30 AM',
    timeOut: '04:45 PM',
    hoursUsed: '8.25 hrs',
    workspaceUsed: 'Dedicated Desk #12',
    meetingRoomUsed: 'Podcast Room 1 (1h)',
    subscriptionPlan: 'Monthly Dedicated Resident',
    amountPaid: '$150.00',
    paymentStatus: 'PAID',
  },
  {
    id: 'rec-2',
    date: '2026-08-20',
    day: 'Thursday',
    customerName: 'Tunde Adebayo',
    clientId: 'DAIH-2026-0118',
    timeIn: '09:15 AM',
    timeOut: '01:30 PM',
    hoursUsed: '4.25 hrs',
    workspaceUsed: 'Hot Desk Lounge',
    meetingRoomUsed: 'None / N/A',
    subscriptionPlan: 'Daily Hot Desk Pass',
    amountPaid: '$15.00',
    paymentStatus: 'PAID',
  },
  {
    id: 'rec-3',
    date: '2026-08-20',
    day: 'Thursday',
    customerName: 'Amara Okafor',
    clientId: 'DAIH-2026-0089',
    timeIn: '10:00 AM',
    timeOut: 'Active (On-site)',
    hoursUsed: 'In Progress',
    workspaceUsed: 'Dedicated Desk #04',
    meetingRoomUsed: 'Meeting Room C (2h)',
    subscriptionPlan: 'Weekly Flex Plan',
    amountPaid: '$45.00',
    paymentStatus: 'PAID',
  },
  {
    id: 'rec-4',
    date: '2026-08-20',
    day: 'Thursday',
    customerName: 'Emmanuel Victor',
    clientId: 'DAIH-2026-0205',
    timeIn: '11:20 AM',
    timeOut: 'Active (On-site)',
    hoursUsed: 'In Progress',
    workspaceUsed: 'Hot Desk Lounge',
    meetingRoomUsed: 'Photo Studio A (1.5h)',
    subscriptionPlan: 'Daily Hot Desk Pass',
    amountPaid: '$35.00',
    paymentStatus: 'PENDING',
  },
  {
    id: 'rec-5',
    date: '2026-08-20',
    day: 'Thursday',
    customerName: 'Kemi Balogun',
    clientId: 'DAIH-2026-0012',
    timeIn: '08:00 AM',
    timeOut: '05:00 PM',
    hoursUsed: '9.00 hrs',
    workspaceUsed: 'Office Suite 201',
    meetingRoomUsed: 'Meeting Room C (3h)',
    subscriptionPlan: 'Corporate Private Suite',
    amountPaid: '$850.00',
    paymentStatus: 'PAID',
  },
  {
    id: 'rec-6',
    date: '2026-08-20',
    day: 'Thursday',
    customerName: 'David Nnamdi',
    clientId: 'DAIH-2026-0174',
    timeIn: '01:00 PM',
    timeOut: 'Active (On-site)',
    hoursUsed: 'In Progress',
    workspaceUsed: 'Hot Desk Lounge',
    meetingRoomUsed: 'Streaming Pod B (1h)',
    subscriptionPlan: 'Daily Hot Desk Pass',
    amountPaid: '$25.00',
    paymentStatus: 'PAID',
  },
  {
    id: 'rec-7',
    date: '2026-08-19',
    day: 'Wednesday',
    customerName: 'Zainab Aliyu',
    clientId: 'DAIH-2026-0063',
    timeIn: '09:00 AM',
    timeOut: '06:00 PM',
    hoursUsed: '9.00 hrs',
    workspaceUsed: 'Dedicated Desk #18',
    meetingRoomUsed: 'Podcast Room 1 (2h)',
    subscriptionPlan: 'Monthly Dedicated Resident',
    amountPaid: '$150.00',
    paymentStatus: 'PAID',
  },
];

export const DailyActivityTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<DailyActivityRecord | null>(null);

  const filteredActivities = sampleActivities.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workspaceUsed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subscriptionPlan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Day',
      'Customer Name',
      'Client ID',
      'Time In',
      'Time Out',
      'Hours Used',
      'Workspace Used',
      'Meeting Room Used',
      'Subscription Plan',
      'Amount Paid',
      'Payment Status',
    ];

    const rows = filteredActivities.map((r) => [
      r.date,
      r.day,
      `"${r.customerName}"`,
      r.clientId,
      r.timeIn,
      r.timeOut,
      r.hoursUsed,
      `"${r.workspaceUsed}"`,
      `"${r.meetingRoomUsed}"`,
      `"${r.subscriptionPlan}"`,
      r.amountPaid,
      r.paymentStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `daih-daily-activity-log-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-surface-container-lowest rounded-lg border border-accent-soft p-6 elevation-1 flex flex-col justify-between">
        <div>
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-accent-soft">
            <div>
              <h3 className="font-headline-sm text-[20px] leading-[28px] font-semibold text-on-surface">
                Comprehensive Daily Activity Log
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Real-time tracking of visitor check-ins, facility occupancy, hours, and Paystack revenue ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customer, ID, desk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-surface-container border border-accent-soft rounded-DEFAULT text-xs px-3 py-1.5 pl-8 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary w-56 font-medium"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-[16px]">
                  search
                </span>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container border border-accent-soft rounded-DEFAULT text-xs px-2.5 py-1.5 text-on-surface-variant font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>

              {/* Export CSV Button */}
              <button
                onClick={exportToCSV}
                title="Export Activity to CSV"
                className="flex items-center gap-1.5 bg-surface-container hover:bg-accent-soft text-primary font-label-md text-xs px-3 py-1.5 rounded-DEFAULT border border-accent-soft transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 12-Column Comprehensive Daily Activity Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-accent-soft bg-workspace-surface/80 text-[11px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-2">Day</th>
                  <th className="py-3 px-3">Customer Name</th>
                  <th className="py-3 px-2">Client ID</th>
                  <th className="py-3 px-2">Time In</th>
                  <th className="py-3 px-2">Time Out</th>
                  <th className="py-3 px-2">Hours Used</th>
                  <th className="py-3 px-3">Workspace Used</th>
                  <th className="py-3 px-3">Meeting Room Used</th>
                  <th className="py-3 px-3">Subscription Plan</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Payment Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-xs text-on-surface divide-y divide-accent-soft/50 font-medium">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-on-surface-variant font-medium">
                      No activity records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((row, idx) => {
                    const isZebra = idx % 2 === 1;
                    const isOngoing = row.timeOut.includes('Active');

                    return (
                      <tr
                        key={row.id}
                        className={`h-[52px] transition-colors ${
                          isZebra ? 'bg-workspace-surface hover:bg-surface-container' : 'hover:bg-workspace-surface'
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-on-surface-variant">
                          {row.date}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap text-on-surface-variant text-[11px]">
                          {row.day}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-on-surface">
                          {row.customerName}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap font-mono text-[11px] text-primary font-bold">
                          {row.clientId}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap font-mono text-[11px]">
                          {row.timeIn}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap font-mono text-[11px]">
                          {isOngoing ? (
                            <span className="inline-flex items-center gap-1 text-[#065f46] bg-[#d1fae5] px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                              On-site
                            </span>
                          ) : (
                            row.timeOut
                          )}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap font-mono text-[11px]">
                          {row.hoursUsed}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-semibold text-on-surface text-[11px]">
                            {row.workspaceUsed}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-on-surface-variant">
                          {row.meetingRoomUsed}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-on-surface">
                            {row.subscriptionPlan}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap font-mono font-bold text-on-surface">
                          {row.amountPaid}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span
                            className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                              row.paymentStatus === 'PAID'
                                ? 'bg-[#d1fae5] text-[#065f46]'
                                : row.paymentStatus === 'PENDING'
                                ? 'bg-[#fef3c7] text-[#92400e]'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                row.paymentStatus === 'PAID'
                                  ? 'bg-[#10b981]'
                                  : row.paymentStatus === 'PENDING'
                                  ? 'bg-[#f59e0b]'
                                  : 'bg-error'
                              }`}
                            />
                            {row.paymentStatus}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="text-primary hover:underline font-bold text-xs cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info & summary */}
        <div className="mt-4 pt-3 border-t border-accent-soft flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span>Showing {filteredActivities.length} operational daily activity logs</span>
          <span className="font-semibold text-primary">
            DAIH Redemption City Campus Hub Telemetry
          </span>
        </div>
      </div>

      {/* Activity Details Inspection Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={`Operational Session Details: ${selectedRecord.customerName}`}
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3.5 bg-surface-container rounded-xl border border-accent-soft">
              <div>
                <p className="text-sm font-bold text-on-surface">{selectedRecord.customerName}</p>
                <p className="text-xs font-mono text-primary font-bold">{selectedRecord.clientId}</p>
              </div>
              <span
                className={`font-bold text-xs px-2.5 py-1 rounded-full ${
                  selectedRecord.paymentStatus === 'PAID'
                    ? 'bg-[#d1fae5] text-[#065f46]'
                    : 'bg-[#fef3c7] text-[#92400e]'
                }`}
              >
                {selectedRecord.paymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-workspace-surface rounded-lg border border-accent-soft">
                <span className="font-bold text-outline block mb-1">Session Date & Time</span>
                <p className="font-semibold text-on-surface">{selectedRecord.day}, {selectedRecord.date}</p>
                <p className="text-on-surface-variant font-mono mt-0.5">{selectedRecord.timeIn} – {selectedRecord.timeOut}</p>
                <p className="text-[11px] text-primary font-bold mt-1">Duration: {selectedRecord.hoursUsed}</p>
              </div>

              <div className="p-3 bg-workspace-surface rounded-lg border border-accent-soft">
                <span className="font-bold text-outline block mb-1">Facilities Utilized</span>
                <p className="font-semibold text-on-surface">{selectedRecord.workspaceUsed}</p>
                <p className="text-on-surface-variant text-[11px] mt-0.5">Meeting: {selectedRecord.meetingRoomUsed}</p>
              </div>
            </div>

            <div className="p-3 bg-workspace-surface rounded-lg border border-accent-soft text-xs">
              <span className="font-bold text-outline block mb-1">Financial & Subscription Ledger</span>
              <div className="flex justify-between items-center">
                <span className="text-on-surface">{selectedRecord.subscriptionPlan}</span>
                <span className="font-bold font-mono text-sm text-primary">{selectedRecord.amountPaid}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-accent-soft">
              <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
