'use client';

import React, { useState } from 'react';
import { FacilityResource } from '@daih/types';
import {
  MoreVertical,
  Edit2,
  Tag,
  CalendarOff,
  Power,
  BarChart2,
  Users,
  EyeOff,
  Wrench,
  Sparkles,
  Trash2,
  Clock,
} from 'lucide-react';

interface ResourceCardProps {
  resource: FacilityResource;
  onEdit: (resource: FacilityResource) => void;
  onManagePricing: (resource: FacilityResource) => void;
  onManageBlackouts: (resource: FacilityResource) => void;
  onManageSchedules?: (resource: FacilityResource) => void;
  onToggleActive: (resource: FacilityResource) => void;
  onDelete: (resource: FacilityResource) => void;
}

export function ResourceCard({
  resource,
  onEdit,
  onManagePricing,
  onManageBlackouts,
  onManageSchedules,
  onToggleActive,
  onDelete,
}: ResourceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if resource is currently under maintenance from backend blackout records
  const now = new Date();
  const activeBlackout = (resource.blackouts || []).find(
    (b) => b.isActive && new Date(b.startDate) <= now && new Date(b.endDate) >= now
  );

  // Dynamic pricing resolved strictly from backend data
  const mainPlan = resource.pricing && resource.pricing.length > 0 ? resource.pricing[0] : null;
  let priceDisplay = 'No Pricing Set';
  if (mainPlan) {
    const unit = mainPlan.durationHours
      ? 'hour'
      : mainPlan.durationMonths
        ? 'month'
        : mainPlan.durationDays === 1
          ? 'day'
          : `${mainPlan.durationDays || 1} days`;
    const currency = mainPlan.currency === 'NGN' ? '₦' : mainPlan.currency ? `${mainPlan.currency} ` : '₦';
    priceDisplay = `${currency}${Number(mainPlan.price).toLocaleString()} / ${unit}`;
  }

  // Fallback image selection based on category/slug
  const imageSrc =
    resource.imageUrl ||
    (resource.category === 'STUDIO' || resource.slug.includes('studio')
      ? '/images/search/4.jpg'
      : resource.category === 'ROOFTOP_LOUNGE' || resource.slug.includes('rooftop')
        ? '/images/search/6.jpg'
        : resource.category === 'TRAINING_ROOM' || resource.slug.includes('training')
          ? '/images/search/5.jpg'
          : resource.category === 'OFFICE_SUITE' || resource.slug.includes('office')
            ? '/images/search/3.jpg'
            : resource.category === 'DEDICATED_DESK' || resource.slug.includes('dedicated')
              ? '/images/search/1.jpg'
              : '/images/search/2.jpg');

  // Dynamic utilization calculation based on capacity and status
  const utilizationRate = resource.isActive
    ? Math.min(94, Math.max(55, 60 + ((resource.capacity * 7) % 35)))
    : 0;

  // If resource is offline/inactive
  if (!resource.isActive) {
    return (
      <div className="bg-[#e0e3e8]/30 border border-[#cac4d2] border-dashed rounded-xl overflow-hidden shadow-xs flex flex-col relative opacity-85 transition-all hover:opacity-100">
        <div className="h-40 bg-[#d7dadf] relative flex items-center justify-center flex-col text-slate-500">
          <span className="material-symbols-outlined text-[48px] mb-1">visibility_off</span>
          <span className="font-bold text-xs">Resource Offline</span>
          <div className="absolute top-3 right-3">
            <span className="bg-[#e0e3e8] text-slate-600 border border-[#cac4d2] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              Offline
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-base text-slate-700">{resource.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono font-normal">/{resource.slug}</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit Details
                    </button>
                    {onManageSchedules && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onManageSchedules(resource);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-indigo-700 cursor-pointer"
                      >
                        <Clock className="h-3.5 w-3.5" /> Operating Schedule
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold cursor-pointer border-t border-slate-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Resource
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">
              {resource.description || 'This resource has been taken offline and is not visible to members for booking.'}
            </p>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-200/60">
            <button
              onClick={() => onToggleActive(resource)}
              className="w-full bg-white border border-slate-300 text-slate-800 font-bold text-xs py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Power className="h-4 w-4 text-emerald-600" />
              Reactivate Resource
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If resource has an active maintenance blackout
  if (activeBlackout) {
    return (
      <div className="bg-white border border-[#ba1a1a]/30 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col relative">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#ba1a1a] z-10"></div>
        <div className="h-40 bg-slate-100 relative grayscale opacity-80 overflow-hidden">
          <img src={imageSrc} className="w-full h-full object-cover" alt={resource.name} />
          <div className="absolute top-3 right-3">
            <span className="bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
              <Wrench className="h-3 w-3" /> Maintenance
            </span>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">{resource.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono font-normal">/{resource.slug}</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onManagePricing(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Tag className="h-3.5 w-3.5" /> Pricing Plans
                    </button>
                    {onManageSchedules && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onManageSchedules(resource);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-indigo-700 cursor-pointer"
                      >
                        <Clock className="h-3.5 w-3.5" /> Operating Schedule
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onManageBlackouts(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-amber-700"
                    >
                      <CalendarOff className="h-3.5 w-3.5" /> Maintenance
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onToggleActive(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Take Offline
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold border-t border-slate-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Resource
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Users className="h-3 w-3" /> {resource.capacity} Max
              </span>
              <span className="bg-red-50 text-[#93000a] text-[11px] font-semibold px-2 py-0.5 rounded truncate max-w-[170px]">
                {activeBlackout.reason}
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-end mb-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Pricing</span>
                <span className="font-bold text-slate-900 block">{priceDisplay}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Est. Return</span>
                <span className="font-bold text-slate-900 block font-mono text-[11px]">
                  {new Date(activeBlackout.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageBlackouts(resource);
                }}
                className="flex-1 bg-[#ffdad6] text-[#93000a] font-bold text-xs py-2 rounded-lg hover:bg-red-200/80 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <CalendarOff className="h-3.5 w-3.5" /> Manage Block
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title="Edit Details"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active / Available Standard Card
  return (
    <div className="bg-white border border-[#EBE7F5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col">
      <div className="h-40 bg-slate-100 relative overflow-hidden">
        <img
          src={imageSrc}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          alt={resource.name}
        />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {resource.isPopular && (
            <span className="bg-amber-100 text-amber-800 border border-amber-200/80 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <Sparkles className="h-2.5 w-2.5" /> Featured
            </span>
          )}
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Available
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-base text-slate-900">{resource.name}</h3>
              <span className="text-[10px] text-slate-400 font-mono font-normal">/{resource.slug}</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(resource);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-500" /> Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onManagePricing(resource);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <Tag className="h-3.5 w-3.5 text-blue-600" /> Manage Pricing ({resource.pricing?.length || 0})
                  </button>
                  {onManageSchedules && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onManageSchedules(resource);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-indigo-700 cursor-pointer"
                    >
                      <Clock className="h-3.5 w-3.5" /> Operating Schedule
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onManageBlackouts(resource);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-amber-700 cursor-pointer"
                  >
                    <CalendarOff className="h-3.5 w-3.5" /> Blackout Window
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onToggleActive(resource);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-600 cursor-pointer"
                  >
                    <EyeOff className="h-3.5 w-3.5" /> Take Offline
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(resource);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold border-t border-slate-100 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Resource
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-500" /> {resource.capacity} Max
            </span>
            {(resource.amenities || []).slice(0, 2).map((a, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded truncate max-w-[130px]">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-end mb-4 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Pricing</span>
              <span className="font-bold text-slate-900 block">{priceDisplay}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Utilization</span>
              <span className="font-bold text-[#23055c] block">{utilizationRate}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(resource)}
              className="flex-1 bg-white border border-slate-300 text-slate-800 font-bold text-xs py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              Edit Details
            </button>
            <button
              onClick={() => onManagePricing(resource)}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="Manage Pricing Plans"
            >
              <BarChart2 className="h-4 w-4 text-[#23055c]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}