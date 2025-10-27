/**
 * Lead Detail Page
 * 
 * Detailed view of a single lead with:
 * - Full lead information
 * - Edit capabilities
 * - Activity timeline
 * - Status updates
 * - Conversion to opportunity
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isDemoMode } from '@/lib/envValidation';
import { createMockLead } from '@/lib/testFixtures';
import type { Lead } from '@/lib/schemas/crm';

const LEAD_STATUSES = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-purple-500' },
  qualified: { label: 'Qualified', color: 'bg-green-500' },
  nurturing: { label: 'Nurturing', color: 'bg-yellow-500' },
  converted: { label: 'Converted', color: 'bg-emerald-500' },
  disqualified: { label: 'Disqualified', color: 'bg-gray-500' },
  lost: { label: 'Lost', color: 'bg-red-500' },
};

export default function LeadDetail() {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (leadId) {
      fetchLead(leadId);
    }
  }, [leadId]);

  const fetchLead = async (id: string) => {
    setIsLoading(true);
    try {
      if (isDemoMode()) {
        // Demo mode: Generate mock lead
        const mockLead = createMockLead({ id });
        setLead(mockLead as unknown as Lead);
        setEditedLead(mockLead);
      } else {
        // Real API call
        const response = await fetch(`/.netlify/functions/lead-ingest-enhanced/${id}`);
        if (response.ok) {
          const data = await response.json();
          setLead(data.lead);
          setEditedLead(data.lead);
        }
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isDemoMode()) {
        // Demo mode: Just update local state
        setLead({ ...lead!, ...editedLead });
        setIsEditing(false);
      } else {
        // Real API call
        const response = await fetch(`/.netlify/functions/lead-ingest-enhanced/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedLead),
        });
        if (response.ok) {
          const data = await response.json();
          setLead(data.lead);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleConvert = () => {
    navigate(`/crm/opportunities/new?leadId=${leadId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col justify-center items-center h-64 space-y-2">
          <p className="text-lg font-medium">Lead not found</p>
          <Button onClick={() => navigate('/crm/leads')}>Back to Leads</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm/leads')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {lead.firstName || lead.lastName
                ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                : 'Lead Details'}
            </h1>
            <p className="text-muted-foreground">
              Created {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleConvert}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Convert to Opportunity
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status and Score */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Select
                value={editedLead.status || lead.status}
                onValueChange={(value) => setEditedLead({ ...editedLead, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUSES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge className={LEAD_STATUSES[lead.status].color}>
                {LEAD_STATUSES[lead.status].label}
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Lead Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold">{lead.score || 'N/A'}</span>
              {lead.score && <span className="text-muted-foreground">/100</span>}
            </div>
            {lead.scoreReason && (
              <p className="text-sm text-muted-foreground mt-2">{lead.scoreReason}</p>
            )}
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Source</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{lead.source.replace('_', ' ').toUpperCase()}</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Primary contact details for this lead</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedLead.firstName || ''}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, firstName: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{lead.firstName || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedLead.lastName || ''}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, lastName: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{lead.lastName || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedLead.contact?.email || ''}
                    onChange={(e) =>
                      setEditedLead({
                        ...editedLead,
                        contact: { ...editedLead.contact, email: e.target.value } as any,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm">{lead.contact?.email || 'N/A'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editedLead.contact?.phone || ''}
                    onChange={(e) =>
                      setEditedLead({
                        ...editedLead,
                        contact: { ...editedLead.contact, phone: e.target.value } as any,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm">{lead.contact?.phone || 'N/A'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
          {lead.property && (
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>Details about the property of interest</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </Label>
                  <p className="text-sm">{lead.property.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.property.city}, {lead.property.state} {lead.property.zip}
                  </p>
                </div>
                {lead.property.propertyType && (
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Badge variant="outline">
                      {lead.property.propertyType.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                )}
                {lead.property.estimatedValue && (
                  <div className="space-y-2">
                    <Label>Estimated Value</Label>
                    <p className="text-sm font-medium">
                      ${lead.property.estimatedValue.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>History of interactions with this lead</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-500 rounded-full p-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Lead Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {lead.lastContactedAt && (
                  <div className="flex gap-4 items-start">
                    <div className="bg-green-500 rounded-full p-2">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Last Contacted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lead.lastContactedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {isDemoMode() && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p>Activity tracking coming soon</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Internal notes about this lead</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this lead..."
                rows={6}
                className="w-full"
              />
              <Button className="mt-4">Save Note</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>Demo Mode:</strong> Showing mock data. Changes will not be persisted.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
