'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  AlertCircle,
  Calendar,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { SalesHeader } from '@/components/layout/SalesHeader';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppDirectUrl } from '@/lib/whatsapp';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; reminders: any[] }>(
        `/api/sales/reminders?status=${statusFilter}`
      );
      if (res.success) {
        setReminders(res.reminders || []);
      }
    } catch (err: any) {
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [statusFilter]);

  const handleComplete = async (id: string) => {
    try {
      await apiFetch(`/api/sales/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      toast.success('Reminder marked completed!');
      loadReminders();
    } catch (err: any) {
      toast.error('Failed to update reminder');
    }
  };

  const handleSnooze = async (id: string, hours: number) => {
    try {
      const newDate = new Date();
      newDate.setHours(newDate.getHours() + hours);

      await apiFetch(`/api/sales/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ dueAt: newDate.toISOString(), status: 'pending' }),
      });
      toast.success(`Follow-up snoozed for ${hours} hours`);
      loadReminders();
    } catch (err: any) {
      toast.error('Failed to snooze reminder');
    }
  };

  const handleWhatsApp = (lead: any) => {
    const text = generateWhatsAppMessage({
      customerName: lead.name || 'Customer',
      phone: lead.phone || '',
      templateType: 'quotation_followup',
    });
    window.open(getWhatsAppDirectUrl(lead.phone, text), '_blank');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] pb-16">
      <SalesHeader
        title="Follow-ups & Task Reminders"
        subtitle="Ensure zero leads slip through the cracks with scheduled call alerts"
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Filter bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-sm">
          <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Pending & Due
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Tasks
            </button>
          </div>

          <Link
            href="/leads"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            + Schedule from Leads
          </Link>
        </div>

        {/* Reminders List */}
        {isLoading ? (
          <div className="p-16 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading follow-up schedule...</span>
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
            <CheckCircle className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No tasks in this view</p>
            <p className="text-xs text-zinc-500 mt-1">
              All follow-ups for this selection are cleared. Great job!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((rem) => {
              const lead = rem.leads || rem;
              const isOverdue =
                rem.status === 'pending' && new Date(rem.due_at || rem.dueAt).getTime() < Date.now();

              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-xl bg-[#11131a] border transition-all shadow-sm flex items-center justify-between gap-4 ${
                    isOverdue
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : 'border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => rem.status === 'pending' && handleComplete(rem.id)}
                      className={`p-2 rounded-lg mt-0.5 transition-colors cursor-pointer ${
                        rem.status === 'completed'
                          ? 'text-emerald-400 bg-emerald-500/20'
                          : 'text-zinc-500 hover:text-emerald-400 bg-zinc-900 border border-zinc-800'
                      }`}
                      title={rem.status === 'completed' ? 'Completed' : 'Click to complete'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            rem.status === 'completed'
                              ? 'line-through text-zinc-500'
                              : 'text-zinc-100'
                          }`}
                        >
                          {rem.title}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        <span className="font-semibold text-zinc-300">
                          {rem.leadName || lead?.name || 'Prospect'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-zinc-400">
                          {rem.leadPhone || lead?.phone || '-'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-amber-400/90 text-[11px]">
                          Due: {formatDateTime(rem.due_at || rem.dueAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {rem.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      {(rem.leadPhone || lead?.phone) && (
                        <>
                          <a
                            href={`tel:${rem.leadPhone || lead?.phone}`}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() =>
                              handleWhatsApp({
                                name: rem.leadName || lead?.name,
                                phone: rem.leadPhone || lead?.phone,
                              })
                            }
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-400 transition-colors cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {/* Snooze dropdown / buttons */}
                      <button
                        onClick={() => handleSnooze(rem.id, 2)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        +2h
                      </button>
                      <button
                        onClick={() => handleSnooze(rem.id, 24)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Tomorrow
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
