'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@daih/api-client';
import { useToast } from '@daih/ui';
import { UserRole } from '@daih/types';
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginForm: React.FC = () => {
  const router = useRouter();
  const { login, logout } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!email.trim()) {
      toast.warning('Please enter your administrator email address.', {
        title: 'Email Required',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.warning('Please enter a valid administrator email address.', {
        title: 'Invalid Email Format',
      });
      return false;
    }

    if (!password) {
      toast.warning('Please enter your administrator password.', {
        title: 'Password Required',
      });
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const user = await login({
        email: email.trim().toLowerCase(),
        password,
        portal: 'admin',
      });

      // Enforce staff/admin role access
      if (user.role === UserRole.CUSTOMER) {
        await logout();
        const msg =
          'Access Denied: Customer accounts cannot access the Staff & Admin Console. Please use the Customer PWA.';
        setErrorMessage(msg);
        toast.error(msg, { title: 'Access Denied' });
        return;
      }

      toast.success(`Welcome back, ${user.firstName}! Redirecting to console...`, {
        title: 'Access Granted',
      });
      router.push('/operations');
    } catch (err: any) {
      const msg = err?.message || 'Invalid administrator credentials. Please try again.';
      setErrorMessage(msg);
      toast.error(msg, { title: 'Authentication Failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Inline Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-medium flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form noValidate onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-700" htmlFor="email">
            Admin Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@daihworkspace.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#23055c] focus:ring-2 focus:ring-[#23055c] transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#23055c] focus:ring-2 focus:ring-[#23055c] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#23055c] transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#23055c] focus:ring-[#23055c] cursor-pointer"
            />
            <span>Keep me signed in</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#23055c] hover:text-[#392271] transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#392271] hover:bg-[#23055c] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
