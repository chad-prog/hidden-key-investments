import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock, Database, Server, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemMetrics {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastChecked: Date;
  components: ComponentStatus[];
}

interface ComponentStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      // In demo mode, return mock data
      const mockMetrics: SystemMetrics = {
        status: 'healthy',
        uptime: 99.98,
        lastChecked: new Date(),
        components: [
          { name: 'API Gateway', status: 'operational', responseTime: 45, errorRate: 0.01 },
          { name: 'Database', status: 'operational', responseTime: 12, errorRate: 0.0 },
          { name: 'Lead Ingestion', status: 'operational', responseTime: 120, errorRate: 0.02 },
          { name: 'Workflow Engine', status: 'operational', responseTime: 200, errorRate: 0.05 },
          { name: 'Email Service', status: 'operational', responseTime: 300, errorRate: 0.1 },
          { name: 'SMS Service', status: 'operational', responseTime: 250, errorRate: 0.08 },
        ]
      };
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      operational: 'default',
      healthy: 'default',
      degraded: 'secondary',
      warning: 'secondary',
      down: 'destructive',
      error: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time platform health and performance</p>
        </div>
        {metrics && (
          <div className="flex items-center gap-2">
            {getStatusIcon(metrics.status)}
            {getStatusBadge(metrics.status)}
          </div>
        )}
      </div>

      {/* Overall System Health */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last checked: {metrics?.lastChecked.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Components</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.components.filter(c => c.status === 'operational').length} / {metrics?.components.length}
            </div>
            <p className="text-xs text-muted-foreground">Components online</p>
          </CardContent>
        </Card>
      </div>

      {/* Component Status */}
      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
          <CardDescription>Detailed health status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.components.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(component.status)}
                  <div>
                    <h3 className="font-medium">{component.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Response time: {component.responseTime}ms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Error Rate</div>
                    <div className="text-sm text-muted-foreground">{component.errorRate}%</div>
                  </div>
                  {getStatusBadge(component.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>No incidents in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All systems running smoothly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Query Performance</span>
                <span className="text-sm font-medium">Excellent (12ms avg)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Connections</span>
                <span className="text-sm font-medium">15 / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Storage Used</span>
                <span className="text-sm font-medium">2.4 GB / 100 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Requests/min</span>
                <span className="text-sm font-medium">450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="text-sm font-medium">99.95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">145ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
