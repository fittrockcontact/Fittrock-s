'use client';

import React, { useState } from 'react';
import { X, Truck, UserCheck, ExternalLink, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

interface ShipOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    order_number?: string;
    orderNumber?: string;
    customer?: {
      full_name?: string;
      phone?: string;
    };
    shipping_address?: {
      city?: string;
      line1?: string;
    };
  };
  onOrderShipped: () => void;
}

const POPULAR_CARRIERS = [
  { name: 'Delhivery', trackingUrlPrefix: 'https://www.delhivery.com/track/package/' },
  { name: 'BlueDart', trackingUrlPrefix: 'https://www.bluedart.com/tracking?trackNumber=' },
  { name: 'DTDC', trackingUrlPrefix: 'https://www.dtdc.in/tracking.asp?strCnno=' },
  { name: 'Shiprocket', trackingUrlPrefix: 'https://shiprocket.co/tracking/' },
  { name: 'Porter', trackingUrlPrefix: '' },
  { name: 'Custom Courier', trackingUrlPrefix: '' },
];

export function ShipOrderModal({
  isOpen,
  onClose,
  order,
  onOrderShipped,
}: ShipOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'courier' | 'direct'>('courier');

  // Courier state
  const [carrierName, setCarrierName] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  // Direct delivery state
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  if (!isOpen) return null;

  const orderNum = order.order_number || order.orderNumber || order.id;

  const handleCarrierChange = (carrier: string) => {
    setCarrierName(carrier);
    const found = POPULAR_CARRIERS.find((c) => c.name === carrier);
    if (found && found.trackingUrlPrefix && trackingNumber) {
      setTrackingUrl(`${found.trackingUrlPrefix}${trackingNumber}`);
    }
  };

  const handleTrackingNumberChange = (tracking: string) => {
    setTrackingNumber(tracking);
    const found = POPULAR_CARRIERS.find((c) => c.name === carrierName);
    if (found && found.trackingUrlPrefix) {
      setTrackingUrl(`${found.trackingUrlPrefix}${tracking.trim()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryType === 'courier' && !carrierName) {
      toast.error('Please select a courier partner');
      return;
    }

    if (deliveryType === 'direct' && !driverName.trim()) {
      toast.error('Driver / Delivery person name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        deliveryType,
        carrierName: deliveryType === 'courier' ? carrierName : 'Direct Delivery',
        trackingNumber: deliveryType === 'courier' ? trackingNumber.trim() : null,
        trackingUrl: deliveryType === 'courier' ? trackingUrl.trim() : null,
        driverName: deliveryType === 'direct' ? driverName.trim() : null,
        driverPhone: deliveryType === 'direct' ? driverPhone.trim() : null,
        deliveryNotes: deliveryNotes.trim() || null,
      };

      const res = await apiFetch<{ success: boolean }>(`/api/sales/orders/${order.id}/ship`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success(`Order ${orderNum} marked as Shipped & In Transit!`);
        onOrderShipped();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#11131a] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">Dispatch Order {orderNum}</h3>
              <p className="text-xs text-zinc-400">
                To: {order.customer?.full_name || 'Customer'} ({order.shipping_address?.city || 'India'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4 pb-1">
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setDeliveryType('courier')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deliveryType === 'courier'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Courier Partner (AWB)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('direct')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deliveryType === 'direct'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Direct / Self Delivery</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {deliveryType === 'courier' ? (
            /* Courier Mode */
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Courier Partner
                </label>
                <select
                  value={carrierName}
                  onChange={(e) => handleCarrierChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {POPULAR_CARRIERS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  AWB / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1293847291823"
                  value={trackingNumber}
                  onChange={(e) => handleTrackingNumberChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Live Tracking URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://delhivery.com/track/package/..."
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-3 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2 text-zinc-400 hover:text-emerald-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Direct / Self Delivery Mode */
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                Direct / Self Delivery mode records your local delivery personnel or driver details for local city deliveries.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Driver / Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Shinde"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Driver Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9823000000"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Delivery Notes & Time Slot
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dispatched in company van MH-12-XX-1234. Customer scheduled for delivery between 3 PM - 5 PM."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

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
              <span>Mark Shipped</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
