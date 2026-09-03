'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, Plus, DollarSign, Calendar, MoreVertical, Building2 } from 'lucide-react';
import { formatINR, getPriorityBadge } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppDirectUrl } from '@/lib/whatsapp';

interface Lead {
  id: string;
  name: string;
  phone: string;
  company?: string;
  city?: string;
  dealValue?: number | string;
  stage: string;
  priority: string;
  createdAt?: string;
}

interface LeadKanbanBoardProps {
  leads: Lead[];
  onStageChange: (leadId: string, newStage: string) => void;
  onLogActivity: (lead: Lead) => void;
}

const STAGES = [
  { id: 'new', label: 'New Inquiries', color: 'border-blue-500/40 text-blue-400 bg-blue-500/5' },
  { id: 'contacted', label: 'Contacted', color: 'border-amber-500/40 text-amber-400 bg-amber-500/5' },
  { id: 'qualified', label: 'Qualified', color: 'border-purple-500/40 text-purple-400 bg-purple-500/5' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/5' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-orange-500/40 text-orange-400 bg-orange-500/5' },
  { id: 'won', label: 'Won / Deals Closed', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' },
];

export function LeadKanbanBoard({
  leads,
  onStageChange,
  onLogActivity,
}: LeadKanbanBoardProps) {
  const getLeadsByStage = (stageId: string) => leads.filter((l) => l.stage === stageId);

  const handleWhatsAppClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateWhatsAppMessage({
      customerName: lead.name,
      phone: lead.phone,
      templateType: 'initial_intro',
    });
    window.open(getWhatsAppDirectUrl(lead.phone, text), '_blank');
  };

  const handleCallClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${lead.phone}`;
  };

  return (
    <div className="grid grid-cols-6 gap-3 min-w-[1200px] pb-6 overflow-x-auto">
      {STAGES.map((stage) => {
        const stageLeads = getLeadsByStage(stage.id);
        const stageTotalValue = stageLeads.reduce(
          (sum, l) => sum + (parseFloat(String(l.dealValue || '0')) || 0),
          0
        );

        return (
          <div
            key={stage.id}
            className="bg-[#0f1118] border border-zinc-800/80 rounded-xl p-3 flex flex-col min-h-[600px]"
          >
            {/* Column Header */}
            <div className={`p-2.5 rounded-lg border mb-3 ${stage.color}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold tracking-tight">{stage.label}</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-900/80 font-mono font-bold">
                  {stageLeads.length}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono font-medium">
                {formatINR(stageTotalValue)}
              </p>
            </div>

            {/* Cards List */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
              {stageLeads.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800/60 rounded-lg flex items-center justify-center text-[11px] text-zinc-600">
                  No leads in stage
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const priority = getPriorityBadge(lead.priority);

                  return (
                    <div
                      key={lead.id}
                      className="p-3 rounded-xl bg-[#141722] border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm group relative"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-1.5 mb-2">
                        <div>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-xs font-bold text-zinc-100 hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {lead.name}
                          </Link>
                          {lead.company && (
                            <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[120px]">{lead.company}</span>
                            </p>
                          )}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${priority.bg}`}>
                          {priority.label}
                        </span>
                      </div>

                      {/* Phone & Deal Value */}
                      <div className="flex items-center justify-between text-[11px] mb-3">
                        <span className="font-mono text-zinc-400 text-[10px]">{lead.phone}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatINR(lead.dealValue)}
                        </span>
                      </div>

                      {/* 1-Click Action Bar */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1.5">
                        <button
                          onClick={(e) => handleCallClick(lead, e)}
                          title="Click to Call"
                          className="flex-1 py-1 rounded bg-zinc-900 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 border border-zinc-800 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={(e) => handleWhatsAppClick(lead, e)}
                          title="Direct WhatsApp"
                          className="flex-1 py-1 rounded bg-zinc-900 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-400 border border-zinc-800 flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>WA</span>
                        </button>
                        <button
                          onClick={() => onLogActivity(lead)}
                          title="Log Interaction"
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Log
                        </button>
                      </div>

                      {/* Quick Stage Advance Selector */}
                      <div className="mt-2">
                        <select
                          value={lead.stage}
                          onChange={(e) => onStageChange(lead.id, e.target.value)}
                          className="w-full bg-zinc-950/80 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] text-zinc-400 hover:text-zinc-200 focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move: {s.label}
                            </option>
                          ))}
                          <option value="lost">Move: Lost</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
