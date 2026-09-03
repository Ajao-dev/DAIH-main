"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Download,
  Check,
} from "lucide-react";
import { useToast } from "@daih/ui";

export type DateRangeOption =
  "Today" | "Last 7 Days" | "Last 30 Days" | "This Quarter" | "Year to Date";

interface FinanceHeaderProps {
  selectedRange: DateRangeOption;
  onSelectRange: (range: DateRangeOption) => void;
  onExportLedger?: () => void;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({
  selectedRange,
  onSelectRange,
  onExportLedger,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const ranges: DateRangeOption[] = [
    "Today",
    "Last 7 Days",
    "Last 30 Days",
    "This Quarter",
    "Year to Date",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = () => {
    if (onExportLedger) {
      onExportLedger();
    } else {
      toast.success("Financial ledger CSV export started...", {
        title: "Export Initiated",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
      {/* Title and Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#23055c] tracking-tight">
          Financial Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of revenue, transactions, and performance metrics.
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Date Range Picker Dropdown */}
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between w-full sm:w-48 px-4 py-2 bg-[#F8F9FA] border border-[#EBE7F5] rounded-lg text-sm text-[#181c20] font-semibold hover:border-[#23055c] transition-colors shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              {selectedRange}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EBE7F5] rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              {ranges.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    onSelectRange(range);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedRange === range
                      ? "bg-purple-50 text-[#23055c] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{range}</span>
                  {selectedRange === range && (
                    <Check className="w-3.5 h-3.5 text-[#23055c]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#23055c] text-[#23055c] rounded-lg text-xs font-bold hover:bg-[#23055c] hover:text-white transition-colors shadow-xs whitespace-nowrap cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
