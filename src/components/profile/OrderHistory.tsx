'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Order } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import Image from 'next/image';

interface OrderHistoryProps {
  user: User;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderWithDetails extends Order {
  itemsCount: number;
  trackingUrl?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ user }) => {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/customer/${user.email}`);
        if (response.ok) {
          const orderData = await response.json();
          console.log('Order data received:', orderData);
          
          // Handle different response formats
          let ordersArray = [];
          if (Array.isArray(orderData)) {
            ordersArray = orderData;
          } else if (orderData && Array.isArray(orderData.orders)) {
            ordersArray = orderData.orders;
          } else if (orderData && orderData.data && Array.isArray(orderData.data)) {
            ordersArray = orderData.data;
          } else {
            console.warn('Unexpected order data format:', orderData);
            ordersArray = [];
          }
          
          const processedOrders = ordersArray.map((order: any) => ({
            ...order,
            itemsCount: order.items?.length || 0,
            trackingUrl: order.trackingNumber ? `/track/${order.trackingNumber}` : undefined
          }));
          
          setOrders(processedOrders);
        } else {
          // API might not exist yet, so show empty state
          console.log('Orders API not available or returned error:', response.status);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        // For development, show empty state instead of error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.email]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Button handlers
  const handleStartShopping = () => {
    router.push('/');
  };

  const handleTrackOrder = (trackingUrl?: string) => {
    if (trackingUrl && typeof window !== 'undefined') {
      window.open(trackingUrl, '_blank');
    } else {
      console.log('Tracking functionality not implemented yet');
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    // Open invoice in new tab - user can then print/save as PDF
    window.open(`/api/orders/${orderId}/invoice`, '_blank');
  };

  const handleReorder = (orderId: string) => {
    // For now, just log - implement reorder functionality later
    console.log(`Reordering order ${orderId}`);
    // When reorder system is ready: router.push(`/orders/${orderId}/reorder`);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (typeof window !== 'undefined' && window.confirm(t('profile.confirmCancelOrder') || 'Are you sure you want to cancel this order?')) {
      try {
        // Implement order cancellation API call
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        
        if (response.ok) {
          // Refresh orders after cancellation
          const fetchOrders = async () => {
            try {
              const response = await fetch(`/api/orders/customer/${user.email}`);
              if (response.ok) {
                const orderData = await response.json();
                let ordersArray = [];
                if (Array.isArray(orderData)) {
                  ordersArray = orderData;
                } else if (orderData && Array.isArray(orderData.orders)) {
                  ordersArray = orderData.orders;
                } else if (orderData && orderData.data && Array.isArray(orderData.data)) {
                  ordersArray = orderData.data;
                }
                
                const processedOrders = ordersArray.map((order: any) => ({
                  ...order,
                  itemsCount: order.items?.length || 0,
                  trackingUrl: order.trackingNumber ? `/track/${order.trackingNumber}` : undefined
                }));
                
                setOrders(processedOrders);
              }
            } catch (error) {
              console.error('Error refreshing orders:', error);
            }
          };
          
          await fetchOrders();
        } else {
          console.error('Failed to cancel order');
        }
      } catch (error) {
        console.error('Error canceling order:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('profile.orderHistory')}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('profile.orderHistory')}</h2>
        
        {/* Order Status Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as OrderStatus | 'all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(`profile.status.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? t('profile.noOrders') : t('profile.noOrdersWithFilter')}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? t('profile.noOrdersDescription') 
              : t('profile.noOrdersWithFilterDescription')
            }
          </p>
          <Button onClick={handleStartShopping}>
            {t('profile.startShopping')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('profile.orderNumber').replace('{{number}}', order.id)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('profile.placedOn')}: {new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status as OrderStatus)}`}>
                      {t(`profile.status.${order.status}`)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      {expandedOrder === order.id ? t('common.hideDetails') : t('common.viewDetails')}
                    </Button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('profile.items')}</p>
                    <p className="text-lg font-semibold text-gray-900">{order.itemsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('cart.total')}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      <Price amount={order.total} locale={isRTL ? 'ar' : 'en'} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('profile.paymentMethod')}</p>
                    <p className="text-sm text-gray-900">
                      {typeof order.paymentMethod === 'string' 
                        ? order.paymentMethod 
                        : order.paymentMethod?.name || 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    {order.trackingNumber && (
                      <>
                        <p className="text-sm font-medium text-gray-500">{t('profile.tracking')}</p>
                        <p className="text-sm text-purple-600 font-medium">{order.trackingNumber}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-2">
                  {order.trackingNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrackOrder(order.trackingUrl)}
                    >
                      {t('profile.trackOrder')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(order.id)}
                  >
                    {t('profile.downloadInvoice')}
                  </Button>
                  {order.status === 'delivered' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/reviews')}
                      >
                        Write Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(order.id)}
                      >
                        {t('profile.reorder')}
                      </Button>
                    </>
                  )}
                  {(['pending', 'processing'].includes(order.status)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {t('profile.cancelOrder')}
                    </Button>
                  )}
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">{t('profile.orderItems')}</h4>
                    <div className="space-y-4">
                      {order.items?.map((item, index) => {
                        // Safe name extraction
                        const getProductName = () => {
                          if (!item.product) return 'Unknown Product';
                          // Handle the case where name is stored in name_en/name_ar fields
                          if (item.product.name_en) {
                            return isRTL ? (item.product.name_ar || item.product.name_en) : item.product.name_en;
                          }
                          if (typeof item.product.name === 'string') {
                            return item.product.name;
                          }
                          if (item.product.name && typeof item.product.name === 'object') {
                            return item.product.name.en || item.product.name.ar || 'Unknown Product';
                          }
                          return 'Unknown Product';
                        };

                        const productName = getProductName();
                        const productImage = item.product?.image || '/placeholder-product.jpg';
                        const itemTotal = item.total || (item.price * item.quantity) || 0;
                        
                        console.log('Order item debug:', {
                          product: item.product,
                          productName,
                          productImage: productImage ? 'Image exists' : 'No image',
                          selectedAttributes: item.selectedAttributes
                        });

                        return (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-[60px] h-[60px] relative bg-gray-200 rounded-lg overflow-hidden">
                              {productImage && productImage !== '/placeholder-product.jpg' ? (
                                <Image
                                  src={productImage}
                                  alt={productName}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover"
                                  onError={(e) => {
                                    console.log('Image failed to load:', productImage);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {productName}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {t('profile.quantity')}: {item.quantity || 1}
                              </p>
                              {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Variant: {Object.values(item.selectedAttributes).join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Unit Price: <Price amount={item.price} locale={isRTL ? 'ar' : 'en'} />
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                <Price amount={itemTotal} locale={isRTL ? 'ar' : 'en'} />
                              </p>
                            </div>
                          </div>
                        );
                      }) || (
                        <p className="text-gray-500 text-center py-4">
                          {t('profile.noItemDetails')}
                        </p>
                      )}
                    </div>

                    {/* Order Breakdown */}
                    <div className="mt-6 pt-4 border-t border-gray-400 text-gray-700">
                      <div className="space-y-2 text-sm ">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('cart.subtotal')}:</span>
                          <Price amount={order.subtotal} locale={isRTL ? 'ar' : 'en'} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('cart.shipping')}:</span>
                          <Price amount={order.shipping} locale={isRTL ? 'ar' : 'en'} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('cart.tax')}:</span>
                          <Price amount={order.tax} locale={isRTL ? 'ar' : 'en'} />
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                          <span>{t('cart.total')}:</span>
                          <Price amount={order.total} locale={isRTL ? 'ar' : 'en'} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

