import { create } from 'zustand';
import { AlertAction, BreachAlert, CreateAlertActionRequest, ActionTypeInfo, AlertActionStatistics } from '@/types/alerts';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { apiClient } from '@/lib/api';

interface AlertState {
  // Alerts
  alerts: BreachAlert[];
  currentAlert: BreachAlert | null;
  alertsLoading: boolean;
  alertsError: string | null;
  unreadCount: number;
  
  // Alert Actions
  alertActions: AlertAction[];
  currentAlertActions: AlertAction[];
  serviceRequests: AlertAction[];
  actionTypes: ActionTypeInfo[];
  actionStatistics: AlertActionStatistics | null;
  actionsLoading: boolean;
  actionsError: string | null;
  
  // UI State
  selectedAlerts: number[];
  showActionModal: boolean;
  actionModalAlertId: number | null;
  
  // Actions
  fetchAlerts: (page?: number, size?: number) => Promise<void>;
  fetchAlertActions: (alertId: number) => Promise<void>;
  fetchUserActions: (page?: number, size?: number) => Promise<void>;
  fetchServiceRequests: () => Promise<void>;
  fetchActionTypes: () => Promise<void>;
  fetchActionStatistics: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  
  createAlertAction: (alertId: number, request: CreateAlertActionRequest) => Promise<AlertAction>;
  cancelAlertAction: (actionId: number) => Promise<void>;
  
  // Quick actions
  acknowledgeAlert: (alertId: number) => Promise<void>;
  markAsRead: (alertId: number) => Promise<void>;
  markAsResolved: (alertId: number, message?: string) => Promise<void>;
  markAsFalsePositive: (alertId: number, message?: string) => Promise<void>;
  escalateAlert: (alertId: number, message?: string, urgencyLevel?: string) => Promise<void>;
  
  // UI Actions
  selectAlert: (alertId: number) => void;
  deselectAlert: (alertId: number) => void;
  clearSelectedAlerts: () => void;
  openActionModal: (alertId: number) => void;
  closeActionModal: () => void;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

const useAlertStore = create<AlertState>((set, get) => ({
  // Initial state
  alerts: [],
  currentAlert: null,
  alertsLoading: false,
  alertsError: null,
  unreadCount: 0,
  
  alertActions: [],
  currentAlertActions: [],
  serviceRequests: [],
  actionTypes: [],
  actionStatistics: null,
  actionsLoading: false,
  actionsError: null,
  
  selectedAlerts: [],
  showActionModal: false,
  actionModalAlertId: null,
  
  // Fetch alerts
  fetchAlerts: async (page = 0, size = 20) => {
    set({ alertsLoading: true, alertsError: null });
    
    try {
      // Use the API client which already handles the base URL and authentication
      const data = await apiClient.request<PaginatedResponse<BreachAlert>>({
        url: `/monitoring/alerts?page=${page}&size=${size}`,
        method: 'GET'
      });
      
      set({ alerts: data.content, alertsLoading: false });
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      set({ 
        alertsError: error.response?.data?.message || error.message || 'Failed to fetch alerts',
        alertsLoading: false 
      });
    }
  },
  
  // Fetch actions for specific alert
  fetchAlertActions: async (alertId: number) => {
    set({ actionsLoading: true, actionsError: null });
    
    try {
      const response = await fetch(`/api/alerts/${alertId}/actions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alert actions: ${response.status}`);
      }
      
      const data: ApiResponse<AlertAction[]> = await response.json();
      
      if (data.success) {
        set({ currentAlertActions: data.data, actionsLoading: false });
      } else {
        throw new Error(data.message || 'Failed to fetch alert actions');
      }
    } catch (error) {
      console.error('Error fetching alert actions:', error);
      set({ 
        actionsError: error instanceof Error ? error.message : 'Failed to fetch alert actions',
        actionsLoading: false 
      });
    }
  },
  
  // Fetch user's all actions
  fetchUserActions: async (page = 0, size = 20) => {
    set({ actionsLoading: true, actionsError: null });
    
    try {
      const response = await fetch(`/api/alerts/actions?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user actions: ${response.status}`);
      }
      
      const data: ApiResponse<PaginatedResponse<AlertAction>> = await response.json();
      
      if (data.success) {
        set({ alertActions: data.data.content, actionsLoading: false });
      } else {
        throw new Error(data.message || 'Failed to fetch user actions');
      }
    } catch (error) {
      console.error('Error fetching user actions:', error);
      set({ 
        actionsError: error instanceof Error ? error.message : 'Failed to fetch user actions',
        actionsLoading: false 
      });
    }
  },
  
  // Fetch service requests
  fetchServiceRequests: async () => {
    try {
      const response = await fetch('/api/alerts/actions/service-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service requests: ${response.status}`);
      }
      
      const data: ApiResponse<AlertAction[]> = await response.json();
      
      if (data.success) {
        set({ serviceRequests: data.data });
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
    }
  },
  
  // Fetch action types
  fetchActionTypes: async () => {
    try {
      const response = await fetch('/api/alerts/action-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch action types: ${response.status}`);
      }
      
      const data: ApiResponse<ActionTypeInfo[]> = await response.json();
      
      if (data.success) {
        set({ actionTypes: data.data });
      }
    } catch (error) {
      console.error('Error fetching action types:', error);
    }
  },
  
  // Fetch action statistics
  fetchActionStatistics: async () => {
    try {
      const response = await fetch('/api/alerts/actions/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch action statistics: ${response.status}`);
      }
      
      const data: ApiResponse<AlertActionStatistics> = await response.json();
      
      if (data.success) {
        set({ actionStatistics: data.data });
      }
    } catch (error) {
      console.error('Error fetching action statistics:', error);
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      // Try the new breach alerts endpoint first
      try {
        const count = await apiClient.request<number>({
          url: '/monitoring/alerts/unread-count',
          method: 'GET'
        });
        set({ unreadCount: count || 0 });
        return;
      } catch (error: any) {
        // If breach alerts endpoint doesn't exist yet, try fallback
        if (error.response?.status === 404) {
          console.log('Breach alerts endpoint not found, trying fallback...');
        } else {
          throw error;
        }
      }
      
      // Fallback to alert actions statistics
      try {
        const stats = await apiClient.request<AlertActionStatistics>({
          url: '/alerts/actions/statistics',
          method: 'GET'
        });
        set({ unreadCount: stats.pendingActions || 0 });
        return;
      } catch (error: any) {
        console.log('Alert actions statistics endpoint also failed, using 0');
      }
      
      // Final fallback
      set({ unreadCount: 0 });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Fallback to 0 if there's an error
      set({ unreadCount: 0 });
    }
  },
  
  // Create alert action
  createAlertAction: async (alertId: number, request: CreateAlertActionRequest) => {
    set({ actionsLoading: true, actionsError: null });
    
    try {
      const response = await fetch(`/api/alerts/${alertId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create alert action: ${response.status}`);
      }
      
      const data: ApiResponse<AlertAction> = await response.json();
      
      if (data.success) {
        set({ actionsLoading: false });
        // Refresh current alert actions and statistics
        get().fetchAlertActions(alertId);
        get().fetchActionStatistics();
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create alert action');
      }
    } catch (error) {
      console.error('Error creating alert action:', error);
      set({ 
        actionsError: error instanceof Error ? error.message : 'Failed to create alert action',
        actionsLoading: false 
      });
      throw error;
    }
  },
  
  // Cancel alert action
  cancelAlertAction: async (actionId: number) => {
    try {
      const response = await fetch(`/api/alerts/actions/${actionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel alert action: ${response.status}`);
      }
      
      // Refresh actions and statistics
      get().fetchUserActions();
      get().fetchServiceRequests();
      get().fetchActionStatistics();
    } catch (error) {
      console.error('Error cancelling alert action:', error);
      throw error;
    }
  },
  
  // Quick action: Acknowledge alert
  acknowledgeAlert: async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to acknowledge alert: ${response.status}`);
      }
      
      // Refresh alerts, actions, and unread count
      get().fetchAlerts();
      get().fetchAlertActions(alertId);
      get().fetchUnreadCount();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  },
  
  // Quick action: Mark as read
  markAsRead: async (alertId: number) => {
    try {
      await apiClient.request({
        url: `/monitoring/alerts/${alertId}/read`,
        method: 'PUT'
      });
      
      // Update the alert in local state
      const currentAlerts = get().alerts;
      const updatedAlerts = currentAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      );
      
      // Update unread count
      const newUnreadCount = updatedAlerts.filter(alert => !alert.isRead).length;
      
      set({ 
        alerts: updatedAlerts,
        unreadCount: newUnreadCount
      });
      
      // Also refresh from server to ensure sync
      get().fetchUnreadCount();
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  },
  
  // Quick action: Mark as resolved
  markAsResolved: async (alertId: number, message?: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark alert as resolved: ${response.status}`);
      }
      
      // Refresh alerts and actions
      get().fetchAlerts();
      get().fetchAlertActions(alertId);
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
      throw error;
    }
  },
  
  // Quick action: Mark as false positive
  markAsFalsePositive: async (alertId: number, message?: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/false-positive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark alert as false positive: ${response.status}`);
      }
      
      // Refresh alerts and actions
      get().fetchAlerts();
      get().fetchAlertActions(alertId);
    } catch (error) {
      console.error('Error marking alert as false positive:', error);
      throw error;
    }
  },
  
  // Quick action: Escalate alert
  escalateAlert: async (alertId: number, message?: string, urgencyLevel?: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('threatscope_token')}`,
        },
        body: JSON.stringify({ message, urgencyLevel }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to escalate alert: ${response.status}`);
      }
      
      // Refresh alerts and actions
      get().fetchAlerts();
      get().fetchAlertActions(alertId);
    } catch (error) {
      console.error('Error escalating alert:', error);
      throw error;
    }
  },
  
  // UI Actions
  selectAlert: (alertId: number) => {
    const { selectedAlerts } = get();
    if (!selectedAlerts.includes(alertId)) {
      set({ selectedAlerts: [...selectedAlerts, alertId] });
    }
  },
  
  deselectAlert: (alertId: number) => {
    const { selectedAlerts } = get();
    set({ selectedAlerts: selectedAlerts.filter(id => id !== alertId) });
  },
  
  clearSelectedAlerts: () => {
    set({ selectedAlerts: [] });
  },
  
  openActionModal: (alertId: number) => {
    set({ showActionModal: true, actionModalAlertId: alertId });
  },
  
  closeActionModal: () => {
    set({ showActionModal: false, actionModalAlertId: null });
  },
  
  // Utility
  clearError: () => {
    set({ alertsError: null, actionsError: null });
  },
  
  reset: () => {
    set({
      alerts: [],
      currentAlert: null,
      alertsLoading: false,
      alertsError: null,
      unreadCount: 0,
      alertActions: [],
      currentAlertActions: [],
      serviceRequests: [],
      actionTypes: [],
      actionStatistics: null,
      actionsLoading: false,
      actionsError: null,
      selectedAlerts: [],
      showActionModal: false,
      actionModalAlertId: null,
    });
  },
}));

export default useAlertStore;
