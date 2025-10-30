/**
 * Lead Management Dashboard
 * 
 * Main entry point for lead management with:
 * - Quick stats overview
 * - Recent leads
 * - Quick actions
 * - Navigation to list, create, and detail views
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  UserPlus,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isDemoMode } from '@/lib/envValidation';
import { createMockLead } from '@/lib/testFixtures';
import type { Lead } from '@/lib/schemas/crm';

export default function LeadManagement() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    converted: 0,
    avgScore: 0,
    thisWeek: 0,
    conversionRate: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode()) {
        // Demo mode: Generate mock data
        const mockLeads = Array.from({ length: 5 }, (_, i) => {
          const sources = ['website', 'referral', 'cold_outreach', 'event'];
          const statuses = ['new', 'contacted', 'qualified', 'nurturing'];
          return createMockLead({
            source: sources[i % sources.length] as any,
            status: statuses[i % statuses.length] as any,
            score: 60 + Math.floor(Math.random() * 40),
          });
        });
        
        setRecentLeads(mockLeads as unknown as Lead[]);
        setStats({
          total: 156,
          new: 23,
          qualified: 45,
          converted: 18,
          avgScore: 72,
          thisWeek: 12,
          conversionRate: 11.5,
        });
      } else {
        // Real API call
        const response = await fetch('/.netlify/functions/lead-ingest-enhanced?limit=5');
        if (response.ok) {
          const data = await response.json();
          setRecentLeads(data.leads || []);
          setStats(data.stats || {});
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: any; 
    trend?: 'up' | 'down' | 'neutral' 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className={`text-xs ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' :
            'text-muted-foreground'
          }`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage and track your real estate investment leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/crm/leads')}>
            <Search className="w-4 h-4 mr-2" />
            View All Leads
          </Button>
          <Button onClick={() => navigate('/crm/leads/new')}>
            <UserPlus className="w-4 h-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={stats.total}
          subtitle={`+${stats.thisWeek} this week`}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="New Leads"
          value={stats.new}
          subtitle="Awaiting contact"
          icon={Clock}
        />
        <StatCard
          title="Qualified"
          value={stats.qualified}
          subtitle="Ready for conversion"
          icon={Target}
        />
        <StatCard
          title="Converted"
          value={stats.converted}
          subtitle={`${stats.conversionRate}% conversion rate`}
          icon={CheckCircle}
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/crm/leads/new')}
            >
              <UserPlus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Add New Lead</div>
                <div className="text-xs text-muted-foreground">Create a new lead entry</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/crm/leads')}
            >
              <Filter className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Filter & Search</div>
                <div className="text-xs text-muted-foreground">Find specific leads</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/crm/leads?status=qualified')}
            >
              <BarChart3 className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">View Reports</div>
                <div className="text-xs text-muted-foreground">Analytics & insights</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Performance</CardTitle>
            <CardDescription>Average lead quality metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Lead Score</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold">{stats.avgScore}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ width: `${stats.avgScore}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.qualified}</div>
                  <div className="text-xs text-muted-foreground">Qualified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
                  <div className="text-xs text-muted-foreground">Converted</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Health</CardTitle>
            <CardDescription>Lead funnel breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'New', count: stats.new, color: 'bg-blue-500', percentage: 15 },
                { label: 'Contacted', count: Math.floor(stats.new * 0.7), color: 'bg-purple-500', percentage: 10 },
                { label: 'Qualified', count: stats.qualified, color: 'bg-yellow-500', percentage: 29 },
                { label: 'Nurturing', count: Math.floor(stats.qualified * 0.8), color: 'bg-orange-500', percentage: 23 },
                { label: 'Converted', count: stats.converted, color: 'bg-green-500', percentage: 12 },
              ].map((stage) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className="w-24 text-sm font-medium">{stage.label}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${stage.color} h-2 rounded-full transition-all`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm font-semibold">{stage.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest leads added to the system</CardDescription>
          </div>
          <Button variant="ghost" onClick={() => navigate('/crm/leads')}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No leads yet</p>
              <Button size="sm" onClick={() => navigate('/crm/leads/new')}>
                Create First Lead
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/crm/leads/${lead.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {lead.firstName || lead.lastName
                          ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                          : 'Unknown Lead'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lead.contact?.email || lead.contact?.phone || 'No contact info'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{lead.source}</Badge>
                    <Badge className={
                      lead.status === 'new' ? 'bg-blue-500' :
                      lead.status === 'qualified' ? 'bg-green-500' :
                      lead.status === 'converted' ? 'bg-emerald-500' :
                      'bg-purple-500'
                    }>
                      {lead.status}
                    </Badge>
                    {lead.score && (
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">{lead.score}</span>
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-900">
                <strong>Demo Mode:</strong> Showing mock data. Connect to a real database to see
                actual lead metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
