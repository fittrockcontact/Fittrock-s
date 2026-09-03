'use client';

import React, { useState } from 'react';
import { X, PhoneCall, MessageSquare, Mail, Calendar, FileText, Clock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    name: string;
    phone: string;
    company?: string;
  };
  onActivityLogged?: () => void;
}

export function LogActivityModal({
  isOpen,
  onClose,
  lead,
  onActivityLogged,
}: LogActivityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'note'>('call');
  const [outcome, setOutcome] = useState('connected');
  const [durationMinutes, setDurationMinutes] = useState('3');
  const [notes, setNotes] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        type,
        outcome,
        durationSeconds: Number(durationMinutes || 0) * 60,
        notes: notes.trim(),
        performedBy: 'Sales Rep',
      };

      if (scheduleFollowUp && followUpDate) {
        payload.nextFollowUpDate = followUpDate;
        payload.nextFollowUpTitle = followUpTitle || `Follow-up call with ${lead.name}`;
      }

      const res = await apiFetch<{ success: boolean }>(`/api/sales/leads/${lead.id}/activities`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success(`Interaction logged with ${lead.name}`);
        if (onActivityLogged) onActivityLogged();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to log interaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset quick follow-up date buttons
  const setQuickFollowUp = (daysAhead: number, hour: number = 11) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, 0, 0, 0);
    // Format YYYY-MM-DDTHH:MM
    const isoString = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFollowUpDate(isoString);
    setScheduleFollowUp(true);
    setFollowUpTitle(`Follow up with ${lead.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#11131a] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Log Interaction</span>
              <span className="text-xs font-normal text-zinc-400">with</span>
              <span className="text-emerald-400 font-semibold">{lead.name}</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">{lead.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Interaction Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Communication Channel
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
              {[
                { id: 'call', label: 'Call', icon: PhoneCall },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'meeting', label: 'Demo', icon: Calendar },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'note', label: 'Note', icon: FileText },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = type === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setType(c.id as any)}
                    className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="connected">✅ Connected / Discussed</option>
                <option value="interested">🔥 Highly Interested</option>
                <option value="callback_requested">📞 Callback Requested</option>
                <option value="busy">⏳ Busy / Did not pick</option>
                <option value="not_interested">❌ Not Interested</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (mins)</label>
              <div className="flex items-center gap-1.5">
                {['1', '3', '5', '10'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                      durationMinutes === m
                        ? 'bg-zinc-700 text-white font-bold border border-zinc-500'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conversation Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Discussion Notes</label>
            <textarea
              rows={3}
              required
              placeholder="Summary of discussion, desk model preferred, tabletop color choice, budget, discount offered..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Schedule Next Follow-up Section */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleFollowUp}
                  onChange={(e) => setScheduleFollowUp(e.target.checked)}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Schedule Next Follow-up</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(1, 10)}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  Tomorrow 10 AM
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(2, 11)}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  In 2 Days
                </button>
              </div>
            </div>

            {scheduleFollowUp && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-100">
                <input
                  type="datetime-local"
                  required={scheduleFollowUp}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <input
                  type="text"
                  placeholder="Task title (e.g. Call to finalize tabletop dimension)"
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
