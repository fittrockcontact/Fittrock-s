'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PackageCheck,
  PlusCircle,
  Bell,
  PhoneCall,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Today's Cockpit", href: '/', icon: LayoutDashboard },
  { name: 'Lead Center', href: '/leads', icon: Users },
  { name: 'Orders & Dispatch', href: '/orders', icon: PackageCheck },
  { name: 'Create Phone Order', href: '/orders/create', icon: PlusCircle },
  { name: 'Follow-ups & Tasks', href: '/reminders', icon: Bell },
];

export function SalesSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-[#0d0f17] flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            FR
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight">FITTROCK</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Sales
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Daily Cockpit & CRM</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Operations
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sales Target Micro-Widget */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Daily Target
          </span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Focus today: Follow up on high-priority quotation leads & dispatch pending orders.
        </p>
      </div>

      {/* Rep Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
            SR
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200">Sales Desk</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-zinc-500 font-mono">Backend Live</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
