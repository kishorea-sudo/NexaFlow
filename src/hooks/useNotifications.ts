import { useState, useEffect } from 'react';
import { Notification } from '../types';

const demoNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: '1',
    title: 'New Project Assigned',
    message: 'Brand Redesign Project has been assigned to your team',
    type: 'info',
    channel: 'in-app',
    status: 'unread',
    actionUrl: '/projects/PROJ-001',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'notif-2',
    userId: '1',
    title: 'Deliverable Approved',
    message: 'Logo concepts have been approved by the client',
    type: 'success',
    channel: 'whatsapp',
    status: 'unread',
    actionUrl: '/projects/PROJ-001',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 'notif-3',
    userId: '1',
    title: 'Deadline Reminder',
    message: 'Brand guidelines are due in 2 days',
    type: 'warning',
    channel: 'email',
    status: 'read',
    actionUrl: '/projects/PROJ-001',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(demoNotifications.filter(n => n.userId === userId));
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, status: 'read' as const }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
};