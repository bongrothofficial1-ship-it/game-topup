'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Requirement {
  id: string;
  fieldName: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number | string;
  amount: number | string;
}

interface GameDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  publisher: string;
  requirements: Requirement[];
  products: Product[];
}

interface QrPaymentInfo {
  paymentId: string;
  orderNumber: string;
  amount: string;
  qrImageUrl: string;
  status: string;
}

export default function GameTopupPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('KHQR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Modal State
  const [paymentInfo, setPaymentInfo] = useState<QrPaymentInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');

  useEffect(() => {
    if (!slug) return;
    fetch(`http://localhost:4000/games/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Game not found');
        return res.json();
      })
      .then((data) => {
        setGame(data);
        if (data.products?.length > 0) {
          setSelectedProduct(data.products[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  // Polling check payment status រៀងរាល់ ៣ វិនាទី
  useEffect(() => {
    if (!paymentInfo || paymentStatus === 'PAID') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:4000/payments/${paymentInfo.paymentId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.paymentStatus === 'PAID') {
            setPaymentStatus('PAID');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentInfo, paymentStatus]);

  const handleInputChange = (fieldName: string, value: string) => {
    setPlayerData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckout = async () => {
    if (!selectedProduct || !game) {
      alert('សូមជ្រើសរើសកញ្ចប់ដែលត្រូវបញ្ចូល!');
      return;
    }

    for (const req of game.requirements || []) {
      if (req.required && !playerData[req.fieldName]) {
        alert(`សូមបំពេញ ${req.label}!`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // ១. បង្កើត Order ក្នុង Backend
      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `client-${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify({
          gameId: game.id,
          productId: selectedProduct.id,
          paymentMethodCode: selectedPayment,
          playerData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'មិនអាចបង្កើតការកុម្ម៉ង់បានទេ');
      }

      const result = await response.json();

      // ២. ទាញយក QR Code សម្រាប់ទូទាត់ប្រាក់
      const qrRes = await fetch(`http://localhost:4000/payments/${result.payment.id}/qr`);
      const qrData = await qrRes.json();

      setPaymentInfo(qrData);
      setPaymentStatus('PENDING');
    } catch (err: any) {
      alert(`កំហុស៖ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function ជំនួយសម្រាប់តេស្ត simulate ជោគជ័យ
  const handleSimulatePayment = async () => {
    if (!paymentInfo) return;
    await fetch(`http://localhost:4000/payments/${paymentInfo.paymentId}/simulate-success`, {
      method: 'POST',
    });
    setPaymentStatus('PAID');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">កំពុងទាញយកព័ត៌មានហ្គេម...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-rose-500 font-semibold">រកមិនឃើញទិន្នន័យហ្គេមនេះទេ!</p>
        <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm">
          ត្រឡប់ទៅទំព័រដើម
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-rose-500">
            ⚡ GAMETOPUP
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
            ← ត្រឡប់ក្រោយ
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8">
          <img
            src={game.logoUrl}
            alt={game.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{game.name}</h1>
            <p className="text-slate-400 text-sm max-w-xl">{game.description}</p>
            <span className="inline-block mt-3 text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full">
              {game.publisher}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-400">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-bold">1</span>
                ព័ត៌មានគណនីក្នុងហ្គេម
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {game.requirements.map((req) => (
                  <div key={req.id}>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      {req.label} {req.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={req.placeholder || `បញ្ចូល ${req.label}`}
                      value={playerData[req.fieldName] || ''}
                      onChange={(e) => handleInputChange(req.fieldName, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-400">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-bold">2</span>
                ជ្រើសរើសចំនួនពេជ្រ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {game.products.map((prod) => {
                  const isSelected = selectedProduct?.id === prod.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className={`p-4 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-sm sm:text-base text-slate-100">{prod.name}</div>
                      <div className="text-xs text-rose-400 font-bold mt-2">${Number(prod.price).toFixed(2)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-400">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-bold">3</span>
                ជ្រើសរើសវិធីសាស្ត្រទូទាត់ប្រាក់
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedPayment('KHQR')}
                  className={`p-4 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                    selectedPayment === 'KHQR'
                      ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">🇰🇭</span>
                  <span className="font-semibold text-sm">Bakong KHQR</span>
                  <span className="text-[10px] text-slate-400">ទូទាត់តាមគ្រប់ធនាគារក្នុងស្រុក</span>
                </button>
                <button
                  onClick={() => setSelectedPayment('ABA_PAYWAY')}
                  className={`p-4 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                    selectedPayment === 'ABA_PAYWAY'
                      ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">🏦</span>
                  <span className="font-semibold text-sm">ABA PayWay</span>
                  <span className="text-[10px] text-slate-400">ABA Mobile App</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl sticky top-24">
              <h3 className="font-bold text-base mb-4 text-white">សង្ខេបការបញ្ជាទិញ</h3>
              <div className="space-y-3 text-sm border-b border-slate-800 pb-4 mb-4 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">ហ្គេម៖</span>
                  <span className="font-medium text-white">{game.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">កញ្ចប់៖</span>
                  <span className="font-medium text-white">{selectedProduct?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ទូទាត់តាម៖</span>
                  <span className="font-medium text-white">{selectedPayment}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-slate-400">តម្លៃសរុប៖</span>
                <span className="text-2xl font-black text-rose-500">
                  ${selectedProduct ? Number(selectedProduct.price).toFixed(2) : '0.00'}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting || !selectedProduct}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-600/20 transition active:scale-[0.98]"
              >
                {isSubmitting ? 'កំពុងដំណើរការ...' : 'ទិញឥឡូវនេះ (Buy Now)'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* QR Code Payment Modal Popup */}
      {paymentInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button
              onClick={() => setPaymentInfo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            {paymentStatus === 'PAID' ? (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white">ទូទាត់ជោគជ័យ!</h3>
                <p className="text-xs text-slate-400">
                  ការបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ចប់។ ពេជ្រនឹងចូលក្នុងគណនីហ្គេមភ្លាមៗ។
                </p>
                <button
                  onClick={() => setPaymentInfo(null)}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm transition"
                >
                  យល់ព្រម
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-sm tracking-wider">
                  <span>🇰🇭</span> BAKONG KHQR
                </div>
                <p className="text-xs text-slate-400">ស្កេនដើម្បីទូទាត់ជាមួយគ្រប់កម្មវិធីធនាគារ</p>

                {/* QR Image Box */}
                <div className="p-3 bg-white rounded-2xl inline-block shadow-inner mx-auto">
                  <img
                    src={paymentInfo.qrImageUrl}
                    alt="KHQR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-400">ចំនួនទឹកប្រាក់</div>
                  <div className="text-2xl font-black text-white mt-1">${Number(paymentInfo.amount).toFixed(2)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">វិក្កយបត្រ៖ {paymentInfo.orderNumber}</div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-amber-400 bg-amber-500/10 py-2 px-3 rounded-lg border border-amber-500/20 animate-pulse">
                  <span>⏳</span> រង់ចាំការទូទាត់ប្រាក់...
                </div>

                {/* ប៊ូតុង Demo Simulate សម្រាប់សាកល្បង */}
                <button
                  onClick={handleSimulatePayment}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-xl transition border border-slate-700"
                >
                  ⚡ សាកល្បងក្លែងធ្វើជាទូទាត់ជោគជ័យ (Demo)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}