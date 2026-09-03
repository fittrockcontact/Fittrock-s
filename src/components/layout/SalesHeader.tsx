'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, PhoneCall, Bell, ShoppingCart } from 'lucide-react';

interface SalesHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenNewLead?: () => void;
}

export function SalesHeader({
  title = "Today's Cockpit",
  subtitle = 'Overview of daily actions, urgent leads, and shipping status',
  onOpenNewLead,
}: SalesHeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#0d0f17]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Reminders Button Link */}
        <Link
          href="/reminders"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Follow-up Reminders</span>
        </Link>

        {/* Quick New Lead Button */}
        {onOpenNewLead ? (
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Lead</span>
          </button>
        ) : (
          <Link
            href="/leads?action=new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Lead</span>
          </Link>
        )}

        {/* Create Phone Order Button */}
        <Link
          href="/orders/create"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Create Phone Order</span>
        </Link>
      </div>
    </header>
  );
}
