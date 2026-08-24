"use client";

import React, { useState } from "react";
import { UserRole } from "@daih/types";
import { X, Send, Info, UserPlus, Mail, Key } from "lucide-react";

export interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: (newStaff: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    onboardingMethod: "INVITE_EMAIL" | "DIRECT_CREDENTIAL";
    tempPassword?: string;
  }) => Promise<void> | void;
}

const ROLE_DESCRIPTIONS: Record<
  UserRole,
  { title: string; preview: string; department: string }
> = {
  [UserRole.SUPER_ADMIN]: {
    title: "Super Admin",
    department: "Executive / IT Systems",
    preview:
      "Full root access to all system configurations, staff RBAC provisioning, financial reports, and workspace settings.",
  },
  [UserRole.OPERATIONS_ADMIN]: {
    title: "Operations Admin",
    department: "Hub Operations",
    preview:
      "Manages floor pulse, desk allocations, resource capacity pools, schedule holds, and manual booking overrides.",
  },
  [UserRole.FINANCE_OFFICER]: {
    title: "Finance Officer",
    department: "Accounts & Billing",
    preview:
      "Access to Paystack webhooks, payment reconciliation ledgers, refund authorizations, and settlement reports.",
  },
  [UserRole.RECEPTION_OFFICER]: {
    title: "Reception Officer",
    department: "Front Desk & Guest Services",
    preview:
      "Issues walk-in visitor passes, scans customer QR check-ins, manages on-site visitor queue, and prints badges.",
  },
  [UserRole.SECURITY_OFFICER]: {
    title: "Security Officer",
    department: "Physical Gate & Security",
    preview:
      "Validates physical gate QR passes, monitors perimeter check-ins, and inspects verified entry badges.",
  },
  [UserRole.MANAGEMENT_VIEWER]: {
    title: "Management Viewer",
    department: "Board & Leadership",
    preview:
      "Read-only access to executive utilization dashboards, footfall metrics, density telemetry, and aggregated KPIs.",
  },
  [UserRole.CUSTOMER]: {
    title: "Customer",
    department: "Community Member",
    preview: "Standard customer account.",
  },
};

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onStaffAdded,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    UserRole.OPERATIONS_ADMIN,
  );
  const [onboardingMethod, setOnboardingMethod] = useState<
    "INVITE_EMAIL" | "DIRECT_CREDENTIAL"
  >("INVITE_EMAIL");
  const [tempPassword, setTempPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Please provide the full name and official email address.");
      return;
    }

    if (onboardingMethod === "DIRECT_CREDENTIAL") {
      if (!tempPassword || tempPassword.length < 8) {
        setError("Temporary password must be at least 8 characters long.");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onStaffAdded({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        role: selectedRole,
        onboardingMethod,
        tempPassword:
          onboardingMethod === "DIRECT_CREDENTIAL" ? tempPassword : undefined,
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setSelectedRole(UserRole.OPERATIONS_ADMIN);
      setOnboardingMethod("INVITE_EMAIL");
      setTempPassword("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to onboard staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectableRoles = [
    UserRole.OPERATIONS_ADMIN,
    UserRole.FINANCE_OFFICER,
    UserRole.RECEPTION_OFFICER,
    UserRole.SECURITY_OFFICER,
    UserRole.MANAGEMENT_VIEWER,
    UserRole.SUPER_ADMIN,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#1A1D20]/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#EBE7F5] z-10">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EBE7F5] flex justify-between items-center bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-[#23055c] rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Onboard New Staff Member
              </h2>
              <p className="text-[11px] text-slate-500">
                Provision admin credentials and assign operational duty
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F8F9FA] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Bello"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EBE7F5] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#23055c] focus:ring-1 focus:ring-[#23055c] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="amina.bello@daih.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EBE7F5] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#23055c] focus:ring-1 focus:ring-[#23055c] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 800 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EBE7F5] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#23055c] focus:ring-1 focus:ring-[#23055c] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                Operational Role & Department
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectableRoles.map((role) => {
                  const isSelected = selectedRole === role;
                  const roleInfo = ROLE_DESCRIPTIONS[role];

                  return (
                    <div
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 border rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#23055c] bg-[#392271]/5 shadow-xs"
                          : "border-[#EBE7F5] hover:bg-[#F8F9FA]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="role"
                          checked={isSelected}
                          onChange={() => setSelectedRole(role)}
                          className="w-4 h-4 text-[#23055c] focus:ring-[#23055c] border-[#EBE7F5] mt-0.5"
                        />
                        <div className="min-w-0">
                          <span
                            className={`text-xs font-bold block ${
                              isSelected ? "text-[#23055c]" : "text-slate-800"
                            }`}
                          >
                            {roleInfo.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {roleInfo.department}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permissions Preview */}
            <div className="p-3.5 bg-[#e8ddff]/30 rounded-xl border border-[#EBE7F5]">
              <div className="flex items-center gap-2 mb-1 text-[#23055c]">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">
                  Role Permissions Preview
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="font-bold text-slate-900">
                  {ROLE_DESCRIPTIONS[selectedRole].title}:
                </strong>{" "}
                {ROLE_DESCRIPTIONS[selectedRole].preview}
              </p>
            </div>

            {/* Onboarding Method */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Onboarding Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer text-xs ${
                    onboardingMethod === "INVITE_EMAIL"
                      ? "border-[#23055c] bg-purple-50/50 text-[#23055c] font-bold"
                      : "border-[#EBE7F5] text-slate-700 hover:bg-[#F8F9FA]"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    checked={onboardingMethod === "INVITE_EMAIL"}
                    onChange={() => setOnboardingMethod("INVITE_EMAIL")}
                    className="w-3.5 h-3.5 text-[#23055c]"
                  />
                  <Mail className="w-4 h-4 text-[#23055c]" />
                  <span>Send Email Invitation</span>
                </label>

                <label
                  className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer text-xs ${
                    onboardingMethod === "DIRECT_CREDENTIAL"
                      ? "border-[#23055c] bg-purple-50/50 text-[#23055c] font-bold"
                      : "border-[#EBE7F5] text-slate-700 hover:bg-[#F8F9FA]"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    checked={onboardingMethod === "DIRECT_CREDENTIAL"}
                    onChange={() => setOnboardingMethod("DIRECT_CREDENTIAL")}
                    className="w-3.5 h-3.5 text-[#23055c]"
                  />
                  <Key className="w-4 h-4 text-[#23055c]" />
                  <span>Set Temporary Password</span>
                </label>
              </div>

              {onboardingMethod === "DIRECT_CREDENTIAL" && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Temporary Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter temporary password"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#F8F9FA] border border-[#EBE7F5] rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#23055c]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#F8F9FA] border-t border-[#EBE7F5] flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#23055c] text-white hover:bg-[#392271] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Onboarding..."
                  : onboardingMethod === "INVITE_EMAIL"
                    ? "Send Onboarding Invite"
                    : "Provision Staff Account"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
