'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  SpaceCard,
  SpaceItem,
  DiscoveryHeader,
  CategoryOption,
} from '../../../components/book';
import { api } from '@daih/api-client';
import { FacilityResource } from '@daih/types';
import { Layers, Loader2 } from 'lucide-react';

const CATEGORIES: CategoryOption[] = [
  { id: 'ALL', label: 'All Spaces' },
  { id: 'Hot Desk', label: 'Hot Desk & Workstations' },
  { id: 'Private Office', label: 'Private Office' },
  { id: 'Meeting Room', label: 'Meeting & Training' },
  { id: 'Studio', label: 'Creative Studios & Lounge' },
];

// Helper to determine accurate local web images for workspace slugs
function getWorkspaceImage(slug: string, backendImageUrl?: string | null): string {
  if (backendImageUrl && (backendImageUrl.startsWith('http') || backendImageUrl.startsWith('/images/'))) {
    return backendImageUrl;
  }
  const s = slug.toLowerCase();
  if (s.includes('stream')) return '/images/misc/space-type-streaming.jpg';
  if (s.includes('podcast') || s.includes('audio')) return '/images/misc/space-type-podcast.jpg';
  if (s.includes('photo')) return '/images/misc/space-type-photo.jpg';
  if (s.includes('studio')) return '/images/search/4.jpg';
  if (s.includes('rooftop')) return '/images/search/6.jpg';
  if (s.includes('training') || s.includes('meeting')) return '/images/search/5.jpg';
  if (s.includes('office') || s.includes('conference')) return '/images/search/3.jpg';
  if (s.includes('dedicated')) return '/images/search/1.jpg';
  return '/images/search/2.jpg';
}

// Helper to map category strings to filter chips
function mapToCategoryGroup(category?: string, slug: string = ''): 'Private Office' | 'Meeting Room' | 'Hot Desk' | 'Studio' {
  const c = (category || '').toUpperCase();
  const s = slug.toLowerCase();

  if (c.includes('OFFICE') || s.includes('office') || s.includes('suite')) return 'Private Office';
  if (c.includes('MEETING') || c.includes('TRAINING') || c.includes('CONFERENCE') || s.includes('room') || s.includes('hall')) return 'Meeting Room';
  if (c.includes('HOT') || c.includes('DESK') || s.includes('desk') || c.includes('FLEX') || c.includes('DEDICATED')) return 'Hot Desk';
  if (c.includes('STUDIO') || c.includes('MEDIA') || c.includes('ROOFTOP') || s.includes('studio') || s.includes('stream') || s.includes('audio') || s.includes('rooftop')) return 'Studio';
  return 'Hot Desk';
}

// Fallback seed list matching official rates
const DEFAULT_CATALOGUE_FALLBACK: SpaceItem[] = [
  {
    id: 'flex-desk',
    name: 'Flex Desk',
    slug: 'flex-desk',
    category: 'Hot Desk',
    categoryBadge: 'Hot Desk',
    price: '₦4,000',
    unit: '/day',
    description: 'Dedicated workstation access with 24/7 power supply, high-speed Wi-Fi, ergonomic seating, and hot/cold water.',
    capacityText: 'Open Lounge',
    specText: 'Fibre WiFi',
    specType: 'wifi',
    imageUrl: '/images/search/2.jpg',
  },
  {
    id: 'dedicated-desk',
    name: 'Dedicated Desk',
    slug: 'dedicated-desk',
    category: 'Hot Desk',
    categoryBadge: 'Dedicated Desk',
    price: '₦68,000',
    unit: '/mo',
    description: 'Assigned personal workstation with lockable drawer, 24/7 power, daily access, and high-speed Wi-Fi.',
    capacityText: '1 Person',
    specText: 'Personal Desk',
    specType: 'slots',
    imageUrl: '/images/search/1.jpg',
  },
  {
    id: 'private-office',
    name: 'Private Office / Mini Conference',
    slug: 'private-office',
    category: 'Private Office',
    categoryBadge: 'Private Office',
    price: '₦8,000',
    unit: '/day',
    description: 'Air-conditioned private space with presentation screen, 24/7 power, and comfortable seating for teams.',
    capacityText: 'Up to 6',
    specText: 'Screen / TV',
    specType: 'area',
    imageUrl: '/images/search/3.jpg',
  },
  {
    id: 'training-room',
    name: 'Training / Meeting Room',
    slug: 'training-room',
    category: 'Meeting Room',
    categoryBadge: 'Meeting Room',
    price: '₦25,000',
    unit: '/hr',
    description: 'Professional meeting & training space with flexible room setup, presentation screen/TV, and air-conditioning.',
    capacityText: 'Up to 30',
    specText: 'Presentation TV',
    specType: 'area',
    imageUrl: '/images/search/5.jpg',
  },
  {
    id: 'rooftop-lounge',
    name: 'Rooftop Lounge',
    slug: 'rooftop-lounge',
    category: 'Studio',
    categoryBadge: 'Rooftop Lounge',
    price: '₦35,000',
    unit: '/hr',
    description: 'Scenic open-air rooftop venue with ambient evening lighting, bar setup, and outdoor sound system.',
    capacityText: 'Up to 50',
    specText: 'Open Terrace',
    specType: 'area',
    imageUrl: '/images/search/6.jpg',
  },
  {
    id: 'studio',
    name: 'Studio',
    slug: 'studio',
    category: 'Studio',
    categoryBadge: 'Studio',
    price: '₦200,000',
    unit: '/hr',
    description: 'Fully equipped professional creative production studio with high-end audio/visual gear and acoustic treatment.',
    capacityText: 'Up to 10',
    specText: 'Pro Gear',
    specType: 'audio',
    imageUrl: '/images/search/4.jpg',
  },
];
export default function BookingDiscoveryPage() {
  const [spaces, setSpaces] = useState<SpaceItem[]>(DEFAULT_CATALOGUE_FALLBACK);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Fetch live backend resource and pricing data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.catalogue
      .getResources()
      .then((data: FacilityResource[]) => {
        if (!isMounted) return;
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped: SpaceItem[] = data.map((r) => {
            // Dynamically extract price & time unit from live backend pricing plans
            let formattedPrice = '₦4,000';
            let formattedUnit = '/day';

            if (r.pricing && r.pricing.length > 0) {
              const primaryPlan = r.pricing[0];
              const symbol = primaryPlan.currency === 'USD' ? '$' : '₦';
              formattedPrice = `${symbol}${Number(primaryPlan.price).toLocaleString()}`;
              if (primaryPlan.durationHours) {
                formattedUnit = `/hr`;
              } else if (primaryPlan.durationMonths) {
                formattedUnit = `/mo`;
              } else if (primaryPlan.durationDays && primaryPlan.durationDays > 1) {
                formattedUnit = `/${primaryPlan.durationDays}d`;
              } else {
                formattedUnit = `/day`;
              }
            } else if (r.dailyRate) {
              formattedPrice = `₦${Number(r.dailyRate).toLocaleString()}`;
              formattedUnit = '/day';
            } else if (r.hourlyRate) {
              formattedPrice = `₦${Number(r.hourlyRate).toLocaleString()}`;
              formattedUnit = '/hr';
            } else if (r.monthlyRate) {
              formattedPrice = `₦${Number(r.monthlyRate).toLocaleString()}`;
              formattedUnit = '/mo';
            }

            const categoryGroup = mapToCategoryGroup(r.category, r.slug || r.name);
            const categoryBadge = r.name;

            let specType: 'area' | 'wifi' | 'audio' | 'slots' = 'area';
            let specText = 'Air Conditioned';
            if (r.slug?.includes('desk') || r.category?.includes('DESK')) {
              specType = 'wifi';
              specText = 'Fibre WiFi';
            } else if (r.slug?.includes('audio') || r.slug?.includes('podcast') || r.category?.includes('STUDIO')) {
              specType = 'audio';
              specText = 'Studio Mics';
            } else if (r.slug?.includes('stream')) {
              specType = 'wifi';
              specText = '1 Gbps LAN';
            }

            return {
              id: r.id,
              name: r.name,
              slug: r.slug || r.id,
              category: categoryGroup,
              categoryBadge,
              price: formattedPrice,
              unit: formattedUnit,
              description: r.description || '',
              capacityText: `${r.capacity} Person${r.capacity > 1 ? 's' : ''}`,
              specText,
              specType,
              imageUrl: getWorkspaceImage(r.slug || '', r.imageUrl),
            };
          });

          setSpaces(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not load live catalogue, using cached spaces:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter spaces based on category and search query
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const matchesCategory =
        selectedCategory === 'ALL' || space.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.categoryBadge.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [spaces, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Header */}
      <DiscoveryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onToggleFilters={() => setIsFilterOpen((prev) => !prev)}
        isFilterOpen={isFilterOpen}
      />

      {/* Loading state indicator */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#23055c]" />
          <p className="text-xs font-semibold text-slate-500">
            Loading live workspace inventory & real-time rates...
          </p>
        </div>
      )}

      {/* Workspace Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpaces.map((space) => (
            <SpaceCard key={space.id || space.slug} space={space} />
          ))}
        </div>
      )}

      {/* Empty Search State */}
      {!isLoading && filteredSpaces.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#EBE7F5] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#23055c] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No spaces found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any workspace matching "{searchQuery}". Try selecting a different category or clearing your search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="px-5 py-2 rounded-xl bg-[#23055c] hover:bg-[#35089e] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}