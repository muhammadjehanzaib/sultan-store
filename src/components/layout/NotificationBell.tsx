'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: string;
  type: string;
  title_en: string;
  title_ar: string;
  message_en: string;
  message_ar: string;
  actionUrl?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  metadata?: any;
}

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notification count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      const response = await fetch('/api/notifications/count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  // Fetch notifications list
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true } 
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/count', {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    console.log('🔔 Notification clicked:', notification);
    
    // Mark as read first
    if (!notification.isRead) {
      console.log('📖 Marking notification as read:', notification.id);
      markAsRead(notification.id);
    }
    
    // Handle navigation
    if (notification.actionUrl) {
      console.log('🔗 Navigating to:', notification.actionUrl);
      
      // Check if it's an external URL
      if (notification.actionUrl.startsWith('http')) {
        window.location.href = notification.actionUrl;
      } else {
        // Use Next.js router for internal navigation
        console.log('🔀 Using router navigation to:', notification.actionUrl);
        router.push(notification.actionUrl);
      }
    } else {
      console.log('ℹ️ No action URL for this notification');
      // Just show the notification details
      alert(`Notification: ${notification.title_en}\n\n${notification.message_en}`);
    }
    
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data on mount and user change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, user?.id]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated, user?.id]);

  // Auto-refresh count every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Don't show for non-authenticated users or guests
  if (!isAuthenticated || !user?.id || user.isGuest) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_shipped':
      case 'order_delivered':
        return '📦';
      case 'low_stock':
        return '⚠️';
      case 'promotion':
        return '🎉';
      case 'system_alert':
        return '🚨';
      case 'review_request':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-gray-600';
      case 'low':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return language === 'ar' ? 'الآن' : 'now';
    if (diffHours < 24) return language === 'ar' ? `${diffHours}س` : `${diffHours}h`;
    if (diffDays < 7) return language === 'ar' ? `${diffDays}ي` : `${diffDays}d`;
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        aria-label="Notifications"
        title="Notifications"
      >
        <span className="text-lg">🔔</span>
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className={`absolute mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden ${isRTL ? 'left-0' : 'right-0'}`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b bg-gray-50 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="font-medium text-gray-900">
              {language === 'ar' ? 'الإشعارات' : 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <span className="text-4xl mb-2 block">📭</span>
                {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      !notification.isRead ? 'bg-purple-50' : ''
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`flex items-start ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} space-x-3`}>
                      {/* Icon */}
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <p className={`font-medium text-gray-900 truncate ${getPriorityColor(notification.priority)}`}>
                            {language === 'ar' ? notification.title_ar : notification.title_en}
                          </p>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        
                        {/* Message */}
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {language === 'ar' ? notification.message_ar : notification.message_en}
                        </p>
                        
                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className={`mt-2 ${isRTL ? 'text-left' : 'text-right'}`}>
                            <span className="inline-block w-2 h-2 bg-purple-600 rounded-full"></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t bg-gray-50 px-4 py-2 text-center">
              <button
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {language === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
