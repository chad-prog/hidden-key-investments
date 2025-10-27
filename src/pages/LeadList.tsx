/**
 * Lead List Page
 * 
 * Comprehensive lead management interface with:
 * - Sortable, filterable lead table
 * - Search functionality
 * - Status management
 * - Bulk operations
 * - Integration with backend APIs
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isDemoMode } from '@/lib/envValidation';
import { createMockLead } from '@/lib/testFixtures';
import type { Lead } from '@/lib/schemas/crm';

// Lead status configuration
const LEAD_STATUSES = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-purple-500' },
  qualified: { label: 'Qualified', color: 'bg-green-500' },
  nurturing: { label: 'Nurturing', color: 'bg-yellow-500' },
  converted: { label: 'Converted', color: 'bg-emerald-500' },
  disqualified: { label: 'Disqualified', color: 'bg-gray-500' },
  lost: { label: 'Lost', color: 'bg-red-500' },
};

const LEAD_SOURCES = [
  'all',
  'website',
  'referral',
  'cold_outreach',
  'event',
  'partner',
  'social_media',
  'paid_ads',
  'other',
];

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode()) {
        // Demo mode: Generate mock leads
        const mockLeads = Array.from({ length: 15 }, (_, i) => {
          const sources = ['website', 'referral', 'cold_outreach', 'event', 'partner'];
          const statuses = ['new', 'contacted', 'qualified', 'nurturing', 'converted'];
          return createMockLead({
            source: sources[i % sources.length] as any,
            status: statuses[i % statuses.length] as any,
            score: Math.floor(Math.random() * 100),
          });
        });
        setLeads(mockLeads as unknown as Lead[]);
      } else {
        // Real API call
        const response = await fetch('/.netlify/functions/lead-ingest-enhanced', {
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          setLeads(data.leads || []);
        }
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.firstName?.toLowerCase().includes(term) ||
          lead.lastName?.toLowerCase().includes(term) ||
          lead.contact?.email?.toLowerCase().includes(term) ||
          lead.contact?.phone?.includes(term) ||
          lead.property?.address?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      result = result.filter((lead) => lead.source === sourceFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name': {
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'score':
          comparison = (a.score || 0) - (b.score || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [leads, searchTerm, statusFilter, sourceFilter, sortBy, sortOrder]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      qualified: leads.filter((l) => l.status === 'qualified').length,
      converted: leads.filter((l) => l.status === 'converted').length,
      avgScore: leads.length > 0 
        ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length) 
        : 0,
    };
  }, [leads]);

  const handleViewLead = (leadId: string) => {
    navigate(`/crm/leads/${leadId}`);
  };

  const handleConvertToOpportunity = async (leadId: string) => {
    // TODO: Implement conversion to opportunity
    console.log('Converting lead to opportunity:', leadId);
  };

  const handleExport = () => {
    // Export filtered leads as CSV
    const csv = [
      ['Name', 'Email', 'Phone', 'Source', 'Status', 'Score', 'Created'],
      ...filteredLeads.map((lead) => [
        `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
        lead.contact?.email || '',
        lead.contact?.phone || '',
        lead.source,
        lead.status,
        lead.score || '',
        new Date(lead.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/crm/leads/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-3xl">{stats.new}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Qualified</CardDescription>
            <CardTitle className="text-3xl">{stats.qualified}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Converted</CardDescription>
            <CardTitle className="text-3xl">{stats.converted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Score</CardDescription>
            <CardTitle className="text-3xl">{stats.avgScore}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(LEAD_STATUSES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source === 'all' ? 'All Sources' : source.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="score">Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-2">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or create a new lead
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewLead(lead.id)}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {lead.firstName || lead.lastName
                          ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                          : 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {lead.contact?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs">{lead.contact.email}</span>
                          </div>
                        )}
                        {lead.contact?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{lead.contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.property && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">
                            {lead.property.city}, {lead.property.state}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={LEAD_STATUSES[lead.status].color}>
                        {LEAD_STATUSES[lead.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.score && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-medium">{lead.score}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleConvertToOpportunity(lead.id)}>
                            Convert to Opportunity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-900">
                <strong>Demo Mode:</strong> Showing mock data. Connect to a real database to see actual
                leads.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
