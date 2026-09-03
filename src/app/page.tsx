'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Bell,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Phone,
  MessageSquare,
  PackageCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { SalesHeader } from '@/components/layout/SalesHeader';
import { LogActivityModal } from '@/components/leads/LogActivityModal';
import { NewLeadModal } from '@/components/leads/NewLeadModal';
import { AcceptOrderModal } from '@/components/orders/AcceptOrderModal';
import { ShipOrderModal } from '@/components/orders/ShipOrderModal';
import { apiFetch } from '@/lib/api-client';
import { formatINR, formatDateTime, getPriorityBadge } from '@/lib/utils';
import { generateWhatsAppMessage, getWhatsAppDirectUrl } from '@/lib/whatsapp';

export default function TodayCockpitPage() {
  const [stats, setStats] = useState<any>({
    callsToday: 0,
    pendingReminders: 0,
    pendingOrders: 0,
    readyToShipOrders: 0,
    shippedToday: 0,
    wonRevenue: 0,
  });

  const [reminders, setReminders] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [activeLogLead, setActiveLogLead] = useState<any>(null);
  const [activeAcceptOrder, setActiveAcceptOrder] = useState<any>(null);
  const [activeShipOrder, setActiveShipOrder] = useState<any>(null);

  const loadCockpitData = async () => {
    setIsLoading(true);
    try {
      // 1. Stats
      const statsRes = await apiFetch<any>('/api/sales/stats');
      if (statsRes.success) setStats(statsRes.stats);

      // 2. Today's Reminders
      const remRes = await apiFetch<any>('/api/sales/reminders/today');
      if (remRes.success) setReminders(remRes.reminders || []);

      // 3. Pending Orders needing acceptance
      const ordRes = await apiFetch<any>('/api/sales/orders?status=pending_acceptance');
      if (ordRes.success) setPendingOrders((ordRes.orders || []).slice(0, 5));

      // 4. Inbound leads
      const leadsRes = await apiFetch<any>('/api/sales/leads?limit=5');
      if (leadsRes.success) setRecentLeads(leadsRes.leads || []);
    } catch (err: any) {
      console.error('Error loading cockpit data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCockpitData();
  }, []);

  const handleCompleteReminder = async (remId: string) => {
    try {
      await apiFetch(`/api/sales/reminders/${remId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      toast.success('Follow-up task marked completed!');
      loadCockpitData();
    } catch (err: any) {
      toast.error('Failed to complete reminder');
    }
  };

  const handleWhatsApp = (lead: any) => {
    const text = generateWhatsAppMessage({
      customerName: lead.name,
      phone: lead.phone,
      templateType: 'initial_intro',
    });
    window.open(getWhatsAppDirectUrl(lead.phone, text), '_blank');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] pb-12">
      <SalesHeader
        title="Today's Action Cockpit"
        subtitle="Your daily sales command center: urgent follow-ups, order approvals & call targets"
        onOpenNewLead={() => setIsNewLeadOpen(true)}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Stats Ribbon */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-[#11131a] border border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
              <span>Calls Logged Today</span>
              <PhoneCall className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-100">{stats.callsToday}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Target: 30 calls/day</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11131a] border border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
              <span>Due Reminders</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">{stats.pendingReminders}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Pending today & overdue</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11131a] border border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
              <span>Orders to Accept</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400">{stats.pendingOrders}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Awaiting confirmation</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11131a] border border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
              <span>Ready for Dispatch</span>
              <Truck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-400">{stats.readyToShipOrders}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Warehouse packing</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11131a] border border-zinc-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
              <span>Won Deals (Month)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {formatINR(stats.wonRevenue)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Direct sales pipeline</div>
          </div>
        </div>

        {/* 2-Column Action Split */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Urgent Reminders & Follow-up Queue (7 Cols) */}
          <div className="col-span-7 space-y-6">
            {/* Today's Follow-up Engine */}
            <div className="bg-[#11131a] border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Today&apos;s Follow-up Queue</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Prospects scheduled for follow-up calls or quotations
                  </p>
                </div>
                <Link
                  href="/reminders"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {reminders.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
                  <CheckCircle className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-300">All follow-ups cleared!</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    You have no overdue or pending reminders for today.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reminders.map((rem) => {
                    const lead = rem.leads || rem;
                    return (
                      <div
                        key={rem.id}
                        className="p-3.5 rounded-xl bg-[#151824] border border-zinc-800/90 hover:border-zinc-700 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-100">{rem.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                              {formatDateTime(rem.due_at || rem.dueAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                            <span className="font-semibold text-zinc-200">
                              {rem.leadName || rem.leads?.name || 'Contact'}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-zinc-400">
                              {rem.leadPhone || rem.leads?.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`tel:${rem.leadPhone || rem.leads?.phone}`}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 transition-colors"
                            title="Call Now"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() =>
                              handleWhatsApp({
                                name: rem.leadName || rem.leads?.name || 'Customer',
                                phone: rem.leadPhone || rem.leads?.phone || '',
                              })
                            }
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-400 transition-colors cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setActiveLogLead({
                                id: rem.lead_id || rem.leadId,
                                name: rem.leadName || rem.leads?.name || 'Customer',
                                phone: rem.leadPhone || rem.leads?.phone || '',
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Log
                          </button>
                          <button
                            onClick={() => handleCompleteReminder(rem.id)}
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                            title="Mark Done"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fresh Incoming Inquiries */}
            <div className="bg-[#11131a] border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>Recent Inbound Leads</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">First-contact outreach within 15 minutes</p>
                </div>
                <Link
                  href="/leads"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Lead Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {recentLeads.map((lead) => {
                  const priority = getPriorityBadge(lead.priority);
                  return (
                    <div
                      key={lead.id}
                      className="p-3 rounded-xl bg-[#151824] border border-zinc-800/90 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-xs font-bold text-zinc-100 hover:text-emerald-400 transition-colors"
                          >
                            {lead.name}
                          </Link>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${priority.bg}`}>
                            {priority.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="font-mono">{lead.phone}</span>
                          {lead.company && <span>• {lead.company}</span>}
                          {lead.city && <span>• {lead.city}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-emerald-400 mr-2">
                          {formatINR(lead.deal_value || lead.dealValue)}
                        </span>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleWhatsApp(lead)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-400 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Approvals & Shipping Dispatch (5 Cols) */}
          <div className="col-span-5 space-y-6">
            {/* Orders Requiring Acceptance */}
            <div className="bg-[#11131a] border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Orders Needing Acceptance</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Review and confirm web & inquiry orders
                  </p>
                </div>
                <Link
                  href="/orders"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Orders Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
                  <CheckCircle className="w-6 h-6 text-cyan-400/60 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-zinc-300">All orders approved!</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">No pending web orders</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingOrders.map((ord) => {
                    const orderNum = ord.order_number || ord.orderNumber || ord.id;
                    const cust = ord.customer || {};
                    const total = ord.total_amount || ord.totalAmount;

                    return (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl bg-[#151824] border border-zinc-800/90 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-zinc-100">{orderNum}</span>
                            <span className="font-mono font-bold text-xs text-emerald-400">
                              {formatINR(total)}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {cust.full_name || 'Customer'} • {cust.phone || '-'}
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveAcceptOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Accept
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-[#11131a] border border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Quick Sales Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsNewLeadOpen(true)}
                  className="p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-left border border-zinc-700/60 transition-all cursor-pointer group"
                >
                  <Plus className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-zinc-200">New Lead</div>
                  <div className="text-[10px] text-zinc-400">Add inquiry data</div>
                </button>

                <Link
                  href="/orders/create"
                  className="p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-left border border-zinc-700/60 transition-all group"
                >
                  <PackageCheck className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-zinc-200">Phone Order</div>
                  <div className="text-[10px] text-zinc-400">Custom prices</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onLeadCreated={() => loadCockpitData()}
      />

      {activeLogLead && (
        <LogActivityModal
          isOpen={!!activeLogLead}
          onClose={() => setActiveLogLead(null)}
          lead={activeLogLead}
          onActivityLogged={() => loadCockpitData()}
        />
      )}

      {activeAcceptOrder && (
        <AcceptOrderModal
          isOpen={!!activeAcceptOrder}
          onClose={() => setActiveAcceptOrder(null)}
          order={activeAcceptOrder}
          onOrderAccepted={() => loadCockpitData()}
        />
      )}
    </div>
  );
}
