'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { getProviderDisplayName, getTrackingUrl, TrackingProvider, generateTrackingNumber, shouldGenerateTrackingNumber } from '@/lib/trackingUtils';
import { RiyalSymbol } from '@/components/ui/RiyalSymbol';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

interface OrderNote {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  type: 'internal' | 'customer';
}

export function OrderModal({ isOpen, onClose, order, onUpdateStatus }: OrderModalProps) {
  const { t, isRTL, language } = useLanguage();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingProvider, setTrackingProvider] = useState<TrackingProvider>('custom');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingSuccess, setTrackingSuccess] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'customer'>('internal');
  const [notes, setNotes] = useState<OrderNote[]>([
    {
      id: '1',
      text: 'Order confirmed and payment received',
      author: 'Admin',
      createdAt: new Date(),
      type: 'internal'
    }
  ]);

  // Update tracking number when order changes
  useEffect(() => {
    if (order) {
      setTrackingNumber(order.trackingNumber || '');
      setTrackingProvider(order.trackingProvider || 'custom');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: OrderNote = {
        id: Date.now().toString(),
        text: newNote.trim(),
        author: 'Admin',
        createdAt: new Date(),
        type: noteType
      };
      setNotes([...notes, note]);
      setNewNote('');
    }
  };

  const handleUpdateTrackingNumber = async () => {
    if (!trackingNumber.trim()) {
      setTrackingError('Please enter a tracking number');
      return;
    }

    setIsUpdatingTracking(true);
    setTrackingError(null);
    setTrackingSuccess(false);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          trackingProvider: trackingProvider,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tracking number');
      }

      const data = await response.json();
      setTrackingSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setTrackingSuccess(false), 3000);
      
      // Update the order object locally to reflect the changes
      if (order) {
        order.trackingNumber = trackingNumber.trim();
        order.trackingProvider = trackingProvider;
      }

    } catch (error) {
      console.error('Error updating tracking number:', error);
      setTrackingError('Failed to update tracking number. Please try again.');
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleGenerateTrackingNumber = () => {
    const generated = generateTrackingNumber(trackingProvider);
    setTrackingNumber(generated);
  };

  const handleStatusChange = async (newStatus: Order['status']) => {
    // If changing to shipped and no tracking number exists, auto-generate one
    if (shouldGenerateTrackingNumber(order.status, newStatus) && !order.trackingNumber) {
      const autoTrackingNumber = generateTrackingNumber(trackingProvider);
      
      try {
        const response = await fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            trackingNumber: autoTrackingNumber,
            trackingProvider: trackingProvider,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const updatedOrder = data.order; // API returns { order: ... }
          // Update local state
          setTrackingNumber(autoTrackingNumber);
          if (order) {
            order.status = newStatus;
            order.trackingNumber = autoTrackingNumber;
            order.trackingProvider = trackingProvider;
          }
        }
      } catch (error) {
        console.error('Error auto-generating tracking number:', error);
        // Fallback to just updating status
        onUpdateStatus(order.id, newStatus);
      }
    } else {
      // No tracking number auto-generation needed, just update status
      onUpdateStatus(order.id, newStatus);
    }
  };

  const handleTrackingClick = () => {
    if (order.trackingNumber && order.trackingProvider) {
      const trackingUrl = getTrackingUrl(order.trackingNumber, order.trackingProvider);
      if (trackingUrl !== '#') {
        window.open(trackingUrl, '_blank');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
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
          {/* Order Status and Actions */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {t(`admin.orders.${order.status}`)}
              </span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">{t('admin.orders.pending')}</option>
                <option value="processing">{t('admin.orders.processing')}</option>
                <option value="shipped">{t('admin.orders.shipped')}</option>
                <option value="delivered">{t('admin.orders.delivered')}</option>
                <option value="cancelled">{t('admin.orders.cancelled')}</option>
              </select>
            </div>
            <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Button
                onClick={handleUpdateTrackingNumber}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                {t('admin.orders.addTrackingNumber')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
              >
                {t('admin.orders.sendNotification')}
              </Button>
            </div>
          </div>

          {/* Tracking Number */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('admin.orders.trackingNumber')}
            </h4>
            
            {order.trackingNumber ? (
              <div className="space-y-3">
                {/* Display existing tracking number */}
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.trackingNumber}
                      </span>
                      {order.trackingProvider && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          {getProviderDisplayName(order.trackingProvider)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {order.status === 'shipped' ? 'Auto-generated when order was shipped' : 'Manually added'}
                    </p>
                  </div>
                  <Button
                    onClick={handleTrackingClick}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {t('admin.orders.trackPackage')}
                  </Button>
                </div>
                
                {/* Update tracking number */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('admin.orders.updateTrackingNumber')}
                  </p>
                  <div className="space-y-2">
                    <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <select
                        value={trackingProvider}
                        onChange={(e) => setTrackingProvider(e.target.value as TrackingProvider)}
                        disabled={isUpdatingTracking}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="custom">Custom</option>
                        <option value="fedex">FedEx</option>
                        <option value="ups">UPS</option>
                        <option value="usps">USPS</option>
                        <option value="dhl">DHL</option>
                      </select>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter new tracking number..."
                        disabled={isUpdatingTracking}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                      />
                      <Button
                        onClick={handleGenerateTrackingNumber}
                        size="sm"
                        variant="outline"
                        disabled={isUpdatingTracking}
                        className="text-gray-600 hover:text-gray-700 whitespace-nowrap"
                      >
                        Generate
                      </Button>
                      <Button
                        onClick={handleUpdateTrackingNumber}
                        size="sm"
                        disabled={isUpdatingTracking || !trackingNumber.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 whitespace-nowrap"
                      >
                        {isUpdatingTracking ? 'Updating...' : t('common.update')}
                      </Button>
                    </div>
                    
                    {/* Status Messages */}
                    {trackingError && (
                      <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                        {trackingError}
                      </div>
                    )}
                    {trackingSuccess && (
                      <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
                        Tracking number updated successfully!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.status === 'shipped' 
                    ? 'Tracking number will be auto-generated when order is marked as shipped'
                    : 'Add tracking number when order is ready to ship'
                  }
                </p>
                <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <select
                    value={trackingProvider}
                    onChange={(e) => setTrackingProvider(e.target.value as TrackingProvider)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="custom">Custom</option>
                    <option value="fedex">FedEx</option>
                    <option value="ups">UPS</option>
                    <option value="usps">USPS</option>
                    <option value="dhl">DHL</option>
                  </select>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <Button
                    onClick={handleUpdateTrackingNumber}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Info Grid */}
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
                <p><strong>{t('admin.orders.total')}:</strong> <RiyalSymbol />{order.total.toFixed(2)}</p>
                <p><strong>{t('admin.orders.paymentMethod')}:</strong> {order.paymentMethod.toString()}</p>
                {order.trackingNumber && (
                  <p><strong>{t('admin.orders.trackingNumber')}:</strong> {order.trackingNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('admin.orders.shippingAddress')}
              </h4>
              <div className="space-y-1 text-sm">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('admin.orders.billingAddress')}
              </h4>
              <div className="space-y-1 text-sm">
                <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                <p>{order.billingAddress.address}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                <p>{order.billingAddress.country}</p>
                <p>{order.billingAddress.phone}</p>
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
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <p>{t('cart.quantity')}: {item.quantity}</p>
                          <p>{t('product.price')}: <RiyalSymbol />{item.price.toFixed(2)} {t('common.each')}</p>
                        </div>
                        
                        {/* Selected Attributes (from real order item) */}
                        {item.selectedAttributes && (
                          <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                            <div className="space-y-1">
                              {Object.entries(item.selectedAttributes).map(([attrId, valueId]) => {
                                // Find the attribute and value details
                                const attribute = item.product.attributes?.find((attr: any) => attr.id === attrId);
                                const value = attribute?.values?.find((val: any) => val.id === valueId);
                                return (
                                  <div key={attrId} className="flex items-center space-x-2">
                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                      {attribute?.name || attrId}:
                                    </span>
                                    <span className="text-xs text-blue-700 dark:text-blue-300">
                                      {value?.label || value?.value || String(valueId) || 'N/A'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <RiyalSymbol />{item.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('admin.orders.lineTotal')}
                      </div>
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
                <span><RiyalSymbol />{order.subtotal.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('admin.orders.tax')}</span>
                <span><RiyalSymbol />{order.tax.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('admin.orders.shipping')}</span>
                <span><RiyalSymbol />{order.shipping.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-medium text-base pt-2 border-t border-gray-200 dark:border-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('admin.orders.grandTotal')}</span>
                <span><RiyalSymbol />{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('admin.orders.orderNotes')}
            </h4>
            <div className="space-y-4">
              {/* Add Note */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className={`flex space-x-2 mb-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as 'internal' | 'customer')}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="internal">Internal Note</option>
                    <option value="customer">Customer Note</option>
                  </select>
                </div>
                <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <Button
                    onClick={handleAddNote}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {t('admin.orders.addNote')}
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{note.text}</p>
                        <div className={`flex items-center space-x-2 mt-1 ${isRTL ? 'space-x-reverse' : ''}`}>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{note.author}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(note.createdAt)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            note.type === 'internal' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {note.type === 'internal' ? 'Internal' : 'Customer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
