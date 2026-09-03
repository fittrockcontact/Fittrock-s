'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Building,
  MapPin,
  Mail,
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { SalesHeader } from '@/components/layout/SalesHeader';
import { LogActivityModal } from '@/components/leads/LogActivityModal';
import { apiFetch } from '@/lib/api-client';
import { formatINR, formatDateTime, getStageBadge, getPriorityBadge } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppDirectUrl } from '@/lib/whatsapp';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const loadLead = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; lead: any }>(`/api/sales/leads/${id}`);
      if (res.success) {
        setLead(res.lead);
      }
    } catch (err: any) {
      toast.error('Failed to load lead profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadLead();
  }, [id]);

  const handleWhatsApp = () => {
    if (!lead) return;
    const text = generateWhatsAppMessage({
      customerName: lead.name,
      phone: lead.phone,
      templateType: 'initial_intro',
    });
    window.open(getWhatsAppDirectUrl(lead.phone, text), '_blank');
  };

  const handleStageChange = async (newStage: string) => {
    try {
      await apiFetch(`/api/sales/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
      });
      toast.success(`Lead moved to ${newStage}`);
      loadLead();
    } catch (err: any) {
      toast.error('Failed to update stage');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-zinc-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Loading lead profile...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#090a0f] p-8 text-center text-zinc-300">
        <p>Lead not found</p>
        <Link href="/leads" className="text-emerald-400 hover:underline text-xs mt-2 inline-block">
          Return to Lead Center
        </Link>
      </div>
    );
  }

  const stageBadge = getStageBadge(lead.stage);
  const priorityBadge = getPriorityBadge(lead.priority);

  return (
    <div className="min-h-screen bg-[#090a0f] pb-16">
      <SalesHeader
        title={lead.name}
        subtitle={`Lead Profile • Added ${formatDateTime(lead.created_at || lead.createdAt)}`}
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lead Pipeline</span>
        </Link>

        {/* Lead Profile Hero Card */}
        <div className="p-6 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-100">{lead.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stageBadge.bg} ${stageBadge.text} ${stageBadge.border}`}
                >
                  {stageBadge.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityBadge.bg}`}>
                  {priorityBadge.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                <span className="font-mono font-bold text-zinc-200">{lead.phone}</span>
                {lead.email && <span>• {lead.email}</span>}
                {lead.company && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-zinc-500" />
                    {lead.company}
                  </span>
                )}
                {lead.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    {lead.city}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-zinc-200 hover:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
              <button
                onClick={handleWhatsApp}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-200 hover:text-teal-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Log Interaction
              </button>
              <Link
                href={`/orders/create?leadId=${lead.id}&name=${encodeURIComponent(lead.name)}&phone=${lead.phone}&company=${encodeURIComponent(lead.company || '')}&dealValue=${lead.deal_value || lead.dealValue || ''}`}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Convert to Order</span>
              </Link>
            </div>
          </div>

          {/* Quick Stage Bar */}
          <div className="pt-4 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-semibold">Advance Pipeline Stage:</span>
            <div className="flex flex-wrap gap-1.5">
              {['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => handleStageChange(st)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      lead.stage === st
                        ? 'bg-emerald-500 text-zinc-950 font-bold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {st.replace('_', ' ').toUpperCase()}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Split: Timeline History & Reminders */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Interaction Timeline */}
          <div className="col-span-8 bg-[#11131a] border border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Activity & Call History</span>
              </h3>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                + Log Call / Note
              </button>
            </div>

            {!lead.activities || lead.activities.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                No calls or interactions logged yet. Click &quot;Log Interaction&quot; to add notes.
              </div>
            ) : (
              <div className="relative border-l border-zinc-800 ml-3 space-y-6">
                {lead.activities.map((act: any) => (
                  <div key={act.id} className="relative pl-6 group">
                    {/* Timeline Node */}
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#11131a]" />

                    <div className="p-4 rounded-xl bg-[#151824] border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-200 uppercase text-[10px] tracking-wider text-emerald-400">
                          {act.type} • {act.outcome || 'Logged'}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {formatDateTime(act.created_at || act.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                        {act.notes || 'No remarks added'}
                      </p>
                      {act.duration_seconds > 0 && (
                        <div className="text-[10px] text-zinc-500 font-mono pt-1">
                          Duration: {Math.floor(act.duration_seconds / 60)} min
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Follow-up Reminders */}
          <div className="col-span-4 space-y-6">
            <div className="bg-[#11131a] border border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Scheduled Follow-ups</span>
              </h3>

              {!lead.reminders || lead.reminders.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No upcoming reminders.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lead.reminders.map((rem: any) => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl bg-[#151824] border border-zinc-800/90 text-xs"
                    >
                      <div className="font-semibold text-zinc-200">{rem.title}</div>
                      <div className="text-[10px] font-mono text-amber-400 mt-1">
                        Due: {formatDateTime(rem.due_at || rem.dueAt)}
                      </div>
                      {rem.status === 'completed' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold inline-block mt-1">
                          Completed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Requirement Notes */}
            {lead.notes && (
              <div className="bg-[#11131a] border border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Initial Requirement Notes
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLogModalOpen && (
        <LogActivityModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          lead={lead}
          onActivityLogged={() => loadLead()}
        />
      )}
    </div>
  );
}
