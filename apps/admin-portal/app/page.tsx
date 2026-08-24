'use client';

import React, { useState } from 'react';
import {
  DashboardHeader,
  KpiGrid,
  RevenueOccupancyChart,
  SubscriptionBreakdown,
  MostUsedFacilities,
  DailyActivityTable,
  WalkInModal,
} from '../components/dashboard';

export default function AdminOperationsDashboard() {
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <DashboardHeader onOpenWalkInModal={() => setIsWalkInModalOpen(true)} />

      {/* 2. Usage Analytics KPIs: Visitors, Retention, Revenue, Occupancy, Peak Hours */}
      <KpiGrid />

      {/* 3. Main Analytics Grid: Revenue vs Occupancy Graph & Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2">
          <RevenueOccupancyChart />
        </div>
        <div>
          <SubscriptionBreakdown />
        </div>
      </div>

      {/* 4. Most Used Facilities Utilization Grid */}
      <div>
        <MostUsedFacilities />
      </div>

      {/* 5. Comprehensive 12-Column Daily Activity Table */}
      <div>
        <DailyActivityTable />
      </div>

      {/* 6. Walk-In Pass Modal */}
      <WalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
      />
    </div>
  );
}
