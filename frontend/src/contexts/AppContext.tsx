import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Notification, AppState } from '../types/api';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
}

interface SimpleNotification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

type AppAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification | SimpleNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean };

const initialState: AppState = {
  notifications: [],
  loading: false,
  connected: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const notification: Notification = 'id' in action.payload 
        ? action.payload as Notification
        : {
            id: Date.now().toString(),
            title: (action.payload as SimpleNotification).type.charAt(0).toUpperCase() + (action.payload as SimpleNotification).type.slice(1),
            message: (action.payload as SimpleNotification).message,
            type: (action.payload as SimpleNotification).type,
            timestamp: new Date(),
            read: false,
          };
      return {
        ...state,
        notifications: [notification, ...state.notifications],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        connected: action.payload,
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove success notifications after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: newNotification.id });
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setConnected = (connected: boolean) => {
    dispatch({ type: 'SET_CONNECTED', payload: connected });
  };

  const value: AppContextType = {
    state,
    dispatch,
    addNotification,
    removeNotification,
    markNotificationRead,
    setLoading,
    setConnected,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Export useAppContext as an alias for useApp
export const useAppContext = useApp;
