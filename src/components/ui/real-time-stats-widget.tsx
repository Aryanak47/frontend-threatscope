'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Shield, Search, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNotificationStore } from '@/stores/notifications';

interface LiveMetric {
  id: string;
  title: string;
  value: number;
  previousValue: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface SystemStatus {
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  activeUsers: number;
}

export function RealTimeStatsWidget() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'operational',
    uptime: 99.9,
    responseTime: 120,
    activeUsers: 47,
  });
  
  const { isConnected, notifications } = useNotificationStore();

  // Initialize metrics
  useEffect(() => {
    const initialMetrics: LiveMetric[] = [
      {
        id: 'searches_today',
        title: 'Searches Today',
        value: 23,
        previousValue: 18,
        trend: 'up',
        changePercent: 27.8,
        icon: Search,
        color: 'text-blue-600',
      },
      {
        id: 'breaches_detected',
        title: 'Breaches Found',
        value: 3,
        previousValue: 5,
        trend: 'down',
        changePercent: -40.0,
        icon: Shield,
        color: 'text-red-600',
      },
      {
        id: 'monitoring_items',
        title: 'Active Monitors',
        value: 8,
        previousValue: 8,
        trend: 'stable',
        changePercent: 0,
        icon: Eye,
        color: 'text-yellow-600',
      },
      {
        id: 'alerts_triggered',
        title: 'Alerts Today',
        value: 2,
        previousValue: 1,
        trend: 'up',
        changePercent: 100.0,
        icon: Activity,
        color: 'text-orange-600',
      },
    ];

    setMetrics(initialMetrics);
  }, []);

  // Update metrics based on notifications
  useEffect(() => {
    const breachCount = notifications.filter(n => n.type === 'breach').length;
    const alertCount = notifications.filter(n => n.type === 'alert').length;
    
    setMetrics(prev => prev.map(metric => {
      if (metric.id === 'breaches_detected') {
        const newValue = Math.max(metric.value, breachCount);
        return {
          ...metric,
          value: newValue,
          trend: newValue > metric.previousValue ? 'up' : 
                 newValue < metric.previousValue ? 'down' : 'stable',
          changePercent: metric.previousValue > 0 
            ? ((newValue - metric.previousValue) / metric.previousValue) * 100 
            : 0,
        };
      }
      
      if (metric.id === 'alerts_triggered') {
        const newValue = Math.max(metric.value, alertCount);
        return {
          ...metric,
          value: newValue,
          trend: newValue > metric.previousValue ? 'up' : 
                 newValue < metric.previousValue ? 'down' : 'stable',
          changePercent: metric.previousValue > 0 
            ? ((newValue - metric.previousValue) / metric.previousValue) * 100 
            : 0,
        };
      }
      
      return metric;
    }));
  }, [notifications]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        responseTime: Math.max(80, prev.responseTime + (Math.random() - 0.5) * 20),
        activeUsers: Math.max(1, prev.activeUsers + Math.floor((Math.random() - 0.5) * 5)),
      }));

      // Randomly update search count
      if (Math.random() > 0.8) {
        setMetrics(prev => prev.map(metric => {
          if (metric.id === 'searches_today') {
            const newValue = metric.value + 1;
            return {
              ...metric,
              value: newValue,
              trend: 'up',
              changePercent: ((newValue - metric.previousValue) / metric.previousValue) * 100,
            };
          }
          return metric;
        }));
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* System Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">System Status</CardTitle>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Badge className={getStatusColor(systemStatus.status)}>
                {systemStatus.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Uptime</p>
              <p className="font-semibold text-lg">{systemStatus.uptime.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-600">Response Time</p>
              <p className="font-semibold text-lg">{Math.round(systemStatus.responseTime)}ms</p>
            </div>
            <div>
              <p className="text-gray-600">Active Users</p>
              <p className="font-semibold text-lg">{systemStatus.activeUsers}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>System Performance</span>
              <span>{Math.round((1000 - systemStatus.responseTime) / 10)}%</span>
            </div>
            <Progress value={(1000 - systemStatus.responseTime) / 10} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Live Metrics</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  metric: LiveMetric;
}

function MetricCard({ metric }: MetricCardProps) {
  const IconComponent = metric.icon;
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-gray-50`}>
          <IconComponent className={`h-4 w-4 ${metric.color}`} />
        </div>
        
        <div className="flex items-center gap-1">
          {getTrendIcon(metric.trend)}
          <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
            {metric.trend !== 'stable' && (
              <>
                {metric.changePercent > 0 ? '+' : ''}
                {metric.changePercent.toFixed(1)}%
              </>
            )}
          </span>
        </div>
      </div>
      
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {metric.value}{metric.unit}
        </p>
        <p className="text-sm text-gray-600">{metric.title}</p>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Previous: {metric.previousValue}{metric.unit}
      </div>
    </div>
  );
}
