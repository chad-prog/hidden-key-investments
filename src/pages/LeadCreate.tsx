/**
 * Lead Creation Page
 * 
 * Form for creating new leads with:
 * - Full contact information
 * - Property details
 * - Source and status selection
 * - Form validation
 * - Success/error handling
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Building, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { isDemoMode } from '@/lib/envValidation';
import { LeadCreateSchema } from '@/lib/schemas/crm';
import type { LeadCreate, LeadSource, LeadStatus } from '@/lib/schemas/crm';

const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'paid_ads', label: 'Paid Ads' },
  { value: 'other', label: 'Other' },
];

const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'nurturing', label: 'Nurturing' },
];

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'multi_family', label: 'Multi Family' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
  { value: 'mixed_use', label: 'Mixed Use' },
];

export default function LeadCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<LeadCreate>>({
    source: 'website',
    status: 'new',
    contact: {
      preferredContact: 'email',
      doNotContact: false,
    },
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContactChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  const handlePropertyChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      property: {
        ...prev.property,
        [field]: value,
      } as any,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required contact info
    if (!formData.contact?.email && !formData.contact?.phone) {
      newErrors.contact = 'At least email or phone is required';
    }

    if (formData.contact?.email && !formData.contact.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    // Validate property if provided
    if (formData.property) {
      if (!formData.property.address) {
        newErrors.propertyAddress = 'Property address is required if property is specified';
      }
      if (!formData.property.city) {
        newErrors.propertyCity = 'Property city is required if property is specified';
      }
      if (!formData.property.state) {
        newErrors.propertyState = 'Property state is required if property is specified';
      }
      if (!formData.property.zip) {
        newErrors.propertyZip = 'Property ZIP is required if property is specified';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData: LeadCreate = {
        source: formData.source || 'website',
        status: formData.status || 'new',
        firstName: formData.firstName,
        lastName: formData.lastName,
        contact: {
          email: formData.contact?.email,
          phone: formData.contact?.phone,
          preferredContact: formData.contact?.preferredContact || 'email',
          doNotContact: formData.contact?.doNotContact || false,
        },
        property: formData.property,
        tags: formData.tags || [],
      };

      // Validate with Zod schema
      const validatedData = LeadCreateSchema.parse(submitData);

      if (isDemoMode()) {
        // Demo mode: Just show success
        toast({
          title: 'Success!',
          description: 'Lead created successfully (demo mode)',
        });
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        navigate('/crm/leads');
      } else {
        // Real API call
        const response = await fetch('/.netlify/functions/lead-ingest-enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData),
        });

        if (response.ok) {
          const data = await response.json();
          toast({
            title: 'Success!',
            description: 'Lead created successfully',
          });
          navigate(`/crm/leads/${data.lead.id}`);
        } else {
          throw new Error('Failed to create lead');
        }
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm/leads')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Lead</h1>
          <p className="text-muted-foreground">
            Add a new lead to your CRM pipeline
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
            <CardDescription>Basic information about the lead</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Source *
                </Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleInputChange('source', value)}
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How to reach this lead (at least email or phone required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  <User className="w-4 h-4 inline mr-2" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.contact?.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.contact?.phone || ''}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <Select
                value={formData.contact?.preferredContact || 'email'}
                onValueChange={(value) => handleContactChange('preferredContact', value)}
              >
                <SelectTrigger id="preferredContact">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="none">No Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.contact && (
              <p className="text-sm text-red-500">{errors.contact}</p>
            )}
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle>Property Information (Optional)</CardTitle>
            <CardDescription>
              Details about the property of interest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </Label>
              <Input
                id="propertyAddress"
                value={formData.property?.address || ''}
                onChange={(e) => handlePropertyChange('address', e.target.value)}
                placeholder="123 Main St"
              />
              {errors.propertyAddress && (
                <p className="text-sm text-red-500">{errors.propertyAddress}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyCity">City</Label>
                <Input
                  id="propertyCity"
                  value={formData.property?.city || ''}
                  onChange={(e) => handlePropertyChange('city', e.target.value)}
                  placeholder="Austin"
                />
                {errors.propertyCity && (
                  <p className="text-sm text-red-500">{errors.propertyCity}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyState">State</Label>
                <Input
                  id="propertyState"
                  value={formData.property?.state || ''}
                  onChange={(e) => handlePropertyChange('state', e.target.value.toUpperCase())}
                  placeholder="TX"
                  maxLength={2}
                />
                {errors.propertyState && (
                  <p className="text-sm text-red-500">{errors.propertyState}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyZip">ZIP Code</Label>
                <Input
                  id="propertyZip"
                  value={formData.property?.zip || ''}
                  onChange={(e) => handlePropertyChange('zip', e.target.value)}
                  placeholder="78701"
                />
                {errors.propertyZip && (
                  <p className="text-sm text-red-500">{errors.propertyZip}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">
                  <Building className="w-4 h-4 inline mr-2" />
                  Property Type
                </Label>
                <Select
                  value={formData.property?.propertyType}
                  onValueChange={(value) => handlePropertyChange('propertyType', value)}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={formData.property?.estimatedValue || ''}
                  onChange={(e) => handlePropertyChange('estimatedValue', parseFloat(e.target.value))}
                  placeholder="500000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Tags and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) =>
                  handleInputChange(
                    'tags',
                    e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                  )
                }
                placeholder="high-value, follow-up, interested"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/crm/leads')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Lead'}
          </Button>
        </div>
      </form>

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>Demo Mode:</strong> Lead will be created in demo mode only. Connect to a
              real database to persist leads.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
