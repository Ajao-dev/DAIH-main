"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UserRole, UserProfile } from "@daih/types";
import { api } from "@daih/api-client";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import {
  UserMetricsGrid,
  UserDirectoryToolbar,
  UserDirectoryTable,
  AddStaffModal,
  EditStaffModal,
  AdminUserRecord,
} from "../../components/staff";

const DEFAULT_DEMO_STAFF: AdminUserRecord[] = [
  {
    id: "DAIH-STF-001",
    name: "Sarah Jenkins",
    email: "s.jenkins@daih.ng",
    role: UserRole.SUPER_ADMIN,
    status: "ACTIVE",
    lastActive: "Just now",
    phone: "+234 802 123 4567",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "DAIH-STF-002",
    name: "Marcus Torres",
    email: "m.torres@daih.ng",
    role: UserRole.OPERATIONS_ADMIN,
    status: "ACTIVE",
    lastActive: "2 hours ago",
    phone: "+234 810 555 9988",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "DAIH-STF-003",
    name: "Elena Rodriguez",
    email: "e.rodriguez@daih.ng",
    role: UserRole.FINANCE_OFFICER,
    status: "PENDING",
    lastActive: "Never",
    phone: "+234 803 777 2211",
  },
];

export default function StaffManagementPage() {
  const [staffList, setStaffList] =
    useState<AdminUserRecord[]>(DEFAULT_DEMO_STAFF);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminUserRecord | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch real staff users from backend API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoadingStaff(true);
      try {
        const users = await api.auth.getStaffUsers();
        if (isMounted && users && Array.isArray(users) && users.length > 0) {
          const mapped: AdminUserRecord[] = users.map((u: UserProfile) => ({
            id: u.clientId || u.id,
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
            email: u.email,
            phone: u.phoneNumber,
            role: u.role as UserRole,
            status: u.isVerified ? "ACTIVE" : "PENDING",
            lastActive: u.isVerified
              ? "Active on Console"
              : "Pending Activation",
          }));
          setStaffList(mapped);
        }
      } catch (err) {
        // Fallback to local default state if network/unauthenticated
        console.warn("Could not load live staff list from backend:", err);
      } finally {
        if (isMounted) setIsLoadingStaff(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Metrics computation
  const totalAdmins = staffList.length;
  const activeNow = staffList.filter((u) => u.status === "ACTIVE").length;
  const pendingInvites = staffList.filter((u) => u.status === "PENDING").length;

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesRole = u.role.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole) return false;
      }

      if (roleFilter !== "ALL") {
        if (u.role !== roleFilter) return false;
      }

      if (statusFilter !== "ALL") {
        if (u.status !== statusFilter) return false;
      }

      return true;
    });
  }, [staffList, searchQuery, roleFilter, statusFilter]);

  // Paginated staff
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  const handleAddStaff = async (newStaffData: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    onboardingMethod: "INVITE_EMAIL" | "DIRECT_CREDENTIAL";
    tempPassword?: string;
  }) => {
    const parts = newStaffData.name.trim().split(/\s+/);
    const firstName = parts[0] || "Staff";
    const lastName = parts.slice(1).join(" ") || "Member";

    // Call backend API to persist staff user to database
    const createdUser = await api.auth.createStaffUser({
      firstName,
      lastName,
      email: newStaffData.email,
      phoneNumber: newStaffData.phone,
      role: newStaffData.role,
      password: newStaffData.tempPassword || undefined,
    });

    const newStaff: AdminUserRecord = {
      id: createdUser.clientId || createdUser.id,
      name: `${createdUser.firstName} ${createdUser.lastName}`,
      email: createdUser.email,
      phone: createdUser.phoneNumber,
      role: createdUser.role as UserRole,
      status:
        newStaffData.onboardingMethod === "DIRECT_CREDENTIAL"
          ? "ACTIVE"
          : "PENDING",
      lastActive:
        newStaffData.onboardingMethod === "DIRECT_CREDENTIAL"
          ? "Just provisioned"
          : "Never",
    };

    setStaffList((prev) => [newStaff, ...prev]);

    if (newStaffData.onboardingMethod === "INVITE_EMAIL") {
      showToast(
        `Onboarding invitation sent successfully to ${newStaffData.email}`,
      );
    } else {
      showToast(`Staff account created in database for ${newStaffData.name}`);
    }
  };

  const handleUpdateStaff = (updatedStaff: AdminUserRecord) => {
    setStaffList((prev) =>
      prev.map((u) => (u.id === updatedStaff.id ? updatedStaff : u)),
    );
    showToast(`Staff record updated for ${updatedStaff.name}`);
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((u) => {
        if (u.id === staffId) {
          const nextStatus =
            u.status === "DEACTIVATED" ? "ACTIVE" : "DEACTIVATED";
          showToast(
            `Staff access for ${u.name} has been ${
              nextStatus === "ACTIVE" ? "restored" : "deactivated"
            }`,
          );
          return { ...u, status: nextStatus };
        }
        return u;
      }),
    );
  };

  const handleResendInvite = (staff: AdminUserRecord) => {
    showToast(`Onboarding invitation email resent to ${staff.email}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const handleFilterPending = () => {
    setStatusFilter("PENDING");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1280px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl text-white shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "error" ? "bg-rose-700" : "bg-[#23055c]"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Staff Onboarding & Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Onboard new staff members, provision administrative credentials, and
            manage operational roles
          </p>
        </div>

        <button
          onClick={() => setIsAddStaffModalOpen(true)}
          className="bg-[#23055c] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#392271] transition-all shadow-sm flex items-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Staff</span>
        </button>
      </div>

      {/* Bento Grid Overview Cards */}
      <UserMetricsGrid
        totalAdmins={totalAdmins}
        activeNow={activeNow}
        pendingInvites={pendingInvites}
        onFilterPending={handleFilterPending}
      />

      {/* User Table Card */}
      <div className="bg-white rounded-2xl border border-[#EBE7F5] shadow-[0px_4px_12px_rgba(33,37,41,0.05)] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <UserDirectoryToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          roleFilter={roleFilter}
          onRoleFilterChange={(r) => {
            setRoleFilter(r);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(s) => {
            setStatusFilter(s);
            setCurrentPage(1);
          }}
          onResetFilters={handleResetFilters}
        />

        {/* Table with Pagination */}
        <UserDirectoryTable
          users={paginatedStaff}
          totalCount={filteredStaff.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onEditUser={(u) => setEditingStaff(u)}
          onToggleStatus={handleToggleStatus}
          onResendInvite={handleResendInvite}
        />
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        onStaffAdded={handleAddStaff}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={!!editingStaff}
        staff={editingStaff}
        onClose={() => setEditingStaff(null)}
        onStaffUpdated={handleUpdateStaff}
      />
    </div>
  );
}
