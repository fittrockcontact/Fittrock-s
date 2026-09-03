'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Plus,
  Flame,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { SalesHeader } from '@/components/layout/SalesHeader';
import { LeadKanbanBoard } from '@/components/leads/LeadKanbanBoard';
import { LeadDataTable } from '@/components/leads/LeadDataTable';
import { NewLeadModal } from '@/components/leads/NewLeadModal';
import { LogActivityModal } from '@/components/leads/LogActivityModal';
import { apiFetch } from '@/lib/api-client';
import { formatINR } from '@/lib/utils';

function LeadCenterContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [activeLogLead, setActiveLogLead] = useState<any>(null);

  // Auto-open modal if URL has ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewLeadOpen(true);
    }
  }, [searchParams]);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (stageFilter !== 'all') params.set('stage', stageFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);

      const res = await apiFetch<{ success: boolean; leads: any[] }>(
        `/api/sales/leads?${params.toString()}`
      );
      if (res.success) {
        setLeads(res.leads || []);
      }
    } catch (err: any) {
      console.error('Failed to load leads:', err);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, stageFilter, priorityFilter]);

  const handleStageChange = async (leadId: string, newStage: string) => {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
      );

      await apiFetch(`/api/sales/leads/${leadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
      });

      toast.success(`Lead moved to ${newStage.replace('_', ' ')}`);
    } catch (err: any) {
      toast.error('Failed to update stage');
      loadLeads();
    }
  };

  // Metrics
  const totalPipelineValue = leads.reduce(
    (sum, l) => sum + (parseFloat(String(l.dealValue || l.deal_value || '0')) || 0),
    0
  );
  const hotLeadsCount = leads.filter((l) => l.priority === 'hot').length;

  return (
    <div className="min-h-screen bg-[#090a0f] pb-12">
      <SalesHeader
        title="Lead Center & CRM Pipeline"
        subtitle="Manage prospective clients, track deal stages, and execute fast phone & WhatsApp outreach"
        onOpenNewLead={() => setIsNewLeadOpen(true)}
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-5">
        {/* Controls & Metrics Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-sm">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[260px] flex-1 max-w-sm">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by customer name, phone, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won / Closed</option>
              <option value="lost">Lost</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Priorities</option>
              <option value="hot">🔥 Hot</option>
              <option value="warm">⚡ Warm</option>
              <option value="cold">❄️ Cold</option>
            </select>
          </div>

          {/* Quick Metrics & View Mode Switcher */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 text-xs border-r border-zinc-800 pr-4">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Hot:</span>
                <span className="font-mono font-bold text-zinc-100">{hotLeadsCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pipeline:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatINR(totalPipelineValue)}
                </span>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-zinc-900 rounded-lg border border-zinc-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Kanban Pipeline"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pipeline</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Data Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Views */}
        {isLoading ? (
          <div className="p-16 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading sales pipeline...</span>
          </div>
        ) : viewMode === 'kanban' ? (
          <LeadKanbanBoard
            leads={leads}
            onStageChange={handleStageChange}
            onLogActivity={(lead) => setActiveLogLead(lead)}
          />
        ) : (
          <LeadDataTable
            leads={leads}
            onLogActivity={(lead) => setActiveLogLead(lead)}
          />
        )}
      </div>

      {/* Modals */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onLeadCreated={() => loadLeads()}
      />

      {activeLogLead && (
        <LogActivityModal
          isOpen={!!activeLogLead}
          onClose={() => setActiveLogLead(null)}
          lead={activeLogLead}
          onActivityLogged={() => loadLeads()}
        />
      )}
    </div>
  );
}

export default function LeadCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-xs text-zinc-400">
          Loading lead center...
        </div>
      }
    >
      <LeadCenterContent />
    </Suspense>
  );
}
