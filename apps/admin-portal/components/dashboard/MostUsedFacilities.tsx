"use client";

import React from "react";
import Link from "next/link";

export interface FacilityUtilization {
  id: string;
  name: string;
  type: string;
  utilizationRate: number;
  hoursLogged: string;
  activeOccupancy: string;
  status: "High Demand" | "Active" | "Available";
  barColorClass: string;
}

const mostUsedFacilities: FacilityUtilization[] = [
  {
    id: "fac-1",
    name: "Hot Desk Lounge",
    type: "Shared Workspace",
    utilizationRate: 92,
    hoursLogged: "412 hrs this week",
    activeOccupancy: "46/50 Seats",
    status: "High Demand",
    barColorClass: "bg-primary-container",
  },
  {
    id: "fac-2",
    name: "Podcast Room 1",
    type: "Media & Audio Studio",
    utilizationRate: 85,
    hoursLogged: "68 hrs this week",
    activeOccupancy: "In-Use (Sarah J.)",
    status: "High Demand",
    barColorClass: "bg-secondary",
  },
  {
    id: "fac-3",
    name: "Dedicated Desks Wing",
    type: "Reserved Workspace",
    utilizationRate: 83,
    hoursLogged: "380 hrs this week",
    activeOccupancy: "20/24 Desks",
    status: "Active",
    barColorClass: "bg-on-tertiary-container",
  },
  {
    id: "fac-4",
    name: "Meeting Room C (Boardroom)",
    type: "Executive Meeting Room",
    utilizationRate: 78,
    hoursLogged: "46 hrs this week",
    activeOccupancy: "Next at 16:00",
    status: "Available",
    barColorClass: "bg-[#10b981]",
  },
  {
    id: "fac-5",
    name: "Photo Studio A",
    type: "Media Production",
    utilizationRate: 71,
    hoursLogged: "38 hrs this week",
    activeOccupancy: "Occupied until 14:00",
    status: "Active",
    barColorClass: "bg-secondary-container",
  },
  {
    id: "fac-6",
    name: "Streaming Pod B",
    type: "Broadcast Pod",
    utilizationRate: 64,
    hoursLogged: "28 hrs this week",
    activeOccupancy: "Maintenance",
    status: "Available",
    barColorClass: "bg-[#f59e0b]",
  },
];

export const MostUsedFacilities: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-accent-soft p-6 elevation-1 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-accent-soft">
          <div>
            <h3 className="font-headline-sm text-[20px] leading-[28px] font-semibold text-on-surface">
              Most Used Facilities
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
              Workspace & meeting room utilization rankings
            </p>
          </div>
          <Link
            href="/operations"
            className="font-label-sm text-label-sm text-primary hover:underline font-semibold flex items-center gap-1"
          >
            Manage Inventory
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostUsedFacilities.map((fac, idx) => (
            <div
              key={fac.id}
              className="p-4 bg-workspace-surface rounded-DEFAULT border border-accent-soft/70 hover:border-primary-container transition-all hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      {fac.name}
                    </h4>
                  </div>
                  <span
                    className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      fac.status === "High Demand"
                        ? "bg-error-container text-on-error-container"
                        : fac.status === "Active"
                          ? "bg-primary/10 text-primary"
                          : "bg-[#d1fae5] text-[#065f46]"
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>

                <p className="text-[11px] text-on-surface-variant font-medium mb-3 pl-7">
                  {fac.type} · {fac.activeOccupancy}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Utilization Rate
                  </span>
                  <span className="font-bold text-on-surface font-mono">
                    {fac.utilizationRate}%
                  </span>
                </div>
                <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                  <div
                    className={`${fac.barColorClass} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${fac.utilizationRate}%` }}
                  />
                </div>
                <div className="text-[10px] text-on-surface-variant/80 font-mono mt-1 text-right">
                  {fac.hoursLogged}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
