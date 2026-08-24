"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  RotateCw,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Check,
} from "lucide-react";
import { useToast } from "@daih/ui";

export interface FinanceTransaction {
  id: string;
  reference: string;
  date: string;
  memberName: string;
  memberEntity: string;
  avatarColorClass: string;
  avatarLetter: string;
  resourcePlan: string;
  amount: string;
  rawAmount: number;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
}

const DEFAULT_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: "tx_1",
    reference: "DAIH-PAY-88219",
    date: "Oct 24, 2026",
    memberName: "Sarah Jenkins",
    memberEntity: "TechFlow Inc.",
    avatarColorClass: "bg-[#392271] text-white",
    avatarLetter: "S",
    resourcePlan: "Dedicated Desk - Monthly",
    amount: "₦450,000.00",
    rawAmount: 450000,
    status: "Paid",
  },
  {
    id: "tx_2",
    reference: "DAIH-PAY-88218",
    date: "Oct 24, 2026",
    memberName: "Marcus Vance",
    memberEntity: "Independent",
    avatarColorClass: "bg-[#bfa9fe] text-[#4e3a86]",
    avatarLetter: "M",
    resourcePlan: "Podcast Studio B (2 hrs)",
    amount: "₦120,000.00",
    rawAmount: 120000,
    status: "Pending",
  },
  {
    id: "tx_3",
    reference: "DAIH-PAY-88217",
    date: "Oct 23, 2026",
    memberName: "Omega Corp",
    memberEntity: "Enterprise Team",
    avatarColorClass: "bg-[#4e2900] text-amber-100",
    avatarLetter: "O",
    resourcePlan: "Private Office Suite 4",
    amount: "₦3,200,000.00",
    rawAmount: 3200000,
    status: "Paid",
  },
  {
    id: "tx_4",
    reference: "DAIH-PAY-88216",
    date: "Oct 22, 2026",
    memberName: "Elena Rostova",
    memberEntity: "Freelancer",
    avatarColorClass: "bg-rose-100 text-rose-700",
    avatarLetter: "E",
    resourcePlan: "Flex Day Pass",
    amount: "₦35,000.00",
    rawAmount: 35000,
    status: "Failed",
  },
  {
    id: "tx_5",
    reference: "DAIH-PAY-88215",
    date: "Oct 21, 2026",
    memberName: "Tunde Adeleke",
    memberEntity: "GrowthStack",
    avatarColorClass: "bg-emerald-100 text-emerald-800",
    avatarLetter: "T",
    resourcePlan: "Training Room (4 hrs)",
    amount: "₦100,000.00",
    rawAmount: 100000,
    status: "Paid",
  },
  {
    id: "tx_6",
    reference: "DAIH-PAY-88214",
    date: "Oct 20, 2026",
    memberName: "Kelechi Amadi",
    memberEntity: "Vanguard Media",
    avatarColorClass: "bg-[#23055c] text-white",
    avatarLetter: "K",
    resourcePlan: "Media & Photo Studio",
    amount: "₦150,000.00",
    rawAmount: 150000,
    status: "Paid",
  },
];

export const TransactionLedgerTable: React.FC = () => {
  const [transactions, setTransactions] =
    useState<FinanceTransaction[]>(DEFAULT_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<FinanceTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const toast = useToast();

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        tx.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesSearch =
        searchQuery === "" ||
        tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.memberEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.resourcePlan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [transactions, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const displayed = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getStatusBadge = (status: FinanceTransaction["status"]) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case "Refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            Refunded
          </span>
        );
    }
  };

  const handleRetry = (tx: FinanceTransaction) => {
    toast.success(`Retrying Paystack charge for ${tx.reference}...`, {
      title: "Payment Request Sent",
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EBE7F5] rounded-xl overflow-hidden flex flex-col shadow-xs">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-[#EBE7F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-base font-bold text-slate-900">
          Recent Transactions
        </h3>

        {/* Table Actions / Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#EBE7F5] rounded-lg text-xs text-[#181c20] font-medium focus:border-[#23055c] focus:bg-white focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Filter Trigger Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                statusFilter !== "ALL"
                  ? "border-[#23055c] bg-purple-50 text-[#23055c]"
                  : "border-[#EBE7F5] text-slate-600 hover:bg-[#f1f4f9]"
              }`}
              title="Filter by status"
            >
              <Filter className="w-4 h-4" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#EBE7F5] rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {["ALL", "Paid", "Pending", "Failed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setFilterOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      statusFilter === status
                        ? "bg-purple-50 text-[#23055c] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{status === "ALL" ? "All Statuses" : status}</span>
                    {statusFilter === status && (
                      <Check className="w-3.5 h-3.5 text-[#23055c]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#EBE7F5]">
              <th className="py-3.5 px-6 font-bold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="py-3.5 px-6 font-bold text-slate-500 uppercase tracking-wider">
                Member / Entity
              </th>
              <th className="py-3.5 px-6 font-bold text-slate-500 uppercase tracking-wider">
                Resource / Plan
              </th>
              <th className="py-3.5 px-6 font-bold text-slate-500 uppercase tracking-wider text-right">
                Amount
              </th>
              <th className="py-3.5 px-6 font-bold text-slate-500 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="py-3.5 px-6 font-bold text-slate-500 uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE7F5]">
            {displayed.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="py-4 px-6 text-slate-900 font-medium whitespace-nowrap">
                  {tx.date}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${tx.avatarColorClass} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                    >
                      {tx.avatarLetter}
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold">
                        {tx.memberName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {tx.memberEntity}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-600 font-medium">
                  {tx.resourcePlan}
                </td>
                <td className="py-4 px-6 text-slate-900 font-extrabold text-right">
                  {tx.amount}
                </td>
                <td className="py-4 px-6 text-center">
                  {getStatusBadge(tx.status)}
                </td>
                <td className="py-4 px-6 text-right">
                  {tx.status === "Failed" ? (
                    <button
                      onClick={() => handleRetry(tx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold transition-all text-xs cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" /> Retry
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="text-[#23055c] hover:text-[#392271] font-bold transition-opacity cursor-pointer group-hover:opacity-100 opacity-90"
                    >
                      View Invoice
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#EBE7F5] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8F9FA]">
        <p className="text-xs text-slate-500 font-medium">
          Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
          to {Math.min(currentPage * pageSize, filtered.length)} of{" "}
          {filtered.length} entries
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 border border-[#EBE7F5] rounded text-xs text-slate-600 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-[#23055c] text-white shadow-xs"
                    : "border border-[#EBE7F5] bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ),
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 border border-[#EBE7F5] rounded text-xs text-slate-600 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#23055c] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Receipt & Invoice
                </h4>
                <p className="text-[11px] font-mono text-slate-400">
                  {selectedTx.reference}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-y border-slate-100 py-4 my-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Billed To:</span>
                <span className="font-bold text-slate-900">
                  {selectedTx.memberName} ({selectedTx.memberEntity})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Workspace Resource:
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedTx.resourcePlan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Date & Timestamp:
                </span>
                <span className="text-slate-700">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Payment Status:
                </span>
                <div>{getStatusBadge(selectedTx.status)}</div>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold">
                <span className="text-slate-800">Total Settled:</span>
                <span className="text-[#23055c]">{selectedTx.amount}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success(
                    `Printing official receipt for ${selectedTx.reference}`,
                    { title: "Receipt Downloaded" },
                  );
                  setSelectedTx(null);
                }}
                className="px-4 py-2 bg-[#23055c] hover:bg-[#35089e] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
