'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

interface AcceptOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    order_number?: string;
    orderNumber?: string;
    total_amount?: number | string;
    totalAmount?: number | string;
  };
  onOrderAccepted: () => void;
}

export function AcceptOrderModal({
  isOpen,
  onClose,
  order,
  onOrderAccepted,
}: AcceptOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const orderNum = order.order_number || order.orderNumber || order.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiFetch<{ success: boolean }>(`/api/sales/orders/${order.id}/accept`, {
        method: 'POST',
        body: JSON.stringify({
          note: note.trim(),
          acceptedBy: 'Sales Rep',
        }),
      });

      if (res.success) {
        toast.success(`Order ${orderNum} accepted and confirmed!`);
        onOrderAccepted();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#11131a] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-zinc-100">Accept & Confirm Order</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-zinc-300">
            Confirming order <span className="font-mono font-bold text-emerald-400">{orderNum}</span> advances it to{' '}
            <span className="font-semibold text-white">Confirmed / Processing</span> for warehouse packing and dispatch.
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Internal Verification Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Phone confirmed delivery address with customer. Tabletop in stock."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

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
              <span>Confirm Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
