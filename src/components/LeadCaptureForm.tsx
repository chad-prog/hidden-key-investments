/**
 * Enhanced Lead Capture Form
 * 
 * Modern, production-ready lead capture form with:
 * - Full CRM schema validation
 * - Property details collection
 * - Investment preferences
 * - Error tracking integration
 * - Workflow automation trigger
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeadCreateSchema, type LeadCreate } from '@/lib/schemas/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { errorTracker } from '@/lib/observability';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface LeadCaptureFormProps {
  onSuccess?: (leadId: string) => void;
  source?: string;
}

export default function LeadCaptureForm({ onSuccess, source = 'website' }: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeadCreate>({
    resolver: zodResolver(LeadCreateSchema),
    defaultValues: {
      source,
      status: 'new',
      contact: {
        preferredContact: 'email',
      },
    },
  });

  const onSubmit = async (data: LeadCreate) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      errorTracker.addBreadcrumb('Lead form submission started', 'user-action', { source: data.source });

      const response = await fetch('/.netlify/functions/lead-ingest-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to submit lead');
      }

      // Success
      setSubmitStatus('success');
      errorTracker.addBreadcrumb('Lead submitted successfully', 'api', { leadId: result.data?.id });
      
      // Reset form after short delay
      setTimeout(() => {
        reset();
        setSubmitStatus('idle');
      }, 3000);

      // Call success callback
      if (onSuccess && result.data?.id) {
        onSuccess(result.data.id);
      }

    } catch (error) {
      console.error('Lead submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      errorTracker.captureException(
        error instanceof Error ? error : new Error('Lead submission failed'),
        { component: 'LeadCaptureForm', action: 'submit' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6 border rounded-lg shadow-lg bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Investment Interest Form</h2>
        <p className="text-sm text-gray-600">
          Share your information to receive exclusive investment opportunities
        </p>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('contact.firstName')}
              placeholder="John"
              disabled={isSubmitting}
            />
            {errors.contact?.firstName && (
              <p className="text-sm text-red-600">{errors.contact.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('contact.lastName')}
              placeholder="Smith"
              disabled={isSubmitting}
            />
            {errors.contact?.lastName && (
              <p className="text-sm text-red-600">{errors.contact.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('contact.email')}
              placeholder="john.smith@example.com"
              disabled={isSubmitting}
            />
            {errors.contact?.email && (
              <p className="text-sm text-red-600">{errors.contact.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('contact.phone')}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.contact?.phone && (
              <p className="text-sm text-red-600">{errors.contact.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContact">Preferred Contact Method</Label>
          <Select
            onValueChange={(value) => setValue('contact.preferredContact', value as 'email' | 'phone' | 'sms')}
            defaultValue="email"
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Property Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Property of Interest (Optional)</h3>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register('property.address')}
            placeholder="123 Main Street"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register('property.city')}
              placeholder="Austin"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              {...register('property.state')}
              placeholder="TX"
              maxLength={2}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              {...register('property.zip')}
              placeholder="78701"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select
            onValueChange={(value) => setValue('property.type', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-family">Single Family</SelectItem>
              <SelectItem value="multi-family">Multi-Family</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Investment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Investment Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Tell us about your investment goals and any specific requirements..."
            rows={4}
            disabled={isSubmitting}
          />
          {errors.notes && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Submit Status */}
      {submitStatus === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Thank you! Your information has been submitted successfully. We'll be in touch soon.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Submission Failed</p>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Interest'
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to be contacted about investment opportunities.
        Your information is kept confidential.
      </p>
    </form>
  );
}
