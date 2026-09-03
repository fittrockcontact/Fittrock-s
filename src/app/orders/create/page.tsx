'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus,
  Trash2,
  Tag,
  Loader2,
  CheckCircle,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { SalesHeader } from '@/components/layout/SalesHeader';
import { apiFetch } from '@/lib/api-client';
import { formatINR } from '@/lib/utils';

interface ProductOption {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  price: number;
  stock: number;
}

interface OrderLineItem {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  originalPrice: number;
  unitPrice: number; // editable by sales rep!
  quantity: number;
  lineTotal: number;
}

function CreateSalesOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [productsList, setProductsList] = useState<ProductOption[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill lead if linked
  const leadId = searchParams.get('leadId') || undefined;

  // Customer Form
  const [customer, setCustomer] = useState({
    fullName: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '',
      country: 'India',
    },
    isBusiness: false,
    gstNumber: '',
    businessName: searchParams.get('company') || '',
  });

  // Items & Pricing
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);
  const [customDiscount, setCustomDiscount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay_link' | 'bank_transfer'>('cod');
  const [internalNote, setInternalNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Load Catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await apiFetch<{ success: boolean; products: ProductOption[] }>('/api/sales/products');
        if (res.success) {
          setProductsList(res.products || []);
          if (res.products && res.products.length > 0) {
            setSelectedVariantId(res.products[0].variantId);
          }
        }
      } catch (err: any) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, []);

  // Add Item to Line Items
  const handleAddItem = () => {
    if (!selectedVariantId) return;
    const prod = productsList.find((p) => p.variantId === selectedVariantId);
    if (!prod) return;

    // Check if item already exists
    const existingIndex = lineItems.findIndex((i) => i.variantId === prod.variantId);
    if (existingIndex > -1) {
      const updated = [...lineItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].lineTotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setLineItems(updated);
      return;
    }

    const newItem: OrderLineItem = {
      variantId: prod.variantId,
      productTitle: prod.productTitle,
      variantTitle: prod.variantTitle,
      sku: prod.sku,
      originalPrice: prod.price,
      unitPrice: prod.price,
      quantity: 1,
      lineTotal: prod.price,
    };

    setLineItems([...lineItems, newItem]);
  };

  // Update item price or quantity
  const handleItemPriceChange = (index: number, newPrice: number) => {
    const updated = [...lineItems];
    updated[index].unitPrice = Math.max(0, newPrice);
    updated[index].lineTotal = updated[index].quantity * updated[index].unitPrice;
    setLineItems(updated);
  };

  const handleItemQuantityChange = (index: number, newQty: number) => {
    const updated = [...lineItems];
    updated[index].quantity = Math.max(1, newQty);
    updated[index].lineTotal = updated[index].quantity * updated[index].unitPrice;
    setLineItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Calculate Totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = Math.min(subtotal, Math.max(0, parseFloat(customDiscount || '0') || 0));
  const shippingAmount = 0; // Free shipping standard
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  // Form Submit
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.fullName.trim() || !customer.phone.trim()) {
      toast.error('Customer name and phone number are required');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        leadId,
        customer,
        items: lineItems.map((item) => ({
          variantId: item.variantId,
          productTitle: item.productTitle,
          variantTitle: item.variantTitle,
          sku: item.sku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount,
        paymentMethod,
        internalNote: internalNote.trim() || 'Created via Sales Order Desk',
        customerNote: customerNote.trim() || null,
      };

      const res = await apiFetch<{ success: boolean; message: string; order: any }>(
        '/api/sales/orders/create',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (res.success) {
        toast.success(res.message || 'Order placed successfully!');
        router.push('/orders');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] pb-16">
      <SalesHeader
        title="Create Phone / Inquiry Order"
        subtitle="Create sales orders with custom line-item pricing and instant stock allocation"
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders</span>
        </Link>

        {leadId && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>
              Converting prospective lead to placed order. Once submitted, this lead will be automatically marked as <strong>Won</strong>.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-12 gap-6">
          {/* Left Column: Customer & Shipping Address (7 Cols) */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Customer Details */}
            <div className="p-5 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Customer Information</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Delivery Address */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-200 block">Shipping & Delivery Address</span>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    placeholder="Flat / Building, Street name"
                    value={customer.address.line1}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: { ...customer.address, line1: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Pune"
                      value={customer.address.city}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address, city: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">State</label>
                    <input
                      type="text"
                      placeholder="Maharashtra"
                      value={customer.address.state}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address, state: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="411001"
                      value={customer.address.postalCode}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address, postalCode: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Corporate / GST Toggle */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customer.isBusiness}
                    onChange={(e) => setCustomer({ ...customer, isBusiness: e.target.checked })}
                    className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>B2B / GST Invoice Needed</span>
                </label>

                {customer.isBusiness && (
                  <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in duration-100">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">GST Number</label>
                      <input
                        type="text"
                        placeholder="27AAACG0000A1Z5"
                        value={customer.gstNumber}
                        onChange={(e) => setCustomer({ ...customer, gstNumber: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Company / Legal Name</label>
                      <input
                        type="text"
                        placeholder="Infosys Ltd"
                        value={customer.businessName}
                        onChange={(e) => setCustomer({ ...customer, businessName: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes & Payment Terms */}
            <div className="p-5 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-100">Payment Terms & Instructions</h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cod', label: 'Cash on Delivery (COD)' },
                    { id: 'razorpay_link', label: 'Razorpay Payment Link' },
                    { id: 'bank_transfer', label: 'NEFT / RTGS Transfer' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                        paymentMethod === mode.id
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Internal Sales Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Phone confirmed with client. Requested delivery on Saturday."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Line Items, Custom Pricing & Checkout (5 Cols) */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Catalog Selector */}
            <div className="p-5 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Add Products</span>
              </h3>

              <div className="flex items-center gap-2">
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 truncate"
                >
                  {productsList.map((p) => (
                    <option key={p.variantId} value={p.variantId}>
                      {p.productTitle} ({p.variantTitle}) • {formatINR(p.price)} • Stock: {p.stock}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Line Items Card with Custom Unit Pricing */}
            <div className="p-5 rounded-2xl bg-[#11131a] border border-zinc-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-100">Order Items</h3>
                <span className="text-xs text-zinc-400 font-mono">{lineItems.length} items</span>
              </div>

              {lineItems.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No items added yet. Choose products from the dropdown above.
                </div>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, idx) => {
                    const hasDiscountOverride = item.unitPrice < item.originalPrice;

                    return (
                      <div
                        key={item.variantId}
                        className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-zinc-200">
                              {item.productTitle}
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {item.variantTitle} • SKU: {item.sku}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Custom Price & Quantity Row */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="text-[10px] text-zinc-500 block">Unit Price (₹)</span>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                                className="w-24 bg-zinc-950 border border-zinc-700/80 rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block">Qty</span>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value) || 1)}
                                className="w-14 bg-zinc-950 border border-zinc-700/80 rounded px-2 py-1 text-xs text-zinc-200 font-mono font-bold focus:outline-none focus:border-emerald-500 text-center"
                              />
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block">Line Total</span>
                            <span className="font-mono font-bold text-sm text-zinc-100">
                              {formatINR(item.lineTotal)}
                            </span>
                          </div>
                        </div>

                        {hasDiscountOverride && (
                          <div className="text-[10px] text-amber-400 font-medium">
                            ⚡ Price overridden (MRP: {formatINR(item.originalPrice)})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Level Discount */}
              {lineItems.length > 0 && (
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Special Sales Discount (₹):</span>
                  </div>
                  <input
                    type="number"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    placeholder="0"
                    className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-amber-400 font-mono font-bold focus:outline-none text-right"
                  />
                </div>
              )}

              {/* Order Summary Breakdown */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Standard Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-zinc-100">
                  <span>Total Payable</span>
                  <span className="font-mono text-emerald-400 text-base">{formatINR(totalAmount)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || lineItems.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Place & Confirm Order ({formatINR(totalAmount)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateSalesOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-xs text-zinc-400">
          Loading order creator...
        </div>
      }
    >
      <CreateSalesOrderContent />
    </Suspense>
  );
}
