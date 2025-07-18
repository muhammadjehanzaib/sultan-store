'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrderModal({ isOpen, onClose, order, onUpdateStatus }: OrderModalProps) {
  const { t, isRTL, language } = useLanguage();

  if (!isOpen || !order) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('admin.orders.orderDetails')} - {order.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Order Status */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {t(`admin.orders.${order.status}`)}
              </span>
            </div>
            <div>
              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">{t('admin.orders.pending')}</option>
                <option value="processing">{t('admin.orders.processing')}</option>
                <option value="shipped">{t('admin.orders.shipped')}</option>
                <option value="delivered">{t('admin.orders.delivered')}</option>
                <option value="cancelled">{t('admin.orders.cancelled')}</option>
              </select>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('admin.orders.customerInfo')}
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>{t('checkout.firstName')}:</strong> {order.billingAddress.firstName}</p>
                <p><strong>{t('checkout.lastName')}:</strong> {order.billingAddress.lastName}</p>
                <p><strong>{t('checkout.email')}:</strong> {order.billingAddress.email}</p>
                <p><strong>{t('checkout.phone')}:</strong> {order.billingAddress.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Order Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>{t('admin.orders.date')}:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>{t('admin.orders.total')}:</strong> ${order.total.toFixed(2)}</p>
                <p><strong>{t('admin.orders.paymentMethod')}:</strong> {order.paymentMethod.name}</p>
                {order.trackingNumber && (
                  <p><strong>Tracking:</strong> {order.trackingNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('admin.orders.billingAddress')}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{order.billingAddress.address}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                <p>{order.billingAddress.country}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('admin.orders.shippingAddress')}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('admin.orders.orderItems')}
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        {item.product.image ? (
                          <img src={item.product.image} alt={getLocalizedString(ensureLocalizedContent(item.product.name), language)} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-gray-400">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getLocalizedString(ensureLocalizedContent(item.product.name), language)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('cart.quantity')}: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('checkout.orderSummary')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('admin.orders.subtotal')}</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('admin.orders.tax')}</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('admin.orders.shipping')}</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-medium text-base pt-2 border-t border-gray-200 dark:border-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('admin.orders.grandTotal')}</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
