'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Order } from '@/types';
import QRCode from 'qrcode';
import Price from '@/components/ui/Price';

export default function AdminOrderLabel() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [trackUrl, setTrackUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copyMsg, setCopyMsg] = useState<string>('');

  // UX toggles
  const [showItems, setShowItems] = useState(true);
  const [showPrices, setShowPrices] = useState(true);
  const [compact, setCompact] = useState(false);
  const [showBranding, setShowBranding] = useState(true);

  // Snapshot handler
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'ORDER_SNAPSHOT' && e.data?.order) {
        setOrder(e.data.order as Order);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Fetch order
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/orders/fast/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.order) {
            setOrder(data.order as Order);
            return;
          }
        }
      } catch { }
      try {
        const res2 = await fetch(`/api/orders/${orderId}`);
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2?.order) setOrder(data2.order as Order);
        }
      } catch { }
    })();
  }, [orderId]);

  // Ask opener for snapshot
  useEffect(() => {
    const t = setTimeout(() => {
      if (!order && typeof window !== 'undefined' && (window as any).opener) {
        try {
          (window as any).opener.postMessage(
            { type: 'REQUEST_SNAPSHOT', orderId },
            window.location.origin
          );
        } catch { }
      }
    }, 250);
    const t2 = setTimeout(() => {
      if (!order && typeof window !== 'undefined' && (window as any).opener) {
        try {
          (window as any).opener.postMessage(
            { type: 'REQUEST_SNAPSHOT', orderId },
            window.location.origin
          );
        } catch { }
      }
    }, 800);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [order, orderId]);

  // Build track URL
  useEffect(() => {
    if (!orderId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setTrackUrl(` Order ID: ${encodeURIComponent(orderId)}`);
  }, [orderId]);

  // Generate QR
  useEffect(() => {
    (async () => {
      if (!trackUrl) return;
      try {
        const dataUrl = await QRCode.toDataURL(trackUrl, {
          margin: 1,
          width: 256,
        });
        setQrDataUrl(dataUrl);
      } catch { }
    })();
  }, [trackUrl]);

  const createdAt = useMemo(
    () => (order ? new Date(order.createdAt as any) : null),
    [order]
  );

  const resolveAttrs = (it: any) => {
    const raw = it?.selectedAttributes;
    if (!raw) return null;

    if (typeof raw === 'object' && raw !== null) {
      const entries = Object.entries(raw as Record<string, unknown>);
      if (!entries.length) return null;
      const looksRaw = entries.every(
        ([k, v]) => /^attr_/.test(k) || /^val_/.test(String(v))
      );
      if (!looksRaw) {
        return entries.map(([key, val], i) => (
          <span key={key}>
            {i > 0 ? ' · ' : ''}
            <span>{key}</span>
            {': '}
            <span>{String(val)}</span>
          </span>
        ));
      }
    }

    const productAttrs = (it?.product as any)?.attributes as any[] | undefined;
    if (productAttrs && typeof raw === 'object' && raw !== null) {
      const pairs: { label: string; value: string }[] = [];
      for (const [attrId, valueId] of Object.entries(
        raw as Record<string, string>
      )) {
        const attr =
          productAttrs.find((a: any) => a.id === attrId) ||
          productAttrs.find((a: any) => a.name === attrId);
        const val =
          attr?.values?.find((v: any) => v.id === valueId) ||
          attr?.values?.find(
            (v: any) => v.value === valueId || v.label === valueId
          );
        if (attr && val) {
          pairs.push({ label: attr.name, value: val.label || val.value });
        }
      }
      if (pairs.length) {
        return pairs.map(({ label, value }, i) => (
          <span key={`${label}:${value}:${i}`}>
            {i > 0 ? ' · ' : ''}
            <span>{label}</span>
            {': '}
            <span>{value}</span>
          </span>
        ));
      }
    }
    return null;
  };

  // Copy helper
  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg(msg);
      setTimeout(() => setCopyMsg(''), 2000);
    } catch {
      setCopyMsg('❌ Failed to copy');
      setTimeout(() => setCopyMsg(''), 2000);
    }
  };

  const pm = (order as any)?.paymentMethod;
  const paymentLabel =
    typeof pm === 'string' ? pm : pm?.name || pm?.type || '—';
  const isCOD =
    (typeof pm === 'string' && pm === 'cod') || (pm && pm.type === 'cod');

  const itemCount = order?.items?.length || 0;

  return (
    <div className="font-sans p-3">
      {/* Controls */}
      <div className="mb-3 flex flex-wrap gap-2 items-center print:hidden">
        <button
          onClick={() => window.print()}
          className="px-3 py-2 rounded-md border border-gray-300 bg-purple-700 text-white"
        >
          🖨️ Print
        </button>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
          />
          Compact
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showItems}
            onChange={(e) => setShowItems(e.target.checked)}
          />
          Show items
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showPrices}
            onChange={(e) => setShowPrices(e.target.checked)}
          />
          Show prices
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showBranding}
            onChange={(e) => setShowBranding(e.target.checked)}
          />
          Branding
        </label>
        {order && (
          <>
            <button
              onClick={() =>
                copy(
                  `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}\n${order.shippingAddress.address}\n${order.shippingAddress.city} ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}\n${order.shippingAddress.country}`,
                  '✅ Address copied!'
                )
              }
              className="px-2 py-1 border border-gray-300 rounded bg-gray-100"
            >
              📋 Copy address
            </button>
            {order.trackingNumber && (
              <button
                onClick={() =>
                  copy(order.trackingNumber!, '✅ Tracking number copied!')
                }
                className="px-2 py-1 border border-gray-300 rounded bg-gray-100"
              >
                🔗 Copy tracking
              </button>
            )}
          </>
        )}
        {copyMsg && (
          <span className="text-green-600 text-sm ml-2">{copyMsg}</span>
        )}
      </div>

      {/* Printable Label */}
      <div
        className={`relative bg-white text-black rounded-md shadow border border-gray-200 overflow-hidden print:shadow-none print:border-0 print:break-after-page print:block
        ${compact ? 'w-[110mm] min-h-[160mm] p-2 text-xs' : 'w-[150mm] min-h-[200mm] p-3 text-sm'}`}
      >
        {/* Header */}
        <div className={`flex justify-between items-start border-b border-gray-200 ${compact ? 'pb-1 mb-1' : 'pb-2 mb-2'}`}>
          <div className="flex flex-col gap-1">
            {showBranding ? (
              <>
                <img
                  src="/logos/logo-english.png"
                  alt="Logo"
                  className={`${compact ? 'w-28 h-28' : 'w-40 h-40'} object-contain`}
                />
                <div className={`${compact ? 'text-gray-600 text-xs' : 'text-gray-600 text-sm'}`}>
                  Shipping Label / بطاقة الشحن
                </div>
              </>
            ) : (
              <div className="font-bold text-base">Shipping Label</div>
            )}
            <div className={`${compact ? 'text-gray-600 text-[10px]' : 'text-gray-600 text-xs'}`}>
              Order #{String(orderId).slice(-8).toUpperCase()}{' '}
              {createdAt ? `• ${createdAt.toLocaleString()}` : ''}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR"
                className={`${compact ? 'w-24 h-24' : 'w-32 h-32'} object-contain`}
              />
            ) : (
              <div className="text-gray-500 text-xs">Generating QR…</div>
            )}

            {order?.trackingNumber && (
              <div
                className={`font-semibold mt-1 ${compact ? 'text-sm' : 'text-lg'
                  }`}
              >
                {order.trackingNumber}
              </div>
            )}
          </div>
        </div>

        {/* Ship To */}
        <div>
          <div className="font-bold">Ship To / إلى</div>
          {order ? (
            <div className={`mt-1 leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
              <div>
                <strong>
                  {order.shippingAddress.firstName}{' '}
                  {order.shippingAddress.lastName}
                </strong>
              </div>
              <div>{order.shippingAddress.address}</div>
              <div>
                {order.shippingAddress.city}
                {order.shippingAddress.state
                  ? `, ${order.shippingAddress.state}`
                  : ''}
                {order.shippingAddress.zipCode
                  ? ` ${order.shippingAddress.zipCode}`
                  : ''}
              </div>
              <div>
                {order.shippingAddress.country}
                {order.shippingAddress.phone
                  ? ` • ${order.shippingAddress.phone}`
                  : ''}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Loading…</div>
          )}
        </div>

        {/* Payment / Status */}
        <div className={`mt-2 flex flex-wrap items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold border ${isCOD
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-cyan-50 text-cyan-700 border-cyan-200'
              }`}
          >
            {isCOD
              ? 'COD (Cash on Delivery) / الدفع عند الاستلام'
              : `Paid / مدفوع (${paymentLabel})`}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Status: {(order?.status || 'pending').toString()}
          </span>
        </div>

        {/* Items */}
        {order && showItems && (
          <div className={`mt-2 border-t border-dashed border-gray-300 pt-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className="font-bold mb-1">
              Items / العناصر ({itemCount})
            </div>
            <ul className="divide-y divide-dashed">
              {order.items.map((it, idx) => {
                const name =
                  (it.product as any)?.name_en ||
                  (it.product as any)?.name_ar ||
                  'Item';
                const qty = Number(it.quantity) || 0;
                const unitNum =
                  typeof it.price === 'number'
                    ? it.price
                    : typeof it.total === 'number' && qty > 0
                      ? it.total / qty
                      : 0;

                const attrsNode = resolveAttrs(it);

                return (
                  <li
                    key={idx}
                    className={`flex justify-between items-start ${compact ? 'py-0.5' : 'py-1'}`}
                  >
                    <span className="flex flex-col">
                      <span className={`font-medium truncate ${compact ? 'max-w-[140px]' : 'max-w-[180px]'}`}>
                        {name}
                      </span>
                      <span className="text-gray-600 text-xs">
                        Qty × {qty}
                        {attrsNode ? ' • ' : ''}
                        {attrsNode}
                      </span>
                    </span>
                    {showPrices && (
                      <span className="text-right">
                        <Price amount={unitNum} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Totals */}
        {order && showPrices && (
          <div className={`mt-2 border-t border-dashed border-gray-300 pt-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal / المجموع:</span>
              <strong>
                <Price amount={order.subtotal} />
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping / الشحن:</span>
              <strong>
                <Price amount={order.shipping} />
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT / الضريبة:</span>
              <strong>
                <Price amount={order.tax} />
              </strong>
            </div>
            {Number(order.codFee) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  COD Fee / رسوم الدفع عند الاستلام:
                </span>
                <strong>
                  <Price amount={order.codFee} />
                </strong>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 mt-1 pt-1 font-semibold text-base">
              <span>Total / الإجمالي:</span>
              <span>
                <Price amount={order.total} />
              </span>
            </div>
            {isCOD && (
              <div className="text-gray-500 text-xs mt-1">
                Collect on delivery. / المبلغ يُحصّل عند التسليم.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-gray-500 text-xs mt-2">
          Scan the QR to open this order. / امسح رمز QR لفتح هذا الطلب.
        </div>
      </div>
    </div>
  );
}
