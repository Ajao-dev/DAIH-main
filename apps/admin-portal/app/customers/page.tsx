'use client';

import React, { useState, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import {
  MemberMetricsGrid,
  MemberDirectoryToolbar,
  MemberDirectoryTable,
  MemberRecord,
  MemberDetailModal,
  AddMemberModal,
} from '../../components/customers';

const INITIAL_MEMBERS: MemberRecord[] = [
  {
    id: 'DAIH-2026-000042',
    name: 'Eleanor Vance',
    email: 'e.vance@company.com',
    phone: '+234 802 123 4567',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    tier: 'Enterprise',
    status: 'Active',
    lastVisit: 'Today, 09:15 AM',
    joinedDate: '12 Jan 2026',
  },
  {
    id: 'DAIH-2026-000019',
    name: 'Julian Silva',
    email: 'julian.silva@freelance.co',
    phone: '+234 810 555 9988',
    tier: 'Creator',
    status: 'Active',
    lastVisit: 'Yesterday, 14:30 PM',
    joinedDate: '04 Feb 2026',
  },
  {
    id: 'DAIH-2026-000008',
    name: 'Marcus Thorne',
    email: 'm.thorne@designstudio.net',
    phone: '+234 803 777 2211',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    tier: 'Professional',
    status: 'Pending',
    lastVisit: '3 days ago',
    joinedDate: '18 Mar 2026',
  },
  {
    id: 'DAIH-2026-000055',
    name: 'Amina Bello',
    email: 'amina.bello@lagostech.io',
    phone: '+234 814 333 4455',
    tier: 'Dedicated Desk',
    status: 'Active',
    lastVisit: 'Today, 11:20 AM',
    joinedDate: '01 Apr 2026',
  },
  {
    id: 'DAIH-2026-000063',
    name: 'Chidi Okafor',
    email: 'chidi.okafor@ventures.ng',
    phone: '+234 809 112 3344',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    tier: 'Private Suite',
    status: 'Active',
    lastVisit: 'Today, 08:45 AM',
    joinedDate: '15 May 2026',
  },
  {
    id: 'DAIH-2026-000071',
    name: 'Fatima Sanusi',
    email: 'fatima@sanusipartners.com',
    phone: '+234 808 667 8899',
    tier: 'Enterprise',
    status: 'Inactive',
    lastVisit: '2 weeks ago',
    joinedDate: '20 May 2026',
  },
];

export default function CustomersPage() {
  const [membersList, setMembersList] = useState<MemberRecord[]>(INITIAL_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return membersList.filter((member) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesEmail = member.email.toLowerCase().includes(q);
        const matchesId = member.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (member.status.toUpperCase() !== statusFilter) return false;
      }

      // Tier filter
      if (tierFilter !== 'ALL') {
        if (member.tier.toLowerCase() !== tierFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [membersList, searchQuery, statusFilter, tierFilter]);

  // Paginated members
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const handleViewMember = (member: MemberRecord) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  const handleMemberAdded = (newMember: MemberRecord) => {
    setMembersList((prev) => [newMember, ...prev]);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c20] tracking-tight">
            Member Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage and view community members, Client IDs, and active subscriptions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#23055c] hover:bg-[#392271] text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add New Member
        </button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div id="tiers" className="scroll-mt-20">
        <MemberMetricsGrid
          totalMembers={1248}
          activeNow={156}
          newThisMonth={42}
          mrrGrowth="$24.5k"
        />
      </div>

      {/* Directory Table Section */}
      <div id="directory" className="space-y-0 scroll-mt-20">
        <div className="bg-white rounded-2xl border border-[#EBE7F5] shadow-[0_4px_12px_rgba(33,37,41,0.04)] overflow-hidden">
          {/* Toolbar */}
          <MemberDirectoryToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(s) => {
              setStatusFilter(s);
              setCurrentPage(1);
            }}
            tierFilter={tierFilter}
            onTierFilterChange={(t) => {
              setTierFilter(t);
              setCurrentPage(1);
            }}
          />

          {/* Table */}
          <MemberDirectoryTable
            members={paginatedMembers}
            totalCount={filteredMembers.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onViewMember={handleViewMember}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <MemberDetailModal
        isOpen={isDetailModalOpen}
        member={selectedMember}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}
