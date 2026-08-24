"use client";

import React, { useState } from "react";
import {
  FinanceHeader,
  DateRangeOption,
  FinanceKpiGrid,
  RevenueTrendChart,
  RevenueBreakdown,
  TransactionLedgerTable,
} from "../../components/finance";
import { useToast } from "@daih/ui";

export default function FinancialReportsPage() {
  const [selectedRange, setSelectedRange] =
    useState<DateRangeOption>("Last 30 Days");
  const toast = useToast();

  const handleExport = () => {
    toast.success(`Exporting Financial Ledger for ${selectedRange}...`, {
      title: "CSV Export Initiated",
    });
  };

  const handleViewPendingInvoices = () => {
    toast.info("Filtering transaction ledger by Pending status...", {
      title: "Ledger Filter Applied",
    });
  };

  return (
    <div className="space-y-6">
      {/* Financial Reports Header & Date Filter */}
      <FinanceHeader
        selectedRange={selectedRange}
        onSelectRange={setSelectedRange}
        onExportLedger={handleExport}
      />

      {/* KPI Metric Cards */}
      <FinanceKpiGrid onViewPendingInvoices={handleViewPendingInvoices} />

      {/* Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>

        {/* Revenue by Resource Breakdown */}
        <div className="lg:col-span-1">
          <RevenueBreakdown />
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <TransactionLedgerTable />
    </div>
  );
}
