'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, PlusCircle, ArrowUpRight, Building2, MapPin } from 'lucide-react';
import { formatINR, formatDate, getStageBadge, getPriorityBadge } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppDirectUrl } from '@/lib/whatsapp';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  city?: string;
  dealValue?: number | string;
  stage: string;
  priority: string;
  source: string;
  createdAt?: string;
}

interface LeadDataTableProps {
  leads: Lead[];
  onLogActivity: (lead: Lead) => void;
}

export function LeadDataTable({ leads, onLogActivity }: LeadDataTableProps) {
  const handleWhatsApp = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateWhatsAppMessage({
      customerName: lead.name,
      phone: lead.phone,
      templateType: 'initial_intro',
    });
    window.open(getWhatsAppDirectUrl(lead.phone, text), '_blank');
  };

  const handleCall = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${lead.phone}`;
  };

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
        <p className="text-sm font-semibold text-zinc-300">No leads found</p>
        <p className="text-xs text-zinc-500 mt-1">Try changing your search keywords or filters</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#0d0f17]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Customer / Lead</th>
              <th className="px-4 py-3">Phone & Outreach</th>
              <th className="px-4 py-3">Company & City</th>
              <th className="px-4 py-3">Est. Value</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {leads.map((lead) => {
              const stageBadge = getStageBadge(lead.stage);
              const priorityBadge = getPriorityBadge(lead.priority);

              return (
                <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors group">
                  {/* Name */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-bold text-zinc-100 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>{lead.name}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                    </Link>
                    {lead.email && <span className="text-[10px] text-zinc-500 block">{lead.email}</span>}
                  </td>

                  {/* Phone & 1-Click Outreach */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-200">{lead.phone}</span>
                      <button
                        onClick={(e) => handleCall(lead, e)}
                        title="Call"
                        className="p-1 rounded bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleWhatsApp(lead, e)}
                        title="Send WhatsApp"
                        className="p-1 rounded bg-zinc-800 hover:bg-teal-500/20 text-zinc-400 hover:text-teal-400 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Company & City */}
                  <td className="px-4 py-3">
                    <div className="text-zinc-300 font-medium">{lead.company || '-'}</div>
                    <div className="text-[10px] text-zinc-500">{lead.city || '-'}</div>
                  </td>

                  {/* Deal Value */}
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                    {formatINR(lead.dealValue)}
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${stageBadge.bg} ${stageBadge.text} ${stageBadge.border}`}
                    >
                      {stageBadge.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${priorityBadge.bg}`}>
                      {priorityBadge.label}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="px-4 py-3 text-zinc-400 text-[11px]">
                    {formatDate(lead.createdAt)}
                  </td>

                  {/* Quick Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onLogActivity(lead)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Log Call
                      </button>
                      <Link
                        href={`/orders/create?leadId=${lead.id}&name=${encodeURIComponent(lead.name)}&phone=${lead.phone}&company=${encodeURIComponent(lead.company || '')}`}
                        className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Order</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
