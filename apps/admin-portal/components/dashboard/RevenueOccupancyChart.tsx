"use client";

import React, { useState } from "react";

type TimeframeOption = "7d" | "30d" | "ytd";

interface ChartDataSet {
  revenuePath: string;
  revenueArea: string;
  occupancyPath: string;
  revenueTotal: string;
  avgOccupancy: string;
  peakHour: string;
  dataPoints: Array<{
    label: string;
    revenue: string;
    occupancy: string;
    visitors: number;
    cx: number;
    cyRev: number;
    cyOcc: number;
  }>;
}

const chartDataMap: Record<TimeframeOption, ChartDataSet> = {
  "7d": {
    revenuePath:
      "M0,120 C50,100 100,150 150,110 C200,70 250,90 300,50 C350,10 400,60 450,40 C500,20 550,80 600,60",
    revenueArea:
      "M0,250 L0,120 C50,100 100,150 150,110 C200,70 250,90 300,50 C350,10 400,60 450,40 C500,20 550,80 600,60 L600,250 Z",
    occupancyPath: "M0,200 C100,180 200,210 300,150 C400,90 500,160 600,120",
    revenueTotal: "$11,450",
    avgOccupancy: "78%",
    peakHour: "1:15 PM (94% Peak)",
    dataPoints: [
      {
        label: "Mon (Aug 15)",
        revenue: "$1,200",
        occupancy: "62%",
        visitors: 110,
        cx: 50,
        cyRev: 100,
        cyOcc: 185,
      },
      {
        label: "Tue (Aug 16)",
        revenue: "$1,850",
        occupancy: "70%",
        visitors: 125,
        cx: 150,
        cyRev: 110,
        cyOcc: 195,
      },
      {
        label: "Wed (Aug 17)",
        revenue: "$2,400",
        occupancy: "76%",
        visitors: 138,
        cx: 250,
        cyRev: 90,
        cyOcc: 170,
      },
      {
        label: "Thu (Aug 18)",
        revenue: "$2,900",
        occupancy: "84%",
        visitors: 148,
        cx: 350,
        cyRev: 25,
        cyOcc: 110,
      },
      {
        label: "Fri (Aug 19)",
        revenue: "$3,100",
        occupancy: "89%",
        visitors: 156,
        cx: 450,
        cyRev: 40,
        cyOcc: 130,
      },
      {
        label: "Sat (Aug 20)",
        revenue: "$2,300",
        occupancy: "75%",
        visitors: 122,
        cx: 550,
        cyRev: 80,
        cyOcc: 140,
      },
    ],
  },
  "30d": {
    revenuePath:
      "M0,140 C80,120 160,80 240,95 C320,60 400,30 480,50 C540,65 580,45 600,40",
    revenueArea:
      "M0,250 L0,140 C80,120 160,80 240,95 C320,60 400,30 480,50 C540,65 580,45 600,40 L600,250 Z",
    occupancyPath: "M0,190 C100,160 220,130 340,110 C440,85 520,100 600,90",
    revenueTotal: "$45,280",
    avgOccupancy: "81%",
    peakHour: "12:30 PM - 3:00 PM",
    dataPoints: [
      {
        label: "Week 1",
        revenue: "$9,800",
        occupancy: "72%",
        visitors: 780,
        cx: 100,
        cyRev: 110,
        cyOcc: 170,
      },
      {
        label: "Week 2",
        revenue: "$11,200",
        occupancy: "79%",
        visitors: 840,
        cx: 250,
        cyRev: 90,
        cyOcc: 125,
      },
      {
        label: "Week 3",
        revenue: "$12,480",
        occupancy: "84%",
        visitors: 894,
        cx: 400,
        cyRev: 30,
        cyOcc: 95,
      },
      {
        label: "Week 4",
        revenue: "$11,800",
        occupancy: "88%",
        visitors: 906,
        cx: 550,
        cyRev: 55,
        cyOcc: 92,
      },
    ],
  },
  ytd: {
    revenuePath: "M0,180 C100,160 200,120 300,90 C400,70 500,50 600,25",
    revenueArea:
      "M0,250 L0,180 C100,160 200,120 300,90 C400,70 500,50 600,25 L600,250 Z",
    occupancyPath: "M0,210 C120,190 240,150 360,120 C480,100 550,80 600,70",
    revenueTotal: "$284,500",
    avgOccupancy: "83%",
    peakHour: "Midday 11am - 4pm",
    dataPoints: [
      {
        label: "Q1 2026",
        revenue: "$64,000",
        occupancy: "74%",
        visitors: 9800,
        cx: 120,
        cyRev: 150,
        cyOcc: 180,
      },
      {
        label: "Q2 2026",
        revenue: "$82,000",
        occupancy: "80%",
        visitors: 11400,
        cx: 280,
        cyRev: 100,
        cyOcc: 135,
      },
      {
        label: "Q3 2026",
        revenue: "$96,500",
        occupancy: "86%",
        visitors: 13200,
        cx: 440,
        cyRev: 60,
        cyOcc: 95,
      },
      {
        label: "Q4 (Est)",
        revenue: "$42,000",
        occupancy: "91%",
        visitors: 6400,
        cx: 560,
        cyRev: 35,
        cyOcc: 75,
      },
    ],
  },
};

export const RevenueOccupancyChart: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeOption>("7d");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const currentData = chartDataMap[selectedTimeframe];

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-accent-soft p-6 elevation-1 flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-headline-sm text-[20px] leading-[28px] font-semibold text-on-surface">
            Revenue vs. Occupancy Analytics
          </h3>
          <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
            Operational correlation between revenue yield, seat occupancy %, and
            peak hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => {
              setSelectedTimeframe(e.target.value as TimeframeOption);
              setHoveredPoint(null);
            }}
            className="bg-surface-container border border-accent-soft rounded-DEFAULT text-label-sm font-label-sm px-2.5 py-1.5 text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>
      </div>

      {/* Simulated High-Res Chart SVG */}
      <div className="relative w-full h-[300px] bg-workspace-surface/50 rounded-DEFAULT border border-accent-soft/50 p-4">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 600 250"
        >
          {/* Grid Lines */}
          <line
            stroke="#EBE7F5"
            strokeWidth="1"
            x1="0"
            x2="600"
            y1="50"
            y2="50"
          />
          <line
            stroke="#EBE7F5"
            strokeWidth="1"
            x1="0"
            x2="600"
            y1="100"
            y2="100"
          />
          <line
            stroke="#EBE7F5"
            strokeWidth="1"
            x1="0"
            x2="600"
            y1="150"
            y2="150"
          />
          <line
            stroke="#EBE7F5"
            strokeWidth="1"
            x1="0"
            x2="600"
            y1="200"
            y2="200"
          />
          <line
            stroke="#EBE7F5"
            strokeWidth="1"
            x1="0"
            x2="600"
            y1="250"
            y2="250"
          />

          {/* Revenue Area (Gradient fill) */}
          <defs>
            <linearGradient id="revenueGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#392271" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#392271" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Revenue Area Path */}
          <path d={currentData.revenueArea} fill="url(#revenueGrad)" />

          {/* Revenue Line */}
          <path
            className="chart-line"
            d={currentData.revenuePath}
            fill="none"
            stroke="#392271"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {/* Occupancy Line (Dashed) */}
          <path
            className="chart-line"
            d={currentData.occupancyPath}
            fill="none"
            stroke="#c68f5c"
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />

          {/* Interactive Data Points */}
          {currentData.dataPoints.map((pt, index) => {
            const isHovered = hoveredPoint === index;
            return (
              <g
                key={pt.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={pt.cx}
                  cy={pt.cyRev}
                  r={isHovered ? 6 : 4}
                  fill="#392271"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                <circle
                  cx={pt.cx}
                  cy={pt.cyOcc}
                  r={isHovered ? 5 : 3.5}
                  fill="#c68f5c"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute top-4 left-6 flex flex-wrap items-center gap-4 bg-surface-container-lowest/90 backdrop-blur-xs px-3 py-1.5 rounded-DEFAULT border border-accent-soft text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary-container" />
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Revenue
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-on-tertiary-container border-t-2 border-dashed border-on-tertiary-container bg-opacity-20" />
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Occupancy %
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-outline border-l border-accent-soft pl-2">
            <span className="font-semibold text-secondary">Peak:</span>
            <span>{currentData.peakHour}</span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredPoint !== null && currentData.dataPoints[hoveredPoint] && (
          <div className="absolute bottom-4 right-6 bg-primary text-on-primary px-3.5 py-2.5 rounded-DEFAULT shadow-md text-xs font-mono border border-primary-container z-10">
            <div className="font-bold text-white mb-1">
              {currentData.dataPoints[hoveredPoint].label}
            </div>
            <div className="text-[11px] text-accent-soft">
              Revenue: {currentData.dataPoints[hoveredPoint].revenue}
            </div>
            <div className="text-[11px] text-on-tertiary-container">
              Occupancy: {currentData.dataPoints[hoveredPoint].occupancy}
            </div>
            <div className="text-[11px] text-emerald-300">
              Visitors: {currentData.dataPoints[hoveredPoint].visitors} on-site
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
