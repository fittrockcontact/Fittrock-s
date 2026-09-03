import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const diffSec = Math.floor((new Date().getTime() - new Date(dateInput).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function getStageBadge(stage: string): { label: string; bg: string; text: string; border: string } {
  switch (stage) {
    case 'new':
      return { label: 'New Lead', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
    case 'contacted':
      return { label: 'Contacted', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'qualified':
      return { label: 'Qualified', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
    case 'proposal_sent':
      return { label: 'Proposal Sent', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' };
    case 'negotiation':
      return { label: 'Negotiating', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
    case 'won':
      return { label: 'Won / Deal Closed', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    case 'lost':
      return { label: 'Lost', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
    default:
      return { label: stage, bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' };
  }
}

export function getPriorityBadge(priority: string): { label: string; bg: string } {
  switch (priority) {
    case 'hot':
      return { label: '🔥 Hot', bg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' };
    case 'warm':
      return { label: '⚡ Warm', bg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
    case 'cold':
      return { label: '❄️ Cold', bg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' };
    default:
      return { label: priority, bg: 'bg-zinc-800 text-zinc-300 border border-zinc-700' };
  }
}
