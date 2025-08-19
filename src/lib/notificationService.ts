import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { render } from '@react-email/render';
import { User } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface NotificationInput {
  userId?: string;
  type: NotificationType;
  title: LocalizedText;
  message: LocalizedText;
  actionUrl?: string;
  sendEmail?: boolean;
  sendInApp?: boolean;
  priority?: 'low' | 'normal' | 'high';
  metadata?: any;
  expiresAt?: Date;
}

export interface LocalizedText {
  en: string;
  ar: string;
}

export type NotificationType = 
  | 'order_created'
  | 'order_shipped'
  | 'order_delivered'
  | 'low_stock'
  | 'review_request'
  | 'welcome'
  | 'password_reset'
  | 'promotion'
  | 'system_alert';

class NotificationService {
  /**
   * Create and send a notification
   */
  async create(input: NotificationInput): Promise<string> {
    try {
      // Validate userId exists in database if provided
      if (input.userId) {
        const userExists = await prisma.user.findUnique({
          where: { id: input.userId },
          select: { id: true }
        });
        
        if (!userExists) {
          console.error(`NotificationService.create: User with ID ${input.userId} not found`);
          // For non-user notifications, set userId to null
          input.userId = undefined;
        }
      }
      
      // Get user preferences if userId provided
      let sendEmail = input.sendEmail || false;
      let sendInApp = input.sendInApp !== false; // Default to true

      if (input.userId) {
        const preferences = await this.getUserPreferences(input.userId);
        
        if (preferences) {
          sendEmail = this.shouldSendEmail(input.type, preferences) && sendEmail;
          sendInApp = this.shouldSendInApp(input.type, preferences) && sendInApp;
        } else {
          // Create default preferences if they don't exist
          await this.createDefaultPreferences(input.userId);
          // Use defaults: sendEmail as provided, sendInApp true
        }
      }
      

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title_en: input.title.en,
          title_ar: input.title.ar,
          message_en: input.message.en,
          message_ar: input.message.ar,
          actionUrl: input.actionUrl,
          sendEmail,
          sendInApp,
          priority: input.priority || 'normal',
          metadata: input.metadata,
          expiresAt: input.expiresAt,
        }
      });

      // Send via enabled channels
      if (sendEmail && input.userId) {
        await this.sendEmailNotification(notification.id);
      }

      if (sendInApp) {
        await this.broadcastToApp(notification.id);
      }

      return notification.id;
    } catch (error) {
      console.error('NotificationService.create error:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notificationId: string): Promise<void> {
    try {
      
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true }
      });

      if (!notification) {
        return;
      }
      
      if (!notification.user) {
        return;
      }
      
      if (notification.emailSent) {
        return;
      }


      // Simple email template (can be enhanced later)
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6366f1; color: white; padding: 20px; text-align: center;">
            <h1>SaudiSafety</h1>
          </div>
          <div style="padding: 20px;">
            <h2>${notification.title_en}</h2>
            <p>${notification.message_en}</p>
            ${notification.actionUrl ? `<a href="${notification.actionUrl}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Details</a>` : ''}
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>SaudiSafety - Your trusted online store</p>
          </div>
        </div>
      `;

      // In Resend test mode, we can only send to the verified email
      // In production, you would verify your domain and send to notification.user.email
      const emailTo = process.env.NODE_ENV === 'production' 
        ? notification.user.email 
        : 'jehanzaib364@gmail.com'; // Test mode restriction
      
      const emailResponse = await resend.emails.send({
        from: 'SaudiSafety <onboarding@resend.dev>',
        to: emailTo,
        subject: notification.title_en,
        html: emailHtml,
      });
      

      // Mark as sent
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        }
      });
      

    } catch (error) {
      console.error('NotificationService.sendEmailNotification error:', error);
      // Log specific Resend errors
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Resend error details:', error.message);
      }
      
      // Don't throw - we don't want to break the notification creation
    }
  }

  /**
   * Broadcast to app (placeholder for real-time implementation)
   */
  private async broadcastToApp(notificationId: string): Promise<void> {
    // For now, this is just a placeholder
    // In Phase 4, we'll implement WebSocket/SSE broadcasting
  }

  /**
   * Get user notification preferences
   */
  private async getUserPreferences(userId: string) {
    return await prisma.notificationPreferences.findUnique({
      where: { userId }
    });
  }

  /**
   * Create default notification preferences for a user
   */
  private async createDefaultPreferences(userId: string) {
    try {
      await prisma.notificationPreferences.create({
        data: {
          userId,
          // Default preferences - users can change these later
          emailOrders: true,
          emailPromotions: false,
          emailSystem: true,
          inAppOrders: true,
          inAppPromotions: true,
          inAppSystem: true,
        }
      });
    } catch (error) {
      // Ignore if preferences already exist (race condition)
    }
  }

  /**
   * Check if should send email based on type and preferences
   */
  private shouldSendEmail(type: NotificationType, preferences: any): boolean {
    switch (type) {
      case 'order_created':
      case 'order_shipped':
      case 'order_delivered':
      case 'review_request':
        return preferences.emailOrders;
      case 'promotion':
        return preferences.emailPromotions;
      case 'low_stock':
      case 'system_alert':
        return preferences.emailSystem;
      default:
        return preferences.emailSystem;
    }
  }

  /**
   * Check if should send in-app based on type and preferences
   */
  private shouldSendInApp(type: NotificationType, preferences: any): boolean {
    switch (type) {
      case 'order_created':
      case 'order_shipped':
      case 'order_delivered':
      case 'review_request':
        return preferences.inAppOrders;
      case 'promotion':
        return preferences.inAppPromotions;
      case 'low_stock':
      case 'system_alert':
        return preferences.inAppSystem;
      default:
        return preferences.inAppSystem;
    }
  }

  /**
   * Get unread notifications for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        sendInApp: true,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        sendInApp: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.notification.count({
      where: {
        userId,
        sendInApp: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    return {
      notifications,
      total,
      hasMore: total > page * limit
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      }
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      }
    });
  }

  /**
   * Quick notification helpers for common scenarios
   */
  async notifyOrderCreated(userId: string, orderId: string, orderTotal: number) {
    return this.create({
      userId,
      type: 'order_created',
      title: {
        en: 'Order Confirmed!',
        ar: 'تم تأكيد الطلب!'
      },
      message: {
        en: `Your order #${orderId} for ${orderTotal} SAR has been confirmed and is being processed.`,
        ar: `تم تأكيد طلبك #${orderId} بقيمة ${orderTotal} ريال سعودي وجاري المعالجة.`
      },
      actionUrl: `/orders/${orderId}`,
      sendEmail: true,
      sendInApp: true,
      metadata: { orderId, orderTotal }
    });
  }

  async notifyOrderShipped(userId: string, orderId: string, trackingNumber?: string) {
    return this.create({
      userId,
      type: 'order_shipped',
      title: {
        en: 'Order Shipped!',
        ar: 'تم شحن الطلب!'
      },
      message: {
        en: trackingNumber 
          ? `Your order #${orderId} has been shipped. Tracking: ${trackingNumber}`
          : `Your order #${orderId} has been shipped and is on its way!`,
        ar: trackingNumber
          ? `تم شحن طلبك #${orderId}. رقم التتبع: ${trackingNumber}`
          : `تم شحن طلبك #${orderId} وهو في الطريق إليك!`
      },
      actionUrl: `/orders/${orderId}`,
      sendEmail: true,
      sendInApp: true,
      metadata: { orderId, trackingNumber }
    });
  }

  async notifyLowStock(productName: string, currentStock: number, threshold: number) {
    // System notification for admins
    return this.create({
      type: 'low_stock',
      title: {
        en: 'Low Stock Alert',
        ar: 'تنبيه نفاد المخزون'
      },
      message: {
        en: `${productName} is running low (${currentStock} left, threshold: ${threshold})`,
        ar: `${productName} يوشك على النفاد (${currentStock} متبقي، الحد الأدنى: ${threshold})`
      },
      sendEmail: false, // Don't spam email for stock alerts
      sendInApp: true,
      priority: 'high',
      metadata: { productName, currentStock, threshold }
    });
  }

  /**
   * Request review for delivered order
   */
  async notifyReviewRequest(userId: string, orderId: string, orderTotal: number, productNames: string[] = []) {
    const productList = productNames.length > 0 
      ? productNames.slice(0, 3).join(', ') + (productNames.length > 3 ? '...' : '')
      : 'your recent purchase';
    
    return this.create({
      userId,
      type: 'review_request',
      title: {
        en: 'How was your experience?',
        ar: 'كيف كانت تجربتك؟'
      },
      message: {
        en: `We'd love to hear your feedback about ${productList}. Your review helps other customers make informed decisions!`,
        ar: `نود سماع رأيك حول ${productList}. مراجعتك تساعد العملاء الآخرين على اتخاذ قرارات مدروسة!`
      },
      actionUrl: `/reviews`,
      sendEmail: true,
      sendInApp: true,
      priority: 'normal',
      metadata: { 
        orderId, 
        orderTotal, 
        productNames,
        type: 'review_request'
      }
    });
  }

  /**
   * Notify admin users about new orders
   */
  async notifyAdminNewOrder(orderId: string, customerEmail: string, orderTotal: number) {
    try {
      // Get all admin users
      const adminUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ['admin', 'manager']
          }
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      if (adminUsers.length === 0) {
        console.warn('notifyAdminNewOrder: No admin users found');
        return;
      }

      // Create notification for each admin
      for (const admin of adminUsers) {
        try {
          await this.create({
            userId: admin.id,
            type: 'order_created',
            title: {
              en: 'New Order Received!',
              ar: 'تم استلام طلب جديد!'
            },
            message: {
              en: `New order #${orderId} from ${customerEmail} for ${orderTotal} SAR`,
              ar: `طلب جديد #${orderId} من ${customerEmail} بقيمة ${orderTotal} ريال سعودي`
            },
            actionUrl: `/admin/orders`,
            sendEmail: true,
            sendInApp: true,
            priority: 'high',
            metadata: { orderId, customerEmail, orderTotal, type: 'admin_new_order' }
          });
        } catch (adminNotificationError) {
          console.error(`Failed to create notification for admin ${admin.id}:`, adminNotificationError);
          // Continue with other admins
        }
      }

    } catch (error) {
      console.error('NotificationService.notifyAdminNewOrder error:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
