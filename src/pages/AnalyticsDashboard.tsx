/**
 * Analytics Dashboard - Steve AI Foundation
 * 
 * Features:
 * - Key metrics overview
 * - Lead conversion funnel
 * - Deal pipeline analytics
 * - Activity timeline
 * - Performance trends
 * - AI insights panel (Steve foundation)
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Brain,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface ConversionStage {
  stage: string;
  count: number;
  conversionRate: number;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setIsLoading(false), 1000);
  }, [timeRange]);

  // Mock data - would be replaced with real API calls
  const metrics: MetricCard[] = [
    {
      title: 'Total Leads',
      value: '1,247',
      change: 12.5,
      trend: 'up',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Active Deals',
      value: '89',
      change: 8.3,
      trend: 'up',
      icon: <Target className="h-4 w-4" />
    },
    {
      title: 'Total Pipeline Value',
      value: '$12.4M',
      change: -3.2,
      trend: 'down',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: 'Conversion Rate',
      value: '7.2%',
      change: 1.4,
      trend: 'up',
      icon: <TrendingUp className="h-4 w-4" />
    }
  ];

  const conversionFunnel: ConversionStage[] = [
    { stage: 'New Leads', count: 1247, conversionRate: 100 },
    { stage: 'Contacted', count: 892, conversionRate: 71.5 },
    { stage: 'Qualified', count: 456, conversionRate: 51.1 },
    { stage: 'Proposal Sent', count: 234, conversionRate: 51.3 },
    { stage: 'Negotiation', count: 127, conversionRate: 54.3 },
    { stage: 'Closed Won', count: 89, conversionRate: 70.1 }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'High-Value Lead Spike',
      description: 'Detected 23% increase in qualified leads from referral sources this week. Consider allocating more resources to follow up.',
      impact: 'high',
      actionable: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Deal Velocity Slowdown',
      description: 'Average time in "Proposal Sent" stage increased by 5 days. Review bottlenecks with sales team.',
      impact: 'medium',
      actionable: true
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Optimize Follow-up Timing',
      description: 'Analysis shows 3x higher conversion when following up between 10 AM - 12 PM on Tuesdays.',
      impact: 'medium',
      actionable: true
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral', change: number) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="h-4 w-4" />
          <span className="text-sm font-medium">+{change}%</span>
        </div>
      );
    }
    if (trend === 'down') {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="h-4 w-4" />
          <span className="text-sm font-medium">{change}%</span>
        </div>
      );
    }
    return <span className="text-sm text-muted-foreground">—</span>;
  };

  const getInsightBadge = (type: AIInsight['type']) => {
    const variants: Record<string, { variant: any; label: string }> = {
      opportunity: { variant: 'default', label: 'Opportunity' },
      warning: { variant: 'destructive', label: 'Warning' },
      recommendation: { variant: 'secondary', label: 'Recommendation' }
    };
    
    const config = variants[type];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance and AI-powered insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="mt-1">
                {getTrendIcon(metric.trend, metric.change)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="steve">Steve AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Lead Sources
                </CardTitle>
                <CardDescription>Distribution of leads by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { source: 'Website', count: 456, percentage: 36.6 },
                    { source: 'Referral', count: 342, percentage: 27.4 },
                    { source: 'Social Media', count: 234, percentage: 18.8 },
                    { source: 'Paid Ads', count: 145, percentage: 11.6 },
                    { source: 'Other', count: 70, percentage: 5.6 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.source}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Deal Stage Distribution
                </CardTitle>
                <CardDescription>Current deals by pipeline stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { stage: 'Qualification', count: 34, value: '$2.1M' },
                    { stage: 'Proposal', count: 23, value: '$4.5M' },
                    { stage: 'Negotiation', count: 19, value: '$3.8M' },
                    { stage: 'Closing', count: 13, value: '$2.0M' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{item.stage}</div>
                        <div className="text-sm text-muted-foreground">{item.count} deals</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Recent platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 minutes ago', event: 'New lead created', user: 'John Smith', type: 'lead' },
                  { time: '15 minutes ago', event: 'Deal moved to Negotiation', user: 'Sarah Johnson', type: 'deal' },
                  { time: '1 hour ago', event: 'Email sent to 15 leads', user: 'System', type: 'automation' },
                  { time: '2 hours ago', event: 'Workflow "Welcome Series" completed', user: 'System', type: 'automation' },
                  { time: '3 hours ago', event: 'Investor profile updated', user: 'Mike Davis', type: 'investor' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion Funnel</CardTitle>
              <CardDescription>Track leads through each stage of the pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{stage.count} leads</span>
                        {index > 0 && (
                          <Badge variant="secondary">{stage.conversionRate.toFixed(1)}% conversion</Badge>
                        )}
                      </div>
                    </div>
                    <div className="relative w-full bg-secondary rounded-full h-8">
                      <div
                        className="absolute left-0 top-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-8 flex items-center justify-center text-white text-sm font-medium"
                        style={{ width: `${(stage.count / conversionFunnel[0].count) * 100}%` }}
                      >
                        {stage.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline Analytics</CardTitle>
              <CardDescription>Performance metrics for your sales pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Deal Size</p>
                  <p className="text-2xl font-bold">$139,325</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% from last period
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Close Time</p>
                  <p className="text-2xl font-bold">42 days</p>
                  <p className="text-xs text-red-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    +3 days from last period
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">38.5%</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1% from last period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Steve AI Insights Tab */}
        <TabsContent value="steve" className="space-y-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Steve AI - Empire Builder
              </CardTitle>
              <CardDescription>
                AI-powered insights and recommendations to grow your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 border rounded-lg bg-card space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {getInsightBadge(insight.type)}
                        <Badge variant="outline">{insight.impact} impact</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.actionable && (
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Note:</strong> Steve AI is currently in foundation mode. Full AI capabilities 
                  including strategic planning, task orchestration, and predictive analytics will be 
                  available in Phase 3.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
