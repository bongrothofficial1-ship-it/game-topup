'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number | string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  game: {
    name: string;
  };
  product: {
    name: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:4000/orders/admin/stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setOrders(data.recentOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">Completed</span>;
      case 'PENDING':
        return <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold">Pending</span>;
      case 'FAILED':
        return <span className="bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-full text-xs font-semibold">Failed</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Admin Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl text-rose-500">⚡ GAMETOPUP</span>
            <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-500/30">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              ← មើលមុខហាង
            </Link>
            <button
              onClick={fetchDashboardData}
              className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">📊 Dashboard គ្រប់គ្រងការលក់</h1>
          <p className="text-slate-400 text-sm mt-1">ស្ថិតិប្រតិបត្តិការ និងការកុម្ម៉ង់ទូទាំងប្រព័ន្ធ</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">ចំណូលសរុប (Revenue)</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              ${stats ? Number(stats.totalRevenue).toFixed(2) : '0.00'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">ការកុម្ម៉ង់សរុប (Total Orders)</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {stats?.totalOrders ?? 0}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">ជោគជ័យ (Completed)</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-2">
              {stats?.completedOrders ?? 0}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">រង់ចាំការទូទាត់ (Pending)</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {stats?.pendingOrders ?? 0}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-base text-white">ការកុម្ម៉ង់ថ្មីៗ (Recent Transactions)</h2>
            <span className="text-xs text-slate-400">{orders.length} ប្រតិបត្តិការចុងក្រោយ</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">កំពុងទាញយកទិន្នន័យ...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">មិនទាន់មានការកុម្ម៉ង់នៅឡើយទេ</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Order Number</th>
                    <th className="py-3.5 px-4">ហ្គេម</th>
                    <th className="py-3.5 px-4">កញ្ចប់</th>
                    <th className="py-3.5 px-4">តម្លៃ</th>
                    <th className="py-3.5 px-4">ស្ថានភាព</th>
                    <th className="py-3.5 px-4">កាលបរិច្ឆេទ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-rose-400">{item.orderNumber}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{item.game.name}</td>
                      <td className="py-3.5 px-4 text-slate-300">{item.product.name}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">${Number(item.totalAmount).toFixed(2)}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(item.orderStatus)}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}