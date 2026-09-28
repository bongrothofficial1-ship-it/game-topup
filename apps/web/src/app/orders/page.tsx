'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface OrderDetail {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: string;
  currency: string;
  playerData: Record<string, string>;
  createdAt: string;
  game: {
    name: string;
    logoUrl: string;
  };
  product: {
    name: string;
  };
}

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(`http://localhost:4000/orders/tracking/${orderNumber.trim()}`);
      if (!res.ok) {
        throw new Error('រកមិនឃើញព័ត៌មានការកុម្ម៉ង់នេះទេ! សូមពិនិត្យលេខវិក្កយបត្រម្ដងទៀត។');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">ជោគជ័យ (Completed)</span>;
      case 'PENDING':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold">រង់ចាំការទូទាត់ (Pending)</span>;
      case 'FAILED':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold">បរាជ័យ (Failed)</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-rose-500">
            ⚡ GAMETOPUP
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
            ← ត្រឡប់ទៅទំព័រដើម
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">🔎 តាមដានការបញ្ជាទិញ</h1>
          <p className="text-slate-400 text-sm">
            បញ្ចូលលេខកូដវិក្កយបត្រ (Order Number) ដើម្បីឆែកមើលស្ថានភាពបញ្ចូលពេជ្ររបស់អ្នក
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="ឧទាហរណ៍៖ ORD-1727420..."
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 px-6 py-3 rounded-xl font-semibold text-sm transition text-white"
          >
            {loading ? 'កំពុងស្វែងរក...' : 'ស្វែងរក'}
          </button>
        </form>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm text-center mb-6">
            {error}
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-400">លេខកូដវិក្កយបត្រ</div>
                <div className="font-mono text-base font-bold text-rose-400 mt-0.5">{order.orderNumber}</div>
              </div>
              <div>{getStatusBadge(order.orderStatus)}</div>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={order.game.logoUrl}
                alt={order.game.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-white text-base">{order.game.name}</h3>
                <p className="text-xs text-slate-400">{order.product.name}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-sm">
              <div className="text-xs font-semibold text-slate-400 mb-2">ព័ត៌មានគណនីក្នុងហ្គេម៖</div>
              {Object.entries(order.playerData || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 capitalize">{key}</span>
                  <span className="text-slate-200 font-medium">{val}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
              <span className="text-sm text-slate-400">ទឹកប្រាក់សរុប៖</span>
              <span className="text-xl font-black text-rose-500">
                ${Number(order.totalAmount).toFixed(2)} {order.currency}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}