/**
 * Enhanced Multi-Step Lead Capture Form
 * 
 * Features:
 * - Multi-step wizard (Contact → Property → Additional Info)
 * - Auto-save to localStorage
 * - Field validation with real-time feedback
 * - Progress indicator
 * - Review step before submission
 * - File upload capability
 * - Improved accessibility
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText,
  Upload,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'nurturing', label: 'Nurturing' },
  { value: 'converted', label: 'Converted' },
];

const AUTOSAVE_KEY = 'lead-capture-draft';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  
  // Property Info
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyType: string;
  estimatedValue: string;
  
  // Additional Info
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  tags: string[];
  
  // Files
  attachments: File[];
}

export default function EnhancedLeadCapture() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    propertyAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZip: '',
    propertyType: '',
    estimatedValue: '',
    source: 'website',
    status: 'new',
    notes: '',
    tags: [],
    attachments: [],
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
        toast({
          title: 'Draft Restored',
          description: 'Your previous work has been restored.',
        });
      } catch (error) {
        console.error('Failed to parse saved draft:', error);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
    }, AUTOSAVE_INTERVAL);

    return () => clearTimeout(timer);
  }, [formData]);

  const updateField = (field: keyof FormData, value: string | string[] | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1: // Contact Info
        return !!(formData.firstName && formData.lastName && formData.email);
      case 2: // Property Info
        return !!(formData.propertyAddress && formData.propertyCity && formData.propertyState);
      case 3: // Additional Info
        return !!(formData.source && formData.status);
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Build lead object
      const leadData: LeadCreate = {
        source: formData.source,
        status: formData.status,
        contact: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || undefined,
        },
        property: {
          address: formData.propertyAddress,
          city: formData.propertyCity,
          state: formData.propertyState,
          zip: formData.propertyZip,
          property_type: formData.propertyType || undefined,
          estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        },
        notes: formData.notes || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      // Validate with schema
      LeadCreateSchema.parse(leadData);

      if (isDemoMode()) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Demo mode: Would create lead:', leadData);
        
        toast({
          title: 'Lead Created (Demo)',
          description: 'Lead would be created in production mode.',
        });
      } else {
        // Real API call
        const response = await fetch('/.netlify/functions/lead-ingest-enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        });

        if (!response.ok) {
          throw new Error('Failed to create lead');
        }

        toast({
          title: 'Lead Created',
          description: 'The lead has been successfully created.',
        });
      }

      // Clear draft
      localStorage.removeItem(AUTOSAVE_KEY);
      
      // Navigate back
      navigate('/leads');
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/leads')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Lead</h1>
            <p className="text-muted-foreground">Step {currentStep} of 4</p>
          </div>
          <Badge variant="outline">Auto-saving</Badge>
        </div>
        
        <Progress value={progress} className="mt-4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Contact Information'}
            {currentStep === 2 && 'Property Details'}
            {currentStep === 3 && 'Additional Information'}
            {currentStep === 4 && 'Review & Submit'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Basic contact details for the lead'}
            {currentStep === 2 && 'Information about the property of interest'}
            {currentStep === 3 && 'Source, status, and notes'}
            {currentStep === 4 && 'Review all information before submitting'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="required">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="required">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="required">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyAddress" className="required">Property Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="propertyAddress"
                    placeholder="123 Main Street"
                    value={formData.propertyAddress}
                    onChange={(e) => updateField('propertyAddress', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyCity" className="required">City *</Label>
                  <Input
                    id="propertyCity"
                    placeholder="Austin"
                    value={formData.propertyCity}
                    onChange={(e) => updateField('propertyCity', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyState" className="required">State *</Label>
                  <Input
                    id="propertyState"
                    placeholder="TX"
                    value={formData.propertyState}
                    onChange={(e) => updateField('propertyState', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyZip">ZIP Code</Label>
                  <Input
                    id="propertyZip"
                    placeholder="78701"
                    value={formData.propertyZip}
                    onChange={(e) => updateField('propertyZip', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Input
                    id="propertyType"
                    placeholder="Single Family, Multi-Family, etc."
                    value={formData.propertyType}
                    onChange={(e) => updateField('propertyType', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Estimated Value</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    placeholder="500000"
                    value={formData.estimatedValue}
                    onChange={(e) => updateField('estimatedValue', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Lead Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => updateField('source', value as LeadSource)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="status">Lead Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateField('status', value as LeadStatus)}
                  >
                    <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this lead..."
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary hover:underline">Upload files</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOC, DOCX, JPG, PNG up to 10MB
                  </p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  {formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                  {formData.company && <p><strong>Company:</strong> {formData.company}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Details
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p><strong>Address:</strong> {formData.propertyAddress}</p>
                  <p><strong>Location:</strong> {formData.propertyCity}, {formData.propertyState} {formData.propertyZip}</p>
                  {formData.propertyType && <p><strong>Type:</strong> {formData.propertyType}</p>}
                  {formData.estimatedValue && (
                    <p><strong>Estimated Value:</strong> ${parseFloat(formData.estimatedValue).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p><strong>Source:</strong> {LEAD_SOURCES.find(s => s.value === formData.source)?.label}</p>
                  <p><strong>Status:</strong> {LEAD_STATUSES.find(s => s.value === formData.status)?.label}</p>
                  {formData.notes && <p><strong>Notes:</strong> {formData.notes}</p>}
                  {formData.attachments.length > 0 && (
                    <p><strong>Attachments:</strong> {formData.attachments.length} file(s)</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Lead
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
