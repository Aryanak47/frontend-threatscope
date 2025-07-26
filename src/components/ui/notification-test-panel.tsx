'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationStore, requestNotificationPermission } from '@/stores/notifications';
import { webSocketService } from '@/lib/websocket';
import { Shield, Bell, AlertTriangle, Info, Zap, Settings, TestTube } from 'lucide-react';

export function NotificationTestPanel() {
  const { addNotification, isConnected } = useNotificationStore();

  const testNotifications = [
    {
      type: 'breach' as const,
      title: 'Security Breach Detected',
      message: 'New breach found for company.com containing 1,847 records',
      priority: 'critical' as const,
      data: { email: 'admin@company.com', records: 1847 }
    },
    {
      type: 'alert' as const,
      title: 'Monitoring Alert Triggered',
      message: 'Email monitoring detected new activity for john@example.com',
      priority: 'high' as const,
      data: { monitoringItem: 'email-john@example.com' }
    },
    {
      type: 'monitoring' as const,
      title: 'Monitoring Check Complete',
      message: 'Scheduled monitoring scan completed successfully',
      priority: 'low' as const,
      data: { itemsChecked: 8, issuesFound: 0 }
    },
    {
      type: 'system' as const,
      title: 'System Maintenance',
      message: 'Scheduled maintenance completed. All systems operational.',
      priority: 'medium' as const,
    },
    {
      type: 'success' as const,
      title: 'Export Complete',
      message: 'Your breach report has been generated and is ready for download',
      priority: 'low' as const,
      data: { exportId: 'exp_123456', format: 'CSV' }
    }
  ];

  const handleTestNotification = (index: number) => {
    addNotification(testNotifications[index]);
  };

  const handleRequestPermission = () => {
    requestNotificationPermission();
  };

  const handleTestAuthentication = () => {
    const connectionInfo = webSocketService.getConnectionInfo();
    console.log('📊 Authentication test results:', connectionInfo);
    
    addNotification({
      type: 'system',
      title: 'Auth Test Complete',
      message: `Token: ${connectionInfo.hasToken ? 'Found' : 'Missing'}, User: ${connectionInfo.userId || 'Missing'}`,
      priority: connectionInfo.hasToken && connectionInfo.userId ? 'low' : 'high'
    });
  };

  const handleTestConnection = () => {
    const connectionInfo = webSocketService.getConnectionInfo();
    console.log('📊 Connection status:', connectionInfo);
    
    addNotification({
      type: 'system',
      title: 'Connection Test',
      message: `Connected: ${connectionInfo.connected}, Auth: ${connectionInfo.hasToken && connectionInfo.userId ? 'OK' : 'Failed'}`,
      priority: connectionInfo.connected ? 'low' : 'medium'
    });
  };

  const handleForceConnect = () => {
    console.log('🔌 Force connecting...');
    const { connect } = useNotificationStore.getState();
    
    try {
      connect();
      addNotification({
        type: 'system',
        title: 'Force Connect Triggered',
        message: 'Manually triggered WebSocket connection',
        priority: 'low'
      });
    } catch (error) {
      console.error('❌ Error force connecting:', error);
      addNotification({
        type: 'error',
        title: 'Force Connect Failed',
        message: `Error: ${error}`,
        priority: 'high'
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Testing
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Real-time Connected' : 'Disconnected'}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Button
          onClick={handleRequestPermission}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Bell className="h-4 w-4 mr-2" />
          Enable Browser Notifications
        </Button>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Test Notifications:</h4>
          
          <Button
            onClick={() => handleTestNotification(0)}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2 text-red-600" />
            Critical Breach Alert
          </Button>
          
          <Button
            onClick={() => handleTestNotification(1)}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
            High Priority Alert
          </Button>
          
          <Button
            onClick={() => handleTestNotification(2)}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <Info className="h-4 w-4 mr-2 text-blue-600" />
            Monitoring Update
          </Button>
          
          <Button
            onClick={() => handleTestNotification(3)}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2 text-gray-600" />
            System Notification
          </Button>
          
          <Button
            onClick={() => handleTestNotification(4)}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <Info className="h-4 w-4 mr-2 text-green-600" />
            Success Message
            </Button>
            </div>
      
      {/* Debug Section */}
      <div className="space-y-2 border-t pt-3">
        <h4 className="text-sm font-medium">Debug WebSocket:</h4>
        
        <Button
          onClick={handleTestAuthentication}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <TestTube className="h-4 w-4 mr-2 text-blue-600" />
          Test Authentication
        </Button>
        
        <Button
          onClick={handleTestConnection}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Settings className="h-4 w-4 mr-2 text-purple-600" />
          Test Connection
        </Button>
        
        <Button
        onClick={handleForceConnect}
        variant="outline"
        className="w-full justify-start"
        size="sm"
        >
        <Zap className="h-4 w-4 mr-2 text-green-600" />
        Force Connect
        </Button>
      </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          Click any button above to test different notification types. Critical and high priority alerts will also show browser notifications if permission is granted.
        </div>
      </CardContent>
    </Card>
  );
}
