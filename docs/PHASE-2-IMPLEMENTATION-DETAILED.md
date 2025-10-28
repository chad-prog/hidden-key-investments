# Phase 2 Implementation Guide: Core MVP UI Components

**Timeline**: 2-6 weeks  
**Priority**: CRITICAL  
**Goal**: Build essential CRM interfaces for elite real estate investors

---

## Overview

This guide provides step-by-step instructions to implement the Core MVP features, including:
1. Lead Management UI (List & Detail views)
2. Deal Pipeline Kanban Board
3. Investor CRM Dashboard
4. Workflow Automation UI

---

## Week 1-2: Lead Management UI

### Task 1.1: Lead List View (3 days)

**File**: `src/pages/LeadList.tsx`

#### Step 1: Create the Lead List Component

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Lead } from '@/lib/schemas/crm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, ArrowUpDown } from 'lucide-react';

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortField, setSortField] = useState<'createdAt' | 'name' | 'value'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter, sourceFilter, sortField, sortDirection, currentPage]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter !== 'all' ? statusFilter : '',
        source: sourceFilter !== 'all' ? sourceFilter : '',
        search: searchTerm,
        sortBy: sortField,
        sortDirection
      });

      const response = await fetch(`/.netlify/functions/lead-ingest-enhanced?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      setLeads(data.leads || []);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'default',
      contacted: 'secondary',
      qualified: 'outline',
      converted: 'default',
      lost: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your real estate leads
          </p>
        </div>
        <Button onClick={() => navigate('/leads/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="cold_call">Cold Call</SelectItem>
            <SelectItem value="email">Email Campaign</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">Error loading leads</p>
              <p className="text-sm mt-2">{error}</p>
              <Button onClick={fetchLeads} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold">No leads found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first lead'}
              </p>
              <Button onClick={() => navigate('/leads/new')} className="mt-4">
                Create Lead
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="h-8 -ml-3"
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('value')}
                      className="h-8 -ml-3"
                    >
                      Value
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('createdAt')}
                      className="h-8 -ml-3"
                    >
                      Created
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <TableCell className="font-medium">
                      {lead.contact?.firstName} {lead.contact?.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lead.contact?.email}</div>
                        <div className="text-muted-foreground">{lead.contact?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lead.property?.address}</div>
                        <div className="text-muted-foreground">
                          {lead.property?.city}, {lead.property?.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {lead.source?.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {lead.property?.estimatedValue
                        ? formatCurrency(lead.property.estimatedValue)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lead.status || 'new')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

#### Step 2: Add Route Configuration

Update `src/App.tsx` or your routing configuration:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router';
import LeadList from './pages/LeadList';
import LeadDetail from './pages/LeadDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/leads" element={<LeadList />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

#### Step 3: Test the Lead List

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:5173/leads

# Test filters
# Test sorting
# Test pagination
# Test search
```

---

### Task 1.2: Lead Detail View (2 days)

**File**: `src/pages/LeadDetail.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Lead } from '@/lib/schemas/crm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building,
  Edit,
  Trash,
  MessageSquare
} from 'lucide-react';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLead(id);
    }
  }, [id]);

  const fetchLead = async (leadId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/.netlify/functions/lead-ingest-enhanced?id=${leadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }
      
      const data = await response.json();
      setLead(data.lead);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const response = await fetch(`/.netlify/functions/lead-ingest-enhanced?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        navigate('/leads');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const handleConvertToOpportunity = async () => {
    try {
      const response = await fetch('/.netlify/functions/opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          title: `${lead?.property?.address} - ${lead?.contact?.firstName} ${lead?.contact?.lastName}`,
          value: lead?.property?.estimatedValue,
          stage: 'qualification'
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/opportunities/${data.opportunity.id}`);
      }
    } catch (err) {
      console.error('Error converting to opportunity:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error loading lead</p>
          <p className="text-sm text-muted-foreground mt-2">{error || 'Lead not found'}</p>
          <Button onClick={() => navigate('/leads')} className="mt-4">
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {lead.contact?.firstName} {lead.contact?.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">Lead Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/leads/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleConvertToOpportunity}>
            Convert to Opportunity
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${lead.contact?.email}`} className="text-primary hover:underline">
                          {lead.contact?.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${lead.contact?.phone}`} className="text-primary hover:underline">
                          {lead.contact?.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <div>{lead.property?.address}</div>
                        <div className="text-muted-foreground">
                          {lead.property?.city}, {lead.property?.state} {lead.property?.zip}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {lead.property?.estimatedValue && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(lead.property.estimatedValue)}
                        </span>
                      </div>
                    </div>
                  )}

                  {lead.property?.propertyType && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                      <div className="mt-1 capitalize">{lead.property.propertyType}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Activity tracking coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Notes functionality coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Document management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className="capitalize">{lead.status}</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <div className="mt-1 capitalize">{lead.source?.replace('_', ' ')}</div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(lead.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              {lead.updatedAt && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(lead.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send SMS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## Week 3-4: Deal Pipeline & CRM Dashboard

### Task 2.1: Kanban Pipeline Board (5 days)

**File**: `src/pages/PipelineBoard.tsx`

Implementation requires:
- Install `@dnd-kit/core` and `@dnd-kit/sortable`
- Create draggable cards
- Implement stage transitions
- Update opportunity status via API

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

*(Full implementation in next guide)*

---

## Testing Checklist

### Lead List Tests
- [ ] Loads leads from API
- [ ] Displays leads in table format
- [ ] Search filters work correctly
- [ ] Status filter works correctly
- [ ] Source filter works correctly
- [ ] Sorting works (name, value, date)
- [ ] Pagination works
- [ ] Navigation to detail view works
- [ ] Error handling displays correctly
- [ ] Loading state displays correctly

### Lead Detail Tests
- [ ] Loads lead details from API
- [ ] Displays all lead information
- [ ] Edit navigation works
- [ ] Delete functionality works
- [ ] Convert to opportunity works
- [ ] Quick actions are functional
- [ ] Tabs switch correctly
- [ ] Back navigation works

---

## Next Steps

After completing Week 1-2:
1. Test Lead Management UI thoroughly
2. Gather user feedback
3. Proceed to Week 3-4: Pipeline Board
4. Plan Investor Management UI

---

*For complete code examples and additional components, see the docs folder.*
