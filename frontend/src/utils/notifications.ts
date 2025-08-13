// Helper function to create notifications with proper structure
import type { Notification } from '../types/api';

export const createNotification = (
  message: string, 
  type: 'success' | 'error' | 'warning' | 'info',
  title?: string
): Notification => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    title: title || type.charAt(0).toUpperCase() + type.slice(1),
    message,
    timestamp: new Date(),
    read: false,
  };
};
