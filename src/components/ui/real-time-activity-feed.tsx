'use client';

import { useEffect, useState } from 'react';
import { Shield, Search, Eye, Bell, Activity, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/stores/notifications';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'search' | 'breach' | 'monitoring' | 'alert' | 'login';
  title: string;
  description: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

const activityIcons = {
  search: Search,
  breach: Shield,
  monitoring: Eye,
  alert: Bell,
  login: Activity,
};

const activityColors = {
  search: 'text-blue-600 bg-blue-100',
  breach: 'text-red-600 bg-red-100',
  monitoring: 'text-yellow-600 bg-yellow-100',
  alert: 'text-orange-600 bg-orange-100',
  login: 'text-green-600 bg-green-100',
};

const severityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);
  const { notifications, isConnected } = useNotificationStore();

  // Generate mock activity data and sync with notifications
  useEffect(() => {
    // Add mock initial activities
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'login',
        title: 'User Login',
        description: 'You logged in successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: '2',
        type: 'search',
        title: 'Email Search',
        description: 'Searched for john@example.com',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: '3',
        type: 'monitoring',
        title: 'Monitoring Check',
        description: 'Email monitoring completed for company.com',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        severity: 'low',
      },
    ];

    setActivities(mockActivities);
  }, []);

  // Convert notifications to activities
  useEffect(() => {
    const notificationActivities = notifications.slice(0, 10).map((notification) => ({
      id: `notif-${notification.id}`,
      type: notification.type === 'breach' ? 'breach' : 
           notification.type === 'alert' ? 'alert' : 
           notification.type === 'monitoring' ? 'monitoring' : 'search',
      title: notification.title,
      description: notification.message,
      timestamp: notification.timestamp,
      severity: notification.priority,
      metadata: notification.data,
    }));

    setActivities(prev => {
      // Merge and deduplicate
      const combined = [...notificationActivities, ...prev];
      const uniqueActivities = combined.filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      );
      
      // Sort by timestamp (newest first) and limit to 20 items
      return uniqueActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);
    });
  }, [notifications]);

  // Simulate live activity updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Randomly add new activities to simulate real-time updates
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const activities = [
          {
            type: 'monitoring',
            title: 'Monitoring Check',
            description: 'Automated breach scan completed',
            severity: 'low',
          },
          {
            type: 'search',
            title: 'New Search',
            description: 'Background search executed',
            severity: 'medium',
          },
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        setActivities(prev => [{
          ...randomActivity,
          id: `live-${Date.now()}`,
          timestamp: new Date(),
        } as ActivityItem, ...prev.slice(0, 19)]);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const recentActivities = activities.slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Live Activity</CardTitle>
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected && (
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="h-7 px-2 text-xs"
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        {activities.length > 10 && (
          <div className="px-6 pb-4 pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full">
              View All Activity
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  activity: ActivityItem;
  isFirst?: boolean;
}

function ActivityItem({ activity, isFirst }: ActivityItemProps) {
  const IconComponent = activityIcons[activity.type];
  const colorClasses = activityColors[activity.type];
  
  return (
    <div className={`flex items-start gap-3 ${isFirst ? 'animate-pulse' : ''}`}>
      <div className={`rounded-full p-2 ${colorClasses}`}>
        <IconComponent className="h-3 w-3" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-gray-900">
            {activity.title}
          </h4>
          
          {activity.severity && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${severityColors[activity.severity]}`}
            >
              {activity.severity}
            </Badge>
          )}
          
          {isFirst && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              New
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-gray-600 mb-1">
          {activity.description}
        </p>
        
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
