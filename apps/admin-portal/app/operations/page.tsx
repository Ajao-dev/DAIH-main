'use client';

import React from 'react';
import { Card, Button } from '@daih/ui';
import { Plus } from 'lucide-react';

export default function OperationsPage() {
  const resources = [
    { name: 'Hot Desk Lounge', total: 50, occupied: 32, available: 18, status: 'Active' },
    { name: 'Dedicated Desks Wing', total: 24, occupied: 20, available: 4, status: 'Active' },
    { name: 'Private Office Suite 201', total: 1, occupied: 1, available: 0, status: 'Occupied' },
    { name: 'Conference Hall (Auditorium)', total: 1, occupied: 0, available: 1, status: 'Available' },
    { name: 'Training Room A', total: 1, occupied: 0, available: 1, status: 'Available' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
            Hub Operations & Resource Inventory
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Real-time desk assignments, holds, and operational overrides
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Manual Booking Override
          </Button>
          <Button variant="primary" size="sm" className="bg-primary hover:bg-primary-container text-on-primary">
            <Plus className="h-4 w-4 mr-1.5" /> Add Resource
          </Button>
        </div>
      </div>

      {/* Resource Occupancy Grid */}
      <div id="holds" className="grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-mt-20">
        <Card className="p-5 border border-accent-soft bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant font-medium">Total Live Occupancy</p>
          <p className="text-3xl font-extrabold text-on-surface mt-2">68%</p>
          <p className="text-[11px] text-[#065f46] font-semibold mt-1">53 Active members currently on-site</p>
        </Card>
        <Card className="p-5 border border-accent-soft bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant font-medium">Active 10-Min Holds</p>
          <p className="text-3xl font-extrabold text-[#f59e0b] mt-2">2</p>
          <p className="text-[11px] text-on-surface-variant mt-1">Awaiting Paystack webhook checkout</p>
        </Card>
        <Card className="p-5 border border-accent-soft bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant font-medium">Today's Check-Ins</p>
          <p className="text-3xl font-extrabold text-primary mt-2">47</p>
          <p className="text-[11px] text-on-surface-variant mt-1">Logged by Reception Officers</p>
        </Card>
      </div>

      {/* Capacity Table */}
      <Card id="pools" className="p-6 border border-accent-soft bg-surface-container-lowest scroll-mt-20">
        <h3 className="font-bold text-sm text-on-surface mb-4">Resource Capacity Pools</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-accent-soft text-outline">
                <th className="pb-3 font-semibold">Resource Pool</th>
                <th className="pb-3 font-semibold">Total Capacity</th>
                <th className="pb-3 font-semibold">Occupied</th>
                <th className="pb-3 font-semibold">Available</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {resources.map((res) => (
                <tr key={res.name}>
                  <td className="py-3 font-semibold text-on-surface">{res.name}</td>
                  <td className="py-3 text-on-surface-variant">{res.total}</td>
                  <td className="py-3 font-semibold text-on-surface">{res.occupied}</td>
                  <td className="py-3 font-bold text-[#065f46]">{res.available}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46] text-[10px] font-bold border border-[#10b981]/20">
                      {res.status}
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
