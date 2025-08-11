'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import Image from 'next/image';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  selectedAttributes?: Record<string, string>;
  product: {
    id: string;
    name?: string;
    name_en?: string;
    name_ar?: string;
    image?: string;
    category?: {
      name?: string;
      name_en?: string;
      name_ar?: string;
    };
  };
}

interface OrderDetails {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  codFee: number;
  paymentMethod: string | { name: string };
  trackingNumber?: string;
  trackingProvider?: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  metadata?: any;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t, isRTL, language } = useLanguage();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params?.orderId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (!orderId) {
      setError('Order ID not found');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (response.status === 404) {
          setError('Order not found');
          return;
        }
        
        if (!response.ok) {
          setError('Failed to fetch order details');
          return;
        }
        
        const data = await response.json();
        
        // Check if the order belongs to the current user (basic security check)
        const isAdmin = user?.role === 'admin' || user?.role === 'manager';
        if (data.order.customerEmail !== user?.email && !isAdmin) {
          setError('Access denied - This order does not belong to you');
          return;
        }
        
        setOrder(data.order);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAuthenticated, user?.email, user?.role, router]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const handleTrackOrder = () => {
    if (order?.trackingNumber && order?.trackingProvider) {
      // Open tracking in a new tab - this is a placeholder implementation
      window.open(`https://example-tracking.com/${order.trackingNumber}`, '_blank');
    } else {
      alert('Tracking information not available yet');
    }
  };

  const handleDownloadInvoice = () => {
    if (order) {
      window.open(`/api/orders/${order.id}/invoice`, '_blank');
    }
  };

  const handleReorder = () => {
    if (order) {
      // Implement reorder functionality
      console.log('Reordering order:', order.id);
      alert('Reorder functionality will be implemented soon');
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    const confirmCancel = confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من إلغاء هذا الطلب؟'
        : 'Are you sure you want to cancel this order?'
    );
    
    if (!confirmCancel) return;

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setOrder(updatedData.order);
        alert(
          language === 'ar'
            ? 'تم إلغاء الطلب بنجاح'
            : 'Order cancelled successfully'
        );
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(
        language === 'ar'
          ? 'فشل في إلغاء الطلب'
          : 'Failed to cancel order'
      );
    }
  };

  const getProductName = (product: OrderItem['product']) => {
    if (product.name_en) {
      return isRTL ? (product.name_ar || product.name_en) : product.name_en;
    }
    return product.name || 'Unknown Product';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ar' ? 'خطأ' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()}>
              {language === 'ar' ? 'العودة' : 'Go Back'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/orders')}>
              {language === 'ar' ? 'جميع الطلبات' : 'All Orders'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-white hover:shadow-sm transition-all"
            >
              <span className="text-lg">{isRTL ? '→' : '←'}</span>
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <span className="text-gray-400">/</span>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/orders')}
              className="text-gray-600 hover:text-purple-600"
            >
              {language === 'ar' ? 'جميع الطلبات' : 'All Orders'}
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
            </span>
          </div>
          
          {/* Order Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {language === 'ar' ? `الطلب #${order.id.slice(-8).toUpperCase()}` : `Order #${order.id.slice(-8).toUpperCase()}`}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>{language === 'ar' ? 'تاريخ الطلب' : 'Placed on'}</span>
                        <span className="font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString(
                            isRTL ? 'ar-SA' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>{language === 'ar' ? 'العناصر' : 'Items'}</span>
                        <span className="font-medium text-gray-900">{order.items.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'المجموع' : 'Total Amount'}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <Price amount={order.total} locale={isRTL ? 'ar' : 'en'} />
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${getStatusColor(order.status as OrderStatus)}`}>
                  <span className="text-base">{getStatusIcon(order.status as OrderStatus)}</span>
                  {t(`profile.status.${order.status}`) || order.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items & Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-lg">🛍️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {language === 'ar' ? 'عناصر الطلب' : 'Order Items'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {order.items.length} {language === 'ar' ? 'عنصر' : order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {order.items.map((item, index) => {
                    const productName = getProductName(item.product);
                    const productImage = item.product?.image || '/placeholder-product.jpg';

                    return (
                      <div key={index} className="group relative">
                        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                          {/* Product Image */}
                          <div className="relative">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                              {productImage && productImage !== '/placeholder-product.jpg' ? (
                                <Image
                                  src={productImage}
                                  alt={productName}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 text-lg">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-purple-100 text-purple-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {item.quantity}
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                              {productName}
                            </h4>
                            
                            {/* Attributes */}
                            {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {Object.entries(item.selectedAttributes).map(([key, value]) => (
                                  <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Quantity and Unit Price */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                <span>{language === 'ar' ? 'الكمية' : 'Qty'}</span>
                                <span className="font-semibold text-gray-900">{item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                <span>{language === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</span>
                                <span className="font-semibold text-gray-900">
                                  <Price amount={item.price} locale={isRTL ? 'ar' : 'en'} />
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Item Total */}
                          <div className="flex flex-col items-end">
                            <div className="text-right">
                              <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'المجموع' : 'Total'}</p>
                              <p className="text-xl font-bold text-gray-900">
                                <Price amount={item.total} locale={isRTL ? 'ar' : 'en'} />
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        {index < order.items.length - 1 && (
                          <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-200"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-lg">🚚</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}
                  </h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Details */}
                  <div className="space-y-5">
                    <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                      <span>👤</span>
                      {language === 'ar' ? 'بيانات العميل' : 'Customer Details'}
                    </h4>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {language === 'ar' ? 'اسم العميل' : 'Customer Name'}
                        </p>
                        <p className="text-gray-600">{order.customerName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <span className="text-sm">📧</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </p>
                        <p className="text-gray-600 break-all">{order.customerEmail}</p>
                      </div>
                    </div>
                    
                    {order.customerPhone && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                          <span className="text-sm">📞</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                          </p>
                          <p className="text-gray-600">{order.customerPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address & Payment */}
                  <div className="space-y-5">
                    <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                      <span>📍</span>
                      {language === 'ar' ? 'العنوان والدفع' : 'Address & Payment'}
                    </h4>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <span className="text-sm">📍</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          {order.shippingAddress.street}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <span className="text-sm">💳</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                        </p>
                        <p className="text-gray-600">
                          {typeof order.paymentMethod === 'string' 
                            ? order.paymentMethod 
                            : order.paymentMethod?.name || 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tracking Information - Full Width */}
                {order.trackingNumber && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <span className="text-sm">📦</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                          <span>🚛</span>
                          {language === 'ar' ? 'معلومات التتبع' : 'Tracking Information'}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <div>
                            <span className="text-sm text-purple-600">{language === 'ar' ? 'رقم التتبع:' : 'Tracking Number:'}</span>
                            <p className="text-purple-700 font-mono text-lg font-bold">{order.trackingNumber}</p>
                          </div>
                          {order.trackingProvider && (
                            <div>
                              <span className="text-sm text-purple-600">{language === 'ar' ? 'شركة الشحن:' : 'Carrier:'}</span>
                              <p className="text-purple-700 font-semibold">{order.trackingProvider}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-lg">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">{t('cart.subtotal')}:</span>
                    <span className="font-semibold text-gray-900">
                      <Price amount={order.subtotal} locale={isRTL ? 'ar' : 'en'} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">{t('cart.shipping')}:</span>
                    <span className="font-semibold text-gray-900">
                      <Price amount={order.shipping} locale={isRTL ? 'ar' : 'en'} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">{t('cart.tax')}:</span>
                    <span className="font-semibold text-gray-900">
                      <Price amount={order.tax} locale={isRTL ? 'ar' : 'en'} />
                    </span>
                  </div>
                  {order.codFee > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">{t('payment.codFee')}:</span>
                      <span className="font-semibold text-gray-900">
                        <Price amount={order.codFee} locale={isRTL ? 'ar' : 'en'} />
                      </span>
                    </div>
                  )}
                  <div className="pt-4 mt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t('cart.total')}:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        <Price amount={order.total} locale={isRTL ? 'ar' : 'en'} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-lg">⚙️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ar' ? 'إجراءات الطلب' : 'Order Actions'}
                  </h3>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                {order.trackingNumber && (
                  <Button 
                    variant="outline" 
                    onClick={handleTrackOrder}
                    className="w-full flex items-center justify-center gap-2 py-3 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    <span>🚚</span>
                    {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleDownloadInvoice}
                  className="w-full flex items-center justify-center gap-2 py-3 hover:bg-purple-50 hover:border-purple-300 transition-all"
                >
                  <span>📄</span>
                  {language === 'ar' ? 'تحميل الفاتورة' : 'Download Invoice'}
                </Button>
                
                {order.status === 'delivered' && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/reviews')}
                      className="w-full flex items-center justify-center gap-2 py-3 hover:bg-yellow-50 hover:border-yellow-300 transition-all"
                    >
                      <span>⭐</span>
                      {language === 'ar' ? 'كتابة تقييم' : 'Write Review'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleReorder}
                      className="w-full flex items-center justify-center gap-2 py-3 hover:bg-green-50 hover:border-green-300 transition-all"
                    >
                      <span>🔁</span>
                      {language === 'ar' ? 'إعادة الطلب' : 'Reorder'}
                    </Button>
                  </>
                )}
                
                {['pending', 'processing'].includes(order.status) && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancelOrder}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all"
                  >
                    <span>❌</span>
                    {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
