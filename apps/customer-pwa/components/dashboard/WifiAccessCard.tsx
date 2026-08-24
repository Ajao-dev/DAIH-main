'use client';

import React from 'react';
import { Wifi, Copy, Check } from 'lucide-react';
import { useToast } from '@daih/ui';

interface WifiAccessCardProps {
  networkName?: string;
  password?: string;
}

export const WifiAccessCard: React.FC<WifiAccessCardProps> = ({
  networkName = 'DAIH_Executive_5G',
  password = 'InnovateTogether2026',
}) => {
  const [copied, setCopied] = React.useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Wi-Fi password copied to clipboard!', { title: 'Wi-Fi Connected' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info(`Wi-Fi Password: ${password}`, { title: 'Network Password' });
    }
  };

  return (
    <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#23055c] flex items-center justify-center shrink-0 border border-purple-100/60">
          <Wifi className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Member Wi-Fi
          </h3>
          <p className="text-base font-bold text-[#181c20] truncate">
            {networkName}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        title="Copy Wi-Fi Password"
        className="text-[#23055c] hover:bg-purple-50 p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 border border-transparent hover:border-purple-100"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
