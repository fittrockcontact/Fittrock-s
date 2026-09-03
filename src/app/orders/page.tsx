'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Search,
  Truck,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  PlusCircle,
  Phone,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { SalesHeader } from '@/components/layout/SalesHeader';
import { AcceptOrderModal } from '@/components/orders/AcceptOrderModal';
import { ShipOrderModal } from '@/components/orders/ShipOrderModal';
import { apiFetch } from '@/lib/api-client';
import { formatINR, formatOrderINR, formatDateTime } from '@/lib/utils';

export default function OrdersFulfillmentPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending_acceptance' | 'ready_to_ship' | 'shipped' | 'delivered' | 'all'>('ready_to_ship');
  const [counts, setCounts] = useState<{
    pending_acceptance: number;
    ready_to_ship: number;
    shipped: number;
    delivered: number;
    all: number;
  }>({
    pending_acceptance: 0,
    ready_to_ship: 0,
    shipped: 0,
    delivered: 0,
    all: 0,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [activeAcceptOrder, setActiveAcceptOrder] = useState<any>(null);
  const [activeShipOrder, setActiveShipOrder] = useState<any>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (search.trim()) params.set('search', search.trim());

      const res = await apiFetch<{
        success: boolean;
        orders: any[];
        counts?: {
          pending_acceptance: number;
          ready_to_ship: number;
          shipped: number;
          delivered: number;
          all: number;
        };
      }>(`/api/sales/orders?${params.toString()}`);

      if (res.success) {
        setOrders(res.orders || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err: any) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#090a0f] pb-16">
      <SalesHeader
        title="Orders & Shipping Dispatch"
        subtitle="Accept incoming orders, verify items, and dispatch via courier partners or direct delivery"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-sm">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            {[
              { id: 'pending_acceptance', label: 'Needs Acceptance', icon: Clock, count: counts.pending_acceptance },
              { id: 'ready_to_ship', label: 'Ready to Ship', icon: PackageCheck, count: counts.ready_to_ship },
              { id: 'shipped', label: 'In Transit / Dispatched', icon: Truck, count: counts.shipped },
              { id: 'delivered', label: 'Delivered', icon: CheckCircle, count: counts.delivered },
              { id: 'all', label: 'All Orders', icon: PackageCheck, count: counts.all },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <Link
              href="/orders/create"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Order</span>
            </Link>
          </div>
        </div>

        {/* Orders Table / Cards */}
        {isLoading ? (
          <div className="p-16 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 space-y-3">
            <PackageCheck className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No orders in this view</p>
            <p className="text-xs text-zinc-500">
              There are currently no orders in the &ldquo;{activeTab.replace(/_/g, ' ')}&rdquo; status.
            </p>
            {activeTab !== 'all' && counts.all > 0 && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>View All Orders ({counts.all})</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const orderNum = ord.order_number || ord.orderNumber || ord.id;
              const cust = ord.customer || {};
              const addr = ord.shipping_address || {};
              const items = ord.items || [];
              const latestShipment = ord.shipments?.[0] || null;

              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-[#11131a] border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-sm space-y-4"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-zinc-100">{orderNum}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          ['confirmed', 'processing'].includes(ord.status)
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : ord.status === 'shipped'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : ord.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Placed: {formatDateTime(ord.placed_at || ord.placedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">Total Amount</span>
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          {formatOrderINR(ord.total_amount || ord.totalAmount)}
                        </span>
                      </div>

                      {/* Action Buttons depending on status */}
                      {ord.status === 'pending' && (
                        <button
                          onClick={() => setActiveAcceptOrder(ord)}
                          className="px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          Accept Order
                        </button>
                      )}

                      {['confirmed', 'processing'].includes(ord.status) && (
                        <button
                          onClick={() => setActiveShipOrder(ord)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch / Ship</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer, Shipping Address & Line Items */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Customer */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Customer</span>
                      <div className="font-bold text-zinc-200">{cust.full_name || 'Direct Customer'}</div>
                      <div className="font-mono text-zinc-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{cust.phone || '-'}</span>
                      </div>
                      {cust.business_name && (
                        <div className="text-[11px] text-zinc-400">
                          {cust.business_name} {cust.gst_number && `(GST: ${cust.gst_number})`}
                        </div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">
                        Delivery Destination
                      </span>
                      <div className="text-zinc-300 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                        <span>
                          {addr.line1 ? `${addr.line1}, ${addr.city}, ${addr.state} - ${addr.postal_code}` : 'Store Pickup / Contact Customer'}
                        </span>
                      </div>
                    </div>

                    {/* Shipment Info (if shipped) */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">
                        Fulfillment / Dispatch
                      </span>
                      {latestShipment ? (
                        <div>
                          <div className="font-bold text-purple-400 flex items-center gap-1.5">
                            {latestShipment.delivery_type === 'direct' ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Direct Delivery ({latestShipment.driver_name || 'Driver'})</span>
                              </>
                            ) : (
                              <>
                                <Truck className="w-3.5 h-3.5" />
                                <span>{latestShipment.carrier_name || 'Courier Partner'}</span>
                              </>
                            )}
                          </div>
                          {latestShipment.tracking_number && (
                            <div className="font-mono text-zinc-300 mt-1 flex items-center gap-2">
                              <span>AWB: {latestShipment.tracking_number}</span>
                              {latestShipment.tracking_url && (
                                <a
                                  href={latestShipment.tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                                >
                                  <span>Track</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-zinc-500">Awaiting dispatch</div>
                      )}
                    </div>
                  </div>

                  {/* Line Items List */}
                  {items.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/50">
                      <div className="text-[11px] text-zinc-400 font-medium mb-1.5">
                        Order Items ({items.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item: any) => (
                          <div
                            key={item.id}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-2"
                          >
                            <span className="font-bold">{item.product_title}</span>
                            {item.variant_title && (
                              <span className="text-zinc-500">({item.variant_title})</span>
                            )}
                            <span className="font-mono text-zinc-400">x{item.quantity}</span>
                            <span className="font-mono font-semibold text-emerald-400">
                              {formatOrderINR(item.line_total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeAcceptOrder && (
        <AcceptOrderModal
          isOpen={!!activeAcceptOrder}
          onClose={() => setActiveAcceptOrder(null)}
          order={activeAcceptOrder}
          onOrderAccepted={() => loadOrders()}
        />
      )}

      {activeShipOrder && (
        <ShipOrderModal
          isOpen={!!activeShipOrder}
          onClose={() => setActiveShipOrder(null)}
          order={activeShipOrder}
          onOrderShipped={() => loadOrders()}
        />
      )}
    </div>
  );
}
